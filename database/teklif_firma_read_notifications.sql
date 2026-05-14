-- Enes Doğanay | 14 Mayıs 2026: Teklif mesajı okundu — tüm firma üyelerinin bildirimi temizle
-- Herhangi bir firma üyesi bir teklif sohbetini açtığında bu RPC çağrılır.
-- Firma_id doğrulamasıyla yalnızca yetkili üyeler çağırabilir.

CREATE OR REPLACE FUNCTION public.mark_teklif_firma_notifications_read(
    p_teklif_id bigint,
    p_firma_id  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Çağıranın bu firmaya üye olduğunu doğrula
    IF NOT EXISTS (
        SELECT 1
        FROM public.kurumsal_firma_yoneticileri
        WHERE user_id  = auth.uid()
          AND firma_id = p_firma_id
    ) THEN
        RAISE EXCEPTION 'Erişim reddedildi.';
    END IF;

    -- Firma üyelerinin bu teklife ait tüm okunmamış bildirimlerini okundu yap
    UPDATE public.bildirimler
    SET is_read = true
    WHERE metadata->>'teklif_id' = p_teklif_id::text
      AND type IN ('quote_reply', 'quote_message', 'quote_received')
      AND is_read = false
      AND user_id IN (
          SELECT user_id
          FROM public.kurumsal_firma_yoneticileri
          WHERE firma_id = p_firma_id
      );
END;
$$;

-- Yetki: yalnızca authenticated kullanıcılar çağırabilir (anonlar değil)
GRANT EXECUTE ON FUNCTION public.mark_teklif_firma_notifications_read(bigint, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_teklif_firma_notifications_read(bigint, text) FROM anon;
