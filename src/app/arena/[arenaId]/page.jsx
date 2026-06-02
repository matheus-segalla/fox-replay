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

                // 2. Busca todas as quadras dessa Arena
                const { data: dadosQuadras, error: errQ } = await supabase
                    .from('quadras')
                    .select('*')
                    .eq('arena_id', arenaId)
                    .order('nome', { ascending: true });

                if (errQ) throw errQ;
                setQuadras(dadosQuadras || []);

            } catch (error) {
                console.error('Erro ao carregar portal:', error);
            } finally {
                setCarregando(false);
            }
        }

        if (arenaId) carregarPortal();
    }, [arenaId]);

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
                <p className="animate-pulse text-[#00ff66] font-bold">Abrindo portal da arena...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans p-6 pb-12 flex flex-col items-center">
            <div className="w-full max-w-[450px] text-center mt-8">

                <span className="text-[10px] font-extrabold text-[#00ff66] bg-[#00ff66]/10 px-3 py-1 rounded-full border border-[#00ff66]/20 uppercase tracking-widest">
                    Portal de Replays 🦊
                </span>

                <h1 className="text-3xl font-black mt-4 tracking-tight">{arena?.nome}</h1>
                <p className="text-gray-400 text-xs mt-2">Selecione abaixo a quadra em que você jogou para encontrar seus lances de hoje.</p>

                {/* LISTA DE QUADRAS */}
                <div className="mt-10 space-y-4">
                    {quadras.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6">Nenhuma quadra configurada nesta arena.</p>
                    ) : (
                        quadras.map((quadra) => (
                            <button
                                key={quadra.id}
                                onClick={() => router.push(`/arena/${arenaId}/quadra/${quadra.id}`)}
                                className="w-full p-5 bg-[#141414] border border-gray-800 rounded-2xl flex items-center justify-between hover:border-[#00ff66]/40 active:scale-[0.99] transition-all group text-left"
                            >
                                <div>
                                    <h3 className="font-bold text-base text-white group-hover:text-[#00ff66] transition-colors">{quadra.nome}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Status: Envio Automático Ativo</p>
                                </div>
                                <span className="text-xl text-gray-600 group-hover:text-[#00ff66] transition-colors">➔</span>
                            </button>
                        ))
                    )}
                </div>

                <p className="text-[9px] text-gray-600 mt-16 tracking-widest uppercase">
                    Powered by <span className="font-bold text-gray-500">FOX REPLAY</span>
                </p>
            </div>
        </div>
    );
}