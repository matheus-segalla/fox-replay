import React from 'react';

export default function BusinessOpportunities() {
    return (
        <section id="oportunidades" className="scroll-mt-28 space-y-12">
            {/* CABEÇALHO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    Novas Linhas de Receita
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    Sua arena também pode <br />
                    <span className="text-zinc-400">transformar replays em oportunidades.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Os vídeos gerados na quadra podem abrir espaço para parcerias com marcas locais, lojas parceiras e patrocinadores de torneios.
                </p>
            </div>

            {/* CARD PRINCIPAL COM ILUSTRAÇÃO VISUAL DE PATROCÍNIO */}
            <div className="glass-card-dark rounded-3xl p-7 sm:p-10 border border-white/10 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* EXPLICAÇÃO COMERCIAL */}
                    <div className="lg:col-span-7 space-y-5">
                        <div className="space-y-3">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                                Visibilidade Hiperlocal
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                                Patrocínio Local nos Melhores Momentos
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                Imagine uma clínica médica, loja esportiva, concessionária ou restaurante local patrocinando a gravação de lances da arena. Sempre que o atleta baixa o replay e posta no Instagram ou envia no grupo, a marca do patrocinador ganha exposição altamente qualificada.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                                <span className="text-xs font-bold text-amber-400 uppercase">
                                    01. Marca D&apos;água no Vídeo
                                </span>
                                <p className="text-[11px] text-zinc-400">
                                    Logo do patrocinador aplicada discretamente no take exportado para as redes.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                                <span className="text-xs font-bold text-amber-400 uppercase">
                                    02. Banner na Página de Download
                                </span>
                                <p className="text-[11px] text-zinc-400">
                                    Exposição com link para oferta ou cupom na tela aberta pelo QR Code da quadra.
                                </p>
                            </div>
                        </div>

                        <p className="text-[11px] text-zinc-500 italic pt-1">
                            * Apresentamos essa possibilidade como uma oportunidade comercial que a tecnologia viabiliza para a arena, e não como promessa de faturamento garantido.
                        </p>
                    </div>

                    {/* MOCKUP VISUAL DE VÍDEO COM MARCA DO PATROCINADOR */}
                    <div className="lg:col-span-5 bg-black/50 border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                QUADRA 01 &bull; REPLAY 30S
                            </span>
                            <span className="text-amber-400 font-bold">1080p FULL HD</span>
                        </div>

                        {/* TELA SIMULADA DO REPLAY */}
                        <div className="aspect-video rounded-xl bg-zinc-900/90 border border-white/10 relative overflow-hidden flex flex-col justify-between p-3.5">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-mono bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white border border-white/10">
                                    FOX REPLAY
                                </span>
                                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 backdrop-blur-sm px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                                    PATROCINADOR OFICIAL
                                </span>
                            </div>

                            <div className="text-center py-4">
                                <span className="text-2xl opacity-75">🎾</span>
                                <span className="block text-[11px] font-bold text-white uppercase mt-1">
                                    Ponto Decisivo &bull; Smash na Linha
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-[9px] text-zinc-400 border-t border-white/10 pt-1.5">
                                <span>Arena Sunset Beach Tennis</span>
                                <span className="text-emerald-400 font-bold">✓ Pronto para Baixar</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <span className="text-[10px] font-mono text-zinc-400">
                                Modelo de inserção visual entregue na plataforma
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
