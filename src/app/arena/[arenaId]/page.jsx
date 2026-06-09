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
                const { data: dadosArena, error: errA } = await supabase
                    .from('arenas')
                    .select('*')
                    .eq('id', arenaId)
                    .single();

                if (errA) throw errA;
                setArena(dadosArena);

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
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-zinc-500 font-bold tracking-widest text-xs uppercase">Conectando à Arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 pb-12 flex flex-col items-center relative overflow-hidden">

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />

            {/* HEADER CLEAN APP STYLE */}
            <header className="w-full max-w-[440px] flex justify-between items-center py-4 border-b border-zinc-200 mb-8 shrink-0 relative z-20">
                <button
                    onClick={() => router.push('/')}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95"
                >
                    ← Início
                </button>
                <div className="flex items-center gap-2 select-none">
                    <img src="/logo-fox.jpeg" alt="Logo" className="h-6 w-6 object-cover rounded-md border border-zinc-200" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </h2>
                </div>
                <div className="w-[65px] h-[30px] opacity-0 pointer-events-none" />
            </header>

            {/* CONTEÚDO */}
            <div className="w-full max-w-[440px] text-center relative z-10 flex-1 flex flex-col justify-center py-4">
                <div>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
                        Complexo Parceiro Oficial 🎾
                    </span>

                    <h1 className="text-3xl font-black mt-4 tracking-tight text-zinc-900 uppercase leading-none">{arena?.nome}</h1>
                    <p className="text-zinc-500 text-xs mt-2.5 max-w-sm mx-auto leading-relaxed font-medium">
                        Selecione a quadra em que você acabou de jogar para baixar os lances na sua galeria agora mesmo!
                    </p>
                </div>

                {/* BENTO CARDS DE QUADRAS */}
                <div className="mt-8 space-y-4 text-left">
                    {quadras.length === 0 ? (
                        <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm font-medium">
                            Nenhuma quadra ativa configurada no momento.
                        </div>
                    ) : (
                        quadras.map((quadra) => (
                            <button
                                key={quadra.id}
                                onClick={() => router.push(`/arena/${arenaId}/quadra/${quadra.id}`)}
                                className="w-full bg-white border border-zinc-200/80 rounded-2xl flex flex-col overflow-hidden hover:border-amber-500/40 active:scale-[0.99] transition-all duration-200 group text-left shadow-md shadow-zinc-200/40"
                            >
                                {quadra.foto_url && (
                                    <div className="w-full h-28 relative overflow-hidden border-b border-zinc-100 bg-zinc-100">
                                        <img
                                            src={quadra.foto_url}
                                            alt={quadra.nome}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-90"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                                    </div>
                                )}

                                <div className="p-4 flex items-center justify-between w-full bg-white">
                                    <div>
                                        <h3 className="font-bold text-base text-zinc-900 group-hover:text-amber-600 transition-colors tracking-wide uppercase">
                                            {quadra.nome}
                                        </h3>
                                        <p className="text-[11px] text-zinc-400 mt-0.5 font-semibold flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Totem de Replay Conectado
                                        </p>
                                    </div>
                                    <span className="text-sm text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all">
                                        ➔
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <p className="text-[9px] text-zinc-400 mt-16 tracking-widest uppercase font-bold">
                    Powered by <span className="font-black text-zinc-600 tracking-normal">FOX <span className="text-amber-500">REPLAY</span></span>
                </p>
            </div>
        </div>
    );
}