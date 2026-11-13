-- ==============================================================================
-- FOX REPLAY — ADICIONAR COTA DE QUADRAS E PLANOS NA TABELA ARENAS
-- Execute este script no SQL Editor do Supabase se desejar persistir o campo.
-- ==============================================================================

ALTER TABLE arenas ADD COLUMN IF NOT EXISTS limite_quadras INTEGER DEFAULT 2;
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS plano_nome TEXT DEFAULT 'Plano Básico';

-- Atualiza arenas existentes que estejam com limite nulo para o padrão 2
UPDATE arenas SET limite_quadras = 2 WHERE limite_quadras IS NULL;
UPDATE arenas SET plano_nome = 'Plano Inicial' WHERE plano_nome IS NULL;
