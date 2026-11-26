#!/usr/bin/env python3
"""
FOX REPLAY — Daemon Autônomo de Gravação Edge e Totem de Quadra (v2)
Compatível com: Raspberry Pi 3B+, 4 e 5 (Raspberry Pi OS Lite / 64-bit)

Melhorias v2:
1. Autenticação segura via API do servidor (/api/totem/*) usando token_autenticacao (sem chaves Supabase no dispositivo).
2. Pareamento Zero-Touch com pair_secret e persistência automática da camera_url (RTSP) com permissão 0600.
3. Buffer circular em MPEG-TS (.ts) na RAM (/dev/shm) + exclusão do segmento aberto em escrita (zero corrupção).
4. Watchdog contínuo do FFmpeg com reinício automático e backoff exponencial se a câmera cair.
5. Geração de thumbnail JPEG leve no Edge para carregamento instantâneo no feed mobile.
6. Limpeza automática de arquivos temporários + fila offline persistente com teto de disco (500MB FIFO) e retry a cada 30s.
7. Microservidor HTTP local em 127.0.0.1:8080 para alimentar o Display Kiosk sem risco de CORS ou exposição do filesystem.
"""

import os
import sys
import time
import json
import glob
import shutil
import threading
import subprocess
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from datetime import datetime
from pathlib import Path
import requests

# Tentativa de carregar Serial para comunicação com Arduino
try:
    import serial
    import serial.tools.list_ports
    TEM_SERIAL = True
except ImportError:
    TEM_SERIAL = False
    print("Aviso: pyserial não encontrado. Instale com: pip3 install pyserial")

# Tentativa de carregar GPIO (contingência / bancada)
try:
    from gpiozero import Button
    TEM_GPIO = True
except ImportError:
    TEM_GPIO = False
    print("Aviso: gpiozero não encontrado. Modo sem GPIO direto ativado.")

# -------------------------------------------------------------
# CONFIGURAÇÕES DO SISTEMA EDGE
# -------------------------------------------------------------
CONFIG_FILE = Path(os.environ.get("FOX_CONFIG_FILE", "/etc/foxreplay/config.json"))
APP_DIR = Path(os.environ.get("FOX_APP_DIR", "/opt/foxreplay"))
BUFFER_DIR = Path(os.environ.get("FOX_BUFFER_DIR", "/dev/shm/fox_buffer"))
STATUS_FILE = Path(os.environ.get("FOX_STATUS_FILE", "/dev/shm/totem_status.json"))
GRAVACOES_DIR = Path(os.environ.get("FOX_GRAVACOES_DIR", "/tmp/fox_replays"))
FILA_OFFLINE_DIR = Path(os.environ.get("FOX_OFFLINE_DIR", "/var/lib/foxreplay/pendentes"))
MODO_SIMULACAO = os.environ.get("FOX_MODO_SIMULACAO", "0") == "1"

PINO_BOTAO_GPIO = 17
DURACAO_REPLAY_SEGUNDOS = 30
COOLDOWN_SEGUNDOS = 20
LIMITE_FILA_BYTES = 2 * 1024 * 1024 * 1024  # Teto de 2GB para fila offline persistente
KIOSK_HTTP_HOST = "127.0.0.1"
KIOSK_HTTP_PORT = int(os.environ.get("FOX_KIOSK_PORT", "8080"))

BASE_WEB_URL = os.environ.get("FOX_WEB_URL", "https://www.foxreplay.com.br").rstrip("/")


