'use client';

import React from 'react';

const ITENS_INCLUSOS = [
    'Avaliação técnica da estrutura',
    'Dimensionamento dos equipamentos',
    'Instalação e configuração física',
    'Integração de câmeras e botões',
    'Plataforma em nuvem e QR Codes personalizados',
    'Treinamento da equipe e suporte contínuo',
];

export default function CommercialModelSection() {
    const scrollToContato = () => {
        const el = document.getElementById('contato');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="modelo-comercial" className="scroll-mt-24">
            <div className="bg-white border border-[#EAE8E5] rounded-3xl p-6 sm:p-10 shadow-[0_14px_40px_-20px_rgba(17,17,17,0.08)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* ESQUERDA: MODELO TRANSPARENTE */}
                    <div className="lg:col-span-6 space-y-5">
                        <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                            Modelo Comercial
                        </span>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                            Um projeto dimensionado{' '}
                            <span className="text-[#FF9900]">para sua arena.</span>
                        </h2>

                        <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                            Trabalhamos com um modelo transparente composto por{' '}
                            <strong className="text-[#111111]">
                                investimento inicial de implantação + mensalidade de operação
                            </strong>
                            . A proposta é dimensionada de acordo com a quantidade de quadras e a estrutura já existente no seu complexo esportivo.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-4 rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5]">
                                <span className="text-[10px] font-mono font-bold uppercase text-[#FF9900] block">
                                    Etapa 01
                                </span>
                                <span className="text-xs sm:text-sm font-black text-[#111111] block mt-0.5">
                                    Implantação Inicial
                                </span>
                                <span className="text-[11px] text-[#68666B] block mt-1">
                                    Hardware local, instalação física e configuração por quadra.
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5]">
                                <span className="text-[10px] font-mono font-bold uppercase text-[#FF9900] block">
                                    Etapa 02
                                </span>
                                <span className="text-xs sm:text-sm font-black text-[#111111] block mt-0.5">
                                    Mensalidade de Operação
                                </span>
                                <span className="text-[11px] text-[#68666B] block mt-1">
                                    Plataforma em nuvem, armazenamento, painel e suporte ativo.
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={scrollToContato}
                                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                            >
                                Solicitar proposta personalizada
                            </button>
                        </div>
                    </div>

                    {/* DIREITA: O QUE ESTÁ INCLUSO */}
                    <div className="lg:col-span-6 bg-[#FCFBF9] border border-[#EAE8E5] rounded-2xl p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between border-b border-[#EAE8E5] pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-[#111111]">
                                O que está incluso no projeto
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase text-[#FF9900]">
                                Projeto Sob Medida
                            </span>
                        </div>

                        <ul className="space-y-3">
                            {ITENS_INCLUSOS.map((item) => (
                                <li key={item} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#111111]">
                                    <span className="w-5 h-5 rounded-full bg-[#F7EBD7] text-[#FF9900] flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
