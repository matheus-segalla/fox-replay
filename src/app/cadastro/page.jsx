'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function CadastroArena() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
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
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: senha,
                options: {
                    data: {
                        tipo_usuario: 'gestor_arena'
                    }
                }
            });

            if (authError) throw authError;

            const novoUsuario = authData?.user;
            if (!novoUsuario) throw new Error('Não foi possível gerar as credenciais de autenticação.');

            const slugGerado = gerarSlug(nome);

            const { data: arenaData, error: dbError } = await supabase
                .from('arenas')
                .insert([{
                    nome: nome.trim(),
                    slug: slugGerado,
                    usuario_id: novoUsuario.id,
                    cidade: cidade.trim() || null,
                    estado: estado.trim().toUpperCase() || null
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            // Gera Quadra 1 padrão para o complexo
            if (arenaData?.id) {
                await supabase
                    .from('quadras')
                    .insert([{ arena_id: arenaData.id, nome: 'Quadra 1' }]);
            }

            setMensagem({ tipo: 'sucesso', texto: 'Complexo cadastrado com sucesso! Redirecionando...' });

            setTimeout(() => {
                router.push('/login');
            }, 1500);

        } catch (err) {
            setMensagem({ tipo: 'erro', texto: err.message || 'Houve uma falha interna no registro.' });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 relative overflow-hidden">
            {/* LINHAS DE GRADE E AMBIÊNCIA */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[440px] bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl relative z-10 space-y-6">
                <div className="flex flex-col items-center justify-center gap-2 select-none text-center">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-11 w-11 object-cover rounded-xl border border-zinc-200 shadow-xs bg-white"
                    />
                    <h1 className="text-xl font-black text-zinc-900 tracking-widest uppercase mt-1">
                        CREDENCIAR <span className="text-amber-500">ARENA</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-normal">
                        Exclusivo para Proprietários e Gestores de Complexos Esportivos
                    </p>
                </div>

                <form onSubmit={handleCadastro} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            Nome do Complexo
                        </label>
                        <input
                            type="text"
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Arena Sunset Beach"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                                Cidade
                            </label>
                            <input
                                type="text"
                                required
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                                placeholder="Campinas"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs font-medium transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                                UF
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={2}
                                value={estado}
                                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                                placeholder="SP"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-center uppercase placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            E-mail Administrativo do Gestor
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
                            minLength={6}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Mínimo de 6 caracteres"
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
                        {carregando ? 'Processando...' : 'Finalizar Credenciamento'}
                    </button>
                </form>

                <div className="space-y-2 pt-2 border-t border-zinc-100 text-center text-xs">
                    <p className="text-zinc-500">
                        Já possui conta de arena?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="text-amber-600 hover:text-amber-700 font-bold underline"
                        >
                            Fazer Login ➔
                        </button>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                        Você é atleta e quer assistir seus replays?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/entrar')}
                            className="text-zinc-700 hover:underline font-semibold"
                        >
                            Espaço do Atleta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
