'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Ícones SVG Minimalistas e Técnicos (NOC Style)
const IconShield = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconRadio = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
  </svg>
);

const IconBuilding = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconCpu = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path strokeLinecap="round" d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
);

const IconX = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconLink = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

export default function SuperAdminPage() {
  const router = useRouter();

  // Estados de dados globais
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [usuarioAdmin, setUsuarioAdmin] = useState(null);
  const [arenas, setArenas] = useState([]);
  const [totalReplays, setTotalReplays] = useState(0);

  // Estados dos Modais
  const [modalPareamentoAberto, setModalPareamentoAberto] = useState(false);
  const [arenaSelecionadaModal, setArenaSelecionadaModal] = useState('');
  const [quadraSelecionadaModal, setQuadraSelecionadaModal] = useState('');
  const [codigoTotem, setCodigoTotem] = useState('');
  const [ativandoTotem, setAtivandoTotem] = useState(false);

  const [toast, setToast] = useState(null);

  const exibirToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Carga dos Dados de Toda a Infraestrutura
  const recarregarDados = async () => {
    try {
      const { data: arenasData, error: errA } = await supabase
        .from('arenas')
        .select('*, quadras(*, dispositivos(*))')
        .order('nome', { ascending: true });

      if (errA) throw errA;
      setArenas(arenasData || []);

      // Contagem total de replays no sistema
      const { count } = await supabase
        .from('replays')
        .select('*', { count: 'exact', head: true });

      setTotalReplays(count || 0);
    } catch (e) {
      console.error('Erro ao carregar dados do NOC:', e);
    }
  };

  // 2. Verificação de Segurança Master (Super Admin Guard)
  useEffect(() => {
    async function verificarSuperAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/login?redirect=/admin&motivo=gestor');
          return;
        }

        const email = (session.user.email || '').toLowerCase();
        const emailsPermitidos = [
          'matheussegalla469@hotmail.com',
          'admin@foxreplay.com.br',
          (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase()
        ].filter(Boolean);

        const isSuperAdmin =
          emailsPermitidos.includes(email) ||
          session.user.user_metadata?.role === 'super_admin' ||
          email.includes('admin') ||
          email.includes('segalla');

        if (!isSuperAdmin) {
          router.replace('/');
          return;
        }

        setUsuarioAdmin(session.user);
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
  }, [router]);

  // 3. Ativação de Totem Master (sem precisar da senha do cliente)
  const handleAtivarTotemMaster = async (e) => {
    e.preventDefault();
    if (!quadraSelecionadaModal || !codigoTotem.trim()) {
      exibirToast('Selecione a quadra e informe o código exibido na TV.');
      return;
    }

    setAtivandoTotem(true);
    try {
      let cod = codigoTotem.trim().toUpperCase();
      if (cod.length === 6 && !cod.includes('-')) {
        cod = `${cod.substring(0, 3)}-${cod.substring(3, 6)}`;
      }

      // 1. Busca código no banco de dados
      const { data: par, error: errP } = await supabase
        .from('pareamentos')
        .select('*')
        .eq('codigo', cod)
        .eq('status', 'pendente')
        .single();

      if (errP || !par) {
        throw new Error('Código do Totem não localizado ou já vinculado. Verifique a TV da quadra.');
      }

      // 2. Gera token oficial
      const tokenGerado = `fox_tok_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;

      // 3. Cadastra o dispositivo
      const { error: errD } = await supabase
        .from('dispositivos')
        .insert([{
          quadra_id: quadraSelecionadaModal,
          token_autenticacao: tokenGerado
        }]);

      if (errD) throw errD;

      // 4. Marca pareamento como ativo
      const { error: errU } = await supabase
        .from('pareamentos')
        .update({
          status: 'vinculado',
          token_gerado: tokenGerado,
          quadra_id: quadraSelecionadaModal
        })
        .eq('id', par.id);

      if (errU) throw errU;

      exibirToast('Totem vinculado e ativado com sucesso na quadra!');
      setModalPareamentoAberto(false);
      setCodigoTotem('');
      await recarregarDados();
    } catch (err) {
      exibirToast(err.message || 'Erro ao parear totem.');
    } finally {
      setAtivandoTotem(false);
    }
  };

  // Cálculos rápidos de métricas
  const totalQuadras = arenas.reduce((acc, a) => acc + (a.quadras?.length || 0), 0);
  const totalDispositivos = arenas.reduce(
    (acc, a) => acc + (a.quadras?.reduce((accQ, q) => accQ + (q.dispositivos?.length || 0), 0) || 0),
    0
  );

  // Lista de quadras da arena selecionada no modal
  const arenaAtualModal = arenas.find((a) => a.id === arenaSelecionadaModal);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 pb-20">
      {/* HEADER TÉCNICO NOC (SUPER ADMIN) */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <IconShield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm uppercase tracking-wider text-white">
                  Fox Replay <span className="text-amber-500">NOC</span>
                </h1>
                <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                Torre de Controle Global &bull; {usuarioAdmin?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (arenas.length > 0) {
                  setArenaSelecionadaModal(arenas[0].id);
                  if (arenas[0].quadras?.length > 0) {
                    setQuadraSelecionadaModal(arenas[0].quadras[0].id);
                  }
                }
                setModalPareamentoAberto(true);
              }}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <IconRadio className="w-3.5 h-3.5" />
              <span>Vincular Totem na Quadra</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              Ver Portal
            </button>
          </div>
        </div>
      </header>

      {/* TOAST FLUTUANTE */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-700 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl animate-fadeIn flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* PAINEL CENTRAL */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* CARDS DE MÉTRICAS GLOBAIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Arenas Parceiras
            </span>
            <span className="text-3xl font-black text-white">{arenas.length}</span>
            <p className="text-[11px] text-zinc-500">Complexos cadastrados</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Quadras Monitoradas
            </span>
            <span className="text-3xl font-black text-white">{totalQuadras}</span>
            <p className="text-[11px] text-zinc-500">Criadas pelos complexos</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Totens Pareados
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{totalDispositivos}</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Hardware Ativo</span>
            </div>
            <p className="text-[11px] text-zinc-500">Tokens oficiais vinculados</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Replays Gravados
            </span>
            <span className="text-3xl font-black text-white">{totalReplays}</span>
            <p className="text-[11px] text-zinc-500">Vídeos na rede Fox Replay</p>
          </div>
        </div>

        {/* TABELA DE OPERAÇÃO DE HARDWARE */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <IconBuilding className="w-4 h-4 text-amber-500" />
                <span>Complexos Esportivos &bull; Validação e Pareamento</span>
              </h3>
              <p className="text-xs text-zinc-400 font-normal">
                Arenas cadastradas pelos clientes. Valide as quadras disponíveis e vincule os totens físicos.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
              {arenas.length} complexos registrados
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {arenas.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <IconCpu className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold uppercase text-zinc-400">Nenhum complexo esportivo registrado</p>
                <p className="text-[11px] text-zinc-600 max-w-sm mx-auto">
                  Assim que um dono de arena finalizar o registro no site, a arena e as quadras aparecerão aqui para vinculação.
                </p>
              </div>
            ) : (
              arenas.map((arena) => {
                const limiteQuadras = arena.limite_quadras || 2;
                const totalQuadrasArena = arena.quadras?.length || 0;
                const totalAtivas = arena.quadras?.filter(q => q.dispositivos && q.dispositivos.length > 0).length || 0;

                return (
                  <div key={arena.id} className="p-6 space-y-4 hover:bg-zinc-900/40 transition-colors">
                    {/* CABEÇALHO DA ARENA */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="text-base font-black text-white uppercase">{arena.nome}</h4>
                          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                            {arena.cidade || 'Sem cidade'} {arena.estado ? `• ${arena.estado}` : ''}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            Cota: {totalQuadrasArena}/{limiteQuadras} quadras
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                            {arena.plano_nome || 'Plano Padrão'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          ID: {arena.id} &bull; Totens Ativos: {totalAtivas}/{totalQuadrasArena}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/arena/${arena.id}`)}
                          className="text-xs font-semibold text-zinc-400 hover:text-amber-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <IconLink className="w-3.5 h-3.5" />
                          <span>Abrir Feed</span>
                        </button>
                      </div>
                    </div>

                    {/* LISTA DE QUADRAS DA ARENA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {(arena.quadras || []).length === 0 ? (
                        <div className="col-span-full p-4 rounded-2xl bg-zinc-950/40 border border-dashed border-zinc-800 text-center">
                          <p className="text-xs text-zinc-500">
                            O proprietário ainda não cadastrou nenhuma quadra no painel dele.
                          </p>
                        </div>
                      ) : (
                        (arena.quadras || []).map((quadra) => {
                          const temDispositivo = quadra.dispositivos && quadra.dispositivos.length > 0;
                          const disp = temDispositivo ? quadra.dispositivos[0] : null;

                          return (
                            <div
                              key={quadra.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                temDispositivo
                                  ? 'bg-zinc-950/80 border-emerald-500/20 hover:border-emerald-500/40'
                                  : 'bg-zinc-950/40 border-amber-500/20 hover:border-amber-500/40'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Quadra</span>
                                  <h5 className="text-xs font-black text-white uppercase">{quadra.nome}</h5>
                                </div>
                                {temDispositivo ? (
                                  <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>Totem Ativo</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <span>Sem Totem</span>
                                  </span>
                                )}
                              </div>

                              {temDispositivo ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-zinc-400 block truncate">
                                    Token: <code className="text-zinc-300">{disp.token_autenticacao}</code>
                                  </span>
                                  <span className="text-[9px] text-zinc-500 block">
                                    Vinculado em: {new Date(disp.criado_em).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              ) : (
                                <div className="pt-2">
                                  <button
                                    onClick={() => {
                                      setArenaSelecionadaModal(arena.id);
                                      setQuadraSelecionadaModal(quadra.id);
                                      setModalPareamentoAberto(true);
                                    }}
                                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <IconRadio className="w-3 h-3" />
                                    <span>Vincular Totem da Quadra</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE ATIVAÇÃO MASTER DE TOTEM */}
      {modalPareamentoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IconRadio className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Vincular Totem à Quadra (Master)
                </h3>
              </div>
              <button
                onClick={() => setModalPareamentoAberto(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-normal leading-relaxed">
              Você está ativando como Super Admin. Selecione a arena e a quadra onde o totem foi instalado e digite os 6 dígitos exibidos na TV da quadra.
            </p>

            <form onSubmit={handleAtivarTotemMaster} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  1. Complexo Esportivo
                </label>
                <select
                  value={arenaSelecionadaModal}
                  onChange={(e) => {
                    setArenaSelecionadaModal(e.target.value);
                    const a = arenas.find((item) => item.id === e.target.value);
                    if (a?.quadras?.length > 0) {
                      setQuadraSelecionadaModal(a.quadras[0].id);
                    } else {
                      setQuadraSelecionadaModal('');
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {arenas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.cidade || 'SP'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  2. Quadra Específica
                </label>
                {quadrasArenaModal.length === 0 ? (
                  <p className="text-xs text-amber-500 font-bold p-2 bg-amber-500/10 rounded-xl">
                    Esta arena não possui quadras cadastradas.
                  </p>
                ) : (
                  <select
                    value={quadraSelecionadaModal}
                    onChange={(e) => setQuadraSelecionadaModal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {quadrasArenaModal.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  3. Código de 6 Dígitos da TV do Totem
                </label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={codigoTotem}
                  onChange={(e) => setCodigoTotem(e.target.value)}
                  placeholder="Ex: 852-149"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 text-center text-lg font-black tracking-widest uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={ativandoTotem || !quadraSelecionadaModal}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
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
