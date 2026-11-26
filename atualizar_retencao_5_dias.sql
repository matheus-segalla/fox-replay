-- ==============================================================================
-- MIGRATION: REDUÇÃO DA RETENÇÃO DE REPLAYS NA NUVEM DE 14 DIAS PARA 5 DIAS
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase para atualizar a função
-- de expurgo automático para 5 dias, preservando todos os lances favoritados.
-- ==============================================================================

DROP FUNCTION IF EXISTS public.expurgar_replays_antigos();
CREATE OR REPLACE FUNCTION public.expurgar_replays_antigos()
RETURNS TABLE (id UUID, video_url TEXT, thumbnail_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    DELETE FROM replays r
    WHERE r.criado_em < (NOW() - INTERVAL '5 days')
      AND NOT EXISTS (
          SELECT 1 FROM favoritos f WHERE f.replay_id = r.id
      )
    RETURNING r.id, r.video_url, r.thumbnail_url;
END;
$$;

REVOKE ALL ON FUNCTION public.expurgar_replays_antigos() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expurgar_replays_antigos() TO service_role;
