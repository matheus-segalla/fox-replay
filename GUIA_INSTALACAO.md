# 🎾 GUIA OFICIAL DE INSTALAÇÃO E ATIVAÇÃO EM CAMPO — FOX REPLAY

Este manual foi elaborado para técnicos e funcionários responsáveis pela montagem física, cabeamento e ativação dos totens de replay nas quadras esportivas (Beach Tennis, Futevôlei, Padel, etc.).

---

## 📦 1. Checklist do Kit de Instalação

Antes de ir até a quadra, certifique-se de que está com todos os itens:

| Item | Descrição | Observação |
| :--- | :--- | :--- |
| **Raspberry Pi** | Raspberry Pi 3B+, 4 ou 5 | Com cooler ou dissipador instalado |
| **Fonte de Energia** | Fonte oficial 5.1V (mínimo 2.5A a 3.0A) | ⚠️ Não utilize carregadores comuns de celular |
| **Arduino (Isolador)** | Arduino Nano V3 ou Uno + Cabo USB | 🛡️ **Essencial para não queimar o Raspberry Pi** |
| **Optoacoplador (Opcional)**| Módulo Optoacoplador PC817 | Isolamento óptico galvânico de 5.000V |
| **Cartão MicroSD** | Cartão Gold / Extreme Classe A1/A2 | Já gravado com o sistema operacional e serviços |
| **Câmera IP** | Câmera IP Full HD (Hikvision / Intelbras) | Protocolo RTSP habilitado, fixada no poste |
| **Switch de Rede / PoE** | Switch 10/100 ou Gigabit com PoE | Para alimentar a câmera e conectar o Raspberry |
| **Botão de Grade** | Botão tipo cogumelo ou arcade industrial | Contato seco **Normalmente Aberto (NA)** |
| **Cabo de Rede (UTP)** | Cabo CAT5e ou CAT6 homologado | Crimpado para Câmera e 1 par trançado para o botão |
| **Cabo HDMI** | Cabo HDMI 1.5m a 3m | Conectado entre o Raspberry e a TV/Monitor |
| **TV ou Monitor** | Display para exibição dos replays | Instalado visível para os atletas na quadra |

---

## ⚡ 2. Ligação Física do Botão — Padrão Profissional com Arduino

### 🛡️ Por que o Arduino é obrigatório em quadras abertas?
Em quadras esportivas (Beach Tennis, Futevôlei, Padel), a fiação do botão percorre de **15m a 50m** presa na grade metálica.
* Os pinos GPIO do Raspberry Pi operam estritamente em **3.3V** e são ligados diretamente ao processador Broadcom.
* Fiações longas expostas atuam como **antenas**, captando induções dos refletores de LED da arena e **estática corporal** dos atletas ao tocarem no botão.
* Se ligado direto na GPIO do Raspberry, a sobretensão queima o Raspberry Pi instantaneamente.
* **O Arduino resolve isso**: O Arduino opera em 5V robusto e conecta-se ao Raspberry Pi através de um **cabo USB padrão**. A porta USB do Raspberry possui filtros, fusível rearmável (*polyfuse*) e regulagem de tensão. Qualquer descarga destrutiva na grade atinge apenas o Arduino (peça de R$ 20), mantendo o Raspberry Pi 3, a TV e a rede 100% intactos.

---

### Esquema de Ligação Arduino ➔ Raspberry Pi:

```
[ GRADE DA QUADRA ]                                [ CAIXA DO TOTEM ]
┌─────────────────┐                                 ┌─────────────────────────┐
│                 │   Cabo UTP (Par Azul/Azul-Brc)  │      ARDUINO NANO       │
│  Botão Contato  ├─────────────────────────────────┤ Pino D2 (Sinal)         │
│  Seco (NA)      ├─────────────────────────────────┤ Pino GND (Terra)        │
│                 │                                 │                         │
└─────────────────┘                                 │ Conector USB Mini/Micro │
                                                    └───────────┬─────────────┘
                                                                │ Cabo USB
                                                                ▼
                                                    ┌─────────────────────────┐
                                                    │    RASPBERRY PI 3B+     │
                                                    │   (Porta USB Padrão)    │
                                                    └─────────────────────────┘
```

