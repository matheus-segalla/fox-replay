'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  // Estados para busca rápida instantânea
  const [todasArenas, setTodasArenas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [arenasFiltradas, setArenasFiltradas] = useState([]);
  const [carregandoBusca, setCarregandoBusca] = useState(true);
  const [ultimaArena, setUltimaArena] = useState(null);
  const [lancesFavoritos, setLancesFavoritos] = useState([]);
  const [modalFavoritosAberto, setModalFavoritosAberto] = useState(false);

  // Estados para o funil por cidades (modal secundário)
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [arenasDaCidade, setArenasDaCidade] = useState([]);
  const [carregandoArenasCidade, setCarregandoArenasCidade] = useState(false);

  // Carrega última arena e lances salvos do localStorage
  useEffect(() => {
    try {
      const salvo = localStorage.getItem('fox_ultima_arena');
      if (salvo) {
        setUltimaArena(JSON.parse(salvo));
      }
      const favoritosSalvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
      setLancesFavoritos(favoritosSalvos);
    } catch (e) {
      console.warn('Erro ao ler dados locais:', e);
    }
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
      } finally {
        setCarregandoBusca(false);
      }
    }

    carregarTodasArenas();
  }, []);

  // Filtra arenas instantaneamente conforme o usuário digita
  useEffect(() => {
    if (!termoBusca.trim()) {
      setArenasFiltradas([]);
      return;
    }

    const termo = termoBusca.toLowerCase().trim();
    const filtradas = todasArenas.filter((arena) => {
      const nomeMatch = arena.nome?.toLowerCase().includes(termo);
      const cidadeMatch = arena.cidade?.toLowerCase().includes(termo);
      const estadoMatch = arena.estado?.toLowerCase().includes(termo);
      return nomeMatch || cidadeMatch || estadoMatch;
    });

    setArenasFiltradas(filtradas);
  }, [termoBusca, todasArenas]);

  // Função para navegar e salvar última arena visitada
  const acessarArena = (arena) => {
    try {
      localStorage.setItem('fox_ultima_arena', JSON.stringify({
        id: arena.id,
        nome: arena.nome,
        cidade: arena.cidade,
        estado: arena.estado
      }));
    } catch (e) {}
    router.push(`/arena/${arena.id}`);
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
    if (!cidadeSelecionada) {
      setArenasDaCidade([]);
      return;
    }

    async function carregarArenasPorCidade() {
      setCarregandoArenasCidade(true);
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade, estado')
          .eq('cidade', cidadeSelecionada)
          .order('nome', { ascending: true });

        if (error) throw error;
        setArenasDaCidade(data || []);
      } catch (err) {
        console.error('Erro ao buscar arenas da cidade:', err);
      } finally {
        setCarregandoArenasCidade(false);
      }
    }

    carregarArenasPorCidade();
  }, [cidadeSelecionada]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* 🌐 LINHAS DE GRADE E GLOWS AMBIENTAIS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />

      {/* 🦊 NAVBAR */}
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
              onClick={() => setModalFavoritosAberto(true)}
              className="text-xs font-black text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>★ Meus Lances</span>
              <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {lancesFavoritos.length}
              </span>
            </button>
          )}

          <button
            onClick={() => router.push('/para-arenas')}
            className="text-xs font-bold text-zinc-600 hover:text-amber-600 border border-zinc-200 hover:border-amber-400 bg-white px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            🏢 Para Arenas
          </button>
          <button
            onClick={() => router.push('/login')}
            className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 hidden sm:inline-block"
          >
            Painel do Gestor 🔑
          </button>
        </div>
      </header>

      {/* HERO SECTION DO ATLETA (100% FOCADA EM RAPIDEZ E ATLETA) */}
      <main className="w-full max-w-4xl mx-auto px-5 text-center py-12 md:py-16 z-10 flex-1 flex flex-col justify-center space-y-10">
        <div className="space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">
              Câmeras e Totens Gravando Ao Vivo
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none max-w-3xl mx-auto text-zinc-900 uppercase">
            Sua grande jogada <br />
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-amber-500 bg-clip-text text-transparent">
              Na sua galeria em segundos
            </span>
          </h2>

          <p className="text-zinc-500 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
            Aperte o botão físico na quadra e baixe seu replay instantaneamente pelo celular com filtros de horário e data. Sem burocracia.
          </p>
        </div>

        {/* 🚀 ATALHO 1-TOQUE: ÚLTIMA ARENA VISITADA */}
        {ultimaArena && (
          <div className="w-full max-w-md mx-auto animate-fadeIn">
            <div
              onClick={() => router.push(`/arena/${ultimaArena.id}`)}
              className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-left cursor-pointer hover:border-amber-500 transition-all shadow-sm group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-md">
                  🎾
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    Continuar de onde parou
                  </span>
                  <h4 className="text-sm font-black text-zinc-900 group-hover:text-amber-600 transition-colors">
                    {ultimaArena.nome}
                  </h4>
                  {ultimaArena.cidade && (
                    <p className="text-[11px] text-zinc-400 font-medium">
                      📍 {ultimaArena.cidade} {ultimaArena.estado ? `(${ultimaArena.estado})` : ''}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-black text-amber-600 bg-white border border-amber-500/20 px-3 py-1.5 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                Entrar ➔
              </span>
            </div>
          </div>
        )}

        {/* 🔍 BARRA DE BUSCA RÁPIDA INSTANTÂNEA */}
        <div className="w-full max-w-md mx-auto relative z-20">
          <div className="relative">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite o nome da sua Arena ou Cidade..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border-2 border-zinc-200/90 text-zinc-800 placeholder-zinc-400 text-xs sm:text-sm font-bold shadow-lg shadow-zinc-200/50 transition-all focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-base">
              🔍
            </span>
            {termoBusca && (
              <button
                onClick={() => setTermoBusca('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs bg-zinc-100 rounded-full w-5 h-5 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* LISTA DE SUGESTÕES DA BUSCA INSTANTÂNEA */}
          {termoBusca.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-30 divide-y divide-zinc-100 text-left animate-fadeIn">
              {arenasFiltradas.length === 0 ? (
                <div className="p-5 text-center text-zinc-400 text-xs font-medium space-y-2">
                  <p>Nenhuma arena encontrada com "{termoBusca}".</p>
                  <button
                    onClick={() => setModalAberto(true)}
                    className="text-amber-600 font-bold hover:underline text-xs"
                  >
                    Ver todas as cidades disponíveis ➔
                  </button>
                </div>
              ) : (
                arenasFiltradas.map((arena) => (
                  <div
                    key={arena.id}
                    onClick={() => acessarArena(arena)}
                    className="p-3.5 hover:bg-amber-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-amber-100 text-zinc-700 group-hover:text-amber-700 flex items-center justify-center text-sm font-bold transition-colors">
                        🏟️
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 group-hover:text-amber-600 transition-colors uppercase">
                          {arena.nome}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-semibold">
                          📍 {arena.cidade || 'Localização não informada'} {arena.estado ? `• ${arena.estado}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-zinc-400 group-hover:text-amber-600 transition-colors">
                      Ver Clips ➔
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
              className="text-[11px] font-bold text-zinc-500 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <span>Ou filtrar por Lista de Cidades</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* ⚡ BENTO CARDS DE VANTAGENS DO ATLETA */}
        <div className="w-full max-w-4xl mx-auto animate-fadeIn min-h-[160px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2.5 shadow-sm hover:border-amber-500/40 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs group-hover:bg-amber-500 group-hover:text-white transition-all">
                1
              </div>
              <h4 className="font-bold text-zinc-900 text-xs sm:text-sm uppercase tracking-wide">
                Aperte o Botão
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                Fez aquele ace ou ponto épico? Pressione o botão físico no totem da quadra.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2.5 shadow-sm hover:border-amber-500/40 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs group-hover:bg-amber-500 group-hover:text-white transition-all">
                2
              </div>
              <h4 className="font-bold text-zinc-900 text-xs sm:text-sm uppercase tracking-wide">
                Filtre por Horário
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                Selecione sua quadra e a faixa de horário em que jogou para achar o replay em segundos.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2.5 shadow-sm hover:border-amber-500/40 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs group-hover:bg-amber-500 group-hover:text-white transition-all">
                3
              </div>
              <h4 className="font-bold text-zinc-900 text-xs sm:text-sm uppercase tracking-wide">
                Baixe na Galeria
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                Faça o download do vídeo em alta definição com 1 toque e poste nos Stories do Instagram.
              </p>
            </div>
          </div>
        </div>

        {/* 🏢 CALL-TO-ACTION PARA DONOS DE COMPLEXOS */}
        <div className="w-full max-w-xl mx-auto pt-4">
          <div
            onClick={() => router.push('/para-arenas')}
            className="bg-zinc-900 hover:bg-zinc-800 text-white p-4 rounded-2xl border border-zinc-800 shadow-md flex items-center justify-between cursor-pointer transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-2xl">🏢</span>
              <div>
                <h4 className="text-xs font-black uppercase text-amber-400 group-hover:text-amber-300 transition-colors">
                  Você é dono ou gestor de arena?
                </h4>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Instale nosso totem na sua quadra e fature com cotas de patrocínio nos vídeos.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors pl-2">
              Conhecer ➔
            </span>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-200 py-5 text-center z-10 bg-white shadow-inner">
        <p className="text-[10px] text-zinc-400 tracking-widest uppercase font-bold">
          © {new Date().getFullYear()} FOX REPLAY • Tecnologia de Monitoramento Esportivo
        </p>
      </footer>

      {/* 🌟 MODAL DE SELEÇÃO POR CIDADE 🌟 */}
      {modalAberto && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-[400px] space-y-5 relative shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-950">
                🎥 Selecionar Complexo
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors text-xs bg-zinc-50 border border-zinc-200 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                  1. Cidade do Jogo
                </label>
                <select
                  value={cidadeSelecionada}
                  onChange={(e) => setCidadeSelecionada(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                >
                  <option value="" className="text-zinc-400">
                    Selecione o município...
                  </option>
                  {cidadesDisponiveis.map((c, i) => (
                    <option key={i} value={c.cidade} className="text-zinc-800">
                      📍 {c.cidade} ({c.estado.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {cidadeSelecionada && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                    2. Arenas Parceiras
                  </label>

                  {carregandoArenasCidade ? (
                    <div className="p-4 text-center text-xs text-amber-500 font-bold animate-pulse">
                      Carregando...
                    </div>
                  ) : arenasDaCidade.length === 0 ? (
                    <p className="text-[10px] text-red-500 font-bold px-1">
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
                          <span>🏢 {item.nome}</span>
                          <span className="text-zinc-400 group-hover:text-amber-500 text-[11px] font-medium transition-colors">
                            Entrar ➔
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

      {/* 🌟 MODAL DE MEUS LANCES FAVORITOS 🌟 */}
      {modalFavoritosAberto && (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-[440px] space-y-4 relative shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-950">
                  Meus Lances Salvos ({lancesFavoritos.length})
                </h3>
              </div>
              <button
                onClick={() => setModalFavoritosAberto(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs bg-zinc-50 border border-zinc-200 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Estes são os lances que você marcou como favoritos neste celular. Clique em qualquer um para assistir ou baixar.
            </p>

            <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-zinc-100">
              {lancesFavoritos.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-8">Nenhum lance salvo ainda.</p>
              ) : (
                lancesFavoritos.map((lance) => {
                  const dataLance = lance.criadoEm ? new Date(lance.criadoEm) : null;
                  const hora = dataLance ? dataLance.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                  const dia = dataLance ? dataLance.toLocaleDateString('pt-BR') : '';

                  return (
                    <div
                      key={lance.id}
                      onClick={() => {
                        setModalFavoritosAberto(false);
                        router.push(`/jogada?id=${lance.id}`);
                      }}
                      className="p-3 bg-zinc-50 hover:bg-amber-50/60 rounded-xl border border-zinc-200/80 cursor-pointer transition-all flex items-center justify-between group pt-3"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">
                          {lance.nomeQuadra}
                        </span>
                        <h4 className="text-xs font-black text-zinc-800 uppercase group-hover:text-amber-600 transition-colors">
                          {lance.nomeArena}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          📅 {dia} {hora ? `às ${hora}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-black text-amber-600 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                        Assistir ➔
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
                className="text-red-500 hover:underline font-bold text-[10px]"
              >
                Limpar lista
              </button>
              <span className="text-zinc-400 text-[10px]">Salvo localmente no seu aparelho</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
