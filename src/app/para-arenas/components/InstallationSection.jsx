'use client';

import React from 'react';

const ETAPAS_IMPLANTACAO = [
    {
        num: '01',
        titulo: 'Diagnóstico da Estrutura',
        desc: 'Mapeamos a planta do complexo, tipo de piso, posicionamento de alambrados e pontos de energia e rede disponíveis.'
    },
    {
        num: '02',
        titulo: 'Avaliação de Câmeras & Conectividade',
        desc: 'Verificamos se suas câmeras IP atuais (Hikvision, Intelbras, etc.) são compatíveis via RTSP ou sugerimos novos equipamentos.'
    },
    {
        num: '03',
        titulo: 'Definição dos Equipamentos',
        desc: 'Dimensionamento do hardware Edge Core local, cabeamento industrial e botões de pulso sem fio de alta resistência.'
    },
    {
        num: '04',
        titulo: 'Instalação & Calibração',
        desc: 'Montagem física, calibração do ângulo da câmera, configuração do buffer em RAM e fixação das placas com QR Code.'
    },
    {
        num: '05',
        titulo: 'Treinamento & Suporte Ativo',
        desc: 'Capacitação rápida dos recepcionistas e gestores da arena, com suporte contínuo e monitoramento da infraestrutura.'
    }
];

export default function InstallationSection() {
    return (
        <section id="implantacao" className="scroll-mt-28 space-y-12">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Engenharia e Implantação
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    Nós cuidamos da tecnologia. <br />
                    <span className="text-zinc-400">Você cuida da sua arena.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    O projeto FOX Replay começa com uma avaliação cuidadosa da sua infraestrutura e termina com uma solução pronta para os seus clientes usarem.
                </p>
            </div>

            {/* FLUXO EM 5 ETAPAS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {ETAPAS_IMPLANTACAO.map((etapa) => (
                    <div
                        key={etapa.num}
                        className="glass-card-dark rounded-2xl p-5 space-y-3 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <span className="text-xs font-mono font-black text-amber-400">
                                {etapa.num}
                            </span>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                                {etapa.titulo}
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                {etapa.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODELO COMERCIAL: PROJETO SOB MEDIDA */}
            <div className="glass-card-dark rounded-3xl p-7 sm:p-10 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* COLUNA ESQUERDA: APRESENTAÇÃO DO MODELO */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                                Modelo Comercial Transparente
                            </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                            FOX REPLAY &bull; <span className="text-amber-400">Implantação Completa</span>
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                            Em vez de vender uma simples assinatura de software que você precisaria configurar sozinho, entregamos um <strong>projeto profissional de ponta a ponta</strong>:
                        </p>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                            <span className="text-[11px] font-mono font-bold uppercase text-amber-400">
                                Estrutura do Investimento
                            </span>
                            <p className="text-sm font-bold text-white">
                                Investimento inicial de implantação + Mensalidade de operação
                            </p>
                            <p className="text-xs text-zinc-400">
                                Sem custos surpresa. Cada arena recebe uma proposta adequada à quantidade de quadras e equipamentos existentes.
                            </p>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: O QUE ESTÁ INCLUÍDO */}
                    <div className="lg:col-span-5 space-y-3 bg-black/30 p-6 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider block">
                            O que está incluso na entrega:
                        </span>

                        <ul className="space-y-2 text-xs text-zinc-300">
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">✓</span>
                                <span>Avaliação técnica presencial ou remota da arena</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">✓</span>
                                <span>Equipamentos necessários conforme o projeto</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">✓</span>
                                <span>Instalação física e configuração de rede</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">✓</span>
                                <span>Integração de câmeras e botões na grade</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">✓</span>
                                <span>Plataforma em nuvem e QR Codes personalizados</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">✓</span>
                                <span>Treinamento da equipe e suporte contínuo</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
