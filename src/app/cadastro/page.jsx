'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function CadastroArena() {
    const [nomeArena, setNomeArena] = useState('');
    const [cidade, setCidade] = useState(''); // Novo Estado para Cidade
    const [estado, setEstado] = useState(''); // Novo Estado para Estado
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
            .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            // 1. Cria a conta de autenticação segura do dono da arena
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });

            if (authError) throw authError;

            const usuarioLogado = authData?.user;
            if (!usuarioLogado) throw new Error('Erro ao criar credenciais de acesso.');

            // 2. Insere os dados da Arena injetando nativamente a Cidade e o Estado para indexação na busca
            const slugGerado = gerarSlug(nomeArena);
            const { data: arenaData, error: arenaError } = await supabase
                .from('arenas')
                .insert([{
                    nome: nomeArena,
                    slug: slugGerado,
                    usuario_id: usuarioLogado.id,
                    cidade: cidade.trim(),
                    estado: estado.trim().toUpperCase() // Força sigla em maiúsculas (Ex: SP, RJ, SC)
                }])
                .select()
                .single();

            if (arenaError) throw arenaError;

            setMensagem({ tipo: 'sucesso', texto: 'Arena integrada com sucesso! Configurando painel... 🛠️' });
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg-main font-sans p-6 relative overflow-hidden">
            {/* Luzes de fundo sutis (Glow) */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold-glow rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[430px] bg-bg-card p-8 rounded-2xl border border-border-card shadow-2xl relative z-10">

                {/* 🦊 HEADER DO CREDENCIAMENTO COM LOGO COMPACTA OFICIAL */}
                <div className="flex flex-col items-center justify-center gap-3 select-none mb-6">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-12 w-12 object-cover rounded-xl border border-border-card shadow-lg bg-neutral-900"
                    />
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-widest text-white uppercase leading-none">
                            FOX <span className="text-gold">REPLAY</span>
                        </h1>
                        <p className="text-gray-500 text-[11px] font-medium mt-2">
                            Credenciamento de Novas Arenas e Complexos
                        </p>
                    </div>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleCadastro} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                            Nome da Arena / Complexo
                        </label>
                        <input
                            type="text"
                            required
                            value={nomeArena}
                            onChange={(e) => setNomeArena(e.target.value)}
                            placeholder="Ex: Arena Ponto Beach"
                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                        />
                    </div>

                    {/* 📍 GRID INTELIGENTE: CIDADE E ESTADO ALINHADOS LADO A LADO */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                Cidade
                            </label>
                            <input
                                type="text"
                                required
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                                placeholder="Ex: Sorocaba"
                                className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                                UF / Estado
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={2}
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                placeholder="SP"
                                className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm text-center uppercase transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                            E-mail Corporativo
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contato@suaarena.com"
                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-card text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-silver mb-2 uppercase tracking-widest">
                            Senha do Administrador
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="No mínimo 6 dígitos"
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
                        {carregando ? 'Registrando informações... ⏳' : 'Ativar Nosso Sistema 🚀'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Já possui um totem cadastrado?{' '}
                    <span
                        onClick={() => router.push('/login')}
                        className="text-gold font-bold cursor-pointer hover:underline transition-all"
                    >
                        Fazer Login
                    </span>
                </p>
            </div>
        </div>
    );
}