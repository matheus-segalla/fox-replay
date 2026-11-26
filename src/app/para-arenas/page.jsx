import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ExperienceSection from './components/ExperienceSection';
import HowItWorksSection from './components/HowItWorksSection';
import BenefitsSection from './components/BenefitsSection';
import SportsSection from './components/SportsSection';
import InstallationSection from './components/InstallationSection';
import BusinessOpportunities from './components/BusinessOpportunities';
import FAQSection from './components/FAQSection';
import LeadFormSection from './components/LeadFormSection';
import Footer from './components/Footer';

export const metadata = {
    title: 'FOX REPLAY para Arenas — Tecnologia Autônoma de Replay Esportivo',
    description:
        'Transforme suas quadras de Beach Tennis, Futevôlei, Vôlei e Tênis em arenas conectadas. Replays via QR Code com monetização por patrocínio local.',
    alternates: {
        canonical: '/para-arenas',
    },
    openGraph: {
        title: 'FOX REPLAY para Arenas — Cada grande jogada merece ser revivida',
        description:
            'Infraestrutura autônoma de gravação de lances com botão na quadra, QR Code instantâneo e espaços para patrocinadores.',
        url: 'https://www.foxreplay.com.br/para-arenas',
        type: 'website',
        images: [
            {
                url: '/logo-fox.jpeg',
                width: 1254,
                height: 1254,
                alt: 'FOX REPLAY para Arenas',
            },
        ],
    },
};

export default function PaginaParaArenas() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'FOX REPLAY para Arenas',
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Web',
        url: 'https://www.foxreplay.com.br/para-arenas',
        description:
            'Plataforma autônoma de gravação de replays esportivos para arenas de Beach Tennis, Futevôlei, Padel e Tênis com monetização por patrocínios.',
    };

    return (
        <div className="min-h-screen bg-[#14151c] text-white font-sans selection:bg-amber-500 selection:text-black relative flex flex-col justify-between overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ANÉIS 3D METÁLICOS E ILUMINAÇÃO VOLUMÉTRICA ÂMBAR */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Glow Radial Âmbar Central */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-transparent rounded-full blur-[160px]" />
                <div className="absolute top-[28%] right-[-10%] w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[180px]" />
                <div className="absolute top-[65%] left-[-15%] w-[700px] h-[700px] bg-amber-600/15 rounded-full blur-[200px]" />

                {/* Linhas de Grade e Textura Fina de Profundidade */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_70%,transparent_100%)] opacity-90" />

                {/* Anéis Translúcidos com Reflexos Dourados */}
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

            {/* BARRA SUPERIOR FIXA */}
            <Navbar />

            {/* CONTEÚDO PRINCIPAL MODULAR */}
            <main className="w-full max-w-6xl mx-auto px-5 pt-2 pb-16 md:pb-24 relative z-10 flex-1 flex flex-col space-y-24 md:space-y-32">
                {/* 1. HERO SECTION */}
                <HeroSection />

                {/* 2. OPORTUNIDADE & EXPERIÊNCIA */}
                <ExperienceSection />

                {/* 3. COMO FUNCIONA (FLUXO + SIMULADOR) */}
                <HowItWorksSection />

                {/* 4. BENEFÍCIOS */}
                <BenefitsSection />

                {/* 5. MULTIMODALIDADE (BEACH, FUTEVÔLEI, VÔLEI, TÊNIS) */}
                <SportsSection />

                {/* 6. PROCESSO DE IMPLANTAÇÃO & MODELO COMERCIAL */}
                <InstallationSection />

                {/* 7. OPORTUNIDADES COMERCIAIS & PATROCÍNIO */}
                <BusinessOpportunities />

                {/* 8. FAQ TRANSPARENTE EM ACORDEÃO */}
                <FAQSection />

                {/* 9. FORMULÁRIO DE SELEÇÃO DE ARENA PARCEIRA (PRÉ-VENDA) */}
                <LeadFormSection />
            </main>

            {/* RODAPÉ INSTITUCIONAL */}
            <Footer />
        </div>
    );
}
