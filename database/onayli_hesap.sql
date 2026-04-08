-- Enes Doğanay | 8 Nisan 2026: firmalar tablosuna onayli_hesap boolean alanı ekleniyor
-- Kurumsal başvuru onayı sonrası true yapılır. Tüm verified kontrolleri bu alandan okunur.

-- 1) Sütunu ekle (yoksa)
ALTER TABLE public.firmalar
  ADD COLUMN IF NOT EXISTS onayli_hesap boolean NOT NULL DEFAULT false;

-- 2) Mevcut onaylı firmaları backfill et
--    kurumsal_firma_yoneticileri tablosunda kaydı olan firma = onaylı
UPDATE public.firmalar
SET onayli_hesap = true
WHERE "firmaID"::text IN (
  SELECT firma_id FROM public.kurumsal_firma_yoneticileri
);

-- 3) Artık gereksiz olan get_managed_firma_ids RPC fonksiyonunu kaldır
DROP FUNCTION IF EXISTS public.get_managed_firma_ids(uuid[]);
