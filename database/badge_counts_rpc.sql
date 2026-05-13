-- Enes Doğanay | 13 Mayıs 2026: Tek RPC ile tüm badge sayıları — N+1 sorgusunu 1'e indirger
-- Parametre: p_user_id (zorunlu), p_company_id text (opsiyonel — kurumsal hesap için)
-- Döner: { firma_adi, pending_quote_count, ihale_yonetimi_unread, my_offers_unread, notif_unread }

CREATE OR REPLACE FUNCTION get_user_badge_counts(
    p_user_id uuid,
    p_company_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_firma_adi          text := NULL;
    v_pending_quote      int  := 0;
    v_ihale_unread       int  := 0;
    v_my_offers_unread   int  := 0;
    v_notif_unread       int  := 0;
BEGIN
    -- Bireysel: okunmamış teklif/mesaj bildirimleri
    SELECT COUNT(*) INTO v_notif_unread
    FROM bildirimler
    WHERE user_id  = p_user_id
      AND is_read  = false
      AND type    IN ('quote_reply', 'quote_message');

    -- Bireysel: verdiğim tekliflerde okunmamış firma mesajları
    SELECT COUNT(*) INTO v_my_offers_unread
    FROM ihale_teklif_mesajlari m
    JOIN ihale_teklifleri        o ON m.teklif_id = o.id
    WHERE o.user_id         = p_user_id
      AND m.sender_role     = 'company'
      AND m.okundu_bidder   = false;

    -- Kurumsal: firma adı + bekleyen teklif talebi + okunmamış ihale mesajları
    IF p_company_id IS NOT NULL THEN
        BEGIN
            SELECT firma_adi INTO v_firma_adi
            FROM firmalar
            WHERE "firmaID"::text = p_company_id;
        EXCEPTION WHEN others THEN
            v_firma_adi := NULL;
        END;

        SELECT COUNT(*) INTO v_pending_quote
        FROM teklif_talepleri
        WHERE firma_id::text = p_company_id
          AND durum = 'pending';

        SELECT COUNT(*) INTO v_ihale_unread
        FROM ihale_teklif_mesajlari m
        JOIN ihale_teklifleri        o ON m.teklif_id = o.id
        JOIN firma_ihaleleri         i ON o.ihale_id  = i.id
        WHERE i.firma_id::text    = p_company_id
          AND m.sender_role       = 'bidder'
          AND m.okundu_firma      = false;
    END IF;

    RETURN jsonb_build_object(
        'firma_adi',              v_firma_adi,
        'pending_quote_count',    v_pending_quote,
        'ihale_yonetimi_unread',  v_ihale_unread,
        'my_offers_unread',       v_my_offers_unread,
        'notif_unread',           v_notif_unread
    );
END;
$$;

-- Authenticated kullanıcılar çağırabilir
GRANT EXECUTE ON FUNCTION get_user_badge_counts(uuid, text) TO authenticated;
