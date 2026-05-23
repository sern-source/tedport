-- Enes Doğanay | 23 Mayıs 2026: ana_sektor alanını 32 geniş sektörle hizalayan migration
-- ─────────────────────────────────────────────────────────────────────────────
-- ADIM 1 — Önce bu tanı sorgusunu çalıştır, mevcut değerleri gör:
-- ─────────────────────────────────────────────────────────────────────────────
/*
SELECT
  ana_sektor,
  COUNT(*) AS firma_sayisi
FROM firmalar
WHERE is_demo = false OR is_demo IS NULL
GROUP BY ana_sektor
ORDER BY firma_sayisi DESC;
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- ADIM 2 — Migration (DO $$ bloğu — Supabase SQL Editor ile tam uyumlu)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  valid_sektors TEXT[] := ARRAY[
    'Makine ve Endüstriyel Ekipmanlar',
    'Metal ve Metal İşleme Sanayi',
    'Endüstriyel Otomasyon Sistemleri',
    'Elektrik ve Elektrik Ekipmanları',
    'Elektronik ve Elektronik Üretim',
    'Enerji ve Güç Sistemleri',
    'Mekanik Sistemler ve Mühendislik',
    'Hırdavat ve Teknik Malzemeler',
    'İnşaat ve Yapı Malzemeleri',
    'Kimya ve Endüstriyel Kimyasallar',
    'Plastik ve Plastik Üretimi',
    'Ambalaj ve Paketleme Sistemleri',
    'Lojistik ve Tedarik Zinciri',
    'Tekstil ve Tekstil Üretimi',
    'Gıda ve Gıda Üretim Teknolojileri',
    'Otomotiv ve Otomotiv Yan Sanayi',
    'Medikal ve Sağlık Teknolojileri',
    'Bilişim, Yazılım ve BT Çözümleri',
    'Güvenlik Sistemleri ve Teknolojileri',
    'Endüstriyel ve Kurumsal Hizmetler',
    'Cam ve Cam Ürünleri',
    'Seramik, Porselen ve Refrakter Malzemeler',
    'Ahşap, Orman Ürünleri ve Mobilya',
    'Kağıt, Karton ve Baskı Sanayi',
    'Tarım, Hayvancılık ve Tarımsal Teknolojiler',
    'Madencilik ve Mineral İşleme',
    'Boya, Vernik ve Yüzey Kaplama Sistemleri',
    'Petrol, Doğalgaz ve Petrokimya',
    'Savunma ve Havacılık Sanayi',
    'Denizcilik, Gemi ve Su Araçları',
    'İlaç, Eczacılık ve Biyoteknoloji',
    'Çevre Teknolojileri ve Atık Yönetimi'
  ];
BEGIN

  -- ── PASS 1: Tam isim eşleşmeleri (KEYWORD_OVERRIDES'ta bilinen alt kategoriler) ──

  UPDATE firmalar SET ana_sektor = 'Makine ve Endüstriyel Ekipmanlar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor ILIKE '%İş Makine%';

  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (ana_sektor ILIKE '%AG Şalt%' OR ana_sektor ILIKE '%Enerji Dağıtım%');

  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (ana_sektor ILIKE '%Barkod%' OR ana_sektor ILIKE '%RFID%' OR ana_sektor ILIKE '%İzlenebilirlik%');

  UPDATE firmalar SET ana_sektor = 'Elektronik ve Elektronik Üretim'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (ana_sektor ILIKE '%ESD%' OR ana_sektor ILIKE '%Antistatik%');

  UPDATE firmalar SET ana_sektor = 'Bilişim, Yazılım ve BT Çözümleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%CMMS%'
      OR ana_sektor ILIKE '%Bakım Yönetim Yazılım%'
      OR ana_sektor ILIKE '%ERP%'
      OR ana_sektor ILIKE '%MRP%'
      OR ana_sektor ILIKE '%WMS%'
      OR ana_sektor ILIKE '%Depo Otomasyonu%'
    );

  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (ana_sektor ILIKE '%ADR Ambalaj%' OR ana_sektor ILIKE '%Tehlikeli Madde Lojistik%');

  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%MRO%'
      OR ana_sektor ILIKE '%Bakım, Onarım%'
      OR ana_sektor ILIKE '%OSGB%'
      OR ana_sektor ILIKE '%İSG%'
      OR ana_sektor ILIKE '%İş Güvenliği%'
      OR ana_sektor ILIKE '%Ar-Ge%'
      OR ana_sektor ILIKE '%Prototipleme%'
      OR ana_sektor ILIKE '%Ürün Geliştirme%'
    );

  -- ── PASS 2: Genel keyword pattern eşleşmeleri ────────────────────────────

  UPDATE firmalar SET ana_sektor = 'Makine ve Endüstriyel Ekipmanlar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Makine Üretim%' OR ana_sektor ILIKE '%Makine İmalat%'
      OR ana_sektor ILIKE '%CNC%' OR ana_sektor ILIKE '%Kompresör%'
      OR ana_sektor ILIKE '%Konveyör%' OR ana_sektor ILIKE '%Pompa Sanayi%'
      OR ana_sektor ILIKE '%Kaynak Makine%' OR ana_sektor ILIKE '%Takım Tezgah%'
      OR ana_sektor ILIKE '%Pres Makine%' OR ana_sektor ILIKE '%Endüstriyel Ekipman%'
    );

  UPDATE firmalar SET ana_sektor = 'Metal ve Metal İşleme Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Demir Çelik%' OR ana_sektor ILIKE '%Metal İşleme%'
      OR ana_sektor ILIKE '%Alüminyum Sanayi%' OR ana_sektor ILIKE '%Paslanmaz Çelik%'
      OR ana_sektor ILIKE '%Sac Metal%' OR ana_sektor ILIKE '%Hadde%'
      OR ana_sektor ILIKE '%Döküm%' OR ana_sektor ILIKE '%Dövme%'
      OR ana_sektor ILIKE '%Tel Çekme%' OR ana_sektor ILIKE '%Çelik Üretim%'
      OR ana_sektor ILIKE '%Metal Üretim%'
    );

  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%PLC%' OR ana_sektor ILIKE '%SCADA%'
      OR ana_sektor ILIKE '%Otomasyon Sistem%' OR ana_sektor ILIKE '%Robot Sistem%'
      OR ana_sektor ILIKE '%Servo%' OR ana_sektor ILIKE '%Endüstriyel Robot%'
    );

  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Kablo Üretim%' OR ana_sektor ILIKE '%Elektrik Pano%'
      OR ana_sektor ILIKE '%Trafo%' OR ana_sektor ILIKE '%OG Şalt%'
      OR ana_sektor ILIKE '%Aydınlatma Sanayi%' OR ana_sektor ILIKE '%Elektrik Malzeme%'
      OR ana_sektor ILIKE '%Elektrik Ekipman%' OR ana_sektor ILIKE '%Sigorta Şalt%'
    );

  UPDATE firmalar SET ana_sektor = 'Elektronik ve Elektronik Üretim'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%PCB%' OR ana_sektor ILIKE '%Elektronik Kart%'
      OR ana_sektor ILIKE '%Elektronik Üretim%' OR ana_sektor ILIKE '%Elektronik Sanayi%'
      OR ana_sektor ILIKE '%Devre%'
    );

  UPDATE firmalar SET ana_sektor = 'Enerji ve Güç Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Güneş Enerji%' OR ana_sektor ILIKE '%Solar Panel%'
      OR ana_sektor ILIKE '%Fotovoltaik%' OR ana_sektor ILIKE '%Rüzgar Enerji%'
      OR ana_sektor ILIKE '%Jeneratör%' OR ana_sektor ILIKE '%UPS Sistem%'
      OR ana_sektor ILIKE '%Biyokütle%' OR ana_sektor ILIKE '%Enerji Depolama%'
      OR ana_sektor ILIKE '%Güç Kaynağı%' OR ana_sektor ILIKE '%Enerji Üretim%'
    );

  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Rulman%' OR ana_sektor ILIKE '%Dişli%'
      OR ana_sektor ILIKE '%Redüktör%' OR ana_sektor ILIKE '%Mekanik Sistem%'
      OR ana_sektor ILIKE '%Şaft%' OR ana_sektor ILIKE '%Flanş%'
      OR ana_sektor ILIKE '%Zincir Üretim%' OR ana_sektor ILIKE '%Kaplin%'
    );

  UPDATE firmalar SET ana_sektor = 'Hırdavat ve Teknik Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Hırdavat%' OR ana_sektor ILIKE '%Bağlantı Elemanı%'
      OR ana_sektor ILIKE '%Vida Somun%' OR ana_sektor ILIKE '%El Aleti%'
      OR ana_sektor ILIKE '%Civata%' OR ana_sektor ILIKE '%Teknik Malzeme%'
    );

  UPDATE firmalar SET ana_sektor = 'İnşaat ve Yapı Malzemeleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%İnşaat Malzeme%' OR ana_sektor ILIKE '%Yapı Malzeme%'
      OR ana_sektor ILIKE '%Çimento%' OR ana_sektor ILIKE '%Beton Ürün%'
      OR ana_sektor ILIKE '%Yalıtım%' OR ana_sektor ILIKE '%Tuğla%'
      OR ana_sektor ILIKE '%Prefabrik%' OR ana_sektor ILIKE '%Yapı Kimyasal%'
      OR ana_sektor ILIKE '%İnşaat Sektörü%' OR ana_sektor ILIKE '%Zemin Kaplama%'
    );

  UPDATE firmalar SET ana_sektor = 'Kimya ve Endüstriyel Kimyasallar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Kimyasal Üretim%' OR ana_sektor ILIKE '%Kimya Sanayi%'
      OR ana_sektor ILIKE '%Solvent%' OR ana_sektor ILIKE '%Polimer%'
      OR ana_sektor ILIKE '%Reçine%' OR ana_sektor ILIKE '%Yapıştırıcı Kimya%'
      OR ana_sektor ILIKE '%Endüstriyel Kimya%' OR ana_sektor ILIKE '%Kimya Hammadde%'
    );

  UPDATE firmalar SET ana_sektor = 'Plastik ve Plastik Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Plastik Üretim%' OR ana_sektor ILIKE '%Plastik Sanayi%'
      OR ana_sektor ILIKE '%Polietilen Üretim%' OR ana_sektor ILIKE '%PVC Profil%'
      OR ana_sektor ILIKE '%Poliüretan%' OR ana_sektor ILIKE '%Plastik Granül%'
      OR ana_sektor ILIKE '%Plastik Enjeksiyon%' OR ana_sektor ILIKE '%Plastik Boru%'
    );

  UPDATE firmalar SET ana_sektor = 'Ambalaj ve Paketleme Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Ambalaj Üretim%' OR ana_sektor ILIKE '%Paketleme%'
      OR ana_sektor ILIKE '%Film Ambalaj%' OR ana_sektor ILIKE '%Torba Üretim%'
      OR ana_sektor ILIKE '%Etiket Üretim%' OR ana_sektor ILIKE '%Shrink%'
      OR ana_sektor ILIKE '%Ambalaj Sanayi%'
    );

  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Nakliye%' OR ana_sektor ILIKE '%Taşımacılık%'
      OR ana_sektor ILIKE '%Lojistik Hizmet%' OR ana_sektor ILIKE '%Forklift%'
      OR ana_sektor ILIKE '%Depo Yönetim%' OR ana_sektor ILIKE '%Tedarik Zinciri%'
      OR ana_sektor ILIKE '%Kargo%' OR ana_sektor ILIKE '%Antrepo%'
    );

  UPDATE firmalar SET ana_sektor = 'Tekstil ve Tekstil Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Tekstil Üretim%' OR ana_sektor ILIKE '%Kumaş Üretim%'
      OR ana_sektor ILIKE '%İplik Üretim%' OR ana_sektor ILIKE '%Konfeksiyon%'
      OR ana_sektor ILIKE '%Dokuma%' OR ana_sektor ILIKE '%Örme%'
      OR ana_sektor ILIKE '%Tekstil Makine%' OR ana_sektor ILIKE '%Tekstil Sanayi%'
      OR ana_sektor ILIKE '%Denim%' OR ana_sektor ILIKE '%Hazır Giyim%'
    );

  UPDATE firmalar SET ana_sektor = 'Gıda ve Gıda Üretim Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Gıda Üretim%' OR ana_sektor ILIKE '%Gıda Sanayi%'
      OR ana_sektor ILIKE '%Gıda Makine%' OR ana_sektor ILIKE '%Gıda İşleme%'
      OR ana_sektor ILIKE '%Tarım Gıda%' OR ana_sektor ILIKE '%Gıda Hammadde%'
      OR ana_sektor ILIKE '%Unlu Mamul%' OR ana_sektor ILIKE '%Et Sanayi%'
      OR ana_sektor ILIKE '%Süt Sanayi%' OR ana_sektor ILIKE '%Yağ Sanayi%'
    );

  UPDATE firmalar SET ana_sektor = 'Otomotiv ve Otomotiv Yan Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Otomotiv%' OR ana_sektor ILIKE '%Araç Üretim%'
      OR ana_sektor ILIKE '%Lastik Sanayi%' OR ana_sektor ILIKE '%Yedek Parça%'
      OR ana_sektor ILIKE '%Araç Aksesuarı%' OR ana_sektor ILIKE '%Motorlu Araç%'
    );

  UPDATE firmalar SET ana_sektor = 'Medikal ve Sağlık Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Medikal%' OR ana_sektor ILIKE '%Tıbbi Cihaz%'
      OR ana_sektor ILIKE '%Sağlık Ekipman%' OR ana_sektor ILIKE '%Hastane Malzeme%'
      OR ana_sektor ILIKE '%Dental%' OR ana_sektor ILIKE '%Sağlık Teknoloji%'
      OR ana_sektor ILIKE '%Tıbbi Sarf%'
    );

  UPDATE firmalar SET ana_sektor = 'Bilişim, Yazılım ve BT Çözümleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Yazılım Geliştir%' OR ana_sektor ILIKE '%BT Hizmet%'
      OR ana_sektor ILIKE '%IT Hizmet%' OR ana_sektor ILIKE '%Veri Merkezi%'
      OR ana_sektor ILIKE '%Siber Güvenlik%' OR ana_sektor ILIKE '%Bulut Çözüm%'
      OR ana_sektor ILIKE '%Teknoloji Çözüm%' OR ana_sektor ILIKE '%Ağ Altyapı%'
      OR ana_sektor ILIKE '%Sunucu%' OR ana_sektor ILIKE '%CRM%'
    );

  UPDATE firmalar SET ana_sektor = 'Güvenlik Sistemleri ve Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Güvenlik Sistem%' OR ana_sektor ILIKE '%Kamera Sistem%'
      OR ana_sektor ILIKE '%Alarm Sistem%' OR ana_sektor ILIKE '%Erişim Kontrol%'
      OR ana_sektor ILIKE '%CCTV%' OR ana_sektor ILIKE '%Yangın Alarm%'
      OR ana_sektor ILIKE '%Biyometrik%'
    );

  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Temizlik Hizmet%' OR ana_sektor ILIKE '%Bakım Hizmet%'
      OR ana_sektor ILIKE '%Dış Kaynak%' OR ana_sektor ILIKE '%Danışmanlık%'
      OR ana_sektor ILIKE '%Endüstriyel Hizmet%' OR ana_sektor ILIKE '%Kurumsal Hizmet%'
      OR ana_sektor ILIKE '%Tesis Yönetim%'
    );

  UPDATE firmalar SET ana_sektor = 'Cam ve Cam Ürünleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Cam Sanayi%' OR ana_sektor ILIKE '%Cam Üretim%'
      OR ana_sektor ILIKE '%Cam İşleme%' OR ana_sektor ILIKE '%Cam Ambalaj%'
      OR ana_sektor ILIKE '%Düz Cam%' OR ana_sektor ILIKE '%Cam Elyaf%'
      OR ana_sektor ILIKE '%Cam Ürün%' OR ana_sektor ILIKE '%Temperli Cam%'
      OR ana_sektor ILIKE '%Cam Şişe%'
    );

  UPDATE firmalar SET ana_sektor = 'Seramik, Porselen ve Refrakter Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Seramik Üretim%' OR ana_sektor ILIKE '%Fayans%'
      OR ana_sektor ILIKE '%Porselen Üretim%' OR ana_sektor ILIKE '%Refrakter%'
      OR ana_sektor ILIKE '%Ateşe Dayanıklı%' OR ana_sektor ILIKE '%Seramik Sanayi%'
      OR ana_sektor ILIKE '%Sıhhi Tesisat Seramik%'
    );

  UPDATE firmalar SET ana_sektor = 'Ahşap, Orman Ürünleri ve Mobilya'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Orman Ürün%' OR ana_sektor ILIKE '%Kereste%'
      OR ana_sektor ILIKE '%Ahşap Üretim%' OR ana_sektor ILIKE '%Mobilya Üretim%'
      OR ana_sektor ILIKE '%MDF%' OR ana_sektor ILIKE '%Kontrplak%'
      OR ana_sektor ILIKE '%Parke%' OR ana_sektor ILIKE '%Sunta%'
      OR ana_sektor ILIKE '%Ahşap Sanayi%' OR ana_sektor ILIKE '%Mobilya Sanayi%'
    );

  UPDATE firmalar SET ana_sektor = 'Kağıt, Karton ve Baskı Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Kağıt Üretim%' OR ana_sektor ILIKE '%Karton Üretim%'
      OR ana_sektor ILIKE '%Baskı Sanayi%' OR ana_sektor ILIKE '%Matbaa%'
      OR ana_sektor ILIKE '%Ofset Baskı%' OR ana_sektor ILIKE '%Kağıt Sanayi%'
      OR ana_sektor ILIKE '%Ambalaj Baskı%'
    );

  UPDATE firmalar SET ana_sektor = 'Tarım, Hayvancılık ve Tarımsal Teknolojiler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Tarım%' OR ana_sektor ILIKE '%Hayvancılık%'
      OR ana_sektor ILIKE '%Tohum%' OR ana_sektor ILIKE '%Gübre%'
      OR ana_sektor ILIKE '%Sulama Sistem%' OR ana_sektor ILIKE '%Tarımsal Makine%'
      OR ana_sektor ILIKE '%Agro%' OR ana_sektor ILIKE '%Zirai%'
      OR ana_sektor ILIKE '%Bitki Koruma%' OR ana_sektor ILIKE '%Seracılık%'
    );

  UPDATE firmalar SET ana_sektor = 'Madencilik ve Mineral İşleme'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Madencilik%' OR ana_sektor ILIKE '%Maden İşleme%'
      OR ana_sektor ILIKE '%Mermer Sanayi%' OR ana_sektor ILIKE '%Granit%'
      OR ana_sektor ILIKE '%Mineral%' OR ana_sektor ILIKE '%Kırmataş%'
      OR ana_sektor ILIKE '%Bor Madeni%' OR ana_sektor ILIKE '%Krom%'
      OR ana_sektor ILIKE '%Taş Ocak%'
    );

  UPDATE firmalar SET ana_sektor = 'Boya, Vernik ve Yüzey Kaplama Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Boya Üretim%' OR ana_sektor ILIKE '%Boya Sanayi%'
      OR ana_sektor ILIKE '%Vernik Üretim%' OR ana_sektor ILIKE '%Toz Boya%'
      OR ana_sektor ILIKE '%Epoksi Kaplama%' OR ana_sektor ILIKE '%Yüzey Kaplama%'
      OR ana_sektor ILIKE '%Boya Kimya%' OR ana_sektor ILIKE '%Galvaniz%'
      OR ana_sektor ILIKE '%Elektrostatik Boya%'
    );

  UPDATE firmalar SET ana_sektor = 'Petrol, Doğalgaz ve Petrokimya'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Petrol%' OR ana_sektor ILIKE '%Doğalgaz%'
      OR ana_sektor ILIKE '%LPG%' OR ana_sektor ILIKE '%Rafineri%'
      OR ana_sektor ILIKE '%Petrokimya%' OR ana_sektor ILIKE '%Akaryakıt%'
      OR ana_sektor ILIKE '%Boru Hattı%' OR ana_sektor ILIKE '%Sondaj%'
    );

  UPDATE firmalar SET ana_sektor = 'Savunma ve Havacılık Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Savunma%' OR ana_sektor ILIKE '%Havacılık%'
      OR ana_sektor ILIKE '%Askeri%' OR ana_sektor ILIKE '%Uzay Teknoloji%'
      OR ana_sektor ILIKE '%İnsansız Hava%' OR ana_sektor ILIKE '%UAV%'
      OR ana_sektor ILIKE '%Aerospace%' OR ana_sektor ILIKE '%Defence%'
    );

  UPDATE firmalar SET ana_sektor = 'Denizcilik, Gemi ve Su Araçları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Gemi Yapım%' OR ana_sektor ILIKE '%Denizcilik%'
      OR ana_sektor ILIKE '%Tersane%' OR ana_sektor ILIKE '%Yat Üretim%'
      OR ana_sektor ILIKE '%Tekne%' OR ana_sektor ILIKE '%Deniz Ekipman%'
      OR ana_sektor ILIKE '%Deniz Taşımacılık%' OR ana_sektor ILIKE '%Gemi Sanayi%'
    );

  UPDATE firmalar SET ana_sektor = 'İlaç, Eczacılık ve Biyoteknoloji'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%İlaç Üretim%' OR ana_sektor ILIKE '%İlaç Sanayi%'
      OR ana_sektor ILIKE '%Eczacılık%' OR ana_sektor ILIKE '%Biyoteknoloji%'
      OR ana_sektor ILIKE '%Farma%' OR ana_sektor ILIKE '%Pharma%'
      OR ana_sektor ILIKE '%Biyomedikal%' OR ana_sektor ILIKE '%Veteriner İlaç%'
    );

  UPDATE firmalar SET ana_sektor = 'Çevre Teknolojileri ve Atık Yönetimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND (
      ana_sektor ILIKE '%Çevre Teknoloji%' OR ana_sektor ILIKE '%Atık Yönetim%'
      OR ana_sektor ILIKE '%Su Arıtma%' OR ana_sektor ILIKE '%Geri Dönüşüm%'
      OR ana_sektor ILIKE '%Hava Filtr%' OR ana_sektor ILIKE '%Atık İşleme%'
      OR ana_sektor ILIKE '%Çevre Mühendislik%' OR ana_sektor ILIKE '%Biyogaz%'
      OR ana_sektor ILIKE '%Atık Su%'
    );

END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ADIM 3 — Migration sonucu kontrol: hâlâ eşleşmeyen kayıtları gör
-- (DO $$ bittikten sonra bu SELECT'i ayrıca çalıştır)
-- ─────────────────────────────────────────────────────────────────────────────
/*
SELECT
  ana_sektor,
  COUNT(*) AS kalan_firma
FROM firmalar
WHERE
  (is_demo = false OR is_demo IS NULL)
  AND ana_sektor IS NOT NULL
  AND ana_sektor <> ''
  AND ana_sektor NOT IN (
    'Makine ve Endüstriyel Ekipmanlar','Metal ve Metal İşleme Sanayi',
    'Endüstriyel Otomasyon Sistemleri','Elektrik ve Elektrik Ekipmanları',
    'Elektronik ve Elektronik Üretim','Enerji ve Güç Sistemleri',
    'Mekanik Sistemler ve Mühendislik','Hırdavat ve Teknik Malzemeler',
    'İnşaat ve Yapı Malzemeleri','Kimya ve Endüstriyel Kimyasallar',
    'Plastik ve Plastik Üretimi','Ambalaj ve Paketleme Sistemleri',
    'Lojistik ve Tedarik Zinciri','Tekstil ve Tekstil Üretimi',
    'Gıda ve Gıda Üretim Teknolojileri','Otomotiv ve Otomotiv Yan Sanayi',
    'Medikal ve Sağlık Teknolojileri','Bilişim, Yazılım ve BT Çözümleri',
    'Güvenlik Sistemleri ve Teknolojileri','Endüstriyel ve Kurumsal Hizmetler',
    'Cam ve Cam Ürünleri','Seramik, Porselen ve Refrakter Malzemeler',
    'Ahşap, Orman Ürünleri ve Mobilya','Kağıt, Karton ve Baskı Sanayi',
    'Tarım, Hayvancılık ve Tarımsal Teknolojiler','Madencilik ve Mineral İşleme',
    'Boya, Vernik ve Yüzey Kaplama Sistemleri','Petrol, Doğalgaz ve Petrokimya',
    'Savunma ve Havacılık Sanayi','Denizcilik, Gemi ve Su Araçları',
    'İlaç, Eczacılık ve Biyoteknoloji','Çevre Teknolojileri ve Atık Yönetimi'
  )
GROUP BY ana_sektor
ORDER BY kalan_firma DESC;
*/
