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
            alert('Nova quadra monitorada adicionada com sucesso!');
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
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
                <p className="animate-pulse text-lg">Acessando os servidores FOX REPLAY...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans p-8">
            <div className="max-w-[1100px] mx-auto">

                {/* HEADER DO SAAS */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wider">
                            FOX <span className="text-[#00ff66]">REPLAY</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Painel Administrativo: <span className="text-white font-semibold">{arena?.nome}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/cadastro'); }}
                        className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                        Sair / Trocar Arena
                    </button>
                </div>

                {/* 🌟 NOVA SEÇÃO EXTRAORDINÁRIA: DESTAQUE DO QR CODE DA ARENA PARA OS JOGADORES 🌟 */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-3 text-center md:text-left max-w-xl">
                        <span className="text-[10px] font-bold text-black bg-[#00ff66] px-2.5 py-1 rounded-full uppercase tracking-widest">
                            QR Code Oficial dos Clientes
                        </span>
                        <h2 className="text-xl font-black text-white">Seu Portal de Replays está Pronto!</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Imprima este QR Code e coloque-o na recepção ou nas quadras. Quando os jogadores escanearem, eles entrarão direto no menu de quadras da <span className="text-white font-bold">{arena?.nome}</span> para assistir e baixar os lances.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                            <a
                                href={linkPortalPublico}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-4 py-2 rounded-xl transition-all font-semibold"
                            >
                                Abrir Portal Público 🔗
                            </a>
                            <button
                                onClick={() => copiarParaTransferencia(linkPortalPublico)}
                                className="text-xs bg-transparent border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-all"
                            >
                                Copiar Link do Portal
                            </button>
                        </div>
                    </div>

                    {/* Gerador automático do QR Code baseado na Arena logada */}
                    <div className="bg-white p-4 rounded-2xl shadow-xl shadow-[#00ff66]/5 text-center flex flex-col items-center shrink-0">
                        <QRCodeSVG value={linkPortalPublico} size={140} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3">
                            Escanear no Balcão 📱
                        </span>
                    </div>
                </div>

                {/* CORPO DO DASHBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* CADASTRO DE QUADRAS */}
                    <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800 h-fit">
                        <h2 className="text-lg font-bold mb-4 text-[#00ff66]">➕ Nova Quadra</h2>
                        <form onSubmit={handleCriarQuadra} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                                    Nome da Quadra
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nomeQuadra}
                                    onChange={(e) => setNomeQuadra(e.target.value)}
                                    placeholder="Ex: Quadra 2 (Coberta)"
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#1c1c1c] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00ff66]"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={criandoQuadra}
                                className="w-full py-3 text-black font-bold text-sm rounded-xl bg-[#00ff66] hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {criandoQuadra ? 'Salvando dados...' : 'Adicionar Quadra'}
                            </button>
                        </form>
                    </div>

                    {/* LISTAGEM DE QUADRAS */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-gray-300">Suas Quadras Monitoradas</h2>

                        {quadras.length === 0 ? (
                            <div className="bg-[#141414] border border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-sm">
                                Nenhuma quadra configurada nesta arena até o momento.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {quadras.map((quadra) => (
                                    <div key={quadra.id} className="bg-[#141414] border border-gray-800 rounded-xl p-5 space-y-4">

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base font-bold text-white">{quadra.nome}</h3>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID da Quadra: {quadra.id}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 text-xs font-semibold bg-green-500/10 text-[#00ff66] border border-green-500/20 rounded-full mr-2">
                                                    {quadra.status}
                                                </span>
                                                <button
                                                    onClick={() => carregarReplaysDaQuadra(quadra)}
                                                    className="text-xs bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 px-3 py-1.5 rounded-lg hover:bg-[#00ff66] hover:text-black transition-all font-semibold"
                                                >
                                                    🎥 Ver Gravações
                                                </button>
                                            </div>
                                        </div>

                                        {/* HARDWARE TOKEN */}
                                        <div className="flex items-center justify-between gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
                                            <div className="overflow-hidden">
                                                <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">🔑 Token Secreto do Totem (Raspberry)</span>
                                                <p className="text-xs font-mono text-gray-300 truncate tracking-wide bg-black/40 p-1.5 rounded border border-gray-900">{quadra.token}</p>
                                            </div>
                                            <button
                                                onClick={() => copiarParaTransferencia(quadra.token)}
                                                className="text-xs shrink-0 bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1.5 rounded hover:text-white transition-all"
                                            >
                                                Copiar
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                        {/* HISTÓRICO DE LANCES EXPANDIDO */}
                        {quadraSelecionada && (
                            <div className="bg-[#141414] border border-[#00ff66]/30 rounded-2xl p-6 mt-8 shadow-xl">
                                <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
                                    <h3 className="text-base font-bold text-white">
                                        Histórico de Lances: <span className="text-[#00ff66]">{quadraSelecionada.nome}</span>
                                    </h3>
                                    <button onClick={() => setQuadraSelecionada(null)} className="text-xs text-gray-500 hover:text-white">
                                        Fechar Histórico ✕
                                    </button>
                                </div>

                                {carregandoReplays ? (
                                    <p className="text-sm text-gray-500 animate-pulse py-4">Buscando lances no banco de dados...</p>
                                ) : replaysQuadra.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-6">
                                        Nenhum take gravado nesta quadra recentemente.
                                    </p>
                                ) : (
                                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                                        {replaysQuadra.map((replay) => {
                                            const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;
                                            const horario = replay.criado_em ? replay.criado_em.split('T')[1]?.substring(0, 8) : 'Identificado';

                                            return (
                                                <div key={replay.id} className="bg-[#1c1c1c] p-4 rounded-xl border border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="w-20 aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 shrink-0">
                                                            <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">Take gerado às {horario}</p>
                                                            <a href={linkJogador} target="_blank" rel="noreferrer" className="text-xs text-[#00ff66] hover:underline">
                                                                Abrir link isolado do lance 🔗
                                                            </a>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-1.5 rounded-lg shrink-0">
                                                        <QRCodeSVG value={linkJogador} size={60} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}