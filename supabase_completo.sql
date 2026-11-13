-- ==============================================================================
-- FOX REPLAY — SCRIPT COMPLETO E DEFINITIVO DO BANCO DE DADOS (SUPABASE)
-- Execute este script inteiro no SQL Editor do seu Dashboard Supabase.
-- Pode ser executado com segurança mesmo que tabelas já existam (idempotente).
-- ==============================================================================

-- 1. HABILITAR EXTENSÃO UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELAS PRINCIPAIS DO SISTEMA
-- ==============================================================================

-- 2.1 TABELA: arenas
CREATE TABLE IF NOT EXISTS arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cidade TEXT,
    estado VARCHAR(2),
    foto_url TEXT,
    logo_url TEXT,
    patrocinadores JSONB DEFAULT '[]'::jsonb,
    limite_quadras INTEGER DEFAULT 2,
    plano_nome TEXT DEFAULT 'Plano Básico',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 TABELA: quadras
CREATE TABLE IF NOT EXISTS quadras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    foto_url TEXT,
    status TEXT DEFAULT 'ativa',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 TABELA: dispositivos (totens instalados nas quadras)
CREATE TABLE IF NOT EXISTS dispositivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quadra_id UUID REFERENCES quadras(id) ON DELETE CASCADE,
    token_autenticacao TEXT NOT NULL UNIQUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 TABELA: replays (jogadas gravadas pelos totens)
CREATE TABLE IF NOT EXISTS replays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quadra_id UUID REFERENCES quadras(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 TABELA: pareamentos (código de 6 dígitos estilo Smart TV para ativação rápida)
CREATE TABLE IF NOT EXISTS pareamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'vinculado', 'expirado'
    token_gerado TEXT,
    quadra_id UUID REFERENCES quadras(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    expira_em TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

-- ==============================================================================
-- 3. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_arenas_usuario ON arenas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_arenas_slug ON arenas(slug);
CREATE INDEX IF NOT EXISTS idx_quadras_arena ON quadras(arena_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_quadra ON dispositivos(quadra_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_token ON dispositivos(token_autenticacao);
CREATE INDEX IF NOT EXISTS idx_replays_quadra_data ON replays(quadra_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pareamentos_codigo ON pareamentos(codigo);

-- ==============================================================================
-- 4. BUCKET DE STORAGE (ARMAZENAMENTO DOS VÍDEOS .MP4)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('replays', 'replays', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o bucket 'replays'
DROP POLICY IF EXISTS "Acesso público de leitura aos vídeos" ON storage.objects;
CREATE POLICY "Acesso público de leitura aos vídeos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'replays');

DROP POLICY IF EXISTS "Upload de vídeos permitido" ON storage.objects;
CREATE POLICY "Upload de vídeos permitido"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'replays');

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) - BLINDAGEM DE TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadras ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareamentos ENABLE ROW LEVEL SECURITY;

-- 5.1 Políticas para 'arenas'
DROP POLICY IF EXISTS "Leitura pública de arenas" ON arenas;
CREATE POLICY "Leitura pública de arenas"
ON arenas FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Usuário autenticado pode criar arena" ON arenas;
CREATE POLICY "Usuário autenticado pode criar arena"
ON arenas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Dono pode gerenciar sua própria arena" ON arenas;
CREATE POLICY "Dono pode gerenciar sua própria arena"
ON arenas FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Dono pode excluir sua própria arena" ON arenas;
CREATE POLICY "Dono pode excluir sua própria arena"
ON arenas FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- 5.2 Políticas para 'quadras'
DROP POLICY IF EXISTS "Leitura pública de quadras" ON quadras;
CREATE POLICY "Leitura pública de quadras"
ON quadras FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Dono da arena pode criar quadra" ON quadras;
CREATE POLICY "Dono da arena pode criar quadra"
ON quadras FOR INSERT
TO authenticated
WITH CHECK (
    arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
);

DROP POLICY IF EXISTS "Dono da arena pode atualizar quadra" ON quadras;
CREATE POLICY "Dono da arena pode atualizar quadra"
ON quadras FOR UPDATE
TO authenticated
USING (
    arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
)
WITH CHECK (
    arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
);

DROP POLICY IF EXISTS "Dono da arena pode excluir quadra" ON quadras;
CREATE POLICY "Dono da arena pode excluir quadra"
ON quadras FOR DELETE
TO authenticated
USING (
    arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
);

-- 5.3 Políticas para 'dispositivos' (Blindado contra vazamento de tokens)
DROP POLICY IF EXISTS "Dono pode gerenciar dispositivos de suas quadras" ON dispositivos;
CREATE POLICY "Dono pode gerenciar dispositivos de suas quadras"
ON dispositivos FOR ALL
TO authenticated
USING (
    quadra_id IN (
        SELECT q.id FROM quadras q
        JOIN arenas a ON q.arena_id = a.id
        WHERE a.usuario_id = auth.uid()
    )
);

-- 5.4 Políticas para 'replays'
DROP POLICY IF EXISTS "Leitura pública de replays" ON replays;
CREATE POLICY "Leitura pública de replays"
ON replays FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Inserção de replays permitida" ON replays;
CREATE POLICY "Inserção de replays permitida"
ON replays FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Dono pode apagar replays da sua quadra" ON replays;
CREATE POLICY "Dono pode apagar replays da sua quadra"
ON replays FOR DELETE
TO authenticated
USING (
    quadra_id IN (
        SELECT q.id FROM quadras q
        JOIN arenas a ON q.arena_id = a.id
        WHERE a.usuario_id = auth.uid()
    )
);

-- 5.5 Políticas para 'pareamentos'
DROP POLICY IF EXISTS "Permissao total de pareamento" ON pareamentos;
CREATE POLICY "Permissao total de pareamento"
ON pareamentos FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 6. FUNÇÃO RPC SEGURA: VALIDAR TOTEM SEM VAZAR A TABELA
-- ==============================================================================
CREATE OR REPLACE FUNCTION validar_totem(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_quadra_id uuid;
BEGIN
    SELECT quadra_id INTO v_quadra_id
    FROM dispositivos
    WHERE token_autenticacao = p_token
    LIMIT 1;

    IF v_quadra_id IS NOT NULL THEN
        RETURN json_build_object(
            'valido', true,
            'quadra_id', v_quadra_id
        );
    ELSE
        RETURN json_build_object(
            'valido', false,
            'quadra_id', null
        );
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION validar_totem(text) TO anon, authenticated;

-- ==============================================================================
-- 7. ROTINA DE RETENÇÃO AUTOMÁTICA DE 14 DIAS (LGPD & ECONOMIA DE STORAGE)
-- ==============================================================================
CREATE OR REPLACE FUNCTION expurgar_replays_antigos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deletados integer;
BEGIN
    DELETE FROM replays
    WHERE criado_em < (NOW() - INTERVAL '14 days');

    GET DIAGNOSTICS v_deletados = ROW_COUNT;
    RETURN v_deletados;
END;
$$;
