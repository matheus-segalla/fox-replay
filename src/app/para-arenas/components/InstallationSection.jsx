import React from 'react';

const ETAPAS_IMPLANTACAO = [
    {
        num: '01',
        titulo: 'Diagnóstico da estrutura',
        desc: 'Mapeamos a planta do complexo, tipo de piso, alambrados e pontos de energia e rede disponíveis.',
    },
    {
        num: '02',
        titulo: 'Avaliação de câmeras e conectividade',
        desc: 'Verificamos se suas câmeras IP atuais (Hikvision, Intelbras, etc.) são compatíveis via RTSP ou indicamos o modelo ideal.',
    },
    {
        num: '03',
        titulo: 'Definição dos equipamentos',
        desc: 'Dimensionamento do hardware Edge Core local, cabeamento e botões físicos de alta resistência.',
    },
    {
        num: '04',
        titulo: 'Instalação e calibração',
        desc: 'Montagem física, calibração do ângulo da câmera, buffer em RAM e fixação dos QR Codes na quadra.',
    },
    {
        num: '05',
        titulo: 'Treinamento e suporte',
        desc: 'Capacitação rápida da equipe da arena e suporte contínuo com monitoramento da infraestrutura.',
    },
];

export default function InstallationSection() {
    return (
        <section id="implantacao" className="scroll-mt-24 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Engenharia e Implantação
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    Nós cuidamos da tecnologia.{' '}
                    <span className="text-[#FF9900]">Você cuida da sua arena.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                    Da avaliação inicial à instalação, nossa equipe estrutura a solução conforme as características do seu complexo esportivo.
                </p>
            </div>

            {/* TIMELINE HORIZONTAL NO DESKTOP / VERTICAL COMPACTA NO MOBILE */}
            <div className="relative">
                <div className="hidden md:block absolute top-6 left-[8%] right-[8%] h-px bg-[#EAE8E5] z-0" aria-hidden="true" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                    {ETAPAS_IMPLANTACAO.map((etapa) => (
                        <div
                            key={etapa.num}
                            className="bg-white border border-[#EAE8E5] rounded-2xl p-5 flex md:flex-col gap-4 md:gap-3 items-start"
                        >
                            <span className="w-10 h-10 rounded-full bg-[#111111] text-white font-mono font-black text-xs flex items-center justify-center shrink-0 border-4 border-[#FCFBF9] shadow-xs">
                                {etapa.num}
                            </span>
                            <div className="space-y-1.5">
                                <h3 className="text-xs sm:text-sm font-black text-[#111111] uppercase leading-snug">
                                    {etapa.titulo}
                                </h3>
                                <p className="text-xs text-[#68666B] leading-relaxed">
                                    {etapa.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
