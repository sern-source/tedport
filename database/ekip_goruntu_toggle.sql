-- Enes Doğanay | 4 Mayıs 2026: Ekip görünürlük sistemi (bireysel + firma geneli)
-- Supabase SQL Editor'de çalıştır

-- ═══════════════════════════════════════════════════════
-- 1) Bireysel görünürlük: is_public kolonu
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.kurumsal_firma_yoneticileri
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- ═══════════════════════════════════════════════════════
-- 2) Firma geneli ekip gösterimi: show_ekip_public
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.firmalar
  ADD COLUMN IF NOT EXISTS show_ekip_public boolean NOT NULL DEFAULT true;

-- ═══════════════════════════════════════════════════════
-- 3) firma_ekip_public VIEW — is_public = true filtresi
-- ═══════════════════════════════════════════════════════
DROP VIEW IF EXISTS public.firma_ekip_public;

CREATE VIEW public.firma_ekip_public AS
  SELECT
    kfy.user_id,
    kfy.firma_id,
    kfy.role,
    kfy.title,
    kfy.is_public,
    kfy.created_at AS joined_at,
    p.first_name,
    p.last_name,
    (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))::text AS full_name,
    p.avatar AS avatar_url
  FROM public.kurumsal_firma_yoneticileri kfy
  JOIN public.profiles p ON p.id = kfy.user_id
  WHERE kfy.is_public = true;

-- Herkese okuma izni
GRANT SELECT ON public.firma_ekip_public TO anon, authenticated;

-- ═══════════════════════════════════════════════════════
-- 4) RLS: owner is_public güncelleyebilmeli
-- ═══════════════════════════════════════════════════════
DROP POLICY IF EXISTS "firma_yoneticileri_owner_update" ON public.kurumsal_firma_yoneticileri;
CREATE POLICY "firma_yoneticileri_owner_update"
  ON public.kurumsal_firma_yoneticileri FOR UPDATE
  USING (
    firma_id = public.get_my_firma_id()
    AND (
      SELECT role FROM public.kurumsal_firma_yoneticileri
      WHERE user_id = auth.uid() AND firma_id = public.get_my_firma_id()
      LIMIT 1
    ) = 'owner'
  )
  WITH CHECK (true);
