import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { autenticarTotem } from '@/lib/totemAuth';

/**
 * POST /api/totem/heartbeat
 * Chamado periodicamente (60s) pelo daemon do totem para reportar saúde em tempo real
 * (online, status da câmera RTSP, tamanho da fila offline) e sincronizar configurações remotas.
 */
export async function POST(request) {
  try {
    const { dispositivo, errorResponse } = await autenticarTotem(request);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const cameraOnline = typeof body?.camera_online === 'boolean' ? body.camera_online : true;
    const filaOfflineQtd = Math.max(0, parseInt(body?.fila_offline_qtd, 10) || 0);

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('dispositivos')
      .update({
        ultimo_heartbeat: new Date().toISOString(),
        camera_online: cameraOnline,
        fila_offline_qtd: filaOfflineQtd,
      })
      .eq('id', dispositivo.id);

    if (error && error.code !== '42703') {
      console.error('Erro ao salvar heartbeat do totem:', error);
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
