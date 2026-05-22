-- Enes Doğanay | 23 Mayıs 2026: Firmalar tablosuna SEO slug kolonu ekleniyor
-- /firmalar/:slug URL yapısı için — /firmadetay/:id artık redirect verecek

-- 1. Slug kolonu ekle
ALTER TABLE firmalar ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Türkçe slug üretme fonksiyonu
CREATE OR REPLACE FUNCTION generate_firm_slug(input TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(input);
  -- Türkçe karakterler → ASCII karşılıkları
  result := replace(result, 'ç', 'c');
  result := replace(result, 'ğ', 'g');
  result := replace(result, 'ı', 'i');
  result := replace(result, 'ö', 'o');
  result := replace(result, 'ş', 's');
  result := replace(result, 'ü', 'u');
  result := replace(result, 'â', 'a');
  result := replace(result, 'î', 'i');
  result := replace(result, 'û', 'u');
  -- Özel karakterleri kaldır (harf, rakam, boşluk, kısa çizgi dışı)
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  -- Boşlukları kısa çizgiye çevir
  result := regexp_replace(result, '\s+', '-', 'g');
  -- Baştaki ve sondaki kısa çizgileri kaldır
  result := trim(both '-' from result);
  -- Ardışık kısa çizgileri tekle
  result := regexp_replace(result, '-{2,}', '-', 'g');
  -- Boş sonuç → fallback
  RETURN COALESCE(NULLIF(result, ''), 'firma');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Tüm firmalar için slug üret
UPDATE firmalar
SET slug = generate_firm_slug(firma_adi)
WHERE slug IS NULL;

-- 4. Tekrarlayan slug'lara firmaID suffix ekle
-- (en düşük firmaID temiz slug alır, diğerleri slug-{firmaID} olur)
WITH ranked AS (
  SELECT "firmaID", slug,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "firmaID") AS rn
  FROM firmalar
  WHERE slug IS NOT NULL
)
UPDATE firmalar f
SET slug = r.slug || '-' || f."firmaID"
FROM ranked r
WHERE f."firmaID" = r."firmaID" AND r.rn > 1;

-- 5. Unique constraint
DO $$ BEGIN
  ALTER TABLE firmalar ADD CONSTRAINT firmalar_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 6. Index — slug ile hızlı sorgulama için
CREATE INDEX IF NOT EXISTS idx_firmalar_slug ON firmalar(slug);

-- 7. Trigger: yeni firma eklenince slug otomatik üretilsin
CREATE OR REPLACE FUNCTION set_firma_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;
  base_slug := generate_firm_slug(NEW.firma_adi);
  final_slug := base_slug;
  -- Unique olana kadar -1, -2, ... suffix ekle
  WHILE EXISTS (SELECT 1 FROM firmalar WHERE slug = final_slug AND "firmaID" != NEW."firmaID") LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_firma_slug
BEFORE INSERT OR UPDATE OF firma_adi ON firmalar
FOR EACH ROW EXECUTE FUNCTION set_firma_slug();
