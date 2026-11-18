import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from './supabaseAdmin';
import { isSuperAdmin } from './auth';

/**
 * Valida o JWT do usuário autenticado enviado em `Authorization: Bearer <access_token>`.
 */
export async function autenticarUsuarioApi(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Sessão ausente. Faça login novamente.' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Token de sessão inválido.' },
        { status: 401 }
      ),
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Sessão expirada ou inválida.' },
        { status: 401 }
      ),
    };
  }

  return { user: data.user, errorResponse: null };
}

/**
 * Exige que o chamador seja um Super Admin autenticado (app_metadata.role === 'super_admin').
 */
export async function exigirSuperAdminApi(request) {
  const { user, errorResponse } = await autenticarUsuarioApi(request);
  if (errorResponse) return { user: null, errorResponse };

  if (!isSuperAdmin(user)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Acesso restrito a Administradores Fox Replay.' },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Extrai o caminho interno de um objeto dentro do bucket `replays` a partir da URL pública.
 */
export function extrairCaminhoBucketReplays(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  const marcador = '/storage/v1/object/public/replays/';
  const idx = publicUrl.indexOf(marcador);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marcador.length).split('?')[0]);
}
