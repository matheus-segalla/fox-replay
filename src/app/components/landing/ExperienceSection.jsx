'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IconPlay, IconPause, IconDownload, IconShare } from '@/components/icons';

export default function ExperienceSection() {
  const [reproduzindo, setReproduzindo] = useState(true);

  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 border-t border-[#EAE8E5]">
      <div className="rounded-[24px] sm:rounded-[32px] bg-[#F7EBD7]/35 border border-[#EAE8E5] p-5 sm:p-10 md:p-14 relative overflow-hidden">
        {/* Geometria de quadra sutil ao fundo do card */}
        <svg
          className="absolute -right-24 -bottom-24 w-[420px] h-[420px] pointer-events-none opacity-60"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="170" stroke="#EAE8E5" strokeWidth="1" />
          <circle cx="200" cy="200" r="120" stroke="#FF9900" strokeOpacity="0.2" strokeWidth="1" />
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          {/* Composição visual do Smartphone */}
          <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[300px] sm:max-w-[320px]">
              {/* Card flutuante de status */}
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-[#EAE8E5] shadow-[0_12px_30px_-12px_rgba(17,17,17,0.12)] absolute -left-10 top-12 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                <div className="text-left">
                  <span className="block text-[10px] font-mono font-bold text-[#111111] uppercase">
                    LANCE SALVO
                  </span>
                  <span className="block text-[10px] text-[#68666B]">
                    Quadra 01 &bull; 1080p
                  </span>
                </div>
              </div>

              {/* Smartphone */}
              <div className="rounded-[34px] bg-[#111111] p-3 border border-[#111111] shadow-[0_28px_60px_-20px_rgba(17,17,17,0.35)]">
                <div className="rounded-[24px] overflow-hidden bg-[#18181b] relative aspect-[9/15] flex flex-col justify-between">
                  <Image
                    src="/images/hero-beach-tennis.jpg"
                    alt="Jogada esportiva em reprodução no celular"
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 280px, 320px"
                    className={`object-cover object-[55%_25%] transition-transform duration-700 ${
                      reproduzindo ? 'scale-105' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/10 to-[#111111]/55" />

                  {/* Topo do player */}
                  <div className="relative z-10 p-4 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest uppercase text-white">
                      FOX <span className="text-[#FF9900]">REPLAY</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-sm">
                      {reproduzindo ? 'REPRODUZINDO' : 'PAUSADO'}
                    </span>
                  </div>

                  {/* Controle central Play/Pause */}
                  <div className="relative z-10 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setReproduzindo((prev) => !prev)}
                      aria-label={reproduzindo ? 'Pausar demonstração' : 'Reproduzir demonstração'}
                      className="w-14 h-14 rounded-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      {reproduzindo ? (
                        <IconPause className="w-5 h-5" />
                      ) : (
                        <IconPlay className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Controles inferiores simulados */}
                  <div className="relative z-10 p-4 space-y-3">
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-[#FF9900] transition-all duration-500 ${
                            reproduzindo ? 'w-3/4' : 'w-1/2'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-white/80">
                        <span>{reproduzindo ? '00:22' : '00:15'}</span>
                        <span>00:30</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-4 py-2.5 rounded-xl bg-white text-[#111111] text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5">
                        <IconDownload className="w-3.5 h-3.5 text-[#FF9900]" />
                        <span>Baixar vídeo</span>
                      </div>
                      <div className="col-span-1 py-2.5 rounded-xl bg-white/15 text-white flex items-center justify-center backdrop-blur-sm">
                        <IconShare className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Texto editorial */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2 text-left">
            <span className="inline-block text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#FF9900]">
              SEU MELHOR MOMENTO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-[#111111] leading-[0.98]">
              JOGUE.
              <span className="block">REVIVA.</span>
              <span className="block text-[#FF9900]">COMPARTILHE.</span>
            </h2>
            <p className="text-[#68666B] text-sm sm:text-base leading-relaxed max-w-md">
              Reviva os momentos mais incríveis da sua partida e compartilhe suas melhores jogadas com quem estava lá.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
              <div className="rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5] p-4">
                <span className="block text-lg font-black text-[#111111]">30s</span>
                <span className="text-xs text-[#68666B]">
                  Recorte imediato do ponto decisivo
                </span>
              </div>
              <div className="rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5] p-4">
                <span className="block text-lg font-black text-[#FF9900]">1080p</span>
                <span className="text-xs text-[#68666B]">
                  Qualidade pronta para redes sociais
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
