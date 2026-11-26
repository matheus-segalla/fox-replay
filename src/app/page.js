import React from 'react';
import { createClient } from '@supabase/supabase-js';
import HomeClient from './components/HomeClient';

export const revalidate = 60;

export const metadata = {
  title: 'FOX REPLAY — Reveja e baixe seus lances esportivos instantaneamente',
  description:
    'Aperte o botão na quadra, localize sua arena e baixe seus melhores lances de Beach Tennis, Futevôlei, Padel e Tênis em alta definição.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FOX REPLAY — Seus lances além dos limites da quadra',
    description:
      'Tecnologia autônoma de replay esportivo para arenas. Assista e baixe seus melhores momentos pelo celular.',
    url: 'https://www.foxreplay.com.br',
    type: 'website',
    images: [
      {
        url: '/logo-fox.jpeg',
        width: 1254,
        height: 1254,
        alt: 'FOX REPLAY',
      },
    ],
  },
};

async function buscarArenasServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  try {
    const supabaseServer = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    let { data, error } = await supabaseServer
      .from('arenas')
      .select('id, nome, cidade, estado, slug')
      .eq('ativa', true)
      .order('nome', { ascending: true });

    if (error && (error.code === '42703' || String(error.message || '').includes('ativa'))) {
      const fallback = await supabaseServer
        .from('arenas')
        .select('id, nome, cidade, estado, slug')
        .order('nome', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const arenasIniciais = await buscarArenasServidor();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FOX REPLAY',
    url: 'https://www.foxreplay.com.br',
    logo: 'https://www.foxreplay.com.br/logo-fox.jpeg',
    description:
      'Sistema autônomo de replay esportivo instantâneo para arenas de Beach Tennis, Futevôlei, Padel e Tênis.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient arenasIniciais={arenasIniciais} />
    </>
  );
}
