-- ==============================================================================
-- FOX REPLAY — TABELA DE FAVORITOS (LANCES SALVOS PELOS ATLETAS)
-- Execute no SQL Editor do seu Dashboard Supabase.
-- ==============================================================================

-- 1. CRIAÇÃO DA TABELA DE FAVORITOS DO ATLETA
CREATE TABLE IF NOT EXISTS favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    replay_id UUID REFERENCES replays(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT favoritos_usuario_replay_unique UNIQUE (usuario_id, replay_id)
);

-- 2. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_replay ON favoritos(replay_id);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURANÇA (RLS)
DROP POLICY IF EXISTS "Atletas podem ler seus proprios lances favoritos" ON favoritos;
CREATE POLICY "Atletas podem ler seus proprios lances favoritos"
ON favoritos FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Atletas podem favoritar lances" ON favoritos;
CREATE POLICY "Atletas podem favoritar lances"
ON favoritos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Atletas podem remover seus favoritos" ON favoritos;
CREATE POLICY "Atletas podem remover seus favoritos"
ON favoritos FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- ==============================================================================
-- 5. REGRA DE RETENÇÃO DE 14 DIAS (PROTEGE LANCES SALVOS)
-- ==============================================================================
-- Esta query deve ser executada periodicamente (via Edge Function ou Cron Job)
-- Ela exclui replays gerais após 14 dias, MAS PRESERVA para sempre os que
-- foram favoritados por qualquer atleta.
--
-- DELETE FROM replays
-- WHERE criado_em < NOW() - INTERVAL '14 days'
--   AND id NOT IN (SELECT replay_id FROM favoritos);
-- ==============================================================================
