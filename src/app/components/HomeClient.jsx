'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';

const IconSearch = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconMapPin = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.686-7-12a7 7 0 1114 0c0 6.314-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const IconArrowRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconX = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconRadio = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
  </svg>
);

const IconDownload = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconSliders = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const IconBuilding = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

function getIniciais(nome) {
  if (!nome) return 'FR';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function HomeClient({ arenasIniciais = [] }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  const [todasArenas, setTodasArenas] = useState(arenasIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [ultimaArena, setUltimaArena] = useState(null);
  const [lancesFavoritosCount, setLancesFavoritosCount] = useState(0);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');

  // Fecha modal de cidades com Escape
  useEffect(() => {
    if (!modalAberto) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setModalAberto(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalAberto]);

  // Carrega última arena e contagem de favoritos locais (após hidratação)
  useEffect(() => {
    let cancelado = false;
    const timer = setTimeout(() => {
      if (cancelado) return;
      try {
        const salvo = localStorage.getItem('fox_ultima_arena');
        if (salvo) setUltimaArena(JSON.parse(salvo));
        const favoritosSalvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
        setLancesFavoritosCount(Array.isArray(favoritosSalvos) ? favoritosSalvos.length : 0);
      } catch (e) {
        console.warn('Erro ao ler dados locais:', e);
      }
    }, 0);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, []);

  // Fallback cliente apenas se SSR não trouxe arenas
  useEffect(() => {
    if (arenasIniciais.length > 0) return;
    let cancelado = false;
    async function carregarArenas() {
      try {
        let { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade, estado, slug')
          .eq('ativa', true)
          .order('nome', { ascending: true });

        if (error && (error.code === '42703' || String(error.message || '').includes('ativa'))) {
          const fallback = await supabase
            .from('arenas')
            .select('id, nome, cidade, estado, slug')
            .order('nome', { ascending: true });
          data = fallback.data;
          error = fallback.error;
        }

        if (error) throw error;
        if (!cancelado && data) {
          setTodasArenas(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar arenas:', err);
      }
    }
    carregarArenas();
    return () => {
      cancelado = true;
    };
  }, [arenasIniciais.length]);

  // Deriva cidades únicas e arenas por cidade em memória (zero queries extras!)
  const cidadesDisponiveis = useMemo(() => {
    const cidadesUnicas = [];
    const mapa = new Set();
    for (const item of todasArenas) {
      if (!item.cidade || !item.estado) continue;
      const chave = `${item.cidade.trim().toLowerCase()}-${item.estado.trim().toLowerCase()}`;
      if (!mapa.has(chave)) {
        mapa.add(chave);
        cidadesUnicas.push({ cidade: item.cidade.trim(), estado: item.estado.trim() });
      }
    }
    return cidadesUnicas.sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'));
  }, [todasArenas]);

  const arenasDaCidade = useMemo(() => {
    if (!cidadeSelecionada) return [];
    const alvo = cidadeSelecionada.trim().toLowerCase();
    return todasArenas.filter((a) => (a.cidade || '').trim().toLowerCase() === alvo);
  }, [todasArenas, cidadeSelecionada]);

  const arenasFiltradas = useMemo(() => {
    const termo = termoBusca.toLowerCase().trim();
    if (!termo) return [];
    return todasArenas.filter((arena) => {
      const nomeMatch = arena.nome?.toLowerCase().includes(termo);
      const cidadeMatch = arena.cidade?.toLowerCase().includes(termo);
      return nomeMatch || cidadeMatch;
    });
  }, [todasArenas, termoBusca]);

  const acessarArena = (arena) => {
    try {
      localStorage.setItem('fox_ultima_arena', JSON.stringify({
        id: arena.id,
        nome: arena.nome,
        cidade: arena.cidade,
        estado: arena.estado
      }));
    } catch {}
    router.push(`/arena/${arena.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-zinc-950 relative flex flex-col justify-between overflow-x-hidden">

      {/* ANÉIS 3D METÁLICOS DOURADOS E ILUMINAÇÃO EM TEMA CLARO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-amber-400/20 via-amber-300/5 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] bg-amber-400/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[5%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[170px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_25%,#000_70%,transparent_100%)] opacity-70" />

        <svg className="absolute -top-16 -right-20 w-[580px] h-[580px] opacity-25 md:opacity-40 select-none animate-pulse duration-1000" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="180" stroke="url(#goldGradLight1)" strokeWidth="26" strokeLinecap="round" />
          <circle cx="250" cy="250" r="130" stroke="url(#goldGradLight2)" strokeWidth="10" strokeDasharray="25 15" />
          <defs>
            <linearGradient id="goldGradLight1" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#d97706" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldGradLight2" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute top-[680px] -left-32 w-[520px] h-[520px] opacity-20 md:opacity-30 select-none" viewBox="0 0 500 500" fill="none">
          <ellipse cx="250" cy="250" rx="190" ry="110" transform="rotate(-25 250 250)" stroke="url(#goldGradLight3)" strokeWidth="20" />
          <defs>
            <linearGradient id="goldGradLight3" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#b45309" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* NAVBAR GLOBAL CONTEXTUAL */}
      <AppHeader theme="light" activeRoute="home" lancesFavoritosCount={lancesFavoritosCount} />

      {/* HERO SECTION */}
      <main className="w-full max-w-5xl mx-auto px-5 text-center py-12 md:py-18 z-10 flex-1 flex flex-col justify-center space-y-11">
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill-light border border-amber-500/30 text-zinc-700 text-xs font-semibold shadow-xs">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
              ↗
            </span>
            <span className="tracking-wide">Tecnologia Autônoma &bull; Reveja seus lances em segundos</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.92] select-none">
            <span className="block text-zinc-950">SEUS LANCES ALÉM DOS</span>
            <span className="block text-stroke-gold mt-2">LIMITES DA QUADRA</span>
          </h1>

          <p className="text-zinc-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Aperte o botão físico no totem da quadra logo após o lance, localize a sua arena e faça o download dos seus melhores momentos em alta definição.
          </p>
        </div>

        {/* ATALHO 1-TOQUE: ÚLTIMA ARENA VISITADA */}
        {ultimaArena && (
          <div className="w-full max-w-md mx-auto animate-fadeIn">
            <Link
              href={`/arena/${ultimaArena.id}`}
              className="glass-card-light hover:border-amber-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition-all shadow-sm group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-xs font-black tracking-wider border border-amber-500/20 shadow-xs">
                  {getIniciais(ultimaArena.nome)}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-600 tracking-wider">
                    Continuar de onde parou
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                    {ultimaArena.nome}
                  </h4>
                  {ultimaArena.cidade && (
                    <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
                      <IconMapPin className="w-3 h-3 text-zinc-400" />
                      <span>{ultimaArena.cidade} {ultimaArena.estado ? `(${ultimaArena.estado})` : ''}</span>
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-zinc-800 bg-zinc-100 border border-zinc-200 px-3.5 py-1.5 rounded-xl group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:border-amber-500 transition-all shadow-xs flex items-center gap-1.5">
                <span>Entrar</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        )}

        {/* BARRA DE BUSCA RÁPIDA INSTANTÂNEA */}
        <div className="w-full max-w-lg mx-auto relative z-20">
          <div className="relative">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite o nome do complexo esportivo ou cidade..."
              aria-label="Buscar arena por nome ou cidade"
              className="w-full pl-12 pr-11 py-4 rounded-2xl bg-white/95 border border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm font-medium shadow-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 backdrop-blur-xl"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
              <IconSearch className="w-4 h-4" />
            </span>
            {termoBusca && (
              <button
                type="button"
                onClick={() => setTermoBusca('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                aria-label="Limpar busca"
                title="Limpar busca"
              >
                <IconX className="w-3 h-3" />
              </button>
            )}
          </div>

          {termoBusca.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white/98 border border-zinc-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto z-30 divide-y divide-zinc-100 text-left animate-fadeIn backdrop-blur-2xl">
              {arenasFiltradas.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs font-medium space-y-2">
                  <p>Nenhuma arena encontrada para &quot;{termoBusca}&quot;.</p>
                  <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    className="text-amber-600 font-bold hover:underline text-xs inline-flex items-center gap-1"
                  >
                    <span>Ver lista completa por cidades</span>
                    <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                arenasFiltradas.map((arena) => (
                  <button
                    key={arena.id}
                    type="button"
                    onClick={() => acessarArena(arena)}
                    className="w-full p-4 hover:bg-zinc-50 cursor-pointer transition-colors flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-700 border border-amber-500/20 flex items-center justify-center text-xs font-black tracking-wider transition-colors">
                        {getIniciais(arena.nome)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors uppercase">
                          {arena.nome}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
                          <IconMapPin className="w-3 h-3 text-zinc-400" />
                          <span>{arena.cidade || 'Localização não informada'} {arena.estado ? `• ${arena.estado}` : ''}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-500 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                      <span>Ver lances</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="text-xs font-mono font-semibold text-zinc-500 hover:text-amber-600 transition-colors flex items-center gap-1.5"
            >
              <span>Ou explorar lista de cidades com quadras ativas</span>
              <IconArrowRight className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
        </div>

        {/* 3 ETAPAS */}
        <div className="w-full max-w-4xl mx-auto animate-fadeIn min-h-[160px] pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="glass-card-light rounded-2xl p-6 space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black text-amber-700 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  ETAPA 01
                </span>
                <IconRadio className="w-4 h-4 text-zinc-400" />
              </div>
              <h2 className="font-bold text-zinc-900 text-sm tracking-wide uppercase">
                Gravação na Quadra
              </h2>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">
                Ao terminar um ponto marcante, aperte o botão físico no totem da quadra para salvar imediatamente os últimos 30 segundos.
              </p>
            </div>

            <div className="glass-card-light rounded-2xl p-6 space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black text-amber-700 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  ETAPA 02
                </span>
                <IconSliders className="w-4 h-4 text-zinc-400" />
              </div>
              <h2 className="font-bold text-zinc-900 text-sm tracking-wide uppercase">
                Localização Imediata
              </h2>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">
                Filtre pela sua quadra e faixa de horário para encontrar a jogada exata sem precisar vasculhar horas de gravação.
              </p>
            </div>

            <div className="glass-card-light rounded-2xl p-6 space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black text-amber-700 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  ETAPA 03
                </span>
                <IconDownload className="w-4 h-4 text-zinc-400" />
              </div>
              <h2 className="font-bold text-zinc-900 text-sm tracking-wide uppercase">
                Download Gratuito
              </h2>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">
                Assista ao vídeo em alta definição e baixe direto no seu smartphone para arquivar ou compartilhar nos Stories do Instagram.
              </p>
            </div>
          </div>
        </div>

        {/* CALL-TO-ACTION INSTITUCIONAL PARA GESTORES */}
        <div className="w-full max-w-xl mx-auto pt-3">
          <Link
            href="/para-arenas"
            className="glass-card-light hover:border-amber-500/40 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center shrink-0">
                <IconBuilding className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors uppercase tracking-wide">
                  Gestor de Complexo Esportivo?
                </h3>
                <p className="text-[11px] text-zinc-500 font-normal leading-normal">
                  Conheça nossa infraestrutura autônoma de gravação e oportunidades de monetização.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 group-hover:text-amber-700 transition-colors pl-3 shrink-0 flex items-center gap-1">
              <span>Saiba mais</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-200/80 py-8 text-center z-10 bg-white/70 backdrop-blur-md space-y-3">
        <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-semibold">
          © {new Date().getFullYear()} FOX REPLAY &bull; TECNOLOGIA DE MONITORAMENTO ESPORTIVO
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <Link href="/entrar" className="hover:text-amber-600 transition-colors font-medium">
            Acesso Unificado &bull; Atleta e Gestor
          </Link>
          <span className="text-zinc-300">&bull;</span>
          <Link href="/para-arenas" className="hover:text-amber-600 transition-colors font-medium">
            Seja uma Arena Parceira ➔
          </Link>
        </div>
      </footer>

      {/* MODAL DE SELEÇÃO POR CIDADE */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-[420px] space-y-5 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconMapPin className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-950">
                  Selecionar Complexo Esportivo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-zinc-700 transition-colors bg-zinc-50 border border-zinc-200 w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                  1. Cidade
                </label>
                <select
                  value={cidadeSelecionada}
                  onChange={(e) => setCidadeSelecionada(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 font-semibold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="" className="text-zinc-400">
                    Selecione o município...
                  </option>
                  {cidadesDisponiveis.map((c) => (
                    <option key={`${c.cidade}-${c.estado}`} value={c.cidade} className="text-zinc-800">
                      {c.cidade} ({c.estado.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {cidadeSelecionada && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    2. Arenas Parceiras
                  </label>

                  {arenasDaCidade.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 font-medium px-1 py-2">
                      Nenhum complexo ativo nesta área.
                    </p>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl max-h-[200px] overflow-y-auto divide-y divide-zinc-200/60 shadow-inner">
                      {arenasDaCidade.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setModalAberto(false);
                            acessarArena(item);
                          }}
                          className="w-full px-4 py-3 text-xs text-zinc-700 font-bold hover:bg-white hover:text-amber-600 cursor-pointer transition-colors flex items-center justify-between group text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-black flex items-center justify-center border border-amber-500/20">
                              {getIniciais(item.nome)}
                            </span>
                            <span>{item.nome}</span>
                          </div>
                          <span className="text-zinc-400 group-hover:text-amber-600 text-[11px] font-medium transition-colors flex items-center gap-1">
                            <span>Entrar</span>
                            <IconArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
