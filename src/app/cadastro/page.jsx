'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function CadastroArena() {
    const [nomeArena, setNomeArena] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const router = useRouter();

    const gerarSlug = (texto) => {
        return texto
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000); // Adiciona 4 números para evitar conflito de nomes iguais em cidades diferentes!
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            // 1. CRIA O USUÁRIO NO SUPABASE AUTH (E-mail e Senha)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });

            if (authError) throw authError;

            const usuarioLogado = authData?.user;
            if (!usuarioLogado) throw new Error('Erro ao criar credenciais de acesso.');

            // 2. SALVA A ARENA VINCULADA A ESSE USUÁRIO
            const slugGerado = gerarSlug(nomeArena);
            const { data: arenaData, error: arenaError } = await supabase
                .from('arenas')
                .insert([{
                    nome: nomeArena,
                    slug: slugGerado,
                    usuario_id: usuarioLogado.id
                }])
                .select()
                .single();

            if (arenaError) throw arenaError;

            setMensagem({ tipo: 'sucesso', texto: 'Conta e Arena criadas com sucesso! Entrando...' });

            // Salva o ID da arena localmente
            localStorage.setItem('fox_arena_id', arenaData.id);

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err) {
            setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao efetuar cadastro.' });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] font-sans p-6">
            <div className="w-full max-w-[450px] bg-[#141414] p-8 rounded-2xl border border-gray-800 shadow-2xl">

                <h1 className="text-3xl font-extrabold text-white tracking-widest text-center mb-2">
                    FOX <span className="text-[#00ff66]">REPLAY</span>
                </h1>
                <p className="text-gray-400 text-sm text-center mb-8">
                    Crie sua conta administrativa do FOX REPLAY.
                </p>

                <form onSubmit={handleCadastro} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                            Nome da Arena / Complexo
                        </label>
                        <input
                            type="text"
                            required
                            value={nomeArena}
                            onChange={(e) => setNomeArena(e.target.value)}
                            placeholder="Ex: Arena Beach Point"
                            className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00ff66]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                            E-mail de Login
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
                            Senha de Acesso
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="No mínimo 6 caracteres"
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
                        {carregando ? 'Criando Conta... ⏳' : 'Cadastrar Arena 🚀'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Já tem uma conta? <span onClick={() => router.push('/login')} className="text-[#00ff66] cursor-pointer hover:underline">Faça Login</span>
                </p>
            </div>
        </div>
    );
}