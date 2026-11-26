'use client';

import React, { useState } from 'react';

const PASSOS = [
    {
        numero: '01',
        titulo: 'GRAVAÇÃO CONTÍNUA',
        resumo: 'A câmera IP mantém os últimos 30 segundos em buffer na memória RAM, sem desperdício de espaço.',
        badge: 'RTSP & Câmeras IP',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        numero: '02',
        titulo: 'ACIONAMENTO FÍSICO',
        resumo: 'O botão instalado na quadra envia o comando de captura no momento exato da comemoração.',
        badge: 'Sem Fio ou Cabo',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
        ),
    },
    {
        numero: '03',
        titulo: 'PROCESSAMENTO',
        resumo: 'O hardware local processa o trecho anterior ao acionamento e gera o arquivo de vídeo otimizado.',
        badge: 'Edge Core Local',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="9" y="9" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 2v2m0 16v2M2 15h2m16 0h2M2 9h2m16 0h2M9 2v2m0 16v2" />
            </svg>
        ),
    },
    {
        numero: '04',
        titulo: 'ACESSO AO REPLAY',
        resumo: 'O atleta utiliza o QR Code da quadra para acessar, assistir e baixar o vídeo pelo navegador.',
        badge: 'Zero Apps',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        ),
    },
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

        setTimeout(() => setPassoAtivo(2), 650);
        setTimeout(() => setPassoAtivo(3), 1400);
        setTimeout(() => {
            setPassoAtivo(4);
            setSimulando(false);
            setSimulacaoConcluida(true);
        }, 2200);
    };

    return (
        <section id="como-funciona" className="scroll-mt-24 space-y-10">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Arquitetura e Fluxo
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    Tecnologia inteligente.{' '}
                    <span className="text-[#FF9900]">Experiência simples.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                    Seu cliente só precisa apertar um botão. Toda a tecnologia trabalha nos bastidores.
                </p>
            </div>

            {/* DIAGRAMA CONECTADO DAS 4 ETAPAS */}
            <div className="relative">
                {/* Linha conectora no desktop */}
                <div className="hidden lg:block absolute top-11 left-[12%] right-[12%] h-px bg-[#EAE8E5] z-0" aria-hidden="true" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {PASSOS.map((passo, idx) => {
                        const ativo = passoAtivo === idx + 1;
                        return (
                            <button
                                type="button"
                                key={passo.numero}
                                onClick={() => setPassoAtivo(idx + 1)}
                                className={`text-left rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 bg-white border ${
                                    ativo
                                        ? 'border-[#FF9900] shadow-[0_12px_30px_-12px_rgba(255,153,0,0.28)] -translate-y-0.5'
                                        : 'border-[#EAE8E5] hover:border-[#FF9900]/45'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-black ${ativo ? 'text-[#FF9900]' : 'text-[#68666B]'}`}>
                                            {ativo && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />}
                                            {passo.numero}
                                        </span>
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                                ativo
                                                    ? 'bg-[#FF9900] text-[#111111]'
                                                    : 'bg-[#FCFBF9] border border-[#EAE8E5] text-[#68666B]'
                                            }`}
                                        >
                                            {passo.icone}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-xs sm:text-sm text-[#111111] uppercase tracking-wide">
                                        {passo.numero} — {passo.titulo}
                                    </h3>
                                    <p className="text-xs text-[#68666B] leading-relaxed font-normal">
                                        {passo.resumo}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-[#EAE8E5]">
                                    <span className="text-[10px] font-mono font-semibold text-[#68666B] uppercase">
                                        {passo.badge}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SIMULADOR INTERATIVO DISCRETO E INTUITIVO */}
            <div className="bg-white border border-[#EAE8E5] rounded-3xl p-5 sm:p-7 max-w-3xl mx-auto shadow-[0_12px_36px_-18px_rgba(17,17,17,0.08)]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="space-y-1.5 text-center sm:text-left">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF9900]">
                            Simulador Interativo
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-[#111111] uppercase">
                            Teste o acionamento em 1 clique
                        </h4>
                        <p className="text-xs text-[#68666B] max-w-md">
                            Veja na prática como os 4 estágios acima funcionam do momento em que o atleta aperta o botão até o QR Code.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={dispararSimulacao}
                        disabled={simulando}
                        className={`shrink-0 px-5 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
                            simulando
                                ? 'bg-[#F7EBD7] text-[#111111] cursor-wait'
                                : 'bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] shadow-xs active:scale-[0.98]'
                        }`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${simulando ? 'bg-[#FF9900] animate-ping' : 'bg-[#111111]'}`} />
                        <span>{simulando ? 'Processando Take 30s...' : 'Simular Acionamento'}</span>
                    </button>
                </div>

                {/* Barra de progresso do simulador */}
                <div className="mt-5 pt-4 border-t border-[#EAE8E5] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((num) => (
                            <span
                                key={num}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    passoAtivo >= num ? 'w-8 bg-[#FF9900]' : 'w-4 bg-[#EAE8E5]'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-[#68666B]">
                        {simulando
                            ? `Etapa 0${passoAtivo} em execução...`
                            : simulacaoConcluida
                            ? 'Replay de 30s pronto para acesso via QR Code!'
                            : `Etapa 0${passoAtivo} selecionada`}
                    </span>
                </div>
            </div>
        </section>
    );
}
