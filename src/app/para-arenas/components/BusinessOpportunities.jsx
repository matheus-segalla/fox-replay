import React from 'react';
import EditorialImage from './EditorialImage';

export default function BusinessOpportunities() {
    return (
        <section id="oportunidades" className="scroll-mt-24 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#FF9900] bg-[#F7EBD7]/80 px-3.5 py-1 rounded-full border border-[#EAE8E5]">
                    Parcerias Comerciais
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-tight">
                    Suas jogadas também podem{' '}
                    <span className="text-[#FF9900]">abrir portas para novas parcerias.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                    O FOX Replay permite explorar possibilidades de exposição de marcas parceiras dentro da experiência de replay.
                </p>
            </div>

            <div className="bg-white border border-[#EAE8E5] rounded-3xl p-6 sm:p-10 shadow-[0_14px_40px_-20px_rgba(17,17,17,0.08)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* ESQUERDA: DUAS APLICAÇÕES */}
                    <div className="lg:col-span-7 space-y-5">
                        <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#FF9900] tracking-wider">
                                Oportunidade para sua Arena
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
                                Visibilidade para patrocinadores e apoiadores locais
                            </h3>
                            <p className="text-xs sm:text-sm text-[#68666B] leading-relaxed">
                                Clínicas, lojas esportivas, restaurantes ou apoiadores de torneios podem ganhar visibilidade no momento em que o atleta assiste, baixa e compartilha seus lances. Trata-se de um recurso de exposição comercial configurável no painel da arena.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5] space-y-1.5">
                                <span className="text-[11px] font-mono font-black text-[#FF9900] uppercase block">
                                    01 — MARCA NO VÍDEO
                                </span>
                                <p className="text-xs text-[#68666B] leading-relaxed">
                                    Na exportação do vídeo em 9:16, a arena pode exibir sua própria logo e até 4 marcas parceiras configuradas no painel.
                                </p>
                            </div>
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF9] border border-[#EAE8E5] space-y-1.5">
                                <span className="text-[11px] font-mono font-black text-[#FF9900] uppercase block">
                                    02 — PÁGINA DE DOWNLOAD
                                </span>
                                <p className="text-xs text-[#68666B] leading-relaxed">
                                    Espaço dedicado para divulgação de parceiros diretamente na tela em que o atleta acessa e baixa o replay pelo QR Code.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DIREITA: MOCKUP DE SMARTPHONE ILUSTRATIVO */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="w-full max-w-[290px] rounded-[28px] bg-[#111111] p-3 text-white shadow-xl border border-[#EAE8E5]">
                            {/* Barra topo smartphone */}
                            <div className="flex items-center justify-between px-2 pb-2.5 text-[10px]">
                                <span className="font-black tracking-wider">
                                    FOX <span className="text-[#FF9900]">REPLAY</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-semibold">
                                    Sua Arena
                                </span>
                            </div>

                            {/* Vídeo esportivo com marca ilustrativa */}
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900">
                                <EditorialImage
                                    src="/images/para-arenas/esporte-beach-tennis.jpg"
                                    alt="Exemplo ilustrativo de vídeo com marca parceira"
                                    sizes="280px"
                                    className="object-cover"
                                />
                                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-white/95 text-[#111111] text-[8px] font-black uppercase tracking-wider shadow-xs">
                                    Logo Arena
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span className="w-9 h-9 rounded-full bg-[#FF9900] text-[#111111] flex items-center justify-center">
                                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Barra inferior ilustrativa de patrocinadores */}
                            <div className="mt-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block text-center">
                                    Parceiros Oficiais da Quadra
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold text-center">
                                    <span className="py-1.5 rounded-lg bg-white text-[#111111]">Patrocinador 01</span>
                                    <span className="py-1.5 rounded-lg bg-white text-[#111111]">Patrocinador 02</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
