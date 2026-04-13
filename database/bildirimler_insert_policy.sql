-- Enes Doğanay | 13 Nisan 2026: Bildirimler tablosuna authenticated kullanıcıların INSERT yapabilmesi için RLS politikası
-- Bu politika olmadan client-side'dan bildirim oluşturulamaz (sadece service_role yapabilirdi)

CREATE POLICY "authenticated_insert_bildirimler"
ON bildirimler
FOR INSERT
TO authenticated
WITH CHECK (true);
