-- ==============================================================================
-- FOX REPLAY — MIGRAÇÃO V2: BLINDAGEM DE SEGURANÇA, RLS, RPCs ATÔMICAS E ESCALA
-- Execute este script completo no SQL Editor do seu Dashboard Supabase.
-- Idempotente: pode ser executado com segurança sobre um banco já existente.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. EVOLUÇÃO DE SCHEMA E TABELA FAVORITOS (CASO AINDA NÃO EXISTA)
-- ==============================================================================
ALTER TABLE replays ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE replays ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0;
ALTER TABLE replays ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;

ALTER TABLE pareamentos ADD COLUMN IF NOT EXISTS camera_url TEXT;
ALTER TABLE pareamentos ADD COLUMN IF NOT EXISTS pair_secret TEXT;

ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS camera_url TEXT;

ALTER TABLE arenas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS patrocinadores JSONB DEFAULT '[]'::jsonb;
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS limite_quadras INTEGER DEFAULT 2;
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS plano_nome TEXT DEFAULT 'Plano Básico';

CREATE TABLE IF NOT EXISTS favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    replay_id UUID REFERENCES replays(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT favoritos_usuario_replay_unique UNIQUE (usuario_id, replay_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_replay ON favoritos(replay_id);
CREATE INDEX IF NOT EXISTS idx_replays_criado_em ON replays(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pareamentos_status_expira ON pareamentos(status, expira_em);

-- ==============================================================================
-- 2. FUNÇÃO AUXILIAR DE SUPER ADMIN (BASEADA APENAS EM app_metadata DO JWT)
-- IMPORTANTE: app_metadata NÃO pode ser alterado pelo próprio usuário via API.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin', false);
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;

-- ==============================================================================
-- 3. TRIGGERS DE INTEGRIDADE: COTA DE QUADRAS E PROTEÇÃO DE PLANO
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.proteger_campos_plano_arena()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Permite alterações livres via SQL Editor / service_role ou por Super Admin
    IF auth.role() = 'authenticated' AND NOT public.is_super_admin() THEN
        IF NEW.limite_quadras IS DISTINCT FROM OLD.limite_quadras THEN
            RAISE EXCEPTION 'Apenas administradores Fox Replay podem alterar o limite de quadras.';
        END IF;
        IF NEW.plano_nome IS DISTINCT FROM OLD.plano_nome THEN
            RAISE EXCEPTION 'Apenas administradores Fox Replay podem alterar o plano da arena.';
        END IF;
        IF NEW.usuario_id IS DISTINCT FROM OLD.usuario_id THEN
            RAISE EXCEPTION 'Transferência de titularidade da arena requer autorização administrativa.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_campos_plano_arena ON arenas;
CREATE TRIGGER trg_proteger_campos_plano_arena
BEFORE UPDATE ON arenas
FOR EACH ROW
EXECUTE FUNCTION public.proteger_campos_plano_arena();

-- Impede que cadastros via cliente criem arenas com limite_quadras arbitrário (ex: 9999)
CREATE OR REPLACE FUNCTION public.limitar_cota_inicial_arena()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF auth.role() = 'authenticated' AND NOT public.is_super_admin() THEN
        NEW.limite_quadras := LEAST(GREATEST(COALESCE(NEW.limite_quadras, 2), 1), 6);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limitar_cota_inicial_arena ON arenas;
CREATE TRIGGER trg_limitar_cota_inicial_arena
BEFORE INSERT ON arenas
FOR EACH ROW
EXECUTE FUNCTION public.limitar_cota_inicial_arena();

CREATE OR REPLACE FUNCTION public.forcar_limite_quadras()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_limite INTEGER;
    v_total INTEGER;
BEGIN
    IF auth.role() = 'authenticated' AND NOT public.is_super_admin() THEN
        SELECT COALESCE(limite_quadras, 2)
        INTO v_limite
        FROM arenas
        WHERE id = NEW.arena_id
        FOR UPDATE;

        IF v_limite IS NULL THEN
            RAISE EXCEPTION 'Arena não encontrada.';
        END IF;

        SELECT COUNT(*)
        INTO v_total
        FROM quadras
        WHERE arena_id = NEW.arena_id;

        IF v_total >= v_limite THEN
            RAISE EXCEPTION 'Cota máxima de % quadra(s) atingida para esta arena.', v_limite;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forcar_limite_quadras ON quadras;
CREATE TRIGGER trg_forcar_limite_quadras
BEFORE INSERT ON quadras
FOR EACH ROW
EXECUTE FUNCTION public.forcar_limite_quadras();

-- ==============================================================================
-- 4. BLINDAGEM DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadras ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- 4.1 ARENAS
DROP POLICY IF EXISTS "Leitura pública de arenas" ON arenas;
CREATE POLICY "Leitura pública de arenas"
ON arenas FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Usuário autenticado pode criar arena" ON arenas;
CREATE POLICY "Usuário autenticado pode criar arena"
ON arenas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id OR public.is_super_admin());

DROP POLICY IF EXISTS "Dono pode gerenciar sua própria arena" ON arenas;
CREATE POLICY "Dono pode gerenciar sua própria arena"
ON arenas FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id OR public.is_super_admin())
WITH CHECK (auth.uid() = usuario_id OR public.is_super_admin());

DROP POLICY IF EXISTS "Dono pode excluir sua própria arena" ON arenas;
CREATE POLICY "Dono pode excluir sua própria arena"
ON arenas FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id OR public.is_super_admin());

