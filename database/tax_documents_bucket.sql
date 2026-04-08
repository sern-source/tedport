-- Enes Doğanay | 8 Nisan 2026: Vergi levhası belgeleri için ayrı private bucket
-- Anonim kullanıcılar yükleyebilir (kayıt formu), yalnızca adminler okuyabilir

-- 1) Bucket oluştur (private — public URL yok)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tax-documents', 'tax-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Herkes yükleyebilir (kayıt formu anonim kullanıcı ile çalışır)
CREATE POLICY "Anyone can upload tax documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tax-documents');

-- 3) Yalnızca adminler okuyabilir (signed URL için gerekli)
CREATE POLICY "Only admins can read tax documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tax-documents'
  AND public.is_current_user_admin()
);
