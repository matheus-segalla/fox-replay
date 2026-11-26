'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { isSuperAdmin, sanitizarRedirect } from '../../lib/auth';
import CustomSelect from '@/components/CustomSelect';

const IconMail = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconUser = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconArrowRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconArrowLeft = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

function FormularioEntrarUnificado() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const motivo = searchParams.get('motivo');

  const [modo, setModo] = useState('login'); // 'login' | 'cadastro' (cadastro aberto só para atletas)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [esporte, setEsporte] = useState('Beach Tennis');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Sincroniza os lances locais do localStorage com a conta autenticada
  const sincronizarFavoritosLocais = async (usuarioId) => {
    try {
      const salvosLocais = JSON.parse(localStorage.getItem('fox_lances_salvos') || '[]');
      if (!Array.isArray(salvosLocais) || salvosLocais.length === 0) return;

      const registros = salvosLocais
        .filter((item) => item?.id)
        .map((item) => ({
          usuario_id: usuarioId,
          replay_id: item.id,
        }));

      if (registros.length > 0) {
        await supabase.from('favoritos').upsert(registros, { onConflict: 'usuario_id,replay_id' });
      }
    } catch (e) {
      console.warn('Sincronização local opcional:', e);
    }
  };

  // Resolve automaticamente o destino ideal conforme o papel real do usuário
  const resolverDestinoPorPapel = useCallback(
    async (user) => {
      const superAdmin = isSuperAdmin(user);

      // Se veio com ?redirect= explícito e seguro, respeita (validando permissão de /admin)
      if (redirectParam) {
        const destinoSeguro = sanitizarRedirect(redirectParam, '/perfil');
        if (destinoSeguro.startsWith('/admin') && !superAdmin) {
          return '/perfil';
        }
        return destinoSeguro;
      }

      if (superAdmin) {
        return '/admin';
      }

      try {
        const { data: arenasUsuario } = await supabase
          .from('arenas')
          .select('id')
          .eq('usuario_id', user.id)
          .order('nome', { ascending: true });

        if (arenasUsuario && arenasUsuario.length > 0) {
          const idSalvo = localStorage.getItem('fox_arena_id');
          if (!idSalvo || !arenasUsuario.some((a) => a.id === idSalvo)) {
            localStorage.setItem('fox_arena_id', arenasUsuario[0].id);
          }
          return '/dashboard';
        }
      } catch {}

      return '/perfil';
    },
    [redirectParam]
  );

  // Se já estiver logado, redireciona automaticamente para o painel correto
  useEffect(() => {
    let cancelado = false;
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user && !cancelado) {
        const destino = await resolverDestinoPorPapel(session.user);
        if (!cancelado) router.replace(destino);
      }
    }
    verificarSessao();
    return () => {
      cancelado = true;
    };
  }, [router, resolverDestinoPorPapel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

        if (error) throw error;
        if (data?.user) {
          await sincronizarFavoritosLocais(data.user.id);
          const destino = await resolverDestinoPorPapel(data.user);
          setSucesso('Acesso autorizado! Redirecionando...');
          setTimeout(() => router.replace(destino), 450);
        }
      } else {
        // Cadastro público exclusivo para Atletas
        if (!nome.trim()) throw new Error('Por favor, informe seu nome completo.');

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: {
            data: {
              nome_completo: nome.trim(),
              esporte_favorito: esporte,
              tipo_usuario: 'atleta',
            },
          },
        });

        if (error) throw error;
        if (data?.user) {
          await sincronizarFavoritosLocais(data.user.id);
          const destino = sanitizarRedirect(redirectParam, '/perfil');
          setSucesso('Perfil de atleta criado com sucesso! Redirecionando...');
          setTimeout(() => router.replace(destino), 600);
        }
      }
    } catch (err) {
      setErro(err.message || 'E-mail ou senha incorretos. Verifique seus dados.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between relative overflow-x-hidden safe-pb">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER SIMPLES */}
      <header className="w-full max-w-5xl mx-auto px-6 py-4 flex justify-between items-center z-10">
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Início</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-fox.jpeg"
            alt="Fox Replay"
            width={28}
            height={28}
            priority
            className="w-7 h-7 object-cover rounded-lg border border-zinc-200"
          />
          <span className="text-sm font-black tracking-wider uppercase">
            FOX <span className="text-amber-500">REPLAY</span>
          </span>
        </Link>
      </header>

      {/* CONTAINER CENTRAL */}
      <main className="w-full max-w-md mx-auto px-5 py-8 z-10 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 space-y-6">
          {/* TOPO DO CARD */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full">
              <span>{modo === 'login' ? 'Acesso Único Fox Replay' : 'Conta Gratuita de Atleta'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight uppercase">
              {modo === 'login' ? 'Entrar na Plataforma' : 'Crie seu Perfil de Atleta'}
            </h1>
            <p className="text-xs text-zinc-500 font-normal">
              {modo === 'login'
                ? 'Atletas, gestores de arena e administradores entram aqui — você será levado automaticamente ao seu painel.'
                : 'Seus replays favoritados ficam permanentemente salvos na sua conta.'}
            </p>
          </div>

          {motivo === 'gestor' && modo === 'login' && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Use o e-mail e senha de Gestor ou Administrador para continuar.</span>
            </div>
          )}

          {/* ABAS SELETORAS */}
          <div className="flex bg-zinc-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all min-h-[42px] cursor-pointer active:scale-95 ${
                modo === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Já tenho conta
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('cadastro');
                setErro('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all min-h-[42px] cursor-pointer active:scale-95 ${
                modo === 'cadastro'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Sou Atleta (Criar Conta)
            </button>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium">
              {sucesso}
            </div>
          )}

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'cadastro' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      inputMode="text"
                      autoComplete="name"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Matheus Silva"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all min-h-[42px]"
                    />
                    <IconUser className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Esporte Principal
                  </label>
                  <CustomSelect
                    theme="light"
                    value={esporte}
                    onChange={(val) => setEsporte(val)}
                    ariaLabel="Esporte Principal"
                    buttonClassName="min-h-[42px]"
                    options={[
                      { value: 'Beach Tennis', label: 'Beach Tennis' },
                      { value: 'Futevôlei', label: 'Futevôlei' },
                      { value: 'Padel', label: 'Padel' },
                      { value: 'Tênis', label: 'Tênis' },
                      { value: 'Vôlei de Praia', label: 'Vôlei de Praia' },
                      { value: 'Futebol Society', label: 'Futebol Society' },
                      { value: 'Outro', label: 'Outro Esporte' },
                    ]}
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all min-h-[42px]"
                />
                <IconMail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all min-h-[42px]"
                />
                <IconLock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer min-h-[48px]"
            >
              <span>
                {carregando ? 'Processando...' : modo === 'login' ? 'Entrar' : 'Criar Meu Perfil'}
              </span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {modo === 'cadastro' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
              <span className="font-bold block">Proteção Permanente de Lances</span>
              <p className="text-amber-800/90 leading-relaxed font-normal">
                Os lances gerais da quadra expiram após 14 dias. Ao salvar com seu perfil, suas jogadas favoritas nunca são apagadas.
              </p>
            </div>
          )}

          {/* CTA COMERCIAL PARA NOVAS ARENAS */}
          <div className="text-center pt-2 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-500 font-medium">
              Quer levar o Fox Replay para o seu complexo esportivo?{' '}
              <Link href="/para-arenas#contato" className="text-amber-600 hover:text-amber-700 underline font-bold">
                Solicitar implantação ➔
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center z-10 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
        © {new Date().getFullYear()} FOX REPLAY • TECNOLOGIA ESPORTIVA
      </footer>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs text-zinc-400">
          Carregando...
        </div>
      }
    >
      <FormularioEntrarUnificado />
    </Suspense>
  );
}
