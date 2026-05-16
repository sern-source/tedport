-- Enes Doğanay | 16 Mayıs 2026: Demo ortamı seed verisi
-- Yatırımcı ve kurumsal sunumlar için hazır demo hesapları + gerçekçi ihale/teklif verileri
-- Çalıştırmak için: Supabase Dashboard > SQL Editor
--
-- Ana demo hesapları (giriş yapılabilir):
--   Alıcı Firma  → demo.alici@tedport.com     / Demo2026!
--   Tedarikçi    → demo.tedarikci@tedport.com / Demo2026!
--   Bireysel     → demo.bireysel@tedport.com  / Demo2026!
--
-- İdempotent: Birden fazla kez çalıştırılabilir.
-- Silmek için: database/demo_seed_cleanup.sql (ayrıca oluşturulabilir)

-- ════════════════════════════════════════════════════════════════
-- 1. AUTH USERS  (bcrypt hash — pgcrypto Supabase'de varsayılan aktif)
-- ════════════════════════════════════════════════════════════════

DO $auth$
BEGIN
  -- 6 demo kullanıcı: 3 ana giriş + 3 hayalet teklif kullanıcısı
  -- Sabit UUID prefix: de0000xx — kolayca tanımlanabilir / silinebilir

  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token,
    email_change, email_change_token_new,
    created_at, updated_at
  ) VALUES
    -- Alıcı firma yöneticisi (Kardemir Çelik)
    ('de000001-0000-4000-8000-000000000000'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'demo.alici@tedport.com', crypt('Demo2026!', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     false, '', '', '', '', now(), now()),

    -- Tedarikçi firma yöneticisi (Metalsan Makine)
    ('de000002-0000-4000-8000-000000000000'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'demo.tedarikci@tedport.com', crypt('Demo2026!', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     false, '', '', '', '', now(), now()),

    -- Bireysel kullanıcı (firma sahibi değil)
    ('de000003-0000-4000-8000-000000000000'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'demo.bireysel@tedport.com', crypt('Demo2026!', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     false, '', '', '', '', now(), now()),

    -- Hayalet teklif kullanıcıları (FastLog, bireysel#2, bireysel#3)
    ('de000004-0000-4000-8000-000000000000'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'demo.ghost1@tedport.com', crypt('Demo2026!', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     false, '', '', '', '', now(), now()),

    ('de000005-0000-4000-8000-000000000000'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'demo.ghost2@tedport.com', crypt('Demo2026!', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     false, '', '', '', '', now(), now()),

    ('de000006-0000-4000-8000-000000000000'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'demo.ghost3@tedport.com', crypt('Demo2026!', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     false, '', '', '', '', now(), now())

  ON CONFLICT (id) DO UPDATE
    SET encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
        updated_at = now();
END $auth$;

-- ════════════════════════════════════════════════════════════════
-- 2. AUTH IDENTITIES  (email provider kaydı — şifre girişi için gerekli)
-- ════════════════════════════════════════════════════════════════

INSERT INTO auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
SELECT
  u.email,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(), now(), now()
FROM auth.users u
WHERE u.email LIKE 'demo.%@tedport.com'
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 3. PROFİLLER
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.profiles (id, first_name, last_name, email, phone, location, company_name)
VALUES
  ('de000001-0000-4000-8000-000000000000'::uuid,
   'Hasan',  'Çelik',   'demo.alici@tedport.com',      '+90 312 555 01 01', 'İstanbul', 'Kardemir Çelik A.Ş.'),
  ('de000002-0000-4000-8000-000000000000'::uuid,
   'Mehmet', 'Demir',   'demo.tedarikci@tedport.com',  '+90 224 555 02 02', 'Bursa',    'Metalsan Makine San. A.Ş.'),
  ('de000003-0000-4000-8000-000000000000'::uuid,
   'Ayşe',   'Kaya',    'demo.bireysel@tedport.com',   '+90 532 555 03 03', 'Ankara',    null),
  ('de000004-0000-4000-8000-000000000000'::uuid,
   'Selim',  'Yılmaz',  'demo.ghost1@tedport.com',     '+90 216 555 04 04', 'İstanbul', 'FastLog Lojistik A.Ş.'),
  ('de000005-0000-4000-8000-000000000000'::uuid,
   'Elif',   'Arslan',  'demo.ghost2@tedport.com',     '+90 442 555 05 05', 'Erzurum',  null),
  ('de000006-0000-4000-8000-000000000000'::uuid,
   'Murat',  'Koç',     'demo.ghost3@tedport.com',     '+90 412 555 06 06', 'Diyarbakır', null)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 4. FİRMALAR  (4 demo firma — 2 alıcı, 2 tedarikçi)
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.firmalar (
  "firmaID", firma_adi, ana_sektor, category_name, il_ilce,
  description, telefon, eposta, web_sitesi, onayli_hesap
)
VALUES
  -- Alıcı firma 1: Demir-Çelik sektöründen ihale açacak
  ('da000001-0000-4000-8000-000000000000',
   'Kardemir Çelik A.Ş.',
   'Demir & Çelik', 'Demir & Çelik', 'İstanbul / Tuzla',
   'Türkiye''nin köklü demir-çelik üreticilerinden. İnşaat demiri, profil çelik ve sac ürünleri tedarik zinciri yönetimi için Tedport''u kullanmaktadır.',
   '+90 212 555 01 01', 'tedarik@kardemir-demo.com', 'kardemir-demo.com', true),

  -- Alıcı firma 2: Gıda sektöründen ihale açacak
  ('da000002-0000-4000-8000-000000000000',
   'Keyifli Gıda ve İçecek A.Ş.',
   'Gıda & Tarım', 'Gıda & Tarım', 'İzmir / Bornova',
   'Batı Anadolu''nun önde gelen gıda üretim tesislerinden biri. Ambalaj, lojistik ve hammadde tedariği için Tedport''u kullanmaktadır.',
   '+90 232 555 01 02', 'satin.alma@keyifli-demo.com', 'keyifli-demo.com', true),

  -- Tedarikçi firma 1: Makine bakım-onarım
  ('b0000001-0000-4000-8000-000000000000',
   'Metalsan Makine San. A.Ş.',
   'Makine & Teçhizat', 'Makine & Teçhizat', 'Bursa / Nilüfer',
   'CNC tezgah bakımı, kaynak ve mekanik imalat alanında uzmanlaşmış tedarikçi. Ağır sanayi makineleri için OEM ve yedek parça tedariki yapmaktadır.',
   '+90 224 555 02 02', 'teklif@metalsan-demo.com', 'metalsan-demo.com', true),

  -- Tedarikçi firma 2: Lojistik
  ('b0000002-0000-4000-8000-000000000000',
   'FastLog Lojistik A.Ş.',
   'Lojistik & Taşımacılık', 'Lojistik & Taşımacılık', 'İstanbul / Pendik',
   'Soğuk zincir, parsiyel ve komple yük taşımacılığı alanında faaliyet gösteren lojistik firması. ATP sertifikalı araç filosuyla gıda sektörüne hizmet vermektedir.',
   '+90 216 555 04 04', 'info@fastlog-demo.com', 'fastlog-demo.com', true)

ON CONFLICT ("firmaID") DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 5. KURUMSAL FİRMA YÖNETİCİLERİ
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.kurumsal_firma_yoneticileri (user_id, firma_id, role, title)
VALUES
  ('de000001-0000-4000-8000-000000000000'::uuid, 'da000001-0000-4000-8000-000000000000', 'owner', 'Satınalma Direktörü'),
  ('de000002-0000-4000-8000-000000000000'::uuid, 'b0000001-0000-4000-8000-000000000000',   'owner', 'Genel Müdür'),
  ('de000004-0000-4000-8000-000000000000'::uuid, 'b0000002-0000-4000-8000-000000000000',   'owner', 'Operasyon Müdürü')
ON CONFLICT (user_id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 6. İHALELER  (4 adet — 3 aktif/canlı, 1 tamamlandı)
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.firma_ihaleleri (
  firma_id, slug, baslik, aciklama,
  ihale_tipi, kategori, il_ilce, referans_no,
  yayin_tarihi, son_basvuru_tarihi, durum,
  butce_notu, basvuru_email, is_active, is_featured,
  kdv_durumu, teslim_il, teslim_suresi, gereksinimler
)
VALUES

  -- İhale 1: Demir alımı — büyük bütçe, demir-çelik sektörü (Kardemir açıyor)
  ('da000001-0000-4000-8000-000000000000',
   'demo-hb400-insaat-demiri-500-ton',
   'HB400 Nervürlü İnşaat Demiri — 500 Ton Alımı',
   'Ankara bölgesi konut projelerimiz kapsamında HB400 standartlarına uygun nervürlü inşaat demiri satın alınacaktır. Teklifler her kalem için ayrı birim fiyat içermelidir. Teslimat Ankara merkez depoya yapılacaktır.',
   'Açık İhale', 'Demir & Çelik', 'İstanbul / Tuzla', 'TED-DEMO-2026-001',
   now() - interval '3 days', now() + interval '7 days', 'canli',
   '2.500.000 – 3.000.000 TL (KDV hariç)', 'demo.alici@tedport.com',
   true, true, 'haric', 'Ankara', '21 iş günü',
   '[{"id":1,"madde":"CE / TSE Belgesi","aciklama":"Tüm kalemlerin CE veya TSE sertifikalı olması zorunludur"},{"id":2,"madde":"Sevkiyat Belgesi","aciklama":"Her araç için irsaliye, fatura ve kalite belgesi gönderilmelidir"},{"id":3,"madde":"Sigorta","aciklama":"Taşıma sırasında nakliye sigortası zorunludur"}]'::jsonb),

  -- İhale 2: Soğuk zincir nakliye — lojistik sektörü (Keyifli Gıda açıyor)
  ('da000002-0000-4000-8000-000000000000',
   'demo-soguk-zincir-nakliye-2026',
   'Soğuk Zincir Nakliye ve Depolama Hizmetleri — 2026 Q3',
   'İzmir merkez depomuzdan İstanbul (Esenyurt) ve Ankara (Sincan) dağıtım noktalarına soğuk zincir nakliye hizmeti alınacaktır. Aylık ortalama 80 sefer, +2/+8°C araçlar.',
   'Açık İhale', 'Lojistik & Taşımacılık', 'İzmir / Bornova', 'TED-DEMO-2026-002',
   now() - interval '1 day', now() + interval '14 days', 'canli',
   '180.000 – 250.000 TL / ay', 'satin.alma@keyifli-demo.com',
   true, false, 'dahil', 'İzmir', '30 gün sözleşme başından itibaren',
   '[{"id":1,"madde":"ATP Sertifikası","aciklama":"Araçların geçerli ATP belgesi bulunmalıdır"},{"id":2,"madde":"Gıda Hijyen Sertifikası","aciklama":"Tüm sürücüler gıda hijyen eğitim belgesine sahip olmalı"},{"id":3,"madde":"Sigorta","aciklama":"Soğuk zincir kargo sigortası zorunludur"}]'::jsonb),

  -- İhale 3: CNC tezgah bakımı — makine sektörü (Kardemir açıyor, davetli)
  ('da000001-0000-4000-8000-000000000000',
   'demo-cnc-freze-yillik-bakim',
   'Endüstriyel CNC Freze Tezgahı — Yıllık Bakım ve Onarım Hizmeti',
   'Tuzla fabrikamızda kurulu 4 adet 5 eksenli CNC freze tezgahının yıllık periyodik bakımı ve acil arıza müdahale hizmeti satın alınacaktır. Yıllık kontrat esaslı.',
   'Davetli İhale', 'Makine & Teçhizat', 'İstanbul / Tuzla', 'TED-DEMO-2026-003',
   now() - interval '2 days', now() + interval '5 days', 'canli',
   '45.000 – 85.000 TL / yıl', 'demo.alici@tedport.com',
   true, false, 'haric', 'İstanbul', '12 ay (yıllık kontrat)',
   '[{"id":1,"madde":"Yetkili Servis Belgesi","aciklama":"CNC marka yetkili servis belgesi tercih edilir"},{"id":2,"madde":"7/24 Müdahale","aciklama":"Arıza bildiriminden itibaren 4 saat içinde saha müdahalesi garantisi"},{"id":3,"madde":"Yedek Parça Stoku","aciklama":"Sık değişen yedek parçalar için stok taahhüdü beklenmektedir"}]'::jsonb),

  -- İhale 4: Ambalaj tedariki — tamamlandı (Keyifli Gıda açmıştı)
  ('da000002-0000-4000-8000-000000000000',
   'demo-ambalaj-karton-koli-q2',
   'Plastik Ambalaj, Karton Koli ve Streç Film Tedariki — 2026 Q2',
   'Gıda üretim tesisimizin 2026 ikinci çeyrek dönemi için ambalaj malzemeleri tedariki gerçekleştirilmiştir. İhale tamamlanmış olup bu kayıt arşiv amaçlıdır.',
   'Açık İhale', 'Gıda & Tarım', 'İzmir / Bornova', 'TED-DEMO-2026-004',
   now() - interval '30 days', now() - interval '14 days', 'kapali',
   '320.000 – 400.000 TL', 'satin.alma@keyifli-demo.com',
   false, false, 'haric', 'İzmir', '30 iş günü', '[]'::jsonb),

  -- İhale 5: Kaynak gazı — Metalsan ALİCİ (tedarikçi firma kendi ihalesini açıyor)
  ('b0000001-0000-4000-8000-000000000000',
   'demo-metalsan-kaynak-gaz-temini',
   'Endüstriyel Kaynak Gazı Yıllık Tedariki — 2026',
   'Bursa Nilüfer fabrikamızda sürekli çalışan 12 kaynak hattı için yıllık kaynak gazı tedariki yapılacaktır. Saf argon, CO2 ve Ar/CO2 karışım tüpleri kapsama dahildir. 50 lt çelik tüp, aylık depo-takası esaslı sözleşme.',
   'Açık İhale', 'Makine & Teçhizat', 'Bursa / Nilüfer', 'TED-DEMO-2026-005',
   now() - interval '2 days', now() + interval '10 days', 'canli',
   '85.000 – 110.000 TL / yıl', 'teklif@metalsan-demo.com',
   true, false, 'haric', 'Bursa', '12 ay (depo-takası esaslı)',
   '[{"id":1,"madde":"TSE / CE Sertifikalı Tüp","aciklama":"Tüm gaz tüplerinin TSE veya CE belgeli olması zorunludur"},{"id":2,"madde":"Analiz Sertifikası","aciklama":"Her teslimatta gaz saflık analiz belgesi ibrazı gereklidir"},{"id":3,"madde":"Depo Takası","aciklama":"Kullanılmış tüpler alınırken dolu tüpler aynı anda teslim edilecektir"}]'::jsonb),

  -- İhale 6: KKD / İş Güvenliği — Metalsan ALİCİ
  ('b0000001-0000-4000-8000-000000000000',
   'demo-metalsan-kkd-is-guvenligi',
   'İş Güvenliği Ekipmanları ve KKD Yıllık Tedariki — 85 Personel',
   'Fabrikamızda çalışan 85 personel için yıllık kişisel koruyucu donanım (KKD) tedariki yapılacaktır. CE belgeli baret, çelik burunlu iş ayakkabısı, koruyucu gözlük, kaynak eldiveni, kulak tıkacı ve yanmaz önlük kapsama dahildir.',
   'Açık İhale', 'Makine & Teçhizat', 'Bursa / Nilüfer', 'TED-DEMO-2026-006',
   now() - interval '4 days', now() + interval '6 days', 'canli',
   '45.000 – 65.000 TL', 'teklif@metalsan-demo.com',
   true, false, 'haric', 'Bursa', '15 iş günü',
   '[{"id":1,"madde":"CE Belgesi","aciklama":"Tüm ürünlerin EN ISO uyumlu CE belgesi olmalı"},{"id":2,"madde":"Numune","aciklama":"Sipariş öncesi her üründen 2 adet numune gönderilmesi zorunludur"},{"id":3,"madde":"Kişiye Özgü Ambalaj","aciklama":"Ürünler bireysel paket ambalajda, kişi adı etiketli kitleme imkânıyla teslim edilmeli"}]'::jsonb),

  -- İhale 7: Araç filosu lastik — FastLog ALİCİ
  ('b0000002-0000-4000-8000-000000000000',
   'demo-fastlog-hgv-lastik-temini',
   'Ağır Vasıta Araç Filosu Yıllık Lastik Tedariki ve Montaj Hizmeti',
   'Pendik merkez garajımızdaki 24 araçlık çekici ve soğutuculu römork filosu için yıllık lastik tedariki ve montaj hizmeti alınacaktır. Çekici ön/arka aksları ve römork aksları dahil toplam yaklaşık 280 adet lastik.',
   'Açık İhale', 'Lojistik & Taşımacılık', 'İstanbul / Pendik', 'TED-DEMO-2026-007',
   now() - interval '1 day', now() + interval '9 days', 'canli',
   '380.000 – 480.000 TL', 'info@fastlog-demo.com',
   true, true, 'haric', 'İstanbul', '30 iş günü',
   '[{"id":1,"madde":"Onaylı Marka","aciklama":"Kabul edilen markalar: Michelin, Continental, Bridgestone, Goodyear"},{"id":2,"madde":"Montaj Dahil","aciklama":"Garajımızda ücretsiz montaj ve balans hizmeti teklif fiyatına dahil olmalı"},{"id":3,"madde":"Garanti","aciklama":"Minimum 1 yıl veya 100.000 km lastik garantisi şartı aranmaktadır"}]'::jsonb),

  -- İhale 8: Elektrik bakım — Kardemir ALİCİ
  ('da000001-0000-4000-8000-000000000000',
   'demo-kardemir-elektrik-tesis-bakim',
   'Tuzla Fabrikası Elektrik Tesis Bakım ve Onarım Hizmetleri — Yıllık Kontrat',
   'Tuzla fabrikamızdaki yüksek-gerilim trafo merkezi, motorlu panolar, PLC kabinleri ve aydınlatma tesisatlarının yıllık periyodik bakımı ile acil arıza müdahale hizmeti yıllık kontrat esasıyla alınacaktır.',
   'Davetli İhale', 'Makine & Teçhizat', 'İstanbul / Tuzla', 'TED-DEMO-2026-008',
   now() - interval '5 days', now() + interval '4 days', 'canli',
   '120.000 – 180.000 TL / yıl', 'demo.alici@tedport.com',
   true, false, 'haric', 'İstanbul', '12 ay (yıllık kontrat)',
   '[{"id":1,"madde":"Elektrik Yetki Belgesi","aciklama":"TEDAŞ veya yetkili kurum onaylı elektrik tesisat yetki belgesi zorunludur"},{"id":2,"madde":"4 Saat Müdahale","aciklama":"Acil arıza bildiriminden itibaren 4 saat içinde sahada bulunma garantisi"},{"id":3,"madde":"Sigortalı Çalışma","aciklama":"Tüm personel SGK ve işveren sorumluluk sigortası kapsamında çalışmalı"}]'::jsonb),

  -- İhale 9: Gıda katkı maddeleri — Keyifli Gıda ALİCİ
  ('da000002-0000-4000-8000-000000000000',
   'demo-keyifli-aroma-katkimadde',
   'Doğal Aroma ve Gıda Katkı Maddeleri Tedariki — 2026 Q3-Q4',
   'İzmir üretim tesisimizin 2026 üçüncü ve dördüncü çeyreği için doğal meyve aroma konsantreleri, sitrik asit, askorbik asit ve E-kod stabilizatörlerin tedariki gerçekleştirilecektir. Tüm hammaddeler gıda sınıfı sertifikalı olmalıdır.',
   'Açık İhale', 'Gıda & Tarım', 'İzmir / Bornova', 'TED-DEMO-2026-009',
   now(), now() + interval '12 days', 'canli',
   '90.000 – 140.000 TL', 'satin.alma@keyifli-demo.com',
   true, false, 'haric', 'İzmir', '20 iş günü',
   '[{"id":1,"madde":"Gıda Sertifikası","aciklama":"Tarım Bakanlığı onaylı veya AB gıda yönetmeliğine (EC 1334/2008) uygun belgeler zorunludur"},{"id":2,"madde":"CoA Belgesi","aciklama":"Her teslimatla birlikte analiz sertifikası (Certificate of Analysis) sunulmalı"},{"id":3,"madde":"HACCP / ISO 22000","aciklama":"Tedarikçinin geçerli HACCP veya ISO 22000 sertifikası bulunmalı"}]'::jsonb)

ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 7. TEKLİFLER  (ihale_teklifleri)
-- ════════════════════════════════════════════════════════════════

-- Her çalıştırmada demo tekliflerini sıfırla (idempotent)
DELETE FROM public.ihale_teklifleri
WHERE ihale_id IN (
  SELECT id FROM public.firma_ihaleleri WHERE slug LIKE 'demo-%'
);

-- ── İhale 1: Demir alımı — 6 teklif ───────────────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id,
  u.id, vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  -- Metalsan (demo.tedarikci) — en rekabetçi fiyat
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"HB400 Ø10mm Nervürlü Demir","miktar":100,"birim":"Ton","birim_fiyat":4850,"aciklama":"TSE belgeli"},{"madde":"HB400 Ø12mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4900},{"madde":"HB400 Ø16mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":5100}]',
   2_495_000::numeric, 18, 'Ankara deponuza teslim nakliye dahil.', 'Toplu alımlarda %2 ek indirim görüşmeye açığız.', 'gonderildi'),

  -- FastLog (ghost1) — orta fiyat
  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"HB400 Ø10mm Nervürlü Demir","miktar":100,"birim":"Ton","birim_fiyat":5100},{"madde":"HB400 Ø12mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":5150},{"madde":"HB400 Ø16mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":5280}]',
   2_612_000::numeric, 21, 'Stok durumuna göre 15 güne düşebilir.', null, 'gonderildi'),

  -- Ayşe Kaya bireysel — düşük fiyat
  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"HB400 Ø10mm Nervürlü Demir","miktar":100,"birim":"Ton","birim_fiyat":4750},{"madde":"HB400 Ø12mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4800},{"madde":"HB400 Ø16mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4950}]',
   2_440_000::numeric, 20, 'İstanbul çıkışlı. Ankara nakliye teklif fiyatına dahil.', 'TSE Q belgeli ürünler.', 'gonderildi'),

  -- Elif Arslan bireysel — yüksek fiyat
  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"HB400 Ø10mm Nervürlü Demir","miktar":100,"birim":"Ton","birim_fiyat":5200},{"madde":"HB400 Ø12mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":5250},{"madde":"HB400 Ø16mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":5400}]',
   2_660_000::numeric, 25, 'Erzurum deposundan gönderim.', null, 'gonderildi'),

  -- Murat Koç bireysel — en düşük fiyat
  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"HB400 Ø10mm Nervürlü Demir","miktar":100,"birim":"Ton","birim_fiyat":4680},{"madde":"HB400 Ø12mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4720},{"madde":"HB400 Ø16mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4900}]',
   2_400_000::numeric, 22, 'Nakliye fiyata dahil değil, ayrıca hesaplanacak.', 'Ödeme 30 gün vadeli.', 'gonderildi'),

  -- Metalsan ikinci teklif (revize) — en düşük revize
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş. (Revize)', 'Mehmet Demir',
   '[{"madde":"HB400 Ø10mm Nervürlü Demir","miktar":100,"birim":"Ton","birim_fiyat":4700},{"madde":"HB400 Ø12mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4750},{"madde":"HB400 Ø16mm Nervürlü Demir","miktar":200,"birim":"Ton","birim_fiyat":4950}]',
   2_415_000::numeric, 17, 'Revize teklifimizdir. Hızlı sevkiyat garantisi.', 'Fiyat 5 iş günü geçerlidir.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-hb400-insaat-demiri-500-ton';

