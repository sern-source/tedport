-- Enes Doğanay | 4 Mayıs 2026: Ekip üyesi sayfa bazlı yetki sistemi
-- Supabase SQL Editor'de çalıştır

-- ═══════════════════════════════════════════════════════
-- 1) page_permissions kolonu — DEFAULT: teklif + ihale açık
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.kurumsal_firma_yoneticileri
  ADD COLUMN IF NOT EXISTS page_permissions jsonb NOT NULL DEFAULT '{
    "firma_paneli": false,
    "teklif_yonetimi": true,
    "ihale_yonetimi": true,
    "ekip_yonetimi": false
  }'::jsonb;

-- ═══════════════════════════════════════════════════════
-- 2) firma_ekip_public VIEW güncelle — page_permissions dahil
-- ═══════════════════════════════════════════════════════
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
    (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))::text AS full_name,
    p.avatar AS avatar_url
  FROM public.kurumsal_firma_yoneticileri kfy
  JOIN public.profiles p ON p.id = kfy.user_id
  WHERE kfy.is_public = true;

GRANT SELECT ON public.firma_ekip_public TO anon, authenticated;

-- ═══════════════════════════════════════════════════════
-- 3) firma_davetleri tablosuna page_permissions kolonu
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.firma_davetleri
  ADD COLUMN IF NOT EXISTS page_permissions jsonb;

-- ═══════════════════════════════════════════════════════
-- 4) accept_firma_daveti RPC — page_permissions kopyala
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.accept_firma_daveti(p_davet_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_davet record;
  v_existing_firma text;
BEGIN
  SELECT * INTO v_davet
  FROM public.firma_davetleri
  WHERE id = p_davet_id
    AND invited_user_id = auth.uid()
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Davet bulunamadı veya süresi dolmuş.');
  END IF;

  SELECT firma_id INTO v_existing_firma
  FROM public.kurumsal_firma_yoneticileri
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_existing_firma IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'Zaten bir firmaya bağlısınız.');
  END IF;

  INSERT INTO public.kurumsal_firma_yoneticileri (user_id, firma_id, role, title, page_permissions)
  VALUES (
    auth.uid(),
    v_davet.firma_id,
    v_davet.role,
    v_davet.title,
    COALESCE(v_davet.page_permissions, '{"firma_paneli": false, "teklif_yonetimi": true, "ihale_yonetimi": true, "ekip_yonetimi": false}'::jsonb)
  );

  UPDATE public.firma_davetleri
  SET status = 'accepted', updated_at = now()
  WHERE id = p_davet_id;

  RETURN jsonb_build_object('success', true, 'firma_id', v_davet.firma_id, 'role', v_davet.role);
END;
$$;
