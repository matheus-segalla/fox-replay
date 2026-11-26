'use client';

import React from 'react';

export default function ArenaMetricsCard({
  periodos,
  periodoMetricas,
  onTrocarPeriodo,
  onGerarRelatorioWhatsApp,
  carregandoMetricas,
  metricasArena,
}) {
  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
            Audiência &amp; Retorno de Patrocínio
          </span>
          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mt-1">
            Desempenho da Arena
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/70">
            {periodos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onTrocarPeriodo(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  periodoMetricas === p.id
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onGerarRelatorioWhatsApp}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            📱 Relatório WhatsApp
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-4 transition-opacity ${carregandoMetricas ? 'opacity-50' : ''}`}>
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
            Lances Gravados
          </span>
          <span className="text-2xl sm:text-3xl font-black text-zinc-900">
            {metricasArena.lances}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
            Visualizações
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">
            {metricasArena.visualizacoes}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
            Downloads 9:16
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            {metricasArena.downloads}
          </span>
        </div>
      </div>

      {metricasArena.porQuadra.length > 0 && (
        <div className="pt-2 space-y-2.5">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider block">
            Ranking por Quadra no Período
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {metricasArena.porQuadra.map((q, idx) => {
              const maxLances = Math.max(1, metricasArena.porQuadra[0]?.lances || 1);
              const pct = Math.round(((q.lances || 0) / maxLances) * 100);
              return (
                <div
                  key={q.quadra_id || idx}
                  className="p-3 rounded-xl bg-white border border-zinc-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800 uppercase truncate">
                      {idx + 1}. {q.nome}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-zinc-600 shrink-0">
                      {q.lances} lances &bull; {q.downloads} downs
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
