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
                // 1. Busca os nomes para o cabeçalho
                const { data: dadosQuadra, error: errQ } = await supabase
                    .from('quadras')
                    .select('nome, arenas(nome)')
                    .eq('id', quadraId)
                    .single();

                if (errQ) throw errQ;
                setNomes({
                    quadra: dadosQuadra.nome,
                    arena: dadosQuadra.arenas?.nome
                });

                // 2. Busca os replays da quadra (últimos 3 dias)
                const { data: dadosReplays, error: errR } = await supabase
                    .from('replays')
                    .select('*')
                    .eq('quadra_id', quadraId)
                    .order('criado_em', { ascending: false });

                if (errR) throw errR;
                setReplays(dadosReplays || []);

            } catch (error) {
                console.error(error);
            } finally {
                setCarregando(false);
            }
        }

        if (quadraId) carregarVideos();
    }, [quadraId]);

    // Função para baixar o vídeo direto via Blob sem sair da página
    const baixarDireto = async (e, videoUrl, id) => {
        e.stopPropagation(); // Impede que o clique abra o player de tela cheia
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
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-white">
                <p className="animate-pulse text-[#00ff66]">Buscando os melhores lances...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans p-4 pb-12 flex flex-col items-center">
            <div className="w-full max-w-[450px]">

                {/* Botão Voltar */}
                <button onClick={() => router.push(`/arena/${arenaId}`)} className="text-xs text-gray-400 hover:text-white mb-6">
                    ← Voltar para as quadras
                </button>

                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <span className="text-xs font-bold text-[#00ff66] bg-[#00ff66]/10 px-3 py-1 rounded-full border border-[#00ff66]/20 uppercase">
                        {nomes?.quadra}
                    </span>
                    <h1 className="text-2xl font-black mt-3">{nomes?.arena}</h1>
                    <p className="text-gray-400 text-xs mt-1">Toque no card para assistir ou clique no botão para baixar</p>
                </div>

                {/* LISTAGEM DOS LANCES */}
                <div className="space-y-4">
                    {replays.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">Nenhum replay salvo nesta quadra recentemente.</p>
                    ) : (
                        replays.map((replay) => {
                            const horario = replay.criado_em ? replay.criado_em.split('T')[1]?.substring(0, 5) : 'Recente';

                            return (
                                <div
                                    key={replay.id}
                                    onClick={() => router.push(`/jogada?id=${replay.id}`)}
                                    className="bg-[#141414] border border-gray-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-gray-700 cursor-pointer active:scale-[0.99] transition-all"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">🎥 Lance das {horario}</span>
                                        <span className="text-[10px] text-gray-500">🔥 Assistir</span>
                                    </div>

                                    {/* Thumbnail/Mini-player estático */}
                                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-800/60 relative">
                                        <video src={replay.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="w-10 h-10 bg-[#00ff66] rounded-full flex items-center justify-center text-black font-bold pl-0.5 shadow-lg">▶</div>
                                        </div>
                                    </div>

                                    {/* Botão de Download Direto sem abrir nova tela */}
                                    <button
                                        onClick={(e) => baixarDireto(e, replay.video_url, replay.id)}
                                        className="w-full py-3 bg-gray-800 hover:bg-[#00ff66] hover:text-black text-white font-bold text-xs rounded-xl transition-all"
                                    >
                                        Baixar Direto na Galeria 📥
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}