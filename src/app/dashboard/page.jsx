'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import { isSuperAdmin, validarUrlHttp, montarUrlWhatsAppSuporte } from '../../lib/auth';
import { fetchComToken } from '../../lib/apiClient';
import { getArenaAtivaId, setArenaAtivaId, clearArenaAtivaId } from '../../lib/storage';
import AppHeader from '@/components/AppHeader';
import ImageUploadField from '@/components/ImageUploadField';
import CustomSelect from '@/components/CustomSelect';
import { IconBuilding } from '@/components/icons';
import ArenaMetricsCard from './components/ArenaMetricsCard';
import ArenaSponsorsCard from './components/ArenaSponsorsCard';
import ModerationModal from './components/ModerationModal';
import QrPrintFlyer from './components/QrPrintFlyer';

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
  const [modoSuporteNoc, setModoSuporteNoc] = useState(false);
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
  const periodoMetricasRef = useRef('30d');
  const usuarioIdRef = useRef(null);
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
        await carregarMetricas(arenaId, periodoMetricasRef.current);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setCarregando(false);
      }
    },
    [carregarMetricas]
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
        usuarioIdRef.current = session.user.id;
        if (!cancelado) setEhAdmin(superAdmin);

        const { data: arenasPropriasData } = await supabase
          .from('arenas')
          .select('*')
          .eq('usuario_id', session.user.id)
          .order('nome', { ascending: true });
        const arenasProprias = arenasPropriasData || [];

        // Super Admin acessando arena específica via NOC Admin (/dashboard?arena=<id>)
        if (superAdmin && arenaQueryId) {
          const naPropria = arenasProprias.find((a) => a.id === arenaQueryId);
          if (naPropria) {
            if (cancelado) return;
            setModoSuporteNoc(false);
            setMinhasArenas(arenasProprias);
            setArenaAtivaId(naPropria.id);
            carregarDados(naPropria.id, naPropria);
            return;
          }

          const { data: arenaSuporte } = await supabase
            .from('arenas')
            .select('*')
            .eq('id', arenaQueryId)
            .single();

          if (arenaSuporte) {
            if (cancelado) return;
            setModoSuporteNoc(true);
            setMinhasArenas(arenasProprias.length > 0 ? [arenaSuporte, ...arenasProprias] : [arenaSuporte]);
            carregarDados(arenaSuporte.id, arenaSuporte);
            return;
          }
        }

        if (arenasProprias.length === 0) {
          if (superAdmin) {
            router.replace('/admin');
          } else {
            router.replace('/perfil');
          }
          return;
        }

        if (cancelado) return;
        setModoSuporteNoc(false);
        setMinhasArenas(arenasProprias);

        const idPreferido = arenaQueryId || getArenaAtivaId();
        const arenaEncontrada =
          arenasProprias.find((a) => a.id === idPreferido) || arenasProprias[0];

        setArenaAtivaId(arenaEncontrada.id);
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
    const selecionada = minhasArenas.find((a) => a.id === idNovaArena) || null;
    const ehSuporte = Boolean(
      selecionada && usuarioIdRef.current && selecionada.usuario_id !== usuarioIdRef.current
    );
    setModoSuporteNoc(ehSuporte);
    if (!ehSuporte) {
      setArenaAtivaId(idNovaArena);
    }
    carregarDados(idNovaArena, selecionada);
  };

  const handleTrocarPeriodo = (novoPeriodo) => {
    periodoMetricasRef.current = novoPeriodo;
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
      const logoLimpa = logoArenaInput.trim() || null;
      const { error: errDb } = await supabase
        .from('arenas')
        .update({
          logo_url: logoLimpa,
          patrocinadores: patrocinadoresInput,
        })
        .eq('id', arena.id);

      if (errDb) throw errDb;

      setArena((prev) =>
        prev ? { ...prev, logo_url: logoLimpa, patrocinadores: patrocinadoresInput } : prev
      );
      setMinhasArenas((prev) =>
        prev.map((a) =>
          a.id === arena.id
            ? { ...a, logo_url: logoLimpa, patrocinadores: patrocinadoresInput }
            : a
        )
      );

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
          await fetchComToken(`/api/replays/${replay.id}`, {
            method: 'DELETE',
          });

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
    clearArenaAtivaId();
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
          {/* BANNER DE MODO SUPORTE NOC (QUANDO SUPER ADMIN ABRE ARENA DE OUTRO GESTOR VIA /admin) */}
          {modoSuporteNoc && arena && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-800 block">
                  Modo Suporte NOC &bull; Super Admin
                </span>
                <p className="text-xs text-zinc-800 font-medium">
                  Visualizando a arena <strong className="font-black uppercase">{arena.nome}</strong>
                  {arena.email_contato ? ` (${arena.email_contato})` : ''}.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/admin"
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors"
                >
                  Voltar ao NOC Admin
                </Link>
              </div>
            </div>
          )}

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
          <ArenaMetricsCard
            periodos={PERIODOS_METRICAS}
            periodoMetricas={periodoMetricas}
            onTrocarPeriodo={handleTrocarPeriodo}
            onGerarRelatorioWhatsApp={handleGerarRelatorioPatrocinadoresWhatsApp}
            carregandoMetricas={carregandoMetricas}
            metricasArena={metricasArena}
          />

          {/* BENTO 3: PATROCINADORES & LOGO COM UPLOAD DIRETO */}
          <ArenaSponsorsCard
            arena={arena}
            logoArenaInput={logoArenaInput}
            setLogoArenaInput={setLogoArenaInput}
            patrocinadoresInput={patrocinadoresInput}
            onAtualizarSlot={handleAtualizarSlotPatrocinador}
            onSalvar={handleSalvarPatrocinadores}
            salvando={salvandoPatrocinadores}
          />

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
        <ModerationModal
          quadraSelecionada={quadraSelecionada}
          onClose={() => setQuadraSelecionada(null)}
          filtroDiasModeracao={filtroDiasModeracao}
          onMudarFiltroDias={(dias) => {
            setFiltroDiasModeracao(dias);
            carregarReplaysDaQuadra(quadraSelecionada, dias);
          }}
          carregandoReplays={carregandoReplays}
          replaysQuadra={replaysQuadra}
          urlBaseSistema={urlBaseSistema}
          excluindoReplayId={excluindoReplayId}
          onExcluirReplay={handleExcluirReplay}
        />

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
      <QrPrintFlyer arenaNome={arena?.nome} linkPortalPublico={linkPortalPublico} />
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
