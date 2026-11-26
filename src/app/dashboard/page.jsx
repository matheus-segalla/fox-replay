'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import { isSuperAdmin, validarUrlHttp, montarUrlWhatsAppSuporte } from '../../lib/auth';
import AppHeader from '@/components/AppHeader';
import ImageUploadField from '@/components/ImageUploadField';
import ReplayThumbnail from '@/components/ReplayThumbnail';
import CustomSelect from '@/components/CustomSelect';

const IconBuilding = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconSettings = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconFilm = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" />
    <path strokeLinecap="round" d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
  </svg>
);

const IconTrash = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PERIODOS_METRICAS = [
  { id: 'hoje', label: 'Hoje', dias: 0, textoRelatorio: 'Hoje' },
  { id: '7d', label: '7 dias', dias: 7, textoRelatorio: 'Últimos 7 dias' },
  { id: '30d', label: '30 dias', dias: 30, textoRelatorio: 'Últimos 30 dias' },
  { id: 'total', label: 'Total', dias: null, textoRelatorio: 'Todo o período' },
];

function ConteudoDashboardArena() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const arenaQueryId = searchParams.get('arena');

  const [ehAdmin, setEhAdmin] = useState(false);
  const [arena, setArena] = useState(null);
  const [minhasArenas, setMinhasArenas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Cadastro / Edição de quadras
  const [nomeQuadra, setNomeQuadra] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [criandoQuadra, setCriandoQuadra] = useState(false);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [quadraParaEditar, setQuadraParaEditar] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Moderação de gravações (últimos 5 dias)
  const [quadraSelecionada, setQuadraSelecionada] = useState(null);
  const [replaysQuadra, setReplaysQuadra] = useState([]);
  const [carregandoReplays, setCarregandoReplays] = useState(false);
  const [filtroDiasModeracao, setFiltroDiasModeracao] = useState('5'); // '1' (hoje) ou '5'
  const [excluindoReplayId, setExcluindoReplayId] = useState(null);

  // Logos e 4 patrocinadores
  const [logoArenaInput, setLogoArenaInput] = useState('');
  const [patrocinadoresInput, setPatrocinadoresInput] = useState([
    { id: 1, nome: '', logo_url: '', ativo: true },
    { id: 2, nome: '', logo_url: '', ativo: true },
    { id: 3, nome: '', logo_url: '', ativo: true },
    { id: 4, nome: '', logo_url: '', ativo: true },
  ]);
  const [salvandoPatrocinadores, setSalvandoPatrocinadores] = useState(false);

  // Métricas por período + ranking por quadra
  const [periodoMetricas, setPeriodoMetricas] = useState('30d');
  const [carregandoMetricas, setCarregandoMetricas] = useState(false);
  const [metricasArena, setMetricasArena] = useState({
    lances: 0,
    visualizacoes: 0,
    downloads: 0,
    porQuadra: [],
  });

  // Popup customizado
  const [notificacao, setNotificacao] = useState({
    aberto: false,
    tipo: 'alert',
    titulo: '',
    mensagem: '',
    onConfirmar: null,
  });

  const [urlBaseSistema, setUrlBaseSistema] = useState(
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.foxreplay.com.br'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setUrlBaseSistema(process.env.NEXT_PUBLIC_APP_URL || window.location.origin);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const linkPortalPublico = arena ? `${urlBaseSistema}/arena/${arena.id}` : '';

  const mostrarAviso = (titulo, mensagem) => {
    setNotificacao({ aberto: true, tipo: 'alert', titulo, mensagem, onConfirmar: null });
  };

  const mostrarConfirmacao = (titulo, mensagem, acaoConfirmada) => {
    setNotificacao({ aberto: true, tipo: 'confirm', titulo, mensagem, onConfirmar: acaoConfirmada });
  };

  const fecharNotificacao = () => {
    setNotificacao((prev) => ({ ...prev, aberto: false }));
  };

  // Escape fecha modais abertos
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (notificacao.aberto) {
        fecharNotificacao();
      } else if (modalEditarAberto) {
        setModalEditarAberto(false);
        setQuadraParaEditar(null);
      } else if (quadraSelecionada) {
        setQuadraSelecionada(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [notificacao.aberto, modalEditarAberto, quadraSelecionada]);

  // Carrega métricas por período + ranking por quadra
  const carregarMetricas = useCallback(async (arenaId, periodoId) => {
    if (!arenaId) return;
    setCarregandoMetricas(true);
    const cfg = PERIODOS_METRICAS.find((p) => p.id === periodoId) || PERIODOS_METRICAS[2];

    try {
      const { data, error } = await supabase.rpc('obter_metricas_arena_periodo', {
        p_arena_id: arenaId,
        p_dias: cfg.dias,
      });

      if (!error && data) {
        setMetricasArena({
          lances: Number(data.lances || 0),
          visualizacoes: Number(data.visualizacoes || 0),
          downloads: Number(data.downloads || 0),
          porQuadra: Array.isArray(data.por_quadra) ? data.por_quadra : [],
        });
        return;
      }

      // Fallback para RPC V2 caso V3 ainda não tenha sido executada
      const { data: fallback } = await supabase.rpc('obter_metricas_arena', {
        p_arena_id: arenaId,
      });
      if (fallback) {
        setMetricasArena({
          lances: Number(fallback.lances || 0),
          visualizacoes: Number(fallback.visualizacoes || 0),
          downloads: Number(fallback.downloads || 0),
          porQuadra: [],
        });
      }
    } catch (err) {
      console.warn('Falha ao carregar métricas:', err);
    } finally {
      setCarregandoMetricas(false);
    }
  }, []);

  const carregarDados = useCallback(
    async (arenaId, arenaPreCarregada = null) => {
      setCarregando(true);
      try {
        let dadosArena = arenaPreCarregada;
        if (!dadosArena || dadosArena.id !== arenaId) {
          const { data, error: erroArena } = await supabase
            .from('arenas')
            .select('*')
            .eq('id', arenaId)
            .single();

          if (erroArena) throw erroArena;
          dadosArena = data;
        }
        setArena(dadosArena);
        setLogoArenaInput(dadosArena.logo_url || '');

        const patsCarregados =
          Array.isArray(dadosArena.patrocinadores) && dadosArena.patrocinadores.length > 0
            ? dadosArena.patrocinadores
            : [];

        const slotsFormatados = Array.from({ length: 4 }).map((_, idx) => {
          const item = patsCarregados[idx];
          return item
            ? { ...item, id: idx + 1 }
            : { id: idx + 1, nome: '', logo_url: '', ativo: true };
        });
        setPatrocinadoresInput(slotsFormatados);

        // Quadras + status limpo dos totens via RPC (sem expor token nem RTSP)
        const [resQuadras, resStatusTotens] = await Promise.all([
          supabase
            .from('quadras')
            .select('id, nome, status, foto_url')
            .eq('arena_id', arenaId)
            .order('criado_em', { ascending: true }),
          supabase.rpc('listar_status_totens_arena', { p_arena_id: arenaId }),
        ]);

        if (resQuadras.error) throw resQuadras.error;

        const mapaStatus = new Map();
        if (!resStatusTotens.error && Array.isArray(resStatusTotens.data)) {
          resStatusTotens.data.forEach((st) => mapaStatus.set(st.quadra_id, st));
        }

        const quadrasFormatadas = (resQuadras.data || []).map((q) => {
          const st = mapaStatus.get(q.id);
          const ultimoPing = st?.ultimo_heartbeat ? new Date(st.ultimo_heartbeat).getTime() : 0;
          const onlineAgora = ultimoPing > 0 && Date.now() - ultimoPing < 3 * 60 * 1000;

          return {
            id: q.id,
            nome: q.nome,
            status: q.status,
            fotoUrl: q.foto_url,
            temTotem: Boolean(st?.tem_totem),
            onlineAgora,
            cameraOnline: st?.camera_online !== false,
          };
        });

        setQuadras(quadrasFormatadas);
        await carregarMetricas(arenaId, periodoMetricas);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setCarregando(false);
      }
    },
    [carregarMetricas, periodoMetricas]
  );

  // Auth Guard
  useEffect(() => {
    let cancelado = false;
    async function verificarSessaoSegura() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          router.replace('/entrar?motivo=gestor&redirect=/dashboard');
          return;
        }

        const superAdmin = isSuperAdmin(session.user);
        if (!cancelado) setEhAdmin(superAdmin);

        let queryArenas = supabase.from('arenas').select('*').order('nome', { ascending: true });
        if (!superAdmin) {
          queryArenas = queryArenas.eq('usuario_id', session.user.id);
        }

        const { data: arenasData } = await queryArenas;
        const arenasCarregadas = arenasData || [];

        if (arenasCarregadas.length === 0) {
          if (superAdmin) {
            router.replace('/admin');
          } else {
            router.replace('/perfil');
          }
          return;
        }

        if (cancelado) return;
        setMinhasArenas(arenasCarregadas);

        const idPreferido = arenaQueryId || localStorage.getItem('fox_arena_id');
        const arenaEncontrada =
          arenasCarregadas.find((a) => a.id === idPreferido) || arenasCarregadas[0];

        localStorage.setItem('fox_arena_id', arenaEncontrada.id);
        carregarDados(arenaEncontrada.id, arenaEncontrada);
      } catch (err) {
        console.error('Erro no Auth Guard:', err);
        router.replace('/entrar');
      }
    }

    verificarSessaoSegura();
    return () => {
      cancelado = true;
    };
  }, [router, arenaQueryId, carregarDados]);

  const handleMudarArenaAtiva = (idNovaArena) => {
    localStorage.setItem('fox_arena_id', idNovaArena);
    const selecionada = minhasArenas.find((a) => a.id === idNovaArena) || null;
    carregarDados(idNovaArena, selecionada);
  };

  const handleTrocarPeriodo = (novoPeriodo) => {
    setPeriodoMetricas(novoPeriodo);
    if (arena?.id) {
      carregarMetricas(arena.id, novoPeriodo);
    }
  };

  const handleSalvarPatrocinadores = async (e) => {
    e?.preventDefault();
    if (!arena?.id) return;

    if (!validarUrlHttp(logoArenaInput)) {
      mostrarAviso('URL Inválida', 'A logomarca da arena precisa ser uma URL válida http:// ou https://.');
      return;
    }

    const slotInvalido = patrocinadoresInput.findIndex((p) => !validarUrlHttp(p.logo_url));
    if (slotInvalido !== -1) {
      mostrarAviso('URL Inválida', `A logo do Patrocinador 0${slotInvalido + 1} precisa ser válida.`);
      return;
    }

    setSalvandoPatrocinadores(true);
    try {
      const { error: errDb } = await supabase
        .from('arenas')
        .update({
          logo_url: logoArenaInput.trim() || null,
          patrocinadores: patrocinadoresInput,
        })
        .eq('id', arena.id);

      if (errDb) throw errDb;

      mostrarAviso(
        'Marcas Atualizadas',
        'Sua logomarca e os 4 espaços de patrocinadores já estão ativos para todos os replays baixados pelos atletas.'
      );
    } catch (err) {
      console.error('Erro ao salvar patrocinadores:', err);
      mostrarAviso('Erro ao Salvar', err.message || 'Não foi possível salvar os patrocinadores.');
    } finally {
      setSalvandoPatrocinadores(false);
    }
  };

  const handleAtualizarSlotPatrocinador = (index, campo, valor) => {
    setPatrocinadoresInput((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const handleGerarRelatorioPatrocinadoresWhatsApp = () => {
    if (!arena) return;
    const cfg = PERIODOS_METRICAS.find((p) => p.id === periodoMetricas) || PERIODOS_METRICAS[2];
    const patsAtivos = patrocinadoresInput.filter((p) => p.ativo && p.nome).map((p) => p.nome);
    const listaMarcas = patsAtivos.length > 0 ? patsAtivos.join(', ') : 'Marcas Parceiras';

    const rankingTexto =
      metricasArena.porQuadra.length > 0
        ? `\n\n🏟️ *Destaques por Quadra:*\n` +
          metricasArena.porQuadra
            .slice(0, 5)
            .map((q) => `• ${q.nome}: ${q.lances} lances (${q.downloads} downloads)`)
            .join('\n')
        : '';

    const texto = encodeURIComponent(
      `📊 *Relatório de Impacto de Patrocínio - Fox Replay*\n` +
        `🏟️ *Complexo:* ${arena.nome || 'Nossa Arena'}\n` +
        `📅 *Período:* ${cfg.textoRelatorio}\n\n` +
        `🔥 *Métricas Oficiais de Audiência:*\n` +
        `• *Lances Registrados:* ${metricasArena.lances} jogadas\n` +
        `• *Visualizações Totais:* ${metricasArena.visualizacoes} reproduções\n` +
        `• *Downloads 9:16 com Marca:* ${metricasArena.downloads} compartilhamentos` +
        rankingTexto +
        `\n\n🤝 *Patrocinadores em Exibição:* ${listaMarcas}\n\n` +
        `_Dados auditados pela plataforma Fox Replay._`
    );
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank', 'noopener,noreferrer');
  };

  const handleSolicitarExpansao = () => {
    const msg =
      `Olá equipe Fox Replay! Sou gestor da arena *${arena?.nome || 'Minha Arena'}* ` +
      `(cota atual: ${arena?.limite_quadras || 2} quadras). Gostaria de solicitar expansão de quadras ou ativação de uma nova unidade.`;
    window.open(montarUrlWhatsAppSuporte(msg), '_blank', 'noopener,noreferrer');
  };

  // Moderação de gravações (últimos 5 dias ou hoje)
  const carregarReplaysDaQuadra = async (quadra, diasStr = filtroDiasModeracao) => {
    setReplaysQuadra([]);
    setQuadraSelecionada(quadra);
    setCarregandoReplays(true);

    try {
      const inicio = new Date();
      if (diasStr === '1') {
        inicio.setHours(0, 0, 0, 0);
      } else {
        inicio.setDate(inicio.getDate() - 4);
        inicio.setHours(0, 0, 0, 0);
      }

      let { data, error } = await supabase
        .from('replays')
        .select('id, quadra_id, video_url, thumbnail_url, visualizacoes, downloads, criado_em')
        .eq('quadra_id', quadra.id)
        .gte('criado_em', inicio.toISOString())
        .order('criado_em', { ascending: false })
        .limit(60);

      if (error && (error.code === '42703' || String(error.message || '').includes('thumbnail_url'))) {
        const fallback = await supabase
          .from('replays')
          .select('id, quadra_id, video_url, visualizacoes, downloads, criado_em')
          .eq('quadra_id', quadra.id)
          .gte('criado_em', inicio.toISOString())
          .order('criado_em', { ascending: false })
          .limit(60);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      setReplaysQuadra(data || []);
    } catch (err) {
      console.error('Erro ao buscar replays da quadra:', err);
    } finally {
      setCarregandoReplays(false);
    }
  };

  const handleExcluirReplay = (replay) => {
    mostrarConfirmacao(
      'Excluir Replay Permanentemente?',
      'Este vídeo será apagado da nuvem e não poderá mais ser acessado pelos atletas (ideal para solicitações de privacidade/LGPD).',
      async () => {
        setExcluindoReplayId(replay.id);
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const res = await fetch(`/api/replays/${replay.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${session?.access_token || ''}`,
            },
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.error || 'Falha ao excluir replay.');

          setReplaysQuadra((prev) => prev.filter((r) => r.id !== replay.id));
          if (arena?.id) carregarMetricas(arena.id, periodoMetricas);
          mostrarAviso('Replay Excluído', 'O vídeo foi removido permanentemente do sistema e do armazenamento.');
        } catch (err) {
          mostrarAviso('Erro na Exclusão', err.message || 'Não foi possível excluir o replay.');
        } finally {
          setExcluindoReplayId(null);
        }
      }
    );
  };

  const handleCriarQuadra = async (e) => {
    e.preventDefault();
    if (!nomeQuadra.trim() || !arena) return;

    const limiteQuadras = arena.limite_quadras || 2;
    if (!ehAdmin && quadras.length >= limiteQuadras) {
      mostrarAviso(
        'Cota de Quadras Atingida',
        `Sua arena possui cota de ${limiteQuadras} quadras no plano contratado. Solicite expansão à equipe Fox Replay.`
      );
      return;
    }

    if (!validarUrlHttp(fotoUrl)) {
      mostrarAviso('URL Inválida', 'A foto da quadra precisa ser uma URL válida.');
      return;
    }

    setCriandoQuadra(true);
    try {
      const { error: erroQuadra } = await supabase.from('quadras').insert([
        {
          arena_id: arena.id,
          nome: nomeQuadra.trim(),
          foto_url: fotoUrl.trim() || null,
        },
      ]);

      if (erroQuadra) throw erroQuadra;

      setNomeQuadra('');
      setFotoUrl('');
      mostrarAviso(
        'Quadra Cadastrada',
        'Nova quadra criada com sucesso! Nossa equipe técnica vinculará o totem físico no momento da instalação.'
      );
      carregarDados(arena.id, arena);
    } catch (error) {
      mostrarAviso('Erro no Cadastro', error.message || 'Não foi possível cadastrar a quadra.');
    } finally {
      setCriandoQuadra(false);
    }
  };

  const abrirModalEditar = (quadra) => {
    setQuadraParaEditar(quadra);
    setEditNome(quadra.nome);
    setEditFotoUrl(quadra.fotoUrl || '');
    setModalEditarAberto(true);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!editNome.trim() || !quadraParaEditar || !arena) return;

    if (!validarUrlHttp(editFotoUrl)) {
      mostrarAviso('URL Inválida', 'A foto de capa precisa ser uma URL válida.');
      return;
    }

    setSalvandoEdicao(true);
    try {
      const { error } = await supabase
        .from('quadras')
        .update({
          nome: editNome.trim(),
          foto_url: editFotoUrl.trim() || null,
        })
        .eq('id', quadraParaEditar.id);

      if (error) throw error;

      mostrarAviso('Atualizado', 'As alterações da quadra foram salvas com sucesso.');
      setModalEditarAberto(false);
      carregarDados(arena.id, arena);
    } catch (error) {
      mostrarAviso('Erro', error.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluirQuadra = (idQuadra) => {
    mostrarConfirmacao(
      'Excluir Quadra?',
      'Tem certeza que deseja excluir esta quadra? Todos os replays associados a ela serão perdidos.',
      async () => {
        try {
          const { error } = await supabase.from('quadras').delete().eq('id', idQuadra);
          if (error) throw error;

          mostrarAviso('Removida', 'A quadra foi excluída com sucesso.');
          setModalEditarAberto(false);
          carregarDados(arena.id, arena);
        } catch {
          mostrarAviso('Erro', 'Não foi possível excluir a quadra.');
        }
      }
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('fox_arena_id');
    router.push('/entrar');
  };

  const limiteQuadras = arena?.limite_quadras || 2;
  const cotaAtingida = !ehAdmin && quadras.length >= limiteQuadras;
  const arenaPausada = arena?.ativa === false;

  return (
    <>
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 font-sans relative selection:bg-amber-500 selection:text-black overflow-x-hidden print:hidden safe-pb">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-400/15 rounded-full blur-[140px] pointer-events-none" />

        {/* CABEÇALHO GLOBAL CONTEXTUAL */}
        <AppHeader
          theme="light"
          activeRoute="dashboard"
          badge="Gestor"
          showLogout={true}
          onLogout={handleLogout}
        />

        <div className="max-w-[1120px] mx-auto px-5 sm:px-6 py-8 relative z-10 space-y-7">
          {/* BARRA DE UNIDADE ATIVA & EXPANSÃO */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-zinc-200/90 px-5 py-4 rounded-2xl shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {arena?.plano_nome || 'Plano Padrão'}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Cota: {quadras.length}/{limiteQuadras} quadras
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  Unidade:
                </span>
                <CustomSelect
                  theme="light"
                  value={arena?.id || ''}
                  onChange={(val) => handleMudarArenaAtiva(val)}
                  ariaLabel="Selecionar unidade"
                  className="w-full sm:w-64"
                  buttonClassName="py-1.5 min-h-[34px] font-black"
                  options={minhasArenas.map((a) => ({
                    value: a.id,
                    label: `${a.nome}${a.cidade ? ` (${a.cidade})` : ''}${a.ativa === false ? ' — PAUSADA' : ''}`,
                  }))}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSolicitarExpansao}
              className="text-xs font-bold text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Solicitar Expansão / Nova Unidade ↗
            </button>
          </div>

          {/* ALERTA DE ARENA PAUSADA (PAUSA SUAVE) */}
          {arenaPausada && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-900">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-red-700">
                  Arena Temporariamente Pausada
                </h3>
                <p className="text-xs text-red-800/90 leading-relaxed">
                  Novos replays dos totens estão suspensos e a arena está oculta na busca pública. Lances já favoritados pelos atletas continuam disponíveis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSolicitarExpansao}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Falar com Suporte
              </button>
            </div>
          )}

          {/* BENTO 1: PLACA QR CODE E PORTAL PÚBLICO */}
          <div className="glass-card-light rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 border border-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                Merchandising Físico da Arena
              </span>
              <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                Portal de Replays Operacional
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                Imprima a placa oficial para fixar na recepção ou nas quadras. Os atletas apontam a câmera do celular e baixam os lances com a marca da sua arena e dos patrocinadores.
              </p>
              <div className="pt-1 flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer"
                >
                  Imprimir Placa QR ({arena?.nome})
                </button>
                <a
                  href={linkPortalPublico}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 px-4 py-2.5 rounded-xl transition-all font-bold tracking-wide shadow-sm"
                >
                  Abrir Feed Público ➔
                </a>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-center flex flex-col items-center shrink-0 shadow-inner">
              {linkPortalPublico ? (
                <QRCodeSVG value={linkPortalPublico} size={118} level="H" />
              ) : (
                <div className="w-[118px] h-[118px] bg-zinc-200 animate-pulse rounded-xl" />
              )}
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-3">
                QR Code da Arena
              </span>
            </div>
          </div>

          {/* BENTO 2: MÉTRICAS POR PERÍODO + RANKING DE QUADRAS + RELATÓRIO WHATSAPP */}
          <div className="glass-card-light rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                  Audiência & Retorno de Patrocínio
                </span>
                <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mt-1">
                  Desempenho da Arena
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                  {PERIODOS_METRICAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTrocarPeriodo(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        periodoMetricas === p.id
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGerarRelatorioPatrocinadoresWhatsApp}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  📱 Relatório WhatsApp
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-3 gap-4 transition-opacity ${carregandoMetricas ? 'opacity-50' : ''}`}>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                  Lances Gravados
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-900">
                  {metricasArena.lances}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                  Visualizações
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {metricasArena.visualizacoes}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                  Downloads 9:16
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {metricasArena.downloads}
                </span>
              </div>
            </div>

            {metricasArena.porQuadra.length > 0 && (
              <div className="pt-2 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider block">
                  Ranking por Quadra no Período
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {metricasArena.porQuadra.map((q, idx) => {
                    const maxLances = Math.max(1, metricasArena.porQuadra[0]?.lances || 1);
                    const pct = Math.round(((q.lances || 0) / maxLances) * 100);
                    return (
                      <div
                        key={q.quadra_id || idx}
                        className="p-3 rounded-xl bg-white border border-zinc-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 uppercase truncate">
                            {idx + 1}. {q.nome}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-zinc-600 shrink-0">
                            {q.lances} lances &bull; {q.downloads} downs
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BENTO 3: PATROCINADORES & LOGO COM UPLOAD DIRETO */}
          <div className="glass-card-light rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                  Monetização & Publicidade &bull; 4 Posições
                </span>
                <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight mt-1">
                  Patrocinadores no Vídeo e Logo da Arena
                </h2>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Envie as imagens direto do seu celular ou computador — elas são gravadas automaticamente em 100% dos downloads dos atletas.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSalvarPatrocinadores}
                disabled={salvandoPatrocinadores}
                className="self-start md:self-auto text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-3 rounded-xl transition-all uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {salvandoPatrocinadores ? 'Salvando...' : 'Salvar Marcas do Vídeo ✓'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                  <ImageUploadField
                    arenaId={arena?.id}
                    prefixo="logo-arena"
                    value={logoArenaInput}
                    onChange={setLogoArenaInput}
                    label="Logomarca Oficial da Arena (Topo Direito)"
                    hint="PNG transparente recomendado"
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-black text-zinc-800 uppercase tracking-wide block">
                    Grade dos 4 Patrocinadores (Rodapé do Vídeo)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patrocinadoresInput.map((pat, idx) => (
                      <div
                        key={pat.id || idx}
                        className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase font-mono">
                            Slot 0{idx + 1}
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-600 font-bold">
                            <input
                              type="checkbox"
                              checked={pat.ativo}
                              onChange={(e) =>
                                handleAtualizarSlotPatrocinador(idx, 'ativo', e.target.checked)
                              }
                              className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>Ativo</span>
                          </label>
                        </div>

                        <input
                          type="text"
                          value={pat.nome || ''}
                          onChange={(e) =>
                            handleAtualizarSlotPatrocinador(idx, 'nome', e.target.value)
                          }
                          placeholder={`Nome da Marca 0${idx + 1}`}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 font-medium focus:outline-none focus:border-amber-500"
                        />

                        <ImageUploadField
                          arenaId={arena?.id}
                          prefixo={`patrocinador-${idx + 1}`}
                          value={pat.logo_url || ''}
                          onChange={(url) =>
                            handleAtualizarSlotPatrocinador(idx, 'logo_url', url)
                          }
                          label=""
                          compact={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PREVIEW 9:16 */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider mb-2 font-mono">
                  Prévia do Vídeo Exportado (9:16)
                </span>

                <div className="w-[260px] bg-[#070709] border-[6px] border-zinc-800 rounded-[32px] p-2.5 shadow-2xl relative overflow-hidden flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1 border-b border-white/10 pb-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/logo-fox.jpeg"
                        alt="Fox Replay"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-cover rounded-md border border-amber-500/40"
                      />
                      <span className="text-[9px] font-black text-white uppercase leading-none">
                        FOX <span className="text-amber-500">REPLAY</span>
                      </span>
                    </div>

                    <div className="text-right">
                      {logoArenaInput && validarUrlHttp(logoArenaInput) ? (
                        <Image
                          src={logoArenaInput}
                          alt="Arena Logo"
                          width={70}
                          height={24}
                          unoptimized
                          className="h-6 w-auto max-w-[70px] object-contain rounded bg-white/5 p-0.5 border border-white/10"
                        />
                      ) : (
                        <span className="text-[8px] font-black text-white uppercase block truncate max-w-[80px]">
                          {arena?.nome || 'SUA ARENA'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full aspect-[9/12] bg-zinc-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-zinc-800">
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xs">
                      ▶
                    </div>
                    <span className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                      LANCE 30s + ÁUDIO
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 w-full h-11 pt-0.5">
                    {patrocinadoresInput.map((p, i) => {
                      const tem = p && p.ativo && (p.logo_url || p.nome);
                      return (
                        <div
                          key={i}
                          className="bg-[#14151b] border border-white/10 rounded-lg flex flex-col items-center justify-center p-1 overflow-hidden text-center"
                        >
                          {tem ? (
                            p.logo_url && validarUrlHttp(p.logo_url) ? (
                              <Image
                                src={p.logo_url}
                                alt={p.nome || 'Patrocinador'}
                                width={56}
                                height={36}
                                unoptimized
                                className="max-h-full max-w-full w-auto h-auto object-contain"
                              />
                            ) : (
                              <span className="text-[7px] font-black text-white truncate px-0.5 uppercase">
                                {p.nome}
                              </span>
                            )
                          ) : (
                            <div className="flex flex-col items-center justify-center leading-none scale-90">
                              <span className="text-[6px] font-black text-white uppercase">ANUNCIE</span>
                              <span className="text-[7px] font-black text-amber-400">Aqui!</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO 4: QUADRAS & MODERAÇÃO DE GRAVAÇÕES (SEM TOKEN / SEM RTSP) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="glass-card-light p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">
                  Adicionar Quadra
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {quadras.length}/{limiteQuadras}
                </span>
              </div>

              {cotaAtingida ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                  <p className="text-xs font-bold text-amber-800 uppercase">Cota Máxima Atingida</p>
                  <p className="text-[11px] text-amber-700 leading-normal">
                    Todas as {limiteQuadras} quadras do seu plano já foram cadastradas.
                  </p>
                  <button
                    type="button"
                    onClick={handleSolicitarExpansao}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[11px] uppercase rounded-lg transition-all cursor-pointer"
                  >
                    Contratar Mais Quadras ↗
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCriarQuadra} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                      Nome da Quadra
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeQuadra}
                      onChange={(e) => setNomeQuadra(e.target.value)}
                      placeholder="Ex: Quadra 1 (Central)"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                    />
                  </div>

                  <ImageUploadField
                    arenaId={arena?.id}
                    prefixo="quadra"
                    value={fotoUrl}
                    onChange={setFotoUrl}
                    label="Foto da Quadra (Opcional)"
                    compact={true}
                  />

                  <button
                    type="submit"
                    disabled={criandoQuadra}
                    className="w-full py-3 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {criandoQuadra ? 'Salvando...' : 'Cadastrar Quadra'}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 leading-relaxed">
                <strong className="text-zinc-700 block mb-0.5">Instalação & Suporte Técnico</strong>
                A vinculação física dos totens e câmeras é feita pela equipe Fox Replay. Precisa de manutenção?{' '}
                <button
                  type="button"
                  onClick={handleSolicitarExpansao}
                  className="text-amber-700 font-bold underline cursor-pointer"
                >
                  Chamar suporte
                </button>
                .
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between select-none">
                <h2 className="text-sm font-black text-zinc-500 uppercase tracking-wider">
                  Suas Quadras ({quadras.length})
                </h2>
                <span className="text-xs font-mono text-zinc-400">
                  Cota: {quadras.length} de {limiteQuadras}
                </span>
              </div>

              {carregando ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-zinc-200">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400 font-bold mt-3 animate-pulse">
                    Sincronizando dados da arena...
                  </p>
                </div>
              ) : quadras.length === 0 ? (
                <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 text-xs font-bold uppercase space-y-2">
                  <p>Nenhuma quadra cadastrada ainda.</p>
                  <p className="text-[11px] text-zinc-500 font-normal">
                    Cadastre o nome da sua primeira quadra no formulário ao lado.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quadras.map((quadra) => (
                    <div
                      key={quadra.id}
                      className="glass-card-light rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap shadow-xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {quadra.fotoUrl && validarUrlHttp(quadra.fotoUrl) ? (
                          <Image
                            src={quadra.fotoUrl}
                            alt={quadra.nome}
                            width={48}
                            height={48}
                            unoptimized
                            className="w-12 h-12 object-cover rounded-xl border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 text-zinc-400">
                            <IconBuilding className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-zinc-900 uppercase truncate">
                            {quadra.nome}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {quadra.temTotem ? (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    quadra.onlineAgora ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'
                                  }`}
                                />
                                <span>{quadra.onlineAgora ? 'Totem Online' : 'Totem Ativo'}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Aguardando Instalação Técnica</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => carregarReplaysDaQuadra(quadra, filtroDiasModeracao)}
                          className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-700 px-3.5 py-2 rounded-xl hover:border-amber-500/40 hover:text-amber-700 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <IconFilm className="w-3.5 h-3.5" />
                          <span>Gravações</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(quadra)}
                          aria-label={`Editar ${quadra.nome}`}
                          className="text-xs bg-white border border-zinc-200 text-zinc-500 px-3 py-2 rounded-xl hover:border-zinc-400 hover:text-zinc-800 transition-all cursor-pointer"
                        >
                          <IconSettings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL DE MODERAÇÃO DE GRAVAÇÕES (ÚLTIMOS 5 DIAS + EXCLUSÃO REAL) */}
        {quadraSelecionada && (
          <div
            className="fixed inset-0 bg-zinc-950/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setQuadraSelecionada(null)}
          >
            <div
              className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-2xl max-h-[85dvh] flex flex-col shadow-2xl overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-zinc-200 pb-4 mb-4 shrink-0">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                    Moderação de Gravações &bull;{' '}
                    <span className="text-amber-600">{quadraSelecionada.nome}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Visualize ou exclua permanentemente qualquer replay desta quadra (LGPD).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroDiasModeracao('1');
                        carregarReplaysDaQuadra(quadraSelecionada, '1');
                      }}
                      className={`px-3 py-1.5 rounded-md cursor-pointer min-h-[36px] active:scale-95 transition-all ${
                        filtroDiasModeracao === '1' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroDiasModeracao('5');
                        carregarReplaysDaQuadra(quadraSelecionada, '5');
                      }}
                      className={`px-3 py-1.5 rounded-md cursor-pointer min-h-[36px] active:scale-95 transition-all ${
                        filtroDiasModeracao === '5' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Últimos 5 dias
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuadraSelecionada(null)}
                    aria-label="Fechar modal"
                    className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center text-xs cursor-pointer active:scale-95"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {carregandoReplays ? (
                  <p className="text-center text-xs text-zinc-400 py-10 animate-pulse">
                    Carregando gravações...
                  </p>
                ) : replaysQuadra.length === 0 ? (
                  <p className="text-center text-xs text-zinc-500 py-10">
                    Nenhum replay encontrado neste período para esta quadra.
                  </p>
                ) : (
                  replaysQuadra.map((replay) => {
                    const dt = new Date(replay.criado_em);
                    const dataStr = dt.toLocaleDateString('pt-BR');
                    const horaStr = dt.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const linkJogador = `${urlBaseSistema}/jogada?id=${replay.id}`;

                    return (
                      <div
                        key={replay.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-zinc-200">
                            <ReplayThumbnail
                              thumbnailUrl={replay.thumbnail_url}
                              videoUrl={replay.video_url}
                              alt={`Replay ${dataStr} ${horaStr}`}
                            />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-bold text-zinc-900">
                              {dataStr} às {horaStr}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {replay.visualizacoes || 0} views &bull; {replay.downloads || 0} downloads
                            </p>
                            <a
                              href={linkJogador}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-amber-600 hover:underline font-bold inline-block"
                            >
                              Abrir Página do Atleta ➔
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <div className="bg-white p-1.5 rounded-lg border border-zinc-200">
                            <QRCodeSVG value={linkJogador} size={42} />
                          </div>
                          <button
                            type="button"
                            disabled={excluindoReplayId === replay.id}
                            onClick={() => handleExcluirReplay(replay)}
                            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Excluir vídeo permanentemente"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                            <span>{excluindoReplayId === replay.id ? '...' : 'Excluir'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR QUADRA */}
        {modalEditarAberto && quadraParaEditar && (
          <div
            className="fixed inset-0 bg-zinc-950/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => {
              setModalEditarAberto(false);
              setQuadraParaEditar(null);
            }}
          >
            <div
              className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                  Ajustes: <span className="text-amber-500">{quadraParaEditar.nome}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarAberto(false);
                    setQuadraParaEditar(null);
                  }}
                  aria-label="Fechar modal"
                  className="text-zinc-400 hover:text-zinc-700 w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-xs cursor-pointer active:scale-95"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSalvarEdicao} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                    Nome da Quadra
                  </label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <ImageUploadField
                  arenaId={arena?.id}
                  prefixo={`quadra-${quadraParaEditar.id.slice(0, 8)}`}
                  value={editFotoUrl}
                  onChange={setEditFotoUrl}
                  label="Foto de Capa (Opcional)"
                  compact={true}
                />

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={salvandoEdicao}
                    className="w-full py-3.5 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-95"
                  >
                    {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExcluirQuadra(quadraParaEditar.id)}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer min-h-[44px] active:scale-95"
                  >
                    Excluir Quadra
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POPUP DE NOTIFICAÇÃO CUSTOMIZADO */}
        {notificacao.aberto && (
          <div className="fixed inset-0 bg-zinc-950/45 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl inline-block">
                  {notificacao.titulo}
                </h3>
                <p className="text-sm font-semibold text-zinc-800 leading-relaxed pt-2">
                  {notificacao.mensagem}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-center gap-3">
                {notificacao.tipo === 'confirm' ? (
                  <>
                    <button
                      type="button"
                      onClick={fecharNotificacao}
                      className="flex-1 py-3 bg-zinc-50 border border-zinc-200 text-zinc-600 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fn = notificacao.onConfirmar;
                        fecharNotificacao();
                        if (fn) fn();
                      }}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Confirmar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={fecharNotificacao}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                    Entendido
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLYER IMPRESSÃO DIRECT-TO-PAPER (A4) */}
      <div className="hidden print:flex flex-col items-center justify-between bg-white text-black w-full h-screen p-16 font-sans text-center border-[24px] border-neutral-900 box-border">
        <div className="space-y-1">
          <h1 className="text-6xl font-black tracking-widest text-neutral-900 m-0">
            FOX <span className="text-[#A6801E]">REPLAY</span>
          </h1>
          <p className="text-xs uppercase tracking-widest font-extrabold text-neutral-400">
            REVEJA SEUS LANCES INSTANTANEAMENTE
          </p>
        </div>

        <div className="my-auto py-6 space-y-3">
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider m-0">
            Você está jogando na
          </p>
          <h2 className="text-5xl font-black text-neutral-950 uppercase tracking-tight leading-none">
            {arena?.nome || 'Nossa Arena'}
          </h2>
          <div className="w-24 h-1 bg-[#A6801E] mx-auto mt-4" />
        </div>

        <div className="bg-white p-6 border-4 border-neutral-950 rounded-3xl shadow-sm inline-block">
          {linkPortalPublico ? (
            <QRCodeSVG value={linkPortalPublico} size={280} level="H" includeMargin={false} />
          ) : (
            <p className="text-xs text-neutral-400">Gerando código seguro...</p>
          )}
        </div>

        <div className="w-full max-w-xl bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-6 mt-8 space-y-3 text-left">
          <h4 className="font-black text-sm uppercase tracking-wider text-neutral-900 text-center border-b border-neutral-200 pb-2 mb-3">
            Como baixar a sua jogada:
          </h4>
          <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
            <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </strong>
            Fez um ponto incrível? Pressione o botão físico na grade da quadra imediatamente.
          </p>
          <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
            <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </strong>
            Ao final da partida, escaneie este QR Code com a câmera do seu celular.
          </p>
          <p className="text-xs font-medium text-neutral-700 flex items-start gap-2">
            <strong className="bg-neutral-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </strong>
            Escolha sua quadra, encontre o lance pelo horário e baixe em alta definição com áudio!
          </p>
        </div>

        <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase m-0 mt-8">
          SISTEMA AUTOMÁTICO DE REPLAYS ESPORTIVOS
        </p>
      </div>
    </>
  );
}

export default function DashboardArena() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs text-zinc-400">
          Carregando painel da arena...
        </div>
      }
    >
      <ConteudoDashboardArena />
    </Suspense>
  );
}
