'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Footer() {
    const router = useRouter();

    return (
        <footer className="w-full border-t border-white/10 py-10 z-10 bg-[#14151c]/90 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                    onClick={() => router.push('/')}
                >
                    <Image
                        src="/logo-fox.jpeg"
                        alt="Logo Fox Replay"
                        width={28}
                        height={28}
                        className="h-7 w-7 object-cover rounded-lg border border-zinc-800 bg-zinc-900"
                    />
                    <span className="text-sm font-black tracking-widest uppercase text-white">
                        FOX <span className="text-amber-500">REPLAY</span>
                    </span>
                </div>

                <p className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold">
                    © {new Date().getFullYear()} FOX REPLAY &bull; TECNOLOGIA INTELIGENTE PARA ARENAS ESPORTIVAS
                </p>

                <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        Voltar ao Topo ↑
                    </button>
                </div>
            </div>
        </footer>
    );
}
