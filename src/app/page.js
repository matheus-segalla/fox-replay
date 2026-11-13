'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// Ícones SVG Minimalistas e Esportivos (sem estética de IA ou emojis)
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

const IconStar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconClock = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
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

const IconCalendar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconBuilding = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconShield = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconUser = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function LandingPage() {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  // Estados para busca rápida instantânea
  const [todasArenas, setTodasArenas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [ultimaArena, setUltimaArena] = useState(null);
  const [lancesFavoritos, setLancesFavoritos] = useState([]);
  const [modalFavoritosAberto, setModalFavoritosAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Monitora sessão do usuário autenticado
  useEffect(() => {
    async function checarSessao() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUsuarioLogado(session.user);
        }
      } catch (e) {}
    }
    checarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuarioLogado(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Estados para o funil por cidades (modal secundário)
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [arenasDaCidade, setArenasDaCidade] = useState([]);
  const [carregandoArenasCidade, setCarregandoArenasCidade] = useState(false);

  // Carrega última arena e lances salvos do localStorage
  useEffect(() => {
    let cancelado = false;
    const carregarStorage = () => {
      try {
        const salvo = localStorage.getItem('fox_ultima_arena');
        if (salvo && !cancelado) {
          setUltimaArena(JSON.parse(salvo));
        }
        const favoritosSalvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
        if (!cancelado) {
          setLancesFavoritos(favoritosSalvos);
        }
      } catch (e) {
        console.warn('Erro ao ler dados locais:', e);
      }
    };

    const timer = setTimeout(carregarStorage, 0);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, []);

  // Carga inicial de todas as arenas para busca rápida instantânea
  useEffect(() => {
    async function carregarTodasArenas() {
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade, estado')
          .order('nome', { ascending: true });

        if (error) throw error;
        setTodasArenas(data || []);
      } catch (err) {
        console.error('Erro ao listar arenas:', err);
      }
    }

    carregarTodasArenas();
  }, []);

  // Arenas filtradas computadas diretamente durante a renderização (sem setState síncrono em useEffect)
  const termoLimpo = termoBusca.toLowerCase().trim();
  const arenasFiltradas = termoLimpo
    ? todasArenas.filter((arena) => {
        const nomeMatch = arena.nome?.toLowerCase().includes(termoLimpo);
        const cidadeMatch = arena.cidade?.toLowerCase().includes(termoLimpo);
        const estadoMatch = arena.estado?.toLowerCase().includes(termoLimpo);
        return nomeMatch || cidadeMatch || estadoMatch;
      })
    : [];

  // Função para navegar e salvar última arena visitada
  const acessarArena = (arena) => {
    try {
      localStorage.setItem(
        'fox_ultima_arena',
        JSON.stringify({
          id: arena.id,
          nome: arena.nome,
          cidade: arena.cidade,
          estado: arena.estado
        })
      );
    } catch (e) {}
    router.push(`/arena/${arena.id}`);
  };

  // Helper para gerar iniciais limpas de arena
  const getIniciais = (nome) => {
    if (!nome) return 'FX';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  };

  // Carga das cidades para o modal
  useEffect(() => {
    if (!modalAberto) return;

    async function carregarCidadesComArenas() {
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('cidade, estado')
          .not('cidade', 'is', null);

        if (error) throw error;

        const cidadesUnicas = [];
        const mapa = new Set();
        data.forEach((item) => {
          if (item.cidade && item.estado) {
            const chave = `${item.cidade.trim()}-${item.estado.trim()}`;
            if (!mapa.has(chave)) {
              mapa.add(chave);
              cidadesUnicas.push(item);
            }
          }
        });

        setCidadesDisponiveis(cidadesUnicas);
      } catch (err) {
        console.error('Erro ao listar cidades:', err);
      }
    }

    carregarCidadesComArenas();
  }, [modalAberto]);

  // Carga das arenas por cidade (modal)
  useEffect(() => {
    let cancelado = false;
    async function carregarArenasPorCidade() {
      if (!cidadeSelecionada) {
        setArenasDaCidade([]);
        return;
      }
      setCarregandoArenasCidade(true);
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade, estado')
          .eq('cidade', cidadeSelecionada)
          .order('nome', { ascending: true });

        if (error) throw error;
        if (!cancelado) {
          setArenasDaCidade(data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar arenas da cidade:', err);
      } finally {
        if (!cancelado) {
          setCarregandoArenasCidade(false);
        }
      }
    }

    carregarArenasPorCidade();
    return () => {
      cancelado = true;
    };
  }, [cidadeSelecionada]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* LINHAS DE GRADE E AMBIÊNCIA SUTIL */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* NAVBAR */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center z-10 border-b border-zinc-200/80 backdrop-blur-md bg-white/70 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => router.push('/')}>
          <img
            src="/logo-fox.jpeg"
            alt="Logo Fox Replay"
            className="h-9 w-9 object-cover rounded-xl border border-zinc-200 shadow-sm bg-white"
          />
          <h1 className="text-lg font-black tracking-widest uppercase text-zinc-900">
            FOX <span className="text-amber-500">REPLAY</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {lancesFavoritos.length > 0 && (
            <button
              onClick={() => router.push('/perfil')}
              className="text-xs font-bold text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-2 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <IconStar className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30" />
              <span>Meus Lances</span>
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {lancesFavoritos.length}
              </span>
            </button>
          )}

          <button
            onClick={() => router.push('/para-arenas')}
            className="text-xs font-semibold text-zinc-600 hover:text-amber-600 border border-zinc-200 hover:border-amber-400 bg-white px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
          >
            <span>Para Arenas</span>
          </button>

          {usuarioLogado ? (
            <button
              onClick={() => router.push('/perfil')}
              className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-2"
            >
              <span className="w-5 h-5 rounded-md bg-zinc-700 text-amber-400 text-[10px] font-black flex items-center justify-center">
                {getIniciais(usuarioLogado.user_metadata?.nome_completo || usuarioLogado.email)}
              </span>
              <span>Meu Perfil</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/entrar')}
              className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <IconUser className="w-3.5 h-3.5 text-zinc-300" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </header>

      {/* HERO SECTION DO ATLETA */}
      <main className="w-full max-w-4xl mx-auto px-5 text-center py-12 md:py-16 z-10 flex-1 flex flex-col justify-center space-y-10">
        <div className="space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200/90 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">
              Fox Replay • Monitoramento de Quadras
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none max-w-3xl mx-auto text-zinc-900 uppercase">
            Encontre os lances <br />
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-amber-500 bg-clip-text text-transparent">
              Da sua partida
            </span>
          </h2>

          <p className="text-zinc-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Busque a sua arena, selecione a quadra e o horário do seu jogo para assistir e baixar seus melhores momentos em alta definição.
          </p>
        </div>

        {/* ATALHO 1-TOQUE: ÚLTIMA ARENA VISITADA */}
        {ultimaArena && (
          <div className="w-full max-w-md mx-auto animate-fadeIn">
            <div
              onClick={() => router.push(`/arena/${ultimaArena.id}`)}
              className="bg-white/95 border border-zinc-200 hover:border-amber-500/60 rounded-2xl p-4 flex items-center justify-between text-left cursor-pointer transition-all shadow-sm hover:shadow-md group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center text-xs font-black tracking-wider border border-zinc-800 shadow-xs">
                  {getIniciais(ultimaArena.nome)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
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
              <span className="text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:border-amber-500 transition-all shadow-xs flex items-center gap-1.5">
                <span>Entrar</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* BARRA DE BUSCA RÁPIDA INSTANTÂNEA */}
        <div className="w-full max-w-md mx-auto relative z-20">
          <div className="relative">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite o nome do complexo ou da cidade..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm font-medium shadow-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <IconSearch className="w-4 h-4" />
            </span>
            {termoBusca && (
              <button
                onClick={() => setTermoBusca('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                title="Limpar busca"
              >
                <IconX className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* LISTA DE SUGESTÕES DA BUSCA INSTANTÂNEA */}
          {termoBusca.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto z-30 divide-y divide-zinc-100 text-left animate-fadeIn">
              {arenasFiltradas.length === 0 ? (
                <div className="p-5 text-center text-zinc-500 text-xs font-medium space-y-2">
                  <p>Nenhuma arena encontrada para &quot;{termoBusca}&quot;.</p>
                  <button
                    onClick={() => setModalAberto(true)}
                    className="text-amber-600 font-bold hover:underline text-xs inline-flex items-center gap-1"
                  >
                    <span>Ver lista completa por cidades</span>
                    <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                arenasFiltradas.map((arena) => (
                  <div
                    key={arena.id}
                    onClick={() => acessarArena(arena)}
                    className="p-3.5 hover:bg-zinc-50 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-amber-100 text-zinc-700 group-hover:text-amber-800 flex items-center justify-center text-[11px] font-black tracking-wider transition-colors">
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
                      <IconArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Opção secundária: abrir por cidades */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={() => setModalAberto(true)}
              className="text-[11px] font-semibold text-zinc-500 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <span>Ou explorar por lista de cidades</span>
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3 ETAPAS DE UTILIDADE ESPORTIVA */}
        <div className="w-full max-w-4xl mx-auto animate-fadeIn min-h-[160px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">
                  01
                </span>
                <IconRadio className="w-4 h-4 text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 text-xs sm:text-sm tracking-tight">
                Gravação na Quadra
              </h4>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">
                Ao terminar um ponto marcante, acione o botão físico no totem da quadra para salvar os últimos 30 segundos.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">
                  02
                </span>
                <IconSliders className="w-4 h-4 text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 text-xs sm:text-sm tracking-tight">
                Localização Imediata
              </h4>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">
                Filtre pela sua quadra e faixa de horário para encontrar a jogada sem precisar vasculhar horas de gravação.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">
                  03
                </span>
                <IconDownload className="w-4 h-4 text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 text-xs sm:text-sm tracking-tight">
                Download Gratuito
              </h4>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">
                Assista ao vídeo em alta definição e baixe direto no seu celular para arquivar ou compartilhar nas redes.
              </p>
            </div>
          </div>
        </div>

        {/* CALL-TO-ACTION INSTITUCIONAL PARA GESTORES */}
        <div className="w-full max-w-xl mx-auto pt-2">
          <div
            onClick={() => router.push('/para-arenas')}
            className="bg-white hover:bg-zinc-50 border border-zinc-300/90 p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center shrink-0">
                <IconBuilding className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                  Gestor de Complexo Esportivo?
                </h4>
                <p className="text-[11px] text-zinc-500 font-normal">
                  Conheça nossa infraestrutura autônoma de gravação e oportunidades de monetização.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-900 transition-colors pl-3 shrink-0 flex items-center gap-1">
              <span>Saiba mais</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-200 py-6 text-center z-10 bg-white space-y-2">
        <p className="text-[11px] text-zinc-500 tracking-wider uppercase font-semibold">
          © {new Date().getFullYear()} FOX REPLAY • TECNOLOGIA DE MONITORAMENTO ESPORTIVO
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
          <button
            onClick={() => router.push('/login')}
            className="hover:text-zinc-700 transition-colors underline font-medium"
          >
            Acesso da Arena • Painel do Gestor
          </button>
          <span>•</span>
          <button
            onClick={() => router.push('/para-arenas')}
            className="hover:text-zinc-700 transition-colors"
          >
            Seja uma Arena Parceira
          </button>
        </div>
      </footer>

      {/* MODAL DE SELEÇÃO POR CIDADE */}
      {modalAberto && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-[400px] space-y-5 relative shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconMapPin className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-950">
                  Selecionar Complexo
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
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
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 font-semibold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="" className="text-zinc-400">
                    Selecione o município...
                  </option>
                  {cidadesDisponiveis.map((c, i) => (
                    <option key={i} value={c.cidade} className="text-zinc-800">
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

                  {carregandoArenasCidade ? (
                    <div className="p-4 text-center text-xs text-amber-600 font-bold animate-pulse">
                      Carregando...
                    </div>
                  ) : arenasDaCidade.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 font-medium px-1 py-2">
                      Nenhum complexo ativo nesta área.
                    </p>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl max-h-[180px] overflow-y-auto divide-y divide-zinc-200/60 shadow-inner">
                      {arenasDaCidade.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setModalAberto(false);
                            acessarArena(item);
                          }}
                          className="px-4 py-3 text-xs text-zinc-700 font-bold hover:bg-white hover:text-amber-600 cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-zinc-200 text-zinc-700 text-[9px] font-black flex items-center justify-center">
                              {getIniciais(item.nome)}
                            </span>
                            <span>{item.nome}</span>
                          </div>
                          <span className="text-zinc-400 group-hover:text-amber-600 text-[11px] font-medium transition-colors flex items-center gap-1">
                            <span>Entrar</span>
                            <IconArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE MEUS LANCES FAVORITOS */}
      {modalFavoritosAberto && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-[440px] space-y-4 relative shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconStar className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-950">
                  Meus Lances Salvos ({lancesFavoritos.length})
                </h3>
              </div>
              <button
                onClick={() => setModalFavoritosAberto(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs bg-zinc-50 border border-zinc-200 w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 font-normal leading-relaxed">
              Estes são os lances que você marcou como favoritos neste aparelho. Clique em qualquer um para assistir ou baixar.
            </p>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100">
              {lancesFavoritos.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-8">Nenhum lance salvo ainda.</p>
              ) : (
                lancesFavoritos.map((lance) => {
                  const dataLance = lance.criadoEm ? new Date(lance.criadoEm) : null;
                  const hora = dataLance
                    ? dataLance.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  const dia = dataLance ? dataLance.toLocaleDateString('pt-BR') : '';

                  return (
                    <div
                      key={lance.id}
                      onClick={() => {
                        setModalFavoritosAberto(false);
                        router.push(`/jogada?id=${lance.id}`);
                      }}
                      className="p-3 bg-zinc-50 hover:bg-amber-50/50 rounded-xl border border-zinc-200/80 cursor-pointer transition-all flex items-center justify-between group pt-3"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {lance.nomeQuadra}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-800 uppercase group-hover:text-amber-600 transition-colors">
                          {lance.nomeArena}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5">
                          <IconCalendar className="w-3 h-3 text-zinc-400" />
                          <span>{dia}</span>
                          {hora && (
                            <>
                              <IconClock className="w-3 h-3 text-zinc-400 ml-1" />
                              <span>{hora}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all flex items-center gap-1">
                        <span>Assistir</span>
                        <IconArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-between items-center text-[11px]">
              <button
                onClick={() => {
                  localStorage.removeItem('fox_lances_salvos');
                  setLancesFavoritos([]);
                  setModalFavoritosAberto(false);
                }}
                className="text-red-500 hover:underline font-semibold text-[11px]"
              >
                Limpar lista
              </button>
              <span className="text-zinc-400 text-[10px] flex items-center gap-1">
                <IconShield className="w-3 h-3 text-zinc-400" />
                <span>Salvo localmente neste navegador</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
