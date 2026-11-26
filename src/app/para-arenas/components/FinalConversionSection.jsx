'use client';

import React from 'react';
import EditorialImage from './EditorialImage';

export default function FinalConversionSection() {
    const scrollToContato = () => {
        const el = document.getElementById('contato');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="scroll-mt-24">
            <div className="relative rounded-3xl overflow-hidden border border-[#EAE8E5] bg-white p-6 sm:p-10 lg:p-12 shadow-[0_16px_45px_-20px_rgba(17,17,17,0.08)]">
                {/* Círculo geométrico decorativo sutil */}
                <div
                    className="pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full border border-[#EAE8E5] bg-[#F7EBD7]/40"
                    aria-hidden="true"
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                        <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                            Próximo Passo
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                            Sua arena está pronta para o{' '}
                            <span className="text-[#FF9900]">próximo nível?</span>
                        </h2>
                        <p className="text-xs sm:text-base text-[#68666B] leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Descubra como o FOX Replay pode transformar a experiência dos seus atletas.
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={scrollToContato}
                                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                            >
                                Solicitar diagnóstico da minha arena
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#EAE8E5] bg-[#111111]">
                            <EditorialImage
                                src="/images/para-arenas/cta-final-arena.jpg"
                                alt="Complexo esportivo com quadras iluminadas"
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
