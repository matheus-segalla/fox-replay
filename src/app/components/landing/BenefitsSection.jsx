'use client';

import React from 'react';

const IconCamera = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="3" y="6" width="14" height="12" rx="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 10l4-2.5v9L17 14" className="stroke-[#FF9900]" />
  </svg>
);

const IconClock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" className="stroke-[#FF9900]" />
  </svg>
);

const IconDownloadShare = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4" className="stroke-[#FF9900]" />
  </svg>
);

const IconArenaLink = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.686-7-12a7 7 0 1114 0c0 6.314-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" className="stroke-[#FF9900]" />
  </svg>
);

const BENEFICIOS = [
  {
    titulo: 'Seus melhores momentos registrados.',
    descricao:
      'Cada ponto marcante salvo na hora pelo botão físico instalado na quadra.',
    Icon: IconCamera,
  },
  {
    titulo: 'Acesso simples às gravações.',
    descricao:
      'Encontre sua arena, filtre por quadra e horário e assista em poucos segundos.',
    Icon: IconClock,
  },
  {
    titulo: 'Download e compartilhamento.',
    descricao:
      'Baixe o vídeo direto no celular e publique seus lances com os amigos.',
    Icon: IconDownloadShare,
  },
  {
    titulo: 'Experiência conectada à sua arena.',
    descricao:
      'Plataforma integrada às quadras parceiras com acesso rápido pelo navegador.',
    Icon: IconArenaLink,
  },
];

export default function BenefitsSection() {
  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 border-t border-[#EAE8E5]">
      <div className="max-w-2xl mb-8 sm:mb-10 space-y-2">
        <span className="inline-block text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#FF9900]">
          POR QUE USAR
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-[#111111] leading-[1.05]">
          A EXPERIÊNCIA NÃO TERMINA QUANDO O PONTO ACABA.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BENEFICIOS.map((item) => {
          const Icon = item.Icon;
          return (
            <div
              key={item.titulo}
              className="rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5] p-6 space-y-4 transition-colors duration-200 hover:border-[#FF9900]/60 hover:bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE8E5] flex items-center justify-center text-[#111111]">
                <Icon />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-[#111111] leading-snug">
                  {item.titulo}
                </h3>
                <p className="text-xs text-[#68666B] leading-relaxed">
                  {item.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
