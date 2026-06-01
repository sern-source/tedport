-- Enes Doğanay | 29 Mayıs 2026: Teklif mesajı ek dosya sütunları — firma chat'ten dosya gönderebilsin
-- mesaj kolonunu NULL'a izin verecek şekilde güncelle (dosya mesajlarında metin olmayabilir)
ALTER TABLE teklif_mesajlari
  ALTER COLUMN mesaj DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS ek_dosya_url TEXT,
  ADD COLUMN IF NOT EXISTS ek_dosya_adi TEXT;

-- Enes Doğanay | 29 Mayıs 2026: Chat dosyası okuma politikası — teklif gönderen kullanıcı chat eklerini görebilsin
-- Mevcut SELECT politikası chat_files/ yolunu kapsamıyor (foldername[1] = 'chat_files', not user UUID)
DROP POLICY IF EXISTS "Chat file read for quote participant" ON storage.objects;
CREATE POLICY "Chat file read for quote participant"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'teklif-ekleri'
    AND (storage.foldername(name))[1] = 'chat_files'
    AND EXISTS (
        SELECT 1 FROM public.teklif_talepleri t
        WHERE t.id::text = (storage.foldername(name))[3]
        AND t.user_id = auth.uid()
    )
);

-- Enes Doğanay | 1 Haziran 2026: Kullanıcı kendi yüklediği chat dosyalarını okuyabilsin
-- Kullanıcı chat dosyası yolu: chat_files/{userId}/{quoteId}/file — foldername[2] = userId
DROP POLICY IF EXISTS "Chat file read for uploader" ON storage.objects;
CREATE POLICY "Chat file read for uploader"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'teklif-ekleri'
    AND (storage.foldername(name))[1] = 'chat_files'
    AND (storage.foldername(name))[2] = auth.uid()::text
);
