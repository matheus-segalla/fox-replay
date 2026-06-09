'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function DashboardArena() {
    const [usuarioId, setUsuarioId] = useState(null);
    const [arena, setArena] = useState(null);
    const [minhasArenas, setMinhasArenas] = useState([]);
    const [quadras, setQuadras] = useState([]);
    const [nomeQuadra, setNomeQuadra] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [criandoQuadra, setCriandoQuadra] = useState(false);
    const [fotoUrl, setFotoUrl] = useState('');

    // Estados para o histórico de gravações
    const [replaysQuadra, setReplaysQuadra] = useState([]);
    const [quadraSelecionada, setQuadraSelecionada] = useState(null);
    const [carregandoReplays, setCarregandoReplays] = useState(false);

    // Estados para Gerenciamento do Modal de Edição e Exclusão de Quadras
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [quadraParaEditar, setQuadraParaEditar] = useState(null);
    const [editNome, setEditNome] = useState('');
    const [editFotoUrl, setEditFotoUrl] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    // Estados para o Cadastro de Nova Arena (Filial) de Dentro do Painel
    const [modalNovaArenaAberto, setModalNovaArenaAberto] = useState(false);
    const [novoNomeArena, setNovoNomeArena] = useState('');
    const [novaCidadeArena, setNovaCidadeArena] = useState('');
    const [novoEstadoArena, setNovoEstadoArena] = useState('');
    const [criandoNovaArena, setCriandoNovaArena] = useState(false);

    // CONTROLADOR MESTRE DE POPUPS CUSTOMIZADOS
    const [notificacao, setNotificacao] = useState({
        aberto: false,
        tipo: 'alert',
        titulo: '',
        mensagem: '',
        onConfirmar: null
    });

    const router = useRouter();

    const urlBaseSistema = "https://fox-replay.vercel.app";
    const linkPortalPublico = arena ? `${urlBaseSistema}/arena/${arena.id}` : '';

    // FUNÇÕES AUXILIARES PARA POPUPS PREMIUM
    const mostrarAviso = (titulo, mensagem) => {
        setNotificacao({
            aberto: true,
            tipo: 'alert',
            titulo,
            mensagem,
            onConfirmar: null
        });
    };

    const mostrarConfirmacao = (titulo, mensagem, acaoConfirmada) => {
        setNotificacao({
            aberto: true,
            tipo: 'confirm',
            titulo,
            mensagem,
            onConfirmar: acaoConfirmada
        });
    };

    const fecharNotificacao = () => {
        setNotificacao(prev => ({ ...prev, aberto: false }));
    };

    const gerarSlug = (texto) => {
        return texto
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    };

    // 🔒 AUTH GUARD SECURE MIDDLEWARE (COM ISOLAMENTO POR USUÁRIO CORRIGIDO)
    useEffect(() => {
        async function verificarSessaoSegura() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    router.push('/login');
                    return;
                }

                setUsuarioId(session.user.id);

                // 🔥 CORREÇÃO: Filtrando as arenas estritamente pelo id de quem está logado
                const { data: arenasData, error: arenasError } = await supabase
                    .from('arenas')
                    .select('*')
                    .eq('usuario_id', session.user.id)
                    .order('nome', { ascending: true });

                if (arenasError || !arenasData || arenasData.length === 0) {
                    router.push('/cadastro');
                    return;
                }

                setMinhasArenas(arenasData);

                let idAtivo = localStorage.getItem('fox_arena_id');
                const arenaExiste = arenasData.find(a => a.id === idAtivo);

                if (!idAtivo || !arenaExiste) {
                    idAtivo = arenasData[0].id;
                    localStorage.setItem('fox_arena_id', idAtivo);
                }

                carregarDados(idAtivo);

            } catch (err) {
                console.error('Erro no Auth Guard:', err);
                router.push('/login');
            }
        }

        verificarSessaoSegura();
    }, [router]);

    async function carregarDados(arenaId) {
        setCarregando(true);
        try {
            const { data: dadosArena, error: erroArena } = await supabase
                .from('arenas')
                .select('*')
                .eq('id', arenaId)
                .single();

            if (erroArena) throw erroArena;
            setArena(dadosArena);

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

    const handleMudarArenaAtiva = (idNovaArena) => {
        localStorage.setItem('fox_arena_id', idNovaArena);
        carregarDados(idNovaArena);
    };

    const handleCriarNovaArena = async (e) => {
        e.preventDefault();
        if (!novoNomeArena.trim() || !usuarioId) return;

        setCriandoNovaArena(true);
        try {
            const slugGerado = gerarSlug(novoNomeArena);
            const { data: novaArena, error: erroNovaArena } = await supabase
                .from('arenas')
                .insert([{
                    nome: novoNomeArena.trim(),
                    slug: slugGerado,
                    usuario_id: usuarioId,
                    cidade: novaCidadeArena.trim() || null,
                    estado: novoEstadoArena.trim().toUpperCase() || null
                }])
                .select()
                .single();

            if (erroNovaArena) throw erroNovaArena;

            mostrarAviso('Sucesso 🏢', 'Nova filial cadastrada com sucesso no sistema!');

            setNovoNomeArena('');
            setNovaCidadeArena('');
            setNovoEstadoArena('');
            setModalNovaArenaAberto(false);

            const { data: novasArenasData } = await supabase
                .from('arenas')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('nome', { ascending: true });

            setMinhasArenas(novasArenasData || []);
            handleMudarArenaAtiva(novaArena.id);

        } catch (error) {
            console.error('Erro ao cadastrar nova arena:', error);
            mostrarAviso('Erro de Cadastro ❌', 'Não foi possível criar uma nova unidade agora.');
        } finally {
            setCriandoNovaArena(false);
        }
    };

    async function carregarReplaysDaQuadra(quadra) {
        setReplaysQuadra([]);
        setQuadraSelecionada(quadra);
        setCarregandoReplays(true);

        try {
            // Buscando lances do dia de hoje para manter leveza e alta performance no MVP
            const hojeInicial = new Date();
            hojeInicial.setHours(0, 0, 0, 0);
            const dataIsoHoje = hojeInicial.toISOString();

            const { data, error } = await supabase
                .from('replays')
                .select('id, quadra_id, video_url, criado_em')
                .eq('quadra_id', quadra.id)
                .gte('criado_em', dataIsoHoje)
                .order('criado_em', { ascending: false })
                .limit(20);

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
            mostrarAviso('Sucesso 🎾', 'Nova quadra vinculada e pronta para monitoramento!');
            carregarDados(arena.id);
        } catch (error) {
            console.error(error);
        } finally {
            setCriandoQuadra(false);
        }
    };

    const copiarParaTransferencia = (texto) => {
        navigator.clipboard.writeText(texto);
        mostrarAviso('Copiado! 📋', 'O Token de hardware foi transferido para a sua área de transferência.');
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

            mostrarAviso('Atualizado 🔄', 'As alterações da quadra foram salvas com sucesso.');
            setModalEditarAberto(false);
            setQuadraParaEditar(null);
            carregarDados(arena.id);
        } catch (error) {
            console.error('Erro ao editar quadra:', error);
            mostrarAviso('Erro ❌', 'Ocorreu uma falha ao tentar atualizar as informações da quadra.');
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleExcluirQuadra = (idQuadra) => {
        mostrarConfirmacao(
            "⚠️ EXCLUIR QUADRA DEFINITIVAMENTE",
            "Atenção: Você tem certeza absoluta de que deseja remover esta quadra? Essa operação apagará permanentemente o Totem de hardware correspondente e anulará todo o histórico de lances salvos nela!",
            async () => {
                try {
                    const { error } = await supabase
                        .from('quadras')
                        .delete()
                        .eq('id', idQuadra);

                    if (error) throw error;

                    mostrarAviso('Removida 🗑️', 'A quadra foi completamente expurgada do ecossistema FOX REPLAY.');
                    setModalEditarAberto(false);
                    setQuadraParaEditar(null);
                    carregarDados(arena.id);
                } catch (error) {
                    console.error('Erro ao excluir quadra:', error);
                    mostrarAviso('Falha na Exclusão ❌', 'O banco de dados recusou a solicitação de remoção da quadra.');
                }
            }
        );
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        router.push('/login');
    };

    if (carregando && minhasArenas.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 text-zinc-900">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-xs text-zinc-400 font-bold tracking-widest uppercase">Sincronizando suas Unidades...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-8 relative overflow-hidden print:hidden">
                {/* 🌐 CANVAS BACKGROUND LINES & GLOW */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="max-w-[1100px] mx-auto relative z-10 space-y-8">

                    {/* Fox Premium Header / Navbar */}
                    <div className="flex justify-between items-center border-b border-zinc-200/80 backdrop-blur-sm pb-5">
                        <div className="flex items-center gap-3.5 select-none">
                            <img
                                src="/logo-fox.jpeg"
                                alt="Logo Fox Replay"
                                className="h-10 w-10 object-cover rounded-xl border border-zinc-200 shadow-sm bg-white"
                            />
                            <div>
                                <h1 className="text-xl font-black tracking-widest text-zinc-900 uppercase leading-none">
                                    FOX <span className="text-amber-500">REPLAY</span>
                                </h1>

                                <div className="mt-2.5 flex items-center gap-2">
                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Unidade Ativa:</span>
                                    <select
                                        value={arena?.id || ''}
                                        onChange={(e) => handleMudarArenaAtiva(e.target.value)}
                                        className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm hover:text-zinc-950 transition-colors"
                                    >
                                        {minhasArenas.map((a) => (
                                            <option key={a.id} value={a.id} className="bg-white text-zinc-900">
                                                🏢 {a.nome} {a.cidade ? `(${a.cidade})` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setModalNovaArenaAberto(true)}
                                        className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-transparent text-amber-600 hover:text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-sm"
                                    >
                                        ➕ Nova Arena / Filial
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs bg-zinc-100 text-zinc-600 border border-zinc-200 px-4 py-2.5 rounded-xl hover:bg-zinc-900 hover:text-white hover:border-transparent transition-all font-bold shadow-sm"
                        >
                            Sair do Painel 👋
                        </button>
                    </div>

                    {/* Bento Box 1: Material de Divulgação */}
                    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-zinc-200/50">
                        <div className="space-y-3 text-center md:text-left max-w-xl">
                            <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
                                Merchandising Físico da Arena
                            </span>
                            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Seu Portal de Replays está Operacional!</h2>
                            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                Imprima a placa oficial personalizada para fixar no balcão da recepção ou nas telas das quadras da unidade selecionada. Cada complexo possui chaves e QR Codes totalmente independentes.
                            </p>
                            <div className="pt-1 flex flex-wrap gap-3 justify-center md:justify-start">
                                <button
                                    onClick={dispararImpressao}
                                    className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border border-transparent px-5 py-2.5 rounded-xl transition-all font-black tracking-wide shadow-md shadow-amber-500/10"
                                >
                                    🖨️ Imprimir Placa da Arena ({arena?.nome})
                                </button>
                                <a
                                    href={linkPortalPublico}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 px-4 py-2.5 rounded-xl transition-all font-bold tracking-wide shadow-sm"
                                >
                                    Abrir Link Público do Hub 🔗
                                </a>
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-center flex flex-col items-center shrink-0 shadow-inner">
                            {linkPortalPublico ? (
                                <QRCodeSVG value={linkPortalPublico} size={120} level="H" />
                            ) : (
                                <div className="w-[120px] h-[120px] bg-zinc-200 animate-pulse rounded-xl" />
                            )}
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-3">
                                Câmera do Smartphone 📱
                            </span>
                        </div>
                    </div>

                    {/* Painel Interno Dividido em Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                        {/* Box de Cadastro de Quadras */}
                        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-md shadow-zinc-200/40 space-y-4">
                            <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">🎾 Adicionar Nova Quadra</h2>
                            <form onSubmit={handleCriarQuadra} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                        Nome identificador
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={nomeQuadra}
                                        onChange={(e) => setNomeQuadra(e.target.value)}
                                        placeholder="Ex: Quadra 1 (Central)"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                        URL da Imagem da Quadra (Opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={fotoUrl}
                                        onChange={(e) => setFotoUrl(e.target.value)}
                                        placeholder="https://linkdafoto.com/imagem.jpg"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={criandoQuadra}
                                    className="w-full py-3 text-white font-black text-xs uppercase tracking-widest rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-md"
                                >
                                    {criandoQuadra ? 'Salvando dados... ⏳' : 'Vincular Quadra à Unidade'}
                                </button>
                            </form>
                        </div>

                        {/* Listagem de Quadras Cadastradas */}
                        <div className="md:col-span-2 space-y-4">
                            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-wider select-none">Quadras Ativas no Complexo</h2>

                            {carregando ? (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs text-zinc-400 font-bold mt-3 animate-pulse">Sincronizando infraestrutura...</p>
                                </div>
                            ) : quadras.length === 0 ? (
                                <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                    Nenhuma quadra vinculada a esta unidade até o momento.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quadras.map((quadra) => (
                                        <div key={quadra.id} className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-4 shadow-sm hover:border-zinc-300 transition-all">
                                            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                                                <div className="flex items-center gap-4 truncate">
                                                    {quadra.fotoUrl ? (
                                                        <img
                                                            src={quadra.fotoUrl}
                                                            alt={quadra.nome}
                                                            className="w-12 h-12 object-cover rounded-xl border border-zinc-200 shrink-0 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center text-base shrink-0 shadow-inner">
                                                            🎾
                                                        </div>
                                                    )}
                                                    <div className="truncate">
                                                        <h3 className="text-base font-bold text-zinc-900 tracking-wide uppercase">{quadra.nome}</h3>
                                                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">UUID: {quadra.id}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                                    <span className="px-2.5 py-1 text-[9px] font-black bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 rounded-full uppercase tracking-widest">
                                                        {quadra.status}
                                                    </span>
                                                    <button
                                                        onClick={() => carregarReplaysDaQuadra(quadra)}
                                                        className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-xl hover:border-amber-500/30 hover:text-amber-600 transition-all font-bold flex items-center gap-1 shadow-sm"
                                                    >
                                                        🎥 Gravações
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalEditar(quadra)}
                                                        className="text-xs bg-white border border-zinc-200 text-zinc-400 px-3 py-1.5 rounded-xl hover:border-zinc-400 hover:text-zinc-700 transition-all font-bold shadow-sm"
                                                    >
                                                        ⚙️ Configurar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Hardware Credentials */}
                                            <div className="flex items-center justify-between gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200 shadow-inner">
                                                <div className="overflow-hidden">
                                                    <span className="block text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 select-none">🔑 Token Mestre de Conexão do Totem (Raspberry Pi OS)</span>
                                                    <p className="text-xs font-mono text-zinc-500 truncate tracking-wide bg-white px-2.5 py-2 rounded-lg border border-zinc-200/60 shadow-sm">{quadra.token}</p>
                                                </div>
                                                <button
                                                    onClick={() => copiarParaTransferencia(quadra.token)}
                                                    className="text-xs shrink-0 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 px-3 py-2 rounded-xl transition-all font-bold shadow-sm active:scale-95"
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

                    {/* MODAL SUSPENSO COM HISTÓRICO DE VÍDEOS DE HOJE */}
                    {quadraSelecionada && (
                        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
                                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-4 shrink-0">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                                        Lances de Hoje: <span className="text-amber-500">{quadraSelecionada.nome}</span>
                                    </h3>
                                    <button
                                        onClick={() => setQuadraSelecionada(null)}
                                        className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl shadow-sm"
                                    >
                                        Fechar Painel ✕
                                    </button>
                                </div>

                                <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                                    {carregandoReplays ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs text-zinc-400 font-bold">Lendo registros na nuvem...</p>
                                        </div>
                                    ) : replaysQuadra.length === 0 ? (
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider text-center py-12 border border-dashed border-zinc-200 rounded-xl">Nenhum take gravado nesta quadra nas últimas horas.</p>
                                    ) : (
                                        replaysQuadra.map((replay) => {
                                            const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;
                                            const horario = replay.criado_em ? replay.criado_em.split('T')[1]?.substring(0, 5) : 'Recente';

                                            return (
                                                <div key={replay.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="w-20 aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 shrink-0 relative">
                                                            <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-xs">▶️</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Take cortado às {horario}</p>
                                                            <a href={linkJogador} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:text-amber-700 hover:underline mt-1 font-bold inline-block">
                                                                Visualizar Página do Atleta 🔗
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-sm shrink-0">
                                                        <QRCodeSVG value={linkJogador} size={50} />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL CONFIGURAÇÃO DE QUADRA */}
                    {modalEditarAberto && quadraParaEditar && (
                        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-5">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                                        Ajustes: <span className="text-amber-500">{quadraParaEditar.nome}</span>
                                    </h3>
                                    <button
                                        onClick={() => { setModalEditarAberto(false); setQuadraParaEditar(null); }}
                                        className="text-zinc-400 hover:text-zinc-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSalvarEdicao} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                            Nome do Identificador
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editNome}
                                            onChange={(e) => setEditNome(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                            URL da Foto de Capa (Opcional)
                                        </label>
                                        <input
                                            type="url"
                                            value={editFotoUrl}
                                            onChange={(e) => setEditFotoUrl(e.target.value)}
                                            placeholder="https://linkdafoto.com/imagem.jpg"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                        />
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2.5">
                                        <button
                                            type="submit"
                                            disabled={salvandoEdicao}
                                            className="w-full py-3.5 text-white font-black text-xs uppercase tracking-widest rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 transition-all disabled:opacity-50 shadow-md shadow-amber-500/10"
                                        >
                                            {salvandoEdicao ? 'Salvando dados... ⏳' : 'Salvar Alterações'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleExcluirQuadra(quadraParaEditar.id)}
                                            className="w-full py-3.5 bg-red-50 hover:bg-red-600 border border-transparent text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                                        >
                                            🗑️ Excluir Quadra Permanentemente
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL CADASTRO DE NOVA FILIAL */}
                    {modalNovaArenaAberto && (
                        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">

                                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-5">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                                        ➕ Cadastrar Nova Filial / Unidade
                                    </h3>
                                    <button
                                        onClick={() => setModalNovaArenaAberto(false)}
                                        className="text-zinc-400 hover:text-zinc-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleCriarNovaArena} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                            Nome da Nova Unidade
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={novoNomeArena}
                                            onChange={(e) => setNovoNomeArena(e.target.value)}
                                            placeholder="Ex: Arena Fox Unidade Centro"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                                Cidade
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={novaCidadeArena}
                                                onChange={(e) => setNovaCidadeArena(e.target.value)}
                                                placeholder="Ex: Campinas"
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                                UF Estado
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={2}
                                                value={novoEstadoArena}
                                                onChange={(e) => setNovoEstadoArena(e.target.value)}
                                                placeholder="SP"
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-center uppercase text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={criandoNovaArena}
                                            className="w-full py-3.5 text-white font-black text-xs uppercase tracking-widest rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-md"
                                        >
                                            {criandoNovaArena ? 'Integrando filial... ⏳' : 'Ativar Nova Arena Unidade 🚀'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* POPUP DE NOTIFICAÇÃO CUSTOMIZADO */}
            {notificacao.aberto && (
                <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative space-y-4">

                        <div className="space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-xl inline-block shadow-sm">
                                {notificacao.titulo}
                            </h3>
                            <p className="text-sm font-semibold text-zinc-800 leading-relaxed pt-2">
                                {notificacao.mensagem}
                            </p>
                        </div>

                        <div className="pt-1 flex items-center justify-center gap-3">
                            {notificacao.tipo === 'confirm' ? (
                                <>
                                    <button
                                        onClick={fecharNotificacao}
                                        className="flex-1 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        Não, Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (notificacao.onConfirmar) notificacao.onConfirmar();
                                            fecharNotificacao();
                                        }}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                                    >
                                        Sim, Confirmar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={fecharNotificacao}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                                >
                                    Entendido, fechar
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* FLYER IMPRESSÃO DIRECT-TO-PAPER */}
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