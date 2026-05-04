-- Enes Doğanay | 4 Mayıs 2026: Alıcı notu — ihale sahibinin teklife özel private notu
-- Supabase Dashboard > SQL Editor'de çalıştırın.

alter table public.ihale_teklifleri
    add column if not exists alici_notu text default null;

-- RLS: ihale sahibi (firma_id) kendi notunu güncelleyebilsin
-- Mevcut RLS politikaları yeterliyse ayrıca eklemeye gerek yok;
-- update policy'de firma_id kontrolü zaten varsa bu otomatik kapsamda kalır.
