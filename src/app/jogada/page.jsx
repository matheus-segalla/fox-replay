'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Componente interno que consome os parâmetros da URL e renderiza o player premium
function ConteudoJogada() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const jogadaId = searchParams.get('id');

    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [baixando, setBaixando] = useState(false);
    const [toastMensagem, setToastMensagem] = useState(null);
    const [salvoFavorito, setSalvoFavorito] = useState(false);
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
    const [modalPrivacidadeAberto, setModalPrivacidadeAberto] = useState(false);

    const exibirToast = (msg) => {
        setToastMensagem(msg);
        setTimeout(() => setToastMensagem(null), 3000);
    };

    // Verifica se já está nos favoritos
    useEffect(() => {
        if (!jogadaId) return;
        try {
            const salvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
            const jaSalvo = salvos.some(item => item.id === jogadaId);
            setSalvoFavorito(jaSalvo);
        } catch (e) {}
    }, [jogadaId]);

    const alternarFavorito = async () => {
        if (!dados) return;
        try {
            let salvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
            if (salvoFavorito) {
                salvos = salvos.filter(item => item.id !== jogadaId);
                setSalvoFavorito(false);
                exibirToast('Lance removido do seu perfil.');
            } else {
                salvos.unshift({
                    id: dados.id,
                    nomeArena: dados.nomeArena,
                    nomeQuadra: dados.nomeQuadra,
                    videoUrl: dados.videoUrl,
                    criadoEm: dados.criadoEm
                });
                setSalvoFavorito(true);
                exibirToast('Lance salvo no seu perfil! ⭐');

                // Se o usuário ainda não tiver conta/sessão, convida de forma sutil
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) {
                        setTimeout(() => setModalPerfilAberto(true), 600);
                    }
                } catch (e) {}
            }
            localStorage.setItem('fox_lances_salvos', JSON.stringify(salvos));
        } catch (e) {
            console.error(e);
        }
    };

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
                        id,
                        video_url,
                        criado_em,
                        quadras (
                            id,
                            nome,
                            arenas (
                                id,
                                nome,
                                cidade
                            )
                        )
                    `)
                    .eq('id', jogadaId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Replay não encontrado.');

                const arenaObj = data.quadras?.arenas;
                if (arenaObj) {
                    try {
                        localStorage.setItem('fox_ultima_arena', JSON.stringify({
                            id: arenaObj.id,
                            nome: arenaObj.nome,
                            cidade: arenaObj.cidade
                        }));
                    } catch (e) {}
                }

                setDados({
                    id: data.id,
                    videoUrl: data.video_url,
                    criadoEm: data.criado_em,
                    quadraId: data.quadras?.id,
                    nomeQuadra: data.quadras?.nome || 'Quadra Monitorada',
                    arenaId: arenaObj?.id,
                    nomeArena: arenaObj?.nome || 'Arena Parceira',
                    cidadeArena: arenaObj?.cidade || ''
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

    // Função de download seguro via Blob com fallback direto
    const baixarVideo = async () => {
        if (!dados?.videoUrl) return;
        setBaixando(true);
        exibirToast('Preparando download do vídeo... 📥');

        const nomeArquivo = `fox-replay-${jogadaId ? jogadaId.substring(0, 8) : 'lance'}.mp4`;
        try {
            const resposta = await fetch(dados.videoUrl, { mode: 'cors' });
            if (!resposta.ok) throw new Error('Falha na resposta HTTP');
            const blob = await resposta.blob();
            const urlBlob = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);
            exibirToast('Download concluído com sucesso! 🎾');
        } catch (err) {
            console.warn('Fallback para download direto devido a CORS/rede:', err);
            const link = document.createElement('a');
            link.href = dados.videoUrl;
            link.target = '_blank';
            link.download = nomeArquivo;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            exibirToast('Vídeo aberto para download! 📥');
        } finally {
            setBaixando(false);
        }
    };

    // Compartilhamento Nativo / Instagram Stories
    const compartilharNativo = async () => {
        const urlLance = window.location.href;
        const texto = `🔥 Olha que lance incrível eu fiz na ${dados?.nomeQuadra} da ${dados?.nomeArena}! Assista no Fox Replay:`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Fox Replay - Lance na ${dados?.nomeArena}`,
                    text: texto,
                    url: urlLance,
                });
                return;
            } catch (err) {}
        }

        copiarLink();
    };

    // Compartilhamento via WhatsApp
    const compartilharWhatsApp = () => {
        const urlLance = window.location.href;
        const texto = encodeURIComponent(
            `🔥 Olha esse lance na ${dados?.nomeQuadra} (${dados?.nomeArena})! 🎾⚡\n\nAssista ou baixe aqui:\n${urlLance}`
        );
        window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
    };

    // Copiar Link
    const copiarLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            exibirToast('Link copiado para a área de transferência! 📋');
        } catch (err) {
            exibirToast('Link: ' + window.location.href);
        }
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0B0C] text-white">
                <div className="text-center space-y-3">
                    <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-amber-500 font-bold tracking-wider text-xs uppercase">Buscando seu lance...</p>
                </div>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0B0C] p-6 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
                <span className="text-4xl mb-4 relative z-10">🦊</span>
                <h1 className="text-xl font-black text-white mb-2 relative z-10 uppercase tracking-wide">Lance Indisponível</h1>
                <p className="text-zinc-400 text-sm max-w-sm relative z-10 leading-relaxed mb-6">{erro}</p>
                <button
                    onClick={() => router.push('/')}
                    className="relative z-10 px-6 py-2.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                    Voltar para o Início ➔
                </button>
            </div>
        );
    }

    const dataLance = dados?.criadoEm ? new Date(dados.criadoEm) : null;
    const horarioFormatado = dataLance
        ? dataLance.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : null;

    // Retenção de 14 dias
    const dataExpiracao = dataLance ? new Date(dataLance.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
    const expiracaoFormatada = dataExpiracao
        ? dataExpiracao.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0B0C] text-white p-4 font-sans relative overflow-hidden">
            {/* Efeitos de iluminação de fundo */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* TOAST FLUTUANTE */}
            {toastMensagem && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-amber-400 border border-zinc-700 text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-fadeIn">
                    {toastMensagem}
                </div>
            )}

            <div className="w-full max-w-[420px] flex flex-col items-center relative z-10 py-4">

                {/* HEADER / IDENTIFICAÇÃO DO JOGADOR */}
                <div className="text-center mb-5 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm inline-block">
                            🎾 {dados?.nomeQuadra}
                        </span>
                        {horarioFormatado && (
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800 shadow-sm inline-block">
                                ⏱️ {horarioFormatado}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                        {dados?.nomeArena}
                    </h1>
                    <p className="text-zinc-400 text-xs font-medium">Reveja a sua jogada e salve direto na sua galeria</p>
                </div>

                {/* ======================================================== */}
                {/* CONTAINER PRINCIPAL: VÍDEO + ANÚNCIOS                     */}
                {/* ======================================================== */}
                <div className="w-full bg-zinc-950/70 rounded-3xl p-2.5 border border-zinc-800 shadow-2xl backdrop-blur-sm flex flex-col gap-2.5">

                    {/* 1. PLAYER DE VÍDEO */}
                    <div className="w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden relative group border border-zinc-900 shadow-inner">
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

                    {/* 2. ÁREA DOS PATROCINADORES DA ARENA (GRID DE 4 ITENS) */}
                    <div className="grid grid-cols-4 gap-2 w-full h-14 sm:h-16">
                        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                            <span className="text-[9px] font-black text-zinc-500 tracking-wider">PATROCÍNIO 1</span>
                        </div>
                        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                            <span className="text-[9px] font-black text-zinc-500 tracking-wider">PATROCÍNIO 2</span>
                        </div>
                        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                            <span className="text-[9px] font-black text-zinc-500 tracking-wider">PATROCÍNIO 3</span>
                        </div>
                        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                            <span className="text-[9px] font-black text-zinc-500 tracking-wider">PATROCÍNIO 4</span>
                        </div>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* BOTÕES DE AÇÃO: DOWNLOAD & COMPARTILHAMENTO               */}
                {/* ======================================================== */}
                <div className="w-full space-y-2.5 mt-5">
                    {/* Botão Principal de Download */}
                    <button
                        onClick={baixarVideo}
                        disabled={baixando}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        {baixando ? (
                            <>
                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Baixando Replay...</span>
                            </>
                        ) : (
                            <>
                                <span>Baixar Replay na Galeria</span>
                                <span>📥</span>
                            </>
                        )}
                    </button>

                    {/* Botões de Compartilhamento Social e Favorito */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={alternarFavorito}
                            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 border ${
                                salvoFavorito
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                            }`}
                        >
                            <span>{salvoFavorito ? '★ No Perfil' : '⭐ Salvar'}</span>
                        </button>

                        <button
                            onClick={compartilharWhatsApp}
                            className="py-3 px-2 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-emerald-950/20"
                        >
                            <span>WhatsApp</span>
                            <span>💬</span>
                        </button>

                        <button
                            onClick={compartilharNativo}
                            className="py-3 px-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-zinc-700 shadow-md"
                        >
                            <span>Redes</span>
                            <span>📱</span>
                        </button>
                    </div>

                    {/* Link para voltar ao feed da Arena */}
                    {dados?.arenaId && (
                        <button
                            onClick={() => router.push(`/arena/${dados.arenaId}`)}
                            className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1 pt-2"
                        >
                            <span>← Ver todos os lances de hoje na {dados.nomeArena}</span>
                        </button>
                    )}

                    {/* AVISO DE RETENÇÃO DE 14 DIAS */}
                    {expiracaoFormatada && (
                        <div className="pt-2 text-center">
                            <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-full inline-block">
                                ⏳ Disponível na nuvem até {expiracaoFormatada} (14 dias). Baixe na galeria!
                            </span>
                        </div>
                    )}
                </div>

                {/* PRIVACIDADE E BRAND FOOTER */}
                <div className="mt-6 text-center space-y-2">
                    <button
                        onClick={() => setModalPrivacidadeAberto(true)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-400 underline font-medium"
                    >
                        🛡️ Privacidade: Solicitar remoção deste vídeo
                    </button>

                    <p className="text-[9px] text-zinc-600 tracking-widest uppercase font-medium">
                        Powered by <span className="font-bold text-zinc-400 tracking-normal">FOX <span className="text-amber-500">REPLAY</span></span>
                    </p>
                </div>
            </div>

            {/* MODAL DE CONVITE SUTIL PARA CRIAR PERFIL */}
            {modalPerfilAberto && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-amber-500/30">
                            ⭐
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-black text-white uppercase tracking-wide">Lance Salvo no seu Perfil!</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Esse replay já está guardado no seu histórico local. Quer criar uma conta gratuita para não perder se trocar de celular?
                            </p>
                        </div>
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all"
                            >
                                Criar Conta / Entrar ➔
                            </button>
                            <button
                                onClick={() => setModalPerfilAberto(false)}
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                            >
                                Continuar sem login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 MODAL DE PRIVACIDADE E EXCLUSÃO DE VÍDEO (LGPD) 🌟 */}
            {modalPrivacidadeAberto && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-[380px] space-y-4 relative shadow-2xl text-left">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-sm uppercase tracking-wide text-white flex items-center gap-2">
                                <span>🛡️</span>
                                <span>Privacidade e Imagem</span>
                            </h3>
                            <button
                                onClick={() => setModalPrivacidadeAberto(false)}
                                className="text-zinc-500 hover:text-white text-xs bg-zinc-800 w-7 h-7 rounded-lg flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Em conformidade com a LGPD, se você aparece neste lance e não autoriza a divulgação de sua imagem, solicite a exclusão imediata do clipe pelo suporte da Fox Replay.
                        </p>

                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1">
                            <p><strong>Identificador do Replay:</strong></p>
                            <code className="text-amber-400 font-mono text-[10px] select-all">{jogadaId}</code>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => {
                                    const texto = encodeURIComponent(
                                        `Olá, solicito a exclusão imediata deste replay por questões de privacidade/imagem (LGPD):\n\nID do Replay: ${jogadaId}\nLink: ${window.location.href}`
                                    );
                                    window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=${texto}`, '_blank');
                                }}
                                className="w-full py-3 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                            >
                                <span>Solicitar Exclusão no WhatsApp</span>
                                <span>💬</span>
                            </button>

                            <button
                                onClick={() => setModalPrivacidadeAberto(false)}
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Suspense obrigatório para rotas Next.js que utilizam useSearchParams
export default function PaginaJogada() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#0B0B0C] text-white">
                <p className="animate-pulse text-zinc-600 text-xs uppercase tracking-widest font-bold">Inicializando Player...</p>
            </div>
        }>
            <ConteudoJogada />
        </Suspense>
    );
}
