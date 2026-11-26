'use client';

import React from 'react';
import CustomSelect from '@/components/CustomSelect';
import { IconX } from '@/components/icons';

export default function NocEditModals({
  // Modal Editar Arena
  arenaEditando,
  setArenaEditando,
  editArenaForm,
  setEditArenaForm,
  salvandoArena,
  onSalvarEdicaoArena,
  // Modal Editar RTSP
  dispEditando,
  setDispEditando,
  editCameraUrl,
  setEditCameraUrl,
  salvandoDisp,
  onSalvarCameraDisp,
  // Modal Pareamento Master
  modalPareamento,
  setModalPareamento,
  arenas,
  arenaSelModal,
  setArenaSelModal,
  quadraSelModal,
  setQuadraSelModal,
  quadrasArenaModal,
  codigoTotem,
  setCodigoTotem,
  cameraUrlParear,
  setCameraUrlParear,
  ativandoTotem,
  onAtivarTotemMaster,
}) {
  return (
    <>
      {/* MODAL 2: EDITAR ARENA / PLANO / COTA / PAUSA */}
      {arenaEditando && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setArenaEditando(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wider text-white">
                Editar Arena &bull; <span className="text-amber-400">{arenaEditando.nome}</span>
              </h3>
              <button
                type="button"
                onClick={() => setArenaEditando(null)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSalvarEdicaoArena} className="space-y-4">
              <input
                type="text"
                required
                value={editArenaForm.nome}
                onChange={(e) => setEditArenaForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Nome da arena"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={editArenaForm.cidade}
                  onChange={(e) => setEditArenaForm((p) => ({ ...p, cidade: e.target.value }))}
                  placeholder="Cidade"
                  className="col-span-2 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <input
                  type="text"
                  maxLength={2}
                  value={editArenaForm.estado}
                  onChange={(e) =>
                    setEditArenaForm((p) => ({ ...p, estado: e.target.value.toUpperCase() }))
                  }
                  placeholder="UF"
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white text-center uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Limite de Quadras
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editArenaForm.limite_quadras}
                    onChange={(e) =>
                      setEditArenaForm((p) => ({
                        ...p,
                        limite_quadras: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Plano
                  </label>
                  <input
                    type="text"
                    required
                    value={editArenaForm.plano_nome}
                    onChange={(e) => setEditArenaForm((p) => ({ ...p, plano_nome: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Telefone / WhatsApp do Gestor
                </label>
                <input
                  type="tel"
                  value={editArenaForm.telefone_gestor}
                  onChange={(e) => setEditArenaForm((p) => ({ ...p, telefone_gestor: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editArenaForm.ativa}
                  onChange={(e) => setEditArenaForm((p) => ({ ...p, ativa: e.target.checked }))}
                  className="rounded text-amber-500"
                />
                <span>Arena ativa (desmarque para pausa operacional suave)</span>
              </label>

              <button
                type="submit"
                disabled={salvandoArena}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {salvandoArena ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITAR RTSP DO DISPOSITIVO */}
      {dispEditando && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDispEditando(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">
                Configurar Câmera IP / RTSP Remotamente
              </h3>
              <button
                type="button"
                onClick={() => setDispEditando(null)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              O Raspberry Pi aplicará a nova URL RTSP automaticamente no próximo heartbeat (até 60 segundos).
            </p>
            <form onSubmit={onSalvarCameraDisp} className="space-y-4">
              <input
                type="text"
                value={editCameraUrl}
                onChange={(e) => setEditCameraUrl(e.target.value)}
                placeholder="rtsp://admin:senha@192.168.1.64:554/Streaming/Channels/101"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={salvandoDisp}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-95"
              >
                {salvandoDisp ? 'Salvando...' : 'Atualizar URL RTSP'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAREAMENTO MASTER DE TOTEM */}
      {modalPareamento && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalPareamento(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
                </svg>
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Vincular Totem à Quadra (Master)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPareamento(false)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onAtivarTotemMaster} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  1. Complexo Esportivo
                </label>
                <CustomSelect
                  theme="dark"
                  value={arenaSelModal}
                  onChange={(val) => {
                    setArenaSelModal(val);
                    const a = arenas.find((item) => item.id === val);
                    setQuadraSelModal(a?.quadras?.[0]?.id || '');
                  }}
                  ariaLabel="Complexo Esportivo"
                  options={arenas.map((a) => ({
                    value: a.id,
                    label: `${a.nome} (${a.cidade || 'SP'})`,
                  }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  2. Quadra Específica
                </label>
                {quadrasArenaModal.length === 0 ? (
                  <p className="text-xs text-amber-500 font-bold p-2 bg-amber-500/10 rounded-xl">
                    Esta arena não possui quadras cadastradas.
                  </p>
                ) : (
                  <CustomSelect
                    theme="dark"
                    value={quadraSelModal}
                    onChange={(val) => setQuadraSelModal(val)}
                    ariaLabel="Quadra Específica"
                    options={quadrasArenaModal.map((q) => ({
                      value: q.id,
                      label: q.nome,
                    }))}
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  3. Código de 6 Dígitos da TV
                </label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={codigoTotem}
                  onChange={(e) => setCodigoTotem(e.target.value)}
                  placeholder="Ex: 852-149"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 text-center text-lg font-black tracking-widest uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  4. URL Câmera IP / RTSP (Opcional)
                </label>
                <input
                  type="text"
                  value={cameraUrlParear}
                  onChange={(e) => setCameraUrlParear(e.target.value)}
                  placeholder="rtsp://admin:senha@192.168.1.64:554/Streaming/Channels/101"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={ativandoTotem || !quadraSelModal}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-95"
              >
                {ativandoTotem ? 'Ativando Totem...' : 'Ativar e Iniciar Gravação ➔'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
