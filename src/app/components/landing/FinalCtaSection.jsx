'use client';

import React from 'react';
import Link from 'next/link';

const IconArrowRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function FinalCtaSection({ onEncontrarArenaClick }) {
  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-14 pt-6 md:pb-24">
      <div className="rounded-[24px] sm:rounded-[32px] bg-white border border-[#EAE8E5] px-5 py-10 sm:px-12 sm:py-16 text-center relative overflow-hidden">
        {/* Linhas circulares sutis */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-65"
          viewBox="0 0 800 320"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="400" cy="160" r="220" stroke="#EAE8E5" strokeWidth="1" />
          <circle
            cx="400"
            cy="160"
            r="160"
            stroke="#FF9900"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
        </svg>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="inline-block text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#FF9900]">
            PRONTO PARA REVIVER
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-[#111111] leading-[0.98]">
            QUAL FOI SEU MELHOR LANCE HOJE?
          </h2>
          <p className="text-[#68666B] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Encontre sua arena e reviva os momentos que fizeram a diferença.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onEncontrarArenaClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-sm tracking-wide transition-all cursor-pointer active:scale-[0.98] shadow-[0_10px_25px_-10px_rgba(255,153,0,0.6)]"
            >
              <span>Encontrar minha arena</span>
              <IconArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/para-arenas"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#FCFBF9] hover:bg-[#F7EBD7]/60 text-[#111111] border border-[#EAE8E5] font-semibold text-xs sm:text-sm transition-all"
            >
              <span>Sou gestor de arena</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
