import React from 'react';

export default function LoadingJogada() {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[360px] bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="h-10 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="w-full aspect-[9/13.5] bg-zinc-900 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="h-14 bg-zinc-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