1. **Gravar o Firmware no Arduino**:
   * Abra a Arduino IDE no seu computador.
   * Carregue o arquivo: `scripts/totem/arduino_botao_fox/arduino_botao_fox.ino`.
   * Selecione a placa (**Arduino Nano** com processador ATmega328P) e a porta COM.
   * Clique em **Upload**.
   * O firmware já inclui debounce de 50ms, cooldown de 5s e pisca o LED 13 a cada clique.

2. **Conexão Física no Totem**:
   * Conecte os dois fios do botão da grade nos pinos **D2** e **GND** do Arduino.
   * *(Opcional Máxima Proteção)*: Se usar o módulo **Optoacoplador PC817**, ligue o botão na entrada `IN+/IN-` do módulo, e a saída `OUT/GND` no pino `D2/GND` do Arduino.
   * Conecte o cabo USB do Arduino em qualquer uma das 4 portas USB do Raspberry Pi 3.
   * O script `totem_fox.py` reconhecerá automaticamente a porta `/dev/ttyUSB0` ou `/dev/ttyACM0` a 115200 bps!

---

### Alternativa de Contingência (Leitura Direta GPIO sem Arduino):
Se precisar ligar temporariamente em bancada de testes sem o Arduino:
* **Fio 1 do Botão** ➔ **Pino Físico 11** (GPIO 17)
* **Fio 2 do Botão** ➔ **Pino Físico 09** (GND - Terra)
*(⚠️ Nunca utilize ligação direta GPIO em quadras com cabo longo externo).*

---

## 🌐 3. Ligação de Rede e Câmera IP via Cabo (PoE)

> ⚠️ **Aviso Importante sobre o Raspberry Pi 3**:  
> O Wi-Fi interno do Raspberry Pi 3B (2.4GHz) não possui largura de banda nem estabilidade suficiente para tráfego contínuo de vídeo RTSP em Full HD. **A câmera e o Raspberry Pi 3 DEVEM ser ligados via cabo de rede.**

1. **Posicionamento da Câmera**:
   * Instale a câmera a uma altura entre 3m e 4,5m, centralizada no fundo da quadra ou na lateral para cobertura ampla da rede e das linhas de fundo.
   * Trave bem o suporte para não vibrar com ventos ou boladas.
2. **Conexão Cabeada com Switch PoE**:
   * Ligue o cabo de rede Cat5e/Cat6 da Câmera IP em uma porta **PoE** do switch.
   * Ligue a porta Ethernet do Raspberry Pi 3 em outra porta do switch.
   * Conecte o cabo de rede que vem do roteador da arena no switch para fornecimento de internet.
   * Defina na câmera IP um IP estático (ex: `192.168.1.150`) ou reserve o IP no DHCP do roteador.

---

## 🎬 4. Especificações do Vídeo Gravado

* **Duração do Replay**: **30 segundos** cravados dos últimos lances da partida.
* **Buffer Circular**: O sistema mantém os últimos 70 segundos gravados na memória RAM em blocos contínuos de 5 segundos.
* **Ao Apertar o Botão**: O processador resgata os 6 blocos imediatamente anteriores (6 x 5s = 30s), junta os vídeos sem perda de qualidade e faz o upload automático.
* **Trava Anti-Spam (Cooldown)**: Após apertar o botão, o sistema bloqueia novos cliques por **20 segundos** para impedir disparos duplicados acidentais.

---

## 📱 5. Procedimento de Ativação na Quadra (Zero-Touch)

Você não precisa digitar comandos no terminal nem abrir arquivos de configuração na quadra. A ativação é feita pelo celular:

