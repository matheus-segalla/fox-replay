'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Seletor dropdown customizado padronizado para todo o site Fox Replay.
 * Utiliza React Portal (document.body) + position: fixed para NUNCA ser cortado por
 * overflow-hidden ou overflow-y-auto dentro de modais, sobrepondo qualquer camada.
 *
 * @param {Object} props
 * @param {string} props.value - Valor selecionado atualmente
 * @param {(valor: string) => void} props.onChange - Callback ao selecionar uma opção
 * @param {Array<{value: string, label: string}>} props.options - Lista de opções
 * @param {string} [props.placeholder='Selecione...'] - Texto quando nada está selecionado
 * @param {'light'|'dark'} [props.theme='light'] - Tema visual
 * @param {boolean} [props.disabled=false] - Desabilita interações
 * @param {string} [props.ariaLabel] - Rótulo de acessibilidade
 * @param {string} [props.className=''] - Classes extras no container raiz
 * @param {string} [props.buttonClassName=''] - Classes extras no botão gatilho
 */
export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Selecione...',
    theme = 'light',
    disabled = false,
    ariaLabel,
    className = '',
    buttonClassName = '',
}) {
    const [aberto, setAberto] = useState(false);
    const [coords, setCoords] = useState(null);
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    const opcaoSelecionada = useMemo(
        () => options.find((opt) => String(opt.value) === String(value)) || null,
        [options, value]
    );

    const atualizarPosicao = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const espacoAbaixo = window.innerHeight - rect.bottom;
        const abrirParaCima = espacoAbaixo < 200 && rect.top > espacoAbaixo;

        setCoords({
            left: rect.left,
            width: rect.width,
            top: abrirParaCima ? undefined : rect.bottom + 6,
            bottom: abrirParaCima ? window.innerHeight - rect.top + 6 : undefined,
        });
    }, []);

    const alternarAberto = () => {
        if (disabled) return;
        if (!aberto) {
            atualizarPosicao();
            setAberto(true);
        } else {
            setAberto(false);
        }
    };

    useEffect(() => {
        if (!aberto) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') setAberto(false);
        };

        const onPointerDown = (e) => {
            const clicouNoBotao = containerRef.current && containerRef.current.contains(e.target);
            const clicouNoMenu = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!clicouNoBotao && !clicouNoMenu) {
                setAberto(false);
            }
        };

        const onScrollOuResize = (e) => {
            // Não fecha se o scroll estiver acontecendo dentro do próprio menu
            if (dropdownRef.current && e?.target && dropdownRef.current.contains(e.target)) {
                return;
            }
            atualizarPosicao();
        };

        window.addEventListener('keydown', onKeyDown);
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        window.addEventListener('scroll', onScrollOuResize, true);
        window.addEventListener('resize', onScrollOuResize);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
            window.removeEventListener('scroll', onScrollOuResize, true);
            window.removeEventListener('resize', onScrollOuResize);
        };
    }, [aberto, atualizarPosicao]);

    const isDark = theme === 'dark';

    const estiloBotaoBase = isDark
        ? 'bg-zinc-950 border-zinc-800 text-white hover:border-zinc-700'
        : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300';

    const estiloBotaoAberto = isDark
        ? 'border-amber-500 ring-2 ring-amber-500/20'
        : 'border-amber-500 ring-2 ring-amber-500/15 bg-white';

    const estiloDropdown = isDark
        ? 'bg-zinc-900/95 backdrop-blur-md text-white border border-zinc-700/80 shadow-2xl'
        : 'bg-white/95 backdrop-blur-md text-zinc-900 border border-zinc-200/90 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.16)]';

    const menuPortal =
        aberto && coords && typeof document !== 'undefined'
            ? createPortal(
                  <div
                      ref={dropdownRef}
                      role="listbox"
                      style={{
                          position: 'fixed',
                          left: `${coords.left}px`,
                          width: `${coords.width}px`,
                          top: coords.top !== undefined ? `${coords.top}px` : undefined,
                          bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                          zIndex: 9999,
                      }}
                      className={`rounded-2xl p-1.5 animate-fadeIn ${estiloDropdown}`}
                  >
                      <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto overscroll-contain scrollbar-none">
                          {options.length === 0 ? (
                              <div className={`px-3 py-2.5 text-xs text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                  Nenhuma opção disponível
                              </div>
                          ) : (
                              options.map((opt) => {
                                  const selecionado = String(opt.value) === String(value);
                                  let itemClass = '';
                                  if (isDark) {
                                      itemClass = selecionado
                                          ? 'bg-amber-500 text-black font-bold'
                                          : 'text-zinc-200 hover:bg-zinc-800';
                                  } else {
                                      itemClass = selecionado
                                          ? 'bg-zinc-900 text-white font-bold'
                                          : 'text-zinc-700 hover:bg-zinc-100';
                                  }

                                  return (
                                      <button
                                          key={String(opt.value)}
                                          type="button"
                                          role="option"
                                          aria-selected={selecionado}
                                          onClick={() => {
                                              onChange(opt.value);
                                              setAberto(false);
                                          }}
                                          className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between gap-2 text-left cursor-pointer ${itemClass}`}
                                      >
                                          <span className="truncate">{opt.label}</span>
                                          {selecionado && <span className="text-[11px] shrink-0">✓</span>}
                                      </button>
                                  );
                              })
                          )}
                      </div>
                  </div>,
                  document.body
              )
            : null;

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <button
                type="button"
                disabled={disabled}
                aria-label={ariaLabel}
                aria-expanded={aberto}
                onClick={alternarAberto}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between gap-2 text-left min-h-[40px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${estiloBotaoBase} ${
                    aberto ? estiloBotaoAberto : ''
                } ${buttonClassName}`}
            >
                <span className={`truncate ${!opcaoSelecionada ? (isDark ? 'text-zinc-500' : 'text-zinc-400') : ''}`}>
                    {opcaoSelecionada ? opcaoSelecionada.label : placeholder}
                </span>
                <span className={`text-[10px] shrink-0 transition-transform duration-200 opacity-60 ${aberto ? 'rotate-180' : ''}`}>
                    ▾
                </span>
            </button>

            {menuPortal}
        </div>
    );
}
