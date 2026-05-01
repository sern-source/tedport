-- KVKK Consent Logs Table
-- Kullanıcıların kayıt sırasında verdikleri rızaların kayıt altına alınması
-- KVKK madde 5/1 kapsamında rıza ispat yükümlülüğü için

CREATE TABLE IF NOT EXISTS public.consent_logs (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kvkk_accepted boolean NOT NULL DEFAULT false,
    marketing_accepted boolean NOT NULL DEFAULT false,
    consent_text_version text NOT NULL DEFAULT 'v1.0-2026-05',  -- metin versiyonu
    signup_method text NOT NULL DEFAULT 'email',                -- 'email' | 'google' | 'linkedin'
    ip_address    inet,                                         -- kayıt sırasındaki IP adresi
    user_agent    text,                                         -- tarayıcı bilgisi
    consented_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS consent_logs_user_id_idx ON public.consent_logs(user_id);

-- Row Level Security
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi rıza kaydını görebilir (okuma hakkı)
CREATE POLICY "Users can view own consent logs"
    ON public.consent_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Sadece insert izni — rıza kaydı sadece kayıt sırasında oluşturulur
CREATE POLICY "Users can insert own consent logs"
    ON public.consent_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Güncelleme ve silmeye izin yok (audit trail korunmalı)
-- Adminler servis rolü ile erişebilir

COMMENT ON TABLE public.consent_logs IS
    'KVKK uyumluluğu için kullanıcı rızası kayıtları. Kayıt sırasında oluşturulur.';

COMMENT ON COLUMN public.consent_logs.kvkk_accepted IS
    'Kullanıcının KVKK Aydınlatma Metnini, Hizmet Şartlarını ve Gizlilik Politikasını kabul edip etmediği';

COMMENT ON COLUMN public.consent_logs.marketing_accepted IS
    'Kullanıcının ticari elektronik ileti (pazarlama) için açık rıza verip vermediği';

COMMENT ON COLUMN public.consent_logs.consent_text_version IS
    'Onaylanan metnin versiyonu. Metin güncellendiğinde artırılır.';

COMMENT ON COLUMN public.consent_logs.ip_address IS
    'Rızanın verildiği andaki kullanıcı IP adresi (kanıt amaçlı)';

COMMENT ON COLUMN public.consent_logs.user_agent IS
    'Rızanın verildiği andaki tarayıcı / cihaz bilgisi';
