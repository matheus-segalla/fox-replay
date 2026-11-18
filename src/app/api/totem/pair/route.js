import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { compararSeguro } from '@/lib/totemAuth';

function gerarCodigo6Digitos() {
  const parte1 = crypto.randomInt(100, 1000);
  const parte2 = crypto.randomInt(100, 1000);
  return `${parte1}-${parte2}`;
}

/**
 * POST /api/totem/pair
 * Chamado pelo totem não configurado para registrar um código temporário de pareamento
 * protegido por um `pair_secret` exclusivo daquela sessão.
 */
export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const pairSecret = crypto.randomBytes(24).toString('hex');
    const expiraEm = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const codigo = gerarCodigo6Digitos();
      const { data, error } = await supabaseAdmin
        .from('pareamentos')
        .insert([
          {
            codigo,
            status: 'pendente',
            pair_secret: pairSecret,
            expira_em: expiraEm,
          },
        ])
        .select('codigo, expira_em')
        .single();

      if (!error && data) {
        return NextResponse.json(
          {
            codigo: data.codigo,
            pair_secret: pairSecret,
            expira_em: data.expira_em,
          },
          { status: 201 }
        );
      }

      // Código duplicado (23505): tenta novamente com outro código aleatório
      if (error?.code !== '23505') {
        throw error;
      }
    }

    return NextResponse.json(
      { error: 'Não foi possível gerar código de pareamento único.' },
      { status: 500 }
    );
  } catch (err) {
    console.error('Erro em POST /api/totem/pair:', err);
    return NextResponse.json(
      { error: 'Erro interno ao iniciar pareamento.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/totem/pair?codigo=XXX-XXX
 * Header obrigatório: X-Pair-Secret: <pair_secret>
 * Consulta se o gestor já vinculou o totem. Quando vinculado, entrega as credenciais
 * UMA ÚNICA VEZ e limpa token/camera_url da tabela temporária de pareamentos.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = (searchParams.get('codigo') || '').trim().toUpperCase();
    const secretHeader = (request.headers.get('x-pair-secret') || '').trim();

    if (!codigo || !secretHeader) {
      return NextResponse.json(
        { error: 'Parâmetro codigo e cabeçalho X-Pair-Secret são obrigatórios.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: pareamento, error } = await supabaseAdmin
      .from('pareamentos')
      .select('id, status, pair_secret, quadra_id, token_gerado, camera_url, expira_em, quadras(nome, arena_id)')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error || !pareamento || !compararSeguro(pareamento.pair_secret || '', secretHeader)) {
      return NextResponse.json(
        { error: 'Sessão de pareamento inválida.' },
        { status: 401 }
      );
    }

    if (
      pareamento.status === 'pendente' &&
      pareamento.expira_em &&
      new Date(pareamento.expira_em).getTime() < Date.now()
    ) {
      await supabaseAdmin
        .from('pareamentos')
        .update({ status: 'expirado' })
        .eq('id', pareamento.id);
      return NextResponse.json({ status: 'expirado' }, { status: 410 });
    }

    if (pareamento.status === 'vinculado' && pareamento.token_gerado) {
      // Limpa segredos da tabela temporária imediatamente após a entrega ao totem
      await supabaseAdmin
        .from('pareamentos')
        .update({
          status: 'concluido',
          token_gerado: null,
          camera_url: null,
        })
        .eq('id', pareamento.id);

      return NextResponse.json({
        status: 'vinculado',
        quadra_id: pareamento.quadra_id,
        token_gerado: pareamento.token_gerado,
        camera_url: pareamento.camera_url || null,
        nome_quadra: pareamento.quadras?.nome || 'Quadra Ativada',
        arena_id: pareamento.quadras?.arena_id || null,
      });
    }

    return NextResponse.json({ status: pareamento.status });
  } catch (err) {
    console.error('Erro em GET /api/totem/pair:', err);
    return NextResponse.json(
      { error: 'Erro interno ao consultar pareamento.' },
      { status: 500 }
    );
  }
}
