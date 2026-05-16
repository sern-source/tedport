-- Enes Doğanay | 17 Mayıs 2026: Demo firma bayrağı — is_demo kolonu
-- Demo firmalar "Onaylı Firma" badge'i almaz ama "Teklif İste" butonu çalışır.
-- Çalıştırmak için: Supabase Dashboard > SQL Editor

ALTER TABLE public.firmalar
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- 4 demo firma: Kardemir, Keyifli Gıda, Metalsan, FastLog
UPDATE public.firmalar
SET is_demo = true
WHERE "firmaID" IN (
  'da000001-0000-4000-8000-000000000000',
  'da000002-0000-4000-8000-000000000000',
  'b0000001-0000-4000-8000-000000000000',
  'b0000002-0000-4000-8000-000000000000'
);