-- 4.2 QUADRAS
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
    public.is_super_admin()
    OR arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
);

DROP POLICY IF EXISTS "Dono da arena pode atualizar quadra" ON quadras;
CREATE POLICY "Dono da arena pode atualizar quadra"
ON quadras FOR UPDATE
TO authenticated
USING (
    public.is_super_admin()
    OR arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
)
WITH CHECK (
    public.is_super_admin()
    OR arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
);

DROP POLICY IF EXISTS "Dono da arena pode excluir quadra" ON quadras;
CREATE POLICY "Dono da arena pode excluir quadra"
ON quadras FOR DELETE
TO authenticated
USING (
    public.is_super_admin()
    OR arena_id IN (SELECT id FROM arenas WHERE usuario_id = auth.uid())
);

-- 4.3 DISPOSITIVOS (Zero acesso anônimo; dono ou super_admin autenticados)
DROP POLICY IF EXISTS "Dono pode gerenciar dispositivos de suas quadras" ON dispositivos;
CREATE POLICY "Dono pode gerenciar dispositivos de suas quadras"
ON dispositivos FOR ALL
TO authenticated
USING (
    public.is_super_admin()
    OR quadra_id IN (
        SELECT q.id FROM quadras q
        JOIN arenas a ON q.arena_id = a.id
        WHERE a.usuario_id = auth.uid()
    )
)
WITH CHECK (
    public.is_super_admin()
    OR quadra_id IN (
        SELECT q.id FROM quadras q
        JOIN arenas a ON q.arena_id = a.id
        WHERE a.usuario_id = auth.uid()
    )
);

-- 4.4 REPLAYS (Leitura pública; INSERT somente via backend autenticado / service_role)
DROP POLICY IF EXISTS "Leitura pública de replays" ON replays;
CREATE POLICY "Leitura pública de replays"
ON replays FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Inserção de replays permitida" ON replays;

DROP POLICY IF EXISTS "Dono pode apagar replays da sua quadra" ON replays;
CREATE POLICY "Dono pode apagar replays da sua quadra"
ON replays FOR DELETE
TO authenticated
USING (
    public.is_super_admin()
    OR quadra_id IN (
        SELECT q.id FROM quadras q
        JOIN arenas a ON q.arena_id = a.id
        WHERE a.usuario_id = auth.uid()
    )
);

-- 4.5 PAREAMENTOS (Fecha completamente acesso direto — apenas RPC atômica e backend service_role)
DROP POLICY IF EXISTS "Permissao total de pareamento" ON pareamentos;
DROP POLICY IF EXISTS "Permissao de pareamento" ON pareamentos;

-- 4.6 FAVORITOS
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