-- ── İhale 2: Soğuk zincir nakliye — 5 teklif ──────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', true,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"İzmir–İstanbul Soğuk Zincir Sefer","miktar":50,"birim":"Sefer/ay","birim_fiyat":1980},{"madde":"İzmir–Ankara Soğuk Zincir Sefer","miktar":30,"birim":"Sefer/ay","birim_fiyat":2250}]',
   166_500::numeric, 5, 'ATP belgeli araç filosu. Akıllı sıcaklık takip sistemi dahil.', 'İlk 3 ay deneme kontratı öneriyoruz.', 'gonderildi'),

  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"İzmir–İstanbul Soğuk Zincir Sefer","miktar":50,"birim":"Sefer/ay","birim_fiyat":2100},{"madde":"İzmir–Ankara Soğuk Zincir Sefer","miktar":30,"birim":"Sefer/ay","birim_fiyat":2400}]',
   177_000::numeric, 7, 'Alt taşeron araçlarla hizmet sağlanacaktır.', null, 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"İzmir–İstanbul Soğuk Zincir Sefer","miktar":50,"birim":"Sefer/ay","birim_fiyat":1850},{"madde":"İzmir–Ankara Soğuk Zincir Sefer","miktar":30,"birim":"Sefer/ay","birim_fiyat":2150}]',
   157_000::numeric, 4, 'Kendi araçlarımla hizmet vereceğim.', 'Sadece hafta içi operasyon.', 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"İzmir–İstanbul Soğuk Zincir Sefer","miktar":50,"birim":"Sefer/ay","birim_fiyat":2200},{"madde":"İzmir–Ankara Soğuk Zincir Sefer","miktar":30,"birim":"Sefer/ay","birim_fiyat":2500}]',
   185_000::numeric, 10, 'Geniş araç filosu, esnek kapasite.', null, 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"İzmir–İstanbul Soğuk Zincir Sefer","miktar":50,"birim":"Sefer/ay","birim_fiyat":1750},{"madde":"İzmir–Ankara Soğuk Zincir Sefer","miktar":30,"birim":"Sefer/ay","birim_fiyat":2050}]',
   150_000::numeric, 6, 'Fiyat rekabetçidir. Referans verilebilir.', 'İlk ay %5 indirim uygulanacak.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-soguk-zincir-nakliye-2026';

