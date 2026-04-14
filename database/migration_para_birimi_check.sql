-- Enes Doğanay | 14 Nisan 2026: para_birimi CHECK kısıtını genişlet — kalem bazlı para birimi desteği
-- Artık kalem bazında para birimi JSON'da saklanıyor (kalemler jsonb içinde para_birimi alanı).
-- Ana para_birimi sütunu backward compat için kalıyor, sadece 4 temel değer kabul ediyor.
-- İleride CHECK kısıtını tamamen kaldırmak veya genişletmek isterseniz aşağıdaki satırı çalıştırın:

-- CHECK kısıtını kaldır (opsiyonel — şu an kalem JSON'da tutulduğu için gerek yok)
-- ALTER TABLE public.ihale_teklifleri DROP CONSTRAINT IF EXISTS ihale_teklifleri_para_birimi_check;
-- ALTER TABLE public.ihale_teklifleri ADD CONSTRAINT ihale_teklifleri_para_birimi_check 
--     CHECK (para_birimi IS NOT NULL AND length(para_birimi) >= 2 AND length(para_birimi) <= 5);

-- NOT: Şu anki implementasyonda ana "para_birimi" kolonu hâlâ TRY/USD/EUR/GBP kabul ediyor.
-- Tüm para birimi bilgisi "kalemler" JSONB alanındaki her kalem objesinin "para_birimi" key'inde saklanıyor.
-- Eski tekliflerde kalem bazında para_birimi yoksa, ana "para_birimi" alanı fallback olarak kullanılıyor.
