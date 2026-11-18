-- ==============================================================================
-- FOX REPLAY — CRIAÇÃO / PROMOÇÃO DE USUÁRIO SUPER ADMIN
-- Execute no SQL Editor do seu Dashboard Supabase substituindo os placeholders.
-- NUNCA versionar senhas reais ou e-mails pessoais neste arquivo.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_email TEXT := 'SEU_EMAIL_ADMIN_AQUI';
    v_senha TEXT := 'DEFINA_UMA_SENHA_FORTE_AQUI';
    v_user_id uuid;
BEGIN
    IF v_email = 'SEU_EMAIL_ADMIN_AQUI' OR v_senha = 'DEFINA_UMA_SENHA_FORTE_AQUI' THEN
        RAISE EXCEPTION 'Substitua v_email e v_senha antes de executar este script.';
    END IF;

    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();

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
            v_email,
            crypt(v_senha, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"],"role":"super_admin"}'::jsonb,
            '{"tipo_usuario":"admin"}'::jsonb,
            NOW(),
            NOW()
        );

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
            json_build_object('sub', v_user_id::text, 'email', v_email),
            'email',
            v_user_id::text,
            NOW(),
            NOW(),
            NOW()
        );
    ELSE
        -- Promove usuário existente gravando role em raw_app_meta_data (imutável pelo cliente)
        UPDATE auth.users
        SET encrypted_password = crypt(v_senha, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb
        WHERE id = v_user_id;
    END IF;

    RAISE NOTICE 'Super Admin configurado com sucesso! ID: %', v_user_id;
END $$;
