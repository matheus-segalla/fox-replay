-- ==============================================================================
-- FOX REPLAY — ALTERAÇÃO DE SENHA DO ADMINISTRADOR
-- Execute este comando no SQL Editor do seu Dashboard Supabase:
-- ==============================================================================

UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'matheussegalla469@hotmail.com';

-- Se você tiver outro e-mail cadastrado, pode alterar todos para 123456 com:
-- UPDATE auth.users
-- SET encrypted_password = crypt('123456', gen_salt('bf'));