-- ── İhale 3: CNC bakım — 5 teklif ─────────────────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"Yıllık Periyodik Bakım (4 tezgah)","miktar":1,"birim":"Paket/yıl","birim_fiyat":48000},{"madde":"Acil Arıza Müdahalesi (7/24)","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":18000}]',
   66_000::numeric, 3, 'Tüm bakımlar fabrika sahanızda gerçekleştirilir.', 'CNC üretici yetkili servis ortağıyız.', 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"Yıllık Periyodik Bakım (4 tezgah)","miktar":1,"birim":"Paket/yıl","birim_fiyat":42000},{"madde":"Acil Arıza Müdahalesi (7/24)","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":14000}]',
   56_000::numeric, 5, 'Bağımsız uzman teknisyen.', '15 yıl sektör deneyimi.', 'gonderildi'),

  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"Yıllık Periyodik Bakım (4 tezgah)","miktar":1,"birim":"Paket/yıl","birim_fiyat":55000},{"madde":"Acil Arıza Müdahalesi (7/24)","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":20000}]',
   75_000::numeric, 4, 'Ekipmanlarımız dahil bakım hizmetimizi sunuyoruz.', null, 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"Yıllık Periyodik Bakım (4 tezgah)","miktar":1,"birim":"Paket/yıl","birim_fiyat":39000},{"madde":"Acil Arıza Müdahalesi (7/24)","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":12000}]',
   51_000::numeric, 7, 'Uzaktan destek + saha müdahalesi kombinasyonu.', null, 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"Yıllık Periyodik Bakım (4 tezgah)","miktar":1,"birim":"Paket/yıl","birim_fiyat":44000},{"madde":"Acil Arıza Müdahalesi (7/24)","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":16000}]',
   60_000::numeric, 6, 'Referanslarımız mevcuttur.', 'Ödeme: %30 ön, %70 teslim.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-cnc-freze-yillik-bakim';

