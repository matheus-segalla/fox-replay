import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { exigirSuperAdminApi } from '@/lib/adminRouteAuth';

function gerarSlug(texto) {
  const base = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const sufixo = crypto.randomInt(1000, 9999);
  return `${base || 'arena'}-${sufixo}`;
}

function gerarSenhaTemporaria() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let corpo = '';
  for (let i = 0; i < 8; i++) {
    corpo += chars[crypto.randomInt(0, chars.length)];
  }
  return `Fox@${corpo}`;
}

async function localizarUsuarioPorEmail(supabaseAdmin, emailAlvo) {
  const alvo = emailAlvo.toLowerCase().trim();
  let page = 1;
  const perPage = 200;

  while (page <= 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    const encontrado = data.users.find((u) => (u.email || '').toLowerCase() === alvo);
    if (encontrado) return encontrado;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

/**
 * POST /api/admin/arenas
 * Cria uma nova Arena Parceira e cria (ou vincula) a conta do Gestor pelo e-mail.
 */
export async function POST(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => null);
    const nome = (body?.nome || '').trim();
    const cidade = (body?.cidade || '').trim();
    const estado = (body?.estado || 'SP').trim().toUpperCase().slice(0, 2);
    const emailGestor = (body?.email_gestor || '').trim().toLowerCase();
    const nomeGestor = (body?.nome_gestor || '').trim();
    const limiteQuadras = Math.max(1, Math.min(100, parseInt(body?.limite_quadras, 10) || 2));
    const planoNome = (body?.plano_nome || `Plano ${limiteQuadras} ${limiteQuadras === 1 ? 'Quadra' : 'Quadras'}`).trim();

    if (!nome || !emailGestor || !emailGestor.includes('@')) {
      return NextResponse.json(
        { error: 'Informe o nome da arena e um e-mail válido para o gestor.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    let usuarioGestor = await localizarUsuarioPorEmail(supabaseAdmin, emailGestor);
    let contaExistente = Boolean(usuarioGestor);
    let senhaTemporaria = null;

    if (!usuarioGestor) {
      senhaTemporaria = gerarSenhaTemporaria();
      const { data: criado, error: errAuth } = await supabaseAdmin.auth.admin.createUser({
        email: emailGestor,
        password: senhaTemporaria,
        email_confirm: true,
        user_metadata: {
          nome_completo: nomeGestor || nome,
          tipo_usuario: 'gestor_arena',
        },
      });

      if (errAuth || !criado?.user) {
        return NextResponse.json(
          { error: errAuth?.message || 'Não foi possível criar a conta do gestor.' },
          { status: 400 }
        );
      }

      usuarioGestor = criado.user;
      contaExistente = false;
    }

    const payloadArena = {
      nome,
      slug: gerarSlug(nome),
      usuario_id: usuarioGestor.id,
      cidade: cidade || null,
      estado: estado || 'SP',
      limite_quadras: limiteQuadras,
      plano_nome: planoNome,
      ativa: true,
    };

    let { data: arenaCriada, error: errArena } = await supabaseAdmin
      .from('arenas')
      .insert([payloadArena])
      .select('*')
      .single();

    // Fallback caso a coluna `ativa` ainda não exista antes da migração V3
    if (errArena && (errArena.code === '42703' || String(errArena.message || '').includes('ativa'))) {
      delete payloadArena.ativa;
      const fallback = await supabaseAdmin
        .from('arenas')
        .insert([payloadArena])
        .select('*')
        .single();
      arenaCriada = fallback.data;
      errArena = fallback.error;
    }

    if (errArena || !arenaCriada) {
      throw errArena || new Error('Falha ao criar registro da arena.');
    }

    return NextResponse.json(
      {
        arena: arenaCriada,
        gestor: {
          id: usuarioGestor.id,
          email: emailGestor,
          contaExistente,
          senhaTemporaria,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erro em POST /api/admin/arenas:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao criar arena.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/arenas
 * Edita nome, cidade/UF, plano, cota de quadras ou status (ativa/pausada) de uma arena.
 */
export async function PATCH(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => null);
    const id = (body?.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'ID da arena é obrigatório.' }, { status: 400 });
    }

    const atualizacao = {};
    if (typeof body.nome === 'string' && body.nome.trim()) {
      atualizacao.nome = body.nome.trim();
    }
    if (typeof body.cidade === 'string') {
      atualizacao.cidade = body.cidade.trim() || null;
    }
    if (typeof body.estado === 'string') {
      atualizacao.estado = body.estado.trim().toUpperCase().slice(0, 2) || null;
    }
    if (typeof body.plano_nome === 'string' && body.plano_nome.trim()) {
      atualizacao.plano_nome = body.plano_nome.trim();
    }
    if (body.limite_quadras !== undefined) {
      const lim = parseInt(body.limite_quadras, 10);
      if (!Number.isNaN(lim) && lim >= 1 && lim <= 100) {
        atualizacao.limite_quadras = lim;
      }
    }
    if (typeof body.ativa === 'boolean') {
      atualizacao.ativa = body.ativa;
    }

    if (Object.keys(atualizacao).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('arenas')
      .update(atualizacao)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ arena: data });
  } catch (err) {
    console.error('Erro em PATCH /api/admin/arenas:', err);
    return NextResponse.json({ error: 'Erro interno ao atualizar arena.' }, { status: 500 });
  }
}
