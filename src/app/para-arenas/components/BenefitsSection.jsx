'use client';

import React from 'react';

const BENEFICIOS = [
    {
        tag: 'Diferenciação',
        titulo: 'Experiência Diferenciada',
        descricao: 'Proporcione algo inédito aos seus clientes. A quadra deixa de ser apenas um espaço de aluguel por hora e vira uma arena conectada de alta tecnologia.',
        destaque: 'Fidelização e atração de novos jogadores',
        icone: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
    {
        tag: 'Marketing Orgânico',
        titulo: 'Mais Compartilhamento',
        descricao: 'Transforme grandes jogadas em conteúdos visuais virais. Os atletas postam nos Stories, marcam a arena e geram visibilidade espontânea contínua.',
        destaque: 'Alcance orgânico nas redes sociais',
        icone: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
        )
    },
    {
        tag: 'Patrimônio & Valor',
        titulo: 'Valorização da Estrutura',
        descricao: 'Agregue valor percebido ao seu complexo esportivo. Arenas equipadas com tecnologia atraem torneios mais relevantes e patrocinadores de maior porte.',
        destaque: 'Aumento do ticket médio e prestígio',
        icone: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        tag: 'Monetização',
        titulo: 'Novas Oportunidades Comerciais',
        descricao: 'Explore possibilidades reais de publicidade e patrocínio local. Insira marcas parceiras da sua arena nas telas de download e no canto das gravações.',
        destaque: 'Nova linha de receita de patrocínio',
        icone: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

export default function BenefitsSection() {
    return (
        <section id="beneficios" className="scroll-mt-28 space-y-12">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Vantagens Estratégicas
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    Sua arena ganha. <br />
                    <span className="text-zinc-400">Seus atletas também.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Mais do que registrar jogadas, o FOX Replay fortalece a comunidade do seu complexo e gera motivos recorrentes para os clientes voltarem.
                </p>
            </div>

            {/* GRID DOS 4 CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BENEFICIOS.map((b) => (
                    <div
                        key={b.titulo}
                        className="glass-card-dark rounded-3xl p-7 sm:p-8 space-y-5 hover:-translate-y-1 transition-all duration-300 border border-white/10 hover:border-amber-500/40 group flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                    {b.tag}
                                </span>
                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/15 group-hover:border-amber-500/30 transition-colors">
                                    {b.icone}
                                </div>
                            </div>

                            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                                {b.titulo}
                            </h3>

                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                                {b.descricao}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-zinc-300">
                            <span className="text-amber-400">✦</span>
                            <span>{b.destaque}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
