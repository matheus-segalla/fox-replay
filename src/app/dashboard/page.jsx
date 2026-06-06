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

    // 🌟 NOVO ESTADO: CONTROLADOR MESTRE DE POPUPS CUSTOMIZADOS 🌟
    const [notificacao, setNotificacao] = useState({
        aberto: false,
        tipo: 'alert', // 'alert' (Aviso com botão Ok) ou 'confirm' (Opções Sim/Não)
        titulo: '',
        mensagem: '',
        onConfirmar: null
    });

    const router = useRouter();

    const urlBaseSistema = "https://fox-replay.vercel.app";
    const linkPortalPublico = arena ? `${urlBaseSistema}/arena/${arena.id}` : '';

    // 🛠️ FUNÇÕES AUXILIARES PARA FAZER DISPAROS DE POPUPS PREMIUM
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

    // AUTH GUARD SECURE MIDDLEWARE
    useEffect(() => {
        async function verificarSessaoSegura() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    router.push('/login');
                    return;
                }

                setUsuarioId(session.user.id);

                const { data: arenasData, error: arenasError } = await supabase
                    .from('arenas')
                    .select('*')
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
            novaCidadeArena('');
            novoEstadoArena('');
            setModalNovaArenaAberto(false);

            const { data: novasArenasData } = await supabase
                .from('arenas')
                .select('*')
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

    // 🔒 EXCLUSÃO REDIRECIONADA PARA O POPUP CUSTOMIZADO DE CONFIRMAÇÃO DO PRODUTO
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
            <div className="flex items-center justify-center min-h-screen bg-bg-main text-white">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-sm text-gold font-bold tracking-wider uppercase">Sincronizando suas Unidades...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-bg-main text-white font-sans p-8 relative overflow-hidden print:hidden">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold-glow rounded-full blur-[150px] pointer-events-none" />

                <div className="max-w-[1100px] mx-auto relative z-10">

                    {/* HEADER DO SAAS */}
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

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Unidade:</span>
                                    <select
                                        value={arena?.id || ''}
                                        onChange={(e) => handleMudarArenaAtiva(e.target.value)}
                                        className="bg-bg-card border border-border-card/80 text-silver text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-gold cursor-pointer transition-colors hover:text-white"
                                    >
                                        {minhasArenas.map((a) => (
                                            <option key={a.id} value={a.id} className="bg-bg-main text-white">
                                                {a.nome} {a.cidade ? `(${a.cidade})` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setModalNovaArenaAberto(true)}
                                        className="bg-gold/10 hover:bg-gold border border-gold/20 hover:border-transparent text-gold hover:text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all active:scale-95"
                                    >
                                        ➕ Nova Arena
                                    </button>
                                </div>
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
                                Imprima a placa oficial customizada para colar no balcão da recepção ou nas grades das quadras da unidade selecionada acima. Cada complexo possui um QR Code independente.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                                <button
                                    onClick={dispararImpressao}
                                    className="text-xs bg-gold hover:bg-gold-dark text-black border border-transparent px-5 py-2.5 rounded-xl transition-all font-black tracking-wide shadow-md shadow-gold-glow"
                                >
                                    🖨️ Imprimir Placa da Arena ({arena?.nome})
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
                            {linkPortalPublico ? (
                                <QRCodeSVG value={linkPortalPublico} size={135} />
                            ) : (
                                <div className="w-[135px] h-[135px] bg-gray-200 animate-pulse rounded-xl" />
                            )}
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
                                        className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold"
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
                                        className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={criandoQuadra}
                                    className="w-full py-3.5 text-black font-black text-xs uppercase tracking-wider rounded-xl bg-gold hover:bg-gold-dark transition-all disabled:opacity-50 shadow-md"
                                >
                                    {criandoQuadra ? 'Salvando dados... ⏳' : 'Adicionar Quadra'}
                                </button>
                            </form>
                        </div>

                        {/* LISTAGEM DE QUADRAS */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-base font-black text-silver uppercase tracking-wider">Suas Quadras Monitoradas</h2>

                            {carregando ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs text-gray-500 animate-pulse">Carregando quadras desta unidade...</p>
                                </div>
                            ) : quadras.length === 0 ? (
                                <div className="bg-bg-card border border-dashed border-border-card rounded-2xl p-10 text-center text-gray-500 text-sm">
                                    Nenhuma quadra configurada nesta arena até o momento.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {quadras.map((quadra) => (
                                        <div key={quadra.id} className="bg-bg-card border border-border-card rounded-2xl p-5 space-y-4 shadow-sm hover:border-border-card/80 transition-all">
                                            <div className="flex items-center justify-between gap-4">
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
                                            <p className="text-xs text-gray-500">Buscando lances no banco...</p>
                                        </div>
                                    ) : replaysQuadra.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-12">Nenhum take gravado nesta quadra recentemente.</p>
                                    ) : (
                                        replaysQuadra.map((replay) => {
                                            const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;
                                            const horario = replay.criado_em ? replay.criado_em.split('T')[1]?.substring(0, 8) : 'Identificado';

                                            return (
                                                <div key={replay.id} className="bg-bg-main p-4 rounded-xl border border-border-card flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="w-20 aspect-video bg-black rounded-lg overflow-hidden border border-border-card shrink-0 relative">
                                                            <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-xs">▶️</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">Take gerado às {horario}</p>
                                                            <a href={linkJogador} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline mt-1 font-medium">
                                                                Abrir link isolado do lance 🔗
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded-xl shrink-0">
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
                            <div className="bg-bg-card border border-border-card rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                                <div className="flex justify-between items-center border-b border-border-card pb-4 mb-5">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                        Configurações: <span className="text-gold">{quadraParaEditar.nome}</span>
                                    </h3>
                                    <button
                                        onClick={() => { setModalEditarAberto(false); setQuadraParaEditar(null); }}
                                        className="text-xs text-gray-500 hover:text-white"
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
                                            className="w-full py-3.5 bg-red-500/5 hover:bg-red-600 border border-red-500/10 text-red-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            🗑️ Excluir Quadra Definitivamente
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL PREMIUM PARA CADASTRAR NOVA ARENA (FILIAL) */}
                    {modalNovaArenaAberto && (
                        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-bg-card border border-border-card rounded-2xl p-6 w-full max-w-md shadow-2xl relative">

                                <div className="flex justify-between items-center border-b border-border-card pb-4 mb-5">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                        ➕ Cadastrar Nova Filial / Unidade
                                    </h3>
                                    <button
                                        onClick={() => setModalNovaArenaAberto(false)}
                                        className="text-xs text-gray-500 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleCriarNovaArena} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                            Nome da Nova Arena
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={novoNomeArena}
                                            onChange={(e) => setNovoNomeArena(e.target.value)}
                                            placeholder="Ex: Arena Fox Unidade Centro"
                                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white text-sm focus:outline-none focus:border-gold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                                Cidade
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={novaCidadeArena}
                                                onChange={(e) => setNovaCidadeArena(e.target.value)}
                                                placeholder="Ex: Campinas"
                                                className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                                UF / Estado
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={2}
                                                value={novoEstadoArena}
                                                onChange={(e) => setNovoEstadoArena(e.target.value)}
                                                placeholder="SP"
                                                className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white text-sm text-center uppercase focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={criandoNovaArena}
                                            className="w-full py-3.5 text-black font-black text-xs uppercase tracking-wider rounded-xl bg-gold hover:bg-gold-dark transition-all disabled:opacity-50"
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

            {/* 🌟 NOVO DIÁLOGO INTERATIVO DE NOTIFICAÇÃO E CONFIRMAÇÃO DO PRODUTO (REMPLAÇA O WINDOW POPUP) 🌟 */}
            {notificacao.aberto && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-bg-card border-2 border-border-card rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl shadow-gold-glow/5 relative space-y-4">

                        <div className="space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gold bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-xl inline-block">
                                {notificacao.titulo}
                            </h3>
                            <p className="text-sm font-semibold text-white leading-relaxed pt-2">
                                {notificacao.mensagem}
                            </p>
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            {notificacao.tipo === 'confirm' ? (
                                <>
                                    <button
                                        onClick={fecharNotificacao}
                                        className="flex-1 py-3 bg-bg-main border border-border-card text-silver hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
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
                                    className="w-full py-3 bg-gold hover:bg-gold-dark text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                                >
                                    Entendido, fechar ➔
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

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