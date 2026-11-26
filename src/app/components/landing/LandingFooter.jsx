'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-[#EAE8E5] bg-[#FCFBF9]/95 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Logotipo */}
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <Image
            src="/logo-fox.jpeg"
            alt="Logo Fox Replay"
            width={30}
            height={30}
            className="h-7 w-7 object-cover rounded-lg border border-[#EAE8E5] bg-white"
          />
          <span className="text-sm font-black tracking-[0.14em] uppercase text-[#111111]">
            FOX <span className="text-[#FF9900]">REPLAY</span>
          </span>
        </Link>

        {/* Links institucionais, arenas e suporte */}
        <nav
          aria-label="Links do rodapé"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#68666B]"
        >
          <Link href="/entrar" className="hover:text-[#111111] transition-colors">
            Acesso Atleta e Gestor
          </Link>
          <Link href="/para-arenas" className="hover:text-[#FF9900] transition-colors">
            Para Arenas
          </Link>
          <Link href="/para-arenas#faq" className="hover:text-[#111111] transition-colors">
            Suporte e Dúvidas
          </Link>
        </nav>

        {/* Direitos reservados */}
        <p className="text-[11px] text-[#68666B] font-medium">
          © {new Date().getFullYear()} FOX REPLAY. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
