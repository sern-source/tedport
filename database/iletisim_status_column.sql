-- Enes Doğanay | 14 Nisan 2026: iletisim tablosuna status sütunu eklenmesi
-- Admin panelinde mesaj durumu yönetmek için gereklidir
-- Çalıştırılması gereken SQL (Supabase SQL Editor):

ALTER TABLE iletisim
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'
CHECK (status IN ('new', 'read', 'replied', 'archived'));

-- Not: Mevcut kayıtlar otomatik olarak 'new' durumu alacaktır.
