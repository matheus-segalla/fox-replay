'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
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
            className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
                scrolled
                    ? 'bg-[#FCFBF9]/95 backdrop-blur-md border-[#EAE8E5] shadow-[0_4px_20px_-8px_rgba(17,17,17,0.08)] py-3'
                    : 'bg-[#FCFBF9]/85 backdrop-blur-sm border-[#EAE8E5]/80 py-3.5'
            }`}
        >
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-4">
                {/* LOGOTIPO */}
                <Link href="/" className="flex items-center gap-2.5 select-none group shrink-0">
                    <Image
                        src="/logo-fox.jpeg"
                        alt="Logo FOX Replay"
                        width={36}
                        height={36}
                        priority
                        className="h-9 w-9 object-cover rounded-xl border border-[#EAE8E5] shadow-xs bg-[#111111] group-hover:border-[#FF9900] transition-colors"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black tracking-wider uppercase text-[#111111] leading-none">
                            FOX <span className="text-[#FF9900]">REPLAY</span>
                        </span>
                        <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-[#F7EBD7] text-[#111111] border border-[#EAE8E5] px-2.5 py-0.5 rounded-full">
                            Arenas
                        </span>
                    </div>
                </Link>

                {/* NAVEGAÇÃO DESKTOP */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#68666B]">
                    <Link href="/" className="hover:text-[#111111] transition-colors">
                        Início
                    </Link>
                    <span className="text-[#111111] border-b-2 border-[#FF9900] pb-0.5">
                        Para Arenas
                    </span>
                    <button
                        type="button"
                        onClick={() => scrollTo('como-funciona')}
                        className="hover:text-[#111111] transition-colors cursor-pointer"
                    >
                        Como funciona
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('faq')}
                        className="hover:text-[#111111] transition-colors cursor-pointer"
                    >
                        FAQ
                    </button>
                </nav>

                {/* CTA PRINCIPAL + MENU MOBILE */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => scrollTo('contato')}
                        className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Solicitar demonstração
                    </button>

                    <button
                        type="button"
                        onClick={() => setMenuAberto(!menuAberto)}
                        aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                        className="md:hidden w-10 h-10 rounded-xl bg-white border border-[#EAE8E5] text-[#111111] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {menuAberto ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* DROPDOWN MOBILE COMPACTO */}
            {menuAberto && (
                <div className="md:hidden border-t border-[#EAE8E5] bg-[#FCFBF9] px-4 py-4 space-y-2 animate-fadeIn">
                    <Link
                        href="/"
                        onClick={() => setMenuAberto(false)}
                        className="block px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#68666B] hover:bg-white hover:text-[#111111]"
                    >
                        Início
                    </Link>
                    <button
                        type="button"
                        onClick={() => scrollTo('como-funciona')}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#68666B] hover:bg-white hover:text-[#111111] cursor-pointer"
                    >
                        Como funciona
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('faq')}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#68666B] hover:bg-white hover:text-[#111111] cursor-pointer"
                    >
                        FAQ
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('contato')}
                        className="w-full mt-2 px-4 py-3 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs uppercase tracking-wider text-center cursor-pointer"
                    >
                        Solicitar demonstração
                    </button>
                </div>
            )}
        </header>
    );
}
