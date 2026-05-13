-- Enes Doğanay | 13 Mayıs 2026: İhale tamamlandı akışı — durum + kazanan teklif kolonu
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- 1) 'tamamlandi' değerini check constraint'e ekle
ALTER TABLE public.firma_ihaleleri
    DROP CONSTRAINT IF EXISTS firma_ihaleleri_durum_check;

ALTER TABLE public.firma_ihaleleri
    ADD CONSTRAINT firma_ihaleleri_durum_check
    CHECK (durum IN ('draft','taslak','canli','active','kapali','closed','cancelled','iptal','tamamlandi','completed'));

-- 2) Kazanan teklif referansı (opsiyonel — NULL = seçilmedi)
ALTER TABLE public.firma_ihaleleri
    ADD COLUMN IF NOT EXISTS kazanan_teklif_id bigint
    REFERENCES public.ihale_teklifleri(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_firma_ihaleleri_kazanan
    ON public.firma_ihaleleri (kazanan_teklif_id)
    WHERE kazanan_teklif_id IS NOT NULL;
