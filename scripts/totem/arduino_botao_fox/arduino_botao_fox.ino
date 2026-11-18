/*
 * ==============================================================================
 * FOX REPLAY — Firmware do Botão de Quadra para Arduino (Nano / Uno)
 * ==============================================================================
 * 
 * Função:
 * - Monitora o botão físico instalado na grade/poste da quadra (contato seco NA).
 * - Realiza debounce por hardware/software (50ms) para anular repiques mecânicos.
 * - Implementa trava de cooldown de 5s para evitar envios repetitivos instantâneos.
 * - Pisca o LED indicador da placa (Pino 13) ao registrar o toque.
 * - Envia o sinal "FOX_BOTAO_PRESSIONADO" via USB Serial (115200 bps) para o
 *   Raspberry Pi 3, mantendo o Raspberry eletricamente isolado e seguro.
 *
 * Pinagem Padrão:
 * - Pino Digital 2 (D2): Entrada do sinal do botão (ou saída do Optoacoplador PC817)
 * - Pino GND: Referência de terra
 * - Pino 13: LED integrado para diagnóstico visual em campo
 * ==============================================================================
 */

const int PINO_BOTAO = 2;          // Pino com suporte a interrupção externa
const int LED_STATUS = 13;         // LED onboard
const unsigned long DEBOUNCE_MS = 50;   // Filtro de ruído mecânico e elétrico
const unsigned long COOLDOWN_MS = 5000; // Intervalo mínimo entre envios (5 segundos)

unsigned long ultimoAcionamento = 0;
int ultimoEstadoEstavel = HIGH;
int ultimoEstadoLido = HIGH;
unsigned long tempoUltimaMudanca = 0;

void setup() {
  // Inicializa comunicação Serial a 115200 bps
  Serial.begin(115200);

  // Ativa resistor pull-up interno de 20k-50k do ATmega328P.
  // O botão conecta entre o pino D2 e o GND (contato fechado = nível lógico LOW).
  pinMode(PINO_BOTAO, INPUT_PULLUP);
  
  pinMode(LED_STATUS, OUTPUT);
  digitalWrite(LED_STATUS, LOW);

  // Aguarda estabilização da conexão USB Serial
  delay(500);
  Serial.println("FOX_ARDUINO_READY");
}

void loop() {
  int leituraAtual = digitalRead(PINO_BOTAO);

  // Se a leitura mudou, reseta o temporizador de debounce
  if (leituraAtual != ultimoEstadoLido) {
    tempoUltimaMudanca = millis();
  }
  ultimoEstadoLido = leituraAtual;

  // Se o sinal permaneceu estável pelo tempo de debounce, consideramos a leitura válida
  if ((millis() - tempoUltimaMudanca) > DEBOUNCE_MS) {
    if (leituraAtual != ultimoEstadoEstavel) {
      ultimoEstadoEstavel = leituraAtual;

      // Botão foi pressionado (nível LOW quando fecha com o GND)
      if (ultimoEstadoEstavel == LOW) {
        // Verifica se já passou o tempo de cooldown
        if ((millis() - ultimoAcionamento) > COOLDOWN_MS) {
          ultimoAcionamento = millis();

          // Feedback visual imediato no LED do Arduino
          digitalWrite(LED_STATUS, HIGH);

          // Envia comando limpo e padronizado ao Raspberry Pi
          Serial.println("FOX_BOTAO_PRESSIONADO");

          delay(150);
          digitalWrite(LED_STATUS, LOW);
        }
      }
    }
  }
}
