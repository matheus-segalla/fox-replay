'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { montarUrlWhatsAppSuporte } from '@/lib/auth';

export default function Footer() {
    const urlSuporte = montarUrlWhatsAppSuporte('Olá equipe FOX Replay! Gostaria de falar com o suporte comercial para arenas.');

    return (
        <footer className="w-full border-t border-[#EAE8E5] py-10 z-10 bg-white/90 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <Link href="/" className="flex items-center gap-2.5 select-none">
                    <Image
                        src="/logo-fox.jpeg"
                        alt="Logo FOX Replay"
                        width={28}
                        height={28}
                        className="h-7 w-7 object-cover rounded-lg border border-[#EAE8E5] bg-[#111111]"
                    />
                    <span className="text-sm font-black tracking-wider uppercase text-[#111111]">
                        FOX <span className="text-[#FF9900]">REPLAY</span>
                    </span>
                </Link>

                <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#68666B]">
                    <Link href="/" className="hover:text-[#111111] transition-colors">
                        Início
                    </Link>
                    <Link href="/#arenas" className="hover:text-[#111111] transition-colors">
                        Arenas
                    </Link>
                    <a href="#como-funciona" className="hover:text-[#111111] transition-colors">
                        Como funciona
                    </a>
                    <a href="#faq" className="hover:text-[#111111] transition-colors">
                        FAQ
                    </a>
                    <a
                        href={urlSuporte}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#FF9900] transition-colors"
                    >
                        Suporte Comercial
                    </a>
                </nav>

                <p className="text-[11px] text-[#68666B] font-medium">
                    © {new Date().getFullYear()} FOX REPLAY. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
