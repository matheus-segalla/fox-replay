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
            // 1. Faz a autenticação mestre nos servidores do Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (authError) throw authError;

            const usuarioLogado = authData?.user;
            if (!usuarioLogado) throw new Error('Usuário não encontrado.');

            // 🚀 CORREÇÃO CRÍTICA: Trocamos o .single() por uma listagem padrão para aceitar donos com múltiplas arenas/filiais
            const { data: arenasData, error: arenaError } = await supabase
                .from('arenas')
                .select('id')
                .eq('usuario_id', usuarioLogado.id);

            if (arenaError || !arenasData || arenasData.length === 0) {
                throw new Error('Nenhuma Arena encontrada para este usuário. Faça o cadastro primeiro.');
            }

            setMensagem({ tipo: 'sucesso', texto: 'Acesso autorizado! Entrando no painel... ⚡' });
            
            // Define a primeira arena como a ativa por padrão no localStorage se não houver nenhuma salva
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg-main font-sans p-6 relative overflow-hidden">
            {/* Luzes de fundo sutis (Glow) */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold-glow rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[430px] bg-bg-card p-8 rounded-2xl border border-border-card shadow-2xl relative z-10">

                {/* LOGO METÁLICA */}
                <div className="flex flex-col items-center justify-center gap-3 select-none mb-6">
                    <img 
                        src="/logo-fox.jpeg" 
                        alt="Logo Fox Replay" 
                        className="h-12 w-12 object-cover rounded-xl border border-border-card shadow-lg bg-neutral-900"
                    />
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase leading-none">
                            FOX <span className="text-gold">REPLAY</span>
                        </h1>
                        <p className="text-gray-500 text-[11px] font-medium mt-2">
                            Gestão e Monitoramento de Quadras Esportivas
                        </p>
                    </div>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                            E-mail Administrativo
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@suaarena.com"
                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                            Senha de Acesso
                        </label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-xl text-xs font-semibold border ${mensagem.tipo === 'sucesso'
                                ? 'bg-gold/5 text-gold border-gold/20'
                                : 'bg-red-500/5 text-red-400 border-red-500/10'
                            }`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full py-4 mt-2 text-black font-black text-sm rounded-xl bg-gold hover:bg-gold-dark active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-gold-glow"
                    >
                        {carregando ? 'Autenticando dados... ⏳' : 'Entrar no Painel ➔'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-8">
                    Sua quadra ainda não faz parte?{' '}
                    <span
                        onClick={() => router.push('/cadastro')}
                        className="text-gold font-bold cursor-pointer hover:underline transition-all"
                    >
                        Cadastre-se Grátis
                    </span>
                </p>
            </div>
        </div>
    );
}
