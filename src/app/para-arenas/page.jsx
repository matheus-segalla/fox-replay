import React from 'react';
import LandingBackground from '@/app/components/landing/LandingBackground';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ExperienceSection from './components/ExperienceSection';
import HowItWorksSection from './components/HowItWorksSection';
import BenefitsSection from './components/BenefitsSection';
import SportsSection from './components/SportsSection';
import InstallationSection from './components/InstallationSection';
import CommercialModelSection from './components/CommercialModelSection';
import BusinessOpportunities from './components/BusinessOpportunities';
import FAQSection from './components/FAQSection';
import FinalConversionSection from './components/FinalConversionSection';
import LeadFormSection from './components/LeadFormSection';
import Footer from './components/Footer';
import MobileStickyCta from './components/MobileStickyCta';

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
        <div className="min-h-screen bg-[#FCFBF9] text-[#111111] font-sans selection:bg-[#FF9900] selection:text-[#111111] relative flex flex-col justify-between overflow-x-hidden pb-20 sm:pb-0">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* FUNDO EDITORIAL OFF-WHITE COM GRID E MARCAÇÕES DE QUADRA */}
            <LandingBackground />

            {/* HEADER STICKY */}
            <Navbar />

            {/* CONTEÚDO PRINCIPAL */}
            <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-20 sm:space-y-24 pb-20 z-10 relative">
                <HeroSection />
                <ExperienceSection />
                <HowItWorksSection />
                <BenefitsSection />
                <SportsSection />
                <InstallationSection />
                <CommercialModelSection />
                <BusinessOpportunities />
                <FAQSection />
                <FinalConversionSection />
                <LeadFormSection />
            </main>

            {/* RODAPÉ INSTITUCIONAL */}
            <Footer />

            {/* CTA FIXO DISCRETO NO MOBILE (OCULTADO QUANDO #contato ESTÁ VISÍVEL) */}
            <MobileStickyCta />
        </div>
    );
}
