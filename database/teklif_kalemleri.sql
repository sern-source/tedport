-- Enes Doğanay | 14 Mayıs 2026: teklif_talepleri tablosuna kalemler JSONB alanı ekleme
-- Her teklif talebi artık kalem kalem ürün/malzeme listesi taşıyabilir
-- Örnek veri: [{"id":"123","adet":5,"birim":"Adet","madde":"Paslanmaz Boru","aciklama":"DN50 PN16"}]

ALTER TABLE public.teklif_talepleri
ADD COLUMN IF NOT EXISTS kalemler JSONB DEFAULT '[]'::jsonb;

-- Mevcut satırlarda kalemler null ise boş dizi yap
UPDATE public.teklif_talepleri
SET kalemler = '[]'::jsonb
WHERE kalemler IS NULL;
