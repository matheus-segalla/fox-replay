import { supabase } from './supabase';

/**
 * Executa fetch autenticado injetando automaticamente o Bearer token
 * da sessão atual do Supabase e padronizando o tratamento de erros JSON.
 */
export async function fetchComToken(url, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token || '';
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.error || `Erro na requisição (${res.status}).`);
  }

  return json;
}
