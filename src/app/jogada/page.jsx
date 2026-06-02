'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Componente interno que consome os parâmetros da URL e renderiza o player premium
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
                // Busca o replay fazendo JOIN relacional completo com quadras e arenas
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
                setErro('Não foi possível carregar este replay. O vídeo pode ter sido removido ou o link expirou.');
            } finally {
                setCarregando(false);
            }
        }

        buscarDadosJogada();
    }, [jogadaId]);

    // Função de download seguro via Blob (força o download na galeria do celular)
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
            alert('Erro ao processar o download. Tente novamente.');
        }
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-main">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-gold font-bold tracking-wider text-xs uppercase">Buscando seu lance fantástico...</p>
                </div>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-main p-6 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
                <span className="text-4xl mb-4 relative z-10">🦊</span>
                <h1 className="text-xl font-black text-white mb-2 relative z-10 uppercase tracking-wide">Lance Indisponível</h1>
                <p className="text-gray-500 text-sm max-w-sm relative z-10 leading-relaxed">{erro}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg-main text-white p-4 font-sans relative overflow-hidden">
            {/* Efeitos de iluminação de fundo (Glow estético e jovial) */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-gold-glow rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-gold-glow rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[400px] flex flex-col items-center relative z-10 py-6">

                {/* HEADER / IDENTIFICAÇÃO DO JOGADOR */}
                <div className="text-center mb-6 space-y-3">
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest bg-gold/5 px-3 py-1.5 rounded-full border border-gold/10 shadow-sm inline-block">
                        {dados?.nomeQuadra}
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                        {dados?.nomeArena}
                    </h1>
                    <p className="text-gray-400 text-xs font-medium">Reveja a sua jogada e salve direto na sua galeria</p>
                </div>

                {/* PLAYER SMARTPHONE-STYLE (1:1 ou 9:16 Vertical Imersivo) */}
                <div className="w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-border-card relative group hover:border-gold/30 transition-all duration-300">
                    <video
                        src={dados?.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        controlsList="nodownload"
                        playsInline
                        autoPlay
                        muted
                    />
                </div>

                {/* BOTÃO DE DOWNLOAD PREMIUM */}
                <button
                    onClick={baixarVideo}
                    className="w-full py-4 mt-6 bg-gold hover:bg-gold-dark text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-gold-glow active:scale-[0.99] transition-all duration-200"
                >
                    Baixar Replay na Galeria 📥
                </button>

                {/* BRAND FOOTER CRIPTOGRAFADO */}
                <p className="text-[9px] text-gray-600 mt-8 tracking-widest uppercase font-medium">
                    Powered by <span className="font-bold text-gray-400 tracking-normal">FOX <span className="text-gold">REPLAY</span></span>
                </p>
            </div>
        </div>
    );
}

// O Next.js exige o uso de Suspense obrigatoriamente para rotas que consomem parâmetros de URL (searchParams)
export default function PaginaJogada() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-bg-main text-white">
                <p className="animate-pulse text-gray-600 text-xs uppercase tracking-widest font-bold">Inicializando Player...</p>
            </div>
        }>
            <ConteudoJogada />
        </Suspense>
    );
}