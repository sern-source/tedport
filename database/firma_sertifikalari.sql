-- Enes Doğanay | 12 Mayıs 2026: Firma sertifika talepleri ve onaylı sertifika tabloları
-- Çalıştırma sırası: bu dosyayı tek seferde Supabase SQL editöründe çalıştırın.

-- ──────────────────────────────────────────────────────────────────
-- 1. Sertifika depolama bucket'ı
-- ──────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('sertifika-belgeleri', 'sertifika-belgeleri', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket RLS: Sadece oturum açmış kullanıcılar yükleyebilir
CREATE POLICY "sertifika_belgeleri_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sertifika-belgeleri' AND auth.uid() IS NOT NULL);

CREATE POLICY "sertifika_belgeleri_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sertifika-belgeleri' AND auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────────────────────────────
-- 2. sertifika_talepleri — firma tarafından gönderilen talepler
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sertifika_talepleri (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  firma_id         UUID        NOT NULL REFERENCES firmalar("firmaID") ON DELETE CASCADE,
  firma_adi        TEXT,
  sertifika_turu   TEXT        NOT NULL,
  sertifika_turu_diger TEXT,         -- 'Diger' seçilince serbest metin
  belge_url        TEXT,             -- sertifika-belgeleri bucket içi yol
  durum            TEXT        NOT NULL DEFAULT 'bekliyor'
                               CHECK (durum IN ('bekliyor', 'onaylandi', 'reddedildi')),
  admin_notu       TEXT,
  gecerlilik_tarihi DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────
-- 3. firma_sertifikalari — admin onaylı sertifikalar (herkese açık)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS firma_sertifikalari (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  firma_id          UUID    NOT NULL REFERENCES firmalar("firmaID") ON DELETE CASCADE,
  talep_id          UUID    REFERENCES sertifika_talepleri(id) ON DELETE SET NULL,
  sertifika_turu    TEXT    NOT NULL,
  gecerlilik_tarihi DATE,
  belge_url         TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  -- Her firmada her sertifika tipinden yalnızca bir aktif kayıt olur
  CONSTRAINT firma_sertifika_unique UNIQUE (firma_id, sertifika_turu)
);

-- ──────────────────────────────────────────────────────────────────
-- 4. RLS
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE sertifika_talepleri  ENABLE ROW LEVEL SECURITY;
ALTER TABLE firma_sertifikalari  ENABLE ROW LEVEL SECURITY;

-- firma_sertifikalari: Herkese okuma izni (firma detay sayfası public'tir)
CREATE POLICY "firma_sertifikalari_public_read"
  ON firma_sertifikalari FOR SELECT USING (true);

-- firma_sertifikalari: Admin onay işlemi için insert/update
CREATE POLICY "firma_sertifikalari_auth_insert"
  ON firma_sertifikalari FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "firma_sertifikalari_auth_update"
  ON firma_sertifikalari FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- sertifika_talepleri: Oturum açmış kullanıcılar ekleyebilir
CREATE POLICY "sertifika_talepleri_insert"
  ON sertifika_talepleri FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- sertifika_talepleri: Oturum açmış kullanıcılar okuyabilir (admin panel + firma yöneticisi)
CREATE POLICY "sertifika_talepleri_auth_read"
  ON sertifika_talepleri FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- sertifika_talepleri: Admin güncelleme (onayla/reddet)
CREATE POLICY "sertifika_talepleri_auth_update"
  ON sertifika_talepleri FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────────────────────────────
-- 5. updated_at otomatik trigger
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_sertifika_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER sertifika_talepleri_updated_at
  BEFORE UPDATE ON sertifika_talepleri
  FOR EACH ROW EXECUTE FUNCTION update_sertifika_updated_at();
