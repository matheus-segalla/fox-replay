'use client';

import React, { useState, useEffect } from 'react';

export default function MobileStickyCta() {
    const [ocultar, setOcultar] = useState(false);

    useEffect(() => {
        const alvo = document.getElementById('contato');
        if (!alvo || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setOcultar(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(alvo);
        return () => observer.disconnect();
    }, []);

    if (ocultar) return null;

    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#FCFBF9]/95 backdrop-blur-md border-t border-[#EAE8E5] shadow-[0_-8px_24px_-12px_rgba(17,17,17,0.12)]">
            <button
                type="button"
                onClick={() => {
                    const el = document.getElementById('contato');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] font-extrabold text-xs uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
            >
                Solicitar avaliação da minha arena
            </button>
        </div>
    );
}
