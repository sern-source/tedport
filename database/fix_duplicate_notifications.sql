-- Enes Doğanay | 7 Mayıs 2026: Aynı user_id'ye tekrarlı bildirim gönderimini önle
-- Sorun: kurumsal_firma_yoneticileri'nde aynı user_id 2+ kez geçiyorsa,
--        FOR EACH ROW trigger döngüsü aynı kullanıcıya birden fazla bildirim insert eder.
-- Çözüm 1: SELECT DISTINCT — döngü her user_id'yi 1 kez işler
-- Çözüm 2: (firma_id, user_id) UNIQUE constraint — veri bütünlüğü
-- Supabase Dashboard > SQL Editor'de çalıştır

-- ═══════════════════════════════════════════════════════
-- 1) Aynı (firma_id, user_id) çifti için UNIQUE constraint
--    (user_id zaten globally unique, ama ekstra güvence)
-- ═══════════════════════════════════════════════════════
CREATE UNIQUE INDEX IF NOT EXISTS idx_kurumsal_firma_yoneticileri_firma_user_unique
  ON public.kurumsal_firma_yoneticileri (firma_id, user_id);

-- Varsa duplicate satırları temizle (en eski kayıt kalır)
DELETE FROM public.kurumsal_firma_yoneticileri
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.kurumsal_firma_yoneticileri
  GROUP BY firma_id, user_id
);

-- ═══════════════════════════════════════════════════════
-- 2) fn_teklif_mesaj_bildirim — SELECT DISTINCT ile güncelle
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_teklif_mesaj_bildirim()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  teklif_row record;
  hedef_user_id uuid;
  sender_name text;
BEGIN
  SELECT * INTO teklif_row FROM public.teklif_talepleri WHERE id = new.teklif_id;

  IF new.sender_role = 'company' THEN
    -- Firma yanıt verdi → talep gönderene bildirim
    hedef_user_id := teklif_row.user_id;
    SELECT firma_adi INTO sender_name FROM public.firmalar WHERE "firmaID"::text = teklif_row.firma_id::text LIMIT 1;
    sender_name := COALESCE(sender_name, 'Firma');

    INSERT INTO public.bildirimler (user_id, type, title, message, firma_id, metadata)
    VALUES (
      hedef_user_id,
      'quote_reply',
      'Teklif Talebinize Yanıt Geldi',
      sender_name || ' "' || teklif_row.konu || '" konulu talebinize yanıt verdi.',
      teklif_row.firma_id::text,
      jsonb_build_object('teklif_id', teklif_row.id)
    );
  ELSE
    -- Kullanıcı mesaj yazdı → firma yöneticisine bildirim (DISTINCT — duplicate user_id güvencesi)
    FOR hedef_user_id IN
      SELECT DISTINCT user_id FROM public.kurumsal_firma_yoneticileri WHERE firma_id::text = teklif_row.firma_id::text
    LOOP
      INSERT INTO public.bildirimler (user_id, type, title, message, firma_id, metadata)
      VALUES (
        hedef_user_id,
        'quote_message',
        'Teklif Talebinde Yeni Mesaj',
        teklif_row.ad_soyad || ' "' || teklif_row.konu || '" konulu talepte mesaj gönderdi.',
        teklif_row.firma_id::text,
        jsonb_build_object('teklif_id', teklif_row.id)
      );
    END LOOP;
  END IF;

  RETURN new;
END;
$$;

-- ═══════════════════════════════════════════════════════
-- 3) fn_teklif_bildirim_olustur — yeni teklif gelince de DISTINCT
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_teklif_bildirim_olustur()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  yonetici_row record;
  firma_adi_val text;
BEGIN
  SELECT firma_adi INTO firma_adi_val FROM public.firmalar WHERE "firmaID"::text = new.firma_id::text LIMIT 1;

  FOR yonetici_row IN
    SELECT DISTINCT user_id FROM public.kurumsal_firma_yoneticileri WHERE firma_id::text = new.firma_id::text
  LOOP
    INSERT INTO public.bildirimler (user_id, type, title, message, firma_id, metadata)
    VALUES (
      yonetici_row.user_id,
      'quote_received',
      'Yeni Teklif Talebi',
      new.ad_soyad || ' size "' || new.konu || '" konulu bir teklif talebi gönderdi.',
      new.firma_id::text,
      jsonb_build_object('teklif_id', new.id, 'gonderen_ad', new.ad_soyad)
    );
  END LOOP;

  RETURN new;
END;
$$;
