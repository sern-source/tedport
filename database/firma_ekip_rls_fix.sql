-- Enes Doğanay | 4 Mayıs 2026: RLS sonsuz döngü fix + firma_ekip_public view güncelleme
-- Supabase SQL Editor'de çalıştır

-- ═══════════════════════════════════════════════════════
-- 1) SECURITY DEFINER helper — RLS döngüsünü kırar
-- ═══════════════════════════════════════════════════════
-- Bu fonksiyon RLS bypass ile çalışır; policy içinden çağrılır
CREATE OR REPLACE FUNCTION public.get_my_firma_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT firma_id
  FROM public.kurumsal_firma_yoneticileri
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ═══════════════════════════════════════════════════════
-- 2) Recursive policy'yi kaldır ve düzelt
-- ═══════════════════════════════════════════════════════
DROP POLICY IF EXISTS "firma_yoneticileri_ekip_select" ON public.kurumsal_firma_yoneticileri;

CREATE POLICY "firma_yoneticileri_ekip_select"
  ON public.kurumsal_firma_yoneticileri FOR SELECT
  USING (
    -- Kendi kaydını her zaman görür (direkt karşılaştırma — recursive değil)
    auth.uid() = user_id
    -- Aynı firmadaki diğer üyeleri görür (SECURITY DEFINER fonksiyon üzerinden — recursive değil)
    OR firma_id = public.get_my_firma_id()
    -- Süper admin her şeyi görür
    OR public.is_current_user_admin()
  );

-- ═══════════════════════════════════════════════════════
-- 3) firma_ekip_public VIEW — eksik kolonları ekle
-- ═══════════════════════════════════════════════════════
DROP VIEW IF EXISTS public.firma_ekip_public;

CREATE VIEW public.firma_ekip_public AS
  SELECT
    kfy.user_id,
    kfy.firma_id,
    kfy.role,
    kfy.title,
    kfy.created_at AS joined_at,
    p.first_name,
    p.last_name,
    (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))::text AS full_name,
    p.avatar AS avatar_url
  FROM public.kurumsal_firma_yoneticileri kfy
  JOIN public.profiles p ON p.id = kfy.user_id;

-- Herkese okuma izni (hassas veri yok — e-posta/telefon dahil değil)
GRANT SELECT ON public.firma_ekip_public TO anon, authenticated;
