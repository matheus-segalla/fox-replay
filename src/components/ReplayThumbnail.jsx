'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Renderiza miniatura ultra-leve de replay sem sobrecarregar decodificadores ou tráfego de vídeo:
 * - Se houver `thumbnailUrl`, exibe a imagem JPEG leve (~25KB) com lazy loading nativo.
 * - Se não houver `thumbnailUrl` (replays legados ou sem imagem gerada), exibe um poster
 *   esportivo elegante em SVG/CSS, ELIMINANDO completamente o carregamento de arquivos MP4
 *   pesados na listagem de lances e poupando megabytes de transferência/egress do servidor.
 */
export default function ReplayThumbnail({ thumbnailUrl, alt = 'Miniatura do lance' }) {
  return (
    <div className="w-full h-full relative bg-zinc-950 overflow-hidden select-none">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          unoptimized
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        /* Poster esportivo estilizado sem consumo de banda de vídeo */
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4 text-center">
          {/* Textura de fundo e linhas geométricas de quadra */}
          <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          
          {/* Marca d'água sutil Fox Replay */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 opacity-60 group-hover:opacity-85 transition-opacity">
            <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
              FOX <span className="text-amber-500">REPLAY</span>
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              Vídeo HD 30s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
