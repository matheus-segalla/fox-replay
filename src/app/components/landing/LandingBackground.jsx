'use client';

import React from 'react';

/**
 * Sistema decorativo de fundo em CSS + SVG inline.
 * Base off-white (#FCFBF9), grid ultrafino (#EAE8E5),
 * marcações circulares de quadra e gradientes sutis em bege/laranja.
 */
export default function LandingBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Grid geométrico ultrafino */}
      <div
        className="absolute inset-0 fox-editorial-grid opacity-55"
        style={{
          maskImage:
            'radial-gradient(ellipse 85% 70% at 50% 25%, #000 55%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 70% at 50% 25%, #000 55%, transparent 100%)',
        }}
      />

      {/* Gradientes radiais sutis em bege (#F7EBD7) e laranja suave (#FF9900) */}
      <div
        className="absolute -top-32 right-[-10%] w-[680px] h-[680px] rounded-full opacity-75"
        style={{
          background:
            'radial-gradient(circle, rgba(247, 235, 215, 0.85) 0%, rgba(255, 153, 0, 0.06) 45%, transparent 72%)',
        }}
      />
      <div
        className="absolute top-[42%] -left-40 w-[560px] h-[560px] rounded-full opacity-65"
        style={{
          background:
            'radial-gradient(circle, rgba(247, 235, 215, 0.8) 0%, rgba(255, 153, 0, 0.04) 50%, transparent 75%)',
        }}
      />
      <div
        className="absolute bottom-[-12%] right-[12%] w-[520px] h-[520px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 153, 0, 0.07) 0%, rgba(247, 235, 215, 0.6) 45%, transparent 75%)',
        }}
      />

      {/* Marcações circulares de quadra parcialmente recortadas pelas bordas */}
      <svg
        className="absolute -top-28 -right-28 w-[520px] h-[520px] md:w-[680px] md:h-[680px] opacity-60"
        viewBox="0 0 600 600"
        fill="none"
      >
        <circle cx="300" cy="300" r="245" stroke="#EAE8E5" strokeWidth="1" />
        <circle
          cx="300"
          cy="300"
          r="185"
          stroke="#FF9900"
          strokeOpacity="0.16"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <line x1="55" y1="300" x2="545" y2="300" stroke="#EAE8E5" strokeWidth="0.75" />
        <line x1="120" y1="480" x2="480" y2="120" stroke="#EAE8E5" strokeWidth="0.75" />
      </svg>

      {/* Arco esquerdo inferior sugerindo linha lateral e movimento */}
      <svg
        className="absolute top-[52%] -left-36 w-[440px] h-[440px] md:w-[560px] md:h-[560px] opacity-55"
        viewBox="0 0 500 500"
        fill="none"
      >
        <circle cx="250" cy="250" r="210" stroke="#EAE8E5" strokeWidth="1" />
        <circle
          cx="250"
          cy="250"
          r="150"
          stroke="#F7EBD7"
          strokeWidth="1.5"
        />
        <line x1="60" y1="390" x2="410" y2="110" stroke="#EAE8E5" strokeWidth="0.75" />
      </svg>
    </div>
  );
}
