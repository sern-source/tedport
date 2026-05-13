-- Enes Doğanay | 13 Mayıs 2026: SECURITY DEFINER → SECURITY INVOKER fix
-- Supabase Security Advisor CRITICAL uyarısı gidermek için
-- Adım 1: View'ı yeniden oluştur (WITH syntax yerine ALTER kullan)

DROP VIEW IF EXISTS public.firma_ekip_public;

CREATE VIEW public.firma_ekip_public AS
  SELECT
    kfy.user_id,
    kfy.firma_id,
    kfy.role,
    kfy.title,
    kfy.is_public,
    kfy.page_permissions,
    kfy.created_at AS joined_at,
    p.first_name,
    p.last_name,
    (COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, ''))::text AS full_name,
    p.avatar AS avatar_url
  FROM public.kurumsal_firma_yoneticileri kfy
  JOIN public.profiles p ON p.id = kfy.user_id
  WHERE kfy.is_public = true;

-- Adım 2: security_invoker = on — sorgulayanın RLS'i uygulanır
ALTER VIEW public.firma_ekip_public SET (security_invoker = on);

GRANT SELECT ON public.firma_ekip_public TO anon, authenticated;
