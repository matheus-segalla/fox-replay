'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Ícones SVG Minimalistas
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

const IconStar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

function FormularioEntrar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/perfil';

  const [modo, setModo] = useState('login'); // 'login' ou 'cadastro'
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
      if (salvosLocais.length === 0) return;

      const registros = salvosLocais.map((item) => ({
        usuario_id: usuarioId,
        replay_id: item.id
      }));

      // Tenta gravar na tabela favoritos (se tabela existir)
      await supabase.from('favoritos').upsert(registros, { onConflict: 'usuario_id,replay_id' });
    } catch (e) {
      console.warn('Sincronização local opcional:', e);
    }
  };

  // Se já estiver logado, redireciona
  useEffect(() => {
    async function verificarSessao() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push(redirectUrl);
      }
    }
    verificarSessao();
  }, [router, redirectUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha
        });

        if (error) throw error;
        if (data?.user) {
          await sincronizarFavoritosLocais(data.user.id);
          setSucesso('Acesso autorizado! Redirecionando...');
          setTimeout(() => router.push(redirectUrl), 600);
        }
      } else {
        // Modo cadastro de atleta
        if (!nome.trim()) throw new Error('Por favor, informe seu nome completo.');

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: {
            data: {
              nome_completo: nome.trim(),
              esporte_favorito: esporte,
              tipo_usuario: 'atleta'
            }
          }
        });

        if (error) throw error;
        if (data?.user) {
          await sincronizarFavoritosLocais(data.user.id);
          setSucesso('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => router.push(redirectUrl), 800);
        }
      }
    } catch (err) {
      setErro(err.message || 'Ocorreu um erro. Verifique seus dados.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* LINHAS DE GRADE E AMBIÊNCIA */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER SIMPLES */}
      <header className="w-full max-w-5xl mx-auto px-6 py-4 flex justify-between items-center z-10">
        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <img
            src="/logo-fox.jpeg"
            alt="Fox Replay"
            className="w-7 h-7 object-cover rounded-lg border border-zinc-200"
          />
          <span className="text-sm font-black tracking-wider uppercase">
            FOX <span className="text-amber-500">REPLAY</span>
          </span>
        </div>
      </header>

      {/* CONTAINER CENTRAL */}
      <main className="w-full max-w-md mx-auto px-5 py-8 z-10 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 space-y-6">
          {/* TOPO DO CARD */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full">
              <IconStar className="w-3.5 h-3.5 fill-amber-500" />
              <span>Espaço do Atleta</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight uppercase">
              {modo === 'login' ? 'Acesse seus Lances' : 'Crie seu Perfil de Atleta'}
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              {modo === 'login'
                ? 'Entre para visualizar suas jogadas salvas e mantê-las guardadas para sempre.'
                : 'Seus replays favoritados ficam permanentemente salvos na sua conta.'}
            </p>
          </div>

          {/* ABAS SELETORAS */}
          <div className="flex bg-zinc-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                modo === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('cadastro');
                setErro('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                modo === 'cadastro'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Criar Perfil
            </button>
          </div>

          {/* MENSAGENS DE ERRO OU SUCESSO */}
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
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Matheus Silva"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                    <IconUser className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Esporte Principal
                  </label>
                  <select
                    value={esporte}
                    onChange={(e) => setEsporte(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Beach Tennis">Beach Tennis</option>
                    <option value="Futevôlei">Futevôlei</option>
                    <option value="Padel">Padel</option>
                    <option value="Tênis">Tênis</option>
                    <option value="Vôlei de Praia">Vôlei de Praia</option>
                    <option value="Futebol Society">Futebol Society</option>
                    <option value="Outro">Outro Esporte</option>
                  </select>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
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
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
                <IconLock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              <span>{carregando ? 'Processando...' : modo === 'login' ? 'Entrar no Perfil' : 'Criar Meu Perfil'}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* VANTAGEM DE CRIAR CONTA */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
            <span className="font-bold block">Proteção Permanente de Lances</span>
            <p className="text-amber-800/90 leading-relaxed font-normal">
              Os lances gerais da quadra expiram após 14 dias. Ao salvar com seu perfil, suas jogadas favoritas nunca são apagadas.
            </p>
          </div>

          {/* LINK PARA GESTORES DE ARENA */}
          <div className="text-center pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
            >
              É gestor ou dono de complexo esportivo? <span className="underline font-bold">Acessar Painel da Arena</span>
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-4 text-center z-10 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
        © {new Date().getFullYear()} FOX REPLAY • TECNOLOGIA ESPORTIVA
      </footer>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs text-zinc-400">Carregando...</div>}>
      <FormularioEntrar />
    </Suspense>
  );
}
