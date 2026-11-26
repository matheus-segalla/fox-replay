-- ==============================================================================
-- FOX REPLAY — MIGRAÇÃO V4: TELEMETRIA DE ERROS E LOGS DOS TOTENS
-- Execute este script no SQL Editor do seu Dashboard Supabase.
-- Idempotente: pode ser executado com segurança sobre o banco com V3 aplicada.
-- ==============================================================================

-- 1. COLUNAS DE ÚLTIMO ERRO DIRETO NA TABELA DE DISPOSITIVOS (ACESSO RÁPIDO NO NOC)
ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS ultimo_erro TEXT;
ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS ultimo_erro_em TIMESTAMPTZ;

-- 2. TABELA DE HISTÓRICO DE EVENTOS / ERROS DO TOTEM
CREATE TABLE IF NOT EXISTS totem_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispositivo_id UUID NOT NULL REFERENCES dispositivos(id) ON DELETE CASCADE,
    nivel VARCHAR(16) NOT NULL DEFAULT 'error',
    categoria VARCHAR(32) NOT NULL DEFAULT 'sistema',
    mensagem TEXT NOT NULL,
    detalhes JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_totem_logs_dispositivo_criado
    ON totem_logs(dispositivo_id, criado_em DESC);

-- 3. RLS RESTRITA AO SUPER ADMIN (ESCRITA DO TOTEM VIA SERVICE_ROLE NO BACKEND)
ALTER TABLE totem_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Somente Super Admin lê logs dos totens" ON totem_logs;
CREATE POLICY "Somente Super Admin lê logs dos totens"
ON totem_logs FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
