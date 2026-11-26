/**
 * Utilitários compartilhados de formatação de texto e exibição.
 */

/**
 * Retorna até 2 iniciais em maiúsculo a partir de um nome completo ou título.
 */
export function getIniciais(nome, fallback = 'FR') {
  if (!nome || typeof nome !== 'string') return fallback;
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return fallback;
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
