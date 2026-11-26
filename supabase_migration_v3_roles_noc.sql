-- ==============================================================================
-- FOX REPLAY — MIGRAÇÃO V3: ALINHAMENTO DE PERFIS, BUCKET DE MÍDIA, PAUSA SUAVE,
-- HEARTBEAT DE TOTENS E MÉTRICAS POR PERÍODO
-- Execute este script completo no SQL Editor do seu Dashboard Supabase.
-- Idempotente: pode ser executado com segurança sobre o banco com V2 já aplicada.
-- ==============================================================================

-- 1. NOVAS COLUNAS OPERACIONAIS
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS ativa BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS ultimo_heartbeat TIMESTAMPTZ;
ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS camera_online BOOLEAN DEFAULT true;
ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS fila_offline_qtd INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_arenas_ativa ON arenas(ativa);

-- 2. PROTEGER CAMPO `ativa` NA TRIGGER DE ARENAS (APENAS SUPER ADMIN PODE PAUSAR/ATIVAR)
CREATE OR REPLACE FUNCTION public.proteger_campos_plano_arena()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
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
        IF NEW.ativa IS DISTINCT FROM OLD.ativa THEN
            RAISE EXCEPTION 'Apenas administradores Fox Replay podem pausar ou reativar a arena.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- 3. RESTRINGIR CRIAÇÃO/EXCLUSÃO DE ARENAS E GESTÃO DE DISPOSITIVOS AO SUPER ADMIN
DROP POLICY IF EXISTS "Usuário autenticado pode criar arena" ON arenas;
DROP POLICY IF EXISTS "Somente Super Admin pode criar arena" ON arenas;
CREATE POLICY "Somente Super Admin pode criar arena"
ON arenas FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Dono pode excluir sua própria arena" ON arenas;
DROP POLICY IF EXISTS "Somente Super Admin pode excluir arena" ON arenas;
CREATE POLICY "Somente Super Admin pode excluir arena"
ON arenas FOR DELETE
TO authenticated
USING (public.is_super_admin());

-- Dispositivos (tokens e URLs RTSP) passam a ser visíveis/gerenciáveis APENAS pelo Super Admin
DROP POLICY IF EXISTS "Dono pode gerenciar dispositivos de suas quadras" ON dispositivos;
DROP POLICY IF EXISTS "Somente Super Admin gerencia dispositivos" ON dispositivos;
CREATE POLICY "Somente Super Admin gerencia dispositivos"
ON dispositivos FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Pareamento por código de 6 dígitos restrito ao Super Admin / Técnico Fox Replay
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
    v_codigo_norm TEXT;
    v_pareamento_id UUID;
    v_token TEXT;
    v_camera_limpa TEXT;
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Apenas técnicos/administradores Fox Replay podem vincular totens.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM quadras WHERE id = p_quadra_id) THEN
        RAISE EXCEPTION 'Quadra não encontrada.';
    END IF;

    v_codigo_norm := UPPER(TRIM(COALESCE(p_codigo, '')));
    IF LENGTH(v_codigo_norm) = 6 AND POSITION('-' IN v_codigo_norm) = 0 THEN
        v_codigo_norm := SUBSTRING(v_codigo_norm FROM 1 FOR 3) || '-' || SUBSTRING(v_codigo_norm FROM 4 FOR 3);
    END IF;

    SELECT id
    INTO v_pareamento_id
    FROM pareamentos
    WHERE codigo = v_codigo_norm
      AND status = 'pendente'
      AND (expira_em IS NULL OR expira_em > NOW())
    FOR UPDATE;

    IF v_pareamento_id IS NULL THEN
        RAISE EXCEPTION 'Código do Totem não encontrado, expirado ou já vinculado. Verifique a TV da quadra.';
    END IF;

    v_camera_limpa := NULLIF(TRIM(COALESCE(p_camera_url, '')), '');
    v_token := 'fox_tok_' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

    INSERT INTO dispositivos (quadra_id, token_autenticacao, camera_url)
    VALUES (p_quadra_id, v_token, v_camera_limpa);

    UPDATE pareamentos
    SET status = 'vinculado',
        token_gerado = v_token,
        quadra_id = p_quadra_id,
        camera_url = v_camera_limpa
    WHERE id = v_pareamento_id;

    RETURN json_build_object('ok', true, 'quadra_id', p_quadra_id);
END;
$$;

