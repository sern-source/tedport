-- Enes Doğanay | 10 Nisan 2026: İhale ek dokümanları için storage bucket + RLS

-- 1) Bucket oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ihale-ekleri',
  'ihale-ekleri',
  true,
  10485760, -- 10 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/zip',
    'application/octet-stream'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2) Herkes okuyabilsin (public bucket)
CREATE POLICY "ihale_ekleri_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ihale-ekleri');

-- 3) Giriş yapmış kullanıcılar yükleyebilsin
CREATE POLICY "ihale_ekleri_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ihale-ekleri' AND auth.role() = 'authenticated');

-- 4) Dosya sahibi silebilsin
CREATE POLICY "ihale_ekleri_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ihale-ekleri' AND auth.uid() = owner);

-- 5) ek_dosyalar kolonu (dosya meta bilgileri: [{name, path, size, url}])
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS ek_dosyalar jsonb DEFAULT '[]'::jsonb;
