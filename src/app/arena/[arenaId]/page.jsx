'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import ReplayThumbnail from '@/components/ReplayThumbnail';

const TAMANHO_PAGINA = 24;

// Ícones SVG minimalistas para substituir emojis e remover estética de IA
function IconMapPin({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

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

function IconDownload({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    );
}

function IconShare({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
        </svg>
    );
}

function IconPlay({ className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
    );
}

function IconVideoOff({ className = "w-7 h-7" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 16 5 3V5l-5 3" />
            <rect width="14" height="12" x="2" y="6" rx="2" />
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

function IconRefresh({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
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
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [erroArena, setErroArena] = useState(false);

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
    const [periodoFiltro, setPeriodoFiltro] = useState('todos'); // 'todos', 'manha', 'tarde', 'noite', ou hora exata '18', '19', etc.
    const [toastMensagem, setToastMensagem] = useState(null);
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const [dataVisualizacaoMes, setDataVisualizacaoMes] = useState(() => new Date());

    // Janela de retenção de 14 dias (hoje + 13 dias passados)
    const dataLimite14Dias = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 13);
        d.setHours(0, 0, 0, 0);
        return d;
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

    const diasCalendario = useMemo(() => {
        const ano = dataVisualizacaoMes.getFullYear();
        const mes = dataVisualizacaoMes.getMonth();
        const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
        const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

        const dias = [];
        for (let i = 0; i < primeiroDiaSemana; i++) {
            dias.push(null);
        }

        const hojeLimite = new Date();
        hojeLimite.setHours(23, 59, 59, 999);

        for (let dia = 1; dia <= totalDiasNoMes; dia++) {
            const dataObj = new Date(ano, mes, dia, 12, 0, 0);
            const ymd = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const dentroDos14Dias = dataObj >= dataLimite14Dias && dataObj <= hojeLimite;
            dias.push({
                numero: dia,
                dataStr: ymd,
                disponivel: dentroDos14Dias,
                selecionado: dataFiltro === ymd,
                ehHoje: ymd === hojeStr
            });
        }
        return dias;
    }, [dataVisualizacaoMes, dataLimite14Dias, dataFiltro, hojeStr]);

    const mesesNomes = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const mudarMes = (delta) => {
        setDataVisualizacaoMes((prev) => {
            const nova = new Date(prev);
            nova.setMonth(nova.getMonth() + delta);
            return nova;
        });
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

    useEffect(() => {
        if (quadras.length === 0) return;
        let cancelado = false;

        async function carregarPaginaInicial() {
            setCarregandoReplays(true);
            try {
                const { lista, total } = await executarConsultaReplays(0);
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

        carregarPaginaInicial();
        return () => {
            cancelado = true;
        };
    }, [quadras.length, executarConsultaReplays]);

    const carregarMaisReplays = async () => {
        setCarregandoMais(true);
        try {
            const { lista, total } = await executarConsultaReplays(replays.length);
            setReplays(prev => [...prev, ...lista]);
            setTotalReplays(total);
        } catch (err) {
            console.error('Erro ao carregar mais replays:', err);
        } finally {
            setCarregandoMais(false);
        }
    };

    const replaysFiltrados = replays;
    const temMaisReplays = replays.length < totalReplays;

    // Fecha o calendário com Escape
    useEffect(() => {
        if (!calendarioAberto) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setCalendarioAberto(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [calendarioAberto]);

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
            <header className="w-full max-w-xl flex justify-between items-center py-3 border-b border-zinc-200 mb-6 shrink-0 relative z-20">
                <button
                    onClick={() => router.push('/')}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[40px] cursor-pointer"
                >
                    <IconArrowLeft className="w-3.5 h-3.5" />
                    <span>Início</span>
                </button>
                <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => router.push('/')}>
                    <Image src="/logo-fox.jpeg" alt="Logo Fox Replay" width={24} height={24} priority className="h-6 w-6 object-cover rounded-md border border-zinc-200" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </h2>
                </div>
                <div className="w-[65px] h-[30px] opacity-0 pointer-events-none" />
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="w-full max-w-xl relative z-10 space-y-6">

                {/* HERO CARD DA ARENA COM LOGO FADE E IDENTIFICAÇÃO DA QUADRA */}
                <div className="relative overflow-hidden bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
                    {/* Fundo com efeito Fade da Logo da Arena */}
                    <div className="absolute right-[-20px] top-[-20px] bottom-[-20px] w-64 pointer-events-none select-none overflow-hidden opacity-[0.06] flex items-center justify-center">
                        {logoArena ? (
                            <Image src={logoArena} alt="" fill unoptimized className="object-contain filter grayscale scale-125" />
                        ) : (
                            <span className="text-[130px] font-black text-zinc-900 tracking-tighter">
                                {iniciaisArena}
                            </span>
                        )}
                    </div>

                    {/* Topo do Card: Avatar da Arena + Dados Principais */}
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-md border border-zinc-800 overflow-hidden relative">
                            {logoArena ? (
                                <Image src={logoArena} alt={arena?.nome || 'Arena'} fill unoptimized className="object-cover" />
                            ) : (
                                <span className="text-amber-400 tracking-wider">{iniciaisArena}</span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Complexo Oficial
                                </span>

                                {arena?.cidade && (
                                    <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
                                        <IconMapPin className="w-3 h-3 text-zinc-400" />
                                        <span>{arena.cidade}{arena.estado ? `, ${arena.estado}` : ''}</span>
                                    </span>
                                )}
                            </div>

                            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight uppercase truncate">
                                {arena?.nome}
                            </h1>

                            {/* Identificação Dinâmica da Quadra Ativa */}
                            <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-[11px] text-zinc-400 font-semibold">Exibindo:</span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-900 border border-amber-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {quadraSelecionadaObj ? quadraSelecionadaObj.nome : 'Todas as Quadras'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Seletor de Quadras Integrado */}
                    <div className="relative z-10 pt-4 mt-4 border-t border-zinc-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                Filtrar por Quadra
                            </span>
                            {quadras.length > 0 && (
                                <span className="text-[10px] text-zinc-400">
                                    {quadras.length} quadra{quadras.length > 1 ? 's' : ''} no complexo
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            <button
                                onClick={() => setQuadraAtiva('todas')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 ${
                                    quadraAtiva === 'todas'
                                        ? 'bg-zinc-900 text-white shadow-md font-black'
                                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:border-amber-400 hover:text-zinc-900'
                                }`}
                            >
                                Todas as Quadras
                            </button>

                            {quadras.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => setQuadraAtiva(q.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                                        quadraAtiva === q.id
                                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                                            : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:border-amber-400 hover:text-zinc-900'
                                    }`}
                                >
                                    {q.nome}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. BARRA DE FILTROS COMPACTA COM CALENDÁRIO (14 DIAS)        */}
                {/* ============================================================ */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-3 relative">
                    {/* Cabeçalho da barra de filtros */}
                    <div className="flex justify-between items-center px-0.5 gap-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                            <IconSliders className="w-3 h-3 text-zinc-400" />
                            <span>Filtro de Lances</span>
                        </span>
                        <div className="flex items-center gap-2">
                            {filtrosPersonalizadosAtivos && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuadraAtiva('todas');
                                        setPeriodoFiltro('todos');
                                        setDataFiltro(hojeStr);
                                        setCalendarioAberto(false);
                                    }}
                                    className="text-[10px] font-bold text-zinc-500 hover:text-amber-700 underline transition-colors"
                                >
                                    Limpar filtros
                                </button>
                            )}
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                                {totalReplays} lance{totalReplays === 1 ? '' : 's'}
                            </span>
                        </div>
                    </div>

                    {/* Linha 1: Filtro de Data */}
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            onClick={() => {
                                setDataFiltro(hojeStr);
                                setCalendarioAberto(false);
                            }}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center min-h-[42px] cursor-pointer active:scale-95 ${
                                dataFiltro === hojeStr
                                    ? 'bg-zinc-900 text-white shadow-sm font-black'
                                    : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                            Hoje
                        </button>

                        <button
                            onClick={() => {
                                setDataFiltro(ontemStr);
                                setCalendarioAberto(false);
                            }}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center min-h-[42px] cursor-pointer active:scale-95 ${
                                dataFiltro === ontemStr
                                    ? 'bg-zinc-900 text-white shadow-sm font-black'
                                    : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                            Ontem
                        </button>

                        <button
                            onClick={() => setCalendarioAberto(!calendarioAberto)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border text-center min-h-[42px] cursor-pointer active:scale-95 ${
                                dataFiltro !== hojeStr && dataFiltro !== ontemStr
                                    ? 'bg-amber-500 text-black border-amber-500 shadow-sm font-black'
                                    : calendarioAberto
                                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                            <IconCalendar className="w-3.5 h-3.5 opacity-70" />
                            <span>{dataFiltro !== hojeStr && dataFiltro !== ontemStr ? formatarDataAmigavel(dataFiltro) : 'Outra Data'}</span>
                        </button>
                    </div>

                    {/* POPUP / MODAL DE CALENDÁRIO COM RETENÇÃO DE 14 DIAS */}
                    {calendarioAberto && (
                        <div className="p-3.5 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 space-y-3 animate-fadeIn">
                            {/* Topo do calendário: Navegação de Mês */}
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                                    {mesesNomes[dataVisualizacaoMes.getMonth()]} {dataVisualizacaoMes.getFullYear()}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => mudarMes(-1)}
                                        aria-label="Mês anterior"
                                        className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm font-bold active:scale-95 cursor-pointer"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => mudarMes(1)}
                                        aria-label="Próximo mês"
                                        className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm font-bold active:scale-95 cursor-pointer"
                                    >
                                        ›
                                    </button>
                                    <button
                                        onClick={() => setCalendarioAberto(false)}
                                        aria-label="Fechar calendário"
                                        className="ml-1 w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold active:scale-95 cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Aviso de retenção de 14 dias */}
                            <p className="text-[10px] text-zinc-400 font-medium">
                                Retenção em nuvem de 14 dias para gravação e download.
                            </p>

                            {/* Dias da semana */}
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 uppercase">
                                <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                            </div>

                            {/* Grid dos dias */}
                            <div className="grid grid-cols-7 gap-1">
                                {diasCalendario.map((item, idx) => {
                                    if (!item) {
                                        return <div key={`vazio-${idx}`} className="h-9 w-full" />;
                                    }
                                    return (
                                        <button
                                            key={item.dataStr}
                                            disabled={!item.disponivel}
                                            onClick={() => {
                                                setDataFiltro(item.dataStr);
                                                setCalendarioAberto(false);
                                            }}
                                            className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer active:scale-95 ${
                                                item.selecionado
                                                    ? 'bg-amber-500 text-black font-black shadow-md'
                                                    : item.disponivel
                                                    ? 'bg-zinc-900 hover:bg-amber-500/20 hover:text-amber-300 text-white border border-zinc-800'
                                                    : 'text-zinc-600 bg-transparent opacity-25 cursor-not-allowed'
                                            }`}
                                        >
                                            <span>{item.numero}</span>
                                            {item.ehHoje && !item.selecionado && (
                                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Linha 2: Faixa de Horário e Seletor Fino Compactos */}
                    <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 py-0.5">
                            {[
                                { id: 'todos', label: 'Todos' },
                                { id: 'manha', label: '06h-12h' },
                                { id: 'tarde', label: '12h-18h' },
                                { id: 'noite', label: '18h-00h' },
                            ].map((turno) => (
                                <button
                                    key={turno.id}
                                    onClick={() => setPeriodoFiltro(turno.id)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[38px] cursor-pointer active:scale-95 ${
                                        periodoFiltro === turno.id
                                            ? 'bg-amber-500 text-black font-black shadow-sm'
                                            : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                    {turno.label}
                                </button>
                            ))}
                        </div>

                        {/* Dropdown compacto para hora exata */}
                        <select
                            value={['todos', 'manha', 'tarde', 'noite'].includes(periodoFiltro) ? '' : periodoFiltro}
                            onChange={(e) => setPeriodoFiltro(e.target.value || 'todos')}
                            aria-label="Filtrar por hora exata"
                            className="py-2 px-2.5 rounded-xl text-xs font-bold bg-zinc-50 border border-zinc-200 text-zinc-700 focus:outline-none focus:border-amber-500 cursor-pointer min-h-[38px]"
                        >
                            <option value="">Hora exata ▾</option>
                            {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                                <option key={h} value={String(h)}>
                                    {String(h).padStart(2, '0')}:00 - {String(h + 1).padStart(2, '0')}:00
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 3. FEED DE REPLAYS (CARDS MODERNOS BENTO)                    */}
                {/* ============================================================ */}
                <div className="space-y-4">
                    {carregandoReplays ? (
                        <div className="py-16 text-center space-y-3">
                            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="animate-pulse text-zinc-400 font-bold text-xs uppercase tracking-wider">
                                Carregando replays...
                            </p>
                        </div>
                    ) : replaysFiltrados.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                                <IconVideoOff className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
                                Nenhum lance gravado
                            </h4>
                            <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
                                Não encontramos vídeos nesta quadra com o filtro selecionado. Tente selecionar &quot;Todos&quot; ou outra data.
                            </p>
                            <button
                                onClick={() => {
                                    setQuadraAtiva('todas');
                                    setPeriodoFiltro('todos');
                                    setDataFiltro(hojeStr);
                                }}
                                className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
                            >
                                <IconRefresh className="w-3.5 h-3.5" />
                                <span>Redefinir Filtros</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {replaysFiltrados.map((replay) => {
                                const dataLance = replay.criado_em ? new Date(replay.criado_em) : null;
                                const horarioFormatado = dataLance
                                    ? dataLance.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                    : 'Recente';

                                const nomeQuadra = replay.quadras?.nome || 'Quadra';

                                return (
                                    <div
                                        key={replay.id}
                                        onClick={() => router.push(`/jogada?id=${replay.id}`)}
                                        className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden hover:border-amber-400 transition-all shadow-md shadow-zinc-200/30 flex flex-col group cursor-pointer active:scale-[0.99]"
                                    >
                                        {/* Header do Card */}
                                        <div className="p-3.5 pb-2.5 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {nomeQuadra}
                                            </span>
                                            <span className="text-xs font-bold text-zinc-700 tracking-wide flex items-center gap-1">
                                                <IconClock className="w-3 h-3 text-zinc-400" />
                                                <span>{horarioFormatado}</span>
                                            </span>
                                        </div>

                                        {/* Thumbnail / Miniatura leve com Lazy Loading */}
                                        <div className="w-full aspect-video bg-black relative overflow-hidden group">
                                            <ReplayThumbnail
                                                thumbnailUrl={replay.thumbnail_url}
                                                videoUrl={replay.video_url}
                                                alt={`Lance na ${nomeQuadra} às ${horarioFormatado}`}
                                            />
                                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-all group-hover:bg-black/10 pointer-events-none">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black flex items-center justify-center pl-0.5 font-bold shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                                    <IconPlay className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações Rápidas do Card */}
                                        <div className="p-3 bg-white grid grid-cols-2 gap-2 border-t border-zinc-100">
                                            <button
                                                onClick={(e) => abrirDownloadComMarcas(e, replay.id)}
                                                title="Baixar vídeo 9:16 com marca da arena e patrocinadores"
                                                className="py-3 px-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                                            >
                                                <span>Baixar</span>
                                                <IconDownload className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                onClick={(e) => compartilharLance(e, replay.id, nomeQuadra)}
                                                className="py-3 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                                            >
                                                <span>Compartilhar</span>
                                                <IconShare className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* BOTÃO DE PAGINAÇÃO REAL */}
                    {!carregandoReplays && temMaisReplays && (
                        <div className="pt-2 text-center space-y-2">
                            <p className="text-[11px] text-zinc-500 font-medium">
                                Exibindo {replays.length} de {totalReplays} lances
                            </p>
                            <button
                                type="button"
                                disabled={carregandoMais}
                                onClick={carregarMaisReplays}
                                className="px-6 py-3 bg-white hover:bg-amber-50 border border-zinc-200 hover:border-amber-400 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {carregandoMais ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Carregando mais lances...</span>
                                    </>
                                ) : (
                                    <span>Carregar mais lances ({totalReplays - replays.length} restantes)</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

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
