#!/usr/bin/env python3
"""
FOX REPLAY — Daemon Autônomo de Gravação Edge e Totem de Quadra
Compatível com: Raspberry Pi 3B+, 4 e 5 (Raspberry Pi OS Lite / 64-bit)

Funcionalidades:
1. Pareamento Zero-Touch: gera código de 6 dígitos e exibe na TV caso não configurado.
2. Buffer Contínuo em RAM (/dev/shm): grava fatias de 5s contínuas via RTSP.
3. Botão Físico (GPIO 17 / Pino 11): contato seco com resistor pull-up interno.
4. Processamento Instantâneo: gera corte dos últimos 30 segundos ao toque.
5. Upload Automatizado para o Supabase Storage e registro no banco de dados.
6. Notificação Imediata para o Display Kiosk HDMI com QR Code do lance.
"""

import os
import sys
import time
import json
import random
import string
import threading
import subprocess
import requests
from datetime import datetime
from pathlib import Path

# Tentativa de carregar GPIO (simulação caso execute fora do Raspberry)
try:
    from gpiozero import Button
    TEM_GPIO = True
except ImportError:
    TEM_GPIO = False
    print("Aviso: gpiozero não encontrado. Modo de simulação ativado.")

# -------------------------------------------------------------
# CONFIGURAÇÕES DO SISTEMA EDGE
# -------------------------------------------------------------
CONFIG_FILE = Path("/etc/foxreplay/config.json")
BUFFER_DIR = Path("/dev/shm/fox_buffer") # Memória RAM para zero desgaste de microSD
GRAVACOES_DIR = Path("/tmp/fox_replays")
PINO_BOTAO_GPIO = 17 # Pino Físico 11 (BCM 17). Pino 09 é o Terra (GND)
DURACAO_REPLAY_SEGUNDOS = 30
COOLDOWN_SEGUNDOS = 20

# Carregar variáveis de ambiente ou arquivo local
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://SEU_PROJETO.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))
BASE_WEB_URL = os.environ.get("FOX_WEB_URL", "https://fox-replay.vercel.app")

