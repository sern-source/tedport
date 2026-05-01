-- Enes Doğanay | 1 Mayıs 2026: Pazarlama onayı profil tablosuna eklendi
-- Kullanıcılar profil sayfasından istedikleri zaman toggle ile değiştirebilir

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.marketing_consent IS
  'Kullanıcının pazarlama e-postası/SMS almaya verdiği onay. 6563 sayılı Kanun kapsamında.';