1. **Ligue o Totem na Tomada e Conecte o HDMI na TV**:
   * O sistema iniciará sozinho em menos de 45 segundos.
2. **Observe a Tela da TV**:
   * Se o totem for novo (ainda não vinculado), surgirá na tela:
     * O logotipo da **Fox Replay**;
     * Um **Código de Ativação de 6 Dígitos** (exemplo: `482-915`);
     * Um **QR Code** de ativação rápida.
3. **Ative pelo Celular**:
   * Aponte a câmera do seu celular para o QR Code da TV **OU** acesse:
     `https://www.foxreplay.com.br/ativar`
   * Faça login com a conta de administrador da arena;
   * Selecione a **Arena** e a **Quadra** correspondente (ex: *Quadra 2 - Coberta*);
   * Digite o código de 6 dígitos exibido na TV;
   * Clique em **"⚡ Ativar Totem"**.
4. **Confirmação Instantânea**:
   * Na mesma hora, a TV exibirá a mensagem de sucesso e o totem passará ao modo ativo de gravação.

---

## ✅ 6. Checklist de Teste e Entrega

Antes de liberar a quadra para os clientes, faça o teste prático:

- [ ] **1. Teste da Câmera**: Verifique se a TV ou o log do sistema mostra a imagem nítida da quadra.
- [ ] **2. Teste do Botão de Grade**: Vá até a grade e aperte o botão físico firmemente.
- [ ] **3. Tempo de Resposta**: Observe a TV. Em cerca de 5 a 10 segundos deverá surgir na tela o **QR Code do Replay**.
- [ ] **4. Teste no Celular**: Abra a câmera do celular, aponte para o QR Code e confira:
  - O vídeo tem exatamente **30 segundos** de duração?
  - A imagem está limpa e sem travamentos?
  - O lance capturado corresponde ao momento anterior ao clique?

---

## 🛠️ 7. Guia Rápido de Solução de Problemas (Troubleshooting)

### ❌ Problema: Aperta o botão na grade mas o totem não reage
* **Causa**: Fiação rompida, mau contato ou porta USB do Arduino não reconhecida.
* **Solução**: 
  1. **Teste Visual no Arduino**: Observe o LED 13 do Arduino. Ele pisca ao apertar o botão?
     * **Se NÃO piscar**: O problema está no cabo de rede até a grade ou no botão físico. Verifique se os fios estão firmemente conectados em **D2** e **GND** do Arduino.
     * **Se PISCAR**: O Arduino está registrando o toque. O problema está na comunicação USB com o Raspberry Pi.
  2. **Verifique no Raspberry Pi**: No terminal do Raspberry, execute `ls /dev/ttyUSB* /dev/ttyACM*`. A porta do Arduino deve aparecer listada.
  3. Verifique os logs do daemon com: `sudo journalctl -u foxreplay -f`. Confirme se aparece `Conectado com sucesso ao Arduino`.

### ❌ Problema: A TV exibe aviso de falha na câmera (`CAMERA_NOME`)
* **Causa**: O cabo de rede da câmera está desconectado, o switch PoE está sem energia ou o IP/senha da câmera mudou.
* **Solução**: Verifique se as luzes Link/Act da porta PoE do switch estão piscando. Teste a URL RTSP no VLC em um notebook conectado na mesma rede para garantir que o stream está aberto.

### ❌ Problema: O Raspberry Pi 3 trava ou reinicia sozinho ao gerar o replay
* **Causa**: Fonte de alimentação insuficiente (*undervoltage*). O FFmpeg consome pico de processamento no momento da concatenação do vídeo.
* **Solução**: Substitua a fonte por uma original com pelo menos 5.1V e 2.5A a 3.0A. Não utilize portas USB de TV ou carregadores genéricos de celular.

---

*Fox Replay — Sistema de Gravação e Replay Esportivo Inteligente.*
