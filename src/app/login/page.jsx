import { redirect } from 'next/navigation';

/**
 * Rota legada /login mantida como redirecionamento transparente para o
 * Login Único Inteligente em /entrar (preservando ?redirect e ?motivo).
 */
export default async function RedirectLoginUnificado({ searchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.redirect) query.set('redirect', String(params.redirect));
  if (params?.motivo) query.set('motivo', String(params.motivo));

  const qs = query.toString();
  redirect(qs ? `/entrar?${qs}` : '/entrar');
}
