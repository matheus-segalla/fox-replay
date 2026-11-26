'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { comporEBaixarVideoComPatrocinadores } from '../../lib/videoWatermark';
import { IconDownload, IconShare } from '@/components/icons';
import JogadaModals from './components/JogadaModals';

// Ícones SVG minimalistas padronizados com a página da Arena
function IconArrowLeft({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function IconClock({ className = "w-3 h-3" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function IconStar({ filled = false, className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

function IconMessage({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    );
}

function IconShield({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
    );
}

// Componente interno que consome os parâmetros da URL e renderiza o player otimizado
function ConteudoJogada() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const jogadaId = searchParams.get('id');
    const querBaixar = searchParams.get('baixar') === '1';

    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [baixando, setBaixando] = useState(false);
    const [progressoDownload, setProgressoDownload] = useState(0);
    const [statusDownload, setStatusDownload] = useState('');
    const [modalDownloadAberto, setModalDownloadAberto] = useState(false);
    const [toastMensagem, setToastMensagem] = useState(null);
    const [salvoFavorito, setSalvoFavorito] = useState(false);
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
    const [modalPrivacidadeAberto, setModalPrivacidadeAberto] = useState(false);
    const [parPatrocinadorAtivo, setParPatrocinadorAtivo] = useState(0);

    // Fallback de rotação automática a cada 4s enquanto o vídeo ainda não está tocando
    useEffect(() => {
        const timer = setInterval(() => {
            const vid = document.getElementById('video-lance-player');
            if (!vid || vid.paused) {
                setParPatrocinadorAtivo((prev) => (prev === 0 ? 1 : 0));
            }
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const exibirToast = (msg) => {
        setToastMensagem(msg);
        setTimeout(() => setToastMensagem(null), 3000);
    };

    // Verifica se já está nos favoritos
    useEffect(() => {
        if (!jogadaId) return;
        const timer = setTimeout(() => {
            try {
                const salvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
                const jaSalvo = salvos.some(item => item.id === jogadaId);
                setSalvoFavorito(jaSalvo);
            } catch (e) {}
        }, 0);
        return () => clearTimeout(timer);
    }, [jogadaId]);

    const alternarFavorito = async () => {
        if (!dados) return;
        try {
            let salvos = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
            const { data: { session } } = await supabase.auth.getSession();

            if (salvoFavorito) {
                salvos = salvos.filter(item => item.id !== jogadaId);
                setSalvoFavorito(false);
                if (session?.user) {
                    try {
                        await supabase
                            .from('favoritos')
                            .delete()
                            .eq('usuario_id', session.user.id)
                            .eq('replay_id', jogadaId);
                    } catch (e) {}
                }
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

                if (session?.user) {
                    try {
                        await supabase
                            .from('favoritos')
                            .upsert(
                                { usuario_id: session.user.id, replay_id: dados.id },
                                { onConflict: 'usuario_id,replay_id' }
                            );
                    } catch (e) {}
                    exibirToast('Lance salvo permanente no seu perfil!');
                } else {
                    exibirToast('Lance salvo no seu perfil!');
                    setTimeout(() => setModalPerfilAberto(true), 600);
                }
            }
            localStorage.setItem('fox_lances_salvos', JSON.stringify(salvos));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        let cancelado = false;
        async function buscarDadosJogada() {
            if (!jogadaId) {
                if (!cancelado) {
                    setErro('Nenhuma jogada foi identificada neste link.');
                    setCarregando(false);
                }
                return;
            }

            try {
                const montarQuery = (incluirThumbnail) => {
                    const camposBase = incluirThumbnail
                        ? 'id, video_url, thumbnail_url, criado_em'
                        : 'id, video_url, criado_em';
                    return supabase
                        .from('replays')
                        .select(`
                            ${camposBase},
                            quadras (
                                id,
                                nome,
                                arenas (
                                    id,
                                    nome,
                                    cidade,
                                    logo_url,
                                    patrocinadores
                                )
                            )
                        `)
                        .eq('id', jogadaId)
                        .single();
                };

                let { data, error } = await montarQuery(true);

                if (error && (error.code === '42703' || String(error.message || '').includes('thumbnail_url'))) {
                    const fallback = await montarQuery(false);
                    data = fallback.data;
                    error = fallback.error;
                }

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

                // Recupera patrocinadores do banco ou fallback de cache
                let listaPatrocinadores = [];
                if (arenaObj?.patrocinadores && Array.isArray(arenaObj.patrocinadores) && arenaObj.patrocinadores.length > 0) {
                    listaPatrocinadores = arenaObj.patrocinadores;
                } else if (arenaObj?.id) {
                    try {
                        const local = localStorage.getItem('fox_patrocinadores_' + arenaObj.id);
                        if (local) listaPatrocinadores = JSON.parse(local);
                    } catch (e) {}
                }

                const logoArenaSalva = arenaObj?.logo_url || (arenaObj?.id ? localStorage.getItem('fox_logo_' + arenaObj.id) : null);

                // Registra visualização do replay apenas 1x por sessão
                try {
                    const chaveView = `fox_view_${data.id}`;
                    if (!sessionStorage.getItem(chaveView)) {
                        sessionStorage.setItem(chaveView, '1');
                        supabase.rpc('incrementar_visualizacao', { replay_id: data.id }).then(() => {}).catch(() => {});
                    }
                } catch {}

                if (!cancelado) {
                    setDados({
                        id: data.id,
                        videoUrl: data.video_url,
                        thumbnailUrl: data.thumbnail_url || null,
                        criadoEm: data.criado_em,
                        quadraId: data.quadras?.id,
                        nomeQuadra: data.quadras?.nome || 'Quadra Monitorada',
                        arenaId: arenaObj?.id,
                        nomeArena: arenaObj?.nome || 'Arena Parceira',
                        cidadeArena: arenaObj?.cidade || '',
                        logoArena: logoArenaSalva,
                        patrocinadores: listaPatrocinadores
                    });
                }

            } catch (err) {
                console.error(err);
                if (!cancelado) {
                    setErro('Não foi possível carregar este replay. O vídeo pode ter sido removido ou o link expirou.');
                }
            } finally {
                if (!cancelado) {
                    setCarregando(false);
                }
            }
        }

        buscarDadosJogada();
        return () => {
            cancelado = true;
        };
    }, [jogadaId]);

    // Fecha modais ao pressionar Escape
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setModalPerfilAberto(false);
                setModalPrivacidadeAberto(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Função de download seguro com queima de patrocinadores 9:16 e fallback direto
    const baixarVideo = async () => {
        if (!dados?.videoUrl) return;
        setBaixando(true);
        setProgressoDownload(0);
        setStatusDownload('Preparando renderização do vídeo...');
        setModalDownloadAberto(true);

        const arenaSanitizada = (dados.nomeArena || 'arena').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const nomeArquivo = `fox-replay-${arenaSanitizada}-${jogadaId ? jogadaId.substring(0, 8) : 'lance'}.mp4`;

        try {
            await comporEBaixarVideoComPatrocinadores({
                videoUrl: dados.videoUrl,
                nomeArena: dados.nomeArena,
                arenaLogoUrl: dados.logoArena,
                foxLogoUrl: '/logo-fox.jpeg',
                patrocinadores: dados.patrocinadores,
                nomeArquivo,
                onProgresso: (pct) => setProgressoDownload(pct),
                onStatus: (st) => setStatusDownload(st)
            });

            exibirToast('Download concluído com sucesso!');
            setTimeout(() => setModalDownloadAberto(false), 800);

            try {
                supabase.rpc('incrementar_download', { replay_id: dados.id }).then(() => {}).catch(() => {});
            } catch (e) {}

        } catch (err) {
            console.warn('Fallback para download direto devido a restrições de mídia/canvas:', err);
            setStatusDownload('Baixando vídeo original direto...');
            setProgressoDownload(90);

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
            } catch (errDireto) {
                const link = document.createElement('a');
                link.href = dados.videoUrl;
                link.target = '_blank';
                link.download = nomeArquivo;
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            exibirToast('Vídeo aberto para download!');
            try {
                supabase.rpc('incrementar_download', { replay_id: dados.id }).then(() => {}).catch(() => {});
            } catch {}
            setTimeout(() => setModalDownloadAberto(false), 600);
        } finally {
            setBaixando(false);
        }
    };

    const compartilharNativo = async () => {
        const urlLance = window.location.href;
        const texto = `Olha que lance incrível na ${dados?.nomeQuadra} da ${dados?.nomeArena}! Assista no Fox Replay:`;

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

    const compartilharWhatsApp = () => {
        const urlLance = window.location.href;
        const texto = encodeURIComponent(
            `Olha esse lance na ${dados?.nomeQuadra} (${dados?.nomeArena})!\n\nAssista ou baixe aqui:\n${urlLance}`
        );
        window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
    };

    const copiarLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            exibirToast('Link copiado para a área de transferência!');
        } catch (err) {
            exibirToast('Link: ' + window.location.href);
        }
    };

    const voltarParaArena = () => {
        if (dados?.arenaId) {
            router.push(`/arena/${dados.arenaId}`);
        } else {
            router.push('/');
        }
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 text-zinc-900">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-zinc-500 font-bold tracking-widest text-xs uppercase">
                        Buscando seu lance...
                    </p>
                </div>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-amber-400 flex items-center justify-center font-black text-xl shadow-sm">
                    FR
                </div>
                <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wide">Lance Indisponível</h1>
                <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">{erro}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
                >
                    Voltar para o Início
                </button>
            </div>
        );
    }

    const dataLance = dados?.criadoEm ? new Date(dados.criadoEm) : null;
    const horarioFormatado = dataLance
        ? dataLance.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : null;

    const dataExpiracao = dataLance ? new Date(dataLance.getTime() + 5 * 24 * 60 * 60 * 1000) : null;
    const expiracaoFormatada = dataExpiracao
        ? dataExpiracao.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="min-h-dvh bg-zinc-50 text-zinc-900 font-sans p-4 pb-14 flex flex-col items-center relative overflow-x-hidden safe-pb">
            {/* Grid de fundo sutil (sem blurs pesados para scroll 60fps fluido) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* TOAST FLUTUANTE */}
            {toastMensagem && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl border border-zinc-700 animate-fadeIn safe-pt">
                    {toastMensagem}
                </div>
            )}

            {/* HEADER CLEAN COM BOTÃO VOLTAR PADRONIZADO */}
            <header className="w-full max-w-xl flex justify-between items-center py-2.5 border-b border-zinc-200/80 mb-3.5 shrink-0 relative z-20">
                <button
                    onClick={voltarParaArena}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[36px] cursor-pointer"
                >
                    <IconArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                </button>
                <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => router.push('/')}>
                    <Image src="/logo-fox.jpeg" alt="Logo Fox Replay" width={22} height={22} priority className="h-5.5 w-5.5 object-cover rounded-md border border-zinc-200" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </h2>
                </div>
                <div className="w-[65px] h-[28px] opacity-0 pointer-events-none" />
            </header>

            <main className="w-full max-w-xl relative z-10 space-y-3.5">

                {/* CARD PRINCIPAL CLEAN DO REPLAY */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">

                    {/* Cabeçalho Compacto do Lance: Arena, Quadra e Horário */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {dados?.logoArena ? (
                                <Image
                                    src={dados.logoArena}
                                    alt={dados.nomeArena || 'Arena'}
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="w-9 h-9 rounded-xl object-cover border border-zinc-200 shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                                    FR
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight uppercase truncate">
                                    {dados?.nomeArena}
                                </h1>
                                <p className="text-[11px] font-semibold text-zinc-500 truncate">
                                    {dados?.nomeQuadra}{dados?.cidadeArena ? ` • ${dados.cidadeArena}` : ''}
                                </p>
                            </div>
                        </div>

                        {horarioFormatado && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200/80 shrink-0">
                                <IconClock className="w-3 h-3 text-zinc-400" />
                                <span>{horarioFormatado}</span>
                            </span>
                        )}
                    </div>

                    {/* PRÉ-VISUALIZAÇÃO 9:16 EXATA COM SAFE ZONES DO INSTAGRAM STORIES */}
                    <div className="max-w-[330px] sm:max-w-[360px] mx-auto w-full aspect-[9/16] bg-[#070709] rounded-2xl overflow-hidden border border-zinc-800 shadow-lg flex flex-col">
                        {/* Safe Zone Superior Instagram (0..136px) */}
                        <div className="h-[10.6%] shrink-0 bg-[#070709]" />

                        {/* 1. Faixa de Logos (136..272px — abaixo do cabeçalho do Stories) */}
                        <div className="h-[10.6%] shrink-0 px-3 flex items-center justify-between bg-[#070709]">
                            <Image
                                src="/logo-fox.jpeg"
                                alt="Fox Replay"
                                width={64}
                                height={64}
                                className="h-[90%] w-auto aspect-square rounded-xl object-cover border border-amber-500/75"
                            />

                            <div className="h-[90%] flex items-center justify-end">
                                {dados?.logoArena ? (
                                    <Image
                                        src={dados.logoArena}
                                        alt={dados.nomeArena || 'Arena'}
                                        width={136}
                                        height={64}
                                        unoptimized
                                        className="h-full w-auto max-w-[136px] object-contain rounded-xl bg-white/5 p-1 border border-white/15"
                                    />
                                ) : (
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider bg-white/5 px-3 py-2 rounded-xl border border-white/15 inline-block max-w-[150px] truncate">
                                        {dados?.nomeArena || 'Arena'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 2. Área do Jogo (~30% zoom = 4:3, 540px de 1280px) */}
                        <div className="flex-1 flex items-center justify-center bg-[#070709] min-h-0">
                            <div className="w-full aspect-[4/3] bg-zinc-950 relative overflow-hidden">
                                <video
                                    id="video-lance-player"
                                    src={dados?.videoUrl}
                                    poster={dados?.thumbnailUrl || undefined}
                                    preload="metadata"
                                    onTimeUpdate={(e) => {
                                        const novoPar = Math.floor((e.currentTarget.currentTime || 0) / 4) % 2;
                                        setParPatrocinadorAtivo((prev) => (prev !== novoPar ? novoPar : prev));
                                    }}
                                    className="w-full h-full object-cover object-center"
                                    controls
                                    controlsList="nodownload"
                                    playsInline
                                    webkit-playsinline="true"
                                />
                            </div>
                        </div>

                        {/* 3. Rodapé com 2 Patrocinadores Amplos em Loop de 4s (970..1150px) */}
                        <div className="h-[14%] shrink-0 border-t-2 border-[#FF9900] bg-[#070709] px-2.5 py-2 flex items-center">
                            <div className="grid grid-cols-2 gap-2 w-full h-full">
                                {[0, 1].map((offset) => {
                                    const slotIdx = parPatrocinadorAtivo * 2 + offset;
                                    const pat = dados?.patrocinadores?.[slotIdx];
                                    const temPat = pat && pat.ativo && (pat.logo_url || pat.nome);
                                    return (
                                        <div
                                            key={`${parPatrocinadorAtivo}-${offset}`}
                                            className="bg-[#121318] rounded-xl border border-white/15 flex flex-col items-center justify-center p-1.5 overflow-hidden text-center animate-fadeIn"
                                            title={temPat ? (pat.nome || `Patrocinador ${slotIdx + 1}`) : 'Espaço disponível para patrocínio'}
                                        >
                                            {temPat ? (
                                                pat.logo_url ? (
                                                    <Image
                                                        src={pat.logo_url}
                                                        alt={pat.nome || 'Patrocinador'}
                                                        width={120}
                                                        height={56}
                                                        unoptimized
                                                        className="max-h-full max-w-full w-auto h-auto object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[11px] font-black text-white uppercase truncate px-1">
                                                        {pat.nome}
                                                    </span>
                                                )
                                            ) : (
                                                <div className="flex flex-col items-center justify-center leading-tight select-none">
                                                    <span className="text-[9px] font-black text-white uppercase tracking-wider">
                                                        ANUNCIE
                                                    </span>
                                                    <span className="text-[10px] font-black text-[#FF9900]">
                                                        Aqui!
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Safe Zone Inferior Instagram (1150..1280px) */}
                        <div className="h-[10.2%] shrink-0 bg-[#070709] flex items-center justify-center">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-600">
                                Área segura para Stories
                            </span>
                        </div>
                    </div>
                </div>

                {/* BOTÕES DE AÇÃO: DOWNLOAD & COMPARTILHAMENTO */}
                <div className="space-y-2">
                    {querBaixar && !baixando && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold text-center">
                            Toque abaixo para gerar e salvar seu replay 9:16 com áudio e marcas da arena.
                        </div>
                    )}

                    {/* Botão Principal de Download */}
                    <button
                        onClick={baixarVideo}
                        disabled={baixando}
                        className={`w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[46px] cursor-pointer ${
                            querBaixar && !baixando ? 'ring-2 ring-amber-400' : ''
                        }`}
                    >
                        {baixando ? (
                            <>
                                <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                <span>Gerando Replay...</span>
                            </>
                        ) : (
                            <>
                                <IconDownload className="w-4 h-4 text-amber-400" />
                                <span>Baixar Replay na Galeria</span>
                            </>
                        )}
                    </button>

                    {/* Botões Secundários: Favorito, WhatsApp e Compartilhar */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={alternarFavorito}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 border min-h-[42px] cursor-pointer ${
                                salvoFavorito
                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                        >
                            <IconStar filled={salvoFavorito} className={`w-3.5 h-3.5 ${salvoFavorito ? 'text-amber-500' : 'text-zinc-400'}`} />
                            <span>{salvoFavorito ? 'Salvo' : 'Salvar'}</span>
                        </button>

                        <button
                            onClick={compartilharWhatsApp}
                            className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs min-h-[42px] cursor-pointer"
                        >
                            <IconMessage className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                        </button>

                        <button
                            onClick={compartilharNativo}
                            className="py-2.5 px-2 bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-zinc-200 min-h-[42px] cursor-pointer"
                        >
                            <IconShare className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Compartilhar</span>
                        </button>
                    </div>
                </div>

                {/* RETENÇÃO & PRIVACIDADE */}
                <div className="pt-2 text-center space-y-1.5">
                    {expiracaoFormatada && (
                        <p className="text-[10px] text-zinc-400 font-medium">
                            Disponível na nuvem até {expiracaoFormatada} (5 dias).
                        </p>
                    )}

                    <button
                        onClick={() => setModalPrivacidadeAberto(true)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 underline font-medium py-1.5 px-3 inline-flex items-center gap-1 cursor-pointer"
                    >
                        <IconShield className="w-3 h-3" />
                        <span>Privacidade: Solicitar remoção deste vídeo</span>
                    </button>

                    <p className="text-[9px] text-zinc-400 tracking-widest uppercase font-bold pt-2">
                        Powered by <span className="font-black text-zinc-600 tracking-normal">FOX <span className="text-amber-500">REPLAY</span></span>
                    </p>
                </div>
            </main>

            {/* MODAIS DA PÁGINA DE JOGADA */}
            <JogadaModals
                jogadaId={jogadaId}
                modalPerfilAberto={modalPerfilAberto}
                setModalPerfilAberto={setModalPerfilAberto}
                onIrParaEntrar={() => router.push(`/entrar?redirect=/jogada?id=${jogadaId}`)}
                modalPrivacidadeAberto={modalPrivacidadeAberto}
                setModalPrivacidadeAberto={setModalPrivacidadeAberto}
                modalDownloadAberto={modalDownloadAberto}
                statusDownload={statusDownload}
                progressoDownload={progressoDownload}
            />
        </div>
    );
}

// Suspense obrigatório para rotas Next.js que utilizam useSearchParams
export default function PaginaJogada() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 text-zinc-900">
                <p className="animate-pulse text-zinc-400 text-xs uppercase tracking-widest font-bold">Inicializando Player...</p>
            </div>
        }>
            <ConteudoJogada />
        </Suspense>
    );
}
