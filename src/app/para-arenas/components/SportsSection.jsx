'use client';

import React from 'react';

const MODALIDADES = [
    {
        nome: 'Beach Tennis',
        subtitulo: 'A Febre das Quadras de Areia',
        descricao: 'Ralis velozes, smashes explosivos e defesas reflexas. A modalidade perfeita para capturar a vibração dos atletas e a comemoração imediata com a dupla.',
        badge: 'Topologia Validada',
        icone: '🎾'
    },
    {
        nome: 'Futevôlei',
        subtitulo: 'Plástica, Ataque e Habilidade',
        descricao: 'Tubarões, defesas no peito e pontos disputados na fita. Uma das modalidades que mais gera conteúdos virais e compartilhamentos orgânicos nas redes.',
        badge: 'Em Expansão',
        icone: '⚽'
    },
    {
        nome: 'Vôlei de Areia',
        subtitulo: 'Potência e Trabalho em Equipe',
        descricao: 'Bloqueios na rede, aces precisos e levantamentos no milímetro. Ideal para competições locais, torneios de fim de semana e clínicas de treinamento.',
        badge: 'Em Expansão',
        icone: '🏐'
    },
    {
        nome: 'Tênis Tradicional',
        subtitulo: 'Velocidade e Precisão Técnica',
        descricao: 'Passadas na paralela, saques angulados e rallys intensos de fundo de quadra. Captação ampla que permite tanto diversão quanto revisão técnica de jogadas.',
        badge: 'Sob Avaliação',
        icone: '🎾'
    }
];

export default function SportsSection() {
    return (
        <section id="modalidades" className="scroll-mt-28 space-y-12">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Multimodalidade
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    Uma solução para <br />
                    <span className="text-zinc-400">diferentes esportes.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Começamos onde a comunidade mais vibra e estamos expandindo a tecnologia para múltiplos esportes de quadra e areia.
                </p>
            </div>

            {/* GRID DAS MODALIDADES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {MODALIDADES.map((m) => (
                    <div
                        key={m.nome}
                        className="glass-card-dark rounded-3xl p-6 space-y-4 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{m.icone}</span>
                                <span className="text-[9px] font-mono font-bold uppercase bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-zinc-400">
                                    {m.badge}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-base font-black text-white uppercase">
                                    {m.nome}
                                </h3>
                                <p className="text-[11px] font-semibold text-amber-400/90 mt-0.5">
                                    {m.subtitulo}
                                </p>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {m.descricao}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-500 uppercase">
                            Captação com ângulo amplo
                        </div>
                    </div>
                ))}
            </div>

            {/* BOX DE TRANSPARÊNCIA E AVALIAÇÃO TÉCNICA */}
            <div className="glass-card-dark rounded-2xl p-6 sm:p-7 max-w-3xl mx-auto border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">
                        Diagnóstico Personalizado por Modalidade
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                        Cada modalidade possui dinâmicas, distâncias de rede e velocidades de bola próprias. Nossa equipe avalia a estrutura e as particularidades da sua operação para definir o posicionamento exato da câmera e do acionador.
                    </p>
                </div>
            </div>
        </section>
    );
}
