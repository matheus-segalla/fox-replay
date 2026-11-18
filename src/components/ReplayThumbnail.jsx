'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Renderiza miniatura leve de replay sem sobrecarregar decodificadores de vídeo no mobile:
 * - Se houver `thumbnailUrl`, usa imagem otimizada/lazy (0 decoders de vídeo).
 * - Caso contrário (replays antigos), usa IntersectionObserver para montar `<video>`
 *   apenas enquanto o card estiver próximo da viewport.
 */
export default function ReplayThumbnail({ thumbnailUrl, videoUrl, alt = 'Miniatura do lance' }) {
  const containerRef = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (thumbnailUrl) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisivel(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setVisivel(Boolean(entry?.isIntersecting));
      },
      { rootMargin: '160px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [thumbnailUrl]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-zinc-950">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
        />
      ) : visivel && videoUrl ? (
        <video
          src={videoUrl}
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
          muted
          preload="metadata"
          playsInline
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      )}
    </div>
  );
}
