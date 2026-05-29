-- Enes Doğanay | 29 Mayıs 2026: Yanlış tabloya eklenen kolonları temizle
-- Önceki yaklaşımda teklif_talepleri'ne eklenmişti — artık kullanılmıyor
ALTER TABLE teklif_talepleri
  DROP COLUMN IF EXISTS teklif_dokumani_url,
  DROP COLUMN IF EXISTS teklif_dokumani_adi;
