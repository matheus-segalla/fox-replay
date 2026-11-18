/**
 * Utilitários compartilhados de autenticação, autorização e sanitização.
 */

export const WHATSAPP_SUPORTE =
  process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE || '5511997771152';

/**
 * Verifica se o usuário autenticado possui privilégio real de Super Admin.
 * Usa EXCLUSIVAMENTE `app_metadata.role`, que só pode ser atribuído no servidor
 * (SQL Editor / Service Role) e não pode ser alterado pelo próprio usuário.
 */
export function isSuperAdmin(user) {
  return user?.app_metadata?.role === 'super_admin';
}

/**
 * Sanitiza destinos de redirecionamento vindos da query string (?redirect=...)
 * prevenindo vulnerabilidades de Open Redirect (ex: https://evil.com ou //evil.com).
 */
export function sanitizarRedirect(destino, fallback = '/perfil') {
  if (!destino || typeof destino !== 'string') return fallback;
  const limpo = destino.trim();
  if (!limpo.startsWith('/') || limpo.startsWith('//') || limpo.includes('\\')) {
    return fallback;
  }
  return limpo;
}

/**
 * Valida URLs fornecidas pelo usuário (logos, fotos de capa, links)
 * permitindo apenas http:// ou https:// (bloqueia javascript:, data:, etc.).
 */
export function validarUrlHttp(url) {
  if (!url || typeof url !== 'string') return true; // campo opcional vazio é válido
  const limpo = url.trim();
  if (!limpo) return true;
  try {
    const parsed = new URL(limpo);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Gera a URL padronizada do WhatsApp de suporte/LGPD.
 */
export function montarUrlWhatsAppSuporte(mensagem) {
  const numeroLimpo = String(WHATSAPP_SUPORTE).replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${numeroLimpo}&text=${encodeURIComponent(mensagem)}`;
}
