'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function PortalArenaUnificado() {
    const params = useParams();
    const searchParams = useSearchParams();
    const arenaId = params.arenaId;
    const router = useRouter();

    // Dados da Arena e Quadras
    const [arena, setArena] = useState(null);
    const [quadras, setQuadras] = useState([]);
    const [replays, setReplays] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoReplays, setCarregandoReplays] = useState(false);

    // Estados de Filtro
    const [quadraAtiva, setQuadraAtiva] = useState(searchParams.get('quadra') || 'todas');
    
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
            } finally {
                setCarregando(false);
            }
        }

        if (arenaId) carregarArenaEQuadras();
    }, [arenaId]);

    // 2. Carrega os replays da data selecionada
    useEffect(() => {
        async function carregarReplays() {
            if (!quadras.length && !arenaId) return;

            setCarregandoReplays(true);
            try {
                // Monta o range do dia selecionado (00:00:00 até 23:59:59)
                const [ano, mes, dia] = dataFiltro.split('-').map(Number);
                const inicioDia = new Date(ano, mes - 1, dia, 0, 0, 0);
                const fimDia = new Date(ano, mes - 1, dia, 23, 59, 59, 999);

                const idsDasQuadras = quadras.map(q => q.id);
                if (idsDasQuadras.length === 0) {
                    setReplays([]);
                    setCarregandoReplays(false);
                    return;
                }

                let query = supabase
                    .from('replays')
                    .select(`
                        id,
                        quadra_id,
                        video_url,
                        criado_em,
                        quadras (
                            id,
                            nome
                        )
                    `)
                    .gte('criado_em', inicioDia.toISOString())
                    .lte('criado_em', fimDia.toISOString())
                    .order('criado_em', { ascending: false });

                // Filtra por quadra se uma estiver selecionada
                if (quadraAtiva !== 'todas') {
                    query = query.eq('quadra_id', quadraAtiva);
                } else {
                    query = query.in('quadra_id', idsDasQuadras);
                }

                const { data, error } = await query.limit(60);
                if (error) throw error;
                setReplays(data || []);
            } catch (err) {
                console.error('Erro ao buscar replays:', err);
            } finally {
                setCarregandoReplays(false);
            }
        }

        if (quadras.length > 0) {
            carregarReplays();
        }
    }, [arenaId, quadras, dataFiltro, quadraAtiva]);

    // 3. Filtro de Período / Horário em memória no fuso local
    const replaysFiltrados = useMemo(() => {
        if (periodoFiltro === 'todos') return replays;

        return replays.filter((replay) => {
            if (!replay.criado_em) return true;
            const dataLance = new Date(replay.criado_em);
            const hora = dataLance.getHours();

            if (periodoFiltro === 'manha') return hora >= 6 && hora < 12;
            if (periodoFiltro === 'tarde') return hora >= 12 && hora < 18;
            if (periodoFiltro === 'noite') return hora >= 18 || hora < 6;

            // Se for hora exata (ex: '18')
            const horaNum = parseInt(periodoFiltro, 10);
            return hora === horaNum;
        });
    }, [replays, periodoFiltro]);

    // Função de Download Seguro com Fallback
    const baixarDireto = async (e, videoUrl, id) => {
        e.stopPropagation();
        const nomeArquivo = `fox-replay-${id ? id.substring(0, 8) : 'lance'}.mp4`;
        exibirToast('Iniciando download... 📥');
        try {
            const resposta = await fetch(videoUrl, { mode: 'cors' });
            if (!resposta.ok) throw new Error('Falha HTTP');
            const blob = await resposta.blob();
            const urlBlob = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);
            exibirToast('Download concluído! 🎾');
        } catch (err) {
            console.warn('Fallback download direto:', err);
            const link = document.createElement('a');
            link.href = videoUrl;
            link.target = '_blank';
            link.download = nomeArquivo;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Compartilhamento rápido
    const compartilharLance = async (e, replayId, nomeQuadra) => {
        e.stopPropagation();
        const urlLance = `${window.location.origin}/jogada?id=${replayId}`;
        const texto = `🔥 Veja meu lance incrível na ${nomeQuadra || 'quadra'} da ${arena?.nome || 'Fox Replay'}!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Fox Replay - Meu Lance',
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
            exibirToast('Link do lance copiado! 📋');
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

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 pb-16 flex flex-col items-center relative overflow-hidden">
            {/* Linhas de fundo e glow */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />

            {/* TOAST FLUTUANTE */}
            {toastMensagem && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-zinc-700 animate-fadeIn flex items-center gap-2">
                    <span>{toastMensagem}</span>
                </div>
            )}

            {/* HEADER CLEAN */}
            <header className="w-full max-w-xl flex justify-between items-center py-3 border-b border-zinc-200 mb-6 shrink-0 relative z-20">
                <button
                    onClick={() => router.push('/')}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95"
                >
                    ← Início
                </button>
                <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => router.push('/')}>
                    <img src="/logo-fox.jpeg" alt="Logo" className="h-6 w-6 object-cover rounded-md border border-zinc-200" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </h2>
                </div>
                <div className="w-[65px] h-[30px] opacity-0 pointer-events-none" />
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="w-full max-w-xl relative z-10 space-y-6">

                {/* IDENTIFICAÇÃO DA ARENA */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                            Complexo Parceiro Oficial
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 uppercase">
                        {arena?.nome}
                    </h1>

                    {arena?.cidade && (
                        <p className="text-xs font-bold text-zinc-400">
                            📍 {arena.cidade} {arena.estado ? `• ${arena.estado}` : ''}
                        </p>
                    )}
                </div>

                {/* ============================================================ */}
                {/* 1. SELETOR DE QUADRAS (ABAS HORIZONTAIS ESTILO APP)          */}
                {/* ============================================================ */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">
                        Selecione a Quadra
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            onClick={() => setQuadraAtiva('todas')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm active:scale-95 ${
                                quadraAtiva === 'todas'
                                    ? 'bg-zinc-900 text-white shadow-md'
                                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-amber-400 hover:text-zinc-900'
                            }`}
                        >
                            🎾 Todas as Quadras
                        </button>

                        {quadras.map((q) => (
                            <button
                                key={q.id}
                                onClick={() => setQuadraAtiva(q.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                                    quadraAtiva === q.id
                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                        : 'bg-white border border-zinc-200 text-zinc-600 hover:border-amber-400 hover:text-zinc-900'
                                }`}
                            >
                                <span>{q.nome}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. BARRA DE FILTROS: DATA & HORÁRIO                          */}
                {/* ============================================================ */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-4">
                    {/* Filtro de Data */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                📅 Data da Partida
                            </span>
                            <span className="text-[11px] font-bold text-amber-600">
                                {dataFiltro === hojeStr ? 'Hoje' : dataFiltro === ontemStr ? 'Ontem' : dataFiltro.split('-').reverse().join('/')}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setDataFiltro(hojeStr)}
                                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                    dataFiltro === hojeStr
                                        ? 'bg-zinc-900 text-white shadow-sm font-black'
                                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                }`}
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => setDataFiltro(ontemStr)}
                                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                    dataFiltro === ontemStr
                                        ? 'bg-zinc-900 text-white shadow-sm font-black'
                                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                }`}
                            >
                                Ontem
                            </button>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dataFiltro}
                                    max={hojeStr}
                                    onChange={(e) => setDataFiltro(e.target.value)}
                                    className="w-full py-2 px-2 rounded-xl text-xs font-bold bg-zinc-50 border border-zinc-200 text-zinc-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filtro de Horário / Turno */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                ⏰ Faixa de Horário
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400">
                                {replaysFiltrados.length} lance(s) encontrado(s)
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { id: 'todos', label: 'Todos' },
                                { id: 'manha', label: '06h-12h' },
                                { id: 'tarde', label: '12h-18h' },
                                { id: 'noite', label: '18h-00h' },
                            ].map((turno) => (
                                <button
                                    key={turno.id}
                                    onClick={() => setPeriodoFiltro(turno.id)}
                                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                                        periodoFiltro === turno.id
                                            ? 'bg-amber-500 text-white shadow-sm font-black'
                                            : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                    {turno.label}
                                </button>
                            ))}
                        </div>

                        {/* Seletor fino de horas extras (opcional) */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">Refinar por hora:</span>
                            <select
                                value={['todos', 'manha', 'tarde', 'noite'].includes(periodoFiltro) ? '' : periodoFiltro}
                                onChange={(e) => setPeriodoFiltro(e.target.value || 'todos')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-50 border border-zinc-200 text-zinc-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                                <option value="">Qualquer hora</option>
                                {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                                    <option key={h} value={String(h)}>
                                        Das {String(h).padStart(2, '0')}:00 às {String(h + 1).padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </div>
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
                                Filtrando replays no servidor...
                            </p>
                        </div>
                    ) : replaysFiltrados.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
                            <div className="text-3xl">🔘</div>
                            <h4 className="text-sm font-black text-zinc-800 uppercase tracking-wide">
                                Nenhum lance encontrado
                            </h4>
                            <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
                                Não encontramos vídeos nesta quadra com o filtro de horário selecionado. Tente selecionar "Todos" ou outra data.
                            </p>
                            <button
                                onClick={() => {
                                    setQuadraAtiva('todas');
                                    setPeriodoFiltro('todos');
                                    setDataFiltro(hojeStr);
                                }}
                                className="mt-2 text-xs font-black text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors inline-block"
                            >
                                Limpar Todos os Filtros 🔄
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
                                            <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {nomeQuadra}
                                            </span>
                                            <span className="text-xs font-black text-zinc-800 tracking-wide">
                                                ⏱️ {horarioFormatado}
                                            </span>
                                        </div>

                                        {/* Thumbnail / Miniatura com Play */}
                                        <div className="w-full aspect-video bg-black relative overflow-hidden group">
                                            <video
                                                src={replay.video_url}
                                                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                                                muted
                                                preload="metadata"
                                                playsInline
                                            />
                                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-all group-hover:bg-black/10">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center pl-1 font-bold shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                                    ▶
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações Rápidas do Card */}
                                        <div className="p-3 bg-white grid grid-cols-2 gap-2 border-t border-zinc-100">
                                            <button
                                                onClick={(e) => baixarDireto(e, replay.video_url, replay.id)}
                                                className="py-2.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <span>Baixar</span>
                                                <span>📥</span>
                                            </button>

                                            <button
                                                onClick={(e) => compartilharLance(e, replay.id, nomeQuadra)}
                                                className="py-2.5 px-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <span>Compartilhar</span>
                                                <span>🔗</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
