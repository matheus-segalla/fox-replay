-- ==============================================================================
-- FOX REPLAY — ALTERAÇÃO DE SENHA DE USUÁRIO (SUPABASE SQL EDITOR)
-- Substitua os placeholders antes de executar. Nunca salve senhas reais no Git.
-- ==============================================================================

UPDATE auth.users
SET encrypted_password = crypt('NOVA_SENHA_FORTE_AQUI', gen_salt('bf'))
WHERE email = 'EMAIL_DO_USUARIO_AQUI';
