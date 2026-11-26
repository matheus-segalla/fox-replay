'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrPrintFlyer({ arenaNome, linkPortalPublico }) {
  return (
    <div className="hidden print:flex flex-col items-center justify-between bg-white text-black w-full h-screen p-16 font-sans text-center border-[24px] border-neutral-900 box-border">
      <div className="space-y-1">
        <h1 className="text-6xl font-black tracking-widest text-neutral-900 m-0">
          FOX <span className="text-[#A6801E]">REPLAY</span>
        </h1>
        <p className="text-xs uppercase tracking-widest font-extrabold text-neutral-400">
          REVEJA SEUS LANCES INSTANTANEAMENTE
        </p>
      </div>

      <div className="my-auto py-6 space-y-3">
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider m-0">
          Você está jogando na
        </p>
        <h2 className="text-5xl font-black text-neutral-950 uppercase tracking-tight leading-none">
          {arenaNome || 'Nossa Arena'}
        </h2>
        <div className="w-24 h-1 bg-[#A6801E] mx-auto mt-4" />
      </div>

      <div className="bg-white p-6 border-4 border-neutral-950 rounded-3xl shadow-sm inline-block">
        {linkPortalPublico ? (
          <QRCodeSVG value={linkPortalPublico} size={280} level="H" includeMargin={false} />
        ) : (
          <p className="text-xs text-neutral-400">Gerando código seguro...</p>
        )}
      </div>

      <div className="w-full max-w-xl bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-6 mt-8 space-y-3 text-left">
        <h4 className="font-black text-sm uppercase tracking-wider text-neutral-900 text-center border-b border-neutral-200 pb-2 mb-3">
          Como baixar a sua jogada:
        </h4>
        <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
          <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
            1
          </strong>
          Fez um ponto incrível? Pressione o botão físico na grade da quadra imediatamente.
        </p>
        <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
          <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
            2
          </strong>
          Ao final da partida, escaneie este QR Code com a câmera do seu celular.
        </p>
        <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
          <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
            3
          </strong>
          Escolha sua quadra, encontre o lance pelo horário e baixe em alta definição com áudio!
        </p>
      </div>

      <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase m-0 mt-8">
        SISTEMA AUTOMÁTICO DE REPLAYS ESPORTIVOS
      </p>
    </div>
  );
}
