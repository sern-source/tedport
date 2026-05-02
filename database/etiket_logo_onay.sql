-- ═══════════════════════════════════════════════════════════════════════════
-- Arama Etiketleri + Logo Onay Sistemi Migration
-- Supabase SQL Editor'da çalıştırın.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) firmalar tablosuna yeni kolonlar ekle
ALTER TABLE public.firmalar
  ADD COLUMN IF NOT EXISTS arama_etiketleri    TEXT,
  ADD COLUMN IF NOT EXISTS pending_logo_url    TEXT,
  ADD COLUMN IF NOT EXISTS pending_logo_red_notu TEXT;

-- 2) Etiket talepleri tablosu
CREATE TABLE IF NOT EXISTS public.etiket_talepleri (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  firma_id         UUID        NOT NULL REFERENCES public.firmalar("firmaID") ON DELETE CASCADE,
  firma_adi        TEXT,
  talep_eden_user  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  etiketler        TEXT        NOT NULL,
  durum            TEXT        NOT NULL DEFAULT 'bekliyor'
                                CHECK (durum IN ('bekliyor', 'onaylandi', 'reddedildi')),
  admin_notu       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- 3) RLS
ALTER TABLE public.etiket_talepleri ENABLE ROW LEVEL SECURITY;

-- Firma sahibi kendi taleplerini görebilir ve ekleyebilir
DROP POLICY IF EXISTS "etiket_talepleri_firma_select" ON public.etiket_talepleri;
CREATE POLICY "etiket_talepleri_firma_select"
  ON public.etiket_talepleri FOR SELECT
  USING (talep_eden_user = auth.uid());

DROP POLICY IF EXISTS "etiket_talepleri_firma_insert" ON public.etiket_talepleri;
CREATE POLICY "etiket_talepleri_firma_insert"
  ON public.etiket_talepleri FOR INSERT
  WITH CHECK (talep_eden_user = auth.uid());

-- Admin tüm talepleri görebilir, güncelleyebilir
DROP POLICY IF EXISTS "etiket_talepleri_admin_all" ON public.etiket_talepleri;
CREATE POLICY "etiket_talepleri_admin_all"
  ON public.etiket_talepleri FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_epostalari
      WHERE admin_epostalari.email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_epostalari
      WHERE admin_epostalari.email = (auth.jwt() ->> 'email')
    )
  );

-- 4) updated_at otomatik güncelleme trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS etiket_talepleri_updated_at ON public.etiket_talepleri;
CREATE TRIGGER etiket_talepleri_updated_at
  BEFORE UPDATE ON public.etiket_talepleri
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) firmalar tablosuna admin update policy ekle (arama_etiketleri + pending_logo_url + logo_url)
DROP POLICY IF EXISTS "firmalar_admin_update" ON public.firmalar;
CREATE POLICY "firmalar_admin_update"
  ON public.firmalar FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_epostalari
      WHERE admin_epostalari.email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_epostalari
      WHERE admin_epostalari.email = (auth.jwt() ->> 'email')
    )
  );

-- 6) Index
CREATE INDEX IF NOT EXISTS idx_etiket_talepleri_durum    ON public.etiket_talepleri(durum);
CREATE INDEX IF NOT EXISTS idx_etiket_talepleri_firma_id ON public.etiket_talepleri(firma_id);
CREATE INDEX IF NOT EXISTS idx_firmalar_arama_etiketleri ON public.firmalar USING gin(to_tsvector('turkish', coalesce(arama_etiketleri,'')));
