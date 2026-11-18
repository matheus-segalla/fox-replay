import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from './supabaseAdmin';

/**
 * Comparação em tempo constante para segredos/tokens (previne timing attacks).
 */
export function compararSeguro(valorA, valorB) {
  if (typeof valorA !== 'string' || typeof valorB !== 'string') return false;
  const bufA = Buffer.from(valorA, 'utf8');
  const bufB = Buffer.from(valorB, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Autentica uma requisição vinda de um totem físico pelo cabeçalho
 * `Authorization: Bearer <token_autenticacao>`, trazendo também o status `ativa` da arena.
 */
export async function autenticarTotem(request, { exigirArenaAtiva = false } = {}) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      dispositivo: null,
      errorResponse: NextResponse.json(
        { error: 'Token de autenticação do totem ausente.' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7).trim();
  if (token.length < 16) {
    return {
      dispositivo: null,
      errorResponse: NextResponse.json(
        { error: 'Token de autenticação inválido.' },
        { status: 401 }
      ),
    };
  }

  const supabaseAdmin = getSupabaseAdmin();

  let { data: dispositivo, error } = await supabaseAdmin
    .from('dispositivos')
    .select('id, quadra_id, token_autenticacao, camera_url, quadras(arena_id, arenas(id, ativa))')
    .eq('token_autenticacao', token)
    .maybeSingle();

  // Fallback seguro caso a coluna `arenas.ativa` ainda não tenha sido aplicada no SQL
  if (error && (error.code === '42703' || String(error.message || '').includes('ativa'))) {
    const fallback = await supabaseAdmin
      .from('dispositivos')
      .select('id, quadra_id, token_autenticacao, camera_url, quadras(arena_id, arenas(id))')
      .eq('token_autenticacao', token)
      .maybeSingle();
    dispositivo = fallback.data;
    error = fallback.error;
  }

  if (error || !dispositivo) {
    return {
      dispositivo: null,
      errorResponse: NextResponse.json(
        { error: 'Dispositivo não autorizado.' },
        { status: 401 }
      ),
    };
  }

  const arenaAtiva = dispositivo.quadras?.arenas?.ativa !== false;
  if (exigirArenaAtiva && !arenaAtiva) {
    return {
      dispositivo: null,
      errorResponse: NextResponse.json(
        { error: 'Arena temporariamente pausada. Novos uploads suspensos.' },
        { status: 403 }
      ),
    };
  }

  return {
    dispositivo: {
      ...dispositivo,
      arena_id: dispositivo.quadras?.arena_id || dispositivo.quadras?.arenas?.id || null,
      arena_ativa: arenaAtiva,
    },
    errorResponse: null,
  };
}
