-- ==============================================================================
-- HARDENING APPSEC: Remove image/svg+xml do bucket público 'midia-arenas'
-- Previne Stored XSS caso um arquivo SVG malicioso seja enviado ao Storage.
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard).
-- ==============================================================================

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'midia-arenas';
