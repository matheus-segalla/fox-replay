-- ==============================================================================
-- FOX REPLAY — CRIAÇÃO DO USUÁRIO ADMIN (admin@admin / 123456)
-- Execute este script no SQL Editor do seu Dashboard Supabase:
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. Verifica se já existe um usuário com esse e-mail
    SELECT id INTO v_user_id FROM auth.users WHERE email IN ('admin@admin', 'admin@admin.com') LIMIT 1;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        
        -- Insere novo usuário na tabela auth.users do Supabase
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            'admin@admin',
            crypt('123456', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"role":"super_admin","tipo_usuario":"admin"}',
            NOW(),
            NOW()
        );

        -- Cria também identidade de e-mail na tabela auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            json_build_object('sub', v_user_id::text, 'email', 'admin@admin'),
            'email',
            v_user_id::text,
            NOW(),
            NOW(),
            NOW()
        );
    ELSE
        -- Atualiza senha existente para 123456
        UPDATE auth.users
        SET email = 'admin@admin',
            encrypted_password = crypt('123456', gen_salt('bf')),
            email_confirmed_at = NOW(),
            raw_user_meta_data = '{"role":"super_admin","tipo_usuario":"admin"}'
        WHERE id = v_user_id;
    END IF;

    -- 2. Vincula as arenas existentes para este admin ter acesso imediato no Dashboard
    UPDATE arenas 
    SET usuario_id = v_user_id;

    RAISE NOTICE 'Usuário admin@admin criado/atualizado com sucesso! ID: %', v_user_id;
END $$;
