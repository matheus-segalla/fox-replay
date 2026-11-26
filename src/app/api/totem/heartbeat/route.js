import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { autenticarTotem } from '@/lib/totemAuth';

const NIVEIS_VALIDOS = new Set(['error', 'warn', 'info']);
const CATEGORIAS_VALIDAS = new Set(['camera', 'upload', 'serial', 'heartbeat', 'sistema']);

/**
 * POST /api/totem/heartbeat
 * Chamado periodicamente (60s) pelo daemon do totem para reportar saúde em tempo real
 * (online, status da câmera RTSP, fila offline e eventos de erro) e sincronizar configurações remotas.
 */
export async function POST(request) {
  try {
    const { dispositivo, errorResponse } = await autenticarTotem(request);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const cameraOnline = typeof body?.camera_online === 'boolean' ? body.camera_online : true;
    const filaOfflineQtd = Math.max(0, parseInt(body?.fila_offline_qtd, 10) || 0);
    const limparErro = body?.limpar_erro === true;

    const eventosBrutos = Array.isArray(body?.eventos) ? body.eventos.slice(0, 20) : [];
    const eventosValidos = eventosBrutos
      .filter((ev) => ev && typeof ev.mensagem === 'string' && ev.mensagem.trim())
      .map((ev) => ({
        dispositivo_id: dispositivo.id,
        nivel: NIVEIS_VALIDOS.has(ev.nivel) ? ev.nivel : 'error',
        categoria: CATEGORIAS_VALIDAS.has(ev.categoria) ? ev.categoria : 'sistema',
        mensagem: ev.mensagem.trim().slice(0, 500),
        detalhes: ev.detalhes && typeof ev.detalhes === 'object' ? ev.detalhes : null,
        criado_em:
          typeof ev.criado_em === 'string' && !Number.isNaN(Date.parse(ev.criado_em))
            ? ev.criado_em
            : new Date().toISOString(),
      }));

    const ultimoErroEvento = [...eventosValidos]
      .reverse()
      .find((ev) => ev.nivel === 'error' || ev.nivel === 'warn');

    const payloadUpdate = {
      ultimo_heartbeat: new Date().toISOString(),
      camera_online: cameraOnline,
      fila_offline_qtd: filaOfflineQtd,
    };

    if (ultimoErroEvento) {
      payloadUpdate.ultimo_erro = `[${ultimoErroEvento.categoria.toUpperCase()}] ${ultimoErroEvento.mensagem}`;
      payloadUpdate.ultimo_erro_em = ultimoErroEvento.criado_em;
    } else if (limparErro) {
      payloadUpdate.ultimo_erro = null;
      payloadUpdate.ultimo_erro_em = null;
    }

    const supabaseAdmin = getSupabaseAdmin();
    let { error } = await supabaseAdmin
      .from('dispositivos')
      .update(payloadUpdate)
      .eq('id', dispositivo.id);

    // Fallback seguro caso as colunas V4 (`ultimo_erro`) ainda não tenham sido aplicadas
    if (error && error.code === '42703') {
      const fallback = await supabaseAdmin
        .from('dispositivos')
        .update({
          ultimo_heartbeat: payloadUpdate.ultimo_heartbeat,
          camera_online: cameraOnline,
          fila_offline_qtd: filaOfflineQtd,
        })
        .eq('id', dispositivo.id);
      error = fallback.error;
    }

    if (error && error.code !== '42703') {
      console.error('Erro ao salvar heartbeat do totem:', error);
    }

    if (eventosValidos.length > 0) {
      const { error: erroLogs } = await supabaseAdmin.from('totem_logs').insert(eventosValidos);
      if (erroLogs && erroLogs.code !== '42P01') {
        console.error('Erro ao gravar totem_logs:', erroLogs);
      }
    }

    return NextResponse.json({
      ok: true,
      arena_ativa: dispositivo.arena_ativa,
      camera_url: dispositivo.camera_url || null,
    });
  } catch (err) {
    console.error('Erro em POST /api/totem/heartbeat:', err);
    return NextResponse.json({ error: 'Erro interno no heartbeat.' }, { status: 500 });
  }
}