REVOKE ALL ON FUNCTION public.vincular_totem_por_codigo(TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vincular_totem_por_codigo(TEXT, UUID, TEXT) TO authenticated;

-- 4. RPC SEGURA PARA O DONO VER STATUS LIMPO DOS TOTENS (SEM EXPOR TOKEN NEM RTSP)
CREATE OR REPLACE FUNCTION public.listar_status_totens_arena(p_arena_id UUID)
RETURNS TABLE (
    quadra_id UUID,
    tem_totem BOOLEAN,
    ultimo_heartbeat TIMESTAMPTZ,
    camera_online BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID;
    v_autorizado BOOLEAN;
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
        RAISE EXCEPTION 'Sem permissão para consultar esta arena.';
    END IF;

    RETURN QUERY
    SELECT
        q.id AS quadra_id,
        (COUNT(d.id) > 0) AS tem_totem,
        MAX(d.ultimo_heartbeat) AS ultimo_heartbeat,
        BOOL_OR(COALESCE(d.camera_online, true)) AS camera_online
    FROM quadras q
    LEFT JOIN dispositivos d ON d.quadra_id = q.id
    WHERE q.arena_id = p_arena_id
    GROUP BY q.id;
END;
$$;

REVOKE ALL ON FUNCTION public.listar_status_totens_arena(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.listar_status_totens_arena(UUID) TO authenticated;

-- 5. RPC DE MÉTRICAS POR PERÍODO + RANKING POR QUADRA (HOJE / 7D / 30D / TOTAL)
CREATE OR REPLACE FUNCTION public.obter_metricas_arena_periodo(
    p_arena_id UUID,
    p_dias INTEGER DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID;
    v_autorizado BOOLEAN;
    v_inicio TIMESTAMPTZ;
    v_lances BIGINT;
    v_views BIGINT;
    v_downloads BIGINT;
    v_por_quadra json;
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

    IF p_dias IS NULL THEN
        v_inicio := NULL;
    ELSIF p_dias = 0 THEN
        v_inicio := (date_trunc('day', NOW() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo');
    ELSE
        v_inicio := NOW() - make_interval(days => p_dias);
    END IF;

    SELECT
        COUNT(r.id),
        COALESCE(SUM(r.visualizacoes), 0),
        COALESCE(SUM(r.downloads), 0)
    INTO v_lances, v_views, v_downloads
    FROM replays r
    JOIN quadras q ON r.quadra_id = q.id
    WHERE q.arena_id = p_arena_id
      AND (v_inicio IS NULL OR r.criado_em >= v_inicio);

    SELECT COALESCE(
        json_agg(row_to_json(t) ORDER BY t.lances DESC, t.nome ASC),
        '[]'::json
    )
    INTO v_por_quadra
    FROM (
        SELECT
            q.id AS quadra_id,
            q.nome,
            COUNT(r.id) AS lances,
            COALESCE(SUM(r.visualizacoes), 0) AS visualizacoes,
            COALESCE(SUM(r.downloads), 0) AS downloads
        FROM quadras q
        LEFT JOIN replays r
            ON r.quadra_id = q.id
           AND (v_inicio IS NULL OR r.criado_em >= v_inicio)
        WHERE q.arena_id = p_arena_id
        GROUP BY q.id, q.nome
    ) t;

    RETURN json_build_object(
        'lances', COALESCE(v_lances, 0),
        'visualizacoes', COALESCE(v_views, 0),
        'downloads', COALESCE(v_downloads, 0),
        'por_quadra', v_por_quadra
    );
END;
$$;

REVOKE ALL ON FUNCTION public.obter_metricas_arena_periodo(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.obter_metricas_arena_periodo(UUID, INTEGER) TO authenticated;

-- 6. BUCKET DE STORAGE 'midia-arenas' (UPLOAD DIRETO DE LOGOS, PATROCINADORES E FOTOS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'midia-arenas',
    'midia-arenas',
    true,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

DROP POLICY IF EXISTS "Leitura pública de midia-arenas" ON storage.objects;
CREATE POLICY "Leitura pública de midia-arenas"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'midia-arenas');

DROP POLICY IF EXISTS "Upload de midia-arenas pelo dono ou admin" ON storage.objects;
CREATE POLICY "Upload de midia-arenas pelo dono ou admin"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'midia-arenas'
    AND (
        public.is_super_admin()
        OR (storage.foldername(name))[1] IN (
            SELECT id::text FROM arenas WHERE usuario_id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Atualizacao de midia-arenas pelo dono ou admin" ON storage.objects;
CREATE POLICY "Atualizacao de midia-arenas pelo dono ou admin"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'midia-arenas'
    AND (
        public.is_super_admin()
        OR (storage.foldername(name))[1] IN (
            SELECT id::text FROM arenas WHERE usuario_id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Exclusao de midia-arenas pelo dono ou admin" ON storage.objects;
CREATE POLICY "Exclusao de midia-arenas pelo dono ou admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'midia-arenas'
    AND (
        public.is_super_admin()
        OR (storage.foldername(name))[1] IN (
            SELECT id::text FROM arenas WHERE usuario_id = auth.uid()
        )
    )
);