-- ── İhale 4: Ambalaj tedariki — tamamlandı, 4 teklif (2 kabul, 2 red) ──
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"Karton Koli 30x20x15cm","miktar":50000,"birim":"Adet","birim_fiyat":4.8},{"madde":"Streç Film 500mm","miktar":800,"birim":"Rulo","birim_fiyat":85}]',
   308_000::numeric, 12, 'İzmir deponuza teslim.', null, 'kabul'),

  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"Karton Koli 30x20x15cm","miktar":50000,"birim":"Adet","birim_fiyat":5.1},{"madde":"Streç Film 500mm","miktar":800,"birim":"Rulo","birim_fiyat":88}]',
   325_400::numeric, 10, 'Nakliye dahil.', null, 'kabul'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"Karton Koli 30x20x15cm","miktar":50000,"birim":"Adet","birim_fiyat":5.4},{"madde":"Streç Film 500mm","miktar":800,"birim":"Rulo","birim_fiyat":92}]',
   344_600::numeric, 15, 'Stok mevcutsa 10 güne ineriz.', null, 'red'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"Karton Koli 30x20x15cm","miktar":50000,"birim":"Adet","birim_fiyat":5.6},{"madde":"Streç Film 500mm","miktar":800,"birim":"Rulo","birim_fiyat":95}]',
   356_000::numeric, 20, null, 'Fiyat 10 iş günü geçerlidir.', 'red')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-ambalaj-karton-koli-q2';

-- ── İhale 5: Kaynak gazı — 5 teklif ──────────────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"Saf Argon Gazı %99.99 — 50L Tüp","miktar":30,"birim":"Tüp/ay","birim_fiyat":145},{"madde":"CO2 Gazı %99.9 — 50L Tüp","miktar":20,"birim":"Tüp/ay","birim_fiyat":110},{"madde":"Ar/CO2 %80/20 Karışım — 50L Tüp","miktar":25,"birim":"Tüp/ay","birim_fiyat":135},{"madde":"Tüp Kira Bedeli (depo-takası)","miktar":75,"birim":"Tüp","birim_fiyat":0,"aciklama":"Depo takası — kira yok"}]',
   97_800::numeric, 3, 'Bursa deponuza aylık düzenli teslim. TSE belgeli tüpler.', 'İlk 3 ay ücretsiz tüp depositi.', 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"Saf Argon Gazı %99.99 — 50L Tüp","miktar":30,"birim":"Tüp/ay","birim_fiyat":138},{"madde":"CO2 Gazı %99.9 — 50L Tüp","miktar":20,"birim":"Tüp/ay","birim_fiyat":105},{"madde":"Ar/CO2 %80/20 Karışım — 50L Tüp","miktar":25,"birim":"Tüp/ay","birim_fiyat":128}]',
   92_900::numeric, 2, 'Bursa''ya haftada 2 sefer teslimat imkânı var.', 'Analiz sertifikası her teslimatta sunulur.', 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"Saf Argon Gazı %99.99 — 50L Tüp","miktar":30,"birim":"Tüp/ay","birim_fiyat":155},{"madde":"CO2 Gazı %99.9 — 50L Tüp","miktar":20,"birim":"Tüp/ay","birim_fiyat":118},{"madde":"Ar/CO2 %80/20 Karışım — 50L Tüp","miktar":25,"birim":"Tüp/ay","birim_fiyat":145}]',
   105_350::numeric, 5, 'Erzurum depo stoğumuzdan gönderim.', null, 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"Saf Argon Gazı %99.99 — 50L Tüp","miktar":30,"birim":"Tüp/ay","birim_fiyat":130},{"madde":"CO2 Gazı %99.9 — 50L Tüp","miktar":20,"birim":"Tüp/ay","birim_fiyat":98},{"madde":"Ar/CO2 %80/20 Karışım — 50L Tüp","miktar":25,"birim":"Tüp/ay","birim_fiyat":120},{"madde":"Yıllık Sabit Fiyat Garantisi","miktar":12,"birim":"Ay","birim_fiyat":0,"aciklama":"Fiyat değişikliği yok — sözleşme boyunca sabit"}]',
   87_100::numeric, 2, 'En rekabetçi fiyat. 12 ay sabit fiyat taahhüdü.', 'Sözleşme imzalanırsa ilk ay %5 indirim.', 'gonderildi'),

  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"Saf Argon Gazı %99.99 — 50L Tüp","miktar":30,"birim":"Tüp/ay","birim_fiyat":142},{"madde":"CO2 Gazı %99.9 — 50L Tüp","miktar":20,"birim":"Tüp/ay","birim_fiyat":108},{"madde":"Ar/CO2 %80/20 Karışım — 50L Tüp","miktar":25,"birim":"Tüp/ay","birim_fiyat":132}]',
   95_340::numeric, 3, 'Kendi fabrikamız için de tedarik ettiğimiz marka — Linde yetkili bayi.', 'TÜRKAK akrediteli analiz sertifikası standardımız.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-metalsan-kaynak-gaz-temini';

