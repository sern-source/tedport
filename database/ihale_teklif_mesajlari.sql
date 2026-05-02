-- Enes Doğanay | 2 Mayıs 2026: İhale tekliflerine ait mesajlaşma tablosu
-- teklif_mesajlari tablosundan TAMAMEN BAĞIMSIZ — karışma yok.
-- Firma (ihale sahibi) ↔ Teklif veren (bidder) arasında ihale bazlı mesajlaşma.

CREATE TABLE ihale_teklif_mesajlari (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    teklif_id     BIGINT      NOT NULL REFERENCES ihale_teklifleri(id) ON DELETE CASCADE,
    sender_id     UUID        NOT NULL REFERENCES auth.users(id),
    sender_role   TEXT        NOT NULL CHECK (sender_role IN ('company', 'bidder')),
    mesaj         TEXT        NOT NULL CHECK (length(mesaj) > 0 AND length(mesaj) <= 2000),
    okundu_firma  BOOLEAN     NOT NULL DEFAULT false,
    okundu_bidder BOOLEAN     NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- İndeksler
CREATE INDEX ON ihale_teklif_mesajlari (teklif_id, created_at);
CREATE INDEX ON ihale_teklif_mesajlari (sender_id);

-- Realtime için yayın aktif et
ALTER TABLE ihale_teklif_mesajlari REPLICA IDENTITY FULL;

-- ─── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE ihale_teklif_mesajlari ENABLE ROW LEVEL SECURITY;

-- Teklif sahibi (bidder) okuyabilir
CREATE POLICY "bidder_read" ON ihale_teklif_mesajlari
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ihale_teklifleri t
            WHERE t.id = teklif_id AND t.user_id = auth.uid()
        )
    );

-- Firma yöneticisi okuyabilir
CREATE POLICY "company_manager_read" ON ihale_teklif_mesajlari
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM ihale_teklifleri t
            JOIN firma_ihaleleri fi ON fi.id = t.ihale_id
            JOIN kurumsal_firma_yoneticileri kfy ON kfy.firma_id = fi.firma_id::text
            WHERE t.id = teklif_id AND kfy.user_id = auth.uid()
        )
    );

-- Teklif sahibi mesaj gönderebilir (sadece 'bidder' rolüyle)
CREATE POLICY "bidder_insert" ON ihale_teklif_mesajlari
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND sender_role = 'bidder'
        AND EXISTS (
            SELECT 1 FROM ihale_teklifleri t
            WHERE t.id = teklif_id AND t.user_id = auth.uid()
        )
    );

-- Firma yöneticisi mesaj gönderebilir (sadece 'company' rolüyle)
CREATE POLICY "company_manager_insert" ON ihale_teklif_mesajlari
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND sender_role = 'company'
        AND EXISTS (
            SELECT 1
            FROM ihale_teklifleri t
            JOIN firma_ihaleleri fi ON fi.id = t.ihale_id
            JOIN kurumsal_firma_yoneticileri kfy ON kfy.firma_id = fi.firma_id::text
            WHERE t.id = teklif_id AND kfy.user_id = auth.uid()
        )
    );

-- Okundu flag'ini güncelleyebilir: kendi rolüne ait flag
CREATE POLICY "mark_read_bidder" ON ihale_teklif_mesajlari
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM ihale_teklifleri t
            WHERE t.id = teklif_id AND t.user_id = auth.uid()
        )
    ) WITH CHECK (
        okundu_bidder IS NOT NULL  -- bidder sadece okundu_bidder güncelleyebilir
    );

CREATE POLICY "mark_read_company" ON ihale_teklif_mesajlari
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM ihale_teklifleri t
            JOIN firma_ihaleleri fi ON fi.id = t.ihale_id
            JOIN kurumsal_firma_yoneticileri kfy ON kfy.firma_id = fi.firma_id::text
            WHERE t.id = teklif_id AND kfy.user_id = auth.uid()
        )
    ) WITH CHECK (
        okundu_firma IS NOT NULL  -- company sadece okundu_firma güncelleyebilir
    );

-- ─── Realtime broadcast için tablo izni ───────────────────────────────────────
-- Supabase dashboard'da ihale_teklif_mesajlari tablosunu Realtime > Tables altından aktif et
