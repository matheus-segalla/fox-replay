-- ==============================================================================
-- FOX REPLAY — SCRIPT DE BLINDAGEM DE SEGURANÇA E RLS (SUPABASE)
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- ==============================================================================

-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadras ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE replays ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. POLÍTICAS DE SEGURANÇA: TABELA 'arenas'
-- ==============================================================================
-- Leitura pública das arenas (qualquer atleta ou visitante pode ver as arenas ativas)
DROP POLICY IF EXISTS "Leitura pública de arenas" ON arenas;
CREATE POLICY "Leitura pública de arenas"
ON arenas FOR SELECT
TO anon, authenticated
USING (true);

-- Criação de arena vinculada ao usuário autenticado
DROP POLICY IF EXISTS "Usuário autenticado pode criar arena" ON arenas;
CREATE POLICY "Usuário autenticado pode criar arena"
ON arenas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- Atualização e Exclusão apenas pelo próprio dono da arena
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

-- ==============================================================================
-- 3. POLÍTICAS DE SEGURANÇA: TABELA 'quadras'
-- ==============================================================================
-- Leitura pública das quadras
DROP POLICY IF EXISTS "Leitura pública de quadras" ON quadras;
CREATE POLICY "Leitura pública de quadras"
ON quadras FOR SELECT
TO anon, authenticated
USING (true);

-- Criação, Edição e Exclusão restrita ao dono da arena pai
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

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURANÇA: TABELA 'dispositivos' (BLINDAGEM CONTRA VAZAMENTO)
-- ==============================================================================
-- Donos de arena podem gerenciar os dispositivos de suas quadras pelo painel
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

-- NENHUM ACESSO DIRETO VIA SELECT ANÔNIMO À TABELA DE DISPOSITIVOS!
-- O Totem usará a função RPC segura abaixo:

-- ==============================================================================
-- 5. FUNÇÃO RPC SEGURA: VALIDAR TOTEM SEM VAZAR A TABELA INTEIRA
-- ==============================================================================
CREATE OR REPLACE FUNCTION validar_totem(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do banco, contornando RLS com segurança
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

-- Libera permissão de execução da função para anon
GRANT EXECUTE ON FUNCTION validar_totem(text) TO anon, authenticated;

-- ==============================================================================
-- 6. POLÍTICAS DE SEGURANÇA: TABELA 'replays'
-- ==============================================================================
-- Leitura pública dos replays (jogadores e feeds)
DROP POLICY IF EXISTS "Leitura pública de replays" ON replays;
CREATE POLICY "Leitura pública de replays"
ON replays FOR SELECT
TO anon, authenticated
USING (true);

-- Inserção de replays autorizada
DROP POLICY IF EXISTS "Inserção de replays permitida" ON replays;
CREATE POLICY "Inserção de replays permitida"
ON replays FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Exclusão de replays apenas pelo dono da quadra ou admin
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
    -- Apaga registros de replays com mais de 14 dias
    DELETE FROM replays
    WHERE criado_em < (NOW() - INTERVAL '14 days');

    GET DIAGNOSTICS v_deletados = ROW_COUNT;
    RETURN v_deletados;
END;
$$;

-- ==============================================================================
-- 8. TABELA DE PAREAMENTO ZERO-TOUCH (CÓDIGO DE 6 DÍGITOS ESTILO SMART TV)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pareamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'vinculado', 'expirado'
    token_gerado TEXT,
    quadra_id UUID REFERENCES quadras(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    expira_em TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

ALTER TABLE pareamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permissao de pareamento" ON pareamentos;
CREATE POLICY "Permissao de pareamento"
ON pareamentos FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- Opcional: Se a extensão pg_cron estiver habilitada no Supabase:
-- SELECT cron.schedule('limpeza_replays_14dias', '0 4 * * *', 'SELECT expurgar_replays_antigos()');
