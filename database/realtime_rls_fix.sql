-- Enes Doğanay | 9 Nisan 2026: Realtime + RLS uyumluluk düzeltmesi
-- Supabase Realtime, iç içe RLS korumalı tablolara JOIN yapan policy'leri düzgün değerlendiremez.
-- Bu nedenle kurumsal kullanıcılar realtime event alamıyordu.
-- Çözüm: security definer helper fonksiyon ile nested RLS atlanır.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1) HELPER FONKSİYONLAR
-- security definer ile nested RLS atlanır
-- ═══════════════════════════════════════════════════════════════════════════

-- "Bu kullanıcı bu firmayı yönetiyor mu?"
CREATE OR REPLACE FUNCTION public.user_manages_firma(p_firma_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kurumsal_firma_yoneticileri
    WHERE user_id = auth.uid()
      AND firma_id = p_firma_id
  );
$$;

-- Enes Doğanay | 9 Nisan 2026: "Bu kullanıcı bu teklifin mesajlarına erişebilir mi?"
-- Hem bireysel (teklif sahibi) hem kurumsal (firma yöneticisi — gelen VE giden) erişimi tek fonksiyonda
-- SECURITY DEFINER sayesinde teklif_talepleri RLS'i atlanır — Realtime düzgün çalışır
CREATE OR REPLACE FUNCTION public.user_can_access_teklif(p_teklif_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teklif_talepleri tt
    WHERE tt.id = p_teklif_id
      AND (
        tt.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.kurumsal_firma_yoneticileri kfy
          WHERE kfy.user_id = auth.uid()
            AND (kfy.firma_id = tt.firma_id OR kfy.firma_id = tt.gonderen_firma_id)
        )
      )
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2) teklif_talepleri — Kurumsal kullanıcı RLS policy'lerini güncelle
-- ═══════════════════════════════════════════════════════════════════════════

-- Firma yöneticisi gelen teklifleri görebilir (eski: JOIN | yeni: helper fn)
DROP POLICY IF EXISTS "Firma yoneticisi gelen teklifleri gorebilir" ON public.teklif_talepleri;
CREATE POLICY "Firma yoneticisi gelen teklifleri gorebilir"
  ON public.teklif_talepleri FOR SELECT
  USING (public.user_manages_firma(firma_id));

-- Firma yöneticisi giden teklifleri görebilir (eski: JOIN | yeni: helper fn)
DROP POLICY IF EXISTS "Firma yoneticisi giden teklifleri gorebilir" ON public.teklif_talepleri;
CREATE POLICY "Firma yoneticisi giden teklifleri gorebilir"
  ON public.teklif_talepleri FOR SELECT
  USING (public.user_manages_firma(gonderen_firma_id));

-- Firma yöneticisi teklif durumunu güncelleyebilir (eski: JOIN | yeni: helper fn)
DROP POLICY IF EXISTS "Firma yoneticisi teklif durumunu guncelleyebilir" ON public.teklif_talepleri;
CREATE POLICY "Firma yoneticisi teklif durumunu guncelleyebilir"
  ON public.teklif_talepleri FOR UPDATE
  USING (public.user_manages_firma(firma_id));

-- ═══════════════════════════════════════════════════════════════════════════
-- 3) teklif_mesajlari — TÜM SELECT/INSERT policy'lerini SECURITY DEFINER fonksiyon ile değiştir
-- Hem bireysel hem kurumsal erişimi tek fonksiyon çözüyor → nested RLS sorunu tamamen ortadan kalkar
-- ═══════════════════════════════════════════════════════════════════════════

-- Eski policy'leri temizle (hem bireysel hem kurumsal)
DROP POLICY IF EXISTS "Teklif sahibi mesajlari gorebilir" ON public.teklif_mesajlari;
DROP POLICY IF EXISTS "Firma yoneticisi teklif mesajlarini gorebilir" ON public.teklif_mesajlari;
DROP POLICY IF EXISTS "Teklif sahibi mesaj yazabilir" ON public.teklif_mesajlari;
DROP POLICY IF EXISTS "Firma yoneticisi mesaj yazabilir" ON public.teklif_mesajlari;

-- Tek bir SELECT policy — bireysel + kurumsal (SECURITY DEFINER fonksiyon nested RLS'i atlar)
CREATE POLICY "Teklif mesajlarini gorebilir"
  ON public.teklif_mesajlari FOR SELECT
  USING (public.user_can_access_teklif(teklif_id));

-- Tek bir INSERT policy — bireysel + kurumsal
CREATE POLICY "Teklif mesaji yazabilir"
  ON public.teklif_mesajlari FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND public.user_can_access_teklif(teklif_id)
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 4) Firma yöneticisi için kurumsal firma tablosu INSERT policy (teklif gönderme)
-- ═══════════════════════════════════════════════════════════════════════════

-- Firma yöneticisi kendi firması adına teklif gönderebilir
DROP POLICY IF EXISTS "Firma yoneticisi teklif gonderebilir" ON public.teklif_talepleri;
CREATE POLICY "Firma yoneticisi teklif gonderebilir"
  ON public.teklif_talepleri FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      gonderen_firma_id IS NULL
      OR public.user_manages_firma(gonderen_firma_id)
    )
  );

-- Bireysel kullanıcı kendi teklifini oluşturabilir (mevcut policy'yi koru)
-- NOT: "Kullanici teklif olusturabilir" policy'si zaten var, dokunmuyoruz

-- ═══════════════════════════════════════════════════════════════════════════
-- 5) REPLICA IDENTITY + PUBLICATION (önceki SQL ile aynı, tekrar çalıştırılabilir)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.bildirimler REPLICA IDENTITY FULL;
ALTER TABLE public.teklif_talepleri REPLICA IDENTITY FULL;
ALTER TABLE public.teklif_mesajlari REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bildirimler;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.teklif_talepleri;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.teklif_mesajlari;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
