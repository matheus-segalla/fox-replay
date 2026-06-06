'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function PortalArena() {
    const params = useParams();
    const arenaId = params.arenaId;
    const router = useRouter();

    const [arena, setArena] = useState(null);
    const [quadras, setQuadras] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarPortal() {
            try {
                // 1. Busca os dados da Arena
                const { data: dadosArena, error: errA } = await supabase
                    .from('arenas')
                    .select('*')
                    .eq('id', arenaId)
                    .single();

                if (errA) throw errA;
                setArena(dadosArena);

                // 2. Busca todas as quadras trazendo a coluna foto_url
                const { data: dadosQuadras, error: errQ } = await supabase
                    .from('quadras')
                    .select('id, nome, status, foto_url')
                    .eq('arena_id', arenaId)
                    .order('nome', { ascending: true });

                if (errQ) throw errQ;
                setQuadras(dadosQuadras || []);

            } catch (error) {
                console.error('Erro ao carregar portal público:', error);
            } finally {
                setCarregando(false);
            }
        }

        if (arenaId) carregarPortal();
    }, [arenaId]);

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-main">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-gold font-bold tracking-wider text-xs uppercase">Abrindo portal da arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main text-white font-sans p-4 pb-12 flex flex-col items-center relative overflow-hidden">
            {/* Iluminação difusa ao fundo estilo Tech */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-glow rounded-full blur-[140px] pointer-events-none" />

            {/* 🌟 NOVO HEADER / NAVBAR ESTILO APLICATIVO NATIVO 🌟 */}
            <header className="w-full max-w-[440px] flex justify-between items-center py-3 border-b border-border-card/60 mb-8 shrink-0 relative z-20">
                <button
                    onClick={() => router.push('/')}
                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-bg-card border border-border-card/80 px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95"
                >
                    ← Voltar
                </button>
                <h2 className="text-xs font-black tracking-widest text-white uppercase select-none">
                    FOX <span className="text-gold">REPLAY</span>
                </h2>
                {/* Div invisível apenas para manter o equilíbrio do flex space-between */}
                <div className="w-[62px] h-[30px] opacity-0 pointer-events-none hidden sm:block" />
            </header>

            {/* CONTEÚDO PRINCIPAL DO PORTAL */}
            <div className="w-full max-w-[440px] text-center relative z-10">

                {/* IDENTIFICAÇÃO INTERNA */}
                <span className="text-[9px] font-black text-gold uppercase tracking-widest bg-gold/5 px-2.5 py-1 rounded-full border border-gold/10 inline-block shadow-sm">
                    Complexo Esportivo Parceiro
                </span>

                <h1 className="text-3xl font-black mt-3 tracking-tight text-white uppercase">{arena?.nome}</h1>
                <p className="text-gray-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                    Selecione a quadra em que você jogou para assistir e baixar os seus takes de vídeo de hoje.
                </p>

                {/* GRID DE QUADRAS CUSTOMIZADO COM FOTO */}
                <div className="mt-8 space-y-5 text-left">
                    {quadras.length === 0 ? (
                        <div className="bg-bg-card border border-dashed border-border-card rounded-2xl p-8 text-center text-gray-500 text-sm">
                            Nenhuma quadra configurada nesta arena até o momento.
                        </div>
                    ) : (
                        quadras.map((quadra) => (
                            <button
                                key={quadra.id}
                                onClick={() => router.push(`/arena/${arenaId}/quadra/${quadra.id}`)}
                                className="w-full bg-bg-card border border-border-card rounded-2xl flex flex-col overflow-hidden hover:border-gold/30 active:scale-[0.99] transition-all duration-200 group text-left shadow-lg"
                            >
                                {/* Banner de capa caso a quadra possua foto cadastrada */}
                                {quadra.foto_url && (
                                    <div className="w-full h-32 relative overflow-hidden border-b border-border-card bg-neutral-950">
                                        <img
                                            src={quadra.foto_url}
                                            alt={quadra.nome}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent" />
                                    </div>
                                )}

                                <div className="p-5 flex items-center justify-between w-full">
                                    <div>
                                        <h3 className="font-black text-base text-white group-hover:text-gold transition-colors tracking-wide">
                                            {quadra.nome}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 font-medium">
                                            Status: Totem de Gravação Ativo
                                        </p>
                                    </div>
                                    <span className="text-lg text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-200">
                                        ➔
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* FOOTER PREMIUM */}
                <p className="text-[9px] text-gray-600 mt-16 tracking-widest uppercase font-medium">
                    Powered by <span className="font-bold text-gray-400 tracking-normal">FOX <span className="text-gold">REPLAY</span></span>
                </p>
            </div>
        </div>
    );
}