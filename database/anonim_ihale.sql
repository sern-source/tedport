-- Enes Doğanay | 2 Mayıs 2026: Anonim ihale özelliği — firma adı gizlenebilir
ALTER TABLE firma_ihaleleri
  ADD COLUMN IF NOT EXISTS anonim BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN firma_ihaleleri.anonim IS 'true ise ihale kartlarında ve detayda firma adı gizlenir';
