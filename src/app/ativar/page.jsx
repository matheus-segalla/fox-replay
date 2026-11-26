'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { isSuperAdmin } from '../../lib/auth';
import AppHeader from '@/components/AppHeader';
import CustomSelect from '@/components/CustomSelect';

function ConteudoAtivarTecnico() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codigoUrl = searchParams.get('codigo') || '';

  const [arenas, setArenas] = useState([]);
  const [arenaSelecionada, setArenaSelecionada] = useState('');
  const [quadras, setQuadras] = useState([]);
  const [quadraSelecionada, setQuadraSelecionada] = useState('');
  const [codigo, setCodigo] = useState(codigoUrl);
  const [cameraUrl, setCameraUrl] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [ativando, setAtivando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Restrito estritamente ao Super Admin / Técnico Fox Replay
  useEffect(() => {
    async function carregarTecnico() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (codigoUrl) sessionStorage.setItem('fox_codigo_ativacao', codigoUrl);
          const destino = codigoUrl
            ? `/ativar?codigo=${encodeURIComponent(codigoUrl)}`
            : '/ativar';
          router.replace(`/entrar?motivo=gestor&redirect=${encodeURIComponent(destino)}`);
          return;
        }

        if (!isSuperAdmin(session.user)) {
          router.replace('/perfil');
          return;
        }

        const { data: arenasData, error: errA } = await supabase
          .from('arenas')
          .select('id, nome, cidade')
          .order('nome', { ascending: true });

        if (errA) throw errA;
        setArenas(arenasData || []);

        if (arenasData && arenasData.length > 0) {
          setArenaSelecionada(arenasData[0].id);
        }

        const salvo = sessionStorage.getItem('fox_codigo_ativacao');
        if (salvo) {
          setCodigo(salvo);
          sessionStorage.removeItem('fox_codigo_ativacao');
        }
      } catch (err) {
        console.error(err);
        router.replace('/admin');
      } finally {
        setCarregando(false);
      }
    }

    carregarTecnico();
  }, [router, codigoUrl]);

  useEffect(() => {
    if (!arenaSelecionada) return;
    let cancelado = false;
    async function carregarQuadras() {
      const { data } = await supabase
        .from('quadras')
        .select('id, nome')
        .eq('arena_id', arenaSelecionada)
        .order('nome', { ascending: true });

      if (!cancelado) {
        setQuadras(data || []);
        setQuadraSelecionada(data?.[0]?.id || '');
      }
    }
    carregarQuadras();
    return () => {
      cancelado = true;
    };
  }, [arenaSelecionada]);

  const handleAtivar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    if (!codigo.trim() || !quadraSelecionada) {
      setMensagem({ tipo: 'erro', texto: 'Informe o código da TV e selecione a quadra.' });
      return;
    }

    setAtivando(true);
    try {
      let codLimpo = codigo.trim().toUpperCase();
      if (codLimpo.length === 6 && !codLimpo.includes('-')) {
        codLimpo = `${codLimpo.substring(0, 3)}-${codLimpo.substring(3, 6)}`;
      }

      const { error: errRpc } = await supabase.rpc('vincular_totem_por_codigo', {
        p_codigo: codLimpo,
        p_quadra_id: quadraSelecionada,
        p_camera_url: cameraUrl.trim() || null,
      });

      if (errRpc) {
        throw new Error(
          errRpc.message || 'Código inválido, expirado ou já vinculado. Verifique a TV da quadra.'
        );
      }

      setMensagem({
        tipo: 'sucesso',
        texto: 'Totem pareado com sucesso! O equipamento iniciará a gravação automaticamente.',
      });
      setTimeout(() => router.push('/admin'), 2000);
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao ativar totem.' });
    } finally {
      setAtivando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="animate-pulse text-amber-500 font-bold text-xs uppercase tracking-wider">
            Verificando credenciais técnicas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-white font-sans flex flex-col justify-between relative overflow-x-hidden safe-pb">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      <AppHeader theme="dark" activeRoute="admin" badge="Ativação em Campo" showLogout={true} />

      <main className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-black uppercase text-white tracking-wider">
                Ativação Técnica de Totem
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium">
                Uso exclusivo da equipe Fox Replay
              </p>
            </div>
          </div>

          <form onSubmit={handleAtivar} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Complexo Esportivo
              </label>
              <CustomSelect
                theme="dark"
                value={arenaSelecionada}
                onChange={(val) => setArenaSelecionada(val)}
                ariaLabel="Complexo Esportivo"
                buttonClassName="py-3 font-bold"
                options={arenas.map((a) => ({
                  value: a.id,
                  label: `${a.nome}${a.cidade ? ` (${a.cidade})` : ''}`,
                }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Quadra deste Totem
              </label>
              {quadras.length === 0 ? (
                <p className="text-xs text-red-400 font-bold">
                  Nenhuma quadra cadastrada nesta arena.
                </p>
              ) : (
                <CustomSelect
                  theme="dark"
                  value={quadraSelecionada}
                  onChange={(val) => setQuadraSelecionada(val)}
                  ariaLabel="Quadra deste Totem"
                  buttonClassName="py-3 font-bold"
                  options={quadras.map((q) => ({
                    value: q.id,
                    label: q.nome,
                  }))}
                />
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Código na TV do Totem (6 dígitos)
              </label>
              <input
                type="text"
                required
                maxLength={7}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: 852-149"
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border-2 border-zinc-800 text-amber-400 text-center text-xl font-black tracking-widest uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                URL Câmera IP / RTSP (Opcional)
              </label>
              <input
                type="text"
                value={cameraUrl}
                onChange={(e) => setCameraUrl(e.target.value)}
                placeholder="rtsp://admin:senha@192.168.1.64:554/Streaming/Channels/101"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {mensagem.texto && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  mensagem.tipo === 'sucesso'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                {mensagem.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={ativando || quadras.length === 0}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {ativando ? 'Vinculando Equipamento...' : 'Ativar Totem na Quadra ➔'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-zinc-800">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-bold cursor-pointer"
            >
              ← Voltar para Torre NOC (/admin)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaginaAtivar() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
          <p className="animate-pulse text-zinc-500 text-xs uppercase tracking-widest font-bold">
            Inicializando Ativador...
          </p>
        </div>
      }
    >
      <ConteudoAtivarTecnico />
    </Suspense>
  );
}
