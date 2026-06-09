-- Enes Doğanay | 9 Haziran 2026: Tedport firmasını listeden gizle
-- is_demo = true yapılır → get_firmalar_seeded RPC zaten demo firmaları hariç tutuyor
-- Firma profili ve sayfası silinmez, sadece listede görünmez
-- Çalıştırmak için: Supabase Dashboard > SQL Editor

UPDATE public.firmalar
SET is_demo = true
WHERE firma_adi ILIKE '%tedport%';