class KioskHTTPHandler(BaseHTTPRequestHandler):
    """Serve exclusivamente display.html, qrcode.min.js local e status.json em localhost."""

    def log_message(self, format, *args):
        # Evita poluir o journald com polling de 2s do display
        return

    def _enviar(self, status_code, content_type, data_bytes):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Content-Length", str(len(data_bytes)))
        self.end_headers()
        self.wfile.write(data_bytes)

    def do_GET(self):
        rota = self.path.split("?", 1)[0]

        if rota in ("/", "/display.html"):
            arquivo = APP_DIR / "display.html"
            if not arquivo.exists():
                arquivo = Path(__file__).resolve().parent / "display.html"
            if arquivo.exists():
                self._enviar(200, "text/html; charset=utf-8", arquivo.read_bytes())
            else:
                self._enviar(404, "text/plain; charset=utf-8", b"display.html nao encontrado")
            return

        if rota == "/qrcode.min.js":
            arquivo = APP_DIR / "qrcode.min.js"
            if arquivo.exists():
                self._enviar(200, "application/javascript; charset=utf-8", arquivo.read_bytes())
            else:
                self._enviar(404, "text/plain; charset=utf-8", b"qrcode.min.js nao encontrado")
            return

        if rota == "/status.json":
            if STATUS_FILE.exists():
                try:
                    self._enviar(200, "application/json; charset=utf-8", STATUS_FILE.read_bytes())
                    return
                except Exception:
                    pass
            self._enviar(200, "application/json; charset=utf-8", b'{"modo":"inicializando"}')
            return

        self._enviar(404, "text/plain; charset=utf-8", b"Not Found")


