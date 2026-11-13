-- ==============================================================================
-- FOX REPLAY — ADICIONAR LOGO E PATROCINADORES NA TABELA ARENAS
-- Execute este script no SQL Editor do Supabase se desejar persistir no banco.
-- ==============================================================================

ALTER TABLE arenas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS patrocinadores JSONB DEFAULT '[]'::jsonb;

-- Comentários descritivos nas colunas
COMMENT ON COLUMN arenas.logo_url IS 'URL da logomarca oficial da arena para sobreposição nos vídeos gravados';
COMMENT ON COLUMN arenas.patrocinadores IS 'Lista de até 4 patrocinadores [{ id, nome, logo_url, ativo, link }] para a barra inferior do vídeo';
