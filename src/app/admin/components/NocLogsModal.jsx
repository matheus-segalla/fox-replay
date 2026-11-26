'use client';

import React from 'react';
import { IconX, IconRefresh, IconTrash } from '@/components/icons';

const NIVEL_STYLE = {
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  warn: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  info: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function NocLogsModal({
  dispLogs,
  onClose,
  logs,
  carregando,
  aviso,
  limpando,
  onRecarregar,
  onLimpar,
}) {
  if (!dispLogs) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-2xl max-h-[85dvh] flex flex-col shadow-2xl overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-zinc-800 pb-4 mb-4 shrink-0">
          <div className="min-w-0">
            <h3 className="font-black text-xs uppercase tracking-wider text-white truncate">
              Registro de Erros &amp; Telemetria &bull;{' '}
              <span className="text-amber-400">{dispLogs.quadraNome || 'Totem'}</span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono truncate">
              Token (...{dispLogs.token_autenticacao?.slice(-8)})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRecarregar}
              disabled={carregando}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <IconRefresh className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            {logs.length > 0 && (
              <button
                type="button"
                onClick={onLimpar}
                disabled={limpando}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>{limpando ? 'Limpando...' : 'Limpar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {aviso && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            {aviso}
          </div>
        )}

        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {carregando ? (
            <p className="text-center text-xs text-zinc-400 py-10 animate-pulse">
              Carregando histórico do totem...
            </p>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 space-y-1.5">
              <p className="text-xs font-bold text-zinc-300">Nenhum erro registrado</p>
              <p className="text-[11px] text-zinc-500">
                Quando o totem reportar falhas de câmera, upload, serial ou heartbeat, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            logs.map((item) => {
              const nivelClass = NIVEL_STYLE[item.nivel] || NIVEL_STYLE.error;
              const stderr = Array.isArray(item.detalhes?.stderr) ? item.detalhes.stderr : [];
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${nivelClass}`}
                      >
                        {item.nivel}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                        {item.categoria}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(item.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed break-words">
                    {item.mensagem}
                  </p>

                  {stderr.length > 0 && (
                    <pre className="p-2.5 rounded-lg bg-black/70 border border-zinc-800 text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                      {stderr.join('\n')}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
