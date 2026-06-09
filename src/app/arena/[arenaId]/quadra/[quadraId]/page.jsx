'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';

export default function ListaVideosQuadra() {
    const params = useParams();
    const { arenaId, quadraId } = params;
    const router = useRouter();

    const [replays, setReplays] = useState([]);
    const [nomes, setNomes] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarVideos() {
            try {
                const { data: dadosQuadra, error: errQ } = await supabase
                    .from('quadras')
                    .select('nome, foto_url, arenas(nome)')
                    .eq('id', quadraId)
                    .single();

                if (errQ) throw errQ;
                setNomes({
                    quadra: dadosQuadra.nome,
                    arena: dadosQuadra.arenas?.nome,
                    fotoUrl: dadosQuadra.foto_url
                });

                // 🚀 CARREGAMENTO INTELIGENTE: Puxa estritamente os clipes gerados a partir de hoje às 00:00h
                const hojeInicial = new Date();
                hojeInicial.setHours(0, 0, 0, 0);
                const dataIsoHoje = hojeInicial.toISOString();

                const { data: dadosReplays, error: errR } = await supabase
                    .from('replays')
                    .select('*')
                    .eq('quadra_id', quadraId)
                    .gte('criado_em', dataIsoHoje)
                    .order('criado_em', { ascending: false })
                    .limit(30);

                if (errR) throw errR;
                setReplays(dadosReplays || []);

            } catch (error) {
                console.error('Erro ao buscar lances:', error);
            } finally {
                setCarregando(false);
            }
        }

        if (quadraId) carregarVideos();
    }, [quadraId]);

    const baixarDireto = async (e, videoUrl, id) => {
        e.stopPropagation();
        try {
            const resposta = await fetch(videoUrl);
            const blob = await resposta.blob();
            const urlBlob = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = `fox-replay-${id.substring(0, 8)}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);
        } catch (err) {
            alert('Erro ao baixar o vídeo. Tente novamente.');
        }
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-zinc-500 font-bold tracking-widest text-xs uppercase">Buscando lances de hoje...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 pb-12 flex flex-col items-center relative overflow-hidden">

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[130px] pointer-events-none" />

            {/* HEADER STANDARDIZADO */}
            <header className="w-full max-w-[440px] flex justify-between items-center py-4 border-b border-zinc-200 mb-8 shrink-0 relative z-20">
                <button
                    onClick={() => router.push(`/arena/${arenaId}`)}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95"
                >
                    ← Quadras
                </button>
                <div className="flex items-center gap-2 select-none">
                    <img src="/logo-fox.jpeg" alt="Logo" className="h-6 w-6 object-cover rounded-md border border-zinc-200" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </h2>
                </div>
                <div className="w-[65px] h-[30px] opacity-0 pointer-events-none" />
            </header>

            {/* CONTEÚDO DA LISTAGEM */}
            <div className="w-full max-w-[440px] relative z-10">

                <div className="text-center mb-6 space-y-2.5">
                    {nomes?.fotoUrl && (
                        <div className="w-full h-32 bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 relative mb-4 shadow-sm">
                            <img src={nomes.fotoUrl} alt={nomes.quadra} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent" />
                        </div>
                    )}

                    <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
                        {nomes?.quadra}
                    </span>
                    <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">{nomes?.arena}</h1>
                    <p className="text-zinc-400 text-xs font-semibold">Toque no card para reproduzir ou clique no botão para salvar</p>
                </div>

                {/* HISTÓRICO DE REPLAYS EM BENTO GRID */}
                <div className="space-y-4">
                    {replays.length === 0 ? (
                        <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-10 text-center text-zinc-400 text-sm font-medium">
                            Nenhum lance salvo nesta quadras nas últimas horas. 🔘
                        </div>
                    ) : (
                        replays.map((replay) => {
                            const horario = replay.criated_em ? replay.criado_em.split('T')[1]?.substring(0, 5) : 'Recente';

                            return (
                                <div
                                    key={replay.id}
                                    onClick={() => router.push(`/jogada?id=${replay.id}`)}
                                    className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col gap-3.5 hover:border-amber-500/30 cursor-pointer active:scale-[0.99] transition-all duration-200 group shadow-md shadow-zinc-200/40"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-800 tracking-wide group-hover:text-amber-600 transition-colors uppercase">
                                            🎬 Lance das {horario}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                                            Assistir
                                        </span>
                                    </div>

                                    <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 relative shadow-inner">
                                        <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                        <div className="absolute inset-0 bg-zinc-950/20 flex items-center justify-center transition-all group-hover:bg-zinc-950/10">
                                            <div className="w-11 h-11 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full flex items-center justify-center font-bold pl-1 shadow-lg transform group-hover:scale-105 transition-all">
                                                ▶
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => baixarDireto(e, replay.video_url, replay.id)}
                                        className="w-full py-3 bg-zinc-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-500 border border-zinc-200 hover:border-transparent text-zinc-700 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
                                    >
                                        Baixar na Galeria 📥
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <p className="text-[9px] text-zinc-400 mt-12 text-center tracking-widest uppercase font-bold">
                    Powered by <span className="font-black text-zinc-600 tracking-normal">FOX <span className="text-amber-500">REPLAY</span></span>
                </p>
            </div>
        </div>
    );
}