-- 4.7 STORAGE BUCKET 'replays' (Fecha upload anônimo; mantém leitura pública de vídeos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('replays', 'replays', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Acesso público de leitura aos vídeos" ON storage.objects;
CREATE POLICY "Acesso público de leitura aos vídeos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'replays');

DROP POLICY IF EXISTS "Upload de vídeos permitido" ON storage.objects;

-- ==============================================================================
-- 5. RPC ATÔMICA E SEGURA: PAREAMENTO DE TOTEM POR CÓDIGO DE 6 DÍGITOS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.vincular_totem_por_codigo(
    p_codigo TEXT,
    p_quadra_id UUID,
    p_camera_url TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID;
    v_codigo_norm TEXT;
    v_pareamento_id UUID;
    v_token TEXT;
    v_camera_limpa TEXT;
    v_autorizado BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação obrigatória para vincular um totem.';
    END IF;

    -- Verifica se o chamador é dono da quadra ou Super Admin
    SELECT EXISTS (
        SELECT 1
        FROM quadras q
        JOIN arenas a ON q.arena_id = a.id
        WHERE q.id = p_quadra_id
          AND (a.usuario_id = v_uid OR public.is_super_admin())
    ) INTO v_autorizado;

    IF NOT v_autorizado THEN
        RAISE EXCEPTION 'Você não tem permissão para vincular dispositivos a esta quadra.';
    END IF;

    -- Normaliza o código (ex: "852149" -> "852-149")
    v_codigo_norm := UPPER(TRIM(COALESCE(p_codigo, '')));
    IF LENGTH(v_codigo_norm) = 6 AND POSITION('-' IN v_codigo_norm) = 0 THEN
        v_codigo_norm := SUBSTRING(v_codigo_norm FROM 1 FOR 3) || '-' || SUBSTRING(v_codigo_norm FROM 4 FOR 3);
    END IF;

    -- Bloqueia a linha pendente e válida para evitar dupla vinculação concorrente
    SELECT id
    INTO v_pareamento_id
    FROM pareamentos
    WHERE codigo = v_codigo_norm
      AND status = 'pendente'
      AND (expira_em IS NULL OR expira_em > NOW())
    FOR UPDATE;

    IF v_pareamento_id IS NULL THEN
        RAISE EXCEPTION 'Código do Totem não encontrado, expirado ou já vinculado. Verifique o código na TV da quadra.';
    END IF;

    v_camera_limpa := NULLIF(TRIM(COALESCE(p_camera_url, '')), '');

    -- Gera token criptograficamente seguro (192 bits de entropia)
    v_token := 'fox_tok_' || encode(gen_random_bytes(24), 'hex');

    INSERT INTO dispositivos (quadra_id, token_autenticacao, camera_url)
    VALUES (p_quadra_id, v_token, v_camera_limpa);

    UPDATE pareamentos
    SET status = 'vinculado',
        token_gerado = v_token,
        quadra_id = p_quadra_id,
        camera_url = v_camera_limpa
    WHERE id = v_pareamento_id;

    RETURN json_build_object(
        'ok', true,
        'quadra_id', p_quadra_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.vincular_totem_por_codigo(TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vincular_totem_por_codigo(TEXT, UUID, TEXT) TO authenticated;

-- ==============================================================================
-- 6. RPCs BLINDADAS: MÉTRICAS, VALIDAÇÃO E EXPURGO (RESPEITANDO FAVORITOS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.incrementar_visualizacao(replay_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE replays
    SET visualizacoes = COALESCE(visualizacoes, 0) + 1
    WHERE id = replay_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.incrementar_visualizacao(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.incrementar_download(replay_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE replays
    SET downloads = COALESCE(downloads, 0) + 1
    WHERE id = replay_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.incrementar_download(UUID) TO anon, authenticated;

-- Validação de totem restrita ao backend (service_role) para impedir força bruta anônima
CREATE OR REPLACE FUNCTION public.validar_totem(p_token text)
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
        RETURN json_build_object('valido', true, 'quadra_id', v_quadra_id);
    ELSE
        RETURN json_build_object('valido', false, 'quadra_id', null);
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.validar_totem(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_totem(text) TO service_role;

-- Agregação de métricas no banco (sem limite de 1.000 linhas do PostgREST)
CREATE OR REPLACE FUNCTION public.obter_metricas_arena(p_arena_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID;
    v_autorizado BOOLEAN;
    v_lances BIGINT;
    v_views BIGINT;
    v_downloads BIGINT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação obrigatória.';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM arenas
        WHERE id = p_arena_id
          AND (usuario_id = v_uid OR public.is_super_admin())
    ) INTO v_autorizado;

    IF NOT v_autorizado THEN
        RAISE EXCEPTION 'Sem permissão para consultar métricas desta arena.';
    END IF;

    SELECT
        COUNT(r.id),
        COALESCE(SUM(r.visualizacoes), 0),
        COALESCE(SUM(r.downloads), 0)
    INTO v_lances, v_views, v_downloads
    FROM replays r
    JOIN quadras q ON r.quadra_id = q.id
    WHERE q.arena_id = p_arena_id;

    RETURN json_build_object(
        'lances', COALESCE(v_lances, 0),
        'visualizacoes', COALESCE(v_views, 0),
        'downloads', COALESCE(v_downloads, 0)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.obter_metricas_arena(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.obter_metricas_arena(UUID) TO authenticated;

-- Expurgo seguro de 5 dias: preserva favoritados e retorna URLs para apagar no Storage
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

-- ==============================================================================
-- 7. PROMOVER SEU USUÁRIO A SUPER ADMIN (DESCOMENTE E TROQUE O E-MAIL ABAIXO)
-- ==============================================================================
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb
-- WHERE email = 'SEU_EMAIL_ADMIN_AQUI';
