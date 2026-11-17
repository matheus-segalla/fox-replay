'use client';

import React, { useState } from 'react';

const PASSOS = [
    {
        numero: '01',
        titulo: 'Gravação Contínua',
        resumo: 'A câmera IP Full HD monitora a quadra continuamente mantendo os últimos 30 segundos em buffer na memória RAM, sem salvar horas inúteis de vídeo em disco.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        badge: 'RTSP & Câmeras IP'
    },
    {
        numero: '02',
        titulo: 'Toque no Botão da Quadra',
        resumo: 'Ao fazer uma grande jogada, o atleta só precisa apertar o botão de acionamento tátil instalado na grade ou no totem da quadra.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
        ),
        badge: '433MHz Sem Fio ou Cabo'
    },
    {
        numero: '03',
        titulo: 'Recorte dos Últimos 30s',
        resumo: 'O hardware local processa instantaneamente o take anterior ao clique, comprimindo o vídeo em formato MP4 otimizado para celulares.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="9" y="9" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 2v2m0 16v2M2 15h2m16 0h2M2 9h2m16 0h2M9 2v2m0 16v2" />
            </svg>
        ),
        badge: 'Processamento Edge Core'
    },
    {
        numero: '04',
        titulo: 'Acesso pelo QR Code',
        resumo: 'O atleta aponta a câmera do celular para a placa com o QR Code na quadra e assiste ou baixa o replay instantaneamente no rolo da câmera.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        ),
        badge: 'Zero Apps para Instalar'
    }
];

export default function HowItWorksSection() {
    const [passoAtivo, setPassoAtivo] = useState(1);
    const [simulando, setSimulando] = useState(false);
    const [simulacaoConcluida, setSimulacaoConcluida] = useState(false);

    const dispararSimulacao = () => {
        if (simulando) return;
        setSimulando(true);
        setSimulacaoConcluida(false);
        setPassoAtivo(1);

        setTimeout(() => setPassoAtivo(2), 700);
        setTimeout(() => setPassoAtivo(3), 1500);
        setTimeout(() => {
            setPassoAtivo(4);
            setSimulando(false);
            setSimulacaoConcluida(true);
        }, 2400);
    };

    return (
        <section id="como-funciona" className="scroll-mt-28 space-y-12">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Arquitetura e Fluxo
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    Tecnologia simples para uma <br />
                    <span className="text-zinc-400">experiência extraordinária.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    O jogador não precisa entender de cabos, buffers ou nuvem. Só precisa apertar o botão quando fizer um ponto espetacular.
                </p>
            </div>

            {/* GRID DAS 4 ETAPAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PASSOS.map((passo, idx) => {
                    const ativo = passoAtivo === idx + 1;
                    return (
                        <div
                            key={passo.numero}
                            onClick={() => setPassoAtivo(idx + 1)}
                            className={`rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                                ativo
                                    ? 'glass-card-dark border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)] -translate-y-1'
                                    : 'bg-white/[0.02] border border-white/5 hover:border-white/15'
                            }`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-mono font-black ${ativo ? 'text-amber-400' : 'text-zinc-500'}`}>
                                        PASSO {passo.numero}
                                    </span>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        ativo ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-zinc-400'
                                    }`}>
                                        {passo.icone}
                                    </div>
                                </div>
                                <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                                    {passo.titulo}
                                </h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {passo.resumo}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                    {passo.badge}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DEMONSTRAÇÃO INTERATIVA DO FLUXO DO REPLAY */}
            <div className="glass-card-dark rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto border border-white/10 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                            Simulador Interativo
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-white uppercase">
                            Veja o Acionamento em Ação
                        </h4>
                        <p className="text-xs text-zinc-400 max-w-md">
                            Clique no botão para simular o atleta apertando o botão na quadra e o sistema gerando o replay de 30 segundos.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={dispararSimulacao}
                            disabled={simulando}
                            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg active:scale-95 cursor-pointer ${
                                simulando
                                    ? 'bg-amber-500/50 text-zinc-950 cursor-wait'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                            }`}
                        >
                            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                            <span>{simulando ? 'Processando Take 30s...' : 'Apertar Botão da Quadra'}</span>
                        </button>
                        {simulacaoConcluida && (
                            <span className="text-[11px] font-mono text-emerald-400 animate-fade-in flex items-center gap-1">
                                <span>✓</span> Replay pronto para escaneamento!
                            </span>
                        )}
                    </div>
                </div>

                {/* VISUALIZAÇÃO DE STATUS DA SIMULAÇÃO */}
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-4 gap-2 text-center">
                    <div className={`p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                        passoAtivo >= 1 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold' : 'border-white/5 text-zinc-500'
                    }`}>
                        1. Buffer IP
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                        passoAtivo >= 2 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold' : 'border-white/5 text-zinc-500'
                    }`}>
                        2. Pulso 433MHz
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                        passoAtivo >= 3 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold' : 'border-white/5 text-zinc-500'
                    }`}>
                        3. Render MP4
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                        passoAtivo >= 4 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold' : 'border-white/5 text-zinc-500'
                    }`}>
                        4. QR Code Ativo
                    </div>
                </div>
            </div>
        </section>
    );
}
