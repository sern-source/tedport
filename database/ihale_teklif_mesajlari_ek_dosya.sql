-- Enes Doğanay | 1 Haziran 2026: ihale_teklif_mesajlari ek dosya desteği
-- ALTER TABLE + storage RLS policy

-- 1. Kolonlar ve NULL kısıtı kaldır
ALTER TABLE ihale_teklif_mesajlari
    ALTER COLUMN mesaj DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS ek_dosya_url TEXT,
    ADD COLUMN IF NOT EXISTS ek_dosya_adi TEXT;

-- 2. Eski CHECK kısıtını kaldır (NULL mesaja izin vermeyen)
ALTER TABLE ihale_teklif_mesajlari
    DROP CONSTRAINT IF EXISTS ihale_teklif_mesajlari_mesaj_check;

-- 3. Yeni CHECK: NULL mesaja izin ver (dosya-only mesajlar), metin varsa 1-2000 karakter
ALTER TABLE ihale_teklif_mesajlari
    ADD CONSTRAINT ihale_teklif_mesajlari_mesaj_check
    CHECK (mesaj IS NULL OR (length(mesaj) > 0 AND length(mesaj) <= 2000));

-- 4. Storage RLS: bidder kendi ihale chat dosyalarını okuyabilsin
-- (Firma yöneticileri için mevcut policy zaten bucket genelini kapsıyor)
-- Path: ihale_chat_files/{teklifId}/company|bidder/{dosya}
-- foldername[2] = teklifId  →  ihale_teklifleri.user_id = bidder's user_id
DROP POLICY IF EXISTS "Ihale chat file read for bidder" ON storage.objects;
CREATE POLICY "Ihale chat file read for bidder"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'teklif-ekleri'
    AND (storage.foldername(name))[1] = 'ihale_chat_files'
    AND EXISTS (
        SELECT 1 FROM public.ihale_teklifleri t
        WHERE t.id::text = (storage.foldername(name))[2]
        AND t.user_id = auth.uid()
    )
);
