-- Enes Doğanay | 10 Nisan 2026: Yeni ihale oluştur modal alanları — kdv, gereksinimler, davet emailleri, davetli firmalar, teslim il/ilçe

-- KDV durumu (dahil / hariç)
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS kdv_durumu text DEFAULT 'haric';

-- Teslim yeri il ve ilçe ayrı ayrı
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS teslim_il text,
  ADD COLUMN IF NOT EXISTS teslim_ilce text;

-- Enes Doğanay | 10 Nisan 2026: Talep edilen teslim süresi (örn. "30 iş günü")
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS teslim_suresi text;

-- İhale gereksinimleri (JSON array — [{id, madde, aciklama}])
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS gereksinimler jsonb DEFAULT '[]'::jsonb;

-- Davet edilecek e-postalar (JSON string array)
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS davet_emailleri jsonb DEFAULT '[]'::jsonb;

-- Davetli firmalar (JSON array — [{firma_id, firma_adi, onayli}])
ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS davetli_firmalar jsonb DEFAULT '[]'::jsonb;

-- Durum CHECK'e 'canli' ekle (mevcut constraint uyumsuzsa güncelle)
-- Not: Mevcut CHECK'te 'active' var, 'canli' yoksa aşağıdaki satırı DB'de çalıştırın:
-- ALTER TABLE public.firma_ihaleleri DROP CONSTRAINT IF EXISTS firma_ihaleleri_durum_check;
-- ALTER TABLE public.firma_ihaleleri ADD CONSTRAINT firma_ihaleleri_durum_check CHECK (durum IN ('draft', 'active', 'canli', 'cancelled', 'completed', 'closed', 'kapali'));
