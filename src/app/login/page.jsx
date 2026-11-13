'use client';

import React, { useState, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function ConteudoLogin() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const router = useRouter();
    const searchParams = useSearchParams();
    const motivo = searchParams.get('motivo');

    const handleLogin = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (authError) throw authError;

            const usuarioLogado = authData?.user;
            if (!usuarioLogado) throw new Error('Usuário não encontrado.');

            const { data: arenasData, error: arenaError } = await supabase
                .from('arenas')
                .select('id')
                .eq('usuario_id', usuarioLogado.id);

            if (arenaError || !arenasData || arenasData.length === 0) {
                // Se for atleta, redireciona silenciosamente para o perfil
                if (usuarioLogado.user_metadata?.tipo_usuario === 'atleta') {
                    router.replace('/perfil');
                    return;
                }
                throw new Error('Nenhuma Arena encontrada para este usuário. Faça o cadastro primeiro.');
            }

            setMensagem({ tipo: 'sucesso', texto: 'Acesso autorizado! Entrando no painel...' });

            const idSalvo = localStorage.getItem('fox_arena_id');
            const idValido = arenasData.find(a => a.id === idSalvo);

            if (!idValido) {
                localStorage.setItem('fox_arena_id', arenasData[0].id);
            }

            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (err) {
            setMensagem({ tipo: 'erro', texto: err.message || 'E-mail ou senha incorretos.' });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 relative overflow-hidden">
            {/* LINHAS DE GRADE E AMBIÊNCIA */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[420px] bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl relative z-10 space-y-6">
                {/* BRAND LOGO */}
                <div className="flex flex-col items-center justify-center gap-3 select-none">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-12 w-12 object-cover rounded-xl border border-zinc-200 shadow-sm bg-white"
                    />
                    <div className="text-center">
                        <h1 className="text-xl font-black text-zinc-900 tracking-widest uppercase leading-none">
                            FOX <span className="text-amber-500">REPLAY</span>
                        </h1>
                        <p className="text-zinc-500 text-xs font-semibold mt-1">
                            Painel Administrativo da Arena
                        </p>
                    </div>
                </div>

                {/* BANNER SE VEIO REDIRECIONADO */}
                {motivo === 'gestor' && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Área Administrativa • Acesso restrito a Gestores e Donos de Complexos Esportivos.</span>
                    </div>
                )}

                {/* FORMULÁRIO */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            E-mail Administrativo
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="gestor@suaarena.com"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            Senha de Acesso
                        </label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Sua senha de gestor"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-3 rounded-xl text-xs font-medium border ${
                            mensagem.tipo === 'sucesso'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full py-3.5 mt-2 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
                    >
                        {carregando ? 'Autenticando...' : 'Acessar Painel da Arena'}
                    </button>
                </form>

                {/* LINK PARA ATLETAS & SUPORTE */}
                <div className="space-y-3 pt-2 border-t border-zinc-100 text-center text-xs">
                    <p className="text-zinc-500">
                        Você é atleta e quer ver suas jogadas?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/entrar')}
                            className="text-amber-600 hover:text-amber-700 font-bold underline"
                        >
                            Espaço do Atleta ➔
                        </button>
                    </p>
                    <p>
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-zinc-400 hover:text-zinc-700 font-medium text-[11px]"
                        >
                            ← Voltar à Página Inicial
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginArena() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs text-zinc-400">Carregando...</div>}>
            <ConteudoLogin />
        </Suspense>
    );
}