class TotemFox:
    def __init__(self):
        self.config = self.carregar_config()
        self.bloqueado_cooldown = False
        self.processo_ffmpeg_buffer = None
        self.quadra_id = self.config.get("quadra_id")
        self.rtsp_url = self.config.get("rtsp_url")
        self.codigo_pareamento = None

        BUFFER_DIR.mkdir(parents=True, exist_ok=True)
        GRAVACOES_DIR.mkdir(parents=True, exist_ok=True)

    def carregar_config(self):
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Erro ao ler {CONFIG_FILE}: {e}")
        return {}

    def salvar_config(self, dados):
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        self.config.update(dados)
        with open(CONFIG_FILE, "w") as f:
            json.dump(self.config, f, indent=4)
        print("Configuração salva em", CONFIG_FILE)

    def gerar_codigo_pareamento(self):
        return f"{random.randint(100, 999)}-{random.randint(100, 999)}"

    def registrar_pareamento_pendente(self):
        """Cria o código de pareamento zero-touch no Supabase e atualiza o display da TV"""
        self.codigo_pareamento = self.gerar_codigo_pareamento()
        token_hw = "".join(random.choices(string.ascii_letters + string.digits, k=32))

        payload = {
            "codigo": self.codigo_pareamento,
            "token_hardware": token_hw,
            "status": "pendente"
        }
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        try:
            res = requests.post(f"{SUPABASE_URL}/rest/v1/pareamentos_totem", json=payload, headers=headers, timeout=10)
            if res.status_code in [200, 201]:
                print(f"=== TOTEM AGUARDANDO ATIVAÇÃO ===")
                print(f"Código na tela: {self.codigo_pareamento}")
                self.atualizar_display_kiosk({
                    "modo": "pareamento",
                    "codigo": self.codigo_pareamento,
                    "url_ativacao": f"{BASE_WEB_URL}/ativar"
                })
            else:
                print("Erro ao registrar pareamento no Supabase:", res.text)
        except Exception as e:
            print("Falha de conexão com Supabase:", e)

    def aguardar_ativacao(self):
        """Loop que escuta a ativação do totem pelo painel /ativar"""
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
        while not self.quadra_id:
            try:
                res = requests.get(
                    f"{SUPABASE_URL}/rest/v1/pareamentos_totem?codigo=eq.{self.codigo_pareamento}&select=status,quadra_id,quadras(nome,arena_id)",
                    headers=headers,
                    timeout=5
                )
                if res.status_code == 200:
                    dados = res.json()
                    if dados and dados[0].get("status") == "ativado":
                        item = dados[0]
                        self.quadra_id = item.get("quadra_id")
                        self.salvar_config({
                            "quadra_id": self.quadra_id,
                            "nome_quadra": item.get("quadras", {}).get("nome", "Quadra Ativada")
                        })
                        print(f"✅ Totem vinculado à Quadra ID: {self.quadra_id}")
                        self.atualizar_display_kiosk({"modo": "pronto", "mensagem": "Totem Ativado com Sucesso!"})
                        time.sleep(3)
                        break
            except Exception as e:
                print("Verificando ativação...", e)
            time.sleep(3)

    def atualizar_display_kiosk(self, dados):
        """Grava estado para ser lido pelo navegador em modo quiosque na TV"""
        path_status = Path("/dev/shm/totem_status.json")
        with open(path_status, "w") as f:
            json.dump(dados, f)

    def iniciar_buffer_camera(self):
        """Mantém gravação contínua dos últimos 70s na RAM dividida em fatias de 5s"""
        if not self.rtsp_url:
            print("⚠️ Nenhuma URL RTSP cadastrada em config.json. Use câmeras RTSP locais.")
            # Simulação caso não haja câmera IP configurada
            return

        cmd = [
            "ffmpeg", "-y",
            "-rtsp_transport", "tcp",
            "-i", self.rtsp_url,
            "-c:v", "copy",
            "-c:a", "aac",
            "-f", "segment",
            "-segment_time", "5",
            "-segment_wrap", "14", # Mantém 14 blocos de 5s = 70 segundos rotativos
            "-reset_timestamps", "1",
            str(BUFFER_DIR / "seg_%02d.mp4")
        ]

        print("Iniciando buffer circular de câmera RTSP...")
        self.processo_ffmpeg_buffer = subprocess.Popen(
            cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

    def acionar_botao_lance(self):
        """Disparado quando o botão físico é pressionado"""
        if self.bloqueado_cooldown:
            print("Ignorando clique: cooldown ativo (20s)")
            return

        self.bloqueado_cooldown = True
        print(f"\n🎾 [DISPARO] Lance registrado em {datetime.now().strftime('%H:%M:%S')}!")
        
        # Mostra animação na TV Kiosk
        self.atualizar_display_kiosk({
            "modo": "gravando",
            "mensagem": "Gerando o Replay dos Últimos 30 Segundos..."
        })

        threading.Thread(target=self.processar_e_enviar_lance).start()

        # Libera após 20 segundos
        def liberar_cooldown():
            time.sleep(COOLDOWN_SEGUNDOS)
            self.bloqueado_cooldown = False
            print("Cooldown liberado.")
        threading.Thread(target=liberar_cooldown).start()

    def processar_e_enviar_lance(self):
        """Concatena fatias da RAM, gera MP4 otimizado e sobe para o Supabase"""
        nome_arquivo = f"lance_{int(time.time())}.mp4"
        caminho_final = GRAVACOES_DIR / nome_arquivo

        try:
            # Pega os últimos arquivos da RAM
            segmentos = sorted(list(BUFFER_DIR.glob("seg_*.mp4")), key=os.path.getmtime)
            ultimos_6 = segmentos[-6:] if len(segmentos) >= 6 else segmentos

            if ultimos_6:
                concat_list = GRAVACOES_DIR / "concat.txt"
                with open(concat_list, "w") as f:
                    for s in ultimos_6:
                        f.write(f"file '{s.resolve()}'\n")

                subprocess.run([
                    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
                    "-i", str(concat_list),
                    "-c", "copy",
                    "-movflags", "+faststart",
                    str(caminho_final)
                ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                # Fallback caso não tenha segmentos reais na máquina de teste
                subprocess.run([
                    "ffmpeg", "-y", "-f", "lavfi",
                    "-i", "color=c=black:s=1280x720:d=30",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    str(caminho_final)
                ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # Upload do vídeo para Supabase Storage
            url_video = self.upload_supabase_storage(caminho_final, nome_arquivo)
            if url_video:
                id_replay = self.registrar_replay_banco(url_video)
                print(f"🎉 Replay publicado com sucesso! ID: {id_replay}")
                
                # Envia para a TV o link do replay com QR Code
                url_jogada = f"{BASE_WEB_URL}/jogada?id={id_replay}"
                self.atualizar_display_kiosk({
                    "modo": "replay_pronto",
                    "url_jogada": url_jogada,
                    "id_replay": id_replay
                })
        except Exception as e:
            print("Erro ao processar lance:", e)
            self.atualizar_display_kiosk({"modo": "pronto", "mensagem": "Erro ao gerar vídeo."})

    def upload_supabase_storage(self, caminho_arquivo, nome_arquivo):
        """Envia o arquivo para o bucket 'replays' do Supabase"""
        url = f"{SUPABASE_URL}/storage/v1/object/replays/{nome_arquivo}"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "video/mp4"
        }
        with open(caminho_arquivo, "rb") as f:
            res = requests.post(url, headers=headers, data=f, timeout=60)
            if res.status_code in [200, 201]:
                return f"{SUPABASE_URL}/storage/v1/object/public/replays/{nome_arquivo}"
            else:
                print("Falha no upload do Supabase Storage:", res.text)
                return None

    def registrar_replay_banco(self, url_video):
        """Insere o lance na tabela replays do Supabase"""
        url = f"{SUPABASE_URL}/rest/v1/replays"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        payload = {
            "quadra_id": self.quadra_id,
            "video_url": url_video
        }
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code in [200, 201]:
            dados = res.json()
            return dados[0].get("id")
        return None

    def iniciar(self):
        print("Iniciando Totem Fox Replay...")

        if not self.quadra_id:
            self.registrar_pareamento_pendente()
            self.aguardar_ativacao()

        self.iniciar_buffer_camera()

        # Configurar interrupção por hardware no Pino GPIO
        if TEM_GPIO:
            botao = Button(PINO_BOTAO_GPIO, pull_up=True, bounce_time=0.1)
            botao.when_pressed = self.acionar_botao_lance
            print(f"🟢 Monitorando botão físico no Pino 11 (GPIO {PINO_BOTAO_GPIO}) - Aperte para testar!")
            while True:
                time.sleep(1)
        else:
            print("⚠️ Pressione ENTER no teclado deste terminal para simular o toque do botão físico:")
            while True:
                input()
                self.acionar_botao_lance()

if __name__ == "__main__":
    totem = TotemFox()
    totem.iniciar()
