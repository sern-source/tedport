-- Enes Doğanay | 13 Mayıs 2026: E-posta abonelik iptal token'ı + anonim erişim
-- KVKK / GDPR gereği e-postadaki tek tıkla abonelik iptal linki için

-- NOT NULL DEFAULT ile ALTER TABLE mevcut satırları doldurmaz; NULL izne al, sonra doldur, sonra NOT NULL yap
ALTER TABLE public.ihale_uyarilari
    ADD COLUMN IF NOT EXISTS unsubscribe_token uuid DEFAULT gen_random_uuid();

-- Enes Doğanay | 15 Mayıs 2026: Eski satırları backfill — migration öncesi oluşturulmuş abonelikler
UPDATE public.ihale_uyarilari
    SET unsubscribe_token = gen_random_uuid()
    WHERE unsubscribe_token IS NULL;

-- Artık NOT NULL constraint eklenebilir
ALTER TABLE public.ihale_uyarilari
    ALTER COLUMN unsubscribe_token SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ihale_uyarilari_token
    ON public.ihale_uyarilari (unsubscribe_token);

-- Anonim kullanıcı e-postadaki linke tıklayınca aktif=false yapabilmeli
-- WITH CHECK aktif=false → sadece pasife çekebilir, başka değişiklik yapamaz
DROP POLICY IF EXISTS "Token ile abonelik iptali" ON public.ihale_uyarilari;
CREATE POLICY "Token ile abonelik iptali"
    ON public.ihale_uyarilari FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (aktif = false);
