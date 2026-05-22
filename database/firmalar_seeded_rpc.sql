-- Enes Doğanay | 19 Mayıs 2026: Tier-bazlı seed'li rastgele sıralama — her oturumda farklı, oturum boyunca sabit
-- Tier 2 (en üst): Onaylı firma (onayli_hesap = true) → kendi içinde seed'li random
-- Tier 1 (orta):   Onaylı değil ama logosu + ürünleri olan → kendi içinde seed'li random
-- Tier 0 (alt):    Gerisi → kendi içinde seed'li random
--
-- Supabase Dashboard > SQL Editor'de bu dosyayı çalıştırın.

CREATE OR REPLACE FUNCTION get_firmalar_seeded(
  p_seed            FLOAT8,       -- Oturum seed'i (0.0 - 1.0), sessionStorage'dan gelir
  p_limit           INT,          -- Sayfa boyutu (genellikle 10)
  p_offset          INT,          -- Sayfalama offset'i
  p_search_terms    TEXT[],       -- expandSearchTerms() çıktısı — boşsa {}
  p_search_mode     TEXT,         -- 'all' | 'firma' | 'urun'
  p_only_verified   BOOLEAN,      -- filters.onlyVerified
  p_cities          TEXT[],       -- filters.cities (ham şehir adları) — boşsa {}
  p_sector_keywords TEXT[],       -- getSektorKeywords() ile genişletilmiş sektör kelimeleri
  p_category_keywords TEXT[],     -- getSektorKeywords() ile genişletilmiş kategori kelimeleri
  p_istanbul_avrupa TEXT[],       -- ISTANBUL_AVRUPA sabiti (client'tan gelir)
  p_istanbul_anadolu TEXT[]       -- ISTANBUL_ANADOLU sabiti (client'tan gelir)
)
RETURNS TABLE(
  "firmaID"         UUID,
  slug              TEXT,
  firma_adi         TEXT,
  il_ilce           TEXT,
  description       TEXT,
  ana_sektor        TEXT,
  urun_kategorileri TEXT,
  logo_url          TEXT,
  category_name     TEXT,
  best              BOOLEAN,
  telefon           TEXT,
  eposta            TEXT,
  web_sitesi        TEXT,
  adres             TEXT,
  onayli_hesap      BOOLEAN,
  is_demo           BOOLEAN,
  total_count       BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      f."firmaID",
      f.firma_adi,
      f.il_ilce,
      f.slug,
      f.description,
      f.ana_sektor,
      f.urun_kategorileri,
      f.logo_url,
      f.category_name,
      f.best,
      f.telefon,
      f.eposta,
      f.web_sitesi,
      f.adres,
      f.onayli_hesap,
      f.is_demo,
      COUNT(*) OVER() AS total_count,
      -- Tier skoru: onaylı → 2, logolu+ürünlü → 1, diğer → 0
      (CASE
        WHEN f.onayli_hesap = true THEN 2
        WHEN f.has_logo = true
          AND f.urun_kategorileri IS NOT NULL
          AND f.urun_kategorileri <> '' THEN 1
        ELSE 0
      END) AS tier_score
    FROM firmalar f
    WHERE TRUE

      -- Demo firmalar her zaman hariç
      AND (f.is_demo = false OR f.is_demo IS NULL)

      -- onlyVerified filtresi
      AND (
        NOT p_only_verified
        OR f.onayli_hesap = true
      )

      -- Arama filtresi (boş array = filtre yok)
      AND (
        array_length(p_search_terms, 1) IS NULL
        OR (
          p_search_mode = 'all' AND EXISTS (
            SELECT 1 FROM unnest(p_search_terms) AS t(term) WHERE
              f.firma_adi        ILIKE '%' || t.term || '%'
              OR f.description   ILIKE '%' || t.term || '%'
              OR f.ana_sektor    ILIKE '%' || t.term || '%'
              OR f.urun_kategorileri ILIKE '%' || t.term || '%'
              OR f.arama_etiketleri  ILIKE '%' || t.term || '%'
          )
          OR (
            p_search_mode = 'firma' AND EXISTS (
              SELECT 1 FROM unnest(p_search_terms) AS t(term) WHERE
                f.firma_adi      ILIKE '%' || t.term || '%'
                OR f.description ILIKE '%' || t.term || '%'
                OR f.ana_sektor  ILIKE '%' || t.term || '%'
            )
          )
          OR (
            p_search_mode = 'urun' AND EXISTS (
              SELECT 1 FROM unnest(p_search_terms) AS t(term) WHERE
                f.urun_kategorileri ILIKE '%' || t.term || '%'
                OR f.arama_etiketleri   ILIKE '%' || t.term || '%'
                OR f.description        ILIKE '%' || t.term || '%'
                OR f.category_name      ILIKE '%' || t.term || '%'
            )
          )
        )
      )

      -- Şehir filtresi (boş array = filtre yok)
      AND (
        array_length(p_cities, 1) IS NULL
        OR EXISTS (
          SELECT 1 FROM unnest(p_cities) AS c(city) WHERE
            (
              c.city = 'İstanbul (Avrupa)'
              AND array_length(p_istanbul_avrupa, 1) IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM unnest(p_istanbul_avrupa) AS d(dist)
                WHERE f.il_ilce ILIKE '%' || d.dist || '%'
              )
            )
            OR (
              c.city = 'İstanbul (Anadolu)'
              AND array_length(p_istanbul_anadolu, 1) IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM unnest(p_istanbul_anadolu) AS d(dist)
                WHERE f.il_ilce ILIKE '%' || d.dist || '%'
              )
            )
            OR (
              c.city NOT IN ('İstanbul (Avrupa)', 'İstanbul (Anadolu)')
              AND f.il_ilce ILIKE '%' || c.city || '%'
            )
        )
      )

      -- Sektör filtresi (boş array = filtre yok)
      AND (
        array_length(p_sector_keywords, 1) IS NULL
        OR EXISTS (
          SELECT 1 FROM unnest(p_sector_keywords) AS k(kw) WHERE
            f.ana_sektor          ILIKE '%' || k.kw || '%'
            OR f.urun_kategorileri ILIKE '%' || k.kw || '%'
            OR f.arama_etiketleri  ILIKE '%' || k.kw || '%'
        )
      )

      -- Kategori filtresi (boş array = filtre yok)
      AND (
        array_length(p_category_keywords, 1) IS NULL
        OR EXISTS (
          SELECT 1 FROM unnest(p_category_keywords) AS k(kw) WHERE
            f.category_name        ILIKE '%' || k.kw || '%'
            OR f.urun_kategorileri ILIKE '%' || k.kw || '%'
            OR f.arama_etiketleri  ILIKE '%' || k.kw || '%'
        )
      )
  )
  SELECT
    base."firmaID",
    base.slug,
    base.firma_adi,
    base.il_ilce,
    base.description,
    base.ana_sektor,
    base.urun_kategorileri,
    base.logo_url,
    base.category_name,
    base.best,
    base.telefon,
    base.eposta,
    base.web_sitesi,
    base.adres,
    base.onayli_hesap,
    base.is_demo,
    base.total_count
  FROM base
  ORDER BY
    base.tier_score DESC,
    md5(base."firmaID"::text || p_seed::text)
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
