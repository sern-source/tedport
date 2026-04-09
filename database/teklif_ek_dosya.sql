-- Enes Doğanay | 9 Nisan 2026: Teklif talepleri ek dosya desteği
-- Kullanıcılar teklif isterken teknik spesifikasyon vb. dosya ekleyebilir

-- 1) Ek dosyalar için private bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('teklif-ekleri', 'teklif-ekleri', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Giriş yapmış kullanıcılar yükleyebilir
DROP POLICY IF EXISTS "Authenticated users can upload teklif attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload teklif attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'teklif-ekleri'
  AND auth.role() = 'authenticated'
);

-- 3) İlgili firma yöneticileri ve dosya sahibi okuyabilir (signed URL için)
DROP POLICY IF EXISTS "Teklif attachment read for owner and firma manager" ON storage.objects;
CREATE POLICY "Teklif attachment read for owner and firma manager"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'teklif-ekleri'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.kurumsal_firma_yoneticileri kfy
      WHERE kfy.user_id = auth.uid()
    )
  )
);

-- 4) teklif_talepleri tablosuna ek dosya URL sütunu ekle
ALTER TABLE public.teklif_talepleri
  ADD COLUMN IF NOT EXISTS ek_dosya_url text,
  ADD COLUMN IF NOT EXISTS ek_dosya_adi text;

-- Enes Doğanay | 9 Nisan 2026: Realtime publication — bildirimler, teklif_talepleri ve teklif_mesajlari tablolarını Supabase Realtime'a ekle
-- (bildirimler zaten ekli olabilir, hata olursa göz ardı edin)
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

-- Enes Doğanay | 9 Nisan 2026: REPLICA IDENTITY FULL — filter kullanan realtime subscription'lar için zorunlu
-- Bu olmadan filter: `user_id=eq.xxx` gibi sorgular çalışmaz
ALTER TABLE public.bildirimler REPLICA IDENTITY FULL;
ALTER TABLE public.teklif_talepleri REPLICA IDENTITY FULL;
ALTER TABLE public.teklif_mesajlari REPLICA IDENTITY FULL;
