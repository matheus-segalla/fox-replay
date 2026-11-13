'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CredenciamentoArena() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 relative overflow-hidden">
            {/* LINHAS DE GRADE E AMBIÊNCIA */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[500px] bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200 shadow-xl relative z-10 space-y-7">
                {/* CABEÇALHO */}
                <div className="flex flex-col items-center justify-center text-center">
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-12 w-12 object-cover rounded-xl border border-zinc-200 shadow-xs bg-white mb-3"
                    />
                    <span className="text-[10px] font-mono tracking-widest text-amber-600 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold mb-2">
                        B2B &bull; Instalação Homologada
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-wider uppercase">
                        CREDENCIAMENTO <span className="text-amber-500">DE ARENA</span>
                    </h1>
                    <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed max-w-sm">
                        O Fox Replay opera com hardware dedicado de alta precisão. Conheça as etapas para credenciar seu complexo esportivo.
                    </p>
                </div>

                {/* CARD DE INFORMAÇÃO / PROCESSO */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 font-mono text-xs font-bold">
                            1
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Viabilidade Técnica</p>
                            <p className="text-[11px] text-zinc-500 leading-normal">
                                Avaliamos a conectividade e o posicionamento das câmeras na sua quadra.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 font-mono text-xs font-bold">
                            2
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Instalação do Totem Físico</p>
                            <p className="text-[11px] text-zinc-500 leading-normal">
                                Envio e fixação do totem com botão acionador e sistema anti-vandalismo.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 font-mono text-xs font-bold">
                            3
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Liberação de Acesso</p>
                            <p className="text-[11px] text-zinc-500 leading-normal">
                                Receba as credenciais do seu painel administrativo com estatísticas e cotas de vídeo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* AÇÕES */}
                <div className="space-y-3 pt-1">
                    <Link
                        href="/para-arenas#contato"
                        className="w-full py-3.5 px-4 flex items-center justify-center gap-2 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] transition-all shadow-sm"
                    >
                        <span>Solicitar Totem e Avaliação</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-zinc-700 hover:text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl bg-zinc-100 hover:bg-zinc-200/80 active:scale-[0.99] transition-all border border-zinc-200"
                    >
                        <span>Já sou Credenciado &bull; Acessar Painel</span>
                    </button>
                </div>

                {/* RODAPÉ DO ATLETA */}
                <div className="pt-3 border-t border-zinc-100 text-center text-xs">
                    <p className="text-[11px] text-zinc-500">
                        Você é atleta e quer assistir aos seus replays?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/entrar')}
                            className="text-amber-600 hover:text-amber-700 font-bold hover:underline"
                        >
                            Espaço do Atleta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
