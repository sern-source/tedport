-- Enes Doğanay | 13 Nisan 2026: Logolu firmaları önceliklendirmek için generated column
-- logo_url içinde 'firma-logolari' geçen firmalar has_logo = true olur
-- Bu sayede DB seviyesinde sıralama yapılabilir (sayfalama tutarlılığı)

ALTER TABLE firmalar
ADD COLUMN IF NOT EXISTS has_logo boolean
GENERATED ALWAYS AS (logo_url IS NOT NULL AND logo_url LIKE '%firma-logolari%') STORED;
