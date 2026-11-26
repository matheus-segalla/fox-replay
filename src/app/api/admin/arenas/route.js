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

async function buscarMapaGestoresPorIds(supabaseAdmin, userIds) {
  const unicos = Array.from(new Set(userIds.filter(Boolean)));
  const mapa = new Map();
  const LOTE = 10;

  for (let i = 0; i < unicos.length; i += LOTE) {
    const slice = unicos.slice(i, i + LOTE);
    const resultados = await Promise.all(
      slice.map((uid) => supabaseAdmin.auth.admin.getUserById(uid).catch(() => null))
    );
    for (const res of resultados) {
      const u = res?.data?.user;
      if (u) mapa.set(u.id, u);
    }
  }
  return mapa;
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
 * GET /api/admin/arenas
 * Retorna todas as arenas com quadras, dispositivos e dados do gestor criador (e-mail e telefone).
 */
export async function GET(request) {
  const { errorResponse } = await exigirSuperAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const [resArenas, resCount] = await Promise.all([
      supabaseAdmin
        .from('arenas')
        .select('*, quadras(*, dispositivos(*))')
        .order('nome', { ascending: true }),
      supabaseAdmin.from('replays').select('id', { count: 'exact', head: true }),
    ]);

    if (resArenas.error) throw resArenas.error;

    const listaArenas = resArenas.data || [];
    const mapaUsuarios = await buscarMapaGestoresPorIds(
      supabaseAdmin,
      listaArenas.map((a) => a.usuario_id)
    );

    const arenasEnriquecidas = listaArenas.map((arena) => {
      const usuario = arena.usuario_id ? mapaUsuarios.get(arena.usuario_id) : null;
      const meta = usuario?.user_metadata || {};
      const telefone = meta.telefone || meta.phone || usuario?.phone || '';
      const nomeGestor = meta.nome_completo || meta.name || '';

      return {
        ...arena,
        gestor_email: usuario?.email || null,
        gestor_nome: nomeGestor || null,
        gestor_telefone: telefone || null,
      };
    });

    return NextResponse.json({
      arenas: arenasEnriquecidas,
      totalReplays: resCount.count || 0,
    });
  } catch (err) {
    console.error('Erro em GET /api/admin/arenas:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao carregar arenas.' },
      { status: 500 }
    );
  }
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
    const telefoneGestor = (body?.telefone_gestor || '').trim();
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
          telefone: telefoneGestor || undefined,
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
    } else if (telefoneGestor || nomeGestor) {
      // Atualiza telefone/nome nos metadados do gestor se informados no cadastro da arena
      const metaAtual = usuarioGestor.user_metadata || {};
      await supabaseAdmin.auth.admin.updateUserById(usuarioGestor.id, {
        user_metadata: {
          ...metaAtual,
          ...(nomeGestor ? { nome_completo: nomeGestor } : {}),
          ...(telefoneGestor ? { telefone: telefoneGestor } : {}),
        },
      }).catch(() => {});
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
          telefone: telefoneGestor || null,
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
 * Edita nome, cidade/UF, plano, cota de quadras, status ou telefone do gestor de uma arena.
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

    const temTelefoneGestor = typeof body.telefone_gestor === 'string';

    if (Object.keys(atualizacao).length === 0 && !temTelefoneGestor) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    let arenaAtualizada = null;
    if (Object.keys(atualizacao).length > 0) {
      const { data, error } = await supabaseAdmin
        .from('arenas')
        .update(atualizacao)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      arenaAtualizada = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('arenas')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      arenaAtualizada = data;
    }

    // Atualiza telefone nos metadados do gestor, se enviado
    if (temTelefoneGestor && arenaAtualizada?.usuario_id) {
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(arenaAtualizada.usuario_id);
      if (userRes?.user) {
        const metaAtual = userRes.user.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(arenaAtualizada.usuario_id, {
          user_metadata: {
            ...metaAtual,
            telefone: body.telefone_gestor.trim(),
          },
        });
      }
    }

    return NextResponse.json({ arena: arenaAtualizada });
  } catch (err) {
    console.error('Erro em PATCH /api/admin/arenas:', err);
    return NextResponse.json({ error: 'Erro interno ao atualizar arena.' }, { status: 500 });
  }
}
