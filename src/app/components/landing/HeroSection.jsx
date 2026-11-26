'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getIniciais } from '@/lib/formatters';
import {
  IconSearch,
  IconMapPin,
  IconArrowRight,
  IconX,
  IconPlay,
  IconDownload,
} from '@/components/icons';

export default function HeroSection({
  termoBusca,
  setTermoBusca,
  arenasFiltradas,
  ultimaArena,
  acessarArena,
  entrandoArenaId,
  abrirModalCidades,
  searchInputRef,
}) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setParallax({ x, y });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  const handleExecutarBusca = (e) => {
    e.preventDefault();
    if (!termoBusca.trim()) {
      searchInputRef?.current?.focus();
      return;
    }
    if (arenasFiltradas.length === 1) {
      acessarArena(arenasFiltradas[0]);
      return;
    }
    searchInputRef?.current?.focus();
  };

  return (
    <section
      id="buscar-arena"
      className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-10 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* LADO ESQUERDO — EDITORIAL + BUSCA UNIFICADA */}
        <div className="lg:col-span-6 space-y-3.5 sm:space-y-5 text-left animate-fadeIn min-w-0">
          {/* Identificador */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7EBD7]/80 border border-[#FF9900]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#111111]">
              TECNOLOGIA PARA ESPORTES
            </span>
          </div>

          {/* Headline Principal com clamp() */}
          <h1 className="text-[clamp(1.85rem,8vw,3.75rem)] font-black tracking-tight uppercase leading-[0.95] text-[#111111] break-words">
            <span className="block">SEUS LANCES</span>
            <span className="block mt-0.5 sm:mt-1">ALÉM DOS</span>
            <span className="block mt-1 text-stroke-fox-orange">
              LIMITES DA QUADRA.
            </span>
          </h1>

          {/* Descrição */}
          <p className="text-[#68666B] text-[13px] sm:text-base max-w-lg leading-relaxed font-normal">
            Aperte o botão físico na quadra, encontre sua arena e reviva seus melhores momentos em poucos segundos.
          </p>

          {/* COMPONENTE DE BUSCA UNIFICADO */}
          <div className="relative z-30 pt-1 max-w-xl">
            <form
              onSubmit={handleExecutarBusca}
              className="rounded-2xl bg-white border border-[#EAE8E5] p-3 sm:p-3.5 shadow-[0_10px_30px_-14px_rgba(17,17,17,0.12)] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 px-0.5">
                <label
                  htmlFor="hero-arena-search"
                  className="text-[10px] font-mono font-bold tracking-[0.16em] uppercase text-[#111111]"
                >
                  ENCONTRE SUA ARENA
                </label>
                <button
                  type="button"
                  onClick={abrirModalCidades}
                  className="text-[11px] font-semibold text-[#68666B] hover:text-[#FF9900] transition-colors inline-flex items-center gap-1 cursor-pointer py-0.5"
                >
                  <IconMapPin className="w-3 h-3 text-[#FF9900]" />
                  <span>Explorar por cidade</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    id="hero-arena-search"
                    ref={searchInputRef}
                    type="text"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Nome da arena ou cidade..."
                    aria-label="Buscar arena por nome ou cidade"
                    className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#111111] placeholder-[#68666B]/70 text-sm font-medium transition-all focus:outline-none focus:border-[#FF9900] focus:bg-white focus:ring-3 focus:ring-[#FF9900]/15"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF9900] pointer-events-none">
                    <IconSearch className="w-4 h-4" />
                  </span>
                  {termoBusca && (
                    <button
                      type="button"
                      onClick={() => setTermoBusca('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#68666B] hover:text-[#111111] bg-white border border-[#EAE8E5] rounded-full w-7 h-7 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                      aria-label="Limpar busca"
                      title="Limpar busca"
                    >
                      <IconX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs sm:text-sm tracking-wide transition-all cursor-pointer active:scale-[0.98] inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Encontrar minha arena</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Dropdown de Resultados */}
            {termoBusca.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#EAE8E5] rounded-2xl shadow-[0_18px_40px_-12px_rgba(17,17,17,0.16)] overflow-hidden max-h-[250px] overflow-y-auto overscroll-contain z-40 divide-y divide-[#EAE8E5]/70 text-left animate-fadeIn">
                {arenasFiltradas.length === 0 ? (
                  <div className="p-5 text-center text-[#68666B] text-xs font-medium space-y-2">
                    <p>Nenhuma arena encontrada para &quot;{termoBusca}&quot;.</p>
                    <button
                      type="button"
                      onClick={abrirModalCidades}
                      className="text-[#FF9900] font-bold hover:underline text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver lista completa por cidades</span>
                      <IconArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    {arenasFiltradas.slice(0, 12).map((arena) => (
                      <button
                        key={arena.id}
                        type="button"
                        onClick={() => acessarArena(arena)}
                        className="w-full p-3.5 hover:bg-[#FCFBF9] cursor-pointer transition-colors flex items-center justify-between group text-left min-h-[48px]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#F7EBD7] group-hover:bg-[#FF9900]/20 text-[#111111] border border-[#FF9900]/25 flex items-center justify-center text-xs font-black tracking-wider transition-colors shrink-0">
                            {getIniciais(arena.nome)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#111111] group-hover:text-[#FF9900] transition-colors uppercase truncate">
                              {arena.nome}
                            </h4>
                            <p className="text-[11px] text-[#68666B] font-medium flex items-center gap-1 mt-0.5 truncate">
                              <IconMapPin className="w-3 h-3 text-[#68666B] shrink-0" />
                              <span className="truncate">
                                {arena.cidade || 'Localização não informada'}{' '}
                                {arena.estado ? `• ${arena.estado}` : ''}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#68666B] group-hover:text-[#FF9900] transition-colors flex items-center gap-1 shrink-0 ml-2">
                          {entrandoArenaId === arena.id ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                              <span className="text-[#FF9900]">Abrindo...</span>
                            </>
                          ) : (
                            <>
                              <span>Ver lances</span>
                              <IconArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </span>
                      </button>
                    ))}
                    {arenasFiltradas.length > 12 && (
                      <div className="px-4 py-2.5 bg-[#FCFBF9] text-[11px] text-[#68666B] font-medium flex items-center justify-between gap-2">
                        <span>Exibindo 12 de {arenasFiltradas.length} resultados</span>
                        <button
                          type="button"
                          onClick={abrirModalCidades}
                          className="text-[#FF9900] font-bold hover:underline cursor-pointer shrink-0"
                        >
                          Explorar por cidade
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Atalho 1-toque: Última Arena Visitada */}
          {ultimaArena && (
            <div className="max-w-xl">
              <Link
                href={`/arena/${ultimaArena.id}`}
                className="bg-white/95 hover:border-[#FF9900] border border-[#EAE8E5] rounded-2xl p-3 flex items-center justify-between text-left transition-all group active:scale-[0.99] min-h-[52px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F7EBD7] text-[#111111] flex items-center justify-center text-[11px] font-black tracking-wider border border-[#FF9900]/25 shrink-0">
                    {getIniciais(ultimaArena.nome)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold uppercase text-[#FF9900] tracking-wider block">
                      Continuar de onde parou
                    </span>
                    <h4 className="text-xs font-bold text-[#111111] truncate">
                      {ultimaArena.nome}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#111111] bg-[#FCFBF9] border border-[#EAE8E5] px-3 py-1.5 rounded-xl group-hover:bg-[#FF9900] group-hover:border-[#FF9900] transition-all flex items-center gap-1 shrink-0">
                  <span>Entrar</span>
                  <IconArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* LADO DIREITO — FOTOGRAFIA BEACH TENNIS + MOCKUP REPLAY */}
        <div
          className="lg:col-span-6 relative flex items-center justify-center min-w-0"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Elementos circulares e linhas de quadra atrás da composição (desktop/tablet) */}
          <svg
            className="hidden sm:block absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] pointer-events-none opacity-80"
            viewBox="0 0 500 500"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="265" cy="245" r="215" stroke="#EAE8E5" strokeWidth="1" />
            <circle
              cx="265"
              cy="245"
              r="185"
              stroke="#FF9900"
              strokeOpacity="0.25"
              strokeWidth="1.25"
              strokeDasharray="8 10"
            />
            <line x1="30" y1="420" x2="460" y2="80" stroke="#EAE8E5" strokeWidth="1" />
          </svg>

          <div className="relative w-full max-w-[540px]">
            {/* Moldura principal da fotografia (4:3 no mobile, border-radius 22px) */}
            <div
              className="relative aspect-[4/3] sm:aspect-[16/12] w-full rounded-[22px] sm:rounded-[28px] overflow-hidden border border-[#EAE8E5] bg-[#F7EBD7] shadow-[0_18px_45px_-20px_rgba(17,17,17,0.2)] lg:transition-transform lg:duration-300 lg:ease-out"
              style={{
                transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)`,
              }}
            >
              <Image
                src="/images/hero-beach-tennis.jpg"
                alt="Jogador de Beach Tennis executando smash na quadra"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
                className="object-cover object-[55%_25%]"
              />
              {/* Gradiente sutil para leitura dos badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/45 via-transparent to-[#111111]/25 pointer-events-none" />

              {/* HUD superior de gravação com contraste garantido */}
              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#FCFBF9]/95 backdrop-blur-md border border-[#EAE8E5] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase text-[#111111]">
                    REC &bull; REPLAY 30S
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#111111]/88 backdrop-blur-md text-[9px] sm:text-[10px] font-mono font-bold text-[#FCFBF9] tracking-wider uppercase">
                  QUADRA 01
                </div>
              </div>

              {/* Cantoneira minimalista de câmera */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-l-2 border-[#FF9900]/85 rounded-bl-sm pointer-events-none" />
            </div>

            {/* Mockup de Smartphone sobreposto (tablet/desktop) */}
            <div
              className="hidden sm:block absolute -bottom-6 -right-3 md:-right-6 w-[184px] rounded-[26px] bg-[#111111] p-2 border border-[#111111] shadow-[0_24px_48px_-14px_rgba(17,17,17,0.45)] lg:transition-transform lg:duration-300 lg:ease-out"
              style={{
                transform: `translate3d(${parallax.x * -0.65}px, ${parallax.y * -0.65}px, 0)`,
              }}
            >
              <div className="rounded-[20px] overflow-hidden bg-[#18181b] relative aspect-[9/14] flex flex-col justify-between">
                <Image
                  src="/images/hero-beach-tennis.jpg"
                  alt="Preview do lance no smartphone"
                  fill
                  loading="lazy"
                  sizes="190px"
                  className="object-cover object-[72%_35%] opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/40" />

                <div className="relative z-10 p-2.5 flex items-center justify-between">
                  <span className="text-[8px] font-black tracking-widest uppercase text-white">
                    FOX <span className="text-[#FF9900]">REPLAY</span>
                  </span>
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FF9900] text-[#111111]">
                    HD
                  </span>
                </div>

                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#FF9900] text-[#111111] flex items-center justify-center shadow-md">
                    <IconPlay className="w-4 h-4 ml-0.5" />
                  </div>
                </div>

                <div className="relative z-10 p-2.5 space-y-2">
                  <div className="space-y-1">
                    <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden">
                      <div className="h-full w-2/3 bg-[#FF9900] rounded-full" />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-white/80">
                      <span>00:18</span>
                      <span>00:30</span>
                    </div>
                  </div>
                  <div className="w-full py-1.5 rounded-lg bg-white/95 text-[#111111] text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1">
                    <IconDownload className="w-3 h-3 text-[#FF9900]" />
                    <span>Baixar Lance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
