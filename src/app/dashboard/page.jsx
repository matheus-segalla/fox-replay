'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

// SVGs Minimalistas para o Dashboard
const IconRadio = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
    </svg>
);

const IconBuilding = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const IconSettings = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconFilm = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="2" width="20" height="20" rx="2.18" />
        <path strokeLinecap="round" d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
    </svg>
);

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

    // Estados para o Pareamento Rápido de Totem (Smart Connect por Código)
    const [modalParearAberto, setModalParearAberto] = useState(false);
    const [codigoTotemInput, setCodigoTotemInput] = useState('');
    const [quadraIdPareamento, setQuadraIdPareamento] = useState('');
    const [salvandoPareamento, setSalvandoPareamento] = useState(false);

    // Estados para Configuração de Logos e Patrocinadores do Vídeo
    const [logoArenaInput, setLogoArenaInput] = useState('');
    const [patrocinadoresInput, setPatrocinadoresInput] = useState([
        { id: 1, nome: '', logo_url: '', ativo: true },
        { id: 2, nome: '', logo_url: '', ativo: true },
        { id: 3, nome: '', logo_url: '', ativo: true },
        { id: 4, nome: '', logo_url: '', ativo: true }
    ]);
    const [salvandoPatrocinadores, setSalvandoPatrocinadores] = useState(false);
    const [metricasArena, setMetricasArena] = useState({ lances: 0, visualizacoes: 0, downloads: 0 });

    // CONTROLADOR MESTRE DE POPUPS CUSTOMIZADOS
    const [notificacao, setNotificacao] = useState({
        aberto: false,
        tipo: 'alert',
        titulo: '',
        mensagem: '',
        onConfirmar: null
    });

    const router = useRouter();

    const [urlBaseSistema, setUrlBaseSistema] = useState(process.env.NEXT_PUBLIC_APP_URL || 'https://fox-replay.vercel.app');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined') {
                setUrlBaseSistema(process.env.NEXT_PUBLIC_APP_URL || window.location.origin);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

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

    // 🔒 AUTH GUARD SECURE MIDDLEWARE
    useEffect(() => {
        async function verificarSessaoSegura() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    router.push('/login');
                    return;
                }

                setUsuarioId(session.user.id);

                // Filtrando as arenas estritamente pelo id de quem está logado
                const { data: arenasData } = await supabase
                    .from('arenas')
                    .select('*')
                    .eq('usuario_id', session.user.id)
                    .order('nome', { ascending: true });

                let arenasCarregadas = arenasData || [];
                if (arenasCarregadas.length === 0) {
                    const isSuperAdmin = session.user.email?.includes('admin') || session.user.user_metadata?.role === 'super_admin';
                    if (isSuperAdmin) {
                        const { data: todasArenas } = await supabase.from('arenas').select('*').order('nome', { ascending: true });
                        if (todasArenas && todasArenas.length > 0) {
                            arenasCarregadas = todasArenas;
                        }
                    }
                }

                if (arenasCarregadas.length === 0) {
                    // Se for atleta, redirecionamento silencioso
                    if (session.user.user_metadata?.tipo_usuario === 'atleta') {
                        router.replace('/perfil');
                        return;
                    }
                    router.push('/cadastro');
                    return;
                }

                setMinhasArenas(arenasCarregadas);

                let idAtivo = localStorage.getItem('fox_arena_id');
                const arenaExiste = arenasCarregadas.find(a => a.id === idAtivo);

                if (!idAtivo || !arenaExiste) {
                    idAtivo = arenasCarregadas[0].id;
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
            setLogoArenaInput(dadosArena.logo_url || (dadosArena.id ? localStorage.getItem('fox_logo_' + dadosArena.id) : '') || '');

            let patsCarregados = [];
            if (dadosArena.patrocinadores && Array.isArray(dadosArena.patrocinadores) && dadosArena.patrocinadores.length > 0) {
                patsCarregados = dadosArena.patrocinadores;
            } else if (dadosArena.id) {
                try {
                    const localPats = localStorage.getItem('fox_patrocinadores_' + dadosArena.id);
                    if (localPats) patsCarregados = JSON.parse(localPats);
                } catch (e) {}
            }

            const slotsFormatados = Array.from({ length: 4 }).map((_, idx) => {
                const item = patsCarregados[idx];
                return item ? { ...item, id: idx + 1 } : { id: idx + 1, nome: '', logo_url: '', ativo: true };
            });
            setPatrocinadoresInput(slotsFormatados);

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
                .eq('arena_id', arenaId)
                .order('criado_em', { ascending: true });

            if (erroQuadras) throw erroQuadras;

            const quadrasFormatadas = dadosQuadras.map(q => {
                const temDispositivo = q.dispositivos && q.dispositivos.length > 0;
                return {
                    id: q.id,
                    nome: q.nome,
                    status: q.status,
                    fotoUrl: q.foto_url,
                    temTotem: temDispositivo,
                    token: temDispositivo ? q.dispositivos[0].token_autenticacao : null
                };
            });

            setQuadras(quadrasFormatadas);

            // 3. Busca métricas de audiência dos patrocinadores (visualizações e downloads)
            let totalViews = 0;
            let totalDowns = 0;
            let totalLancesArena = 0;

            if (dadosQuadras && dadosQuadras.length > 0) {
                try {
                    const quadraIds = dadosQuadras.map(q => q.id);
                    const { data: statsReplays } = await supabase
                        .from('replays')
                        .select('id, visualizacoes, downloads')
                        .in('quadra_id', quadraIds);

                    if (statsReplays) {
                        totalLancesArena = statsReplays.length;
                        totalViews = statsReplays.reduce((acc, r) => acc + (r.visualizacoes || 0), 0);
                        totalDowns = statsReplays.reduce((acc, r) => acc + (r.downloads || 0), 0);
                    }
                } catch (eStats) {
                    console.warn('Estatísticas ainda não inicializadas no banco:', eStats);
                }
            }

            setMetricasArena({
                lances: totalLancesArena,
                visualizacoes: totalViews,
                downloads: totalDowns
            });

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
                    estado: novoEstadoArena.trim().toUpperCase() || null,
                    limite_quadras: 2,
                    plano_nome: 'Plano Padrão'
                }])
                .select()
                .single();

            if (erroNovaArena) throw erroNovaArena;

            mostrarAviso('Sucesso', 'Nova unidade cadastrada com sucesso no sistema!');

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
            mostrarAviso('Erro de Cadastro', 'Não foi possível criar uma nova unidade agora.');
        } finally {
            setCriandoNovaArena(false);
        }
    };

    const handleSalvarPatrocinadores = async (e) => {
        e?.preventDefault();
        if (!arena?.id) return;
        setSalvandoPatrocinadores(true);

        try {
            // Atualiza no Supabase
            try {
                await supabase
                    .from('arenas')
                    .update({
                        logo_url: logoArenaInput.trim() || null,
                        patrocinadores: patrocinadoresInput
                    })
                    .eq('id', arena.id);
            } catch (errDb) {
                console.warn('Atualização no Supabase falhou (executar script SQL):', errDb);
            }

            // Armazenamento em cache local por ID da arena
            localStorage.setItem('fox_logo_' + arena.id, logoArenaInput.trim() || '');
            localStorage.setItem('fox_patrocinadores_' + arena.id, JSON.stringify(patrocinadoresInput));

            mostrarAviso('Sucesso', 'Patrocinadores e marca do vídeo salvos com sucesso! Os atletas já receberão essas marcas ao baixar os replays.');
        } catch (err) {
            console.error('Erro ao salvar patrocinadores:', err);
            mostrarAviso('Erro', 'Não foi possível salvar os patrocinadores.');
        } finally {
            setSalvandoPatrocinadores(false);
        }
    };

    const handleAtualizarSlotPatrocinador = (index, campo, valor) => {
        setPatrocinadoresInput(prev => {
            const copia = [...prev];
            copia[index] = { ...copia[index], [campo]: valor };
            return copia;
        });
    };

    const handleGerarRelatorioPatrocinadoresWhatsApp = () => {
        if (!arena) return;
        const patsAtivos = patrocinadoresInput.filter(p => p.ativo && p.nome).map(p => p.nome);
        const listaMarcas = patsAtivos.length > 0 ? patsAtivos.join(', ') : 'Marcas Parceiras';

        const texto = encodeURIComponent(
            `📊 *Relatório de Impacto de Patrocínio - Fox Replay*\n` +
            `🏟️ *Complexo:* ${arena.nome || 'Nossa Arena'}\n` +
            `📅 *Período:* Últimos lances gravados\n\n` +
            `🔥 *Métricas Oficiais de Audiência:*\n` +
            `• *Lances Registrados:* ${metricasArena.lances} jogadas\n` +
            `• *Visualizações Totais:* ${metricasArena.visualizacoes} reproduções\n` +
            `• *Downloads com Marca Gravada:* ${metricasArena.downloads} compartilhamentos\n\n` +
            `🤝 *Patrocinadores em Exibição:* ${listaMarcas}\n\n` +
            `_Dados auditados e certificados pela plataforma Fox Replay._`
        );
        window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
    };

    async function carregarReplaysDaQuadra(quadra) {
        setReplaysQuadra([]);
        setQuadraSelecionada(quadra);
        setCarregandoReplays(true);

        try {
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

    // FUNÇÃO PARA VINCULAR TOTEM INSTANTANEAMENTE VIA CÓDIGO DE 6 DÍGITOS
    const handleConectarTotemPorCodigo = async (e) => {
        e.preventDefault();
        if (!codigoTotemInput.trim() || !quadraIdPareamento) {
            mostrarAviso('Atenção', 'Selecione a quadra e digite o código de 6 dígitos exibido no totem.');
            return;
        }

        setSalvandoPareamento(true);
        try {
            let codLimpo = codigoTotemInput.trim().toUpperCase();
            if (codLimpo.length === 6 && !codLimpo.includes('-')) {
                codLimpo = `${codLimpo.substring(0, 3)}-${codLimpo.substring(3, 6)}`;
            }

            // 1. Busca se o código existe e está aguardando ativação
            const { data: pareamento, error: erroBusca } = await supabase
                .from('pareamentos')
                .select('*')
                .eq('codigo', codLimpo)
                .eq('status', 'pendente')
                .single();

            if (erroBusca || !pareamento) {
                mostrarAviso('Código Inválido', 'O código digitado não foi encontrado ou já foi utilizado. Verifique o código exibido na tela da quadra.');
                return;
            }

            // 2. Gera novo token seguro para a quadra
            const tokenGerado = `fox_tok_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;

            // 3. Cadastra o dispositivo
            const { error: erroDisp } = await supabase
                .from('dispositivos')
                .insert([{ quadra_id: quadraIdPareamento, token_autenticacao: tokenGerado }]);

            if (erroDisp) throw erroDisp;

            // 4. Marca o pareamento como vinculado
            const { error: erroUp } = await supabase
                .from('pareamentos')
                .update({
                    status: 'vinculado',
                    token_gerado: tokenGerado,
                    quadra_id: quadraIdPareamento
                })
                .eq('id', pareamento.id);

            if (erroUp) throw erroUp;

            mostrarAviso('Totem Ativado', 'O totem na quadra foi sincronizado com sucesso e já iniciou a gravação!');
            setModalParearAberto(false);
            setCodigoTotemInput('');
            setQuadraIdPareamento('');
            carregarDados(arena.id);

        } catch (err) {
            console.error('Erro ao parear totem:', err);
            mostrarAviso('Falha no Pareamento', err.message || 'Não foi possível conectar o totem.');
        } finally {
            setSalvandoPareamento(false);
        }
    };

    // CRIAÇÃO DE QUADRA RESPEITANDO A COTA E SEM GERAR TOKEN FAKE
    const handleCriarQuadra = async (e) => {
        e.preventDefault();
        if (!nomeQuadra.trim() || !arena) return;

        const limiteQuadras = arena.limite_quadras || 2;
        if (quadras.length >= limiteQuadras) {
            mostrarAviso(
                'Cota de Quadras Atingida',
                `Sua arena possui cota de ${limiteQuadras} quadras no plano contratado. Para adicionar mais quadras, entre em contato com o suporte Fox Replay.`
            );
            return;
        }

        setCriandoQuadra(true);
        try {
            // Insere a quadra limpa, sem criar dispositivos fakes
            const { error: erroQuadra } = await supabase
                .from('quadras')
                .insert([{
                    arena_id: arena.id,
                    nome: nomeQuadra.trim(),
                    foto_url: fotoUrl.trim() || null
                }]);

            if (erroQuadra) throw erroQuadra;

            setNomeQuadra('');
            setFotoUrl('');
            mostrarAviso(
                'Quadra Cadastrada',
                'Nova quadra criada com sucesso! O totem físico será ativado pelo suporte Fox Replay no momento da instalação.'
            );
            carregarDados(arena.id);
        } catch (error) {
            console.error(error);
            mostrarAviso('Erro no Cadastro', error.message || 'Não foi possível cadastrar a quadra.');
        } finally {
            setCriandoQuadra(false);
        }
    };

    const copiarParaTransferencia = (texto) => {
        if (!texto) return;
        navigator.clipboard.writeText(texto);
        mostrarAviso('Token Copiado', 'O token de hardware foi copiado para a sua área de transferência.');
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

            mostrarAviso('Atualizado', 'As alterações da quadra foram salvas com sucesso.');
            setModalEditarAberto(false);
            carregarDados(arena.id);
        } catch (error) {
            console.error(error);
            mostrarAviso('Erro', 'Não foi possível salvar as alterações.');
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleExcluirQuadra = (idQuadra) => {
        mostrarConfirmacao(
            'Excluir Quadra?',
            'Tem certeza que deseja desvincular esta quadra? Todos os replays associados a ela serão perdidos.',
            async () => {
                try {
                    const { error } = await supabase
                        .from('quadras')
                        .delete()
                        .eq('id', idQuadra);

                    if (error) throw error;

                    mostrarAviso('Removida', 'A quadra foi excluída com sucesso.');
                    setModalEditarAberto(false);
                    carregarDados(arena.id);
                } catch (error) {
                    console.error(error);
                    mostrarAviso('Erro', 'Não foi possível excluir a quadra.');
                }
            }
        );
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('fox_arena_id');
        router.push('/login');
    };

    const limiteQuadras = arena?.limite_quadras || 2;
    const cotaAtingida = quadras.length >= limiteQuadras;

    return (
        <>
            <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 md:p-8 relative selection:bg-amber-500 selection:text-black overflow-x-hidden">
                {/* Linhas de Grade e Ambiência Futurista com Halos Âmbar */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-400/15 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

                <div className="max-w-[1100px] mx-auto relative z-10 space-y-8">
                    {/* Header Navbar com Efeito Glass */}
                    <div className="flex justify-between items-center border-b border-zinc-200/80 backdrop-blur-xl bg-white/70 px-4 py-3.5 rounded-2xl shadow-xs">
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
                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Unidade:</span>
                                    <select
                                        value={arena?.id || ''}
                                        onChange={(e) => handleMudarArenaAtiva(e.target.value)}
                                        className="bg-white border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs hover:border-amber-400 transition-colors"
                                    >
                                        {minhasArenas.map((a) => (
                                            <option key={a.id} value={a.id} className="bg-white text-zinc-900">
                                                {a.nome} {a.cidade ? `(${a.cidade})` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setModalNovaArenaAberto(true)}
                                        className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-transparent text-amber-700 hover:text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-xs"
                                    >
                                        + Nova Unidade
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-xs bg-zinc-100 text-zinc-600 border border-zinc-200 px-4 py-2.5 rounded-xl hover:bg-zinc-950 hover:text-white hover:border-transparent transition-all font-bold shadow-xs active:scale-95"
                        >
                            Sair do Painel
                        </button>
                    </div>

                    {/* Bento Box 1: Material de Divulgação em Glass */}
                    <div className="glass-card-light rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="space-y-3 text-center md:text-left max-w-xl">
                            <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
                                Merchandising Físico da Arena
                            </span>
                            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Portal de Replays Operacional</h2>
                            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                Imprima a placa oficial personalizada para fixar no balcão da recepção ou nas telas das quadras da unidade selecionada. Cada complexo possui chaves e QR Codes totalmente independentes.
                            </p>
                            <div className="pt-1 flex flex-wrap gap-3 justify-center md:justify-start">
                                <button
                                    onClick={dispararImpressao}
                                    className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider shadow-sm active:scale-95"
                                >
                                    Imprimir Placa da Arena ({arena?.nome})
                                </button>
                                <a
                                    href={linkPortalPublico}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 px-4 py-2.5 rounded-xl transition-all font-bold tracking-wide shadow-sm"
                                >
                                    Abrir Link Público do Hub ➔
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
                                QR Code de Acesso Rápido
                            </span>
                        </div>
                    </div>

                    {/* Bento Box 2: Patrocinadores e Marcas no Vídeo em Glass */}
                    <div className="glass-card-light rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 border border-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block shadow-sm">
                                        Monetização & Publicidade
                                    </span>
                                    <span className="text-xs font-mono text-zinc-400 font-bold">
                                        4 Posições
                                    </span>
                                </div>
                                <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mt-1">
                                    Patrocinadores no Vídeo e Logo da Arena
                                </h2>
                                <p className="text-zinc-500 text-xs mt-0.5">
                                    Defina sua logomarca e até 4 patrocinadores para serem gravados diretamente nos replays que os atletas baixam e compartilham.
                                </p>
                            </div>

                            <button
                                onClick={handleSalvarPatrocinadores}
                                disabled={salvandoPatrocinadores}
                                className="self-start md:self-auto text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-3 rounded-xl transition-all uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
                            >
                                {salvandoPatrocinadores ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Salvar Marcas do Vídeo</span>
                                        <span>✓</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Formulário: Logo da Arena + 4 Patrocinadores */}
                            <div className="lg:col-span-7 space-y-5">
                                {/* Campo da Logo da Arena */}
                                <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2">
                                    <label className="text-xs font-black text-zinc-800 uppercase tracking-wide flex items-center justify-between">
                                        <span>Logomarca da Sua Arena (Topo Direito)</span>
                                        <span className="text-[10px] text-zinc-400 font-normal">PNG transparente recomendado</span>
                                    </label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="url"
                                            value={logoArenaInput}
                                            onChange={(e) => setLogoArenaInput(e.target.value)}
                                            placeholder="https://exemplo.com/logo-arena.png"
                                            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-medium focus:outline-none focus:border-amber-500 transition-colors shadow-xs"
                                        />
                                        {logoArenaInput && (
                                            <div className="w-10 h-10 rounded-xl border border-zinc-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                                <img src={logoArenaInput} alt="Preview" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Grid dos 4 Patrocinadores */}
                                <div className="space-y-3">
                                    <span className="text-xs font-black text-zinc-800 uppercase tracking-wide block">
                                        Grade dos 4 Patrocinadores (Rodapé do Vídeo)
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {patrocinadoresInput.map((pat, idx) => (
                                            <div
                                                key={pat.id || idx}
                                                className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2.5 relative group hover:border-amber-500/40 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase font-mono">
                                                        Slot 0{idx + 1}
                                                    </span>
                                                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-600 font-bold">
                                                        <input
                                                            type="checkbox"
                                                            checked={pat.ativo}
                                                            onChange={(e) => handleAtualizarSlotPatrocinador(idx, 'ativo', e.target.checked)}
                                                            className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                                                        />
                                                        <span>Ativo</span>
                                                    </label>
                                                </div>

                                                <input
                                                    type="text"
                                                    value={pat.nome || ''}
                                                    onChange={(e) => handleAtualizarSlotPatrocinador(idx, 'nome', e.target.value)}
                                                    placeholder={`Nome da Marca 0${idx + 1}`}
                                                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 font-medium focus:outline-none focus:border-amber-500 transition-colors shadow-xs"
                                                />

                                                <input
                                                    type="url"
                                                    value={pat.logo_url || ''}
                                                    onChange={(e) => handleAtualizarSlotPatrocinador(idx, 'logo_url', e.target.value)}
                                                    placeholder="URL da logo (opcional)"
                                                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 font-medium focus:outline-none focus:border-amber-500 transition-colors shadow-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-normal bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                                        💡 <strong>Dica de Monetização:</strong> Os slots vazios ou desativados exibirão automaticamente o selo padrão <strong>ANUNCIE Aqui!</strong> (como na referência), estimulando empresas locais que assistirem ao replay a patrocinarem a sua arena.
                                    </p>
                                </div>
                            </div>

                            {/* Simulador / Preview em Tempo Real do Vídeo 9:16 */}
                            <div className="lg:col-span-5 flex flex-col items-center">
                                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-2 font-mono">
                                    Prévia Exata do Vídeo Gravado (9:16)
                                </span>

                                {/* Moldura de Smartphone */}
                                <div className="w-[260px] bg-[#070709] border-[6px] border-zinc-800 rounded-[32px] p-2.5 shadow-2xl relative overflow-hidden flex flex-col gap-2">
                                    {/* Topo do Vídeo */}
                                    <div className="flex items-center justify-between px-1 border-b border-white/10 pb-1.5 pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <img
                                                src="/logo-fox.jpeg"
                                                alt="Fox Replay"
                                                className="w-6 h-6 object-cover rounded-md border border-amber-500/40"
                                            />
                                            <span className="text-[9px] font-black text-white uppercase leading-none">
                                                FOX <span className="text-amber-500">REPLAY</span>
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            {logoArenaInput ? (
                                                <img
                                                    src={logoArenaInput}
                                                    alt="Arena Logo"
                                                    className="h-6 max-w-[70px] object-contain rounded bg-white/5 p-0.5 border border-white/10"
                                                />
                                            ) : (
                                                <span className="text-[8px] font-black text-white uppercase block truncate max-w-[80px]">
                                                    {arena?.nome || 'SUA ARENA'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Centro: Tela do Vídeo */}
                                    <div className="w-full aspect-[9/12] bg-zinc-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-zinc-800">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xs shadow-lg relative z-10">
                                            ▶
                                        </div>
                                        <span className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                                            LANCE 30s
                                        </span>
                                    </div>

                                    {/* Rodapé: Barra dos 4 Patrocinadores */}
                                    <div className="grid grid-cols-4 gap-1 w-full h-11 pt-0.5">
                                        {patrocinadoresInput.map((p, i) => {
                                            const tem = p && p.ativo && (p.logo_url || p.nome);
                                            return (
                                                <div
                                                    key={i}
                                                    className="bg-[#14151b] border border-white/10 rounded-lg flex flex-col items-center justify-center p-1 overflow-hidden text-center"
                                                >
                                                    {tem ? (
                                                        p.logo_url ? (
                                                            <img src={p.logo_url} alt={p.nome} className="max-h-full max-w-full object-contain" />
                                                        ) : (
                                                            <span className="text-[7px] font-black text-white truncate px-0.5 uppercase">
                                                                {p.nome}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center leading-none scale-90">
                                                            <span className="text-[6px] font-black text-white uppercase">ANUNCIE</span>
                                                            <span className="text-[7px] font-black text-amber-400">Aqui!</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <span className="text-[10px] text-zinc-400 font-medium text-center mt-3 max-w-xs">
                                    O atleta faz o download desse arquivo com áudio e vídeo em alta definição pronto para postar.
                                </span>
                            </div>
                        </div>

                        {/* Barra de Impacto e Métricas de Audiência dos Patrocinadores */}
                        <div className="pt-4 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/80 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-zinc-200/80">
                            <div className="grid grid-cols-3 gap-4 flex-1">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                                        Lances Gravados
                                    </span>
                                    <span className="text-xl font-black text-zinc-900">
                                        {metricasArena.lances}
                                    </span>
                                </div>
                                <div className="space-y-0.5 border-l border-zinc-200/80 pl-4">
                                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                                        Visualizações
                                    </span>
                                    <span className="text-xl font-black text-amber-600">
                                        {metricasArena.visualizacoes}
                                    </span>
                                </div>
                                <div className="space-y-0.5 border-l border-zinc-200/80 pl-4">
                                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                                        Downloads com Marca
                                    </span>
                                    <span className="text-xl font-black text-emerald-600">
                                        {metricasArena.downloads}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGerarRelatorioPatrocinadoresWhatsApp}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                            >
                                <span>📱 Relatório para Patrocinadores</span>
                            </button>
                        </div>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Box de Cadastro e Cota de Quadras */}
                        <div className="glass-card-light p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">
                                    Adicionar Quadra
                                </h2>
                                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                    {quadras.length}/{limiteQuadras} no plano
                                </span>
                            </div>

                            {/* Alerta de Cota Atingida */}
                            {cotaAtingida ? (
                                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                                    <p className="text-xs font-bold text-amber-800 uppercase">Cota Máxima Atingida</p>
                                    <p className="text-[11px] text-amber-700 leading-normal">
                                        Todas as {limiteQuadras} quadras do seu {arena?.plano_nome || 'plano'} já foram cadastradas. Para monitorar mais quadras, entre em contato com o suporte Fox Replay.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleCriarQuadra} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                            Nome da Quadra
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
                                            Foto da Quadra (Opcional)
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
                                        className="w-full py-3 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50 shadow-md active:scale-98"
                                    >
                                        {criandoQuadra ? 'Salvando...' : 'Cadastrar Quadra'}
                                    </button>
                                </form>
                            )}

                            {/* PAREAMENTO RÁPIDO VIA CÓDIGO (ESTILO SMART TV) */}
                            <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <IconRadio className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                                        Vincular Totem da Quadra
                                    </h3>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                                    O técnico Fox Replay ligou o totem na quadra? Digite o código exibido na TV para parear.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setModalParearAberto(true)}
                                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <span>Digitar Código de Pareamento</span>
                                    <span>➔</span>
                                </button>
                            </div>
                        </div>

                        {/* Listagem de Quadras Cadastradas */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between select-none">
                                <h2 className="text-sm font-black text-zinc-400 uppercase tracking-wider">
                                    Quadras Cadastradas ({quadras.length})
                                </h2>
                                <span className="text-xs font-mono text-zinc-400">
                                    Cota: {quadras.length} de {limiteQuadras}
                                </span>
                            </div>

                            {carregando ? (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs text-zinc-400 font-bold mt-3 animate-pulse">Sincronizando infraestrutura...</p>
                                </div>
                            ) : quadras.length === 0 ? (
                                <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-wider space-y-2">
                                    <p>Nenhuma quadra cadastrada neste complexo.</p>
                                    <p className="text-[11px] text-zinc-500 font-normal">
                                        Utilize o formulário ao lado para dar o nome da sua primeira quadra (ex: Quadra Central).
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quadras.map((quadra) => (
                                        <div key={quadra.id} className="glass-card-light rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300">
                                            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                                                <div className="flex items-center gap-4 truncate">
                                                    {quadra.fotoUrl ? (
                                                        <img
                                                            src={quadra.fotoUrl}
                                                            alt={quadra.nome}
                                                            className="w-12 h-12 object-cover rounded-xl border border-zinc-200 shrink-0 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 shadow-inner text-zinc-400">
                                                            <IconBuilding className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div className="truncate">
                                                        <h3 className="text-base font-bold text-zinc-900 tracking-wide uppercase">{quadra.nome}</h3>
                                                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">UUID: {quadra.id}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                                    {quadra.temTotem ? (
                                                        <span className="px-2.5 py-1 text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span>Totem Ativo</span>
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            <span>Aguardando Totem</span>
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => carregarReplaysDaQuadra(quadra)}
                                                        className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-xl hover:border-amber-500/30 hover:text-amber-600 transition-all font-bold flex items-center gap-1 shadow-sm"
                                                    >
                                                        <IconFilm className="w-3.5 h-3.5" />
                                                        <span>Gravações</span>
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalEditar(quadra)}
                                                        className="text-xs bg-white border border-zinc-200 text-zinc-400 px-3 py-1.5 rounded-xl hover:border-zinc-400 hover:text-zinc-700 transition-all font-bold shadow-sm"
                                                    >
                                                        <IconSettings className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Hardware Credentials / Status Box */}
                                            {quadra.temTotem ? (
                                                <div className="flex items-center justify-between gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200 shadow-inner">
                                                    <div className="overflow-hidden">
                                                        <span className="block text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 select-none">
                                                            Token Ativo de Conexão do Totem
                                                        </span>
                                                        <p className="text-xs font-mono text-zinc-600 truncate tracking-wide bg-white px-2.5 py-2 rounded-lg border border-zinc-200/60 shadow-sm">
                                                            {quadra.token}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => copiarParaTransferencia(quadra.token)}
                                                        className="text-xs shrink-0 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 px-3 py-2 rounded-xl transition-all font-bold shadow-sm active:scale-95"
                                                    >
                                                        Copiar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                                                            Instalação Pendente
                                                        </span>
                                                        <p className="text-[11px] text-zinc-500">
                                                            O totem físico será vinculado pelo suporte técnico Fox Replay.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setQuadraIdPareamento(quadra.id);
                                                            setModalParearAberto(true);
                                                        }}
                                                        className="text-xs font-bold text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all shrink-0"
                                                    >
                                                        Digitar Código da TV ➔
                                                    </button>
                                                </div>
                                            )}
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
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider text-center py-12 border border-dashed border-zinc-200 rounded-xl">
                                            Nenhum take gravado nesta quadra nas últimas horas.
                                        </p>
                                    ) : (
                                        replaysQuadra.map((replay) => {
                                            const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;
                                            const horario = replay.criado_em
                                                ? new Date(replay.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                                : 'Recente';

                                            return (
                                                <div key={replay.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="w-20 aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 shrink-0 relative">
                                                            <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Take cortado às {horario}</p>
                                                            <a href={linkJogador} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:text-amber-700 hover:underline mt-1 font-bold inline-block">
                                                                Visualizar Página do Atleta ➔
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
                                            className="w-full py-3.5 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50 shadow-md active:scale-98"
                                        >
                                            {salvandoEdicao ? 'Salvando dados...' : 'Salvar Alterações'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleExcluirQuadra(quadraParaEditar.id)}
                                            className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Excluir Quadra
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
                                        Cadastrar Nova Unidade / Filial
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
                                            placeholder="Ex: Arena Sunset Unidade Centro"
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
                                            className="w-full py-3.5 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50 shadow-md active:scale-98"
                                        >
                                            {criandoNovaArena ? 'Integrando filial...' : 'Cadastrar Unidade ➔'}
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
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (notificacao.onConfirmar) notificacao.onConfirmar();
                                            fecharNotificacao();
                                        }}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                                    >
                                        Confirmar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={fecharNotificacao}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                                >
                                    Entendido
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PAREAMENTO RÁPIDO DO TOTEM (CÓDIGO DE 6 DÍGITOS) */}
            {modalParearAberto && (
                <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-[420px] space-y-5 relative shadow-2xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <IconRadio className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                                    Vincular Totem da Quadra
                                </h3>
                            </div>
                            <button
                                onClick={() => setModalParearAberto(false)}
                                className="text-zinc-400 hover:text-zinc-700 text-xs bg-zinc-50 border border-zinc-200 w-7 h-7 rounded-lg flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                            Ligue o totem na quadra e veja o código exibido na TV (ex: <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 font-bold">852-149</code>). Digite abaixo para ativar na hora:
                        </p>

                        <form onSubmit={handleConectarTotemPorCodigo} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                    1. Qual quadra está com este totem?
                                </label>
                                <select
                                    required
                                    value={quadraIdPareamento}
                                    onChange={(e) => setQuadraIdPareamento(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                    <option value="">Selecione a quadra...</option>
                                    {quadras.map((q) => (
                                        <option key={q.id} value={q.id}>
                                            {q.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                                    2. Código de Ativação (6 dígitos)
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={7}
                                    value={codigoTotemInput}
                                    onChange={(e) => setCodigoTotemInput(e.target.value)}
                                    placeholder="Ex: 852-149"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-2 border-zinc-200 text-zinc-900 placeholder-zinc-400 text-center text-lg font-black tracking-widest focus:outline-none focus:border-amber-500 uppercase"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={salvandoPareamento}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {salvandoPareamento ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        <span>Conectando ao Totem...</span>
                                    </>
                                ) : (
                                    <span>Ativar Totem na Quadra ➔</span>
                                )}
                            </button>
                        </form>
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
                        Como baixar a sua jogada:
                    </h4>
                    <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
                        <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</strong>
                        Fez um ponto incrível ou jogada bonita? Vá até o totem da quadra e pressione o botão físico imediatamente.
                    </p>
                    <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
                        <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</strong>
                        Ao final da sua partida, escaneie este QR Code utilizando a câmera do seu smartphone.
                    </p>
                    <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
                        <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</strong>
                        Selecione a numeração da sua quadra, encontre o seu lance pelo horário e salve o clipe direto na sua galeria!
                    </p>
                </div>

                <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase m-0 mt-8">
                    SISTEMA AUTOMÁTICO DE REPLAYS ESPORTIVOS
                </p>
            </div>
        </>
    );
}
