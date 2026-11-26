import React from 'react';
import EditorialImage from './EditorialImage';

const MODALIDADES = [
    {
        nome: 'Beach Tennis',
        descricao: 'Ralis velozes, smashes explosivos e defesas reflexas capturadas na areia.',
        badge: 'Topologia Validada',
        imagem: '/images/para-arenas/esporte-beach-tennis.jpg',
    },
    {
        nome: 'Futevôlei',
        descricao: 'Tubarões, defesas no peito e pontos disputados na fita prontos para compartilhar.',
        badge: 'Em Expansão',
        imagem: '/images/para-arenas/esporte-futevolei.jpg',
    },
    {
        nome: 'Vôlei de Areia',
        descricao: 'Bloqueios na rede, aces e jogadas decisivas para torneios e treinos.',
        badge: 'Em Expansão',
        imagem: '/images/para-arenas/esporte-volei-areia.jpg',
    },
    {
        nome: 'Tênis Tradicional',
        descricao: 'Passadas na paralela, saques angulados e revisão técnica de jogadas.',
        badge: 'Sob Avaliação',
        imagem: '/images/para-arenas/esporte-tenis.jpg',
    },
];

export default function SportsSection() {
    return (
        <section id="modalidades" className="scroll-mt-24 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Multimodalidade
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    Uma experiência para{' '}
                    <span className="text-[#FF9900]">diferentes esportes.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                    Começamos onde a comunidade mais vibra e avaliamos tecnicamente cada quadra antes da implantação.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {MODALIDADES.map((m) => (
                    <div
                        key={m.nome}
                        className="bg-white border border-[#EAE8E5] hover:border-[#FF9900]/60 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                        <div>
                            <div className="relative aspect-[4/3] w-full bg-[#111111] overflow-hidden">
                                <EditorialImage
                                    src={m.imagem}
                                    alt={m.nome}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover"
                                />
                                <span className="absolute top-3 left-3 text-[10px] font-mono font-bold uppercase bg-white/95 text-[#111111] border border-[#EAE8E5] px-2.5 py-1 rounded-full shadow-xs">
                                    {m.badge}
                                </span>
                            </div>

                            <div className="p-5 space-y-2">
                                <h3 className="text-base font-black text-[#111111] uppercase">
                                    {m.nome}
                                </h3>
                                <p className="text-xs text-[#68666B] leading-relaxed">
                                    {m.descricao}
                                </p>
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-[#EAE8E5] bg-[#FCFBF9] text-[10px] font-mono font-semibold text-[#68666B] uppercase">
                            Captação com ângulo amplo
                        </div>
                    </div>
                ))}
            </div>

            {/* BOX DE DIAGNÓSTICO PERSONALIZADO PRESERVADO */}
            <div className="bg-white border border-[#EAE8E5] rounded-2xl p-6 sm:p-7 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#F7EBD7] border border-[#EAE8E5] flex items-center justify-center text-[#FF9900] shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#111111] uppercase tracking-wide">
                        Diagnóstico Personalizado por Modalidade
                    </h4>
                    <p className="text-xs text-[#68666B] leading-relaxed">
                        Cada modalidade possui dinâmicas, distâncias de rede e velocidades de bola próprias. Nossa equipe avalia a estrutura e as particularidades da sua operação para definir o posicionamento exato da câmera e do acionador.
                    </p>
                </div>
            </div>
        </section>
    );
}
