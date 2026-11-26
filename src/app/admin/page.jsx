'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { isSuperAdmin } from '../../lib/auth';
import { fetchComToken } from '../../lib/apiClient';
import AppHeader from '@/components/AppHeader';
import CustomSelect from '@/components/CustomSelect';
import { IconBuilding, IconX } from '@/components/icons';

const IconRadio = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
  </svg>
);

const IconShield = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconMail = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconPhone = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconChevronDown = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

function limparTelefoneWhatsapp(tel) {
  const digitos = String(tel || '').replace(/\D/g, '');
  if (!digitos) return '';
  return digitos.startsWith('55') ? digitos : `55${digitos}`;
}

function formatarTempoRelativo(isoDate) {
  if (!isoDate) return 'Sem heartbeat';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 60) return `há ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

function avaliarSaudeTotem(disp) {
  if (!disp) return { status: 'sem_totem', label: 'Sem Totem' };
  const lastMs = disp.ultimo_heartbeat ? new Date(disp.ultimo_heartbeat).getTime() : 0;
  const online = lastMs > 0 && Date.now() - lastMs < 3 * 60 * 1000;
  if (!online) return { status: 'offline', label: lastMs ? 'Offline' : 'Aguardando Ping' };
  if (disp.camera_online === false) return { status: 'camera_off', label: 'Câmera Off' };
  return { status: 'online', label: 'Online' };
}

export default function SuperAdminNOCPage() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [arenas, setArenas] = useState([]);
  const [totalReplays, setTotalReplays] = useState(0);
  const [buscaArena, setBuscaArena] = useState('');
  const [filtroSaude, setFiltroSaude] = useState('todas'); // 'todas' | 'alertas' | 'online' | 'pausadas'
  const [arenasExpandidas, setArenasExpandidas] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
  const [toast, setToast] = useState(null);

  // Modal Nova Arena + Gestor
  const [modalNovaArena, setModalNovaArena] = useState(false);
  const [novaArenaForm, setNovaArenaForm] = useState({
    nome: '',
    cidade: '',
    estado: 'SP',
    limite_quadras: 2,
    plano_nome: 'Plano 2 Quadras',
    nome_gestor: '',
    email_gestor: '',
    telefone_gestor: '',
  });
  const [criandoArena, setCriandoArena] = useState(false);
  const [acessoGerado, setAcessoGerado] = useState(null);

  // Modal Editar Arena / Plano / Pausa
  const [arenaEditando, setArenaEditando] = useState(null);
  const [editArenaForm, setEditArenaForm] = useState({
    nome: '',
    cidade: '',
    estado: '',
    plano_nome: '',
    limite_quadras: 2,
    telefone_gestor: '',
    ativa: true,
  });
  const [salvandoArena, setSalvandoArena] = useState(false);

  // Modal Pareamento Master
  const [modalPareamento, setModalPareamento] = useState(false);
  const [arenaSelModal, setArenaSelModal] = useState('');
  const [quadraSelModal, setQuadraSelModal] = useState('');
  const [codigoTotem, setCodigoTotem] = useState('');
  const [cameraUrlParear, setCameraUrlParear] = useState('');
  const [ativandoTotem, setAtivandoTotem] = useState(false);

  // Modal Editar RTSP do Dispositivo
  const [dispEditando, setDispEditando] = useState(null);
  const [editCameraUrl, setEditCameraUrl] = useState('');
  const [salvandoDisp, setSalvandoDisp] = useState(false);

  // Central LGPD (Busca e Exclusão por ID)
  const [lgpdReplayId, setLgpdReplayId] = useState('');
  const [lgpdBuscando, setLgpdBuscando] = useState(false);
  const [lgpdResultado, setLgpdResultado] = useState(null);
  const [lgpdExcluindo, setLgpdExcluindo] = useState(false);

  const toastTimeoutRef = useRef(null);

  const exibirToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const recarregarDados = useCallback(async () => {
    setAtualizando(true);
    try {
      const json = await fetchComToken('/api/admin/arenas');
      if (!json) {
        throw new Error('Erro ao carregar arenas.');
      }

      const listaArenas = json.arenas || [];
      setArenas(listaArenas);
      setTotalReplays(json.totalReplays || 0);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

      // Se houver até 4 arenas e o mapa ainda estiver vazio, expande por padrão para conveniência
      setArenasExpandidas((prev) => {
        if (Object.keys(prev).length > 0 || listaArenas.length > 4) return prev;
        const inicial = {};
        listaArenas.forEach((a) => {
          inicial[a.id] = true;
        });
        return inicial;
      });
    } catch (e) {
      console.error('Erro ao carregar NOC:', e);
    } finally {
      setAtualizando(false);
    }
  }, []);

  // Auto-refresh opcional (30s) para monitoramento em tela/TV (pausa quando aba está oculta)
  useEffect(() => {
    if (!autoRefresh || !autorizado) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      recarregarDados();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, autorizado, recarregarDados]);

  // Fechar modais com Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setModalPareamento(false);
      setModalNovaArena(false);
      setArenaEditando(null);
      setDispEditando(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Super Admin Guard
  useEffect(() => {
    async function verificarSuperAdmin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/entrar?redirect=/admin&motivo=gestor');
          return;
        }
        if (!isSuperAdmin(session.user)) {
          router.replace('/');
          return;
        }
        setAutorizado(true);
        await recarregarDados();
      } catch (err) {
        console.error(err);
        router.replace('/');
      } finally {
        setCarregando(false);
      }
    }
    verificarSuperAdmin();
  }, [router, recarregarDados]);

  // 1. Criar Nova Arena Parceira + Conta do Gestor
  const handleCriarNovaArena = async (e) => {
    e.preventDefault();
    setCriandoArena(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/arenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novaArenaForm),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Erro ao criar arena.');

      setAcessoGerado(json);
      setNovaArenaForm({
        nome: '',
        cidade: '',
        estado: 'SP',
        limite_quadras: 2,
        plano_nome: 'Plano 2 Quadras',
        nome_gestor: '',
        email_gestor: '',
        telefone_gestor: '',
      });
      await recarregarDados();
      exibirToast('Nova Arena Parceira provisionada com sucesso!');
    } catch (err) {
      exibirToast(err.message || 'Falha ao cadastrar arena.');
    } finally {
      setCriandoArena(false);
    }
  };

  const montarMensagemCredenciais = (info) => {
    const origem = typeof window !== 'undefined' ? window.location.origin : 'https://www.foxreplay.com.br';
    if (info.gestor.contaExistente) {
      return (
        `🏟️ *Bem-vindo à Fox Replay — ${info.arena.nome}!*\n\n` +
        `Sua arena já foi ativada no seu cadastro existente (${info.gestor.email}).\n` +
        `Acesse seu Painel do Gestor usando sua senha atual em:\n${origem}/entrar`
      );
    }
    return (
      `🏟️ *Bem-vindo à Fox Replay — ${info.arena.nome}!*\n\n` +
      `Seu Painel Administrativo já está ativo:\n` +
      `🔗 *Link:* ${origem}/entrar\n` +
      `📧 *E-mail:* ${info.gestor.email}\n` +
      `🔑 *Senha temporária:* ${info.gestor.senhaTemporaria}\n\n` +
      `Recomendamos alterar sua senha após o primeiro acesso (em Meu Perfil > Editar perfil e senha).`
    );
  };

  // 2. Editar Arena / Plano / Pausa Suave
  const abrirEditarArena = (arena) => {
    setArenaEditando(arena);
    setEditArenaForm({
      nome: arena.nome || '',
      cidade: arena.cidade || '',
      estado: arena.estado || 'SP',
      plano_nome: arena.plano_nome || 'Plano Padrão',
      limite_quadras: arena.limite_quadras || 2,
      telefone_gestor: arena.gestor_telefone || '',
      ativa: arena.ativa !== false,
    });
  };

  const handleSalvarEdicaoArena = async (e) => {
    e.preventDefault();
    if (!arenaEditando) return;
    setSalvandoArena(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/arenas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: arenaEditando.id, ...editArenaForm }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Erro ao atualizar arena.');

      setArenaEditando(null);
      await recarregarDados();
      exibirToast('Arena e plano atualizados com sucesso!');
    } catch (err) {
      exibirToast(err.message || 'Erro ao salvar arena.');
    } finally {
      setSalvandoArena(false);
    }
  };

  const handleAlternarPausaArena = async (arena) => {
    const novoStatus = arena.ativa === false;
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/arenas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: arena.id, ativa: novoStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Erro ao alterar status.');

      await recarregarDados();
      exibirToast(novoStatus ? `Arena "${arena.nome}" reativada!` : `Arena "${arena.nome}" pausada (pausa suave).`);
    } catch (err) {
      exibirToast(err.message || 'Falha ao alterar status da arena.');
    }
  };

  // 3. Pareamento Master de Totem
  const handleAtivarTotemMaster = async (e) => {
    e.preventDefault();
    if (!quadraSelModal || !codigoTotem.trim()) {
      exibirToast('Selecione a quadra e informe o código da TV.');
      return;
    }
    setAtivandoTotem(true);
    try {
      let cod = codigoTotem.trim().toUpperCase();
      if (cod.length === 6 && !cod.includes('-')) {
        cod = `${cod.substring(0, 3)}-${cod.substring(3, 6)}`;
      }
      const { error } = await supabase.rpc('vincular_totem_por_codigo', {
        p_codigo: cod,
        p_quadra_id: quadraSelModal,
        p_camera_url: cameraUrlParear.trim() || null,
      });
      if (error) throw new Error(error.message || 'Código inválido ou expirado.');

      exibirToast('Totem vinculado com sucesso!');
      setModalPareamento(false);
      setCodigoTotem('');
      setCameraUrlParear('');
      await recarregarDados();
    } catch (err) {
      exibirToast(err.message || 'Erro ao vincular totem.');
    } finally {
      setAtivandoTotem(false);
    }
  };

  // 4. Editar RTSP ou Desvincular Dispositivo
  const handleSalvarCameraDisp = async (e) => {
    e.preventDefault();
    if (!dispEditando) return;
    setSalvandoDisp(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/dispositivos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: dispEditando.id, camera_url: editCameraUrl.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Erro ao atualizar RTSP.');

      setDispEditando(null);
      await recarregarDados();
      exibirToast('URL RTSP atualizada! O totem sincronizará no próximo heartbeat (até 60s).');
    } catch (err) {
      exibirToast(err.message || 'Erro ao atualizar câmera.');
    } finally {
      setSalvandoDisp(false);
    }
  };

  const handleDesvincularDispositivo = async (disp) => {
    if (!window.confirm('Desvincular este totem da quadra? Ele deixará de enviar vídeos até ser pareado novamente.')) {
      return;
    }
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/dispositivos?id=${encodeURIComponent(disp.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Falha ao desvincular.');

      await recarregarDados();
      exibirToast('Totem desvinculado! A quadra está livre para novo pareamento.');
    } catch (err) {
      exibirToast(err.message || 'Erro ao desvincular totem.');
    }
  };

  // 5. Central LGPD (Buscar e Excluir Replay por ID)
  const handleBuscarReplayLgpd = async (e) => {
    e.preventDefault();
    const idLimpo = lgpdReplayId.trim();
    if (!idLimpo) return;
    setLgpdBuscando(true);
    setLgpdResultado(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/replays/${encodeURIComponent(idLimpo)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Replay não encontrado.');
      setLgpdResultado(json.replay);
    } catch (err) {
      exibirToast(err.message || 'Replay não encontrado.');
    } finally {
      setLgpdBuscando(false);
    }
  };

  const handleExcluirReplayLgpd = async () => {
    if (!lgpdResultado) return;
    if (!window.confirm('Excluir este vídeo permanentemente do banco e do Storage (LGPD)?')) return;
    setLgpdExcluindo(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/replays/${encodeURIComponent(lgpdResultado.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Erro ao excluir replay.');

      setLgpdResultado(null);
      setLgpdReplayId('');
      await recarregarDados();
      exibirToast('Replay removido permanentemente do banco e do Storage!');
    } catch (err) {
      exibirToast(err.message || 'Erro na exclusão LGPD.');
    } finally {
      setLgpdExcluindo(false);
    }
  };

  const analisarSaudeArena = useCallback((arena) => {
    const quadras = arena.quadras || [];
    let online = 0;
    let offline = 0;
    let cameraOff = 0;
    let semTotem = 0;
    let filaOffline = 0;

    quadras.forEach((q) => {
      const disp = q.dispositivos?.[0];
      if (!disp) {
        semTotem += 1;
        return;
      }
      if (disp.fila_offline_qtd > 0) filaOffline += disp.fila_offline_qtd;
      const saude = avaliarSaudeTotem(disp);
      if (saude.status === 'online') online += 1;
      else if (saude.status === 'camera_off') cameraOff += 1;
      else offline += 1;
    });

    const temAlerta = arena.ativa !== false && (offline > 0 || cameraOff > 0 || filaOffline > 0);
    return {
      totalQuadras: quadras.length,
      online,
      offline,
      cameraOff,
      semTotem,
      filaOffline,
      temAlerta,
    };
  }, []);

  // Métricas NOC + Filtros Inteligentes
  const contagensFiltro = useMemo(() => {
    let alertas = 0;
    let online = 0;
    let pausadas = 0;
    arenas.forEach((a) => {
      if (a.ativa === false) {
        pausadas += 1;
        return;
      }
      const s = analisarSaudeArena(a);
      if (s.temAlerta) alertas += 1;
      else if (s.totalQuadras > 0 && s.online === s.totalQuadras) online += 1;
    });
    return { todas: arenas.length, alertas, online, pausadas };
  }, [arenas, analisarSaudeArena]);

  const arenasFiltradas = useMemo(() => {
    const t = buscaArena.trim().toLowerCase();
    return arenas.filter((a) => {
      if (filtroSaude === 'pausadas' && a.ativa !== false) return false;
      if (filtroSaude === 'alertas') {
        if (a.ativa === false || !analisarSaudeArena(a).temAlerta) return false;
      }
      if (filtroSaude === 'online') {
        const s = analisarSaudeArena(a);
        if (a.ativa === false || s.totalQuadras === 0 || s.online !== s.totalQuadras) return false;
      }

      if (!t) return true;
      return (
        (a.nome || '').toLowerCase().includes(t) ||
        (a.cidade || '').toLowerCase().includes(t) ||
        (a.gestor_email || '').toLowerCase().includes(t) ||
        (a.gestor_telefone || '').toLowerCase().includes(t) ||
        (a.gestor_nome || '').toLowerCase().includes(t)
      );
    });
  }, [arenas, buscaArena, filtroSaude, analisarSaudeArena]);

  const todasExpandidas =
    arenasFiltradas.length > 0 && arenasFiltradas.every((a) => Boolean(arenasExpandidas[a.id]));

  const alternarExpandirArena = (id) => {
    setArenasExpandidas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const alternarTodasArenas = () => {
    if (todasExpandidas) {
      setArenasExpandidas({});
    } else {
      const novo = {};
      arenasFiltradas.forEach((a) => {
        novo[a.id] = true;
      });
      setArenasExpandidas(novo);
    }
  };

  const resumoGlobal = useMemo(() => {
    let quadrasTotal = 0;
    let totensTotal = 0;
    let totensOnline = 0;
    let arenasAtivas = 0;
    arenas.forEach((a) => {
      if (a.ativa !== false) arenasAtivas += 1;
      (a.quadras || []).forEach((q) => {
        quadrasTotal += 1;
        const disp = q.dispositivos?.[0];
        if (disp) {
          totensTotal += 1;
          if (avaliarSaudeTotem(disp).status === 'online') totensOnline += 1;
        }
      });
    });
    return { quadrasTotal, totensTotal, totensOnline, arenasAtivas };
  }, [arenas]);

  const arenaAtualModal = arenas.find((a) => a.id === arenaSelModal);
  const quadrasArenaModal = arenaAtualModal?.quadras || [];

  if (carregando || !autorizado) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Verificando credenciais de Super Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 pb-20 safe-pb">
      {/* CABEÇALHO GLOBAL CONTEXTUAL (DARK NOC) */}
      <AppHeader theme="dark" activeRoute="admin" badge="NOC Super Admin" showLogout={true} />

      {/* TOAST FLUTUANTE */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-amber-500/40 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl animate-fadeIn flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
        {/* BARRA DE COMANDOS NOC */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Torre de Controle <span className="text-amber-500">Global</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Provisione arenas parceiras, monitore totens em tempo real e gerencie solicitações LGPD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAcessoGerado(null);
                setModalNovaArena(true);
              }}
              className="text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              + Nova Arena Parceira
            </button>
            <button
              type="button"
              onClick={() => {
                if (arenas.length > 0) {
                  setArenaSelModal(arenas[0].id);
                  setQuadraSelModal(arenas[0].quadras?.[0]?.id || '');
                }
                setModalPareamento(true);
              }}
              className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <IconRadio className="w-3.5 h-3.5" />
              <span>Vincular Totem</span>
            </button>
            <button
              type="button"
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`text-xs font-bold px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
              }`}
              title="Atualizar dados automaticamente a cada 30 segundos"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span>Auto 30s</span>
            </button>
            <button
              type="button"
              disabled={atualizando}
              onClick={recarregarDados}
              className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {atualizando ? 'Atualizando...' : `↻ Atualizar${ultimaAtualizacao ? ` (${ultimaAtualizacao})` : ''}`}
            </button>
          </div>
        </div>

        {/* CARDS DE KPIs GLOBAIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Arenas Parceiras
            </span>
            <span className="text-3xl font-black text-white">{arenas.length}</span>
            <p className="text-[11px] text-zinc-400">
              {resumoGlobal.arenasAtivas} ativa(s) &bull; {arenas.length - resumoGlobal.arenasAtivas} pausada(s)
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Quadras Monitoradas
            </span>
            <span className="text-3xl font-black text-white">{resumoGlobal.quadrasTotal}</span>
            <p className="text-[11px] text-zinc-500">Cadastradas na rede</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Totens Online / Pareados
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">{resumoGlobal.totensOnline}</span>
              <span className="text-sm font-mono text-zinc-500">/ {resumoGlobal.totensTotal}</span>
            </div>
            <p className="text-[11px] text-zinc-500">Heartbeat &lt; 3 min</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Replays na Nuvem
            </span>
            <span className="text-3xl font-black text-amber-400">{totalReplays}</span>
            <p className="text-[11px] text-zinc-500">Vídeos ativos na rede</p>
          </div>
        </div>

        {/* CENTRAL LGPD COMPACTA */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <IconShield className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200 truncate">
                Central LGPD &bull; Moderação por UUID
              </span>
            </div>

            <form onSubmit={handleBuscarReplayLgpd} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={lgpdReplayId}
                onChange={(e) => setLgpdReplayId(e.target.value)}
                placeholder="Cole o ID do replay (UUID)..."
                className="flex-1 sm:w-64 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={lgpdBuscando}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer disabled:opacity-50 shrink-0"
              >
                {lgpdBuscando ? 'Buscando...' : 'Localizar'}
              </button>
            </form>
          </div>

          {lgpdResultado && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-4 min-w-0">
                <video
                  src={lgpdResultado.video_url}
                  controls
                  muted
                  className="w-36 aspect-video rounded-lg bg-black border border-zinc-800 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                    {lgpdResultado.quadras?.arenas?.nome || 'Arena'} &bull;{' '}
                    {lgpdResultado.quadras?.nome || 'Quadra'}
                  </span>
                  <p className="text-xs text-zinc-300 font-mono truncate">ID: {lgpdResultado.id}</p>
                  <p className="text-[11px] text-zinc-500">
                    Gravado em: {new Date(lgpdResultado.criado_em).toLocaleString('pt-BR')} &bull;{' '}
                    {lgpdResultado.visualizacoes || 0} views &bull; {lgpdResultado.downloads || 0} downs
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={lgpdExcluindo}
                onClick={handleExcluirReplayLgpd}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50"
              >
                {lgpdExcluindo ? 'Excluindo...' : 'Excluir Permanentemente (Banco + Storage)'}
              </button>
            </div>
          )}
        </div>

        {/* LISTA DE ARENAS, PLANOS E MONITORAMENTO DE HARDWARE */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6 border-b border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <IconBuilding className="w-4 h-4 text-amber-500" />
                  <span>Complexos Esportivos &bull; Planos e Saúde de Hardware</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Contato direto com os gestores, saúde dos totens e gestão de cotas.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={buscaArena}
                  onChange={(e) => setBuscaArena(e.target.value)}
                  placeholder="Buscar arena, cidade, e-mail ou telefone..."
                  className="w-full sm:w-72 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                {arenasFiltradas.length > 0 && (
                  <button
                    type="button"
                    onClick={alternarTodasArenas}
                    className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-300 whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {todasExpandidas ? 'Recolher' : 'Expandir todas'}
                  </button>
                )}
              </div>
            </div>

            {/* CHIPS DE FILTRO RÁPIDO DE SAÚDE */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {[
                { id: 'todas', label: `Todas (${contagensFiltro.todas})`, corAtiva: 'bg-zinc-100 text-zinc-950 border-zinc-100' },
                { id: 'alertas', label: `Com Alertas (${contagensFiltro.alertas})`, corAtiva: 'bg-red-500/20 text-red-300 border-red-500/40' },
                { id: 'online', label: `100% Online (${contagensFiltro.online})`, corAtiva: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                { id: 'pausadas', label: `Pausadas (${contagensFiltro.pausadas})`, corAtiva: 'bg-zinc-700 text-white border-zinc-600' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFiltroSaude(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border whitespace-nowrap transition-all cursor-pointer ${
                    filtroSaude === chip.id
                      ? chip.corAtiva
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {arenasFiltradas.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500">
                Nenhuma arena encontrada com o filtro selecionado.
              </div>
            ) : (
              arenasFiltradas.map((arena) => {
                const limiteQuadras = arena.limite_quadras || 2;
                const totalQuadrasArena = arena.quadras?.length || 0;
                const pausada = arena.ativa === false;
                const saudeArena = analisarSaudeArena(arena);
                const expandida = Boolean(arenasExpandidas[arena.id]);
                const whatsappLimpo = limparTelefoneWhatsapp(arena.gestor_telefone);

                return (
                  <div key={arena.id} className="p-4 sm:p-5 space-y-3 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => alternarExpandirArena(arena.id)}
                            className="flex items-center gap-2 text-left group cursor-pointer"
                          >
                            <IconChevronDown
                              className={`w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-transform duration-200 shrink-0 ${
                                expandida ? 'rotate-180 text-amber-400' : ''
                              }`}
                            />
                            <h3 className="text-base font-black text-white uppercase group-hover:text-amber-400 transition-colors">
                              {arena.nome}
                            </h3>
                          </button>

                          {pausada ? (
                            <span className="text-[10px] font-mono font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md">
                              PAUSADA
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              Ativa
                            </span>
                          )}
                          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                            {arena.cidade || 'Sem cidade'} {arena.estado ? `• ${arena.estado}` : ''}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            Cota: {totalQuadrasArena}/{limiteQuadras}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                            {arena.plano_nome || 'Plano Padrão'}
                          </span>

                          {/* Resumo de saúde no cabeçalho */}
                          {!pausada && totalQuadrasArena > 0 && (
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                saudeArena.temAlerta
                                  ? 'bg-red-500/10 text-red-300 border-red-500/30'
                                  : saudeArena.online > 0
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {saudeArena.online}/{totalQuadrasArena} Online
                              {saudeArena.cameraOff > 0 ? ` • ${saudeArena.cameraOff} Câm Off` : ''}
                              {saudeArena.offline > 0 ? ` • ${saudeArena.offline} Off` : ''}
                            </span>
                          )}
                        </div>

                        {/* DADOS DE CONTATO DO GESTOR CRIADOR (E-MAIL + TELEFONE / WHATSAPP) */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-6 text-[11px]">
                          {arena.gestor_nome && (
                            <span className="text-zinc-400 font-semibold">
                              Gestor: <span className="text-zinc-200">{arena.gestor_nome}</span>
                            </span>
                          )}

                          {arena.gestor_email ? (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(arena.gestor_email);
                                exibirToast(`E-mail copiado: ${arena.gestor_email}`);
                              }}
                              title="Clique para copiar o e-mail do gestor"
                              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer bg-zinc-950/70 border border-zinc-800/80 px-2 py-0.5 rounded-lg"
                            >
                              <IconMail className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="font-mono text-[10px]">{arena.gestor_email}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono">Sem e-mail vinculado</span>
                          )}

                          {arena.gestor_telefone ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(arena.gestor_telefone);
                                  exibirToast(`Telefone copiado: ${arena.gestor_telefone}`);
                                }}
                                title="Clique para copiar o telefone"
                                className="inline-flex items-center gap-1 text-zinc-300 hover:text-white bg-zinc-950/70 border border-zinc-800/80 px-2 py-0.5 rounded-lg cursor-pointer"
                              >
                                <IconPhone className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="font-mono text-[10px]">{arena.gestor_telefone}</span>
                              </button>
                              {whatsappLimpo && (
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${whatsappLimpo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg transition-colors"
                                >
                                  WhatsApp ↗
                                </a>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => abrirEditarArena(arena)}
                              className="text-[10px] text-zinc-500 hover:text-amber-400 underline cursor-pointer"
                            >
                              + Adicionar telefone
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 pl-6 lg:pl-0">
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard?arena=${arena.id}`)}
                          className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Dashboard ➔
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEditarArena(arena)}
                          className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAlternarPausaArena(arena)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                            pausada
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                          }`}
                        >
                          {pausada ? 'Reativar' : 'Pausar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/arena/${arena.id}`)}
                          className="text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Feed
                        </button>
                      </div>
                    </div>

                    {/* QUADRAS & DISPOSITIVOS (ACORDEÃO EXPANSÍVEL) */}
                    {expandida && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 pl-0 sm:pl-6 animate-fadeIn">
                        {(arena.quadras || []).length === 0 ? (
                          <div className="col-span-full p-4 rounded-2xl bg-zinc-950/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                            Nenhuma quadra cadastrada ainda. Use &quot;Dashboard&quot; ou aguarde o gestor nomear as quadras.
                          </div>
                        ) : (
                          (arena.quadras || []).map((quadra) => {
                            const disp = quadra.dispositivos?.[0] || null;
                            const saude = avaliarSaudeTotem(disp);
                            const tokenCurto = disp?.token_autenticacao
                              ? `...${disp.token_autenticacao.slice(-8)}`
                              : '';

                            return (
                              <div
                                key={quadra.id}
                                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                                  saude.status === 'online'
                                    ? 'bg-zinc-950/80 border-emerald-500/25'
                                    : saude.status === 'camera_off'
                                    ? 'bg-zinc-950/80 border-red-500/35'
                                    : 'bg-zinc-950/40 border-zinc-800'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-mono uppercase text-zinc-500 block">
                                      Quadra
                                    </span>
                                    <h4 className="text-xs font-black text-white uppercase truncate">
                                      {quadra.nome}
                                    </h4>
                                  </div>

                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                                      saude.status === 'online'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : saude.status === 'camera_off'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        saude.status === 'online'
                                          ? 'bg-emerald-400 animate-pulse'
                                          : saude.status === 'camera_off'
                                          ? 'bg-red-400 animate-ping'
                                          : 'bg-amber-400'
                                      }`}
                                    />
                                    <span>{saude.label}</span>
                                  </span>
                                </div>

                                {disp ? (
                                  <div className="space-y-2">
                                    <div className="text-[10px] font-mono text-zinc-400 space-y-1">
                                      <p className="truncate">
                                        RTSP: <span className="text-zinc-200">{disp.camera_url || 'Padrão local'}</span>
                                      </p>
                                      <p className="text-zinc-500">
                                        Ping: <span className="text-zinc-300">{formatarTempoRelativo(disp.ultimo_heartbeat)}</span>
                                        {disp.fila_offline_qtd > 0 && (
                                          <span className="text-amber-400 font-bold">
                                            {' '}
                                            &bull; {disp.fila_offline_qtd} na fila offline
                                          </span>
                                        )}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard?.writeText(disp.token_autenticacao);
                                          exibirToast('Token copiado!');
                                        }}
                                        title={disp.token_autenticacao}
                                        className="text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg cursor-pointer"
                                      >
                                        Token ({tokenCurto})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDispEditando(disp);
                                          setEditCameraUrl(disp.camera_url || '');
                                        }}
                                        className="text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 px-2.5 py-1 rounded-lg cursor-pointer"
                                      >
                                        Editar RTSP
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDesvincularDispositivo(disp)}
                                        className="text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-lg cursor-pointer"
                                      >
                                        Desvincular
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setArenaSelModal(arena.id);
                                      setQuadraSelModal(quadra.id);
                                      setModalPareamento(true);
                                    }}
                                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <IconRadio className="w-3 h-3" />
                                    <span>Vincular Totem</span>
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: NOVA ARENA PARCEIRA + PROVISIONAMENTO DO GESTOR */}
      {modalNovaArena && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalNovaArena(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl max-h-[85dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">
                {acessoGerado ? 'Arena Provisionada com Sucesso!' : 'Nova Arena Parceira + Gestor'}
              </h3>
              <button
                type="button"
                onClick={() => setModalNovaArena(false)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {acessoGerado ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-2 text-xs">
                  <p className="text-emerald-400 font-bold">
                    ✓ {acessoGerado.arena.nome} ativada!
                  </p>
                  <p className="text-zinc-300">
                    <strong>E-mail do Gestor:</strong> {acessoGerado.gestor.email}
                  </p>
                  {acessoGerado.gestor.contaExistente ? (
                    <p className="text-amber-300 text-[11px]">
                      Este e-mail já possuía conta (ex.: atleta). A arena foi vinculada ao mesmo login sem alterar a senha atual.
                    </p>
                  ) : (
                    <p className="text-zinc-300">
                      <strong>Senha Temporária:</strong>{' '}
                      <code className="bg-zinc-900 px-2 py-0.5 rounded text-amber-400 font-bold select-all">
                        {acessoGerado.gestor.senhaTemporaria}
                      </code>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(montarMensagemCredenciais(acessoGerado));
                      exibirToast('Mensagem de acesso copiada!');
                    }}
                    className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    Copiar Acesso
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const txt = encodeURIComponent(montarMensagemCredenciais(acessoGerado));
                      window.open(`https://api.whatsapp.com/send?text=${txt}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    Enviar no WhatsApp
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalNovaArena(false);
                    router.push(`/dashboard?arena=${acessoGerado.arena.id}`);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Abrir Dashboard da Nova Arena ➔
                </button>
              </div>
            ) : (
              <form onSubmit={handleCriarNovaArena} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Nome do Complexo Esportivo
                  </label>
                  <input
                    type="text"
                    required
                    value={novaArenaForm.nome}
                    onChange={(e) => setNovaArenaForm((p) => ({ ...p, nome: e.target.value }))}
                    placeholder="Ex: Arena Sunset Beach Tennis"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      required
                      value={novaArenaForm.cidade}
                      onChange={(e) => setNovaArenaForm((p) => ({ ...p, cidade: e.target.value }))}
                      placeholder="Campinas"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      UF
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={novaArenaForm.estado}
                      onChange={(e) =>
                        setNovaArenaForm((p) => ({ ...p, estado: e.target.value.toUpperCase() }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white text-center uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Cota de Quadras
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={novaArenaForm.limite_quadras}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setNovaArenaForm((p) => ({
                          ...p,
                          limite_quadras: q,
                          plano_nome: `Plano ${q} ${q === 1 ? 'Quadra' : 'Quadras'}`,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Nome do Plano
                    </label>
                    <input
                      type="text"
                      required
                      value={novaArenaForm.plano_nome}
                      onChange={(e) => setNovaArenaForm((p) => ({ ...p, plano_nome: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-3">
                  <span className="block text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Conta do Gestor (Dono da Arena)
                  </span>
                  <input
                    type="text"
                    value={novaArenaForm.nome_gestor}
                    onChange={(e) => setNovaArenaForm((p) => ({ ...p, nome_gestor: e.target.value }))}
                    placeholder="Nome do responsável (opcional)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="email"
                    required
                    value={novaArenaForm.email_gestor}
                    onChange={(e) => setNovaArenaForm((p) => ({ ...p, email_gestor: e.target.value }))}
                    placeholder="gestor@arena.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="tel"
                    value={novaArenaForm.telefone_gestor}
                    onChange={(e) => setNovaArenaForm((p) => ({ ...p, telefone_gestor: e.target.value }))}
                    placeholder="Telefone / WhatsApp do gestor (ex: (11) 99999-9999)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={criandoArena}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {criandoArena ? 'Provisionando Arena...' : 'Criar Arena e Gerar Acesso ➔'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR ARENA / PLANO / COTA / PAUSA */}
      {arenaEditando && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setArenaEditando(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wider text-white">
                Editar Arena &bull; <span className="text-amber-400">{arenaEditando.nome}</span>
              </h3>
              <button
                type="button"
                onClick={() => setArenaEditando(null)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoArena} className="space-y-4">
              <input
                type="text"
                required
                value={editArenaForm.nome}
                onChange={(e) => setEditArenaForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Nome da arena"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={editArenaForm.cidade}
                  onChange={(e) => setEditArenaForm((p) => ({ ...p, cidade: e.target.value }))}
                  placeholder="Cidade"
                  className="col-span-2 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <input
                  type="text"
                  maxLength={2}
                  value={editArenaForm.estado}
                  onChange={(e) =>
                    setEditArenaForm((p) => ({ ...p, estado: e.target.value.toUpperCase() }))
                  }
                  placeholder="UF"
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white text-center uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Limite de Quadras
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editArenaForm.limite_quadras}
                    onChange={(e) =>
                      setEditArenaForm((p) => ({
                        ...p,
                        limite_quadras: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Plano
                  </label>
                  <input
                    type="text"
                    required
                    value={editArenaForm.plano_nome}
                    onChange={(e) => setEditArenaForm((p) => ({ ...p, plano_nome: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Telefone / WhatsApp do Gestor
                  </label>
                  <input
                    type="tel"
                    value={editArenaForm.telefone_gestor}
                    onChange={(e) => setEditArenaForm((p) => ({ ...p, telefone_gestor: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editArenaForm.ativa}
                  onChange={(e) => setEditArenaForm((p) => ({ ...p, ativa: e.target.checked }))}
                  className="rounded text-amber-500"
                />
                <span>Arena ativa (desmarque para pausa operacional suave)</span>
              </label>

              <button
                type="submit"
                disabled={salvandoArena}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {salvandoArena ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITAR RTSP DO DISPOSITIVO */}
      {dispEditando && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDispEditando(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">
                Configurar Câmera IP / RTSP Remotamente
              </h3>
              <button
                type="button"
                onClick={() => setDispEditando(null)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              O Raspberry Pi aplicará a nova URL RTSP automaticamente no próximo heartbeat (até 60 segundos).
            </p>
            <form onSubmit={handleSalvarCameraDisp} className="space-y-4">
              <input
                type="text"
                value={editCameraUrl}
                onChange={(e) => setEditCameraUrl(e.target.value)}
                placeholder="rtsp://admin:senha@192.168.1.64:554/Streaming/Channels/101"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={salvandoDisp}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-95"
              >
                {salvandoDisp ? 'Salvando...' : 'Atualizar URL RTSP'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAREAMENTO MASTER DE TOTEM */}
      {modalPareamento && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalPareamento(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconRadio className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Vincular Totem à Quadra (Master)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPareamento(false)}
                aria-label="Fechar modal"
                className="text-zinc-400 hover:text-white w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs cursor-pointer active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAtivarTotemMaster} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  1. Complexo Esportivo
                </label>
                <CustomSelect
                  theme="dark"
                  value={arenaSelModal}
                  onChange={(val) => {
                    setArenaSelModal(val);
                    const a = arenas.find((item) => item.id === val);
                    setQuadraSelModal(a?.quadras?.[0]?.id || '');
                  }}
                  ariaLabel="Complexo Esportivo"
                  options={arenas.map((a) => ({
                    value: a.id,
                    label: `${a.nome} (${a.cidade || 'SP'})`,
                  }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  2. Quadra Específica
                </label>
                {quadrasArenaModal.length === 0 ? (
                  <p className="text-xs text-amber-500 font-bold p-2 bg-amber-500/10 rounded-xl">
                    Esta arena não possui quadras cadastradas.
                  </p>
                ) : (
                  <CustomSelect
                    theme="dark"
                    value={quadraSelModal}
                    onChange={(val) => setQuadraSelModal(val)}
                    ariaLabel="Quadra Específica"
                    options={quadrasArenaModal.map((q) => ({
                      value: q.id,
                      label: q.nome,
                    }))}
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  3. Código de 6 Dígitos da TV
                </label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={codigoTotem}
                  onChange={(e) => setCodigoTotem(e.target.value)}
                  placeholder="Ex: 852-149"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 text-center text-lg font-black tracking-widest uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  4. URL Câmera IP / RTSP (Opcional)
                </label>
                <input
                  type="text"
                  value={cameraUrlParear}
                  onChange={(e) => setCameraUrlParear(e.target.value)}
                  placeholder="rtsp://admin:senha@192.168.1.64:554/Streaming/Channels/101"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={ativandoTotem || !quadraSelModal}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-95"
              >
                {ativandoTotem ? 'Ativando Totem...' : 'Ativar e Iniciar Gravação ➔'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
