-- Enes Doğanay | 12 Mayıs 2026: iletisim tablosuna company kolonu eklendi
ALTER TABLE iletisim ADD COLUMN IF NOT EXISTS company text;
