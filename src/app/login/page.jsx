'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginArena() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const router = useRouter();

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
                throw new Error('Nenhuma Arena encontrada para este usuário. Faça o cadastro primeiro.');
            }

            setMensagem({ tipo: 'sucesso', texto: 'Acesso autorizado! Entrando no painel... ⚡' });

            const idSalvo = localStorage.getItem('fox_arena_id');
            const idValido = arenasData.find(a => a.id === idSalvo);

            if (!idValido) {
                localStorage.setItem('fox_arena_id', arenasData[0].id);
            }

            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (err) {
            setMensagem({ tipo: 'erro', texto: err.message || 'E-mail ou senha incorretos.' });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 relative overflow-hidden">

            {/* 🌐 LINHAS DE GRADE E GLOWS AMBIENTAIS (Estilo Supabase Tech) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[420px] bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl relative z-10">

                {/* BRAND LOGO */}
                <div className="flex flex-col items-center justify-center gap-3 select-none mb-6">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-12 w-12 object-cover rounded-xl border border-zinc-200 shadow-sm bg-white"
                    />
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-zinc-900 tracking-widest uppercase leading-none">
                            FOX <span className="text-amber-500">REPLAY</span>
                        </h1>
                        <p className="text-zinc-400 text-xs font-semibold mt-2">
                            Gestão e Monitoramento de Quadras
                        </p>
                    </div>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                            E-mail Administrativo
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@suaarena.com"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
                            Senha de Acesso
                        </label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-xl text-xs font-semibold border ${mensagem.tipo === 'sucesso'
                            ? 'bg-amber-500/5 text-amber-600 border-amber-500/20'
                            : 'bg-red-500/5 text-red-500 border-red-500/10'
                            }`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full py-3.5 mt-2 text-white font-black text-xs uppercase tracking-widest rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md shadow-amber-500/10"
                    >
                        {carregando ? 'Autenticando dados... ⏳' : 'Entrar no Painel ➔'}
                    </button>
                </form>

                <p className="text-center text-xs text-zinc-400 mt-6 font-medium">
                    Sua quadra ainda não faz parte?{' '}
                    <span
                        onClick={() => router.push('/cadastro')}
                        className="text-amber-500 font-bold cursor-pointer hover:underline transition-all"
                    >
                        Cadastre-se Grátis
                    </span>
                </p>
            </div>
        </div>
    );
}