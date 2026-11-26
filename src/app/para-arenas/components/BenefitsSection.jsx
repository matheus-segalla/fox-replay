import React from 'react';

const BENEFICIOS = [
    {
        numero: '01',
        titulo: 'DIFERENCIAÇÃO',
        descricao: 'Ofereça uma experiência tecnológica que destaca sua arena de outras opções da região.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
    },
    {
        numero: '02',
        titulo: 'FIDELIZAÇÃO',
        descricao: 'Crie novos motivos para os atletas voltarem e compartilharem momentos vividos na sua estrutura.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
    },
    {
        numero: '03',
        titulo: 'MARKETING ORGÂNICO',
        descricao: 'Transforme jogadas incríveis em conteúdos espontâneos que podem divulgar sua arena.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
        ),
    },
    {
        numero: '04',
        titulo: 'VALOR PERCEBIDO',
        descricao: 'Agregue tecnologia e inovação à experiência oferecida aos seus clientes.',
        icone: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
];

export default function BenefitsSection() {
    return (
        <section id="beneficios" className="scroll-mt-24 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Valor para o Negócio
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    Sua arena ganha.{' '}
                    <span className="text-[#FF9900]">Seus atletas também.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                    Mais do que registrar jogadas, o FOX Replay cria uma experiência diferenciada e novas possibilidades para o seu complexo esportivo.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {BENEFICIOS.map((b) => (
                    <div
                        key={b.numero}
                        className="bg-white border border-[#EAE8E5] hover:border-[#FF9900]/60 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between space-y-4 group"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-[#FCFBF9] border border-[#EAE8E5] text-[#FF9900] flex items-center justify-center group-hover:bg-[#F7EBD7]/60 transition-colors">
                                    {b.icone}
                                </div>
                                <span className="text-[11px] font-mono font-bold text-[#68666B]">
                                    {b.numero}
                                </span>
                            </div>

                            <h3 className="text-sm font-black text-[#111111] uppercase tracking-wide">
                                {b.titulo}
                            </h3>
                            <p className="text-xs text-[#68666B] leading-relaxed">
                                {b.descricao}
                            </p>
                        </div>

                        <div className="h-0.5 w-8 bg-[#FF9900] rounded-full" />
                    </div>
                ))}
            </div>
        </section>
    );
}