class TotemFox:
    def __init__(self):
        self.config = self.carregar_config()
        self.lock_disparo = threading.Lock()
        self.ultimo_disparo_ts = 0.0
        self.lock_ffmpeg = threading.Lock()
        self.processo_ffmpeg_buffer = None
        self.executando = True
        self.camera_online = False
        self.arena_ativa = True

        self.quadra_id = self.config.get("quadra_id")
        self.arena_id = self.config.get("arena_id")
        self.nome_quadra = self.config.get("nome_quadra", "Quadra Monitorada")
        self.token_autenticacao = self.config.get("token_autenticacao")
        self.rtsp_url = self.config.get("rtsp_url")

        self.codigo_pareamento = None
        self.pair_secret = None

        BUFFER_DIR.mkdir(parents=True, exist_ok=True)
        GRAVACOES_DIR.mkdir(parents=True, exist_ok=True)
        self.fila_offline_dir = FILA_OFFLINE_DIR
        try:
            self.fila_offline_dir.mkdir(parents=True, exist_ok=True)
        except Exception:
            self.fila_offline_dir = GRAVACOES_DIR / "pendentes"
            self.fila_offline_dir.mkdir(parents=True, exist_ok=True)

    # ---------------------------------------------------------
    # CONFIGURAÇÃO SEGURA (chmod 0600)
    # ---------------------------------------------------------
    def carregar_config(self):
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Erro ao ler {CONFIG_FILE}: {e}")
        return {}

    def salvar_config(self, dados):
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        self.config.update(dados)
        tmp_path = CONFIG_FILE.with_suffix(".tmp")
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(self.config, f, indent=4)
        os.replace(tmp_path, CONFIG_FILE)
        try:
            os.chmod(CONFIG_FILE, 0o600)
        except Exception:
            pass
        print("Configuração salva com segurança em", CONFIG_FILE)

    # ---------------------------------------------------------
    # DISPLAY KIOSK (ESCRITA ATÔMICA + MICROSERVIDOR LOCAL)
    # ---------------------------------------------------------
    def atualizar_display_kiosk(self, dados):
        """Grava estado de forma atômica para o display Kiosk nunca ler JSON truncado."""
        payload = dict(dados)
        payload["atualizado_em"] = int(time.time() * 1000)
        payload.setdefault("nome_quadra", self.nome_quadra)
        if self.arena_id:
            payload.setdefault("url_arena", f"{BASE_WEB_URL}/arena/{self.arena_id}")

        STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
        tmp_status = STATUS_FILE.with_suffix(".tmp")
        try:
            with open(tmp_status, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False)
            os.replace(tmp_status, STATUS_FILE)
        except Exception as e:
            print(f"Erro ao atualizar status do display: {e}")

    def iniciar_servidor_kiosk(self):
        try:
            servidor = ThreadingHTTPServer((KIOSK_HTTP_HOST, KIOSK_HTTP_PORT), KioskHTTPHandler)
            t = threading.Thread(target=servidor.serve_forever, daemon=True)
            t.start()
            print(f"🖥️ Display Kiosk HTTP ativo em http://{KIOSK_HTTP_HOST}:{KIOSK_HTTP_PORT}/")
        except Exception as e:
            print(f"⚠️ Não foi possível iniciar microservidor Kiosk ({e})")

    # ---------------------------------------------------------
    # PAREAMENTO ZERO-TOUCH AUTENTICADO (/api/totem/pair)
    # ---------------------------------------------------------
    def registrar_pareamento_pendente(self):
        """Solicita código de 6 dígitos + pair_secret ao backend."""
        while self.executando:
            try:
                res = requests.post(f"{BASE_WEB_URL}/api/totem/pair", timeout=15)
                if res.status_code in (200, 201):
                    dados = res.json()
                    self.codigo_pareamento = dados["codigo"]
                    self.pair_secret = dados["pair_secret"]
                    print("=== TOTEM AGUARDANDO ATIVAÇÃO ===")
                    print(f"Código na tela: {self.codigo_pareamento}")
                    self.atualizar_display_kiosk({
                        "modo": "pareamento",
                        "codigo": self.codigo_pareamento,
                        "url_ativacao": f"{BASE_WEB_URL}/ativar?codigo={self.codigo_pareamento}"
                    })
                    return
                print("Erro ao iniciar pareamento:", res.status_code, res.text)
            except Exception as e:
                print("Sem conexão para iniciar pareamento (tentando novamente em 5s):", e)
            time.sleep(5)

    def aguardar_ativacao(self):
        """Consulta o backend com X-Pair-Secret até o gestor ativar o totem."""
        while self.executando and (not self.quadra_id or not self.token_autenticacao):
            if not self.codigo_pareamento or not self.pair_secret:
                self.registrar_pareamento_pendente()

            try:
                res = requests.get(
                    f"{BASE_WEB_URL}/api/totem/pair",
                    params={"codigo": self.codigo_pareamento},
                    headers={"X-Pair-Secret": self.pair_secret},
                    timeout=10,
                )

                if res.status_code == 410:
                    print("⏱️ Código de pareamento expirado. Gerando novo código...")
                    self.codigo_pareamento = None
                    self.pair_secret = None
                    continue

                if res.status_code == 200:
                    dados = res.json()
                    if dados.get("status") == "vinculado":
                        self.quadra_id = dados.get("quadra_id")
                        self.arena_id = dados.get("arena_id")
                        self.token_autenticacao = dados.get("token_gerado")
                        self.nome_quadra = dados.get("nome_quadra") or "Quadra Ativada"
                        camera_recebida = dados.get("camera_url")

                        nova_config = {
                            "quadra_id": self.quadra_id,
                            "arena_id": self.arena_id,
                            "token_autenticacao": self.token_autenticacao,
                            "nome_quadra": self.nome_quadra,
                        }
                        if camera_recebida:
                            self.rtsp_url = camera_recebida
                            nova_config["rtsp_url"] = camera_recebida

                        self.salvar_config(nova_config)
                        print(f"✅ Totem vinculado à {self.nome_quadra} ({self.quadra_id})")
                        self.atualizar_display_kiosk({
                            "modo": "pronto",
                            "mensagem": "Totem ativado e pronto para gravar!"
                        })
                        return
            except Exception as e:
                print("Aguardando ativação:", e)
            time.sleep(3)

    # ---------------------------------------------------------
    # BUFFER CIRCULAR MPEG-TS + WATCHDOG DE CÂMERA RTSP
    # ---------------------------------------------------------
    def _limpar_segmentos_antigos(self):
        for arq in BUFFER_DIR.glob("seg_*.ts"):
            try:
                arq.unlink()
            except Exception:
                pass

    def _consumir_stderr_ffmpeg(self, processo):
        """Drena o stderr do FFmpeg em tempo real para evitar deadlock de PIPE cheio (64KB)."""
        if not processo or not processo.stderr:
            return
        try:
            for linha_bytes in iter(processo.stderr.readline, b""):
                if not linha_bytes:
                    break
                linha = linha_bytes.decode("utf-8", errors="ignore").strip()
                if not linha:
                    continue
                # Filtra ruído contínuo inofensivo de streams RTSP para não poluir o journald
                if "Timestamps are unset" in linha:
                    continue
                print(f"🎬 [FFMPEG] {linha}")
        except Exception:
            pass
        finally:
            try:
                processo.stderr.close()
            except Exception:
                pass

    def iniciar_buffer_camera(self):
        """Inicia gravação contínua em MPEG-TS (.ts) na RAM (14 fatias de 5s = 70s)."""
        if not self.rtsp_url:
            print("⚠️ Nenhuma URL RTSP cadastrada em config.json. Operando sem captura RTSP.")
            return

        with self.lock_ffmpeg:
            if self.processo_ffmpeg_buffer and self.processo_ffmpeg_buffer.poll() is None:
                return

            # Garante que a pasta em RAM exista após reboots ou limpezas
            BUFFER_DIR.mkdir(parents=True, exist_ok=True)
            self._limpar_segmentos_antigos()

            cmd = [
                "ffmpeg", "-y",
                "-loglevel", "warning",
                "-rtsp_transport", "tcp",
                "-i", self.rtsp_url,
                "-c:v", "copy",
                "-c:a", "aac",
                "-ar", "44100",
                "-b:a", "128k",
                "-f", "segment",
                "-segment_format", "mpegts",
                "-segment_time", "5",
                "-segment_wrap", "14",
                "-reset_timestamps", "1",
                str(BUFFER_DIR / "seg_%02d.ts"),
            ]

            print("🎥 Iniciando buffer circular MPEG-TS da câmera RTSP...")
            self.processo_ffmpeg_buffer = subprocess.Popen(
                cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
            )
            threading.Thread(
                target=self._consumir_stderr_ffmpeg,
                args=(self.processo_ffmpeg_buffer,),
                daemon=True,
            ).start()

    def _reiniciar_ffmpeg(self):
        with self.lock_ffmpeg:
            if self.processo_ffmpeg_buffer:
                try:
                    self.processo_ffmpeg_buffer.terminate()
                    self.processo_ffmpeg_buffer.wait(timeout=4)
                except Exception:
                    try:
                        self.processo_ffmpeg_buffer.kill()
                    except Exception:
                        pass
                self.processo_ffmpeg_buffer = None
        self.iniciar_buffer_camera()

    def watchdog_buffer_camera(self):
        """Monitora o processo FFmpeg e a atualização real dos segmentos .ts na RAM."""
        if not self.rtsp_url:
            return

        backoff = 3
        camera_estava_offline = False

        while self.executando:
            time.sleep(10)
            processo_caiu = (
                self.processo_ffmpeg_buffer is None
                or self.processo_ffmpeg_buffer.poll() is not None
            )

            # Verifica também se o stream RTSP congelou (nenhum segmento atualizado há > 22s)
            stream_congelado = False
            segmentos = list(BUFFER_DIR.glob("seg_*.ts"))
            if segmentos and not processo_caiu:
                mais_recente = max(s.stat().st_mtime for s in segmentos)
                if (time.time() - mais_recente) > 22:
                    stream_congelado = True

            if processo_caiu or stream_congelado:
                self.camera_online = False
                motivo = "processo encerrado" if processo_caiu else "stream RTSP congelado"
                print(f"⚠️ [WATCHDOG] Falha na câmera ({motivo}). Reiniciando em {backoff}s...")
                camera_estava_offline = True
                self.atualizar_display_kiosk({
                    "modo": "camera_offline",
                    "mensagem": "Reconectando câmera da quadra..."
                })
                time.sleep(backoff)
                backoff = min(backoff * 2, 30)
                self._reiniciar_ffmpeg()
            else:
                backoff = 3
                if segmentos:
                    self.camera_online = True
                if camera_estava_offline and segmentos:
                    camera_estava_offline = False
                    print("✅ [WATCHDOG] Câmera RTSP restabelecida!")
                    self.atualizar_display_kiosk({
                        "modo": "pronto",
                        "mensagem": "Câmera conectada e pronta para gravar!"
                    })

    def enviar_heartbeat(self):
        """Reporta saúde em tempo real ao NOC (/api/totem/heartbeat) e sincroniza RTSP/pausa."""
        while self.executando:
            if self.token_autenticacao:
                try:
                    fila_qtd = len(list(self.fila_offline_dir.glob("*.mp4")))
                    res = requests.post(
                        f"{BASE_WEB_URL}/api/totem/heartbeat",
                        headers={
                            "Authorization": f"Bearer {self.token_autenticacao}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "camera_online": bool(self.camera_online or not self.rtsp_url),
                            "fila_offline_qtd": fila_qtd,
                        },
                        timeout=10,
                    )
                    if res.status_code == 200:
                        dados = res.json()
                        nova_ativa = dados.get("arena_ativa", True)
                        nova_camera = dados.get("camera_url")

                        if nova_camera and nova_camera != self.rtsp_url:
                            print("🔄 [HEARTBEAT] Nova URL RTSP recebida do NOC. Aplicando...")
                            self.rtsp_url = nova_camera
                            self.salvar_config({"rtsp_url": nova_camera})
                            self._reiniciar_ffmpeg()

                        if nova_ativa != self.arena_ativa:
                            self.arena_ativa = nova_ativa
                            if not nova_ativa:
                                self.atualizar_display_kiosk({
                                    "modo": "pronto",
                                    "mensagem": "Serviço temporariamente em manutenção."
                                })
                            else:
                                self.atualizar_display_kiosk({
                                    "modo": "pronto",
                                    "mensagem": "Totem operacional e pronto para gravar!"
                                })
                except Exception as err:
                    print("⚠️ [HEARTBEAT] Sem resposta do NOC:", err)
            time.sleep(60)

    # ---------------------------------------------------------
    # CAPTURA DO LANCE, THUMBNAIL E UPLOAD AUTENTICADO
    # ---------------------------------------------------------
    def acionar_botao_lance(self):
        """Disparado quando o botão físico é pressionado (protegido por threading.Lock)."""
        agora = time.monotonic()
        with self.lock_disparo:
            if (agora - self.ultimo_disparo_ts) < COOLDOWN_SEGUNDOS:
                restante = int(COOLDOWN_SEGUNDOS - (agora - self.ultimo_disparo_ts))
                print(f"Ignorando clique: cooldown ativo ({restante}s restantes)")
                return
            self.ultimo_disparo_ts = agora

        print(f"\n🎾 [DISPARO] Lance registrado em {datetime.now().strftime('%H:%M:%S')}!")
        self.atualizar_display_kiosk({
            "modo": "gravando",
            "mensagem": "Recortando os últimos 30 segundos do seu lance..."
        })

        threading.Thread(target=self.processar_e_enviar_lance, daemon=True).start()

    def _gerar_thumbnail(self, caminho_video, caminho_thumb):
        for tempo in ("00:00:02", "00:00:00"):
            try:
                subprocess.run(
                    [
                        "ffmpeg", "-y", "-loglevel", "error",
                        "-ss", tempo,
                        "-i", str(caminho_video),
                        "-vframes", "1",
                        "-vf", "scale=480:-2",
                        "-q:v", "5",
                        str(caminho_thumb),
                    ],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=15,
                )
                if caminho_thumb.exists() and caminho_thumb.stat().st_size > 0:
                    return True
            except Exception:
                continue
        return False

    def _remover_arquivos_locais(self, *caminhos):
        for p in caminhos:
            if p and Path(p).exists():
                try:
                    Path(p).unlink()
                except Exception:
                    pass

    def _aplicar_teto_fila_offline(self):
        """Garante que a fila offline nunca ultrapasse 2GB (remove mais antigos primeiro)."""
        arquivos = sorted(self.fila_offline_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime)
        total_bytes = sum(p.stat().st_size for p in self.fila_offline_dir.glob("*") if p.is_file())

        while total_bytes > LIMITE_FILA_BYTES and arquivos:
            antigo = arquivos.pop(0)
            thumb_antiga = antigo.with_suffix(".jpg")
            self._remover_arquivos_locais(antigo, thumb_antiga)
            total_bytes = sum(p.stat().st_size for p in self.fila_offline_dir.glob("*") if p.is_file())

    def _enviar_para_nuvem(self, caminho_video, caminho_thumb=None):
        """Solicita Signed Upload URL autenticada, faz upload e registra o replay no backend."""
        headers_auth = {
            "Authorization": f"Bearer {self.token_autenticacao}",
            "Content-Type": "application/json",
        }
        tem_thumb = bool(caminho_thumb and Path(caminho_thumb).exists())

        # 1. Solicitar Signed Upload URLs ao backend
        res_url = requests.post(
            f"{BASE_WEB_URL}/api/totem/upload-url",
            headers=headers_auth,
            json={"incluirThumbnail": tem_thumb},
            timeout=20,
        )
        if res_url.status_code != 200:
            raise RuntimeError(f"Falha ao obter URL de upload ({res_url.status_code}): {res_url.text}")

        dados_url = res_url.json()
        video_info = dados_url["video"]
        thumb_info = dados_url.get("thumbnail")

        # 2. Upload do MP4 via Signed URL
        with open(caminho_video, "rb") as f_vid:
            res_up = requests.put(
                video_info["signedUrl"],
                headers={"Content-Type": "video/mp4", "x-upsert": "false"},
                data=f_vid,
                timeout=90,
            )
        if res_up.status_code not in (200, 201):
            raise RuntimeError(f"Falha no upload do MP4 ({res_up.status_code}): {res_up.text}")

        # 3. Upload da thumbnail JPG (opcional, não bloqueia o lance se falhar)
        thumb_public_url = None
        if tem_thumb and thumb_info:
            try:
                with open(caminho_thumb, "rb") as f_th:
                    res_th = requests.put(
                        thumb_info["signedUrl"],
                        headers={"Content-Type": "image/jpeg", "x-upsert": "false"},
                        data=f_th,
                        timeout=25,
                    )
                if res_th.status_code in (200, 201):
                    thumb_public_url = thumb_info["publicUrl"]
            except Exception as err_th:
                print("⚠️ Aviso ao enviar thumbnail:", err_th)

        # 4. Registrar replay no banco de dados via API autenticada
        res_reg = requests.post(
            f"{BASE_WEB_URL}/api/totem/replays",
            headers=headers_auth,
            json={
                "video_url": video_info["publicUrl"],
                "thumbnail_url": thumb_public_url,
            },
            timeout=20,
        )
        if res_reg.status_code not in (200, 201):
            raise RuntimeError(f"Falha ao registrar replay ({res_reg.status_code}): {res_reg.text}")

        return res_reg.json().get("id")

    def processar_e_enviar_lance(self):
        """Concatena segmentos fechados da RAM, gera MP4 + thumbnail e publica."""
        GRAVACOES_DIR.mkdir(parents=True, exist_ok=True)
        self.fila_offline_dir.mkdir(parents=True, exist_ok=True)

        carimbo = int(time.time() * 1000)
        caminho_final = GRAVACOES_DIR / f"lance_{carimbo}.mp4"
        caminho_thumb = GRAVACOES_DIR / f"lance_{carimbo}.jpg"
        concat_list = GRAVACOES_DIR / f"concat_{carimbo}.txt"

        try:
            # Ordena segmentos MPEG-TS por data de modificação e EXCLUI o último (em escrita ativa)
            segmentos = sorted(BUFFER_DIR.glob("seg_*.ts"), key=os.path.getmtime)
            fechados = segmentos[:-1] if len(segmentos) > 1 else segmentos
            ultimos_6 = fechados[-6:] if len(fechados) >= 6 else fechados

            if ultimos_6:
                with open(concat_list, "w", encoding="utf-8") as f:
                    for seg in ultimos_6:
                        f.write(f"file '{seg.resolve()}'\n")

                subprocess.run(
                    [
                        "ffmpeg", "-y", "-loglevel", "error",
                        "-f", "concat", "-safe", "0",
                        "-i", str(concat_list),
                        "-c", "copy",
                        "-bsf:a", "aac_adtstoasc",
                        "-movflags", "+faststart",
                        str(caminho_final),
                    ],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=45,
                )
            elif MODO_SIMULACAO:
                # Fallback apenas quando FOX_MODO_SIMULACAO=1 estiver explicitamente ativo
                subprocess.run(
                    [
                        "ffmpeg", "-y", "-loglevel", "error",
                        "-f", "lavfi",
                        "-i", f"color=c=black:s=1280x720:d={DURACAO_REPLAY_SEGUNDOS}",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p",
                        "-movflags", "+faststart",
                        str(caminho_final),
                    ],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=45,
                )
            else:
                print("⚠️ [CAMERA OFFLINE] Nenhum segmento de vídeo disponível no buffer. Upload bloqueado para evitar vídeo preto.")
                self.atualizar_display_kiosk({
                    "modo": "camera_offline",
                    "mensagem": "Câmera reconectando. Tente novamente em instantes."
                })
                return

            self._gerar_thumbnail(caminho_final, caminho_thumb)

            # Tenta enviar imediatamente; se a internet caiu, salva na fila offline persistente
            try:
                id_replay = self._enviar_para_nuvem(caminho_final, caminho_thumb)
                print(f"🎉 Replay publicado com sucesso! ID: {id_replay}")
                url_jogada = f"{BASE_WEB_URL}/jogada?id={id_replay}"
                self.atualizar_display_kiosk({
                    "modo": "replay_pronto",
                    "url_jogada": url_jogada,
                    "id_replay": id_replay,
                })
                self._remover_arquivos_locais(caminho_final, caminho_thumb)
            except Exception as err_net:
                print(f"⚠️ Sem conexão para upload imediato ({err_net}). Salvando na fila offline persistente...")
                destino_vid = self.fila_offline_dir / caminho_final.name
                shutil.move(str(caminho_final), str(destino_vid))
                if caminho_thumb.exists():
                    shutil.move(str(caminho_thumb), str(self.fila_offline_dir / caminho_thumb.name))
                self._aplicar_teto_fila_offline()
                self.atualizar_display_kiosk({
                    "modo": "pronto",
                    "mensagem": "Lance salvo localmente! Será enviado assim que a internet voltar."
                })

        except Exception as e:
            print("Erro ao processar lance:", e)
            self._remover_arquivos_locais(caminho_final, caminho_thumb)
            self.atualizar_display_kiosk({
                "modo": "pronto",
                "mensagem": "Não foi possível gerar o vídeo. Tente novamente."
            })
        finally:
            self._remover_arquivos_locais(concat_list)

    def processar_fila_offline(self):
        """Reenvia automaticamente lances salvos durante quedas de internet."""
        while self.executando:
            time.sleep(30)
            if not self.token_autenticacao:
                continue

            self.fila_offline_dir.mkdir(parents=True, exist_ok=True)
            pendentes = sorted(self.fila_offline_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime)
            for video_pendente in pendentes:
                thumb_pendente = video_pendente.with_suffix(".jpg")
                try:
                    id_replay = self._enviar_para_nuvem(
                        video_pendente,
                        thumb_pendente if thumb_pendente.exists() else None,
                    )
                    print(f"☁️ [FILA OFFLINE] Replay sincronizado com sucesso! ID: {id_replay}")
                    self._remover_arquivos_locais(video_pendente, thumb_pendente)
                except Exception as err:
                    print(f"⏳ [FILA OFFLINE] Ainda sem conexão ({err}). Nova tentativa em 30s.")
                    break

    # ---------------------------------------------------------
    # ARDUINO USB SERIAL
    # ---------------------------------------------------------
    def monitorar_arduino_serial(self):
        if not TEM_SERIAL:
            return

        print("🔍 Monitor de Arduino USB Serial iniciado...")
        while self.executando:
            portas_encontradas = glob.glob("/dev/ttyUSB*") + glob.glob("/dev/ttyACM*")
            if not portas_encontradas:
                try:
                    portas_encontradas = [p.device for p in serial.tools.list_ports.comports()]
                except Exception:
                    portas_encontradas = []

            if not portas_encontradas:
                time.sleep(3)
                continue

            porta_alvo = portas_encontradas[0]
            try:
                print(f"🔌 Conectando ao Arduino em {porta_alvo} (115200 bps)...")
                with serial.Serial(porta_alvo, 115200, timeout=1) as ser:
                    ser.reset_input_buffer()
                    print(f"✅ Conectado com sucesso ao Arduino em {porta_alvo}!")
                    while self.executando:
                        linha = ser.readline().decode("utf-8", errors="ignore").strip()
                        if not linha:
                            continue
                        if "FOX_BOTAO_PRESSIONADO" in linha:
                            print(f"⚡ [ARDUINO USB] Lance acionado na porta {porta_alvo}!")
                            self.acionar_botao_lance()
                        elif "FOX_ARDUINO_READY" in linha:
                            print(f"ℹ️ [ARDUINO] Firmware Fox ativo ({porta_alvo})")
            except Exception as e:
                print(f"⚠️ Conexão Serial interrompida ({e}). Tentando em 3s...")
                time.sleep(3)

    # ---------------------------------------------------------
    # LOOP PRINCIPAL
    # ---------------------------------------------------------
    def iniciar(self):
        print("🦊 Iniciando Totem Fox Replay v2...")
        self.iniciar_servidor_kiosk()

        if not self.quadra_id or not self.token_autenticacao:
            self.registrar_pareamento_pendente()
            self.aguardar_ativacao()
        else:
            self.atualizar_display_kiosk({
                "modo": "pronto",
                "mensagem": "Totem operacional e pronto para gravar!"
            })

        self.iniciar_buffer_camera()

        threading.Thread(target=self.watchdog_buffer_camera, daemon=True).start()
        threading.Thread(target=self.enviar_heartbeat, daemon=True).start()
        threading.Thread(target=self.processar_fila_offline, daemon=True).start()
        threading.Thread(target=self.monitorar_arduino_serial, daemon=True).start()

        if TEM_GPIO:
            try:
                botao = Button(PINO_BOTAO_GPIO, pull_up=True, bounce_time=0.1)
                botao.when_pressed = self.acionar_botao_lance
                print(f"🟢 Monitorando botão físico GPIO {PINO_BOTAO_GPIO}")
            except Exception as e:
                print(f"Aviso ao inicializar GPIO: {e}")

        if sys.stdin and sys.stdin.isatty():
            print("💡 Pressione ENTER neste terminal para simular o toque do botão:")
            while self.executando:
                try:
                    input()
                    self.acionar_botao_lance()
                except (EOFError, KeyboardInterrupt):
                    self.executando = False
                    break
        else:
            while self.executando:
                time.sleep(1)


if __name__ == "__main__":
    totem = TotemFox()
    totem.iniciar()
