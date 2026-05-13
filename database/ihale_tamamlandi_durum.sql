-- Enes Doğanay | 13 Mayıs 2026: firma_ihaleleri.durum CHECK constraint'e tamamlandi eklendi
-- Evet, Tamamla butonu çalışmıyordu çünkü DB tamamlandi değerini reddediyordu

-- Mevcut constraint'i kaldır
ALTER TABLE public.firma_ihaleleri
    DROP CONSTRAINT IF EXISTS firma_ihaleleri_durum_check;

-- tamamlandi değerini içeren yeni constraint ekle
ALTER TABLE public.firma_ihaleleri
    ADD CONSTRAINT firma_ihaleleri_durum_check
    CHECK (durum IN ('draft', 'canli', 'kapali', 'tamamlandi'));
