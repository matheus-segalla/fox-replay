'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [tabAtiva, setTabAtiva] = useState('atleta'); // 🚀 NOVO: Estado para alternador fluido de público-alvo

  // Estados para a busca em tempo real de Arenas
  const [busca, setBusca] = useState('');
  const [arenasEncontradas, setArenasEncontradas] = useState([]);
  const [carregandoArenas, setCarregandoArenas] = useState(false);

  // Efeito de busca dinâmica com debounce
  useEffect(() => {
    if (!modalAberto) {
      setBusca('');
      setArenasEncontradas([]);
      return;
    }

    const efetuaremBusca = async () => {
      if (!busca.trim()) {
        setArenasEncontradas([]);
        return;
      }

      setCarregandoArenas(true);
      try {
        const { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade, estado')
          .or(`nome.ilike.%${busca}%,cidade.ilike.%${busca}%`)
          .limit(5);

        if (error) throw error;
        setArenasEncontradas(data || []);
      } catch (err) {
        console.error('Erro ao buscar arenas:', err);
      } finally {
        setCarregandoArenas(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      efetuaremBusca();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [busca, modalAberto]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (arenasEncontradas.length > 0) {
      router.push(`/arena/${arenasEncontradas[0].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-white font-sans selection:bg-gold selection:text-black relative overflow-hidden flex flex-col justify-between">

      {/* Detalhes de luz de fundo futurista (Glows de Elite) */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[130px] pointer-events-none" />

      {/* 🦊 HEADER / NAVBAR REMODELADA COM A LOGO METÁLICA OFICIAL */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex justify-between items-center z-10 border-b border-border-card/40 backdrop-blur-md bg-bg-main/20 sticky top-0">
        <div className="flex items-center gap-3 select-none">
          <img 
            src="/logo-fox.jpeg" 
            alt="Logo Fox Replay" 
            className="h-9 w-9 object-cover rounded-xl border border-border-card bg-neutral-900 shadow-md"
          />
          <h1 className="text-xl font-black tracking-widest uppercase">
            FOX <span className="text-gold">REPLAY</span>
          </h1>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-xs font-black tracking-wider uppercase border border-border-card bg-bg-card hover:border-gold/40 hover:text-gold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md"
        >
          Acesso Administrativo 🔑
        </button>
      </header>

      {/* HERO SECTION DE ALTO IMPACTO */}
      <main className="w-full max-w-5xl mx-auto px-6 text-center py-12 md:py-16 z-10 flex-1 flex flex-col justify-center space-y-10">
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-bg-card border border-border-card px-3 py-1.5 rounded-full shadow-inner animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-silver">O Futuro das Quadras Esportivas</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-4xl mx-auto uppercase">
            O Replay do Seu Melhor Lance <br />
            <span className="bg-gradient-to-r from-white via-silver to-gold bg-clip-text text-transparent">
              Instantâneo no Celular
            </span>
          </h2>

          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            A tecnologia que transforma complexos esportivos em arenas digitais conectadas. Salve e compartilhe suas grandes jogadas instantaneamente com um clique.
          </p>
        </div>

        {/* 🎛️ NOVO: TAB SYSTEM FLUIDO DE DUPLO DIRECIONAMENTO DE OBJETIVOS */}
        <div className="bg-bg-card p-1.5 rounded-2xl border border-border-card w-full max-w-md mx-auto grid grid-cols-2 shadow-inner z-10 relative">
          <button
            onClick={() => setTabAtiva('atleta')}
            className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              tabAtiva === 'atleta'
                ? 'bg-gold text-black shadow-lg shadow-gold-glow/20 font-black'
                : 'text-gray-400 hover:text-white bg-transparent'
            }`}
          >
            🎾 Sou Atleta
          </button>
          <button
            onClick={() => setTabAtiva('gestor')}
            className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              tabAtiva === 'gestor'
                ? 'bg-gold text-black shadow-lg shadow-gold-glow/20 font-black'
                : 'text-gray-400 hover:text-white bg-transparent'
            }`}
          >
            🏢 Sou Gestor de Arena
          </button>
        </div>

        {/* ⚡ CONTEÚDO DINÂMICO DA ABA SELECIONADA (EXPLICAÇÕES OBJETIVAS E DIRETAS) */}
        <div className="w-full max-w-4xl mx-auto animate-fadeIn min-h-[200px]">
          {tabAtiva === 'atleta' ? (
            <div className="space-y-8">
              {/* Botão de ação rápido */}
              <button
                onClick={() => setModalAberto(true)}
                className="px-10 py-4 bg-gold hover:bg-gold-dark text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-gold-glow/10 hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
              >
                <span>🎥 Acessar Meus Clips Agora</span>
                <span className="font-sans">➔</span>
              </button>

              {/* Grid explicativo simplificado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-6">
                <div className="bg-bg-card/40 backdrop-blur-sm border border-border-card/60 hover:border-gold/20 rounded-2xl p-5 space-y-2.5 transition-all hover:scale-[1.01] group">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-black text-sm group-hover:bg-gold group-hover:text-black transition-colors">1</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Faça a Jogada</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Jogue normalmente na quadra. Fez um ponto sensacional ou golaço? O show começou.</p>
                </div>
                <div className="bg-bg-card/40 backdrop-blur-sm border border-border-card/60 hover:border-gold/20 rounded-2xl p-5 space-y-2.5 transition-all hover:scale-[1.01] group">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-black text-sm group-hover:bg-gold group-hover:text-black transition-colors">2</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Aperte o Botão</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Vá até o Totem físico na lateral da quadra e clique no botão para cortar retroativamente os últimos 15s.</p>
                </div>
                <div className="bg-bg-card/40 backdrop-blur-sm border border-border-card/60 hover:border-gold/20 rounded-2xl p-5 space-y-2.5 transition-all hover:scale-[1.01] group">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-black text-sm group-hover:bg-gold group-hover:text-black transition-colors">3</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Escanear & Salvar</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Abra a câmera do celular no QR Code da recepção, encontre seu take pelo horário e salve direto na galeria.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Botão de ação rápido */}
              <button
                onClick={() => router.push('/cadastro')}
                className="px-10 py-4 bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
              >
                <span>🚀 Cadastrar Minha Arena Grátis</span>
                <span className="font-sans">➔</span>
              </button>

              {/* Grid explicativo simplificado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-6">
                <div className="bg-bg-card/40 backdrop-blur-sm border border-border-card/60 hover:border-gold/20 rounded-2xl p-5 space-y-2.5 transition-all hover:scale-[1.01] group">
                  <div className="text-gold text-xl">✨</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Diferencial de Elite</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Atraia mais clientes e fidelize os jogadores atuais oferecendo uma experiência tecnológica premium que nenhuma outra quadra possui.</p>
                </div>
                <div className="bg-bg-card/40 backdrop-blur-sm border border-border-card/60 hover:border-gold/20 rounded-2xl p-5 space-y-2.5 transition-all hover:scale-[1.01] group">
                  <div className="text-gold text-xl">📈</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Marketing Orgânico</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Os atletas baixam os lances com a marca d'água da sua arena e divulgam o seu complexo de graça nas redes sociais (Instagram/TikTok).</p>
                </div>
                <div className="bg-bg-card/40 backdrop-blur-sm border border-border-card/60 hover:border-gold/20 rounded-2xl p-5 space-y-2.5 transition-all hover:scale-[1.01] group">
                  <div className="text-gold text-xl">📱</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Gestão Multi-Unidades</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Gerencie uma ou dezenas de franquias e totens de hardware centralizados em uma única conta administrativa simples e segura.</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-border-card/60 py-5 text-center z-10 bg-bg-main">
        <p className="text-[10px] text-gray-600 tracking-widest uppercase font-bold">
          © {new Date().getFullYear()} FOX REPLAY • Tecnologia e Performance Esportiva
        </p>
      </footer>

      {/* 🌟 MODAL FLUIDO COM AUTOCOMPLETE INTELIGENTE 🌟 */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-bg-card border-2 border-border-card rounded-2xl p-6 w-full max-w-[400px] space-y-4 relative shadow-2xl">

            <div className="flex justify-between items-center">
              <h3 className="font-black text-base uppercase tracking-wider text-white">🎥 Localizar Meu Complexo</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-500 hover:text-white transition-colors text-sm bg-bg-main border border-border-card w-7 h-7 rounded-lg flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Digite o **nome da arena** ou a **cidade** onde jogou para acessar a galeria de gravações de lances de hoje.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 relative">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Ex: Nome do complexo ou sua Cidade..."
                  className="w-full px-4 py-3.5 rounded-xl bg-bg-main border border-gray-800 text-white placeholder-gray-600 text-xs font-bold focus:outline-none focus:border-gold transition-all"
                />

                {carregandoArenas && (
                  <div className="absolute right-3 top-4 w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* DROPDOWN FLUIDO DE REPETIÇÃO DE RESULTADOS */}
              {arenasEncontradas.length > 0 && (
                <div className="absolute left-0 right-0 top-[50px] bg-bg-main border border-gray-800 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[220px] overflow-y-auto animate-fadeIn">
                  {arenasEncontradas.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setModalAberto(false);
                        router.push(`/arena/${item.id}`); 
                      }}
                      className="px-4 py-3.5 text-xs text-gray-300 hover:bg-bg-card hover:text-gold cursor-pointer transition-colors border-b border-gray-900 last:border-0 flex flex-col gap-0.5"
                    >
                      <span className="font-black text-white group-hover:text-gold">🏢 {item.nome}</span>
                      {item.cidade && (
                        <span className="text-[10px] text-gray-500 font-medium ml-5 flex items-center gap-1">
                          📍 {item.cidade} - {item.estado?.toUpperCase() || 'SP'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {busca.trim() && !carregandoArenas && arenasEncontradas.length === 0 && (
                <p className="text-[10px] text-red-400 font-bold px-1 animate-pulse">Nenhum complexo localizado nesta região.</p>
              )}

              <p className="text-[9px] text-gray-600 text-center uppercase tracking-widest pt-1 font-bold">
                Pressione a sugestão para entrar na hora ⚡
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
