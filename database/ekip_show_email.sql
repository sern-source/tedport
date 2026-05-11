-- Enes Doğanay | 9 Mayıs 2026: Ekip üyesi e-posta gösterme toggleı
-- Supabase SQL Editor'de çalıştır

-- ═══════════════════════════════════════════════════════
-- 1) show_email kolonu — kurumsal_firma_yoneticileri
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.kurumsal_firma_yoneticileri
  ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT false;

-- ═══════════════════════════════════════════════════════
-- 2) firma_ekip_public VIEW güncelle
--    show_email = true ise e-posta döner, aksi hâlde NULL
--    (herkese açık view'da gizlilik korunur)
-- ═══════════════════════════════════════════════════════
DROP VIEW IF EXISTS public.firma_ekip_public;

CREATE VIEW public.firma_ekip_public AS
  SELECT
    kfy.user_id,
    kfy.firma_id,
    kfy.role,
    kfy.title,
    kfy.is_public,
    kfy.show_email,
    kfy.page_permissions,
    kfy.created_at AS joined_at,
    p.first_name,
    p.last_name,
    (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))::text AS full_name,
    p.avatar AS avatar_url,
    CASE WHEN kfy.show_email = true THEN p.email ELSE NULL END AS email
  FROM public.kurumsal_firma_yoneticileri kfy
  JOIN public.profiles p ON p.id = kfy.user_id
  WHERE kfy.is_public = true;

-- Herkese okuma izni (e-posta sadece show_email=true ise görünür)
GRANT SELECT ON public.firma_ekip_public TO anon, authenticated;
