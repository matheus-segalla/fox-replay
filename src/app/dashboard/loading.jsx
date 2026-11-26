import React from 'react';

export default function LoadingDashboard() {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
          Carregando Painel da Arena...
        </p>
      </div>
    </div>
  );
}
