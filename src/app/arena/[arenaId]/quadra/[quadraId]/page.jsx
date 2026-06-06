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
                // 1. Busca os nomes e a foto da quadra ativa para o topo
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

                // 2. Coleta os replays associados
                const { data: dadosReplays, error: errR } = await supabase
                    .from('replays')
                    .select('*')
                    .eq('quadra_id', quadraId)
                    .order('criado_em', { ascending: false });

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
            <div className="flex items-center justify-center min-h-screen bg-bg-main">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-gold font-bold tracking-wider text-xs uppercase">Buscando os melhores lances...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main text-white font-sans p-4 pb-12 flex flex-col items-center relative overflow-hidden">
            {/* Spots de luz dourada ao fundo */}
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-glow rounded-full blur-[130px] pointer-events-none" />

            {/* 🌟 HEADER PADRONIZADO DA MARCA (Estilo Aplicativo Nativo) 🌟 */}
            <header className="w-full max-w-[440px] flex justify-between items-center py-3 border-b border-border-card/60 mb-8 shrink-0 relative z-20">
                <button
                    onClick={() => router.push(`/arena/${arenaId}`)}
                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-bg-card border border-border-card/80 px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95"
                >
                    ← Voltar
                </button>
                <h2 className="text-xs font-black tracking-widest text-white uppercase select-none">
                    FOX <span className="text-gold">REPLAY</span>
                </h2>
                <div className="w-[62px] h-[30px] opacity-0 pointer-events-none hidden sm:block" />
            </header>

            {/* CONTEÚDO DOS VÍDEOS DA QUADRA */}
            <div className="w-full max-w-[440px] relative z-10">

                {/* CABEÇALHO COM FOTO PANORÂMICA EMBUTIDA */}
                <div className="text-center mb-8 space-y-3">
                    {nomes?.fotoUrl && (
                        <div className="w-full h-36 bg-neutral-950 rounded-2xl overflow-hidden border border-border-card relative mb-5 shadow-lg">
                            <img src={nomes.fotoUrl} alt={nomes.quadra} className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-black/30" />
                        </div>
                    )}

                    <span className="text-[10px] font-black text-gold uppercase tracking-widest bg-gold/5 px-3 py-1.5 rounded-full border border-gold/10 inline-block shadow-sm">
                        {nomes?.quadra}
                    </span>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">{nomes?.arena}</h1>
                    <p className="text-gray-400 text-xs font-medium">Toque no card para assistir ou clique abaixo para baixar</p>
                </div>

                {/* LISTAGEM DOS LANCES COLETADOS */}
                <div className="space-y-5">
                    {replays.length === 0 ? (
                        <div className="bg-bg-card border border-dashed border-border-card rounded-2xl p-10 text-center text-gray-500 text-sm">
                            Nenhum replay salvo nesta quadra recentemente. 🔘
                        </div>
                    ) : (
                        replays.map((replay) => {
                            const horario = replay.criado_em ? replay.criado_em.split('T')[1]?.substring(0, 5) : 'Recente';

                            return (
                                <div
                                    key={replay.id}
                                    onClick={() => router.push(`/jogada?id=${replay.id}`)}
                                    className="bg-bg-card border border-border-card rounded-2xl p-4 flex flex-col gap-4 hover:border-gold/20 cursor-pointer active:scale-[0.99] transition-all duration-200 group shadow-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white tracking-wide group-hover:text-gold transition-colors">
                                            🎥 Lance das {horario}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-bg-main px-2.5 py-1 rounded-lg border border-border-card/40">
                                            🔥 Assistir
                                        </span>
                                    </div>

                                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-border-card relative">
                                        <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-all">
                                            <div className="w-12 h-12 bg-gold text-black rounded-full flex items-center justify-center font-bold pl-1 shadow-xl shadow-gold-glow transform group-hover:scale-110 transition-transform duration-200">
                                                ▶
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => baixarDireto(e, replay.video_url, replay.id)}
                                        className="w-full py-3.5 bg-bg-main hover:bg-gold border border-border-card hover:border-gold text-silver hover:text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md"
                                    >
                                        Baixar na Galeria 📥
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer da Marca */}
                <p className="text-[9px] text-gray-600 mt-12 text-center tracking-widest uppercase font-medium">
                    Powered by <span className="font-bold text-gray-400 tracking-normal">FOX <span className="text-gold">REPLAY</span></span>
                </p>
            </div>
        </div>
    );
}