-- ── İhale 6: KKD / İş Güvenliği — 5 teklif ─────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"ABS Baret (EN 397)","miktar":85,"birim":"Adet","birim_fiyat":85},{"madde":"Çelik Burunlu İş Ayakkabısı S3 (EN ISO 20345)","miktar":85,"birim":"Çift","birim_fiyat":320},{"madde":"Koruyucu Gözlük (EN 166)","miktar":85,"birim":"Adet","birim_fiyat":45},{"madde":"Kaynak Eldiveni (EN 12477)","miktar":170,"birim":"Çift","birim_fiyat":38},{"madde":"Kulak Tıkacı SNR 37dB (100''lük pk)","miktar":6,"birim":"Paket","birim_fiyat":220},{"madde":"Yanmaz Koruyucu Önlük EN ISO 11612","miktar":85,"birim":"Adet","birim_fiyat":185}]',
   57_775::numeric, 10, 'Tüm ürünler CE belgeli. Bursa''ya nakliye dahil.', 'Kişiye özgü etiketli kit kutusu sunabiliriz.', 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"ABS Baret (EN 397)","miktar":85,"birim":"Adet","birim_fiyat":78},{"madde":"Çelik Burunlu İş Ayakkabısı S3","miktar":85,"birim":"Çift","birim_fiyat":295},{"madde":"Koruyucu Gözlük","miktar":85,"birim":"Adet","birim_fiyat":40},{"madde":"Kaynak Eldiveni","miktar":170,"birim":"Çift","birim_fiyat":34},{"madde":"Kulak Tıkacı SNR 37dB","miktar":6,"birim":"Paket","birim_fiyat":195},{"madde":"Yanmaz Koruyucu Önlük","miktar":85,"birim":"Adet","birim_fiyat":170}]',
   53_045::numeric, 12, 'Stok mevcutsa 8 güne ineriz.', 'Her ürüne numune gönderilebilir.', 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"ABS Baret (EN 397)","miktar":85,"birim":"Adet","birim_fiyat":92},{"madde":"Çelik Burunlu İş Ayakkabısı S3","miktar":85,"birim":"Çift","birim_fiyat":335},{"madde":"Koruyucu Gözlük","miktar":85,"birim":"Adet","birim_fiyat":52},{"madde":"Kaynak Eldiveni","miktar":170,"birim":"Çift","birim_fiyat":42},{"madde":"Kulak Tıkacı SNR 37dB","miktar":6,"birim":"Paket","birim_fiyat":240},{"madde":"Yanmaz Koruyucu Önlük","miktar":85,"birim":"Adet","birim_fiyat":198}]',
   63_550::numeric, 15, 'Büyük firmalardan referansımız mevcuttur.', null, 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"ABS Baret (EN 397)","miktar":85,"birim":"Adet","birim_fiyat":72},{"madde":"Çelik Burunlu İş Ayakkabısı S3","miktar":85,"birim":"Çift","birim_fiyat":280},{"madde":"Koruyucu Gözlük","miktar":85,"birim":"Adet","birim_fiyat":38},{"madde":"Kaynak Eldiveni","miktar":170,"birim":"Çift","birim_fiyat":30},{"madde":"Kulak Tıkacı SNR 37dB","miktar":6,"birim":"Paket","birim_fiyat":180},{"madde":"Yanmaz Koruyucu Önlük","miktar":85,"birim":"Adet","birim_fiyat":155}]',
   49_450::numeric, 8, 'En uygun fiyat garantisi.', 'Toplu siparişe özel %3 ek indirim görüşmeye açık.', 'gonderildi'),

  ('demo.alici@tedport.com', 'da000001-0000-4000-8000-000000000000', 'Kardemir Çelik A.Ş.', 'Hasan Çelik',
   '[{"madde":"ABS Baret (EN 397)","miktar":85,"birim":"Adet","birim_fiyat":82},{"madde":"Çelik Burunlu İş Ayakkabısı S3","miktar":85,"birim":"Çift","birim_fiyat":310},{"madde":"Koruyucu Gözlük","miktar":85,"birim":"Adet","birim_fiyat":44},{"madde":"Kaynak Eldiveni","miktar":170,"birim":"Çift","birim_fiyat":36},{"madde":"Kulak Tıkacı SNR 37dB","miktar":6,"birim":"Paket","birim_fiyat":210},{"madde":"Yanmaz Koruyucu Önlük","miktar":85,"birim":"Adet","birim_fiyat":178}]',
   55_540::numeric, 10, 'Kendi fabrikamızda da kullandığımız tedarikçiden ürünler.', 'CE belgelerini toplu sunabiliriz.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-metalsan-kkd-is-guvenligi';

-- ── İhale 7: Ağır vasıta lastik — 5 teklif ─────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"Michelin X Multi Energy 315/70R22.5 — Çekici Ön","miktar":48,"birim":"Adet","birim_fiyat":3850},{"madde":"Michelin X Multi T 385/65R22.5 — Çekici Arka","miktar":96,"birim":"Adet","birim_fiyat":3650},{"madde":"Michelin X Multi Z 285/70R19.5 — Römork","miktar":96,"birim":"Adet","birim_fiyat":3200},{"madde":"Montaj ve Balans Hizmeti","miktar":240,"birim":"Adet","birim_fiyat":0,"aciklama":"Ücretsiz dahil"}]',
   904_800::numeric, 20, 'Pendik garajınızda montaj yapabiliriz. Michelin yetkili bayi.', 'Yıllık kontrat için ek indirim görüşelim.', 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"Continental HSR2 315/70R22.5 — Çekici Ön","miktar":48,"birim":"Adet","birim_fiyat":3620},{"madde":"Continental HTR2 385/65R22.5 — Çekici Arka","miktar":96,"birim":"Adet","birim_fiyat":3430},{"madde":"Continental HTR2 285/70R19.5 — Römork","miktar":96,"birim":"Adet","birim_fiyat":3010},{"madde":"Montaj ve Balans","miktar":240,"birim":"Adet","birim_fiyat":85}]',
   876_960::numeric, 25, 'Continental yetkili servis. Garanti dahil fiyat.', 'Continental servis aağı 7/24 destek.', 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"Bridgestone R249 315/70R22.5 — Çekici Ön","miktar":48,"birim":"Adet","birim_fiyat":4100},{"madde":"Bridgestone M749 385/65R22.5 — Çekici Arka","miktar":96,"birim":"Adet","birim_fiyat":3900},{"madde":"Bridgestone R168 285/70R19.5 — Römork","miktar":96,"birim":"Adet","birim_fiyat":3400},{"madde":"Montaj ve Balans","miktar":240,"birim":"Adet","birim_fiyat":0,"aciklama":"Ücretsiz dahil"}]',
   967_200::numeric, 18, 'Bridgestone birinci sınıf lastik. Uzun ömür garantisi.', null, 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"Goodyear Fuelmax S 315/70R22.5 — Çekici Ön","miktar":48,"birim":"Adet","birim_fiyat":3380},{"madde":"Goodyear Fuelmax D 385/65R22.5 — Çekici Arka","miktar":96,"birim":"Adet","birim_fiyat":3200},{"madde":"Goodyear Fuelmax T 285/70R19.5 — Römork","miktar":96,"birim":"Adet","birim_fiyat":2850},{"madde":"Montaj ve Balans","miktar":240,"birim":"Adet","birim_fiyat":75}]',
   828_480::numeric, 22, 'En uygun fiyatlı teklif. Goodyear yetkili bayi.', 'Yakıt tasarrufu odaklı Fuelmax serisi.', 'gonderildi'),

  ('demo.alici@tedport.com', 'da000001-0000-4000-8000-000000000000', 'Kardemir Çelik A.Ş.', 'Hasan Çelik',
   '[{"madde":"Michelin X Line Energy D 315/70R22.5 — Çekici Ön","miktar":48,"birim":"Adet","birim_fiyat":3720},{"madde":"Michelin X Line Energy T 385/65R22.5 — Çekici Arka","miktar":96,"birim":"Adet","birim_fiyat":3520},{"madde":"Michelin X Line D 285/70R19.5 — Römork","miktar":96,"birim":"Adet","birim_fiyat":3100},{"madde":"Montaj ve Balans","miktar":240,"birim":"Adet","birim_fiyat":0,"aciklama":"Ücretsiz dahil"}]',
   872_160::numeric, 21, 'Kendi filomuzda kullandığımız marka. Hem alıcı hem tedarikçi olarak deneyimliyiz.', '2 yıl lastik garanti kapsamı sunuyoruz.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-fastlog-hgv-lastik-temini';

-- ── İhale 8: Elektrik tesis bakımı — 4 teklif ───────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"Trafo Merkezi Yıllık Periyodik Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":45000},{"madde":"Motorlu Pano ve PLC Kabini Bakımı (32 adet)","miktar":1,"birim":"Paket/yıl","birim_fiyat":38000},{"madde":"Aydınlatma Tesisatı Revizyon ve Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":22000},{"madde":"Acil Arıza Müdahale Hizmeti 7/24","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":28000}]',
   133_000::numeric, 5, 'Tüm personel elektrik yetki belgeli. TEDAŞ anlaşmalı firmayız.', '4 saat müdahale garantisi sözleşmede yer alacak.', 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"Trafo Merkezi Yıllık Periyodik Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":38000},{"madde":"Motorlu Pano ve PLC Kabini Bakımı","miktar":1,"birim":"Paket/yıl","birim_fiyat":32000},{"madde":"Aydınlatma Tesisatı Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":18000},{"madde":"Acil Arıza Müdahale 7/24","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":22000}]',
   110_000::numeric, 7, 'Bağımsız elektrik mühendisi. 20 yıl sektör deneyimi.', 'Uygun fiyatla kalite standartlarını koruyoruz.', 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"Trafo Merkezi Yıllık Periyodik Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":52000},{"madde":"Motorlu Pano ve PLC Kabini Bakımı","miktar":1,"birim":"Paket/yıl","birim_fiyat":44000},{"madde":"Aydınlatma Tesisatı Revizyon","miktar":1,"birim":"Paket/yıl","birim_fiyat":25000},{"madde":"Acil Arıza Müdahale 7/24","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":32000}]',
   153_000::numeric, 4, 'Büyük sanayi tesisleri referansımız mevcuttur.', 'Sigortalı çalışma ve 2 yıl garanti.', 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"Trafo Merkezi Yıllık Periyodik Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":36000},{"madde":"Motorlu Pano ve PLC Kabini Bakımı","miktar":1,"birim":"Paket/yıl","birim_fiyat":29000},{"madde":"Aydınlatma Tesisatı Bakım","miktar":1,"birim":"Paket/yıl","birim_fiyat":16000},{"madde":"Acil Arıza Müdahale 7/24","miktar":1,"birim":"Hizmet/yıl","birim_fiyat":20000}]',
   101_000::numeric, 8, 'En rekabetçi fiyat. İstanbul sahası.', 'Referanslarımızı talep üzerine paylaşıyoruz.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-kardemir-elektrik-tesis-bakim';

-- ── İhale 9: Gıda katkı maddeleri — 5 teklif ────────────────
INSERT INTO public.ihale_teklifleri (
  ihale_id, firma_id, user_id,
  gonderen_firma_id, gonderen_firma_adi,
  gonderen_ad_soyad, gonderen_email,
  kalemler, toplam_tutar, para_birimi, kdv_dahil,
  teslim_suresi_gun, teslim_aciklamasi, not_field, durum
)
SELECT
  fi.id, fi.firma_id, u.id,
  vals.gonderen_firma_id, vals.gonderen_firma_adi,
  vals.ad_soyad, vals.email,
  vals.kalemler::jsonb, vals.tutar, 'TRY', false,
  vals.teslim_gun, vals.teslim_aciklama, vals.not_metni, vals.durum
