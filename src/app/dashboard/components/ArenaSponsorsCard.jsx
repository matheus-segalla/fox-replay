'use client';

import React from 'react';
import Image from 'next/image';
import ImageUploadField from '@/components/ImageUploadField';
import { validarUrlHttp } from '@/lib/auth';

export default function ArenaSponsorsCard({
  arena,
  logoArenaInput,
  setLogoArenaInput,
  patrocinadoresInput,
  onAtualizarSlot,
  onSalvar,
  salvando,
}) {
  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
            Monetização &amp; Publicidade &bull; 4 Posições
          </span>
          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mt-1">
            Patrocinadores no Vídeo e Logo da Arena
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Envie as imagens direto do seu celular ou computador — elas são gravadas automaticamente em 100% dos downloads dos atletas.
          </p>
        </div>

        <button
          type="button"
          onClick={onSalvar}
          disabled={salvando}
          className="self-start md:self-auto text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-3 rounded-xl transition-all uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Marcas do Vídeo ✓'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-5">
          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl">
            <ImageUploadField
              arenaId={arena?.id}
              prefixo="logo-arena"
              value={logoArenaInput}
              onChange={setLogoArenaInput}
              label="Logomarca Oficial da Arena (Topo Direito)"
              hint="PNG transparente recomendado"
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wide block">
              Grade dos 4 Patrocinadores (Rodapé do Vídeo)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patrocinadoresInput.map((pat, idx) => (
                <div
                  key={pat.id || idx}
                  className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase font-mono">
                      Slot 0{idx + 1}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-600 font-bold">
                      <input
                        type="checkbox"
                        checked={pat.ativo}
                        onChange={(e) => onAtualizarSlot(idx, 'ativo', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Ativo</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={pat.nome || ''}
                    onChange={(e) => onAtualizarSlot(idx, 'nome', e.target.value)}
                    placeholder={`Nome da Marca 0${idx + 1}`}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 font-medium focus:outline-none focus:border-amber-500"
                  />

                  <ImageUploadField
                    arenaId={arena?.id}
                    prefixo={`patrocinador-${idx + 1}`}
                    value={pat.logo_url || ''}
                    onChange={(url) => onAtualizarSlot(idx, 'logo_url', url)}
                    label=""
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PREVIEW 9:16 */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-2 font-mono">
            Prévia do Vídeo Exportado (9:16)
          </span>

          <div className="w-[260px] bg-[#070709] border-[6px] border-zinc-800 rounded-[32px] p-2.5 shadow-2xl relative overflow-hidden flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 border-b border-white/10 pb-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <Image
                  src="/logo-fox.jpeg"
                  alt="Fox Replay"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-cover rounded-md border border-amber-500/40"
                />
                <span className="text-[9px] font-black text-white uppercase leading-none">
                  FOX <span className="text-amber-500">REPLAY</span>
                </span>
              </div>

              <div className="text-right">
                {logoArenaInput && validarUrlHttp(logoArenaInput) ? (
                  <Image
                    src={logoArenaInput}
                    alt="Arena Logo"
                    width={70}
                    height={24}
                    unoptimized
                    className="h-6 w-auto max-w-[70px] object-contain rounded bg-white/5 p-0.5 border border-white/10"
                  />
                ) : (
                  <span className="text-[8px] font-black text-white uppercase block truncate max-w-[80px]">
                    {arena?.nome || 'SUA ARENA'}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full aspect-[9/12] bg-zinc-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xs">
                ▶
              </div>
              <span className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                LANCE 30s + ÁUDIO
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 w-full h-11 pt-0.5">
              {patrocinadoresInput.map((p, i) => {
                const tem = p && p.ativo && (p.logo_url || p.nome);
                return (
                  <div
                    key={i}
                    className="bg-[#14151b] border border-white/10 rounded-lg flex flex-col items-center justify-center p-1 overflow-hidden text-center"
                  >
                    {tem ? (
                      p.logo_url && validarUrlHttp(p.logo_url) ? (
                        <Image
                          src={p.logo_url}
                          alt={p.nome || 'Patrocinador'}
                          width={56}
                          height={36}
                          unoptimized
                          className="max-h-full max-w-full w-auto h-auto object-contain"
                        />
                      ) : (
                        <span className="text-[7px] font-black text-white truncate px-0.5 uppercase">
                          {p.nome}
                        </span>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center leading-none scale-90">
                        <span className="text-[6px] font-black text-white uppercase">ANUNCIE</span>
                        <span className="text-[7px] font-black text-amber-400">Aqui!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
