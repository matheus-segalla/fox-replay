'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [arenaIdInput, setArenaIdInput] = useState('');

  const buscarArenaEIr = (e) => {
    e.preventDefault();
    if (arenaIdInput.trim()) {
      router.push(`/arena/${arenaIdInput.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-white font-sans selection:bg-gold selection:text-black relative overflow-hidden flex flex-col justify-between">

      {/* Detalhes de luz de fundo (Glows estilo Tech) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER / NAVBAR COMPACTA */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <h1 className="text-xl font-black tracking-widest">
          FOX <span className="text-gold">REPLAY</span>
        </h1>
        <button
          onClick={() => router.push('/login')}
          className="text-xs font-bold border border-border-card bg-bg-card hover:border-silver/40 px-4 py-2 rounded-xl transition-all"
        >
          Painel do Dono 🔑
        </button>
      </header>

      {/* HERO SECTION (Apresentação de Impacto) */}
      <main className="w-full max-w-4xl mx-auto px-6 text-center py-12 md:py-20 z-10 my-auto space-y-8">

        <div className="inline-flex items-center gap-2 bg-bg-card border border-border-card px-3 py-1.5 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-silver">O Futuro dos Complexos Esportivos</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-3xl mx-auto">
          O REPLAY DA SUA JOGADA <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-white via-silver to-gold bg-clip-text text-transparent">
            DIRETO NO SEU CELULAR
          </span>
        </h2>

        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          O sistema inteligente que grava, costura e disponibiliza seus melhores lances instantaneamente. Um botão físico na quadra, um QR Code no balcão da arena, a gravação na sua galeria.
        </p>

        {/* BOTÕES DE AÇÃO PRINCIPAIS */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">

          {/* Botão Jogador */}
          <button
            onClick={() => setModalAberto(true)}
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-border-card hover:border-gold/40 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 group bg-bg-card"
          >
            <span>🎥 Ver Meus Clips</span>
            <span className="text-gray-500 group-hover:text-gold transition-colors">➔</span>
          </button>

          {/* Botão Dono de Arena */}
          <button
            onClick={() => router.push('/cadastro')}
            className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-dark text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-gold-glow flex items-center justify-center gap-2"
          >
            <span>🚀 Tenho uma Arena</span>
          </button>

        </div>

        {/* RECURSOS / PROPOSTA EM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-2">
            <div className="text-xl">🔘</div>
            <h4 className="font-bold text-white text-sm">Gravação Retroativa</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Fez um golaço ou um smash incrível? Aperte o botão e o sistema recupera os últimos segundos da câmera automaticamente.</p>
          </div>

          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-2">
            <div className="text-xl">☁️</div>
            <h4 className="font-bold text-white text-sm">Nuvem Instantânea</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Vídeos processados locais e enviados via HTTP de alta velocidade direto para os servidores para não gerar delay no seu jogo.</p>
          </div>

          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-2">
            <div className="text-xl">📱</div>
            <h4 className="font-bold text-white text-sm">Hub da Arena Exclusivo</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Um único QR Code na recepção abre a lista de quadras e os lances organizados por horário. É só clicar e baixar na galeria.</p>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-border-card/60 py-6 text-center z-10 bg-bg-main">
        <p className="text-[10px] text-gray-600 tracking-widest uppercase">
          © {new Date().getFullYear()} FOX REPLAY • Todos os direitos reservados
        </p>
      </footer>

      {/* MODAL INTERATIVO PARA ENTRAR NO HUB DE UMA ARENA */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-card rounded-2xl p-6 w-full max-w-[400px] space-y-4 animate-fadeIn">

            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-white">Buscar Arena</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Digite o código identificador (ID da Arena) para acessar a lista de quadras e assistir aos vídeos clipados.
            </p>

            <form onSubmit={buscarArenaEIr} className="space-y-3">
              <input
                type="text"
                required
                value={arenaIdInput}
                onChange={(e) => setArenaIdInput(e.target.value)}
                placeholder="Cole o ID da Arena aqui..."
                className="w-full px-4 py-3 rounded-xl bg-bg-main border border-gray-800 text-white placeholder-gray-600 text-xs font-mono focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gold hover:bg-gold-dark text-black font-black text-xs rounded-xl transition-all"
              >
                Acessar Vídeos ➔
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}