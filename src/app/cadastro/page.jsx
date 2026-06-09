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
            });

            if (authError) throw authError;

            const novoUsuario = authData?.user;
            if (!novoUsuario) throw new Error('Não foi possível gerar as credenciais de autenticação.');

            const slugGerado = gerarSlug(nome);

            const { error: dbError } = await supabase
                .from('arenas')
                .insert([{
                    nome: nome.trim(),
                    slug: slugGerado,
                    usuario_id: novoUsuario.id,
                    cidade: cidade.trim() || null,
                    estado: estado.trim().toUpperCase() || null
                }]);

            if (dbError) throw dbError;

            setMensagem({ tipo: 'sucesso', texto: 'Conta e Arena criadas com absoluto sucesso! Redirecionando... 🚀' });

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err) {
            setMensagem({ tipo: 'erro', texto: err.message || 'Houve uma falha interna no registro.' });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 relative overflow-hidden">

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[440px] bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl relative z-10">

                <div className="flex flex-col items-center justify-center gap-2 select-none mb-6">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-11 w-11 object-cover rounded-xl border border-zinc-200 shadow-sm bg-white"
                    />
                    <h1 className="text-xl font-black text-zinc-900 tracking-widest uppercase mt-1">
                        CADASTRAR <span className="text-amber-500">ARENA</span>
                    </h1>
                </div>

                <form onSubmit={handleCadastro} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Nome do Complexo</label>
                        <input
                            type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Arena Fox Beach"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Cidade</label>
                            <input
                                type="text" required value={cidade} onChange={(e) => setCidade(e.target.value)}
                                placeholder="Ex: Campinas"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Estado</label>
                            <input
                                type="text" required maxLength={2} value={estado} onChange={(e) => setEstado(e.target.value)}
                                placeholder="SP"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-center uppercase placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">E-mail Administrativo</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="contato@suaarena.com"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Senha de Acesso</label>
                        <input
                            type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
                            placeholder="Crie uma senha segura"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 text-xs font-bold transition-all focus:outline-none focus:border-amber-500 focus:bg-white shadow-sm"
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-xl text-xs font-semibold border ${mensagem.tipo === 'sucesso' ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' : 'bg-red-500/5 text-red-500 border-red-500/10'}`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit" disabled={carregando}
                        className="w-full py-3.5 mt-2 text-white font-black text-xs uppercase tracking-widest rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md shadow-amber-500/10"
                    >
                        {carregando ? 'Processando credenciais... ⏳' : 'Finalizar Credenciamento 🚀'}
                    </button>
                </form>

                <p className="text-center text-xs text-zinc-400 mt-6 font-medium">
                    Já possui cadastro?{' '}
                    <span onClick={() => router.push('/login')} className="text-amber-500 font-bold cursor-pointer hover:underline">
                        Fazer Login
                    </span>
                </p>
            </div>
        </div>
    );
}