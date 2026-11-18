#!/bin/bash
# ==============================================================================
# FOX REPLAY — Script de Instalação Segura para Raspberry Pi OS (v2)
# ==============================================================================

set -euo pipefail

echo "🦊 Iniciando instalação do totem Fox Replay v2..."

TARGET_USER="${SUDO_USER:-$(whoami)}"
FOX_WEB_URL="${FOX_WEB_URL:-https://fox-replay.vercel.app}"

# 1. Dependências de Vídeo, Serial, GPIO e Kiosk
sudo apt update
sudo apt install -y python3 python3-pip python3-serial python3-gpiozero ffmpeg chromium-browser unclutter curl

# 2. Bibliotecas Python
pip3 install requests pyserial --break-system-packages 2>/dev/null || pip3 install requests pyserial

# 3. Permissão para porta USB Serial (Arduino)
sudo usermod -a -G dialout "$TARGET_USER" 2>/dev/null || true

# 4. Pastas de trabalho com permissões restritas (sem chmod 777)
sudo mkdir -p /etc/foxreplay /opt/foxreplay /dev/shm/fox_buffer /tmp/fox_replays/pendentes
sudo chown -R "$TARGET_USER:$TARGET_USER" /etc/foxreplay /opt/foxreplay /dev/shm/fox_buffer /tmp/fox_replays
sudo chmod 700 /etc/foxreplay
sudo chmod 750 /dev/shm/fox_buffer /tmp/fox_replays

# 5. Copiar daemon e display
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sudo cp "$CURRENT_DIR/totem_fox.py" /opt/foxreplay/totem_fox.py
sudo cp "$CURRENT_DIR/display.html" /opt/foxreplay/display.html
sudo chown "$TARGET_USER:$TARGET_USER" /opt/foxreplay/totem_fox.py /opt/foxreplay/display.html
sudo chmod 750 /opt/foxreplay/totem_fox.py

# 6. Baixar qrcode.min.js localmente para o display Kiosk funcionar 100% offline
echo "📦 Baixando biblioteca QRCode local para operação offline..."
curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" -o /tmp/qrcode.min.js \
  && sudo mv /tmp/qrcode.min.js /opt/foxreplay/qrcode.min.js \
  && sudo chown "$TARGET_USER:$TARGET_USER" /opt/foxreplay/qrcode.min.js \
  || echo "⚠️ Não foi possível baixar qrcode.min.js agora; o display tentará fallback online."

# 7. Arquivo de ambiente protegido (sem chaves Supabase!)
if [ ! -f /etc/foxreplay/totem.env ]; then
  cat <<EOF | sudo tee /etc/foxreplay/totem.env >/dev/null
FOX_WEB_URL=$FOX_WEB_URL
FOX_KIOSK_PORT=8080
EOF
  sudo chown "$TARGET_USER:$TARGET_USER" /etc/foxreplay/totem.env
  sudo chmod 600 /etc/foxreplay/totem.env
fi

# 8. Serviço systemd do daemon Edge
cat <<EOF | sudo tee /etc/systemd/system/foxreplay.service >/dev/null
[Unit]
Description=Fox Replay Edge Totem Daemon v2
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$TARGET_USER
WorkingDirectory=/opt/foxreplay
EnvironmentFile=/etc/foxreplay/totem.env
ExecStart=/usr/bin/python3 -u /opt/foxreplay/totem_fox.py
Restart=always
RestartSec=5
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

# 9. Autostart do Chromium Kiosk apontando para o microservidor local 127.0.0.1:8080
USER_HOME="$(eval echo "~$TARGET_USER")"
AUTOSTART_DIR="$USER_HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"
cat <<EOF > "$AUTOSTART_DIR/foxreplay-kiosk.desktop"
[Desktop Entry]
Type=Application
Name=Fox Replay Kiosk
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars --autoplay-policy=no-user-gesture-required http://127.0.0.1:8080/
X-GNOME-Autostart-enabled=true
EOF
sudo chown -R "$TARGET_USER:$TARGET_USER" "$AUTOSTART_DIR"

sudo systemctl daemon-reload
sudo systemctl enable foxreplay.service

echo "✅ Instalação v2 concluída com sucesso para o usuário '$TARGET_USER'!"
echo "👉 Inicie agora com: sudo systemctl restart foxreplay"
echo "👉 Acompanhe logs com: sudo journalctl -u foxreplay -f"
