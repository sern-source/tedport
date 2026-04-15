-- Enes Doğanay | 15 Nisan 2026: Kapatılan ihalelerin başkaları tarafından görünürlüğü
-- Değerler: 'gorunur' (herkese açık kalır) veya 'gizle' (listeden kaldırılır)

ALTER TABLE public.firma_ihaleleri
  ADD COLUMN IF NOT EXISTS kapali_gorunurluk text DEFAULT 'gizle';
