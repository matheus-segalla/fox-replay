'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Ícones SVG Minimalistas e Esportivos
const IconUser = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconStar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconDownload = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconShare = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const IconCalendar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

const IconTrash = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconArrowRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconShield = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function PerfilPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [lances, setLances] = useState([]);
  const [toast, setToast] = useState(null);

  const exibirToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Carrega usuário autenticado e lances salvos
  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUsuario(session.user);
        }

        // Carrega lances do localStorage
        const lancesLocais = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
        setLances(lancesLocais);

        // Se o usuário estiver autenticado, tenta buscar também da tabela favoritos
        if (session?.user) {
          try {
            const { data: favoritosData } = await supabase
              .from('favoritos')
              .select(`
                replay_id,
                replays (
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
                )
              `)
              .eq('usuario_id', session.user.id);

            if (favoritosData && favoritosData.length > 0) {
              const formatados = favoritosData
                .map((f) => f.replays)
                .filter(Boolean)
                .map((r) => ({
                  id: r.id,
                  videoUrl: r.video_url,
                  criadoEm: r.criado_em,
                  nomeQuadra: r.quadras?.nome || 'Quadra',
                  nomeArena: r.quadras?.arenas?.nome || 'Arena Parceira'
                }));

              // Mescla sem duplicados
              const mapa = new Map();
              [...formatados, ...lancesLocais].forEach((item) => {
                if (item?.id && !mapa.has(item.id)) {
                  mapa.set(item.id, item);
                }
              });
              setLances(Array.from(mapa.values()));
            }
          } catch (e) {
            // Tabela favoritos opcional caso ainda não tenha sido rodada a migration
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  // Remover lance salvo
  const removerLance = async (lanceId) => {
    const atualizados = lances.filter((l) => l.id !== lanceId);
    setLances(atualizados);
    try {
      localStorage.setItem('fox_lances_salvos', JSON.stringify(atualizados));
      if (usuario) {
        await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', usuario.id)
          .eq('replay_id', lanceId);
      }
      exibirToast('Lance removido dos seus salvos.');
    } catch (e) {
      console.error(e);
    }
  };

  // Download do vídeo em alta definição
  const baixarReplay = async (lance) => {
    try {
      exibirToast('Preparando download do vídeo...');
      const resposta = await fetch(lance.videoUrl);
      const blob = await resposta.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `fox-replay-${lance.nomeArena.toLowerCase().replace(/\s+/g, '-')}-${lance.id.slice(0, 6)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      exibirToast('Download concluído!');
    } catch (e) {
      window.open(lance.videoUrl, '_blank');
    }
  };

  // Copiar link do lance
  const compartilharLance = (lanceId) => {
    const url = `${window.location.origin}/jogada?id=${lanceId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      exibirToast('Link copiado para a área de transferência!');
    } else {
      exibirToast(url);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Helper para iniciais
  const getIniciais = (nome) => {
    if (!nome) return 'AT';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  };

  const nomeExibicao =
    usuario?.user_metadata?.nome_completo ||
    (usuario?.email ? usuario.email.split('@')[0] : 'Atleta Convidado');
  const esporteExibicao = usuario?.user_metadata?.esporte_favorito || 'Beach Tennis';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between relative selection:bg-amber-500 selection:text-white">
      {/* LINHAS DE GRADE E AMBIÊNCIA */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 backdrop-blur-md bg-white/80 shadow-xs">
        <div className="w-full max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => router.push('/')}>
            <img
              src="/logo-fox.jpeg"
              alt="Logo Fox Replay"
              className="h-9 w-9 object-cover rounded-xl border border-zinc-200 shadow-xs bg-white"
            />
            <h1 className="text-lg font-black tracking-widest uppercase text-zinc-900 leading-none">
              FOX <span className="text-amber-500">REPLAY</span>
            </h1>
          </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white shadow-xs transition-colors"
          >
            Explorar Arenas
          </button>
          {usuario ? (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 shadow-xs transition-colors"
            >
              Sair
            </button>
          ) : (
            <button
              onClick={() => router.push('/entrar')}
              className="text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
            >
              Criar Conta Grátis
            </button>
          )}
        </div>
        </div>
      </header>

      {/* TOAST FLUTUANTE */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl animate-fadeIn flex items-center gap-2 border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="w-full max-w-5xl mx-auto px-5 py-8 md:py-12 z-10 flex-1 space-y-8">
        {/* CARD DO ATLETA */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-amber-400 flex items-center justify-center text-xl font-black tracking-wider border border-zinc-800 shadow-sm shrink-0">
              {getIniciais(nomeExibicao)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 uppercase">
                  {nomeExibicao}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Atleta
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {usuario?.email || 'Navegação local neste aparelho'} • {esporteExibicao}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:border-l sm:border-zinc-100 sm:pl-6 w-full sm:w-auto justify-between sm:justify-start">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                Lances Salvos
              </span>
              <span className="text-2xl font-black text-zinc-900">{lances.length}</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                Armazenamento
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <IconShield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Permanente</span>
              </span>
            </div>
          </div>
        </div>

        {/* ALERTA SE NÃO ESTIVER AUTENTICADO */}
        {!usuario && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <IconStar className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>Proteja seus lances para sempre</span>
              </h4>
              <p className="text-[11px] text-amber-800/90 font-normal">
                Você está navegando como visitante. Crie sua conta gratuita em 30 segundos para sincronizar seus vídeos na nuvem e nunca perdê-los.
              </p>
            </div>
            <button
              onClick={() => router.push('/entrar')}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0"
            >
              Criar Conta Gratuita
            </button>
          </div>
        )}

        {/* SEÇÃO DA GALERIA DE LANCES */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 uppercase tracking-tight">
                Minha Galeria de Lances
              </h3>
              <p className="text-xs text-zinc-500">
                Seus melhores momentos gravados nas quadras parceiras Fox Replay.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
              {lances.length} {lances.length === 1 ? 'vídeo' : 'vídeos'}
            </span>
          </div>

          {carregando ? (
            <div className="p-12 text-center text-xs text-zinc-400 font-medium animate-pulse">
              Carregando seus lances...
            </div>
          ) : lances.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <IconStar className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-zinc-900 uppercase">
                  Nenhum lance salvo ainda
                </h4>
                <p className="text-xs text-zinc-500 font-normal">
                  Quando jogar em uma arena com totem Fox Replay, aperte o botão na quadra e salve o replay aqui no seu perfil.
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Buscar uma Arena</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lances.map((lance) => {
                const dataObj = lance.criadoEm ? new Date(lance.criadoEm) : null;
                const dia = dataObj ? dataObj.toLocaleDateString('pt-BR') : '';
                const hora = dataObj
                  ? dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={lance.id}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* PLAYER DE VÍDEO COMPACTO */}
                    <div className="relative bg-zinc-950 aspect-video flex items-center justify-center overflow-hidden">
                      {lance.videoUrl ? (
                        <video
                          src={lance.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-zinc-500 text-xs font-medium">Replay gravado</div>
                      )}
                    </div>

                    {/* INFORMAÇÕES DO LANCE */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {lance.nomeQuadra || 'Quadra'}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Permanente
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 uppercase">
                          {lance.nomeArena || 'Complexo Esportivo'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                          <span className="flex items-center gap-1">
                            <IconCalendar className="w-3 h-3 text-zinc-400" />
                            {dia}
                          </span>
                          {hora && (
                            <span className="flex items-center gap-1">
                              <IconClock className="w-3 h-3 text-zinc-400" />
                              {hora}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* BOTÕES DE AÇÃO */}
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => baixarReplay(lance)}
                            className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1"
                            title="Baixar vídeo em HD"
                          >
                            <IconDownload className="w-3.5 h-3.5" />
                            <span>Baixar</span>
                          </button>
                          <button
                            onClick={() => compartilharLance(lance.id)}
                            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-xl transition-all"
                            title="Copiar link"
                          >
                            <IconShare className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removerLance(lance.id)}
                          className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                          title="Remover dos salvos"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-200 py-5 text-center z-10 bg-white">
        <p className="text-[11px] text-zinc-500 tracking-wider uppercase font-semibold">
          © {new Date().getFullYear()} FOX REPLAY • TECNOLOGIA DE MONITORAMENTO ESPORTIVO
        </p>
      </footer>
    </div>
  );
}
