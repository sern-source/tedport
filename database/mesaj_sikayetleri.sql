-- Enes Doğanay | 2 Mayıs 2026: Mesaj şikayet tablosu
-- Tüm mesajlaşma kanallarından (teklif talebi, ihale teklifi) şikayetleri tutar

CREATE TABLE IF NOT EXISTS public.mesaj_sikayetleri (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mesaj_id      text NOT NULL,                         -- şikayet edilen mesajın id'si (uuid veya bigint olabilir)
  kaynak        text NOT NULL CHECK (kaynak IN (
    'teklif_talebi',   -- Profile/FirmaProfil teklif talebi chat (teklif_talep_mesajlari tablosu)
    'ihale_teklifi'    -- MOP/TOM ihale teklifi chat (ihale_teklif_mesajlari tablosu)
  )),
  mesaj_icerik  text,                                  -- şikayet anındaki mesaj içeriği (snapshot)
  neden         text NOT NULL CHECK (neden IN (
    'spam',
    'hakaret',
    'tehdit',
    'yaniltici',
    'diger'
  )),
  aciklama      text,
  durum         text NOT NULL DEFAULT 'bekliyor' CHECK (durum IN ('bekliyor', 'incelendi', 'kapatildi')),
  admin_notu    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.set_mesaj_sikayetleri_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Mevcut tabloda mesaj_id uuid ise text'e çevir (teklif_mesajlari.id bigint)
ALTER TABLE public.mesaj_sikayetleri
  ALTER COLUMN mesaj_id TYPE text USING mesaj_id::text;

DROP TRIGGER IF EXISTS trg_mesaj_sikayetleri_updated_at ON public.mesaj_sikayetleri;
CREATE TRIGGER trg_mesaj_sikayetleri_updated_at
  BEFORE UPDATE ON public.mesaj_sikayetleri
  FOR EACH ROW EXECUTE FUNCTION public.set_mesaj_sikayetleri_updated_at();

-- RLS
ALTER TABLE public.mesaj_sikayetleri ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi şikayetini ekleyebilir
DROP POLICY IF EXISTS "sikayet_insert" ON public.mesaj_sikayetleri;
CREATE POLICY "sikayet_insert" ON public.mesaj_sikayetleri
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Kullanıcı kendi şikayetlerini görebilir
DROP POLICY IF EXISTS "sikayet_select_own" ON public.mesaj_sikayetleri;
CREATE POLICY "sikayet_select_own" ON public.mesaj_sikayetleri
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Admin tümünü görebilir/güncelleyebilir/silebilir (public.is_admin() fonksiyonu iletisim_admin_rls.sql'de tanımlı)
DROP POLICY IF EXISTS "sikayet_select_admin" ON public.mesaj_sikayetleri;
CREATE POLICY "sikayet_select_admin" ON public.mesaj_sikayetleri
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "sikayet_update_admin" ON public.mesaj_sikayetleri;
CREATE POLICY "sikayet_update_admin" ON public.mesaj_sikayetleri
  FOR UPDATE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "sikayet_delete_admin" ON public.mesaj_sikayetleri;
CREATE POLICY "sikayet_delete_admin" ON public.mesaj_sikayetleri
  FOR DELETE TO authenticated
  USING (public.is_admin());
