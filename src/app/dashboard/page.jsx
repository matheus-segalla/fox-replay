'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function DashboardArena() {
    const [arena, setArena] = useState(null);
    const [quadras, setQuadras] = useState([]);
    const [nomeQuadra, setNomeQuadra] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [criandoQuadra, setCriandoQuadra] = useState(false);
    const [fotoUrl, setFotoUrl] = useState('');

    // Estados para o histórico de gravações
    const [replaysQuadra, setReplaysQuadra] = useState([]);
    const [quadraSelecionada, setQuadraSelecionada] = useState(null);
    const [carregandoReplays, setCarregandoReplays] = useState(false);

    // Estados para Gerenciamento do Modal de Edição e Exclusão
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [quadraParaEditar, setQuadraParaEditar] = useState(null);
    const [editNome, setEditNome] = useState('');
    const [editFotoUrl, setEditFotoUrl] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    const router = useRouter();

    // URL base do sistema (quando fizer o deploy, mude para o link da Vercel)
    const urlBaseSistema = "http://localhost:3000";
    const linkPortalPublico = arena ? `${urlBaseSistema}/arena/${arena.id}` : '';

    // 🔒 AUTH GUARD REAL: Middleware de proteção de rotas via Supabase Auth
    useEffect(() => {
        async function verificarSessaoSegura() {
            try {
                // 1. Pergunta ao Supabase se existe um token de login ativo e descriptografado
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    // Se o token expirou ou não existe, barra na hora e manda pro login
                    router.push('/login');
                    return;
                }

                // 2. Busca a Arena que pertence a este usuário logado de forma relacional
                const { data: arenaData, error: arenaError } = await supabase
                    .from('arenas')
                    .select('id')
                    .eq('usuario_id', session.user.id)
                    .single();

                if (arenaError || !arenaData) {
                    console.error('Nenhuma arena vinculada a este ID de autenticação:', arenaError);
                    router.push('/cadastro');
                    return;
                }

                // 3. Estando tudo verificado com segurança, alimenta o ecossistema com os dados da arena
                localStorage.setItem('fox_arena_id', arenaData.id);
                carregarDados(arenaData.id);

            } catch (err) {
                console.error('Erro crítico no Auth Guard:', err);
                router.push('/login');
            }
        }

        verificarSessaoSegura();
    }, [router]);

    async function carregarDados(arenaId) {
        try {
            // 1. Busca os detalhes da Arena administrada
            const { data: dadosArena, error: erroArena } = await supabase
                .from('arenas')
                .select('*')
                .eq('id', arenaId)
                .single();

            if (erroArena) throw erroArena;
            setArena(dadosArena);

            // 2. Faz o JOIN relacional para trazer as quadras e seus tokens
            const { data: dadosQuadras, error: erroQuadras } = await supabase
                .from('quadras')
                .select(`
                    id,
                    nome,
                    status,
                    foto_url,
                    dispositivos (
                        token_autenticacao
                    )
                `)
                .eq('arena_id', arenaId);

            if (erroQuadras) throw erroQuadras;

            const quadrasFormatadas = dadosQuadras.map(q => ({
                id: q.id,
                nome: q.nome,
                status: q.status,
                fotoUrl: q.foto_url,
                token: q.dispositivos?.[0]?.token_autenticacao || 'Sem token gerado'
            }));

            setQuadras(quadrasFormatadas);

        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarReplaysDaQuadra(quadra) {
        setReplaysQuadra([]);
        setQuadraSelecionada(quadra);
        setCarregandoReplays(true);

        try {
            const { data, error } = await supabase
                .from('replays')
                .select('id, quadra_id, video_url, criado_em')
                .eq('quadra_id', quadra.id)
                .order('criado_em', { ascending: false })
                .limit(10);

            if (error) throw error;
            setReplaysQuadra(data || []);
        } catch (err) {
            console.error('Erro ao buscar replays da quadra:', err);
        } finally {
            setCarregandoReplays(false);
        }
    }

    const handleCriarQuadra = async (e) => {
        e.preventDefault();
        if (!nomeQuadra.trim() || !arena) return;

        setCriandoQuadra(true);
        try {
            const { data: novaQuadra, error: erroQuadra } = await supabase
                .from('quadras')
                .insert([{
                    arena_id: arena.id,
                    nome: nomeQuadra,
                    foto_url: fotoUrl.trim() || null
                }])
                .select()
                .single();

            if (erroQuadra) throw erroQuadra;

            const tokenGerado = `fox_tok_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;

            const { error: erroDispositivo } = await supabase
                .from('dispositivos')
                .insert([{ quadra_id: novaQuadra.id, token_autenticacao: tokenGerado }]);

            if (erroDispositivo) throw erroDispositivo;

            setNomeQuadra('');
            setFotoUrl('');
            alert('Nova quadra cadastrada com sucesso! 🎾');
            carregarDados(arena.id);
        } catch (error) {
            console.error(error);
        } finally {
            setCriandoQuadra(false);
        }
    };

    const copiarParaTransferencia = (texto) => {
        navigator.clipboard.writeText(texto);
        alert('Copiado com sucesso! 📋');
    };

    const dispararImpressao = () => {
        window.print();
    };

    const abrirModalEditar = (quadra) => {
        setQuadraParaEditar(quadra);
        setEditNome(quadra.nome);
        setEditFotoUrl(quadra.fotoUrl || '');
        setModalEditarAberto(true);
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        if (!editNome.trim() || !quadraParaEditar || !arena) return;

        setSalvandoEdicao(true);
        try {
            const { error } = await supabase
                .from('quadras')
                .update({
                    nome: editNome.trim(),
                    foto_url: editFotoUrl.trim() || null
                })
                .eq('id', quadraParaEditar.id);

            if (error) throw error;

            alert('Quadra updated com sucesso! 🔄');
            setModalEditarAberto(false);
            setQuadraParaEditar(null);
            carregarDados(arena.id);
        } catch (error) {
            console.error('Erro ao editar quadra:', error);
            alert('Erro ao salvar alterações.');
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleExcluirQuadra = async (idQuadra) => {
        const confirmar = window.confirm("⚠️ ATENÇÃO: Tem certeza de que deseja excluir esta quadra? Isso apagará permanentemente o Totem de hardware vinculado e todo o histórico de lances salvos nela!");
        if (!confirmar) return;

        try {
            const { error } = await supabase
                .from('quadras')
                .delete()
                .eq('id', idQuadra);

            if (error) throw error;

            alert('Quadra removida do sistema FOX REPLAY! 🗑️');
            setModalEditarAberto(false);
            setQuadraParaEditar(null);
            carregarDados(arena.id);
        } catch (error) {
            console.error('Erro ao excluir quadra:', error);
            alert('Não foi possível remover a quadra.');
        }
    };

    // Função de Logout seguro limpando a sessão no servidor do Supabase Auth
    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        router.push('/login');
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-main text-white">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-sm text-gold font-bold tracking-wider uppercase">Autenticando acesso seguro...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* CONTAINER DO PAINEL DIGITAL (Escondido automaticamente na hora de imprimir) */}
            <div className="min-h-screen bg-bg-main text-white font-sans p-8 relative overflow-hidden print:hidden">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold-glow rounded-full blur-[150px] pointer-events-none" />

                <div className="max-w-[1100px] mx-auto relative z-10">

                    {/* 🦊 HEADER DO SAAS TOTALMENTE INTEGRADO COM A FOTO DA SUA LOGO METÁLICA */}
                    <div className="flex justify-between items-center border-b border-border-card pb-6 mb-8">
                        <div className="flex items-center gap-3.5 select-none">
                            <img
                                src="/logo-fox.jpeg"
                                alt="Logo Fox Replay"
                                className="h-10 w-10 object-cover rounded-xl border border-border-card shadow-lg bg-neutral-900"
                            />
                            <div>
                                <h1 className="text-2xl font-black tracking-widest text-white uppercase leading-none">
                                    FOX <span className="text-gold">REPLAY</span>
                                </h1>
                                <p className="text-gray-500 text-[10px] font-medium mt-1.5">
                                    Painel Administrativo: <span className="text-silver font-semibold">{arena?.nome}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs bg-red-500/5 text-red-400 border border-red-500/10 px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white hover:border-transparent transition-all font-bold"
                        >
                            Sair do Painel 👋
                        </button>
                    </div>

                    {/* SEÇÃO DE COMPARTILHAMENTO E MATERIAIS */}
                    <div className="bg-bg-card border border-border-card rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="space-y-3 text-center md:text-left max-w-xl">
                            <span className="text-[10px] font-bold text-black bg-gold px-3 py-1 rounded-full uppercase tracking-widest">
                                Material de Divulgação Física
                            </span>
                            <h2 className="text-xl font-black text-white">Seu Portal de Replays está Pronto!</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Imprima a placa oficial customizada para colar no balcão da recepção ou nas grades das quadras. Quando os jogadores escanearrem, eles poderão escolher a quadra e salvar os lances direto no smartphone.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                                <button
                                    onClick={dispararImpressao}
                                    className="text-xs bg-gold hover:bg-gold-dark text-black border border-transparent px-5 py-2.5 rounded-xl transition-all font-black tracking-wide shadow-md shadow-gold-glow"
                                >
                                    🖨️ Imprimir Placa da Arena
                                </button>
                                <a
                                    href={linkPortalPublico}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-bg-main hover:bg-border-card text-white border border-border-card px-4 py-2.5 rounded-xl transition-all font-bold tracking-wide"
                                >
                                    Acessar Menu de Quadras 🔗
                                </a>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-gold-glow text-center flex flex-col items-center shrink-0">
                            <QRCodeSVG value={linkPortalPublico} size={135} />
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3">
                                Pré-visualização 📱
                            </span>
                        </div>
                    </div>

                    {/* CORPO DO DASHBOARD */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* CADASTRO DE QUADRAS */}
                        <div className="bg-bg-card p-6 rounded-2xl border border-border-card h-fit shadow-lg">
                            <h2 className="text-base font-black mb-4 text-gold uppercase tracking-wider">➕ Nova Quadra</h2>
                            <form onSubmit={handleCriarQuadra} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                        Nome identificador
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={nomeQuadra}
                                        onChange={(e) => setNomeQuadra(e.target.value)}
                                        placeholder="Ex: Quadra 1 (Central)"
                                        className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                        URL da Foto da Quadra (Opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={fotoUrl}
                                        onChange={(e) => setFotoUrl(e.target.value)}
                                        placeholder="https://linkdafoto.com/imagem.jpg"
                                        className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={criandoQuadra}
                                    className="w-full py-3.5 text-black font-black text-xs uppercase tracking-wider rounded-xl bg-gold hover:bg-gold-dark active:scale-[0.99] transition-all disabled:opacity-50 shadow-md shadow-gold-glow"
                                >
                                    {criandoQuadra ? 'Salvando dados... ⏳' : 'Adicionar Quadra'}
                                </button>
                            </form>
                        </div>

                        {/* LISTAGEM DE QUADRAS */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-base font-black text-silver uppercase tracking-wider">Suas Quadras Monitoradas</h2>

                            {quadras.length === 0 ? (
                                <div className="bg-bg-card border border-dashed border-border-card rounded-2xl p-10 text-center text-gray-500 text-sm">
                                    Nenhuma quadra configurada nesta arena até o momento.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {quadras.map((quadra) => (
                                        <div key={quadra.id} className="bg-bg-card border border-border-card rounded-2xl p-5 space-y-4 shadow-sm hover:border-border-card/80 transition-all">

                                            <div className="flex items-center justify-between gap-4">

                                                {/* 📸 THUMBNAIL DA FOTO DA QUADRA */}
                                                <div className="flex items-center gap-4 truncate">
                                                    {quadra.fotoUrl ? (
                                                        <img
                                                            src={quadra.fotoUrl}
                                                            alt={quadra.nome}
                                                            className="w-12 h-12 object-cover rounded-xl border border-border-card shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-bg-main border border-border-card rounded-xl flex items-center justify-center text-xl shrink-0">
                                                            🎾
                                                        </div>
                                                    )}
                                                    <div className="truncate">
                                                        <h3 className="text-base font-black text-white tracking-wide">{quadra.nome}</h3>
                                                        <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">ID: {quadra.id}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="px-2.5 py-1 text-[10px] font-bold bg-gold/5 text-gold border border-gold/10 rounded-full">
                                                        {quadra.status}
                                                    </span>
                                                    <button
                                                        onClick={() => carregarReplaysDaQuadra(quadra)}
                                                        className="text-xs bg-transparent border border-border-card text-silver px-3 py-1.5 rounded-xl hover:border-gold/40 hover:text-gold transition-all font-bold flex items-center gap-1.5"
                                                    >
                                                        🎥 Ver Gravações
                                                    </button>

                                                    <button
                                                        onClick={() => abrirModalEditar(quadra)}
                                                        className="text-xs bg-transparent border border-border-card text-gray-500 px-3 py-1.5 rounded-xl hover:border-white/20 hover:text-white transition-all font-bold flex items-center gap-1"
                                                    >
                                                        ⚙️ Editar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* HARDWARE TOKEN */}
                                            <div className="flex items-center justify-between gap-3 bg-bg-main p-3 rounded-xl border border-border-card">
                                                <div className="overflow-hidden">
                                                    <span className="block text-[9px] font-bold text-gold uppercase tracking-widest mb-1">🔑 Token Secreto do Totem (Raspberry)</span>
                                                    <p className="text-xs font-mono text-gray-400 truncate tracking-wide bg-black/20 px-2 py-1.5 rounded border border-black/40">{quadra.token}</p>
                                                </div>
                                                <button
                                                    onClick={() => copiarParaTransferencia(quadra.token)}
                                                    className="text-xs shrink-0 bg-bg-card border border-border-card text-gray-300 hover:text-white px-3 py-2 rounded-xl transition-all font-medium"
                                                >
                                                    Copiar
                                                </button>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MODAL SUSPENSO COM HISTÓRICO */}
                    {quadraSelecionada && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-bg-card border border-border-card rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-gold-glow/5 relative">
                                <div className="flex justify-between items-center border-b border-border-card pb-4 mb-4 shrink-0">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                        Histórico de Lances: <span className="text-gold">{quadraSelecionada.nome}</span>
                                    </h3>
                                    <button
                                        onClick={() => setQuadraSelecionada(null)}
                                        className="text-xs text-gray-500 hover:text-white transition-colors bg-bg-main border border-border-card px-3 py-1.5 rounded-xl"
                                    >
                                        Fechar Histórico ✕
                                    </button>
                                </div>

                                <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                                    {carregandoReplays ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs text-gray-500 animate-pulse uppercase tracking-widest font-bold">Buscando lances no banco...</p>
                                        </div>
                                    ) : replaysQuadra.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-12">Nenhum take gravado nesta quadra recentemente.</p>
                                    ) : (
                                        replaysQuadra.map((replay) => {
                                            const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;
                                            const horario = replay.criado_em ? replay.criado_em.split('T')[1]?.substring(0, 8) : 'Identificado';

                                            return (
                                                <div key={replay.id} className="bg-bg-main p-4 rounded-xl border border-border-card flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-border-card/80 transition-all">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="w-20 aspect-video bg-black rounded-lg overflow-hidden border border-border-card shrink-0 shadow-inner relative">
                                                            <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-xs">▶️</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">Take gerado às {horario}</p>
                                                            <a href={linkJogador} target="_blank" rel="noreferrer" className="text-xs text-gold hover:text-gold-dark hover:underline inline-block mt-1 font-medium">
                                                                Abrir link isolado do lance 🔗
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                                                        <QRCodeSVG value={linkJogador} size={55} />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL INTERATIVO PARA EDITAR / EXCLUIR QUADRA */}
                    {modalEditarAberto && quadraParaEditar && (
                        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-bg-card border border-border-card rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-gold-glow/5 relative">

                                <div className="flex justify-between items-center border-b border-border-card pb-4 mb-5">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                        Configurações: <span className="text-gold">{quadraParaEditar.nome}</span>
                                    </h3>
                                    <button
                                        onClick={() => { setModalEditarAberto(false); setQuadraParaEditar(null); }}
                                        className="text-xs text-gray-500 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSalvarEdicao} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                            Nome da Quadra
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editNome}
                                            onChange={(e) => setEditNome(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white text-sm focus:outline-none focus:border-gold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                            URL da Foto (Opcional)
                                        </label>
                                        <input
                                            type="url"
                                            value={editFotoUrl}
                                            onChange={(e) => setEditFotoUrl(e.target.value)}
                                            placeholder="https://linkdafoto.com/imagem.jpg"
                                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white text-sm focus:outline-none focus:border-gold"
                                        />
                                    </div>

                                    <div className="pt-2 flex flex-col gap-3">
                                        <button
                                            type="submit"
                                            disabled={salvandoEdicao}
                                            className="w-full py-3.5 text-black font-black text-xs uppercase tracking-wider rounded-xl bg-gold hover:bg-gold-dark transition-all disabled:opacity-50"
                                        >
                                            {salvandoEdicao ? 'Salvando dados... ⏳' : 'Salvar Alterações'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleExcluirQuadra(quadraParaEditar.id)}
                                            className="w-full py-3.5 bg-red-500/5 hover:bg-red-600 border border-red-500/10 hover:border-transparent text-red-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            🗑️ Excluir Quadra Definitivamente
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* FLYER EXCLUSIVO PARA IMPRESSÃO */}
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
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider m-0">Você está jogando na</p>
                    <h2 className="text-5xl font-black text-neutral-950 uppercase tracking-tight leading-none">
                        {arena?.nome || 'Nossa Arena'}
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
                        👉 Como baixar a sua jogada:
                    </h4>
                    <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
                        <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</strong>
                        Fez um ponto incrível ou jogada bonita? Vá até o totem da quadra e **pressione o botão físico** imediatamente.
                    </p>
                    <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
                        <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</strong>
                        Ao final da sua partida, **escaneie este QR Code** utilizando a câmera do seu smartphone.
                    </p>
                    <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
                        <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</strong>
                        Selecione a numeração da sua quadra, encontre o seu lance pelo horário e **salve o clipe direto na sua galeria!**
                    </p>
                </div>

                <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase m-0 mt-8">
                    SISTEMA AUTOMÁTICO DE REPLAYS ESPORTIVOS
                </p>
            </div>
        </>
    );
}