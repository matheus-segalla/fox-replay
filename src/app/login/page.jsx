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
            // 1. FAZ O LOGIN NO SUPABASE AUTH
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (authError) throw authError;

            const usuarioLogado = authData?.user;
            if (!usuarioLogado) throw new Error('Usuário não encontrado.');

            // 2. BUSCA A ARENA VINCULADA A ESSE USUÁRIO NO BANCO DE DADOS
            const { data: arenaData, error: arenaError } = await supabase
                .from('arenas')
                .select('id')
                .eq('usuario_id', usuarioLogado.id)
                .single();

            if (arenaError) {
                throw new Error('Nenhuma Arena encontrada para este usuário. Faça o cadastro primeiro.');
            }

            setMensagem({ tipo: 'sucesso', texto: 'Acesso autorizado! Entrando no painel...' });

            // Salva o ID da arena no navegador para o Dashboard ler
            localStorage.setItem('fox_arena_id', arenaData.id);

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] font-sans p-6">
            <div className="w-full max-w-[450px] bg-[#141414] p-8 rounded-2xl border border-gray-800 shadow-2xl">

                {/* LOGO */}
                <h1 className="text-3xl font-extrabold text-white tracking-widest text-center mb-2">
                    FOX <span className="text-[#00ff66]">REPLAY</span>
                </h1>
                <p className="text-gray-400 text-sm text-center mb-8">
                    Entre com suas credenciais para gerenciar suas quadras.
                </p>

                {/* FORMULÁRIO */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                            E-mail Administrativo
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seuemail@arena.com"
                            className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00ff66]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00ff66]"
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${mensagem.tipo === 'sucesso' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full py-4 mt-2 text-black font-bold text-base rounded-xl bg-[#00ff66] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#00ff66]/10"
                    >
                        {carregando ? 'Autenticando... ⏳' : 'Entrar no Sistema 🚀'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Ainda não tem uma conta? <span onClick={() => router.push('/cadastro')} className="text-[#00ff66] cursor-pointer hover:underline">Cadastre sua Arena</span>
                </p>
            </div>
        </div>
    );
}