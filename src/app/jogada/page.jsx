'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Componente interno que consome os parâmetros da URL
function ConteudoJogada() {
    const searchParams = useSearchParams();
    const jogadaId = searchParams.get('id');

    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!jogadaId) {
            setErro('Nenhuma jogada foi identificada neste link.');
            setCarregando(false);
            return;
        }

        async function buscarDadosJogada() {
            try {
                // Busca o replay fazendo JOIN com quadras e com arenas ao mesmo tempo!
                const { data, error } = await supabase
                    .from('replays')
                    .select(`
            video_url,
            quadras (
              nome,
              arenas (
                nome
              )
            )
          `)
                    .eq('id', jogadaId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Replay não encontrado.');

                setDados({
                    videoUrl: data.video_url,
                    nomeQuadra: data.quadras?.nome || 'Quadra Monitorada',
                    nomeArena: data.quadras?.arenas?.nome || 'Arena Parceira'
                });

            } catch (err) {
                console.error(err);
                setErro('Não foi possível carregar este replay. O link pode ter expirado.');
            } finally {
                setCarregando(false);
            }
        }

        buscarDadosJogada();
    }, [jogadaId]);

    // Função de download seguro via Blob (aquela que remove os 3 pontinhos do player)
    const baixarVideo = async () => {
        if (!dados?.videoUrl) return;
        try {
            const resposta = await fetch(dados.videoUrl);
            const blob = await resposta.blob();
            const urlBlob = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = `fox-replay-${jogadaId.substring(0, 8)}.mp4`;
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
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
                <p className="animate-pulse text-[#00ff66] font-medium">Buscando seu lance fantástico...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] p-6 text-center">
                <span className="text-4xl mb-4">🦊</span>
                <h1 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h1>
                <p className="text-gray-400 text-sm max-w-sm">{erro}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] text-white p-4 font-sans">
            <div className="w-full max-w-[400px] flex flex-col items-center">

                {/* IDENTIFICAÇÃO DA ARENA DINÂMICA */}
                <div className="text-center mb-6">
                    <span className="text-xs font-bold text-[#00ff66] uppercase tracking-widest bg-[#00ff66]/10 px-3 py-1 rounded-full border border-[#00ff66]/20">
                        {dados?.nomeQuadra}
                    </span>
                    <h1 className="text-2xl font-extrabold mt-3 tracking-tight">
                        {dados?.nomeArena}
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">Reveja sua jogada e salve direto na sua galeria</p>
                </div>

                {/* PLAYER DE VÍDEO COMPACTO ESTILO INSTAGRAM STORIES */}
                <div className="w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
                    <video
                        src={dados?.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        controlsList="nodownload"
                        playsInline
                    />
                </div>

                {/* BOTÃO DE DOWNLOAD ULTRA DESTACADO */}
                <button
                    onClick={baixarVideo}
                    className="w-full py-4 mt-6 bg-[#00ff66] text-black font-extrabold text-base rounded-2xl shadow-xl shadow-[#00ff66]/10 hover:brightness-110 active:scale-[0.99] transition-all"
                >
                    Baixar Replay na Galeria 📥
                </button>

                <p className="text-[10px] text-gray-600 mt-6 tracking-widest uppercase">
                    Powered by <span className="font-bold text-gray-500">FOX REPLAY</span>
                </p>
            </div>
        </div>
    );
}

// Next.js exige o uso de Suspense para componentes que usano 'useSearchParams'
export default function PaginaJogada() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
                <p className="animate-pulse text-gray-500">Preparando tela...</p>
            </div>
        }>
            <ConteudoJogada />
        </Suspense>
    );
}