-- Enes Doğanay | 14 Mayıs 2026: firma_ekip_public VIEW fix
-- Sorun: önceki migrasyonlar (ekip_page_permissions, firma_ekip_security_invoker)
-- view'ı show_email ve email kolonu olmadan yeniden oluşturdu.
-- Bu migration tüm kolonları doğru şekilde birleştirir:
--   • show_email (toggle)
--   • email (yalnızca show_email=true ise döner)
--   • page_permissions
--   • security_invoker = on

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
    (COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, ''))::text AS full_name,
    p.avatar AS avatar_url,
    CASE WHEN kfy.show_email = true THEN p.email ELSE NULL END AS email
  FROM public.kurumsal_firma_yoneticileri kfy
  JOIN public.profiles p ON p.id = kfy.user_id
  WHERE kfy.is_public = true;

-- Security invoker: sorgulayanın RLS'i uygulanır
ALTER VIEW public.firma_ekip_public SET (security_invoker = on);

GRANT SELECT ON public.firma_ekip_public TO anon, authenticated;
