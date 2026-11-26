import React from 'react';
import EditorialImage from './EditorialImage';

const ETAPAS_ATLETA = [
    {
        numero: '01',
        titulo: 'APERTOU',
        descricao: 'O atleta realiza uma jogada incrível e aperta o botão físico instalado na quadra.',
    },
    {
        numero: '02',
        titulo: 'ENCONTROU',
        descricao: 'Acessa o QR Code da quadra e localiza instantaneamente o replay da sua jogada.',
    },
    {
        numero: '03',
        titulo: 'COMPARTILHOU',
        descricao: 'Visualiza, baixa em alta definição e compartilha o vídeo com amigos e nas redes sociais.',
    },
];

export default function ExperienceSection() {
    return (
        <section id="experiencia" className="scroll-mt-24 space-y-10">
            <div className="max-w-2xl space-y-3">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Jornada do Jogador
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    A experiência começa na quadra.{' '}
                    <span className="text-[#FF9900]">Continua no celular.</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                {/* ESQUERDA: 3 ETAPAS */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    {ETAPAS_ATLETA.map((etapa) => (
                        <div
                            key={etapa.numero}
                            className="bg-white border border-[#EAE8E5] hover:border-[#FF9900]/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex gap-4 items-start"
                        >
                            <span className="w-10 h-10 rounded-xl bg-[#F7EBD7] text-[#111111] font-mono font-black text-sm flex items-center justify-center shrink-0">
                                {etapa.numero}
                            </span>
                            <div className="space-y-1">
                                <h3 className="text-sm sm:text-base font-black text-[#111111] uppercase tracking-wide">
                                    {etapa.numero} — {etapa.titulo}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                                    {etapa.descricao}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DIREITA: FOTO + TOTEM QR CODE + SMARTPHONE */}
                <div className="lg:col-span-7 bg-white border border-[#EAE8E5] rounded-3xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* Foto do atleta apertando o botão */}
                    <div className="sm:col-span-7 relative aspect-[4/3] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-[#111111] border border-[#EAE8E5]">
                        <EditorialImage
                            src="/images/para-arenas/atleta-botao.jpg"
                            alt="Atleta apertando o botão físico do FOX Replay na quadra"
                            sizes="(max-width: 768px) 100vw, 35vw"
                            className="object-cover"
                        />
                        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-[#EAE8E5] flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]">
                                Botão tátil na quadra
                            </span>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                        </div>
                    </div>

                    {/* Composição Totem QR Code + Smartphone */}
                    <div className="sm:col-span-5 flex flex-col gap-4">
                        {/* Placa / Totem QR Code ilustrativo */}
                        <div className="rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5] p-4 flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-xl bg-white border border-[#EAE8E5] p-1.5 shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 36 36" className="w-full h-full text-[#111111]" fill="currentColor" aria-hidden="true">
                                    <path d="M2 2h12v12H2V2zm3 3v6h6V5H5zm17-3h12v12H22V2zm3 3v6h6V5h-6zM2 22h12v12H2V22zm3 3v6h6v-6H5zm13-7h4v4h-4v-4zm0-8h4v4h-4V10zm-6 8h4v4h-4v-4zm12 4h4v4h-4v-4zm6 0h4v4h-4v-4zm-6 6h4v6h-4v-6zm6 2h4v4h-4v-4zm-12 2h4v4h-4v-4z" />
                                </svg>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-mono font-bold uppercase text-[#FF9900]">
                                    Totem da Quadra
                                </span>
                                <p className="text-xs font-extrabold text-[#111111]">
                                    Aponte a câmera e acesse
                                </p>
                                <p className="text-[11px] text-[#68666B]">
                                    Sem instalar aplicativo
                                </p>
                            </div>
                        </div>

                        {/* Mini Smartphone exibindo gravação */}
                        <div className="rounded-2xl bg-[#111111] p-3 text-white space-y-2.5">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold tracking-wider">
                                    FOX <span className="text-[#FF9900]">REPLAY</span>
                                </span>
                                <span className="font-mono text-zinc-400">30s &bull; HD</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                                <EditorialImage
                                    src="/images/para-arenas/esporte-futevolei.jpg"
                                    alt="Reprodução do lance no celular do atleta"
                                    sizes="240px"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                    <span className="w-8 h-8 rounded-full bg-[#FF9900] text-[#111111] flex items-center justify-center">
                                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                <span className="py-1.5 rounded-lg bg-[#FF9900] text-[#111111] text-center">
                                    Baixar Vídeo
                                </span>
                                <span className="py-1.5 rounded-lg bg-white/10 text-white text-center">
                                    Compartilhar
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
