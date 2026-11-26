'use client';

import React from 'react';
import EditorialImage from './EditorialImage';

export default function HeroSection() {
    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="pt-8 sm:pt-12 lg:pt-16 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* COLUNA ESQUERDA — EDITORIAL B2B */}
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7EBD7]/80 border border-[#EAE8E5] text-[#111111]">
                        <span className="w-2 h-2 rounded-full bg-[#FF9900]" />
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em]">
                            Tecnologia inteligente para arenas esportivas
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-[#111111] tracking-tight leading-[1.05] uppercase">
                        Transforme sua arena em uma{' '}
                        <span className="text-[#FF9900]">experiência extraordinária.</span>
                    </h1>

                    <p className="text-sm sm:text-base text-[#68666B] leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Ofereça aos seus atletas a possibilidade de reviver seus melhores momentos. Com o FOX Replay, cada grande jogada pode se transformar em uma experiência que continua depois da partida.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => scrollTo('contato')}
                            className="px-6 py-4 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                        >
                            Quero levar o FOX Replay para minha arena
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('como-funciona')}
                            className="px-6 py-4 rounded-xl bg-white hover:bg-[#F7EBD7]/40 text-[#111111] border border-[#EAE8E5] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                        >
                            Ver como funciona
                        </button>
                    </div>

                    {/* 3 DIFERENCIAIS */}
                    <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs font-semibold text-[#111111]">
                        {[
                            'Sem operador dedicado',
                            'Acesso pelo QR Code',
                            'Implantação personalizada',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-[#F7EBD7] text-[#FF9900] flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUNA DIREITA — COMPOSIÇÃO VISUAL CINEMATOGRÁFICA */}
                <div className="lg:col-span-6 relative">
                    <div className="relative rounded-3xl overflow-hidden border border-[#EAE8E5] bg-white p-2 sm:p-3 shadow-[0_20px_50px_-20px_rgba(17,17,17,0.12)]">
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#111111]">
                            <EditorialImage
                                src="/images/para-arenas/hero-arena.jpg"
                                alt="Arena de Beach Tennis equipada com FOX Replay"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25 pointer-events-none" />

                            {/* OVERLAYS DISCRETOS DE TELEMETRIA */}
                            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#EAE8E5] shadow-xs">
                                    <span className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse" />
                                    <span className="text-[10px] font-mono font-extrabold tracking-wider text-[#111111]">
                                        REC &bull; QUADRA 01
                                    </span>
                                </div>
                                <span className="px-3 py-1.5 rounded-full bg-[#111111]/85 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider">
                                    REPLAY 30S
                                </span>
                            </div>

                            {/* MINI MOCKUP DE SMARTPHONE NO CANTO INFERIOR */}
                            <div className="hidden sm:flex absolute bottom-3.5 right-3.5 w-44 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE8E5] p-2.5 shadow-lg flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#111111]">
                                        FOX <span className="text-[#FF9900]">REPLAY</span>
                                    </span>
                                    <span className="text-[9px] font-mono text-[#68666B]">MP4 HD</span>
                                </div>
                                <div className="relative h-20 rounded-xl overflow-hidden bg-[#111111]">
                                    <EditorialImage
                                        src="/images/para-arenas/esporte-beach-tennis.jpg"
                                        alt="Prévia de replay no smartphone"
                                        sizes="180px"
                                        className="object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                        <span className="w-7 h-7 rounded-full bg-[#FF9900] text-[#111111] flex items-center justify-center shadow-sm">
                                            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold text-[#68666B]">
                                    <span>Lance salvo</span>
                                    <span className="text-[#FF9900]">Baixar ↓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
