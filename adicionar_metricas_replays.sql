-- ==============================================================================
-- FOX REPLAY — ADICIONAR COLUNAS DE MÉTRICAS (VISUALIZAÇÕES E DOWNLOADS)
-- Execute este script no SQL Editor do Supabase para ativar o rastreamento.
-- ==============================================================================

ALTER TABLE replays ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0;
ALTER TABLE replays ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;

-- Função atômica segura para incrementar visualizações
CREATE OR REPLACE FUNCTION incrementar_visualizacao(replay_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE replays 
    SET visualizacoes = COALESCE(visualizacoes, 0) + 1 
    WHERE id = replay_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função atômica segura para incrementar downloads
CREATE OR REPLACE FUNCTION incrementar_download(replay_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE replays 
    SET downloads = COALESCE(downloads, 0) + 1 
    WHERE id = replay_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
