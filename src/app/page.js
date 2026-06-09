'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [tabAtiva, setTabAtiva] = useState('atleta'); 

  // Estados para o funil de localização geográfica
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [arenasDaCidade, setArenasDaCidade] = useState([]);
  const [carregandoArenas, setCarregandoArenas] = useState(false);

  // Carga das cidades ativas
  useEffect(() => {
    if (!modalAberto) {
      setCidadeSelecionada('');
      setArenasDaCidade([]);
      return;
    }

    async function carregarCidadesComArenas() {
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('cidade, estado')
          .not('cidade', 'is', null);

        if (error) throw error;

        // Removendo duplicatas locais de forma limpa em JavaScript
        const cidadesUnicas = [];
        const mapa = new Set();
        
        data.forEach(item => {
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

  // Carga das arenas por cidade
  useEffect(() => {
    if (!cidadeSelecionada) {
      setArenasDaCidade([]);
      return;
    }

    async function carregarArenasPorCidade() {
      setCarregandoArenas(true);
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade')
          .eq('cidade', cidadeSelecionada)
          .order('nome', { ascending: true });

        if (error) throw error;
        setArenasDaCidade(data || []);
      } catch (err) {
        console.error('Erro ao buscar arenas da cidade:', err);
      } finally {
        setCarregandoArenas(false);
      }
    }

    carregarArenasPorCidade();
  }, [cidadeSelecionada]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-white relative overflow-hidden flex flex-col justify-between">

      {/* 🌐 LINHAS DE GRADE E GLOWS AMBIENTAIS (Efeito Supabase Tech) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />

      {/* 🦊 NAVBAR CLEAN COM LOGO EM ALTO RELEVO */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center z-10 border-b border-zinc-200/80 backdrop-blur-md bg-white/60 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3 select-none">
          <img 
            src="/logo-fox.jpeg" 
            alt="Logo Fox Replay" 
            className="h-9 w-9 object-cover rounded-xl border border-zinc-200 shadow-sm bg-white"
          />
          <h1 className="text-lg font-black tracking-widest uppercase text-zinc-900">
            FOX <span className="text-amber-500">REPLAY</span>
          </h1>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-xs font-bold border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
        >
          Painel do Gestor 🔑
        </button>
      </header>

      {/* HERO SECTION MODELO COM FLUIDEZ DE ESCALA */}
      <main className="w-full max-w-5xl mx-auto px-6 text-center py-16 md:py-20 z-10 flex-1 flex flex-col justify-center space-y-12">
        
          <div className="space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Tecnologia Inteligente para Quadras</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-4xl mx-auto text-zinc-900 uppercase">
            A emoção da sua jogada <br />
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-amber-500 bg-clip-text text-transparent">
              Salva direto no celular
            </span>
          </h2>

          <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Esqueça câmeras complexas. Pressione o botão físico na quadra após um grande lance e faça o download do replay em alta definição na hora.
          </p>
        </div>

        {/* 🎛️ TAB TOGGLE ULTRA-FLUIDO ESTILO SUPABASE */}
        <div className="bg-zinc-200/60 p-1 rounded-2xl border border-zinc-200 w-full max-w-xs mx-auto grid grid-cols-2 shadow-inner z-10 relative">
          <button
            onClick={() => setTabAtiva('atleta')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-300 ${
              tabAtiva === 'atleta'
                ? 'bg-white text-zinc-950 shadow-md font-black'
                : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
            }`}
          >
            🎾 Jogadores
          </button>
          <button
            onClick={() => setTabAtiva('gestor')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-300 ${
              tabAtiva === 'gestor'
                ? 'bg-white text-zinc-950 shadow-md font-black'
                : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
            }`}
          >
            🏢 Complexos
          </button>
        </div>

        {/* ⚡ GRID DO CONTEÚDO EM FORMATO BENTO BOX */}
        <div className="w-full max-w-4xl mx-auto animate-fadeIn min-h-[240px] space-y-10">
          {tabAtiva === 'atleta' ? (
            <div className="space-y-10">
              <button
                onClick={() => setModalAberto(true)}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
              >
                <span>🎥 Encontrar Minha Arena & Ver Clips</span>
                <span>➔</span>
              </button>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-amber-500/30 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm group-hover:bg-amber-500 group-hover:text-white transition-all">1</div>
                  <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Dê o Show</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">Faça aquele ponto incrível na partida. O sistema mantém tudo gravado continuamente na memória local.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-amber-500/30 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm group-hover:bg-amber-500 group-hover:text-white transition-all">2</div>
                  <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Aperte o Botão</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">Basta apertar o botão físico instalado na grade da quadra para que o Raspberry recorte os últimos 15 segundos.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-amber-500/30 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm group-hover:bg-amber-500 group-hover:text-white transition-all">3</div>
                  <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Salve na Galeria</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">Escaneie o QR Code no balcão, entre no menu da sua quadra e baixe o vídeo mp4 pronto para postar nas redes.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <button
                onClick={() => router.push('/cadastro')}
                className="px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
              >
                <span>🚀 Cadastrar Nosso Complexo Grátis</span>
                <span>➔</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-zinc-400 transition-all">
                  <div className="text-amber-500 text-xl font-bold">🎾</div>
                  <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Experiência Diferenciada</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">Ofereça um atrativo tecnológico de ponta que valoriza o jogo dos mensalistas e eleva o nível estrutural do seu complexo.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-zinc-400 transition-all">
                  <div className="text-amber-500 text-xl font-bold">📢</div>
                  <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Marketing Spontâneo</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">Os jogadores compartilham seus lances marcando o perfil da sua arena no Instagram, gerando divulgação contínua e orgânica.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-zinc-400 transition-all">
                  <div className="text-amber-500 text-xl font-bold">⚙️</div>
                  <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Painel Multi-Tenant</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">Controle dezenas de quadras, franquias, totens locais e histórico de replays através de uma interface integrada de alta performance.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-200 py-5 text-center z-10 bg-white shadow-inner">
        <p className="text-[10px] text-zinc-400 tracking-widest uppercase font-bold">
          © {new Date().getFullYear()} FOX REPLAY • Tecnologia de Monitoramento Esportivo
        </p>
      </footer>

      {/* 🌟 MODAL SUPABASE STYLE COM FUNIL DE SELEÇÃO GEOGRÁFICA 🌟 */}
      {modalAberto && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-[400px] space-y-5 relative shadow-2xl">
            
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-950">🎥 Acessar Vídeos</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors text-xs bg-zinc-50 border border-zinc-200 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Selecione o município em que você jogou para filtrar os complexos esportivos parceiros daquela região.
            </p>

            <div className="space-y-4">
              {/* PASSO 1: CIDADE */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest">Cidade do Jogo</label>
                <select
                  value={cidadeSelecionada}
                  onChange={(e) => setCidadeSelecionada(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                >
                  <option value="" className="text-zinc-400">Selecione o município...</option>
                  {cidadesDisponiveis.map((c, i) => (
                    <option key={i} value={c.cidade} className="text-zinc-800">
                      📍 {c.cidade} ({c.estado.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* PASSO 2: ARENAS DISPONÍVEIS */}
              {cidadeSelecionada && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest">Selecione a Arena</label>
                  
                  {carregandoArenas ? (
                    <div className="p-4 text-center text-xs text-amber-500 font-bold animate-pulse">Sincronizando bancos de dados...</div>
                  ) : arenasDaCidade.length === 0 ? (
                    <p className="text-[10px] text-red-500 font-bold px-1">Nenhum complexo ativo nesta área hoje.</p>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-zinc-200/60 shadow-inner">
                      {arenasDaCidade.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setModalAberto(false);
                            router.push(`/arena/${item.id}`); 
                          }}
                          className="px-4 py-3 text-xs text-zinc-700 font-bold hover:bg-white hover:text-amber-500 cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <span>🏢 {item.nome}</span>
                          <span className="text-zinc-400 group-hover:text-amber-500 text-[11px] font-medium transition-colors">Entrar ➔</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-[9px] text-zinc-400 text-center uppercase tracking-widest font-bold pt-1 border-t border-zinc-100">
              Filtro Geográfico Reduzido Ativo ⚡
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
