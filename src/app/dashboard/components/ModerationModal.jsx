'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import ReplayThumbnail from '@/components/ReplayThumbnail';
import { IconTrash } from '@/components/icons';

export default function ModerationModal({
  quadraSelecionada,
  onClose,
  filtroDiasModeracao,
  onMudarFiltroDias,
  carregandoReplays,
  replaysQuadra,
  urlBaseSistema,
  excluindoReplayId,
  onExcluirReplay,
}) {
  if (!quadraSelecionada) return null;

  return (
    <div
      className="fixed inset-0 bg-zinc-950/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-2xl max-h-[85dvh] flex flex-col shadow-2xl overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-zinc-200 pb-4 mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
              Moderação de Gravações &bull;{' '}
              <span className="text-amber-600">{quadraSelecionada.nome}</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Visualize ou exclua permanentemente qualquer replay desta quadra (LGPD).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onMudarFiltroDias('1')}
                className={`px-3 py-1.5 rounded-md cursor-pointer min-h-[36px] active:scale-95 transition-all ${
                  filtroDiasModeracao === '1' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => onMudarFiltroDias('5')}
                className={`px-3 py-1.5 rounded-md cursor-pointer min-h-[36px] active:scale-95 transition-all ${
                  filtroDiasModeracao === '5' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                }`}
              >
                Últimos 5 dias
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center text-xs cursor-pointer active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {carregandoReplays ? (
            <p className="text-center text-xs text-zinc-400 py-10 animate-pulse">
              Carregando gravações...
            </p>
          ) : replaysQuadra.length === 0 ? (
            <p className="text-center text-xs text-zinc-500 py-10">
              Nenhum replay encontrado neste período para esta quadra.
            </p>
          ) : (
            replaysQuadra.map((replay) => {
              const dt = new Date(replay.criado_em);
              const dataStr = dt.toLocaleDateString('pt-BR');
              const horaStr = dt.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;

              return (
                <div
                  key={replay.id}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-zinc-200">
                      <ReplayThumbnail
                        thumbnailUrl={replay.thumbnail_url}
                        videoUrl={replay.video_url}
                        alt={`Replay ${dataStr} ${horaStr}`}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900">
                        {dataStr} às {horaStr}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {replay.visualizacoes || 0} views &bull; {replay.downloads || 0} downloads
                      </p>
                      <a
                        href={linkJogador}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-600 hover:underline font-bold inline-block"
                      >
                        Abrir Página do Atleta ➔
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <div className="bg-white p-1.5 rounded-lg border border-zinc-200">
                      <QRCodeSVG value={linkJogador} size={42} />
                    </div>
                    <button
                      type="button"
                      disabled={excluindoReplayId === replay.id}
                      onClick={() => onExcluirReplay(replay)}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Excluir vídeo permanentemente"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                      <span>{excluindoReplayId === replay.id ? '...' : 'Excluir'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
