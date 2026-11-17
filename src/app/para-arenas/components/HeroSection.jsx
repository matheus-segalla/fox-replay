'use client';

import React from 'react';

export default function HeroSection() {
    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 text-center max-w-4xl mx-auto space-y-8 z-10">
            {/* BADGE EYEBROW */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-amber-400">
                    Tecnologia Inteligente para Arenas Esportivas
                </span>
            </div>

            {/* HEADLINE PRINCIPAL */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[0.94] select-none">
                <span className="block text-white">CADA GRANDE JOGADA</span>
                <span className="block text-stroke-gold mt-2">MERECE SER REVIVIDA.</span>
            </h1>

            {/* SUBTÍTULO COMERCIAL E POSICIONAMENTO */}
            <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
                O <strong className="text-white font-bold">FOX Replay</strong> transforma quadras esportivas em experiências conectadas. Com apenas um toque, seus atletas registram os últimos 30 segundos da partida, acessam o replay pelo celular e compartilham seus melhores momentos.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                    onClick={() => scrollTo('contato')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                    <span>Quero Levar o Fox Replay para Minha Arena</span>
                    <span className="font-bold">↗</span>
                </button>
                <button
                    onClick={() => scrollTo('como-funciona')}
                    className="w-full sm:w-auto px-7 py-4 glass-card-dark hover:bg-white/5 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/10 hover:border-white/25 transition-all text-center cursor-pointer"
                >
                    Ver Como Funciona
                </button>
            </div>

            {/* MICROTEXTOS DE CONFIANÇA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto border-t border-white/10 text-xs text-zinc-400 font-medium">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>Sem operador dedicado</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>Acesso instantâneo via QR Code</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>Implantação personalizada</span>
                </div>
            </div>
        </section>
    );
}
