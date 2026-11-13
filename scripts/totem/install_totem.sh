#!/bin/bash
# ==============================================================================
# FOX REPLAY — Script de Instalação Automática para Raspberry Pi OS
# ==============================================================================

set -e

echo "🦊 Iniciando instalação do totem Fox Replay..."

# 1. Atualização do Sistema e Instalação de Dependências de Vídeo e GPIO
sudo apt update
sudo apt install -y python3 python3-pip python3-gpiozero ffmpeg chromium-browser unclutter git curl

# 2. Instalação de bibliotecas Python necessárias
pip3 install requests --break-system-packages 2>/dev/null || pip3 install requests

# 3. Criação de pastas de trabalho
sudo mkdir -p /etc/foxreplay
sudo mkdir -p /opt/foxreplay
sudo mkdir -p /dev/shm/fox_buffer
sudo chmod 777 /dev/shm/fox_buffer

# 4. Copiar arquivos para /opt/foxreplay
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sudo cp "$CURRENT_DIR/totem_fox.py" /opt/foxreplay/totem_fox.py
sudo cp "$CURRENT_DIR/display.html" /opt/foxreplay/display.html
sudo chmod +x /opt/foxreplay/totem_fox.py

# 5. Criar serviço systemd para rodar em background na inicialização
cat <<EOF | sudo tee /etc/systemd/system/foxreplay.service
[Unit]
Description=Fox Replay Edge Totem Daemon
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/foxreplay
ExecStart=/usr/bin/python3 /opt/foxreplay/totem_fox.py
Restart=always
RestartSec=5
Environment=NEXT_PUBLIC_SUPABASE_URL=https://nswtefxjndzmwdxqqunu.supabase.co
Environment=NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zd3RlZnhqbmR6bXdkeHFxdW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MjQ3MDIsImV4cCI6MjA5NTUwMDcwMn0.72DuRKnVO1-4MjCDc9y818OSVUaL6KNDu9rlkdERHN8
Environment=FOX_WEB_URL=https://fox-replay.vercel.app

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable foxreplay.service

echo "✅ Instalação concluída com sucesso!"
echo "👉 Para iniciar agora o serviço: sudo systemctl start foxreplay"
