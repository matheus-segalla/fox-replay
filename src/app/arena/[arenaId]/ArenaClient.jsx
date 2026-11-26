'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { IconMapPin, IconRefresh } from '@/components/icons';
import ArenaReplaysGrid from './components/ArenaReplaysGrid';

const TAMANHO_PAGINA = 12;

function IconCalendar({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}

function IconClock({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function IconArrowLeft({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function IconSliders({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="4" y1="21" y2="14" />
            <line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" />
            <line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" />
            <line x1="20" x2="20" y1="12" y2="3" />
            <line x1="1" x2="7" y1="14" y2="14" />
            <line x1="9" x2="15" y1="8" y2="8" />
            <line x1="17" x2="23" y1="16" y2="16" />
        </svg>
    );
}

function ConteudoPortalArena() {
    const params = useParams();
    const searchParams = useSearchParams();
    const arenaId = params.arenaId;
    const router = useRouter();

    // Dados da Arena e Quadras
    const [arena, setArena] = useState(null);
    const [quadras, setQuadras] = useState([]);
    const [replays, setReplays] = useState([]);
    const [totalReplays, setTotalReplays] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [carregandoReplays, setCarregandoReplays] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [erroArena, setErroArena] = useState(false);
    const feedTopRef = useRef(null);

    // Estados de Filtro
    const [quadraAtiva, setQuadraAtiva] = useState(searchParams.get('quadra') || 'todas');

    // Helper para identificar a quadra selecionada
    const quadraSelecionadaObj = useMemo(() => {
        if (quadraAtiva === 'todas') return null;
        return quadras.find(q => q.id === quadraAtiva) || null;
    }, [quadras, quadraAtiva]);

    // Monograma da Arena como fallback de identidade visual
    const iniciaisArena = useMemo(() => {
        if (!arena?.nome) return 'FR';
        const partes = arena.nome.trim().split(/\s+/);
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }, [arena]);

    const logoArena = arena?.logo_url || arena?.foto_url || null;
    
    // Data padrão: hoje em YYYY-MM-DD local
    const hojeStr = useMemo(() => {
        const d = new Date();
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }, []);

    const ontemStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }, []);

    const [dataFiltro, setDataFiltro] = useState(hojeStr);
    const [periodoFiltro, setPeriodoFiltro] = useState('todos'); // 'todos' ou hora exata '6', '7', ... '23'
    const [toastMensagem, setToastMensagem] = useState(null);
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const [menuHoraAberto, setMenuHoraAberto] = useState(false);
    const [menuQuadraAberto, setMenuQuadraAberto] = useState(false);

    // Faixas horárias de 1 hora (06:00 às 23:00)
    const faixasHorario = useMemo(() => {
        return Array.from({ length: 18 }, (_, i) => {
            const h = i + 6;
            return {
                id: String(h),
                label: `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`,
                curto: `${String(h).padStart(2, '0')}h - ${String(h + 1).padStart(2, '0')}h`,
            };
        });
    }, []);

    const rotuloHoraSelecionada = useMemo(() => {
        if (periodoFiltro === 'todos') return 'Horário ▾';
        const encontrada = faixasHorario.find((f) => f.id === periodoFiltro);
        return encontrada ? `${encontrada.curto} ▾` : 'Horário ▾';
    }, [periodoFiltro, faixasHorario]);

    // Janela de retenção de 5 dias (hoje + 4 dias anteriores)
    const diasDisponiveis = useMemo(() => {
        const diasSemana = [
            'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
            'Quinta-feira', 'Sexta-feira', 'Sábado',
        ];
        const lista = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ano = d.getFullYear();
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const dia = String(d.getDate()).padStart(2, '0');
            const ymd = `${ano}-${mes}-${dia}`;
            let rotulo = diasSemana[d.getDay()];
            if (i === 0) rotulo = 'Hoje';
            else if (i === 1) rotulo = 'Ontem';
            lista.push({
                dataStr: ymd,
                rotulo,
                dataCurta: `${dia}/${mes}`,
                ehHoje: i === 0,
            });
        }
        return lista;
    }, []);

    const formatarDataAmigavel = (dataYmd) => {
        if (!dataYmd) return '';
        if (dataYmd === hojeStr) return 'Hoje';
        if (dataYmd === ontemStr) return 'Ontem';
        const partes = dataYmd.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}`;
        }
        return dataYmd;
    };

    const exibirToast = (msg) => {
        setToastMensagem(msg);
        setTimeout(() => setToastMensagem(null), 3000);
    };

    // 1. Carrega dados básicos da Arena e suas Quadras
    useEffect(() => {
        async function carregarArenaEQuadras() {
            try {
                const { data: dadosArena, error: errA } = await supabase
                    .from('arenas')
                    .select('*')
                    .eq('id', arenaId)
                    .single();

                if (errA) throw errA;
                setArena(dadosArena);

                // Salva no localStorage como última arena visitada
                try {
                    localStorage.setItem('fox_ultima_arena', JSON.stringify({
                        id: dadosArena.id,
                        nome: dadosArena.nome,
                        cidade: dadosArena.cidade,
                        estado: dadosArena.estado
                    }));
                } catch (e) {}

                const { data: dadosQuadras, error: errQ } = await supabase
                    .from('quadras')
                    .select('id, nome, status, foto_url')
                    .eq('arena_id', arenaId)
                    .order('nome', { ascending: true });

                if (errQ) throw errQ;
                setQuadras(dadosQuadras || []);

            } catch (error) {
                console.error('Erro ao carregar arena:', error);
                setErroArena(true);
            } finally {
                setCarregando(false);
            }
        }

        if (arenaId) carregarArenaEQuadras();
    }, [arenaId]);

    // 2. Helper puro de consulta paginada no SQL (data + faixa de horário)
    const executarConsultaReplays = useCallback(async (offset = 0) => {
        const idsDasQuadras = quadras.map(q => q.id);
        if (idsDasQuadras.length === 0) {
            return { lista: [], total: 0 };
        }

        const [ano, mes, dia] = dataFiltro.split('-').map(Number);
        let horaInicio = 0;
        let horaFim = 23;

        if (periodoFiltro === 'manha') {
            horaInicio = 6;
            horaFim = 11;
        } else if (periodoFiltro === 'tarde') {
            horaInicio = 12;
            horaFim = 17;
        } else if (periodoFiltro === 'noite') {
            horaInicio = 18;
            horaFim = 23;
        } else if (periodoFiltro !== 'todos') {
            const horaNum = parseInt(periodoFiltro, 10);
            if (!Number.isNaN(horaNum)) {
                horaInicio = horaNum;
                horaFim = horaNum;
            }
        }

        const inicioRange = new Date(ano, mes - 1, dia, horaInicio, 0, 0, 0);
        const fimRange = new Date(ano, mes - 1, dia, horaFim, 59, 59, 999);

        const montarQuery = (incluirThumbnail) => {
            const campos = incluirThumbnail
                ? 'id, quadra_id, video_url, thumbnail_url, criado_em, quadras(id, nome)'
                : 'id, quadra_id, video_url, criado_em, quadras(id, nome)';

            let q = supabase
                .from('replays')
                .select(campos, { count: 'exact' })
                .gte('criado_em', inicioRange.toISOString())
                .lte('criado_em', fimRange.toISOString())
                .order('criado_em', { ascending: false })
                .range(offset, offset + TAMANHO_PAGINA - 1);

            if (quadraAtiva !== 'todas') {
                q = q.eq('quadra_id', quadraAtiva);
            } else {
                q = q.in('quadra_id', idsDasQuadras);
            }
            return q;
        };

        let { data, error, count } = await montarQuery(true);

        // Fallback seguro caso a migração SQL (coluna thumbnail_url) ainda não tenha sido aplicada
        if (error && (error.code === '42703' || String(error.message || '').includes('thumbnail_url'))) {
            const fallback = await montarQuery(false);
            data = fallback.data;
            error = fallback.error;
            count = fallback.count;
        }

        if (error) throw error;

        const lista = data || [];
        const total = typeof count === 'number' ? count : offset + lista.length;
        return { lista, total };
    }, [quadras, dataFiltro, periodoFiltro, quadraAtiva]);

    const aplicarQuadra = (novaQuadra) => {
        setQuadraAtiva(novaQuadra);
        setPaginaAtual(1);
    };

    const aplicarData = (novaData) => {
        setDataFiltro(novaData);
        setPaginaAtual(1);
    };

    const aplicarPeriodo = (novoPeriodo) => {
        setPeriodoFiltro(novoPeriodo);
        setPaginaAtual(1);
    };

    const redefinirFiltros = () => {
        setQuadraAtiva('todas');
        setPeriodoFiltro('todos');
        setDataFiltro(hojeStr);
        setPaginaAtual(1);
        setCalendarioAberto(false);
        setMenuHoraAberto(false);
        setMenuQuadraAberto(false);
    };

    useEffect(() => {
        if (quadras.length === 0) return;
        let cancelado = false;

        async function carregarPagina() {
            setCarregandoReplays(true);
            try {
                const offset = (paginaAtual - 1) * TAMANHO_PAGINA;
                const { lista, total } = await executarConsultaReplays(offset);
                if (!cancelado) {
                    setReplays(lista);
                    setTotalReplays(total);
                }
            } catch (err) {
                console.error('Erro ao buscar replays:', err);
            } finally {
                if (!cancelado) setCarregandoReplays(false);
            }
        }

        carregarPagina();
        return () => {
            cancelado = true;
        };
    }, [quadras.length, executarConsultaReplays, paginaAtual]);

    const totalPaginas = Math.max(1, Math.ceil(totalReplays / TAMANHO_PAGINA));

    const mudarPagina = (novaPagina) => {
        const alvo = Math.max(1, Math.min(totalPaginas, novaPagina));
        if (alvo === paginaAtual) return;
        setPaginaAtual(alvo);
        if (feedTopRef.current) {
            feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const paginasVisiveis = useMemo(() => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const lista = [1];
        const inicio = Math.max(2, paginaAtual - 1);
        const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
        if (inicio > 2) lista.push('...');
        for (let i = inicio; i <= fim; i++) lista.push(i);
        if (fim < totalPaginas - 1) lista.push('...');
        lista.push(totalPaginas);
        return lista;
    }, [totalPaginas, paginaAtual]);

    const replaysFiltrados = replays;

    const filtrosContainerRef = useRef(null);

    // Fecha os menus flutuantes com Escape ou clique fora
    useEffect(() => {
        if (!calendarioAberto && !menuHoraAberto && !menuQuadraAberto) return;

        const fecharTudo = () => {
            setCalendarioAberto(false);
            setMenuHoraAberto(false);
            setMenuQuadraAberto(false);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') fecharTudo();
        };

        const onPointerDown = (e) => {
            if (filtrosContainerRef.current && !filtrosContainerRef.current.contains(e.target)) {
                fecharTudo();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
        };
    }, [calendarioAberto, menuHoraAberto, menuQuadraAberto]);

    const filtrosPersonalizadosAtivos =
        quadraAtiva !== 'todas' || periodoFiltro !== 'todos' || dataFiltro !== hojeStr;

    // Todos os downloads passam pela composição 9:16 com marca da Arena e 4 Patrocinadores
    const abrirDownloadComMarcas = (e, id) => {
        e.stopPropagation();
        router.push(`/jogada?id=${id}&baixar=1`);
    };

    // Compartilhamento rápido
    const compartilharLance = async (e, replayId, nomeQuadra) => {
        e.stopPropagation();
        const urlLance = `${window.location.origin}/jogada?id=${replayId}`;
        const texto = `Veja o lance gravado na ${nomeQuadra || 'quadra'} da ${arena?.nome || 'Fox Replay'}:`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Fox Replay - Lance na ${nomeQuadra || 'quadra'}`,
                    text: texto,
                    url: urlLance,
                });
                return;
            } catch (err) {
                // Usuário cancelou ou navegador não completou
            }
        }

        try {
            await navigator.clipboard.writeText(urlLance);
            exibirToast('Link do replay copiado!');
        } catch (err) {
            exibirToast('Link: ' + urlLance);
        }
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-zinc-500 font-bold tracking-widest text-xs uppercase">Conectando ao Complexo...</p>
                </div>
            </div>
        );
    }

    if (erroArena || !arena) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-amber-400 flex items-center justify-center font-black text-xl">
                    FR
                </div>
                <h1 className="text-lg font-black text-zinc-900 uppercase">Arena não encontrada</h1>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                    Não conseguimos localizar este complexo esportivo. Verifique o link ou pesquise a arena na página inicial.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-zinc-50 text-zinc-900 font-sans p-4 pb-16 flex flex-col items-center relative overflow-x-hidden safe-pb">
            {/* Linhas de fundo e glow */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />

            {/* TOAST FLUTUANTE */}
            {toastMensagem && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-zinc-700 animate-fadeIn flex items-center gap-2 safe-pt">
                    <span>{toastMensagem}</span>
                </div>
            )}

            {/* HEADER CLEAN */}
            <header className="w-full max-w-6xl flex justify-between items-center py-2.5 border-b border-zinc-200/80 mb-3.5 shrink-0 relative z-20">
                <button
                    onClick={() => router.push('/')}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[36px] cursor-pointer"
                >
                    <IconArrowLeft className="w-3.5 h-3.5" />
                    <span>Início</span>
                </button>
                <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => router.push('/')}>
                    <Image src="/logo-fox.jpeg" alt="Logo Fox Replay" width={22} height={22} priority className="h-5.5 w-5.5 object-cover rounded-md border border-zinc-200" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </h2>
                </div>
                <div className="w-[60px] h-[28px] opacity-0 pointer-events-none" />
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="w-full max-w-6xl relative z-10 space-y-5">

                {/* CARD UNIFICADO DA ARENA, QUADRAS E FILTROS (CENTRALIZADO E COMPACTO) */}
                <div
                    ref={filtrosContainerRef}
                    className="w-full max-w-2xl mx-auto relative z-30 overflow-visible bg-white border border-zinc-200/80 rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-2.5"
                >
                    {/* Fundo sutil com fade da logo da Arena (com overflow-hidden próprio para não cortar dropdowns) */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none select-none">
                        <div className="absolute right-[-15px] top-[-15px] bottom-[-15px] w-48 opacity-[0.04] flex items-center justify-center">
                            {logoArena ? (
                                <Image src={logoArena} alt="" fill unoptimized className="object-contain filter grayscale scale-125" />
                            ) : (
                                <span className="text-[100px] font-black text-zinc-900 tracking-tighter">
                                    {iniciaisArena}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Topo do Módulo: Avatar + Nome + Cidade | Botão Selecionar Quadra */}
                    <div className="relative z-20 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-zinc-800 overflow-hidden relative">
                                {logoArena ? (
                                    <Image src={logoArena} alt={arena?.nome || 'Arena'} fill unoptimized className="object-cover" />
                                ) : (
                                    <span className="text-amber-400 tracking-wider text-xs">{iniciaisArena}</span>
                                )}
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight uppercase truncate">
                                    {arena?.nome}
                                </h1>
                                {arena?.cidade && (
                                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium truncate">
                                        <IconMapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                                        <span className="truncate">{arena.cidade}{arena.estado ? `, ${arena.estado}` : ''}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botão Único Dinâmico de Selecionar Quadra (com Popover Flutuante) */}
                        {quadras.length > 0 && (
                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuQuadraAberto(!menuQuadraAberto);
                                        setCalendarioAberto(false);
                                        setMenuHoraAberto(false);
                                    }}
                                    className={`h-8 max-w-[155px] sm:max-w-[190px] px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                                        quadraAtiva !== 'todas'
                                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                            : menuQuadraAberto
                                            ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                                            : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                                    }`}
                                >
                                    <span className="truncate">
                                        {quadraSelecionadaObj ? quadraSelecionadaObj.nome : 'Todas as Quadras'}
                                    </span>
                                    <span className="shrink-0 text-[10px] opacity-60">▾</span>
                                </button>

                                {/* DROPDOWN FLUTUANTE CLEAN DE QUADRA */}
                                {menuQuadraAberto && (
                                    <div className="absolute right-0 top-full mt-1.5 w-60 sm:w-64 p-2.5 bg-white/95 backdrop-blur-md text-zinc-900 rounded-2xl shadow-[0_14px_40px_-10px_rgba(0,0,0,0.14)] border border-zinc-200/90 space-y-2 z-50 animate-fadeIn">
                                        <div className="flex items-center justify-between px-1 pb-1.5 border-b border-zinc-100">
                                            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                                                Selecionar Quadra
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setMenuQuadraAberto(false)}
                                                aria-label="Fechar seletor de quadra"
                                                className="w-6 h-6 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center text-sm font-bold cursor-pointer"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto overscroll-contain scrollbar-none">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    aplicarQuadra('todas');
                                                    setMenuQuadraAberto(false);
                                                }}
                                                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                                                    quadraAtiva === 'todas'
                                                        ? 'bg-zinc-900 text-white font-bold'
                                                        : 'hover:bg-zinc-100 text-zinc-700'
                                                }`}
                                            >
                                                <span className="truncate">Todas as Quadras</span>
                                                {quadraAtiva === 'todas' && <span className="text-xs">✓</span>}
                                            </button>

                                            {quadras.map((q) => {
                                                const selecionada = quadraAtiva === q.id;
                                                return (
                                                    <button
                                                        key={q.id}
                                                        type="button"
                                                        onClick={() => {
                                                            aplicarQuadra(q.id);
                                                            setMenuQuadraAberto(false);
                                                        }}
                                                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                                                            selecionada
                                                                ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                                                                : 'hover:bg-zinc-100 text-zinc-700'
                                                        }`}
                                                    >
                                                        <span className="truncate">{q.nome}</span>
                                                        {selecionada && <span className="text-xs text-amber-600">✓</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Toolbar de Filtros: 4 Botões Sutis na Mesma Linha */}
                    <div className="relative z-10 pt-2 border-t border-zinc-100">
                        <div className="flex items-center gap-1.5">
                            <div className="grid grid-cols-4 gap-1.5 flex-1 min-w-0">
                                {/* 1. Hoje */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        aplicarData(hojeStr);
                                        setCalendarioAberto(false);
                                        setMenuHoraAberto(false);
                                        setMenuQuadraAberto(false);
                                    }}
                                    className={`h-8 px-1.5 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all text-center cursor-pointer active:scale-95 truncate border ${
                                        dataFiltro === hojeStr
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs font-bold'
                                            : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                    }`}
                                >
                                    Hoje
                                </button>

                                {/* 2. Outra Data */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarioAberto(!calendarioAberto);
                                        setMenuHoraAberto(false);
                                        setMenuQuadraAberto(false);
                                    }}
                                    className={`h-8 px-1.5 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 border text-center cursor-pointer active:scale-95 min-w-0 ${
                                        dataFiltro !== hojeStr
                                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                            : calendarioAberto
                                            ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                                            : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                    }`}
                                >
                                    <IconCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 shrink-0 hidden xs:inline" />
                                    <span className="truncate">{dataFiltro !== hojeStr ? formatarDataAmigavel(dataFiltro) : 'Data'}</span>
                                </button>

                                {/* 3. Todos */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        aplicarPeriodo('todos');
                                        setMenuHoraAberto(false);
                                        setCalendarioAberto(false);
                                        setMenuQuadraAberto(false);
                                    }}
                                    className={`h-8 px-1.5 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all text-center cursor-pointer active:scale-95 truncate border ${
                                        periodoFiltro === 'todos'
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs font-bold'
                                            : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                    }`}
                                >
                                    Todos
                                </button>

                                {/* 4. Horário */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuHoraAberto(!menuHoraAberto);
                                        setCalendarioAberto(false);
                                        setMenuQuadraAberto(false);
                                    }}
                                    className={`h-8 px-1.5 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 border text-center cursor-pointer active:scale-95 min-w-0 ${
                                        periodoFiltro !== 'todos'
                                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                            : menuHoraAberto
                                            ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                                            : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                    }`}
                                >
                                    <IconClock className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 shrink-0 hidden xs:inline" />
                                    <span className="truncate">{rotuloHoraSelecionada}</span>
                                </button>
                            </div>

                            {filtrosPersonalizadosAtivos && (
                                <button
                                    type="button"
                                    onClick={redefinirFiltros}
                                    title="Limpar todos os filtros"
                                    className="h-8 w-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-500 hover:text-zinc-900 transition-colors shrink-0 flex items-center justify-center active:scale-95 cursor-pointer"
                                >
                                    <IconRefresh className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* DROPDOWN FLUTUANTE CLEAN DE DATAS (5 DIAS DISPONÍVEIS) */}
                        {calendarioAberto && (
                            <div className="absolute left-0 right-0 sm:left-auto sm:w-72 top-full mt-1.5 p-3 bg-white/95 backdrop-blur-md text-zinc-900 rounded-2xl shadow-[0_14px_40px_-10px_rgba(0,0,0,0.14)] border border-zinc-200/90 space-y-2 z-50 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                                        Últimos 5 Dias
                                    </span>
                                    <button
                                        onClick={() => setCalendarioAberto(false)}
                                        aria-label="Fechar seletor de datas"
                                        className="w-6 h-6 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center text-sm font-bold active:scale-95 cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {diasDisponiveis.map((item) => {
                                        const selecionado = dataFiltro === item.dataStr;
                                        return (
                                            <button
                                                key={item.dataStr}
                                                onClick={() => {
                                                    aplicarData(item.dataStr);
                                                    setCalendarioAberto(false);
                                                }}
                                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                                                    selecionado
                                                        ? 'bg-zinc-900 text-white font-bold shadow-xs'
                                                        : 'bg-zinc-50 hover:bg-amber-50 hover:text-amber-900 text-zinc-800 border border-zinc-200/70'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {item.ehHoje && (
                                                        <span className={`w-1.5 h-1.5 rounded-full ${selecionado ? 'bg-amber-400' : 'bg-amber-500'}`} />
                                                    )}
                                                    <span>{item.rotulo}</span>
                                                </span>
                                                <span className={`text-[11px] font-mono ${selecionado ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                                    {item.dataCurta}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="text-[10px] text-zinc-400 font-medium pt-0.5">
                                    Retenção em nuvem de 5 dias para gravação e download.
                                </p>
                            </div>
                        )}

                        {/* DROPDOWN FLUTUANTE CLEAN DE HORÁRIO (SOBREPÕE SEM EXPANDIR O CARD) */}
                        {menuHoraAberto && (
                            <div className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 p-3 bg-white/95 backdrop-blur-md text-zinc-900 rounded-2xl shadow-[0_14px_40px_-10px_rgba(0,0,0,0.14)] border border-zinc-200/90 space-y-2.5 z-50 animate-fadeIn">
                                {/* Topo do Menu: Título e Botão Fechar */}
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                                        <IconClock className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Filtrar por Horário</span>
                                    </div>
                                    <button
                                        onClick={() => setMenuHoraAberto(false)}
                                        aria-label="Fechar seletor de horários"
                                        className="w-6 h-6 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center text-sm font-bold active:scale-95 cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Opção Rápida: Todos os horários */}
                                <button
                                    onClick={() => {
                                        aplicarPeriodo('todos');
                                        setMenuHoraAberto(false);
                                    }}
                                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center cursor-pointer ${
                                        periodoFiltro === 'todos'
                                            ? 'bg-zinc-900 text-white font-bold'
                                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/70'
                                    }`}
                                >
                                    <span>Todos os horários do dia</span>
                                </button>

                                {/* Grade de 2 colunas com as faixas de 1 hora com scroll seguro anti-overflow */}
                                <div className="grid grid-cols-2 gap-1 max-h-[220px] overflow-y-auto overscroll-contain pr-0.5 scrollbar-none">
                                    {faixasHorario.map((faixa) => {
                                        const selecionado = periodoFiltro === faixa.id;
                                        return (
                                            <button
                                                key={faixa.id}
                                                onClick={() => {
                                                    aplicarPeriodo(faixa.id);
                                                    setMenuHoraAberto(false);
                                                }}
                                                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center text-center cursor-pointer active:scale-95 ${
                                                    selecionado
                                                        ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                                                        : 'bg-zinc-50/80 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/60'
                                                }`}
                                            >
                                                {faixa.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 3. FEED DE REPLAYS (GRID RESPONSIVO ATÉ 4 COLUNAS NO DESKTOP)*/}
                {/* ============================================================ */}
                <ArenaReplaysGrid
                    feedTopRef={feedTopRef}
                    carregandoReplays={carregandoReplays}
                    replaysFiltrados={replaysFiltrados}
                    redefinirFiltros={redefinirFiltros}
                    abrirDownloadComMarcas={abrirDownloadComMarcas}
                    compartilharLance={compartilharLance}
                    totalPaginas={totalPaginas}
                    paginaAtual={paginaAtual}
                    tamanhoPagina={TAMANHO_PAGINA}
                    totalReplays={totalReplays}
                    paginasVisiveis={paginasVisiveis}
                    mudarPagina={mudarPagina}
                />

                <p className="text-[9px] text-zinc-400 text-center tracking-widest uppercase font-bold pt-8">
                    Powered by <span className="font-black text-zinc-600 tracking-normal">FOX <span className="text-amber-500">REPLAY</span></span>
                </p>
            </main>
        </div>
    );
}

export default function PortalArenaUnificado() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                    <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="animate-pulse text-zinc-500 font-bold tracking-widest text-xs uppercase">
                            Conectando ao Complexo...
                        </p>
                    </div>
                </div>
            }
        >
            <ConteudoPortalArena />
        </Suspense>
    );
}
