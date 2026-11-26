import { createClient } from '@supabase/supabase-js';
import ArenaClient from './ArenaClient';

async function buscarMetaArena(arenaId) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !arenaId) return null;

  try {
    const supabaseServer = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabaseServer
      .from('arenas')
      .select('id, nome, cidade, estado, logo_url')
      .eq('id', arenaId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { arenaId } = await params;
  const arena = await buscarMetaArena(arenaId);

  if (!arena) {
    return {
      title: 'Replays da Arena',
      description: 'Assista e baixe seus lances esportivos no FOX REPLAY.',
      alternates: { canonical: `/arena/${arenaId}` },
    };
  }

  const localizacao = [arena.cidade, arena.estado].filter(Boolean).join(' - ');
  const titulo = localizacao
    ? `${arena.nome} (${localizacao}) — Replays e Jogadas`
    : `${arena.nome} — Replays e Jogadas`;
  const descricao = localizacao
    ? `Assista, baixe e compartilhe os melhores lances e replays da ${arena.nome} em ${localizacao} pelo FOX REPLAY.`
    : `Assista, baixe e compartilhe os melhores lances e replays da ${arena.nome} pelo FOX REPLAY.`;

  const imagem = arena.logo_url || '/logo-fox.jpeg';

  return {
    title: titulo,
    description: descricao,
    alternates: {
      canonical: `/arena/${arenaId}`,
    },
    openGraph: {
      title: `${titulo} | FOX REPLAY`,
      description: descricao,
      url: `https://www.foxreplay.com.br/arena/${arenaId}`,
      type: 'website',
      images: [{ url: imagem, alt: arena.nome }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titulo} | FOX REPLAY`,
      description: descricao,
      images: [imagem],
    },
  };
}

export default function PaginaArena() {
  return <ArenaClient />;
}
