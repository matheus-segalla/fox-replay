'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function ConteudoAtivar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const codigoUrl = searchParams.get('codigo') || '';

    const [usuario, setUsuario] = useState(null);
    const [arenas, setArenas] = useState([]);
    const [arenaSelecionada, setArenaSelecionada] = useState('');
    const [quadras, setQuadras] = useState([]);
    const [quadraSelecionada, setQuadraSelecionada] = useState('');
    const [codigo, setCodigo] = useState(codigoUrl);

    const [carregando, setCarregando] = useState(true);
    const [ativando, setAtivando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    // 1. Verifica autenticação
    useEffect(() => {
        async function carregarUsuario() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    // Guarda o código no sessionStorage para quando voltar do login
                    if (codigoUrl) sessionStorage.setItem('fox_codigo_ativacao', codigoUrl);
                    router.push('/login');
                    return;
                }
                setUsuario(session.user);

                // Carrega as arenas deste usuário
                const { data: arenasData, error: errA } = await supabase
                    .from('arenas')
                    .select('id, nome')
                    .eq('usuario_id', session.user.id)
                    .order('nome');

                if (errA) throw errA;
                setArenas(arenasData || []);

                if (arenasData && arenasData.length > 0) {
                    setArenaSelecionada(arenasData[0].id);
                }

                // Recupera código salvo se veio do login
                const salvo = sessionStorage.getItem('fox_codigo_ativacao');
                if (salvo && !codigo) {
                    setCodigo(salvo);
                    sessionStorage.removeItem('fox_codigo_ativacao');
                }

            } catch (err) {
                console.error(err);
            } finally {
                setCarregando(false);
            }
        }
        carregarUsuario();
    }, [router, codigoUrl]);

    // 2. Carrega as quadras da arena selecionada
    useEffect(() => {
        if (!arenaSelecionada) return;
        async function carregarQuadras() {
            try {
                const { data, error } = await supabase
                    .from('quadras')
                    .select('id, nome')
                    .eq('arena_id', arenaSelecionada)
                    .order('nome');

                if (error) throw error;
                setQuadras(data || []);
                if (data && data.length > 0) {
                    setQuadraSelecionada(data[0].id);
                }
            } catch (err) {
                console.error(err);
            }
        }
        carregarQuadras();
    }, [arenaSelecionada]);

    // 3. Processa a ativação
    const handleAtivar = async (e) => {
        e.preventDefault();
        setMensagem({ tipo: '', texto: '' });

        if (!codigo.trim() || !quadraSelecionada) {
            setMensagem({ tipo: 'erro', texto: 'Preencha o código do totem e selecione a quadra.' });
            return;
        }

        setAtivando(true);
        try {
            let codLimpo = codigo.trim().toUpperCase();
            if (codLimpo.length === 6 && !codLimpo.includes('-')) {
                codLimpo = `${codLimpo.substring(0, 3)}-${codLimpo.substring(3, 6)}`;
            }

            // Busca pareamento pendente
            const { data: pareamento, error: errP } = await supabase
                .from('pareamentos')
                .select('*')
                .eq('codigo', codLimpo)
                .eq('status', 'pendente')
                .single();

            if (errP || !pareamento) {
                throw new Error('Código do Totem inválido ou já expirado. Verifique o código exibido na TV da quadra.');
            }

            // Gera token oficial
            const tokenGerado = `fox_tok_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;

            // Cria o dispositivo
            const { error: errD } = await supabase
                .from('dispositivos')
                .insert([{ quadra_id: quadraSelecionada, token_autenticacao: tokenGerado }]);

            if (errD) throw errD;

            // Atualiza status do pareamento para o totem receber e começar a gravar
            const { error: errU } = await supabase
                .from('pareamentos')
                .update({
                    status: 'vinculado',
                    token_gerado: tokenGerado,
                    quadra_id: quadraSelecionada
                })
                .eq('id', pareamento.id);

            if (errU) throw errU;

            setMensagem({ tipo: 'sucesso', texto: '🎉 Totem pareado com sucesso! Ele já começou a gravar na quadra.' });
            setTimeout(() => {
                router.push('/dashboard');
            }, 2500);

        } catch (err) {
            setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao ativar totem.' });
        } finally {
            setAtivando(false);
        }
    };

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse text-amber-500 font-bold text-xs uppercase tracking-wider">Verificando credenciais...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans p-5 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Glows ambientais */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative z-10 space-y-6 text-left">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-xl shadow-md">
                        ⚡
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase text-white tracking-wider">
                            Ativação de Totem
                        </h2>
                        <p className="text-[11px] text-zinc-400 font-medium">
                            Pareamento Zero-Touch na Quadra
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAtivar} className="space-y-4">
                    {/* Se tiver mais de uma arena */}
                    {arenas.length > 1 && (
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Complexo Esportivo
                            </label>
                            <select
                                value={arenaSelecionada}
                                onChange={(e) => setArenaSelecionada(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                                {arenas.map((a) => (
                                    <option key={a.id} value={a.id}>🏢 {a.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quadra */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                            Quadra deste Totem
                        </label>
                        {quadras.length === 0 ? (
                            <p className="text-xs text-red-400 font-bold">Nenhuma quadra cadastrada nesta arena.</p>
                        ) : (
                            <select
                                required
                                value={quadraSelecionada}
                                onChange={(e) => setQuadraSelecionada(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                                {quadras.map((q) => (
                                    <option key={q.id} value={q.id}>🎾 {q.nome}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Código de Ativação */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                            Código na TV do Totem (6 dígitos)
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={7}
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="Ex: 852-149"
                            className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border-2 border-zinc-800 text-amber-400 text-center text-xl font-black tracking-widest uppercase focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-3 rounded-xl text-xs font-semibold border ${
                            mensagem.tipo === 'sucesso'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={ativando || quadras.length === 0}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {ativando ? (
                            <>
                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Vinculando Equipamento...</span>
                            </>
                        ) : (
                            <>
                                <span>Ativar Totem na Quadra 🚀</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-2 text-center border-t border-zinc-800">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-xs text-zinc-500 hover:text-zinc-300 font-bold"
                    >
                        ← Voltar ao Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaginaAtivar() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
                <p className="animate-pulse text-zinc-500 text-xs uppercase tracking-widest font-bold">Inicializando Ativador...</p>
            </div>
        }>
            <ConteudoAtivar />
        </Suspense>
    );
}
