'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getIniciais } from '@/lib/formatters';
import { getUltimaArena, setUltimaArena as salvarUltimaArenaLocal, getLancesSalvos } from '@/lib/storage';
import AppHeader from '@/components/AppHeader';
import CustomSelect from '@/components/CustomSelect';
import { IconMapPin, IconArrowRight, IconX } from '@/components/icons';
import LandingBackground from './landing/LandingBackground';
import HeroSection from './landing/HeroSection';
import HowItWorksSection from './landing/HowItWorksSection';
import ExperienceSection from './landing/ExperienceSection';
import BenefitsSection from './landing/BenefitsSection';
import FinalCtaSection from './landing/FinalCtaSection';
import LandingFooter from './landing/LandingFooter';

export default function HomeClient({ arenasIniciais = [] }) {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [todasArenas, setTodasArenas] = useState(arenasIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [ultimaArena, setUltimaArena] = useState(null);
  const [lancesFavoritosCount, setLancesFavoritosCount] = useState(0);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');

  // Fecha modal de cidades com Escape
  useEffect(() => {
    if (!modalAberto) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setModalAberto(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalAberto]);

  // Carrega última arena e contagem de favoritos locais (após hidratação)
  useEffect(() => {
    let cancelado = false;
    const timer = setTimeout(() => {
      if (cancelado) return;
      const salvo = getUltimaArena();
      if (salvo) setUltimaArena(salvo);
      setLancesFavoritosCount(getLancesSalvos().length);
    }, 0);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, []);

  // Fallback cliente apenas se SSR não trouxe arenas
  useEffect(() => {
    if (arenasIniciais.length > 0) return;
    let cancelado = false;
    async function carregarArenas() {
      try {
        let { data, error } = await supabase
          .from('arenas')
          .select('id, nome, cidade, estado, slug')
          .eq('ativa', true)
          .order('nome', { ascending: true });

        if (error && (error.code === '42703' || String(error.message || '').includes('ativa'))) {
          const fallback = await supabase
            .from('arenas')
            .select('id, nome, cidade, estado, slug')
            .order('nome', { ascending: true });
          data = fallback.data;
          error = fallback.error;
        }

        if (error) throw error;
        if (!cancelado && data) {
          setTodasArenas(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar arenas:', err);
      }
    }
    carregarArenas();
    return () => {
      cancelado = true;
    };
  }, [arenasIniciais.length]);

  // Deriva cidades únicas e arenas por cidade em memória
  const cidadesDisponiveis = useMemo(() => {
    const cidadesUnicas = [];
    const mapa = new Set();
    for (const item of todasArenas) {
      if (!item.cidade || !item.estado) continue;
      const chave = `${item.cidade.trim().toLowerCase()}-${item.estado.trim().toLowerCase()}`;
      if (!mapa.has(chave)) {
        mapa.add(chave);
        cidadesUnicas.push({ cidade: item.cidade.trim(), estado: item.estado.trim() });
      }
    }
    return cidadesUnicas.sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'));
  }, [todasArenas]);

  const arenasDaCidade = useMemo(() => {
    if (!cidadeSelecionada) return [];
    const alvo = cidadeSelecionada.trim().toLowerCase();
    return todasArenas.filter((a) => (a.cidade || '').trim().toLowerCase() === alvo);
  }, [todasArenas, cidadeSelecionada]);

  const arenasFiltradas = useMemo(() => {
    const termo = termoBusca.toLowerCase().trim();
    if (!termo) return [];
    return todasArenas.filter((arena) => {
      const nomeMatch = arena.nome?.toLowerCase().includes(termo);
      const cidadeMatch = arena.cidade?.toLowerCase().includes(termo);
      return nomeMatch || cidadeMatch;
    });
  }, [todasArenas, termoBusca]);

  const acessarArena = (arena) => {
    salvarUltimaArenaLocal(arena);
    router.push(`/arena/${arena.id}`);
  };

  const focarBuscaArena = () => {
    const el = searchInputRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.focus(), 260);
    } else {
      setModalAberto(true);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FCFBF9] text-[#111111] font-sans selection:bg-[#FF9900] selection:text-[#111111] relative flex flex-col justify-between overflow-x-hidden safe-pb">
      {/* SISTEMA DECORATIVO DE FUNDO CSS + SVG */}
      <LandingBackground />

      {/* HEADER MINIMALISTA E CONTEXTUAL */}
      <AppHeader
        theme="light"
        activeRoute="home"
        lancesFavoritosCount={lancesFavoritosCount}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1">
        <HeroSection
          termoBusca={termoBusca}
          setTermoBusca={setTermoBusca}
          arenasFiltradas={arenasFiltradas}
          ultimaArena={ultimaArena}
          acessarArena={acessarArena}
          abrirModalCidades={() => setModalAberto(true)}
          searchInputRef={searchInputRef}
          onEncontrarArenaClick={focarBuscaArena}
        />

        <HowItWorksSection />

        <ExperienceSection />

        <BenefitsSection />

        <FinalCtaSection onEncontrarArenaClick={focarBuscaArena} />
      </main>

      {/* RODAPÉ MINIMALISTA */}
      <LandingFooter />

      {/* MODAL DE SELEÇÃO POR CIDADE */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-[#111111]/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalAberto(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-arenas-titulo"
            className="bg-[#FCFBF9] border border-[#EAE8E5] rounded-3xl p-6 w-full max-w-[420px] max-h-[85dvh] overflow-y-auto overscroll-contain space-y-5 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconMapPin className="w-4 h-4 text-[#FF9900]" />
                <h3
                  id="modal-arenas-titulo"
                  className="font-bold text-xs uppercase tracking-wider text-[#111111]"
                >
                  Selecionar Complexo Esportivo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar modal"
                className="text-[#68666B] hover:text-[#111111] transition-colors bg-white border border-[#EAE8E5] w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-95"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-[#68666B] tracking-wider">
                  1. Cidade
                </label>
                <CustomSelect
                  theme="light"
                  value={cidadeSelecionada}
                  onChange={(val) => setCidadeSelecionada(val)}
                  placeholder="Selecione o município..."
                  ariaLabel="Selecionar cidade"
                  options={cidadesDisponiveis.map((c) => ({
                    value: c.cidade,
                    label: `${c.cidade} (${c.estado.toUpperCase()})`,
                  }))}
                />
              </div>

              {cidadeSelecionada && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-bold uppercase text-[#68666B] tracking-wider">
                    2. Arenas Parceiras
                  </label>

                  {arenasDaCidade.length === 0 ? (
                    <p className="text-[11px] text-[#68666B] font-medium px-1 py-2">
                      Nenhum complexo ativo nesta área.
                    </p>
                  ) : (
                    <div className="bg-white border border-[#EAE8E5] rounded-xl max-h-[200px] overflow-y-auto divide-y divide-[#EAE8E5]/70">
                      {arenasDaCidade.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setModalAberto(false);
                            acessarArena(item);
                          }}
                          className="w-full px-4 py-3 text-xs text-[#111111] font-bold hover:bg-[#FCFBF9] hover:text-[#FF9900] cursor-pointer transition-colors flex items-center justify-between group text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-[#F7EBD7] text-[#111111] text-[10px] font-black flex items-center justify-center border border-[#FF9900]/25">
                              {getIniciais(item.nome)}
                            </span>
                            <span>{item.nome}</span>
                          </div>
                          <span className="text-[#68666B] group-hover:text-[#FF9900] text-[11px] font-medium transition-colors flex items-center gap-1">
                            <span>Entrar</span>
                            <IconArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
