'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { montarUrlWhatsAppSuporte } from '../../lib/auth';
import { comporEBaixarVideoComPatrocinadores } from '../../lib/videoWatermark';

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

function IconDownload({ className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
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

function IconShare({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
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

                    {/* PLAYER 16:9 PROPORCIONAL E RÁPIDO (COM POSTER INSTANTÂNEO) */}
                    <div className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden relative border border-zinc-200/80 shadow-inner">
                        <video
                            id="video-lance-player"
                            src={dados?.videoUrl}
                            poster={dados?.thumbnailUrl || undefined}
                            preload="metadata"
                            className="w-full h-full object-contain"
                            controls
                            controlsList="nodownload"
                            playsInline
                            webkit-playsinline="true"
                        />
                    </div>

                    {/* BARRA COMPACTA DOS 4 PATROCINADORES OFICIAIS */}
                    <div className="pt-0.5">
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                                Patrocinadores da Arena
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 w-full h-14 sm:h-16">
                            {Array.from({ length: 4 }).map((_, idx) => {
                                const pat = dados?.patrocinadores?.[idx];
                                const temPat = pat && pat.ativo && (pat.logo_url || pat.nome);
                                return (
                                    <div
                                        key={idx}
                                        className="bg-zinc-50 hover:bg-zinc-100 transition-colors rounded-xl border border-zinc-200/80 flex flex-col items-center justify-center p-1.5 overflow-hidden text-center"
                                        title={temPat ? (pat.nome || `Patrocinador ${idx + 1}`) : 'Espaço disponível para patrocínio'}
                                    >
                                        {temPat ? (
                                            pat.logo_url ? (
                                                <Image
                                                    src={pat.logo_url}
                                                    alt={pat.nome || 'Patrocinador'}
                                                    width={90}
                                                    height={56}
                                                    unoptimized
                                                    className="max-h-full max-w-full w-auto h-auto object-contain"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-black text-zinc-800 uppercase truncate px-1">
                                                    {pat.nome}
                                                </span>
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center justify-center leading-tight select-none">
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                                    Anuncie
                                                </span>
                                                <span className="text-[10px] font-black text-amber-600">
                                                    Aqui
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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

            {/* MODAL DE CONVITE PARA SALVAR NO PERFIL (TEMA CLARO CLEAN) */}
            {modalPerfilAberto && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-sm w-full max-h-[85dvh] overflow-y-auto overscroll-contain space-y-4 shadow-2xl relative text-center">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                            <IconStar filled className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Lance Salvo no seu Perfil</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                As jogadas da quadra expiram em 5 dias. Salve com seu perfil gratuito para manter este vídeo permanente na sua galeria.
                            </p>
                        </div>
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => router.push(`/entrar?redirect=/jogada?id=${jogadaId}`)}
                                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm active:scale-95 transition-all min-h-[44px] cursor-pointer"
                            >
                                Salvar Permanente na Minha Conta
                            </button>
                            <button
                                onClick={() => setModalPerfilAberto(false)}
                                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-semibold text-xs rounded-xl transition-all min-h-[42px] cursor-pointer"
                            >
                                Manter salvo apenas neste celular
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE PRIVACIDADE E EXCLUSÃO DE VÍDEO (LGPD - TEMA CLARO CLEAN) */}
            {modalPrivacidadeAberto && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-[380px] max-h-[85dvh] overflow-y-auto overscroll-contain space-y-4 relative shadow-2xl text-left">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-sm uppercase tracking-wide text-zinc-900 flex items-center gap-2">
                                <IconShield className="w-4 h-4 text-zinc-600" />
                                <span>Privacidade e Imagem</span>
                            </h3>
                            <button
                                onClick={() => setModalPrivacidadeAberto(false)}
                                aria-label="Fechar modal de privacidade"
                                className="text-zinc-500 hover:text-zinc-900 text-sm bg-zinc-100 hover:bg-zinc-200 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            Em conformidade com a LGPD, se você aparece neste lance e não autoriza a divulgação de sua imagem, solicite a exclusão imediata do clipe pelo suporte da Fox Replay.
                        </p>

                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 space-y-1">
                            <p className="font-semibold">Identificador do Replay:</p>
                            <code className="text-amber-700 font-mono text-[10px] select-all break-all">{jogadaId}</code>
                        </div>

                        <div className="space-y-2 pt-1">
                            <button
                                onClick={() => {
                                    const texto =
                                        `Olá, solicito a exclusão imediata deste replay por questões de privacidade/imagem (LGPD):\n\nID do Replay: ${jogadaId}\nLink: ${window.location.href}`;
                                    window.open(montarUrlWhatsAppSuporte(texto), '_blank', 'noopener,noreferrer');
                                }}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
                            >
                                <IconMessage className="w-3.5 h-3.5" />
                                <span>Solicitar Exclusão no WhatsApp</span>
                            </button>

                            <button
                                onClick={() => setModalPrivacidadeAberto(false)}
                                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all min-h-[42px] cursor-pointer"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE RENDERIZAÇÃO DO VÍDEO COM PATROCINADORES (TEMA CLARO CLEAN) */}
            {modalDownloadAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-sm w-full max-h-[85dvh] overflow-y-auto overscroll-contain text-center space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                            <IconDownload className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-zinc-900 uppercase tracking-wide">
                                Gerando seu Replay
                            </h3>
                            <p className="text-zinc-500 text-xs mt-1 font-medium">
                                {statusDownload || 'Aplicando marcas e patrocinadores no vídeo...'}
                            </p>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="space-y-1.5">
                            <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-200">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressoDownload}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                <span>Exportando vídeo 9:16 com áudio</span>
                                <span className="text-amber-600 font-bold">{progressoDownload}%</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 pt-1">
                                Mantenha esta aba aberta até o final para agilizar a exportação.
                            </p>
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
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 text-zinc-900">
                <p className="animate-pulse text-zinc-400 text-xs uppercase tracking-widest font-bold">Inicializando Player...</p>
            </div>
        }>
            <ConteudoJogada />
        </Suspense>
    );
}
