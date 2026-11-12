'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redireciona de forma transparente para o novo Feed Unificado com a quadra já pré-selecionada
export default function RedirecionarParaFeedUnificado() {
    const params = useParams();
    const router = useRouter();
    const { arenaId, quadraId } = params;

    useEffect(() => {
        if (arenaId && quadraId) {
            router.replace(`/arena/${arenaId}?quadra=${quadraId}`);
        } else if (arenaId) {
            router.replace(`/arena/${arenaId}`);
        } else {
            router.replace('/');
        }
    }, [arenaId, quadraId, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50">
            <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="animate-pulse text-zinc-500 font-bold tracking-widest text-xs uppercase">Carregando Feed da Quadra...</p>
            </div>
        </div>
    );
}
