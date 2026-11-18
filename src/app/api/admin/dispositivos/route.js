import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { exigirSuperAdminApi } from '@/lib/adminRouteAuth';

/**
 * PATCH /api/admin/dispositivos
 * Atualiza a URL RTSP (`camera_url`) de um dispositivo/totem vinculado.
 */
export async function PATCH(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => null);
    const id = (body?.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'ID do dispositivo é obrigatório.' }, { status: 400 });
    }

    const cameraUrl = typeof body?.camera_url === 'string' ? body.camera_url.trim() || null : null;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('dispositivos')
      .update({ camera_url: cameraUrl })
      .eq('id', id)
      .select('id, quadra_id, camera_url')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ dispositivo: data });
  } catch (err) {
    console.error('Erro em PATCH /api/admin/dispositivos:', err);
    return NextResponse.json({ error: 'Erro interno ao atualizar dispositivo.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/dispositivos
 * Desvincula um totem (ex.: equipamento com defeito ou substituição em campo).
 */
export async function DELETE(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = (searchParams.get('id') || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'Parâmetro id do dispositivo é obrigatório.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('dispositivos').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro em DELETE /api/admin/dispositivos:', err);
    return NextResponse.json({ error: 'Erro interno ao desvincular dispositivo.' }, { status: 500 });
  }
}
