'use client';

import React from 'react';
import { IconDownload } from '@/components/icons';
import { montarUrlWhatsAppSuporte } from '@/lib/auth';

export default function JogadaModals({
  jogadaId,
  modalPerfilAberto,
  setModalPerfilAberto,
  onIrParaEntrar,
  modalPrivacidadeAberto,
  setModalPrivacidadeAberto,
  modalDownloadAberto,
  statusDownload,
  progressoDownload,
}) {
  return (
    <>
      {/* MODAL DE CONVITE PARA SALVAR NO PERFIL */}
      {modalPerfilAberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-sm w-full max-h-[85dvh] overflow-y-auto overscroll-contain space-y-4 shadow-2xl relative text-center"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                Lance Salvo no seu Perfil
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                As jogadas da quadra expiram em 5 dias. Salve com seu perfil gratuito para manter este vídeo permanente na sua galeria.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={onIrParaEntrar}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm active:scale-95 transition-all min-h-[44px] cursor-pointer"
              >
                Salvar Permanente na Minha Conta
              </button>
              <button
                onClick={() => setModalPerfilAberto(false)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-semibold text-xs rounded-xl transition-all min-h-[42px] cursor-pointer"
              >
                Manter salvo apenas neste celular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PRIVACIDADE E EXCLUSÃO DE VÍDEO (LGPD) */}
      {modalPrivacidadeAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-[380px] max-h-[85dvh] overflow-y-auto overscroll-contain space-y-4 relative shadow-2xl text-left"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wide text-zinc-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span>Privacidade e Imagem</span>
              </h3>
              <button
                onClick={() => setModalPrivacidadeAberto(false)}
                aria-label="Fechar modal de privacidade"
                className="text-zinc-500 hover:text-zinc-900 text-sm bg-zinc-100 hover:bg-zinc-200 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Em conformidade com a LGPD, se você aparece neste lance e não autoriza a divulgação de sua imagem, solicite a exclusão imediata do clipe pelo suporte da Fox Replay.
            </p>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 space-y-1">
              <p className="font-semibold">Identificador do Replay:</p>
              <code className="text-amber-700 font-mono text-[10px] select-all break-all">{jogadaId}</code>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  const texto = `Olá, solicito a exclusão imediata deste replay por questões de privacidade/imagem (LGPD):\n\nID do Replay: ${jogadaId}\nLink: ${window.location.href}`;
                  window.open(montarUrlWhatsAppSuporte(texto), '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Solicitar Exclusão no WhatsApp</span>
              </button>

              <button
                onClick={() => setModalPrivacidadeAberto(false)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all min-h-[42px] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RENDERIZAÇÃO DO VÍDEO COM PATROCINADORES */}
      {modalDownloadAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-sm w-full max-h-[85dvh] overflow-y-auto overscroll-contain text-center space-y-4 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <IconDownload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 uppercase tracking-wide">
                Gerando seu Replay
              </h3>
              <p className="text-zinc-500 text-xs mt-1 font-medium">
                {statusDownload || 'Aplicando marcas e patrocinadores no vídeo...'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-200">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressoDownload}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Exportando vídeo 9:16 com áudio</span>
                <span className="text-amber-600 font-bold">{progressoDownload}%</span>
              </div>
              <p className="text-[10px] text-zinc-400 pt-1">
                Mantenha esta aba aberta até o final para agilizar a exportação.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
