'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        setMenuAberto(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled
                    ? 'border-b border-white/10 backdrop-blur-xl bg-[#14151c]/90 shadow-2xl py-3'
                    : 'border-b border-transparent bg-transparent py-4'
            }`}
        >
            <div className="w-full max-w-6xl mx-auto px-5 flex justify-between items-center">
                {/* BRAND */}
                <div
                    className="flex items-center gap-3 select-none cursor-pointer group"
                    onClick={() => router.push('/')}
                >
                    <Image
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        width={36}
                        height={36}
                        priority
                        className="h-9 w-9 object-cover rounded-xl border border-zinc-800 shadow-xs bg-zinc-900 group-hover:border-amber-500/50 transition-colors"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-widest uppercase text-white leading-none">
                            FOX <span className="text-amber-500">REPLAY</span>
                        </span>
                        <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                            Arenas
                        </span>
                    </div>
                </div>

                {/* LINKS DESKTOP */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
                    <button
                        onClick={() => scrollTo('experiencia')}
                        className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        A Experiência
                    </button>
                    <button
                        onClick={() => scrollTo('como-funciona')}
                        className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        Como Funciona
                    </button>
                    <button
                        onClick={() => scrollTo('modalidades')}
                        className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        Modalidades
                    </button>
                    <button
                        onClick={() => scrollTo('implantacao')}
                        className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        Implantação
                    </button>
                    <button
                        onClick={() => scrollTo('faq')}
                        className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        FAQ
                    </button>
                </nav>

                {/* BOTÕES DE AÇÃO */}
                <div className="hidden sm:flex items-center gap-3">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-xs font-bold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl transition-colors"
                    >
                        Painel da Arena
                    </button>
                    <button
                        onClick={() => scrollTo('contato')}
                        className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 px-4 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
                    >
                        Avaliar Minha Arena ↗
                    </button>
                </div>

                {/* BOTÃO MOBILE */}
                <button
                    onClick={() => setMenuAberto(!menuAberto)}
                    className="md:hidden text-zinc-300 hover:text-white p-2.5 rounded-xl bg-white/5 border border-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer active:scale-95"
                    aria-label="Abrir Menu de Navegação"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {menuAberto ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* MENU MOBILE EXPANSÍVEL */}
            {menuAberto && (
                <div className="md:hidden px-5 pt-4 pb-6 bg-[#14151c]/98 border-b border-white/10 space-y-4 animate-fadeIn">
                    <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-zinc-300">
                        <button
                            onClick={() => scrollTo('experiencia')}
                            className="text-left py-2 px-2 rounded-lg hover:text-amber-400 hover:bg-white/5 transition-all min-h-[40px] flex items-center cursor-pointer"
                        >
                            A Experiência
                        </button>
                        <button
                            onClick={() => scrollTo('como-funciona')}
                            className="text-left py-2 px-2 rounded-lg hover:text-amber-400 hover:bg-white/5 transition-all min-h-[40px] flex items-center cursor-pointer"
                        >
                            Como Funciona
                        </button>
                        <button
                            onClick={() => scrollTo('modalidades')}
                            className="text-left py-2 px-2 rounded-lg hover:text-amber-400 hover:bg-white/5 transition-all min-h-[40px] flex items-center cursor-pointer"
                        >
                            Modalidades
                        </button>
                        <button
                            onClick={() => scrollTo('implantacao')}
                            className="text-left py-2 px-2 rounded-lg hover:text-amber-400 hover:bg-white/5 transition-all min-h-[40px] flex items-center cursor-pointer"
                        >
                            Implantação
                        </button>
                        <button
                            onClick={() => scrollTo('faq')}
                            className="text-left py-2 px-2 rounded-lg hover:text-amber-400 hover:bg-white/5 transition-all min-h-[40px] flex items-center cursor-pointer"
                        >
                            FAQ
                        </button>
                    </nav>

                    <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full text-center py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-200 min-h-[44px] cursor-pointer active:scale-95 transition-all"
                        >
                            Painel da Arena
                        </button>
                        <button
                            onClick={() => scrollTo('contato')}
                            className="w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider min-h-[44px] cursor-pointer active:scale-95 transition-all shadow-md"
                        >
                            Avaliar Minha Arena ↗
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
