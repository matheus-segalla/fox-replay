import React from 'react';

export default function ExperienceSection() {
    return (
        <section id="experiencia" className="scroll-mt-28 space-y-12">
            {/* CABEÇALHO DA SEÇÃO */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                    A Experiência do Atleta
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                    O esporte acontece dentro da quadra. <br />
                    <span className="text-zinc-400">A experiência continua depois dela.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Uma jogada incrível merece mais do que alguns segundos de comemoração. Com o FOX Replay, os atletas podem rever aquele ponto decisivo, vibrar com os amigos e levar uma lembrança marcante da sua arena.
                </p>
            </div>

            {/* DUPLA DE CARDS DE EXPERIÊNCIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CARD 1: REVIVA O MOMENTO */}
                <div className="glass-card-dark rounded-3xl p-7 sm:p-9 space-y-5 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                            01 &bull; Emoção em Tempo Real
                        </span>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">
                            Reviva o Momento Decisivo
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                            Aquele smash fulminante, a defesa impossível ou o ponto do match point não se perdem no tempo. Em segundos após o ponto, o replay em alta definição já está pronto para visualização.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3 text-xs text-zinc-300 font-medium border-t border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Replay pronto em menos de 8 segundos</span>
                    </div>
                </div>

                {/* CARD 2: COMPARTILHE O LANCE */}
                <div className="glass-card-dark rounded-3xl p-7 sm:p-9 space-y-5 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                            02 &bull; Engajamento & Viralização
                        </span>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">
                            Compartilhe nas Redes Sociais
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                            O atleta baixa o vídeo direto na galeria do celular e posta nos Stories, Reels e grupos de WhatsApp. A marca da sua arena viaja junto a cada compartilhamento espontâneo.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3 text-xs text-zinc-300 font-medium border-t border-white/5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Divulgação espontânea constante da sua marca</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
