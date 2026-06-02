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
                // 1. Busca os dados da Arena administrada
                const { data: dadosArena, error: errA } = await supabase
                    .from('arenas')
                    .select('*')
                    .eq('id', arenaId)
                    .single();

                if (errA) throw errA;
                setArena(dadosArena);

                // 2. Busca todas as quadras monitoradas dessa Arena
                const { data: dadosQuadras, error: errQ } = await supabase
                    .from('quadras')
                    .select('*')
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
        <div className="min-h-screen bg-bg-main text-white font-sans p-6 pb-12 flex flex-col items-center relative overflow-hidden">
            {/* Iluminação difusa ao fundo estilo Tech */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-glow rounded-full blur-[140px] pointer-events-none" />

            <div className="w-full max-w-[440px] text-center mt-8 relative z-10">

                {/* BADGE DA MARCA */}
                <span className="text-[10px] font-black text-gold uppercase tracking-widest bg-gold/5 px-3 py-1.5 rounded-full border border-gold/10 inline-block shadow-sm">
                    Portal de Replays 🦊
                </span>

                {/* NOME DA ARENA */}
                <h1 className="text-3xl font-black mt-4 tracking-tight text-white uppercase">{arena?.nome}</h1>
                <p className="text-gray-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                    Selecione abaixo a quadra em que você jogou para encontrar e baixar seus lances de hoje.
                </p>

                {/* LISTA DE QUADRAS DISPONÍVEIS */}
                <div className="mt-10 space-y-4 text-left">
                    {quadras.length === 0 ? (
                        <div className="bg-bg-card border border-dashed border-border-card rounded-2xl p-8 text-center text-gray-500 text-sm">
                            Nenhuma quadra configurada nesta arena até o momento.
                        </div>
                    ) : (
                        quadras.map((quadra) => (
                            <button
                                key={quadra.id}
                                onClick={() => router.push(`/arena/${arenaId}/quadra/${quadra.id}`)}
                                className="w-full p-5 bg-bg-card border border-border-card rounded-2xl flex items-center justify-between hover:border-gold/30 active:scale-[0.99] transition-all duration-200 group text-left shadow-lg"
                            >
                                <div>
                                    <h3 className="font-black text-base text-white group-hover:text-gold transition-colors tracking-wide">
                                        {quadra.nome}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        Status: Envio Automático Ativo
                                    </p>
                                </div>
                                <span className="text-lg text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-200">
                                    ➔
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* FOOTER COPIADO DE SUCESSO */}
                <p className="text-[9px] text-gray-600 mt-16 tracking-widest uppercase font-medium">
                    Powered by <span className="font-bold text-gray-400 tracking-normal">FOX <span className="text-gold">REPLAY</span></span>
                </p>
            </div>
        </div>
    );
}