FROM public.firma_ihaleleri fi
CROSS JOIN (VALUES
  ('demo.tedarikci@tedport.com', 'b0000001-0000-4000-8000-000000000000', 'Metalsan Makine San. A.Ş.', 'Mehmet Demir',
   '[{"madde":"Doğal Çilek Aroma Konsantresi (25 kg bidon)","miktar":40,"birim":"Bidon","birim_fiyat":680},{"madde":"Doğal Elma Aroma Konsantresi (25 kg bidon)","miktar":30,"birim":"Bidon","birim_fiyat":620},{"madde":"Sitrik Asit Monohidrat Gıda Sınıfı (25 kg çuval)","miktar":80,"birim":"Çuval","birim_fiyat":185},{"madde":"Askorbik Asit E300 (25 kg çuval)","miktar":20,"birim":"Çuval","birim_fiyat":420},{"madde":"Xanthan Gum E415 (25 kg çuval)","miktar":15,"birim":"Çuval","birim_fiyat":1100}]',
   97_300::numeric, 15, 'İzmir tesisine teslim. Halal ve HACCP belgeli tedarikçiden.', 'CoA belgesi her kalem için sunulacak.', 'gonderildi'),

  ('demo.bireysel@tedport.com', null, null, 'Ayşe Kaya',
   '[{"madde":"Doğal Çilek Aroma Konsantresi (25 kg bidon)","miktar":40,"birim":"Bidon","birim_fiyat":645},{"madde":"Doğal Elma Aroma Konsantresi (25 kg bidon)","miktar":30,"birim":"Bidon","birim_fiyat":590},{"madde":"Sitrik Asit Monohidrat Gıda Sınıfı (25 kg çuval)","miktar":80,"birim":"Çuval","birim_fiyat":172},{"madde":"Askorbik Asit E300 (25 kg çuval)","miktar":20,"birim":"Çuval","birim_fiyat":395},{"madde":"Xanthan Gum E415 (25 kg çuval)","miktar":15,"birim":"Çuval","birim_fiyat":1045}]',
   92_210::numeric, 18, 'Alınan bilgiler dahilinde en uygun fiyat.', 'AB menşeili hammadde. Analiz belgeleri hazır.', 'gonderildi'),

  ('demo.ghost1@tedport.com', 'b0000002-0000-4000-8000-000000000000', 'FastLog Lojistik A.Ş.', 'Selim Yılmaz',
   '[{"madde":"Doğal Çilek Aroma Konsantresi (25 kg bidon)","miktar":40,"birim":"Bidon","birim_fiyat":720},{"madde":"Doğal Elma Aroma Konsantresi (25 kg bidon)","miktar":30,"birim":"Bidon","birim_fiyat":660},{"madde":"Sitrik Asit Monohidrat Gıda Sınıfı (25 kg çuval)","miktar":80,"birim":"Çuval","birim_fiyat":195},{"madde":"Askorbik Asit E300 (25 kg çuval)","miktar":20,"birim":"Çuval","birim_fiyat":440},{"madde":"Xanthan Gum E415 (25 kg çuval)","miktar":15,"birim":"Çuval","birim_fiyat":1180}]',
   103_900::numeric, 12, 'ISO 22000 sertifikamız var. Gıda lojistiği ve hammadde tedariki.', 'Numune göndermemizi ister misiniz?', 'gonderildi'),

  ('demo.ghost2@tedport.com', null, null, 'Elif Arslan',
   '[{"madde":"Doğal Çilek Aroma Konsantresi (25 kg bidon)","miktar":40,"birim":"Bidon","birim_fiyat":695},{"madde":"Doğal Elma Aroma Konsantresi (25 kg bidon)","miktar":30,"birim":"Bidon","birim_fiyat":635},{"madde":"Sitrik Asit Monohidrat Gıda Sınıfı (25 kg çuval)","miktar":80,"birim":"Çuval","birim_fiyat":178},{"madde":"Askorbik Asit E300 (25 kg çuval)","miktar":20,"birim":"Çuval","birim_fiyat":410},{"madde":"Xanthan Gum E415 (25 kg çuval)","miktar":15,"birim":"Çuval","birim_fiyat":1120}]',
   99_380::numeric, 20, 'Tarım Bakanlığı ruhsatlı tedarikçi firmadan temin.', null, 'gonderildi'),

  ('demo.ghost3@tedport.com', null, null, 'Murat Koç',
   '[{"madde":"Doğal Çilek Aroma Konsantresi (25 kg bidon)","miktar":40,"birim":"Bidon","birim_fiyat":610},{"madde":"Doğal Elma Aroma Konsantresi (25 kg bidon)","miktar":30,"birim":"Bidon","birim_fiyat":575},{"madde":"Sitrik Asit Monohidrat Gıda Sınıfı (25 kg çuval)","miktar":80,"birim":"Çuval","birim_fiyat":162},{"madde":"Askorbik Asit E300 (25 kg çuval)","miktar":20,"birim":"Çuval","birim_fiyat":378},{"madde":"Xanthan Gum E415 (25 kg çuval)","miktar":15,"birim":"Çuval","birim_fiyat":990}]',
   87_050::numeric, 22, 'En düşük fiyat teklifi. Stok mevcuttur.', 'Fiyat 10 iş günü geçerlidir.', 'gonderildi')

) AS vals(email, gonderen_firma_id, gonderen_firma_adi, ad_soyad, kalemler, tutar, teslim_gun, teslim_aciklama, not_metni, durum)
JOIN auth.users u ON u.email = vals.email
WHERE fi.slug = 'demo-keyifli-aroma-katkimadde';

-- ════════════════════════════════════════════════════════════════
-- 8. TEKLİF TALEPLERİ + MESAJLAR  (teklif_talepleri + teklif_mesajlari)
--    11 adet talep — kalem listeli mesajlar, çeşitli durumlar
--    Ayşe (bireysel): 4 talep
--    Hasan / Kardemir: 2 talep (kurumsal→kurumsal giden)
--    Mehmet / Metalsan: 2 talep (kurumsal→kurumsal giden)
--    Selim / FastLog: 2 talep (kurumsal→kurumsal giden)
--    Murat (ghost3): 1 talep
-- ════════════════════════════════════════════════════════════════

-- Idempotent: Demo kullanıcıların taleplerini sıfırla
DELETE FROM public.teklif_talepleri
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'demo.%@tedport.com'
);

DO $tt_demo$
DECLARE
  tt1  bigint;
  tt2  bigint;
  tt3  bigint;
  tt4  bigint;
  tt5  bigint;
  tt6  bigint;
  tt7  bigint;
  tt8  bigint;
  tt9  bigint;
  tt10 bigint;
  tt11 bigint;
