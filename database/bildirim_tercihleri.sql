-- Enes Doğanay | 17 Nisan 2026: Bildirim tercihleri tablosu
-- Kullanıcının hangi bildirim tiplerini almak istediğini saklar

CREATE TABLE IF NOT EXISTS bildirim_tercihleri (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teklif_talepleri boolean DEFAULT true,
  teklif_yanitlari boolean DEFAULT true,
  teklif_mesajlari boolean DEFAULT true,
  hatirlatmalar boolean DEFAULT true,
  ihale_teklifleri boolean DEFAULT true,
  ihale_durum_degisiklikleri boolean DEFAULT true,
  -- Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajı bildirimi tercihi
  ihale_teklif_mesajlari boolean DEFAULT true,
  anlik_bildirimler boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE bildirim_tercihleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_prefs"
  ON bildirim_tercihleri FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_prefs"
  ON bildirim_tercihleri FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_prefs"
  ON bildirim_tercihleri FOR UPDATE
  USING (auth.uid() = user_id);

-- Enes Doğanay | 2 Mayıs 2026: Mevcut tabloya ihale_teklif_mesajlari kolonu ekle
ALTER TABLE bildirim_tercihleri
  ADD COLUMN IF NOT EXISTS ihale_teklif_mesajlari boolean DEFAULT true;
