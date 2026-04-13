-- Enes Doğanay | 13 Nisan 2026: RLS policy düzeltmesi
-- Teklif güncelleme: taslak, gönderildi ve reddedilen teklifler için çalışır
-- Teklif silme: taslak ve gönderildi durumları için çalışır
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- 1) Eski UPDATE policy'yi kaldır ve yeni oluştur
DROP POLICY IF EXISTS "teklif_sahibi_update" ON public.ihale_teklifleri;
CREATE POLICY "teklif_sahibi_update"
    ON public.ihale_teklifleri FOR UPDATE
    USING (auth.uid() = user_id AND durum IN ('taslak', 'gonderildi', 'red'))
    WITH CHECK (auth.uid() = user_id);

-- 2) Eski DELETE policy'yi kaldır ve yeni oluştur
DROP POLICY IF EXISTS "teklif_sahibi_delete" ON public.ihale_teklifleri;
CREATE POLICY "teklif_sahibi_delete"
    ON public.ihale_teklifleri FOR DELETE
    USING (auth.uid() = user_id AND durum IN ('taslak', 'gonderildi'));