BEGIN

  -- ── 1: Ayşe → Metalsan | replied — kalibrasyon hizmeti ──────
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'b0000001-0000-4000-8000-000000000000',
    'de000003-0000-4000-8000-000000000000'::uuid, null,
    'Ayşe Kaya', 'demo.bireysel@tedport.com', '+90 532 555 03 03', null,
    'Hassas Terazi ve Ölçüm Ekipmanı Kalibrasyon Hizmeti',
    'Fabrikamızdaki ölçüm ekipmanları için yıllık TÜRKAK akrediteli kalibrasyon hizmeti almak istiyoruz. Toplam 19 ekipman. Her ekipman için kalibrasyon sertifikası ibrazı zorunludur. Ankara sahaya gelinmesini tercih ediyoruz.',
    '[{"id":"1","adet":4,"birim":"Adet","madde":"Hassas Terazi 0–5 kg (±0,01 g)","aciklama":"TÜRKAK akrediteli sertifika zorunlu"},{"id":"2","adet":2,"birim":"Adet","madde":"Platform Terazi 0–500 kg (±50 g)","aciklama":"TÜRKAK akrediteli sertifika zorunlu"},{"id":"3","adet":6,"birim":"Adet","madde":"Dijital Kumpas 150 mm","aciklama":""},{"id":"4","adet":4,"birim":"Set","madde":"Mikrometre Seti 0–25 mm","aciklama":""},{"id":"5","adet":3,"birim":"Adet","madde":"Termometre ve Nem Sensörü","aciklama":""}]'::jsonb,
    '2026-07-01', 'Ankara',
    'replied', now() - interval '5 days', now() - interval '2 days'
  ) RETURNING id INTO tt1;

  INSERT INTO public.teklif_mesajlari (teklif_id, sender_id, sender_role, mesaj, created_at)
  VALUES
    (tt1, 'de000003-0000-4000-8000-000000000000'::uuid, 'user',
     'Sertifikalar TÜRKAK akrediteli mi oluyor? Ekipmanları size götürmemiz mi gerekiyor, sahaya mı geliyorsunuz?',
     now() - interval '4 days'),
    (tt1, 'de000002-0000-4000-8000-000000000000'::uuid, 'company',
     'Evet, TÜRKAK akreditasyonuyla çalışıyoruz. Saha kalibrasyonu yapıyoruz — Ankara için 3-4 iş günü planlıyoruz. 19 ekipman için birim fiyatlı teklifimizi e-posta ile ilettik, incelemenizi bekliyoruz.',
     now() - interval '3 days');

  -- ── 2: Ayşe → FastLog | read — soğuk zincir nakliye ─────────
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'b0000002-0000-4000-8000-000000000000',
    'de000003-0000-4000-8000-000000000000'::uuid, null,
    'Ayşe Kaya', 'demo.bireysel@tedport.com', '+90 532 555 03 03', null,
    'İstanbul–Ankara Düzenli Soğuk Zincir Nakliye Fiyat Talebi',
    'Aylık düzenli İstanbul–Ankara güzergahı için soğuk zincir nakliye fiyatı almak istiyorum. Sıcaklık aralığı: +2/+8°C zorunlu. Araç tipi: soğutuculu panelvan veya kamyon, min. 5 ton. Gece çıkışı, sabah teslimat tercih edilir.',
    '[{"id":"1","adet":6,"birim":"Sefer/ay","madde":"İstanbul (Ataşehir) → Ankara (Çankaya)","aciklama":"+2/+8°C, soğutuculu araç min. 5 ton"},{"id":"2","adet":4,"birim":"Sefer/ay","madde":"İstanbul (Ataşehir) → Ankara (Sincan)","aciklama":"+2/+8°C, soğutuculu araç min. 5 ton"}]'::jsonb,
    '2026-06-15', 'Ankara',
    'read', now() - interval '3 days', now() - interval '3 days'
  ) RETURNING id INTO tt2;

  -- ── 3: Ayşe → Kardemir | rejected — çelik profil ────────────
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'da000001-0000-4000-8000-000000000000',
    'de000003-0000-4000-8000-000000000000'::uuid, null,
    'Ayşe Kaya', 'demo.bireysel@tedport.com', '+90 532 555 03 03', null,
    'Yapısal Çelik Profil ve Boru Temini — İnşaat Projesi',
    'İstanbul''daki endüstriyel depo inşaatı projem için çelik malzeme teminine ihtiyaç duyuyorum. Her kalem için birim fiyat ve teslim süresi bekliyorum. Teslim: İstanbul Avcılar. Toplam yaklaşık 51 ton.',
    '[{"id":"1","adet":20,"birim":"Ton","madde":"HEA 200 Çelik Profil S235JR","aciklama":""},{"id":"2","adet":15,"birim":"Ton","madde":"HEB 160 Çelik Profil S235JR","aciklama":""},{"id":"3","adet":8,"birim":"Ton","madde":"Dikdörtgen Çelik Boru 100×60×4mm","aciklama":""},{"id":"4","adet":5,"birim":"Ton","madde":"Kare Çelik Boru 80×80×4mm","aciklama":""},{"id":"5","adet":3,"birim":"Ton","madde":"S235JR Çelik Sac 8mm","aciklama":""}]'::jsonb,
    '2026-08-01', 'İstanbul',
    'rejected', now() - interval '10 days', now() - interval '8 days'
  ) RETURNING id INTO tt3;

  -- ── 4: Ayşe → Metalsan | pending — CNC yedek parça ──────────
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'b0000001-0000-4000-8000-000000000000',
    'de000003-0000-4000-8000-000000000000'::uuid, null,
    'Ayşe Kaya', 'demo.bireysel@tedport.com', '+90 532 555 03 03', null,
    'CNC Freze Tezgahı Yedek Parça Temini',
    'Atölyemizdeki 3 eksenli CNC freze tezgahı (Fanuc 0i-MF kontrol) için yedek parça teminine ihtiyaç var. Aciliyet var — 1 hafta içinde teslim öncelikli.',
    '[{"id":"1","adet":4,"birim":"Adet","madde":"SKF 6208-2Z Rulman (veya muadil)","aciklama":""},{"id":"2","adet":1,"birim":"Adet","madde":"Fanuc 0i-MF Uyumlu Kontrol Kartı","aciklama":""},{"id":"3","adet":2,"birim":"Set","madde":"Soğutma Sistemi Pompa Conta Kiti","aciklama":"Tüm boyut kiti"},{"id":"4","adet":6,"birim":"Adet","madde":"ISO 30 Konik Kesici Takım Tutucu ER32","aciklama":""},{"id":"5","adet":1,"birim":"Adet","madde":"Lineer Kızak Yağlama Ünitesi 24V","aciklama":""},{"id":"6","adet":3,"birim":"Adet","madde":"E-stop Mantar Buton NO/NC","aciklama":"Siemens uyumlu"}]'::jsonb,
    '2026-06-10', 'Ankara',
    'pending', now() - interval '1 day', now() - interval '1 day'
  ) RETURNING id INTO tt4;

  -- ── 5: Hasan / Kardemir → Metalsan | replied — CNC bakım ────
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'b0000001-0000-4000-8000-000000000000',
    'de000001-0000-4000-8000-000000000000'::uuid,
    'da000001-0000-4000-8000-000000000000',
    'Hasan Çelik', 'demo.alici@tedport.com', '+90 312 555 01 01', 'Kardemir Çelik A.Ş.',
    'Tuzla Fabrikası CNC Tezgah Yıllık Bakım Hizmet Talebi',
    'Tuzla fabrikamızdaki CNC park için yıllık bakım hizmet teklifinizi almak istiyoruz. Her ekipman için yılda 2 periyodik bakım, 7/24 acil arıza müdahalesi (maks. 4 saat) ve yedek parça stok taahhüdü beklenmektedir. Teklifinizde parça/işçilik ayrımı yer alsın lütfen.',
    '[{"id":"1","adet":4,"birim":"Adet","madde":"5 Eksenli Freze Tezgahı Yıllık Bakım","aciklama":"Fanuc 30i kontrol, yılda 2 periyodik bakım"},{"id":"2","adet":2,"birim":"Adet","madde":"CNC Torna Yıllık Bakım","aciklama":"Siemens 840D kontrol, yılda 2 periyodik bakım"},{"id":"3","adet":1,"birim":"Adet","madde":"İşleme Merkezi Yıllık Bakım","aciklama":"Heidenhain iTNC 530, yılda 2 periyodik bakım"}]'::jsonb,
    '2026-06-30', 'İstanbul / Tuzla',
    'replied', now() - interval '7 days', now() - interval '4 days'
  ) RETURNING id INTO tt5;

  INSERT INTO public.teklif_mesajlari (teklif_id, sender_id, sender_role, mesaj, created_at)
  VALUES
    (tt5, 'de000001-0000-4000-8000-000000000000'::uuid, 'user',
     'Fanuclara ve Siemens 840D''ye ayrı servis ekipleriniz var mı? Her marka için ayrı mı fiyatlandırıyorsunuz?',
     now() - interval '6 days'),
    (tt5, 'de000002-0000-4000-8000-000000000000'::uuid, 'company',
     'Evet, Fanuc, Siemens ve Heidenhain için ayrı sertifikalı teknisyenlerimiz mevcut. Fiyatlandırmayı marka bazlı değil, tezgah başı yapıyoruz. Teklifimizi kalem kalem ekipman dökümlü olarak e-posta ile gönderdik.',
     now() - interval '5 days'),
    (tt5, 'de000001-0000-4000-8000-000000000000'::uuid, 'user',
     'Teşekkürler. Heidenhain için yerli stok durumunuz nasıl? Bu konuda endişemiz var.',
     now() - interval '4 days');

  -- ── 6: Hasan / Kardemir → FastLog | awaiting_reply — fabrika lojistik ──
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'b0000002-0000-4000-8000-000000000000',
    'de000001-0000-4000-8000-000000000000'::uuid,
    'da000001-0000-4000-8000-000000000000',
    'Hasan Çelik', 'demo.alici@tedport.com', '+90 312 555 01 01', 'Kardemir Çelik A.Ş.',
    'Tuzla–Ankara Aylık Demir Sevkiyatı Lojistik Hizmet Teklif Talebi',
    'Tuzla fabrikamızdan Ankara müşteri depolarına aylık düzenli demir sevkiyatı için lojistik hizmet teklifi almak istiyoruz. Nakliye sigortası zorunludur. Sefer başı ve aylık paket fiyat seçeneklerini belirtmenizi rica ederiz.',
    '[{"id":"1","adet":3,"birim":"Sefer/hafta","madde":"Tuzla (Fabrika) → Ankara (Ostim OSB)","aciklama":"Min. 20 ton TIR, nervürlü demir + çelik profil, nakliye sigortalı"}]'::jsonb,
    '2026-07-01', 'Ankara',
    'awaiting_reply', now() - interval '2 days', now() - interval '2 days'
  ) RETURNING id INTO tt6;

  INSERT INTO public.teklif_mesajlari (teklif_id, sender_id, sender_role, mesaj, created_at)
  VALUES
    (tt6, 'de000001-0000-4000-8000-000000000000'::uuid, 'user',
     'Ankara Ostim bölgesine hâlihazırda düzenli sefer düzenliyor musunuz? Bu bölgede konsolidasyon imkânınız var mı?',
     now() - interval '2 days');

  -- ── 7: Mehmet / Metalsan → Keyifli Gıda | awaiting_reply — ekipman bakım ──
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'da000002-0000-4000-8000-000000000000',
    'de000002-0000-4000-8000-000000000000'::uuid,
    'b0000001-0000-4000-8000-000000000000',
    'Mehmet Demir', 'demo.tedarikci@tedport.com', '+90 224 555 02 02', 'Metalsan Makine San. A.Ş.',
    'Gıda Üretim Hattı Ekipman Periyodik Bakım Hizmet Teklifimiz',
    'Gıda üretim hattınızdaki ekipmanlar için kapsamlı yıllık bakım sözleşmesi sunmak istiyoruz. 7/24 acil müdahale hattı (4 saat garantisi) dahildir. Referans listesi ve teknik şartnameyi paylaşmaktan memnuniyet duyarız.',
    '[{"id":"1","adet":10,"birim":"Hat","madde":"Konveyör Bant Sistemleri Yıllık Bakım","aciklama":"Yılda 4 bakım/hat"},{"id":"2","adet":1,"birim":"Paket","madde":"Dolum Makineleri Bakım (Piston, Hacimsel)","aciklama":"Yılda 2 bakım"},{"id":"3","adet":1,"birim":"Paket","madde":"Paketleme ve Shrink Tüneli Bakım","aciklama":"Yılda 2 bakım"},{"id":"4","adet":1,"birim":"Paket","madde":"Soğutma Kompresörleri Gaz Kontrol + Bakım","aciklama":"Yılda 2 gaz kontrol"},{"id":"5","adet":1,"birim":"Paket","madde":"Tartı ve Etiketleme Sistemleri Kalibrasyon","aciklama":"Yılda 1 kalibrasyon + bakım"}]'::jsonb,
    '2026-07-15', 'İzmir',
    'awaiting_reply', now() - interval '2 days', now() - interval '1 day'
  ) RETURNING id INTO tt7;

  INSERT INTO public.teklif_mesajlari (teklif_id, sender_id, sender_role, mesaj, created_at)
  VALUES
    (tt7, 'de000002-0000-4000-8000-000000000000'::uuid, 'user',
     'Bakım planımızda yılda 4 periyodik kontrol ve 7/24 acil müdahale hizmeti yer almaktadır. Teknik belgelerimizi ve 3 referans firmayı e-posta ile ilettik.',
     now() - interval '1 day');

  -- ── 8: Mehmet / Metalsan → Kardemir | replied — çelik sac hammadde ──
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'da000001-0000-4000-8000-000000000000',
    'de000002-0000-4000-8000-000000000000'::uuid,
    'b0000001-0000-4000-8000-000000000000',
    'Mehmet Demir', 'demo.tedarikci@tedport.com', '+90 224 555 02 02', 'Metalsan Makine San. A.Ş.',
    'İmalat Çelik Sac ve Profil Hammadde Alım Talebi',
    'Fabrikamızın CNC imalat operasyonu için çelik sac ve profil hammaddelerine aylık periyodik ihtiyaç duyuyoruz. Aylık sabit tedarik kontratı için fiyat ve teslim koşullarını görüşmek isteriz. Teslim: Bursa fabrika sahası.',
    '[{"id":"1","adet":5,"birim":"Ton/ay","madde":"S235JR Çelik Sac 4mm","aciklama":"1000×2000mm levha"},{"id":"2","adet":3,"birim":"Ton/ay","madde":"S235JR Çelik Sac 8mm","aciklama":"1500×3000mm levha"},{"id":"3","adet":2,"birim":"Ton/ay","madde":"S355J2 Çelik Sac 12mm","aciklama":"2000×6000mm levha"},{"id":"4","adet":500,"birim":"kg/ay","madde":"St37 Yuvarlak Çelik Bar Ø40mm","aciklama":""},{"id":"5","adet":300,"birim":"kg/ay","madde":"St37 Kare Çelik Bar 40×40mm","aciklama":""}]'::jsonb,
    '2026-07-01', 'Bursa',
    'replied', now() - interval '8 days', now() - interval '5 days'
  ) RETURNING id INTO tt8;

  INSERT INTO public.teklif_mesajlari (teklif_id, sender_id, sender_role, mesaj, created_at)
  VALUES
    (tt8, 'de000001-0000-4000-8000-000000000000'::uuid, 'company',
     'Aylık kontrat için uygun fiyat seçeneklerimiz mevcut. S235JR ve S355J2 standart stokta, St37 barlar için 1 hafta önceden sipariş alıyoruz. Fiyat teklifimizi e-posta ile ilettik.',
     now() - interval '6 days'),
    (tt8, 'de000002-0000-4000-8000-000000000000'::uuid, 'user',
     'Teşekkürler. S355J2 12mm levhalarda boyut toleransı ve yüzey kalitesi ne düzeyde? Mill sertifikası sunuluyor mu?',
     now() - interval '5 days');

  -- ── 9: Selim / FastLog → Keyifli Gıda | pending — soğuk zincir teklif ──
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'da000002-0000-4000-8000-000000000000',
    'de000004-0000-4000-8000-000000000000'::uuid,
    'b0000002-0000-4000-8000-000000000000',
    'Selim Yılmaz', 'demo.ghost1@tedport.com', '+90 216 555 04 04', 'FastLog Lojistik A.Ş.',
    'İzmir–İstanbul–Ankara Soğuk Zincir Dağıtım Ağı Teklifimiz',
    'İzmir üretim tesisinizdeki dağıtım ihtiyaçlarınız için soğuk zincir lojistik hizmetimizi sunmak istiyoruz. 24 araçlık ATP sertifikalı filomuzla hizmet veriyoruz. IoT sensörlü gerçek zamanlı sıcaklık takibi dahildir.',
    '[{"id":"1","adet":1,"birim":"Hizmet","madde":"İzmir (Bornova) → İstanbul (Esenyurt)","aciklama":"ATP belgeli araç, +2/+8°C"},{"id":"2","adet":1,"birim":"Hizmet","madde":"İzmir → Ankara (Sincan)","aciklama":"ATP belgeli araç, +2/+8°C"},{"id":"3","adet":1,"birim":"Hizmet","madde":"İzmir Şehir İçi Dağıtım","aciklama":"Soğutuculu van"},{"id":"4","adet":500,"birim":"Palet","madde":"İstanbul Esenyurt Soğuk Depo","aciklama":"Uzun/kısa dönem depolama"}]'::jsonb,
    null, 'İzmir',
    'pending', now() - interval '4 hours', now() - interval '4 hours'
  ) RETURNING id INTO tt9;

  -- ── 10: Selim / FastLog → Kardemir | pending — lojistik teklif ──
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'da000001-0000-4000-8000-000000000000',
    'de000004-0000-4000-8000-000000000000'::uuid,
    'b0000002-0000-4000-8000-000000000000',
    'Selim Yılmaz', 'demo.ghost1@tedport.com', '+90 216 555 04 04', 'FastLog Lojistik A.Ş.',
    'Tuzla Fabrika Lojistik ve Demir Sevkiyat Hizmet Teklifi',
    'Tuzla fabrika lokasyonunuzdaki sevkiyat operasyonlarına destek verebilecek kapasitedeyiz. Haftalık sabit seferlerde %8 indirim ve gerçek zamanlı araç takip hizmetimiz mevcuttur. Aylık kontrat için özel fiyatlandırma yapabiliriz.',
    '[{"id":"1","adet":15,"birim":"TIR/hafta","madde":"Tuzla Fabrika Çıkışı Karayolu Taşımacılığı","aciklama":"20–24 ton kapasite, Ankara/İstanbul/İzmir güzergahları, klima kontrollü araç seçeneği"}]'::jsonb,
    null, 'İstanbul / Tuzla',
    'pending', now() - interval '6 hours', now() - interval '6 hours'
  ) RETURNING id INTO tt10;

  -- ── 11: Murat (ghost3) → Metalsan | read — makine satın alma ──
  INSERT INTO public.teklif_talepleri (
    firma_id, user_id, gonderen_firma_id,
    ad_soyad, email, telefon, firma_adi,
    konu, mesaj, kalemler, teslim_tarihi, teslim_yeri,
    durum, created_at, updated_at
  ) VALUES (
    'b0000001-0000-4000-8000-000000000000',
    'de000006-0000-4000-8000-000000000000'::uuid, null,
    'Murat Koç', 'demo.ghost3@tedport.com', '+90 412 555 06 06', null,
    'İkinci El CNC Torna Tezgahı Temin Talebi',
    'Atölyem için ikinci el veya yenilenmiş CNC torna tezgahı arıyorum. Bütçem: 150.000–250.000 TL. Marka tercihi: Mazak, Okuma, Doosan (Türkiye servisli). Stokta var mı veya temin edebilir misiniz?',
    '[{"id":"1","adet":1,"birim":"Adet","madde":"İkinci El / Yenilenmiş CNC Torna Tezgahı","aciklama":"Fanuc 0i+, min. Ø300mm / 800mm, 8 istasyon revolver, min. 3000 rpm, çalışır garantili"}]'::jsonb,
    '2026-08-15', 'Diyarbakır',
    'read', now() - interval '2 days', now() - interval '2 days'
  ) RETURNING id INTO tt11;

END $tt_demo$;
