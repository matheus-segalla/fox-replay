'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Ícones SVG minimalistas de alta precisão
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
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function IconArrowRight({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function IconArrowUpRight({ className = "w-3.5 h-3.5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
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
        <div className="min-h-screen bg-[#14151c] text-white font-sans selection:bg-amber-500 selection:text-black relative flex flex-col justify-between overflow-x-hidden">

            {/* ANÉIS 3D METÁLICOS E ILUMINAÇÃO VOLUMÉTRICA ÂMBAR (Estilo Ai.Now) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Glow Radial Âmbar Central */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-transparent rounded-full blur-[160px]" />
                <div className="absolute top-[28%] right-[-10%] w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[180px]" />
                <div className="absolute top-[65%] left-[-15%] w-[700px] h-[700px] bg-amber-600/15 rounded-full blur-[200px]" />

                {/* Linhas de Grade e Textura Fina de Profundidade */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_70%,transparent_100%)] opacity-90" />

                {/* Composição Geométrica 3D (Anéis Translúcidos com Reflexos Dourados) */}
                <svg className="absolute -top-12 -right-24 w-[600px] h-[600px] opacity-35 md:opacity-50 select-none animate-pulse duration-1000" viewBox="0 0 500 500" fill="none">
                    <circle cx="250" cy="250" r="180" stroke="url(#goldGradient1)" strokeWidth="28" strokeLinecap="round" />
                    <circle cx="250" cy="250" r="130" stroke="url(#goldGradient2)" strokeWidth="12" strokeDasharray="30 20" />
                    <defs>
                        <linearGradient id="goldGradient1" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                            <stop offset="40%" stopColor="#d97706" stopOpacity="0.2" />
                            <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="goldGradient2" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Anel Flutuante na Lateral Esquerda */}
                <svg className="absolute top-[850px] -left-36 w-[550px] h-[550px] opacity-25 md:opacity-40 select-none" viewBox="0 0 500 500" fill="none">
                    <ellipse cx="250" cy="250" rx="200" ry="120" transform="rotate(-30 250 250)" stroke="url(#goldGradient3)" strokeWidth="22" />
                    <defs>
                        <linearGradient id="goldGradient3" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                            <stop offset="50%" stopColor="#78350f" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* HEADER INSTITUCIONAL (Padronizado h-16 com Glass Dark) */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl bg-[#14151c]/85 shadow-2xl">
                <div className="w-full max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => router.push('/')}>
                        <img
                            src="/logo-fox.jpeg"
                            alt="Logo Fox Replay"
                            className="h-9 w-9 object-cover rounded-xl border border-zinc-800 shadow-xs bg-zinc-900"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black tracking-widest uppercase text-white leading-none">
                                FOX <span className="text-amber-500">REPLAY</span>
                            </span>
                            <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                                Complexos
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/login')}
                            className="text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 hover:border-amber-500/40 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 backdrop-blur-md"
                        >
                            <span>Painel da Arena</span>
                            <IconArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="w-full max-w-6xl mx-auto px-5 pt-4 pb-16 md:pt-6 md:pb-24 relative z-10 flex-1 flex flex-col space-y-20 md:space-y-28">

                {/* ============================================================ */}
                {/* 1. HERO SECTION FUTURISTA (Estilo Ai.Now)                    */}
                {/* ============================================================ */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    {/* Tipografia de Duplo Impacto: Sólido Branco + Contorno Dourado */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.92] select-none">
                        <span className="block text-white">CAPTURE OS MELHORES LANCES</span>
                        <span className="block text-stroke-gold mt-2">EM UM CLIQUE</span>
                    </h1>

                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-normal max-w-2xl mx-auto">
                        Captação autônoma dos últimos 30 segundos, câmeras IP Full HD e acionamento anti-vandalismo direto na grade da quadra. Sem custos ocultos e sem necessidade de operadores no local.
                    </p>

                    {/* Botões Pílula Estilo Vidro Escuro com Brilho */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <a
                            href="#contato"
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] active:scale-95 text-center flex items-center justify-center gap-2"
                        >
                            <span>Solicitar Totem e Avaliação</span>
                            <IconArrowUpRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#solucoes"
                            className="w-full sm:w-auto px-7 py-4 glass-card-dark hover:bg-white/5 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/10 hover:border-white/20 transition-all text-center flex items-center justify-center gap-2"
                        >
                            <span>Explorar Soluções</span>
                        </a>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. SMART SOLUTIONS & ASYMMETRIC FLOATING CLUSTER             */}
                {/* ============================================================ */}
                <div id="solucoes" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28">
                    {/* Lado Esquerdo: Narrativa Executiva */}
                    <div className="lg:col-span-5 space-y-6">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            Smart Solutions
                        </span>
                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                            Autonomia Total <br />
                            <span className="text-zinc-400 font-bold text-2xl md:text-3xl">na Sua Quadra.</span>
                        </h3>
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-normal">
                            Na Fox Replay, acreditamos que a tecnologia de gravação e transmissão de alta performance não deve depender de operadores manuais na quadra.
                        </p>
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-normal">
                            Nosso sistema conecta-se às suas câmeras IP via protocolo RTSP, mantendo buffer contínuo em memória RAM. Ao apertar o botão físico, o take dos últimos 30 segundos é processado em formato MP4 leve e disponibilizado instantaneamente aos atletas via QR Code.
                        </p>
                        <div className="pt-2">
                            <a
                                href="#contato"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-pill text-white text-xs font-bold uppercase tracking-wider hover:border-amber-500/50 transition-all group"
                            >
                                <span>Falar com Especialista</span>
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                                    ↗
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Lado Direito: Cluster Flutuante de Cards em Vidro (Exatamente como na Imagem 3) */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                        {/* Card 1: Buffer Edge */}
                        <div className="glass-card-dark rounded-2xl p-6 space-y-2 hover:-translate-y-1 transition-all duration-300">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block tracking-wider">
                                01 &bull; Buffer Contínuo
                            </span>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                                Processamento em RAM
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Grava os últimos 30 segundos em tempo real sem gravar horas de vídeo inútil no disco.
                            </p>
                        </div>

                        {/* Card 2: Hardware Industrial */}
                        <div className="glass-card-dark rounded-2xl p-6 space-y-2 sm:translate-y-4 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block tracking-wider">
                                02 &bull; Botão de Grade
                            </span>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                                433MHz Sem Fio
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Acionamento industrial reforçado com alcance total da quadra e contato de pulso imediato.
                            </p>
                        </div>

                        {/* Card 3: Workflow */}
                        <div className="glass-card-dark rounded-2xl p-6 space-y-2 hover:-translate-y-1 transition-all duration-300">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block tracking-wider">
                                03 &bull; Workflow Viral
                            </span>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                                QR Code Instantâneo
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                O atleta não precisa baixar aplicativo. Escaneia a placa na quadra e baixa direto no rolo da câmera.
                            </p>
                        </div>

                        {/* Card 4: Patrocínios */}
                        <div className="glass-card-dark rounded-2xl p-6 space-y-2 sm:translate-y-4 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block tracking-wider">
                                04 &bull; Monetização
                            </span>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                                Marcas Parceiras
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Insira a logo dos patrocinadores da sua arena nos replays e gere receita publicitária recorrente.
                            </p>
                        </div>

                        {/* Card 5: Full Width Card no Rodapé do Cluster */}
                        <div className="sm:col-span-2 glass-card-dark rounded-2xl p-6 space-y-2 border-amber-500/20 hover:border-amber-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                                    05 &bull; Conexão Universal
                                </span>
                                <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
                                    RTSP / IP ONVIF
                                </span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                                Compatível com Câmeras Hikvision, Intelbras e Cftv de Mercado
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Não exigimos que você compre câmeras proprietárias com preços inflacionados. Reaproveite sua infraestrutura de vigilância com total fluidez.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 4. ARQUITETURA TÉCNICA (4 PILARES EM VIDRO)                  */}
                {/* ============================================================ */}
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-500 tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                            Engenharia e Topologia
                        </span>
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
                            Ciclo Fechado de Operação
                        </h2>
                        <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                            Do clique do jogador ao download no smartphone em menos de 8 segundos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card-dark rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                                <IconCamera className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">1. Câmera IP</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Conexão via protocolo padrão RTSP com câmeras de mercado sem alterar a segurança do seu complexo.
                            </p>
                        </div>

                        <div className="glass-card-dark rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                                <IconWifi className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">2. Botão Físico</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Acionador em aço ou transmissor wireless 433MHz com alcance total da quadra e contato de pulso rápido.
                            </p>
                        </div>

                        <div className="glass-card-dark rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                                <IconCpu className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">3. Edge Core</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                O hardware local mantém buffer circular na memória e costura os 30s em MP4 leve pronto para a web.
                            </p>
                        </div>

                        <div className="glass-card-dark rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                                <IconSmartphone className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-white uppercase tracking-wide">4. Entrega Web</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                Visualização instantânea via QR Code da quadra. O atleta assiste e salva direto na galeria sem instalar apps.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 5. MODELOS DE ADOÇÃO (DARK GLASS PRICING)                    */}
                {/* ============================================================ */}
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-500 tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                            Modelos de Contratação
                        </span>
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
                            Flexibilidade para Cada Complexo
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Modelo 1: Software */}
                        <div className="glass-card-dark rounded-3xl p-7 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                    Software Integrado
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">Licença de Software</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Para complexos que já possuem computadores ou microcontroladores compatíveis.</p>
                                </div>
                                <div className="text-3xl font-black text-white">
                                    R$ 199 <span className="text-xs text-zinc-400 font-normal">/mês por quadra</span>
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-3 pt-2">
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Gravações ilimitadas em nuvem</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Painel de gestão de quadras e feeds</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>4 posições para patrocinadores locais</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Retenção permanente para lances salvos</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3 glass-pill hover:bg-white/10 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                            >
                                Consultar Detalhes
                            </a>
                        </div>

                        {/* Modelo 2: Kit Completo (Com Destaque Dourado) */}
                        <div className="glass-card-dark border-amber-500/50 rounded-3xl p-7 flex flex-col justify-between space-y-6 relative shadow-[0_0_40px_rgba(245,158,11,0.12)]">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-950 bg-amber-500 px-3.5 py-1 rounded-full shadow-md">
                                    Mais Escolhido
                                </span>
                            </div>

                            <div className="space-y-4 pt-1">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                                    Hardware + Software
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">Kit Totem Completo</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Hardware pronto para uso, botão de acionamento e suporte técnico de campo.</p>
                                </div>
                                <div className="text-3xl font-black text-amber-400">
                                    R$ 399 <span className="text-xs text-zinc-400 font-normal">/mês por quadra</span>
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-3 pt-2">
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-400" />
                                        <span><strong>Totem edge configurado em comodato</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-400" />
                                        <span>Botão industrial com proteção contra intempéries</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-400" />
                                        <span>Pareamento rápido por código na quadra</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-400" />
                                        <span>Suporte técnico prioritário para a equipe</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md text-center"
                            >
                                Solicitar Implantação ➔
                            </a>
                        </div>

                        {/* Modelo 3: Multi-Quadras */}
                        <div className="glass-card-dark rounded-3xl p-7 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                    Redes & Franquias
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">Multi-Quadras</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Para complexos a partir de 4 quadras ou operações com múltiplas unidades.</p>
                                </div>
                                <div className="text-3xl font-black text-white">
                                    Sob Medida
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-3 pt-2">
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Condições personalizadas por volume</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Possibilidade de domínio institucional próprio</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Alinhamento de rede assistida pelo suporte</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCheck className="w-4 h-4 text-amber-500" />
                                        <span>Gerente de contas dedicado</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                href="#contato"
                                className="w-full py-3 glass-pill hover:bg-white/10 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                            >
                                Falar com a Equipe
                            </a>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 6. FORMULÁRIO DE CONTATO EM VIDRO DARK (Scroll Target)        */}
                {/* ============================================================ */}
                <div id="contato" className="max-w-xl mx-auto w-full glass-card-dark rounded-3xl p-7 md:p-10 space-y-6 shadow-2xl border-white/10 scroll-mt-28">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                            Contato Direto
                        </span>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                            Consultar Viabilidade Técnica
                        </h2>
                        <p className="text-xs text-zinc-400 font-normal">
                            Preencha os dados da sua arena para receber a proposta técnica de câmeras e hardware.
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
                                placeholder="Ex: Arena Sunset Beach"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
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
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
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
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
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
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                    <option value="1">1 Quadra (Solo)</option>
                                    <option value="2">2 Quadras (Recomendado)</option>
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
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-600 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                        >
                            <span>Enviar Solicitação de Viabilidade</span>
                            <IconSend className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-white/5">
                        <p className="text-[11px] text-zinc-500 font-normal">
                            Já fechou seu contrato?{' '}
                            <button
                                onClick={() => router.push('/cadastro')}
                                className="text-amber-400 font-bold hover:underline"
                            >
                                Credenciar sua arena e quadras ➔
                            </button>
                        </p>
                    </div>
                </div>

            </main>

            {/* FOOTER INSTITUCIONAL */}
            <footer className="w-full border-t border-white/10 py-8 text-center z-10 bg-[#14151c]/90 backdrop-blur-md">
                <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-semibold">
                    © {new Date().getFullYear()} FOX REPLAY &bull; TECNOLOGIA DE MONITORAMENTO E REPLAY ESPORTIVO
                </p>
            </footer>
        </div>
    );
}
