'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Ícones SVG minimalistas
function IconCamera({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
        </svg>
    );
}

function IconWifi({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
        </svg>
    );
}

function IconCpu({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M15 2v2" /><path d="M15 20v2" />
            <path d="M2 15h2" /><path d="M2 9h2" />
            <path d="M20 15h2" /><path d="M20 9h2" />
            <path d="M9 2v2" /><path d="M9 20v2" />
        </svg>
    );
}

function IconSmartphone({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <line x1="12" x2="12.01" y1="18" y2="18" strokeWidth="2" />
        </svg>
    );
}

function IconCheck({ className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function IconArrowRight({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function IconShield({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function IconLayers({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

function IconSend({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

export default function PaginaParaArenas() {
    const router = useRouter();

    // Formulário de contato para implantação técnica
    const [nomeArena, setNomeArena] = useState('');
    const [nomeContato, setNomeContato] = useState('');
    const [cidade, setCidade] = useState('');
    const [qtdQuadras, setQtdQuadras] = useState('2');
    const [whatsapp, setWhatsapp] = useState('');

    const enviarInteresseWhatsApp = (e) => {
        e.preventDefault();
        const texto = encodeURIComponent(
            `Olá equipe Fox Replay. Gostaria de informações técnicas e comerciais para implantação no meu complexo esportivo:\n\n` +
            `Complexo: ${nomeArena}\n` +
            `Responsável: ${nomeContato}\n` +
            `Cidade/UF: ${cidade}\n` +
            `Quantidade de Quadras: ${qtdQuadras}\n` +
            `Contato WhatsApp: ${whatsapp}\n\n` +
            `Aguardo retorno para alinhamento de infraestrutura.`
        );

        window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=${texto}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden flex flex-col justify-between">
            {/* Iluminação de fundo sutil */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-zinc-800/20 rounded-full blur-[130px] pointer-events-none" />

            {/* HEADER INSTITUCIONAL */}
            <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center z-10 border-b border-zinc-800/80 backdrop-blur-md bg-zinc-950/80 sticky top-0">
                <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => router.push('/')}>
                    <img
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        className="h-8 w-8 object-cover rounded-xl border border-zinc-800 shadow-sm bg-zinc-900"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-widest uppercase text-white">
                            FOX <span className="text-amber-500">REPLAY</span>
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 uppercase tracking-wider">
                            Complexos
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
                    >
                        Portal dos Atletas
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                        <span>Painel da Arena</span>
                        <IconArrowRight className="w-3 h-3 text-zinc-400" />
                    </button>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="w-full max-w-5xl mx-auto px-5 py-14 md:py-20 z-10 flex-1 flex flex-col space-y-24">

                {/* HERO SECTION SÓBRIA */}
                <div className="text-center space-y-5 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-300">
                            Infraestrutura para Complexos Esportivos
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                        Sistema Autônomo de Replay <br />
                        <span className="text-zinc-400">para Quadras Esportivas</span>
                    </h1>

                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-normal max-w-2xl mx-auto">
                        Captação sob demanda dos últimos 30 segundos de jogo, integrado diretamente às câmeras IP e à rede local da sua arena. Sem mensalidades abusivas e sem necessidade de operadores na quadra.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                        <a
                            href="#contato"
                            className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Consultar Implantação
                        </a>
                        <a
                            href="#arquitetura"
                            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs uppercase tracking-wider rounded-xl border border-zinc-800 transition-all"
                        >
                            Especificações Técnicas
                        </a>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 1. ARQUITETURA TÉCNICA (4 PILARES DE ENGENHARIA)             */}
                {/* ============================================================ */}
                <div id="arquitetura" className="space-y-8 scroll-mt-24">
                    <div className="text-center space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">
                            Engenharia e Conectividade
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            Como o Sistema Opera na Quadra
                        </h2>
                        <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                            Instalação limpa que reaproveita a infraestrutura de rede já existente no seu complexo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                                <IconCamera className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">1. Câmera IP Existente</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Conexão via protocolo padrão RTSP com câmeras de mercado (Hikvision, Intelbras e modelos com suporte a streaming de rede).
                            </p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                                <IconWifi className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">2. Botão Físico ou Sem Fio</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                O atleta aciona o botão na grade ou via transmissor sem fio 433MHz com alcance total da quadra e contato de pulso imediato.
                            </p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                                <IconCpu className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">3. Processamento Edge</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                O hardware local mantém buffer circular na memória e costura os últimos 30 segundos em formato MP4 leve e pronto para a web.
                            </p>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                                <IconSmartphone className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">4. Acesso Web Imediato</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Visualização instantânea via QR Code ou feed público da quadra. O atleta assiste e salva direto na galeria sem instalar apps.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. RECURSOS OPERACIONAIS DA ARENA                            */}
                {/* ============================================================ */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-10 space-y-8">
                    <div className="max-w-2xl space-y-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                            Benefícios de Gestão
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Estruturado para a Rotina do Complexo
                        </h2>
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                            A tecnologia foi desenvolvida para operar com intervenção zero da equipe da recepção durante as partidas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-center mb-3">
                                <IconShield className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase">Operação Autônoma</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Inicialização automática ao ligar na tomada. Em caso de oscilação elétrica, o sistema reinicia e retoma a gravação sozinho.
                            </p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-center mb-3">
                                <IconLayers className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase">Espaço para Patrocinadores</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Painel integrado com 4 posições de exibição de marcas parceiras nos replays dos atletas, viabilizando cotas locais de publicidade.
                            </p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-center mb-3">
                                <IconSmartphone className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase">Difusão Orgânica</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Os atletas compartilham seus melhores lances diretamente no Instagram e WhatsApp, divulgando o nome do complexo com frequência.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 3. MODELOS DE ADOÇÃO                                         */}
                {/* ============================================================ */}
                <div className="space-y-8">
                    <div className="text-center space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">
                            Flexibilidade de Implantação
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            Modelos para Cada Porte de Complexo
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Modelo 1 */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                    Software Integrado
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">Licença de Software</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Para complexos que já possuem computadores ou microcontroladores compatíveis.</p>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    R$ 199 <span className="text-xs text-zinc-400 font-normal">/mês por quadra</span>
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-2.5 pt-2">
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Gravações ilimitadas em nuvem</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Painel de gestão de quadras e feeds</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>4 posições para patrocinadores locais</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Retenção automática de 14 dias</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                            >
                                Consultar Detalhes
                            </a>
                        </div>

                        {/* Modelo 2: Kit Completo */}
                        <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative shadow-lg">
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                    Hardware + Software
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">Kit Totem Completo</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Hardware pronto para uso, botão de acionamento e suporte técnico de campo.</p>
                                </div>
                                <div className="text-2xl font-bold text-amber-400">
                                    R$ 399 <span className="text-xs text-zinc-400 font-normal">/mês por quadra</span>
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-2.5 pt-2">
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-400" />
                                        <span><strong>Totem edge configurado em comodato</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Botão industrial com proteção contra intempéries</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Pareamento rápido por código na quadra</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Suporte técnico prioritário para a equipe</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm text-center"
                            >
                                Solicitar Implantação
                            </a>
                        </div>

                        {/* Modelo 3: Multi-Quadras */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                    Redes & Franquias
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">Multi-Quadras</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Para complexos a partir de 4 quadras ou operações com múltiplas unidades.</p>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    Sob Consulta
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-2.5 pt-2">
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Condições personalizadas por volume</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Possibilidade de domínio institucional próprio</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Alinhamento de infraestrutura de rede assistida</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Atendimento direto para a gerência</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                            >
                                Falar com a Equipe
                            </a>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 4. FORMULÁRIO DE CONTATO / IMPLANTAÇÃO                       */}
                {/* ============================================================ */}
                <div id="contato" className="max-w-xl mx-auto w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                    <div className="text-center space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">
                            Contato com a Engenharia
                        </span>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase">
                            Consultar Viabilidade Técnica
                        </h2>
                        <p className="text-xs text-zinc-400 font-normal">
                            Envie os dados do seu complexo esportivo para alinharmos os requisitos de câmeras e instalação.
                        </p>
                    </div>

                    <form onSubmit={enviarInteresseWhatsApp} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Nome do Complexo / Arena
                            </label>
                            <input
                                type="text"
                                required
                                value={nomeArena}
                                onChange={(e) => setNomeArena(e.target.value)}
                                placeholder="Ex: Arena Nascer do Sol"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Responsável
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nomeContato}
                                    onChange={(e) => setNomeContato(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Cidade / Estado
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={cidade}
                                    onChange={(e) => setCidade(e.target.value)}
                                    placeholder="Ex: Campinas - SP"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    Número de Quadras
                                </label>
                                <select
                                    value={qtdQuadras}
                                    onChange={(e) => setQtdQuadras(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                    <option value="1">1 Quadra</option>
                                    <option value="2">2 Quadras</option>
                                    <option value="3 a 5">3 a 5 Quadras</option>
                                    <option value="Mais de 5">Mais de 5 Quadras</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                    WhatsApp para Contato
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            <span>Enviar Solicitação Técnica</span>
                            <IconSend className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-zinc-800/80">
                        <p className="text-[11px] text-zinc-500 font-normal">
                            Já possui credenciais de acesso?{' '}
                            <button
                                onClick={() => router.push('/cadastro')}
                                className="text-amber-400 font-bold hover:underline"
                            >
                                Ativar sua conta de gestor
                            </button>
                        </p>
                    </div>
                </div>

            </main>

            {/* FOOTER INSTITUCIONAL */}
            <footer className="w-full border-t border-zinc-800/80 py-6 text-center z-10 bg-zinc-950">
                <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-semibold">
                    © {new Date().getFullYear()} FOX REPLAY • Tecnologia de Monitoramento e Replay Esportivo
                </p>
            </footer>
        </div>
    );
}
