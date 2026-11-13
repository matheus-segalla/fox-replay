'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const OPCOES_QUADRAS = [
    { quantidade: 1, label: '1 Quadra', descricao: 'Totem Solo' },
    { quantidade: 2, label: '2 Quadras', descricao: 'Recomendado' },
    { quantidade: 3, label: '3 Quadras', descricao: 'Média Arena' },
    { quantidade: 4, label: '4 Quadras', descricao: 'Complexo' },
    { quantidade: 6, label: '6+ Quadras', descricao: 'Rede / Franquia' }
];

export default function CadastroArena() {
    const [quantidadeQuadras, setQuantidadeQuadras] = useState(2);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('SP');
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
            // 1. Cria a conta no Supabase Auth com tipo gestor_arena
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
            const nomePlano = `${quantidadeQuadras} ${quantidadeQuadras === 1 ? 'Quadra' : 'Quadras'}`;

            // 2. Insere a arena com a cota contratada e sem quadras fakes
            const { data: arenaData, error: dbError } = await supabase
                .from('arenas')
                .insert([{
                    nome: nome.trim(),
                    slug: slugGerado,
                    usuario_id: novoUsuario.id,
                    cidade: cidade.trim() || null,
                    estado: estado.trim().toUpperCase() || 'SP',
                    limite_quadras: quantidadeQuadras,
                    plano_nome: `Plano ${nomePlano}`
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            if (arenaData?.id) {
                localStorage.setItem('fox_arena_id', arenaData.id);
            }

            setMensagem({
                tipo: 'sucesso',
                texto: 'Complexo cadastrado com sucesso! Redirecionando para o painel de quadras...'
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 1200);

        } catch (err) {
            setMensagem({
                tipo: 'erro',
                texto: err.message || 'Houve uma falha ao realizar o cadastro. Tente novamente.'
            });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 relative overflow-hidden">
            {/* LINHAS DE GRADE E AMBIÊNCIA */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[520px] bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200 shadow-xl relative z-10 space-y-6">
                {/* CABEÇALHO */}
                <div className="flex flex-col items-center justify-center text-center">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-11 w-11 object-cover rounded-xl border border-zinc-200 shadow-xs bg-white mb-2"
                    />
                    <span className="text-[10px] font-mono tracking-widest text-amber-600 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold mb-2">
                        B2B &bull; Onboarding de Complexo
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-wider uppercase">
                        CREDENCIAR <span className="text-amber-500">SUA ARENA</span>
                    </h1>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed max-w-sm">
                        Escolha a quantidade de quadras, configure sua arena e acesse o painel para nomear as quadras.
                    </p>
                </div>

                <form onSubmit={handleCadastro} className="space-y-4">
                    {/* SELETOR DE COTA / QUANTIDADE DE QUADRAS */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                            1. Quantidade de Quadras Contratadas
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {OPCOES_QUADRAS.map((opcao) => {
                                const selecionado = quantidadeQuadras === opcao.quantidade;
                                return (
                                    <button
                                        type="button"
                                        key={opcao.quantidade}
                                        onClick={() => setQuantidadeQuadras(opcao.quantidade)}
                                        className={`p-2.5 rounded-xl border text-center transition-all ${
                                            selecionado
                                                ? 'bg-amber-500/15 border-amber-500 text-zinc-950 font-bold shadow-xs'
                                                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                                        }`}
                                    >
                                        <span className="block text-xs font-black">{opcao.label}</span>
                                        <span className="block text-[9px] text-zinc-400 mt-0.5 truncate">{opcao.descricao}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* DADOS DA ARENA */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            2. Nome do Complexo Esportivo
                        </label>
                        <input
                            type="text"
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Arena Sunset Beach Tennis"
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

                    {/* DADOS DE ACESSO DO GESTOR */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            3. E-mail Administrativo do Gestor
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
                            placeholder="Mínimo de 6 dígitos"
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
                        className="w-full py-3.5 mt-2 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>{carregando ? 'Registrando Arena...' : 'Finalizar Registro e Configurar Quadras'}</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </form>

                {/* RODAPÉ E NAVEGAÇÃO */}
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
