-- Enes Doğanay | 14 Nisan 2026: iletisim tablosu admin RLS politikaları
-- Admin panelinden mesajları okuma, güncelleme ve silme yetkisi
-- Çalıştırılması gereken SQL (Supabase SQL Editor):

-- 1) Admin kontrol fonksiyonu (SECURITY DEFINER — RLS bypass eder)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_epostalari
    WHERE email = (auth.jwt() ->> 'email')
  );
$$;

-- 2) RLS etkin olduğundan emin ol
ALTER TABLE iletisim ENABLE ROW LEVEL SECURITY;

-- 3) Eski politikaları temizle (varsa)
DROP POLICY IF EXISTS "Herkes iletisim formu gonderebilir" ON iletisim;
DROP POLICY IF EXISTS "Admin mesajlari okuyabilir" ON iletisim;
DROP POLICY IF EXISTS "Admin mesajlari guncelleyebilir" ON iletisim;
DROP POLICY IF EXISTS "Admin mesajlari silebilir" ON iletisim;

-- 4) Herkes iletişim formu gönderebilsin
CREATE POLICY "Herkes iletisim formu gonderebilir"
  ON iletisim FOR INSERT
  WITH CHECK (true);

-- 5) Admin mesajları okuyabilsin
CREATE POLICY "Admin mesajlari okuyabilir"
  ON iletisim FOR SELECT
  USING (public.is_admin());

-- 6) Admin mesaj durumunu güncelleyebilsin
CREATE POLICY "Admin mesajlari guncelleyebilir"
  ON iletisim FOR UPDATE
  USING (public.is_admin());

-- 7) Admin mesaj silebilsin
CREATE POLICY "Admin mesajlari silebilir"
  ON iletisim FOR DELETE
  USING (public.is_admin());
