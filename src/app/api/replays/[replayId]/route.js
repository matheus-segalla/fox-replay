import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { autenticarUsuarioApi, extrairCaminhoBucketReplays } from '@/lib/adminRouteAuth';
import { isSuperAdmin } from '@/lib/auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function buscarReplayComDono(supabaseAdmin, replayId) {
  let { data, error } = await supabaseAdmin
    .from('replays')
    .select(
      'id, video_url, thumbnail_url, visualizacoes, downloads, criado_em, quadra_id, quadras(id, nome, arena_id, arenas(id, nome, cidade, usuario_id))'
    )
    .eq('id', replayId)
    .maybeSingle();

  if (error && (error.code === '42703' || String(error.message || '').includes('thumbnail_url'))) {
    const fallback = await supabaseAdmin
      .from('replays')
      .select(
        'id, video_url, visualizacoes, downloads, criado_em, quadra_id, quadras(id, nome, arena_id, arenas(id, nome, cidade, usuario_id))'
      )
      .eq('id', replayId)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  return { replay: data, error };
}

/**
 * GET /api/replays/[replayId]
 * Consulta detalhes completos de um replay para moderação / LGPD (Dono da Arena ou Super Admin).
 */
export async function GET(request, context) {
  const { user, errorResponse } = await autenticarUsuarioApi(request);
  if (errorResponse) return errorResponse;

  const { replayId } = await context.params;
  if (!replayId || !UUID_REGEX.test(replayId)) {
    return NextResponse.json({ error: 'ID de replay inválido.' }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { replay, error } = await buscarReplayComDono(supabaseAdmin, replayId);

    if (error || !replay) {
      return NextResponse.json({ error: 'Replay não encontrado.' }, { status: 404 });
    }

    const ehDono = replay.quadras?.arenas?.usuario_id === user.id;
    if (!isSuperAdmin(user) && !ehDono) {
      return NextResponse.json({ error: 'Sem permissão para acessar este replay.' }, { status: 403 });
    }

    return NextResponse.json({ replay });
  } catch (err) {
    console.error('Erro em GET /api/replays/[replayId]:', err);
    return NextResponse.json({ error: 'Erro interno ao consultar replay.' }, { status: 500 });
  }
}

/**
 * DELETE /api/replays/[replayId]
 * Exclui o replay do banco de dados E apaga os arquivos .mp4 e .jpg no Supabase Storage.
 * Permitido para o Dono da Arena correspondente ou para o Super Admin (LGPD / Moderação).
 */
export async function DELETE(request, context) {
  const { user, errorResponse } = await autenticarUsuarioApi(request);
  if (errorResponse) return errorResponse;

  const { replayId } = await context.params;
  if (!replayId || !UUID_REGEX.test(replayId)) {
    return NextResponse.json({ error: 'ID de replay inválido.' }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { replay, error } = await buscarReplayComDono(supabaseAdmin, replayId);

    if (error || !replay) {
      return NextResponse.json({ error: 'Replay não encontrado ou já excluído.' }, { status: 404 });
    }

    const ehDono = replay.quadras?.arenas?.usuario_id === user.id;
    if (!isSuperAdmin(user) && !ehDono) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este replay.' },
        { status: 403 }
      );
    }

    const { error: errDelete } = await supabaseAdmin
      .from('replays')
      .delete()
      .eq('id', replayId);

    if (errDelete) {
      return NextResponse.json({ error: errDelete.message }, { status: 500 });
    }

    const caminhos = [
      extrairCaminhoBucketReplays(replay.video_url),
      extrairCaminhoBucketReplays(replay.thumbnail_url),
    ].filter(Boolean);

    let arquivosRemovidos = 0;
    if (caminhos.length > 0) {
      const { error: errStorage } = await supabaseAdmin.storage
        .from('replays')
        .remove(caminhos);
      if (!errStorage) {
        arquivosRemovidos = caminhos.length;
      } else {
        console.warn('Replay excluído do banco, mas falha parcial no Storage:', errStorage);
      }
    }

    return NextResponse.json({ ok: true, id: replayId, arquivosRemovidos });
  } catch (err) {
    console.error('Erro em DELETE /api/replays/[replayId]:', err);
    return NextResponse.json({ error: 'Erro interno ao excluir replay.' }, { status: 500 });
  }
}
