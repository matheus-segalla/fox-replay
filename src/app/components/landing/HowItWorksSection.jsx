'use client';

import React, { useEffect, useRef, useState } from 'react';

const IconButtonPress = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" className="stroke-[#FF9900]" />
    <path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2" />
  </svg>
);

const IconLocate = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    <circle cx="10.5" cy="10.5" r="6.5" />
    <circle cx="10.5" cy="10.5" r="2" className="stroke-[#FF9900]" />
  </svg>
);

const IconShareReplay = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4" className="stroke-[#FF9900]" />
  </svg>
);

const ETAPAS = [
  {
    numero: '01',
    titulo: 'APERTE',
    descricao:
      'O jogador aperta o botão físico instalado na quadra após a jogada.',
    Icon: IconButtonPress,
    visual: (
      <div className="mt-3 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-[#FF9900] flex items-center justify-center ring-2 ring-[#FF9900]/20 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
          </span>
          <span className="text-[10px] font-mono font-bold uppercase text-[#111111] truncate">
            TOTEM &bull; CLIPE SALVO
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7EBD7] text-[#111111] shrink-0">
          30s
        </span>
      </div>
    ),
  },
  {
    numero: '02',
    titulo: 'LOCALIZE',
    descricao:
      'Acesse a plataforma e encontre a gravação da sua arena.',
    Icon: IconLocate,
    visual: (
      <div className="mt-3 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] px-3 py-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#68666B]">
          <span>QUADRA 02</span>
          <span className="text-[#FF9900] font-bold">19:42</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#EAE8E5] overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-[#111111]" />
        </div>
      </div>
    ),
  },
  {
    numero: '03',
    titulo: 'REVIVA',
    descricao:
      'Visualize, baixe e compartilhe seu melhor momento.',
    Icon: IconShareReplay,
    visual: (
      <div className="mt-3 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-[#111111] text-[#FCFBF9] text-[9px] font-bold shrink-0">
            HD
          </span>
          <span className="text-[11px] font-semibold text-[#111111] truncate">
            Pronto para Stories
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider shrink-0">
          Download
        </span>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 border-t border-[#EAE8E5]"
    >
      <div className="max-w-2xl mb-8 sm:mb-10 space-y-2">
        <span className="inline-block text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#FF9900]">
          COMO FUNCIONA
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-[#111111] leading-[1.05]">
          DO PONTO À REPLAY. SIMPLES ASSIM.
        </h2>
      </div>

      <div className="relative">
        {/* Conexão visual discreta entre as etapas no desktop */}
        <div
          className="hidden md:block absolute top-1/2 left-12 right-12 h-px bg-[#EAE8E5] -translate-y-1/2 pointer-events-none z-0"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 relative z-10">
          {ETAPAS.map((etapa, idx) => {
            const Icon = etapa.Icon;
            return (
              <div key={etapa.numero} className="relative">
                {/* Conector vertical discreto entre cards no mobile */}
                {idx < ETAPAS.length - 1 && (
                  <div
                    className="md:hidden absolute left-7 -bottom-4 w-px h-4 bg-[#EAE8E5] pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                <div
                  style={{ transitionDelay: `${idx * 70}ms` }}
                  className={`reveal-on-scroll rounded-2xl bg-white border border-[#EAE8E5] p-4 sm:p-5 min-h-[180px] flex flex-col justify-between transition-all duration-500 hover:border-[#FF9900]/60 ${
                    visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tighter text-[#111111]/15 leading-none select-none">
                          {etapa.numero}
                        </span>
                        <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-[#111111]">
                          {etapa.titulo}
                        </h3>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-[#FCFBF9] border border-[#EAE8E5] flex items-center justify-center text-[#111111] shrink-0">
                        <Icon />
                      </div>
                    </div>

                    <p className="text-xs sm:text-[13px] text-[#68666B] leading-snug">
                      {etapa.descricao}
                    </p>
                  </div>

                  {etapa.visual}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
