/**
 * Rate Limiter leve em memória (janela deslizante) para proteção de rotas públicas.
 * Inclui limpeza periódica automática para evitar crescimento indefinido de memória.
 */

const buckets = new Map();
let ultimoExpurgo = Date.now();

function extrairIpCliente(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const primeiro = xff.split(',')[0]?.trim();
    if (primeiro) return primeiro;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

/**
 * Verifica se o IP cliente excedeu o limite na janela configurada.
 * @param {Request} request
 * @param {{ chave: string, limite: number, janelaMs: number }} opts
 * @returns {{ permitido: boolean, restante: number, retryAfterSegundos: number }}
 */
export function verificarRateLimit(request, { chave, limite = 10, janelaMs = 60_000 }) {
  const agora = Date.now();

  // Limpeza periódica a cada 5 minutos
  if (agora - ultimoExpurgo > 5 * 60_000) {
    for (const [k, registros] of buckets.entries()) {
      const ativos = registros.filter((ts) => agora - ts < janelaMs);
      if (ativos.length === 0) {
        buckets.delete(k);
      } else {
        buckets.set(k, ativos);
      }
    }
    ultimoExpurgo = agora;
  }

  const ip = extrairIpCliente(request);
  const bucketKey = `${chave}:${ip}`;
  const registros = buckets.get(bucketKey) || [];
  const recentes = registros.filter((ts) => agora - ts < janelaMs);

  if (recentes.length >= limite) {
    const maisAntigo = recentes[0] || agora;
    const retryAfterMs = Math.max(1000, janelaMs - (agora - maisAntigo));
    buckets.set(bucketKey, recentes);
    return {
      permitido: false,
      restante: 0,
      retryAfterSegundos: Math.ceil(retryAfterMs / 1000),
    };
  }

  recentes.push(agora);
  buckets.set(bucketKey, recentes);

  return {
    permitido: true,
    restante: Math.max(0, limite - recentes.length),
    retryAfterSegundos: 0,
  };
}
