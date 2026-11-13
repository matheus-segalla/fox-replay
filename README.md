# 🦊 FOX REPLAY — Sistema Autônomo de Replay e Monetização para Arenas Esportivas

Plataforma completa de captura de jogadas em alta performance (Beach Tennis, Futevôlei, Padel, Tênis), composta por uma aplicação web responsiva (Next.js + Supabase) e um daemon autônomo edge para Raspberry Pi conectado a câmeras IP RTSP e botão físico de grade.

---

## ⚡ Principais Funcionalidades

### 1. Experiência do Atleta
* **Visualização Instantânea (`/jogada`):** Acesso rápido aos lances gravados com 14 dias de retenção via QR Code exibido na TV da quadra.
* **Composição de Vídeo 9:16 (Stories/Reels):** Exportação direta do vídeo com a logo da Fox Replay (topo esquerdo), a logo oficial da Arena (topo direito) e uma barra inferior com **4 patrocinadores oficiais** (com fallback automático *"ANUNCIE Aqui!"* para espaços livres).
* **Download em Alta Definição:** Renderização no cliente via HTML5 Canvas 2D + MediaRecorder a 3.5 Mbps com áudio estéreo preservado.
* **Perfil do Atleta (`/perfil`):** Organização de jogadas favoritas e histórico de lances salvos.

### 2. Gestão da Arena B2B (`/dashboard`)
* **Gestor de Marcas e Patrocinadores:** Configuração da logo da arena e de até 4 anunciantes locais com logotipo e status ativo/inativo.
* **Simulador de Smartphone ao Vivo:** Prévia interativa em 9:16 mostrando exatamente como o atleta baixará o vídeo.
* **Métricas de Audiência:** Monitoramento em tempo real de visualizações e downloads com a marca gravada.
* **Relatório para Patrocinadores:** Geração em 1 clique de relatório auditado formatado para envio direto aos anunciantes via WhatsApp.
* **Controle de Quadras e Cotas:** Gestão de quadras monitoradas de acordo com o plano contratado.

### 3. Infraestrutura Edge & Totem de Quadra (`/ativar`)
* **Ativação Zero-Touch:** Pareamento sem necessidade de terminal na quadra; o Raspberry Pi gera um código de 6 dígitos na TV e a vinculação é feita pelo celular.
* **Buffer Circular em RAM (`/dev/shm`):** Gravação contínua dos últimos 70 segundos dividida em fatias de 5 segundos, preservando a vida útil do cartão microSD.
* **Leitura Física Direta (GPIO):** Leitura de botão tipo arcade/cogumelo sem necessidade de Arduino (Pinos 11 e 09).
* **Cooldown Inteligente:** Trava anti-spam de 20 segundos após o acionamento do lance.
* **TV Kiosk Display:** Interface gráfica em alta definição via HDMI com exibição de QR Code dinâmico do lance.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
* **Backend & Banco de Dados:** Supabase (PostgreSQL, Row Level Security, RPCs atômicas, Supabase Storage)
* **Hardware Edge:** Raspberry Pi OS (Lite ou Desktop), Python 3 (`gpiozero`, `requests`), FFmpeg
* **Composição de Mídia:** HTML5 Canvas API, MediaStream Recording API

---

## 🚀 Como Executar o Projeto Web

### Requisitos
* Node.js 18+ instalado
* Conta Supabase configurada com o script [supabase_completo.sql](file:///c:/Users/alexa/Desktop/fox%20replay/supabase_completo.sql)

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build
```

---

## 🔌 Instalação do Totem na Quadra (Raspberry Pi)

Consulte o [GUIA_INSTALACAO.md](file:///c:/Users/alexa/Desktop/fox%20replay/GUIA_INSTALACAO.md) para o diagrama detalhado de montagem.

### Instalação Rápida no Raspberry Pi OS:
```bash
git clone https://github.com/matheus-segalla/fox-replay.git
cd fox-replay/scripts/totem
chmod +x install_totem.sh
./install_totem.sh
```

### Pinagem do Botão (Sem Arduino):
* **Fio 1 do Botão** ➔ **Pino 11** (GPIO 17)
* **Fio 2 do Botão** ➔ **Pino 09** (GND - Terra)

---

## 🔒 Segurança e Permissões

* Autenticação via Supabase Auth com guardas de rota para Atletas, Gestores de Arena e NOC Super Admin (`/admin`).
* Políticas RLS (Row Level Security) ativas em todas as tabelas: `arenas`, `quadras`, `dispositivos`, `replays`, `pareamentos` e `favoritos_atleta`.
