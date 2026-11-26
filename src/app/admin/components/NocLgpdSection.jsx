'use client';

import React from 'react';

export default function NocLgpdSection({
  lgpdReplayId,
  setLgpdReplayId,
  lgpdBuscando,
  lgpdResultado,
  lgpdExcluindo,
  onBuscar,
  onExcluir,
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-200 truncate">
            Central LGPD &bull; Moderação por UUID
          </span>
        </div>

        <form onSubmit={onBuscar} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={lgpdReplayId}
            onChange={(e) => setLgpdReplayId(e.target.value)}
            placeholder="Cole o ID do replay (UUID)..."
            className="flex-1 sm:w-64 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={lgpdBuscando}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer disabled:opacity-50 shrink-0"
          >
            {lgpdBuscando ? 'Buscando...' : 'Localizar'}
          </button>
        </form>
      </div>

      {lgpdResultado && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4 min-w-0">
            <video
              src={lgpdResultado.video_url}
              controls
              muted
              className="w-36 aspect-video rounded-lg bg-black border border-zinc-800 shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                {lgpdResultado.quadras?.arenas?.nome || 'Arena'} &bull;{' '}
                {lgpdResultado.quadras?.nome || 'Quadra'}
              </span>
              <p className="text-xs text-zinc-300 font-mono truncate">ID: {lgpdResultado.id}</p>
              <p className="text-[11px] text-zinc-500">
                Gravado em: {new Date(lgpdResultado.criado_em).toLocaleString('pt-BR')} &bull;{' '}
                {lgpdResultado.visualizacoes || 0} views &bull; {lgpdResultado.downloads || 0} downs
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={lgpdExcluindo}
            onClick={onExcluir}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50"
          >
            {lgpdExcluindo ? 'Excluindo...' : 'Excluir Permanentemente (Banco + Storage)'}
          </button>
        </div>
      )}
    </div>
  );
}
