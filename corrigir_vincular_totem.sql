-- ==============================================================================
-- CORREÇÃO: Função vincular_totem_por_codigo (Erro gen_random_bytes)
-- Execute este comando no SQL Editor do Supabase (https://supabase.com)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.vincular_totem_por_codigo(
    p_codigo TEXT,
    p_quadra_id UUID,
    p_camera_url TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
    
    -- Gera token aleatório nativo e seguro sem depender de extensão externa (gen_random_uuid nativo)
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
