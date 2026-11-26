import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://www.foxreplay.com.br';

export const revalidate = 3600;

async function listarArenasPublicas() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  try {
    const supabaseServer = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    let { data, error } = await supabaseServer
      .from('arenas')
      .select('id, criado_em')
      .eq('ativa', true)
      .order('nome', { ascending: true });

    if (error && (error.code === '42703' || String(error.message || '').includes('ativa'))) {
      const fallback = await supabaseServer
        .from('arenas')
        .select('id, criado_em')
        .order('nome', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const agora = new Date();

  const rotasEstaticas = [
    {
      url: `${BASE_URL}/`,
      lastModified: agora,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/para-arenas`,
      lastModified: agora,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const arenas = await listarArenasPublicas();
  const rotasArenas = arenas.map((arena) => ({
    url: `${BASE_URL}/arena/${arena.id}`,
    lastModified: arena.criado_em ? new Date(arena.criado_em) : agora,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...rotasEstaticas, ...rotasArenas];
}
