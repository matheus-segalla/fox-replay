'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReplayThumbnail from '@/components/ReplayThumbnail';
import { IconDownload, IconShare, IconPlay, IconRefresh } from '@/components/icons';

function IconClock({ className = 'w-3 h-3' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconVideoOff({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 5 3V5l-5 3" />
      <rect width="14" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}

export default function ArenaReplaysGrid({
  feedTopRef,
  carregandoReplays,
  replaysFiltrados,
  redefinirFiltros,
  abrirDownloadComMarcas,
  compartilharLance,
  totalPaginas,
  paginaAtual,
  tamanhoPagina,
  totalReplays,
  paginasVisiveis,
  mudarPagina,
}) {
  const router = useRouter();
  const [abrindoReplayId, setAbrindoReplayId] = useState(null);

  return (
    <div ref={feedTopRef} className="space-y-5 scroll-mt-4">
      {carregandoReplays ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="animate-pulse text-zinc-400 font-bold text-xs uppercase tracking-wider">
            Carregando replays...
          </p>
        </div>
      ) : replaysFiltrados.length === 0 ? (
        <div className="max-w-xl mx-auto bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <IconVideoOff className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
            Nenhum lance gravado
          </h4>
          <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
            Não encontramos vídeos nesta quadra com o filtro selecionado. Tente selecionar &quot;Todos&quot; ou outra data.
          </p>
          <button
            onClick={redefinirFiltros}
            className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <IconRefresh className="w-3.5 h-3.5" />
            <span>Redefinir Filtros</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {replaysFiltrados.map((replay) => {
            const dataLance = replay.criado_em ? new Date(replay.criado_em) : null;
            const horarioFormatado = dataLance
              ? dataLance.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : 'Recente';

            const nomeQuadra = replay.quadras?.nome || 'Quadra';

            return (
              <div
                key={replay.id}
                onClick={() => {
                  setAbrindoReplayId(replay.id);
                  router.push(`/jogada?id=${replay.id}`);
                }}
                className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-md shadow-zinc-200/30 flex flex-col group cursor-pointer active:scale-[0.99] ${
                  abrindoReplayId === replay.id
                    ? 'border-[#FF9900] ring-2 ring-[#FF9900]/30 opacity-85'
                    : 'border-zinc-200/90 hover:border-amber-400'
                }`}
              >
                <div className="p-3.5 pb-2.5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {nomeQuadra}
                  </span>
                  <span className="text-xs font-bold text-zinc-700 tracking-wide flex items-center gap-1">
                    <IconClock className="w-3 h-3 text-zinc-400" />
                    <span>{horarioFormatado}</span>
                  </span>
                </div>

                <div className="w-full aspect-video bg-black relative overflow-hidden group">
                  <ReplayThumbnail
                    thumbnailUrl={replay.thumbnail_url}
                    alt={`Lance na ${nomeQuadra} às ${horarioFormatado}`}
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-all group-hover:bg-black/10 pointer-events-none">
                    {abrindoReplayId === replay.id ? (
                      <div className="w-11 h-11 rounded-full bg-black/75 border border-[#FF9900] flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black flex items-center justify-center pl-0.5 font-bold shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                        <IconPlay className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-white grid grid-cols-2 gap-2 border-t border-zinc-100">
                  <button
                    onClick={(e) => abrirDownloadComMarcas(e, replay.id)}
                    title="Baixar vídeo 9:16 com marca da arena e patrocinadores"
                    className="py-3 px-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                  >
                    <span>Baixar</span>
                    <IconDownload className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => compartilharLance(e, replay.id, nomeQuadra)}
                    className="py-3 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                  >
                    <span>Compartilhar</span>
                    <IconShare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!carregandoReplays && totalPaginas > 1 && (
        <div className="pt-3 flex flex-col items-center gap-2.5">
          <p className="text-[11px] text-zinc-500 font-medium">
            Mostrando {(paginaAtual - 1) * tamanhoPagina + 1}–{Math.min(paginaAtual * tamanhoPagina, totalReplays)} de {totalReplays} lances
          </p>

          <nav aria-label="Paginação de lances" className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              disabled={paginaAtual <= 1}
              onClick={() => mudarPagina(paginaAtual - 1)}
              className="h-9 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ‹ Anterior
            </button>

            {paginasVisiveis.map((item, idx) =>
              item === '...' ? (
                <span key={`dots-${idx}`} className="px-1.5 text-xs text-zinc-400 font-bold select-none">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => mudarPagina(item)}
                  aria-current={paginaAtual === item ? 'page' : undefined}
                  className={`h-9 min-w-[36px] px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border ${
                    paginaAtual === item
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => mudarPagina(paginaAtual + 1)}
              className="h-9 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Próxima ›
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
