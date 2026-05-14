-- Enes Doğanay | 14 Mayıs 2026: iletisim tablosuna telefon kolonu eklendi (isteğe bağlı)
ALTER TABLE iletisim ADD COLUMN IF NOT EXISTS phone text;
