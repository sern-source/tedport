-- Enes Doğanay | 14 Mayıs 2026: Ekip izin güncelleme RLS fix
-- firma_yoneticileri_owner_update policy'si firma owner/admin'in
-- üyelerin page_permissions vs. alanlarını güncelleyemediği sorunu giderildi.
-- Supabase SQL Editor'de çalıştır

-- ═══════════════════════════════════════════════════════
-- 1) SECURITY DEFINER helper — çağıranın firma rolünü döner
--    (Recursion sorununu önlemek için SECURITY DEFINER gerekli)
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_firma_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.kurumsal_firma_yoneticileri
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ═══════════════════════════════════════════════════════
-- 2) UPDATE policy'yi firma owner/admin erişimine açacak şekilde yeniden oluştur
-- ═══════════════════════════════════════════════════════
DROP POLICY IF EXISTS "firma_yoneticileri_owner_update" ON public.kurumsal_firma_yoneticileri;

CREATE POLICY "firma_yoneticileri_owner_update"
  ON public.kurumsal_firma_yoneticileri FOR UPDATE
  USING (
    -- Platform super admin her satırı güncelleyebilir
    public.is_current_user_admin()
    -- Kullanıcı kendi kaydını (unvan, görünürlük) güncelleyebilir
    OR auth.uid() = user_id
    -- Firma owner veya admin, aynı firmadaki üyelerin kayıtlarını güncelleyebilir
    -- (page_permissions, rol, unvan, görünürlük)
    -- get_my_firma_id() ve get_my_firma_role() SECURITY DEFINER — recursion yok
    OR (
      firma_id = public.get_my_firma_id()
      AND public.get_my_firma_role() IN ('owner', 'admin')
    )
  );
