import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { exigirSuperAdminApi } from '@/lib/adminRouteAuth';

/**
 * GET /api/admin/dispositivos/logs?dispositivoId=<uuid>
 * Retorna os últimos 50 eventos/erros registrados pelo totem.
 */
export async function GET(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const dispositivoId = (searchParams.get('dispositivoId') || '').trim();

    if (!dispositivoId) {
      return NextResponse.json({ error: 'dispositivoId obrigatório.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('totem_logs')
      .select('id, nivel, categoria, mensagem, detalhes, criado_em')
      .eq('dispositivo_id', dispositivoId)
      .order('criado_em', { ascending: false })
      .limit(50);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          logs: [],
          aviso: 'Tabela totem_logs ainda não criada. Execute supabase_migration_v4_totem_logs.sql no Supabase.',
        });
      }
      throw error;
    }

    return NextResponse.json({ logs: data || [] });
  } catch (err) {
    console.error('Erro em GET /api/admin/dispositivos/logs:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao buscar logs do dispositivo.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/dispositivos/logs?dispositivoId=<uuid>
 * Limpa o histórico de logs e o último erro registrado do dispositivo.
 */
export async function DELETE(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const dispositivoId = (searchParams.get('dispositivoId') || '').trim();

    if (!dispositivoId) {
      return NextResponse.json({ error: 'dispositivoId obrigatório.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    await supabaseAdmin
      .from('totem_logs')
      .delete()
      .eq('dispositivo_id', dispositivoId);

    await supabaseAdmin
      .from('dispositivos')
      .update({ ultimo_erro: null, ultimo_erro_em: null })
      .eq('id', dispositivoId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro em DELETE /api/admin/dispositivos/logs:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao limpar logs do dispositivo.' },
      { status: 500 }
    );
  }
}
