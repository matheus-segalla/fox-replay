'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function BarraProgressoInterna() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visivel, setVisivel] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const rotaAtualRef = useRef('');

  const rotaAtual = `${pathname}?${searchParams?.toString() || ''}`;

  const limparTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const iniciarProgresso = () => {
    limparTimers();
    setVisivel(true);
    setProgresso(18);
    timerRef.current = setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 88) return prev;
        return prev + (prev < 55 ? 10 : 3);
      });
    }, 180);
  };

  // Finaliza a barra quando a rota muda
  useEffect(() => {
    if (rotaAtualRef.current && rotaAtualRef.current !== rotaAtual) {
      limparTimers();
      setProgresso(100);
      hideTimerRef.current = setTimeout(() => {
        setVisivel(false);
        setProgresso(0);
      }, 240);
    }
    rotaAtualRef.current = rotaAtual;
  }, [rotaAtual]);

  useEffect(() => {
    const onDocumentClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = e.target?.closest?.('a[href]');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const urlDestino = new URL(anchor.href, window.location.origin);
        if (urlDestino.origin !== window.location.origin) return;
        const destino = `${urlDestino.pathname}${urlDestino.search}`;
        const atual = `${window.location.pathname}${window.location.search}`;
        if (destino !== atual) {
          iniciarProgresso();
        }
      } catch {}
    };

    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (...args) {
      const urlArg = args[2];
      if (typeof urlArg === 'string' && urlArg !== window.location.pathname + window.location.search) {
        iniciarProgresso();
      }
      return originalPushState(...args);
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      window.history.pushState = originalPushState;
      limparTimers();
    };
  }, []);

  if (!visivel) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-[#FF9900] shadow-[0_0_10px_rgba(255,153,0,0.75)] transition-all duration-200 ease-out"
        style={{ width: `${progresso}%` }}
      />
    </div>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <BarraProgressoInterna />
    </Suspense>
  );
}
