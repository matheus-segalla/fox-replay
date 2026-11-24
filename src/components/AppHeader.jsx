'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isSuperAdmin } from '@/lib/auth';

function getIniciais(nome) {
  if (!nome) return 'FR';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/**
 * Cabeçalho global unificado com seletor contextual por papel:
 * - Super Admin: [NOC Admin | Painel Arenas | Meu Perfil]
 * - Gestor de Arena: [Minha Arena | Meu Perfil]
 * - Atleta: [Meu Perfil]
 * - Visitante: [Entrar]
 */
export default function AppHeader({
  theme = 'light',
  activeRoute = 'home',
  badge = null,
  lancesFavoritosCount = 0,
  showLogout = false,
  onLogout = null,
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [ehSuperAdmin, setEhSuperAdmin] = useState(false);
  const [ehGestor, setEhGestor] = useState(false);
  const [sessaoChecada, setSessaoChecada] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function carregarPapel(user) {
      if (!user) {
        if (!cancelado) {
          setUsuario(null);
          setEhSuperAdmin(false);
          setEhGestor(false);
          setSessaoChecada(true);
        }
        return;
      }

      const superAdmin = isSuperAdmin(user);
      let possuiArena = false;

      if (!superAdmin) {
        try {
          const { count } = await supabase
            .from('arenas')
            .select('id', { count: 'exact', head: true })
            .eq('usuario_id', user.id);
          possuiArena = (count || 0) > 0;
        } catch {}
      }

      if (!cancelado) {
        setUsuario(user);
        setEhSuperAdmin(superAdmin);
        setEhGestor(possuiArena);
        setSessaoChecada(true);
      }
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => carregarPapel(session?.user || null))
      .catch(() => {
        if (!cancelado) setSessaoChecada(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      carregarPapel(session?.user || null);
    });

    return () => {
      cancelado = true;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSair = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    await supabase.auth.signOut();
    try {
      localStorage.removeItem('fox_arena_id');
    } catch {}
    router.push('/');
  };

  const isDark = theme === 'dark';

  const pillClass = (ativo) => {
    if (isDark) {
      return ativo
        ? 'bg-amber-500 text-zinc-950 font-black border border-amber-400 shadow-xs'
        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold';
    }
    return ativo
      ? 'bg-zinc-900 text-white font-black border border-zinc-900 shadow-xs'
      : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-200 font-bold';
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors safe-pt ${
        isDark
          ? 'border-zinc-800 bg-zinc-950/85 text-white'
          : 'border-zinc-200/80 bg-white/85 text-zinc-900 shadow-xs'
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-6 h-16 flex justify-between items-center gap-2 sm:gap-3">
        {/* BRAND */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 select-none shrink-0">
          <Image
            src="/logo-fox.jpeg"
            alt="Logo Fox Replay"
            width={36}
            height={36}
            priority
            className={`h-9 w-9 object-cover rounded-xl border shadow-xs ${
              isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'
            }`}
          />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`text-sm sm:text-lg font-black tracking-widest uppercase leading-none ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              FOX <span className="text-amber-500">REPLAY</span>
            </span>
            {badge && (
              <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
        </Link>

        {/* SELETOR CONTEXTUAL POR PAPEL */}
        <nav aria-label="Navegação principal" className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {!usuario && lancesFavoritosCount > 0 && activeRoute === 'home' && (
            <Link
              href="/perfil"
              className="text-xs font-bold text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px] active:scale-95 cursor-pointer"
            >
              <span>★ Meus Lances</span>
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-black px-1.5 rounded-full">
                {lancesFavoritosCount}
              </span>
            </Link>
          )}

          {usuario && ehSuperAdmin && (
            <>
              <Link
                href="/admin"
                className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center active:scale-95 cursor-pointer ${pillClass(
                  activeRoute === 'admin'
                )}`}
              >
                <span className="sm:hidden">NOC</span>
                <span className="hidden sm:inline">NOC Admin</span>
              </Link>
              <Link
                href="/dashboard"
                className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center active:scale-95 cursor-pointer ${pillClass(
                  activeRoute === 'dashboard'
                )}`}
              >
                <span className="sm:hidden">Arenas</span>
                <span className="hidden sm:inline">Painel Arenas</span>
              </Link>
              <Link
                href="/perfil"
                className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center active:scale-95 cursor-pointer ${pillClass(
                  activeRoute === 'perfil'
                )}`}
              >
                <span className="sm:hidden">Perfil</span>
                <span className="hidden sm:inline">Meu Perfil</span>
              </Link>
            </>
          )}

          {usuario && !ehSuperAdmin && ehGestor && (
            <>
              <Link
                href="/dashboard"
                className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center active:scale-95 cursor-pointer ${pillClass(
                  activeRoute === 'dashboard'
                )}`}
              >
                <span className="sm:hidden">Arena</span>
                <span className="hidden sm:inline">Minha Arena</span>
              </Link>
              <Link
                href="/perfil"
                className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center active:scale-95 cursor-pointer ${pillClass(
                  activeRoute === 'perfil'
                )}`}
              >
                <span className="sm:hidden">Perfil</span>
                <span className="hidden sm:inline">Meu Perfil</span>
              </Link>
            </>
          )}

          {usuario && !ehSuperAdmin && !ehGestor && (
            <Link
              href="/perfil"
              className={`text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap min-h-[40px] active:scale-95 cursor-pointer ${pillClass(
                activeRoute === 'perfil'
              )}`}
            >
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-black flex items-center justify-center">
                {getIniciais(usuario.user_metadata?.nome_completo || usuario.email)}
              </span>
              <span className="sm:hidden">Perfil</span>
              <span className="hidden sm:inline">Meu Perfil</span>
            </Link>
          )}

          {sessaoChecada && !usuario && (
            <Link
              href="/entrar"
              className={`text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap min-h-[40px] flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              }`}
            >
              Entrar
            </Link>
          )}

          {usuario && showLogout && (
            <button
              type="button"
              onClick={handleSair}
              className={`text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl border transition-all whitespace-nowrap cursor-pointer min-h-[40px] flex items-center justify-center active:scale-95 ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-red-400 hover:border-red-500/40'
                  : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
