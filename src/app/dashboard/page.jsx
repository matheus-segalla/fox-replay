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

    // Estados para o histórico de gravações
    const [replaysQuadra, setReplaysQuadra] = useState([]);
    const [quadraSelecionada, setQuadraSelecionada] = useState(null);
    const [carregandoReplays, setCarregandoReplays] = useState(false);

    const router = useRouter();

    // URL base do sistema (quando fizermos o deploy, mudamos localhost para o link da Vercel)
    const urlBaseSistema = "http://localhost:3000";
    const linkPortalPublico = arena ? `${urlBaseSistema}/arena/${arena.id}` : '';

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

    useEffect(() => {
        const arenaId = localStorage.getItem('fox_arena_id');
        if (!arenaId) {
            router.push('/cadastro');
            return;
        }
        carregarDados(arenaId);
    }, [router]);

    const handleCriarQuadra = async (e) => {
        e.preventDefault();
        if (!nomeQuadra.trim() || !arena) return;

        setCriandoQuadra(true);
        try {
            const { data: novaQuadra, error: erroQuadra } = await supabase
                .from('quadras')
                .insert([{ arena_id: arena.id, nome: nomeQuadra }])
                .select()
                .single();

            if (erroQuadra) throw erroQuadra;

            const tokenGerado = `fox_tok_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;

            const { error: erroDispositivo } = await supabase
                .from('dispositivos')
                .insert([{ quadra_id: novaQuadra.id, token_autenticacao: tokenGerado }]);

            if (erroDispositivo) throw erroDispositivo;

            setNomeQuadra('');
            alert('Nova quadra monitorada adicionada com sucesso! 🎾');
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

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-main text-white">
                <p className="animate-pulse text-lg text-gold font-bold tracking-wider">Acessando os servidores FOX REPLAY...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main text-white font-sans p-8 relative overflow-hidden">
            {/* Ambientação de iluminação de fundo (Glow sutil) */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold-glow rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[1100px] mx-auto relative z-10">

                {/* HEADER DO SAAS */}
                <div className="flex justify-between items-center border-b border-border-card pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-widest text-white">
                            FOX <span className="text-gold">REPLAY</span>
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">
                            Painel Administrativo: <span className="text-silver font-semibold">{arena?.nome}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/cadastro'); }}
                        className="text-xs bg-red-500/5 text-red-400 border border-red-500/10 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all font-semibold"
                    >
                        Sair / Trocar Arena
                    </button>
                </div>

                {/* SEÇÃO EXTRAORDINÁRIA: DESTAQUE DO QR CODE DA ARENA PARA OS JOGADORES */}
                <div className="bg-bg-card border border-border-card rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="space-y-3 text-center md:text-left max-w-xl">
                        <span className="text-[10px] font-bold text-black bg-gold px-3 py-1 rounded-full uppercase tracking-widest">
                            QR Code Oficial dos Clientes
                        </span>
                        <h2 className="text-xl font-black text-white">Seu Portal de Replays está Pronto!</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Imprima este QR Code e coloque-o na recepção ou nas quadras. Quando os jogadores escanearem, eles entrarão direto no menu de quadras da <span className="text-silver font-bold">{arena?.nome}</span> para assistir e baixar os lances na hora.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                            <a
                                href={linkPortalPublico}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-bg-main hover:bg-border-card text-white border border-border-card px-4 py-2.5 rounded-xl transition-all font-bold tracking-wide"
                            >
                                Abrir Portal Público 🔗
                            </a>
                            <button
                                onClick={() => copiarParaTransferencia(linkPortalPublico)}
                                className="text-xs bg-transparent border border-border-card text-gray-400 hover:text-white px-4 py-2.5 rounded-xl transition-all font-medium"
                            >
                                Copiar Link do Portal
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-gold-glow text-center flex flex-col items-center shrink-0">
                        <QRCodeSVG value={linkPortalPublico} size={135} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3">
                            Escanear no Balcão 📱
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
                                    placeholder="Ex: Quadra 2 (Coberta)"
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
                                            <div className="truncate">
                                                <h3 className="text-base font-black text-white tracking-wide">{quadra.nome}</h3>
                                                <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">ID: {quadra.id}</p>
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

                {/* 🌟 INJEÇÃO DO MODAL SUSPENSO COM BACKDROP BLUR (SUBSTITUINDO A EXIBIÇÃO NO RODAPÉ) 🌟 */}
                {quadraSelecionada && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-bg-card border border-border-card rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-gold-glow/5 relative">

                            {/* Cabeçalho Fixo do Modal */}
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

                            {/* Corpo do Modal (Rolagem Interna Inteligente) */}
                            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                                {carregandoReplays ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs text-gray-500 animate-pulse uppercase tracking-widest font-bold">Buscando lances no banco de dados...</p>
                                    </div>
                                ) : replaysQuadra.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-12">
                                        Nenhum take gravado nesta quadra recentemente.
                                    </p>
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

            </div>
        </div>
    );
}