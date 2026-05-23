-- Enes Doğanay | 23 Mayıs 2026: PASS 3 — Kısa/generic ana_sektor değerlerini tam eşleşme ile map'le
-- (ana_sektor_mapping.sql DO $$ bloğundan sonra çalıştır)
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

  -- ── Metal ve Metal İşleme Sanayi ─────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Metal ve Metal İşleme Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Sac İşleme', 'Metal Şekillendirme', 'Metal Sanayi',
      'Talaşlı İmalat', 'Isıl İşlem', 'Çelik Servis',
      'Demir-Çelik Sanayi', 'Tel Ürünleri', 'Çelik Konstrüksiyon'
    );

  -- ── Hırdavat ve Teknik Malzemeler ────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Hırdavat ve Teknik Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Bağlantı', 'Bağlantı Elemanları', 'Sarf Malzeme',
      'Endüstriyel Bağlantı', 'Sarf'
    );

  -- ── Endüstriyel Otomasyon Sistemleri ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Otomasyon', 'Sistem Entegrasyonu', 'Hareket Kontrol'
    );

  -- ── Elektrik ve Elektrik Ekipmanları ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Elektrik', 'Zayıf Akım', 'Pano',
      'Elektrik Dağıtım', 'Kablo Sanayi'
    );

  -- ── Enerji ve Güç Sistemleri ─────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Enerji ve Güç Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Enerji', 'Güç Elektroniği', 'Güç Sistemleri',
      'Güneş Paneli', 'Yenilenebilir Enerji',
      'Enerji Sistemleri', 'Enerji Yönetimi'
    );

  -- ── Mekanik Sistemler ve Mühendislik ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Mekanik', 'Hidrolik', 'Yataklama',
      'Vana', 'Zincir', 'Akışkan Transferi', 'Hareket'
    );

  -- ── Makine ve Endüstriyel Ekipmanlar ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Makine ve Endüstriyel Ekipmanlar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Özel Makine', 'Basınçlı Kap', 'Basınçlı Hava',
      'Soğutma', 'İklimlendirme', 'HVAC',
      'Isıtma', 'Isıtma Sistemleri',
      'Filtrasyon', 'Kaldırma Ekipmanları',
      'Gaz Ekipmanları', 'Hava Sistemleri',
      'Endüstriyel Gaz', 'Ambalaj Makinesi'
    );

  -- ── İnşaat ve Yapı Malzemeleri ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'İnşaat ve Yapı Malzemeleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Tesisat', 'Altyapı', 'Sandviç Panel', 'İzolasyon'
    );

  -- ── Boya, Vernik ve Yüzey Kaplama Sistemleri ─────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Boya, Vernik ve Yüzey Kaplama Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Yüzey İşlem'
    );

  -- ── Lojistik ve Tedarik Zinciri ───────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Depolama', 'Tedarik', 'Entegre Lojistik', 'Kimyasal Lojistik'
    );

  -- ── Kimya ve Endüstriyel Kimyasallar ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Kimya ve Endüstriyel Kimyasallar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Kimya', 'Hammadde'
    );

  -- ── Plastik ve Plastik Üretimi ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Plastik ve Plastik Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Plastik', 'Ekstrüzyon'
    );

  -- ── Ambalaj ve Paketleme Sistemleri ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Ambalaj ve Paketleme Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Ambalaj', 'Koruyucu Ambalaj', 'Esnek Ambalaj', 'Etiketleme'
    );

  -- ── Tekstil ve Tekstil Üretimi ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Tekstil ve Tekstil Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Tekstil', 'Erkek Giyim', 'Kaplamalı Kumaş',
      'Teknik Tekstil', 'Makine Halısı'
    );

  -- ── Gıda ve Gıda Üretim Teknolojileri ────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Gıda ve Gıda Üretim Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Gıda Bileşenleri', 'Gıda ve İçecek Sanayi', 'Gıda ve İçecek'
    );

  -- ── Tarım, Hayvancılık ve Tarımsal Teknolojiler ───────────────────────────
  UPDATE firmalar SET ana_sektor = 'Tarım, Hayvancılık ve Tarımsal Teknolojiler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Yem Sanayi', 'İlaçlama', 'Bitki Besleme', 'Hayvan Besleme'
    );

  -- ── Otomotiv ve Otomotiv Yan Sanayi ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Otomotiv ve Otomotiv Yan Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Motor Parçaları', 'Lastik', 'Lastik ve Kauçuk Sanayi'
    );

  -- ── İlaç, Eczacılık ve Biyoteknoloji ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'İlaç, Eczacılık ve Biyoteknoloji'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'İlaç ve Sağlık Sanayi'
    );

  -- ── Çevre Teknolojileri ve Atık Yönetimi ─────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Çevre Teknolojileri ve Atık Yönetimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Su Teknolojileri', 'Toz Toplama'
    );

  -- ── Ahşap, Orman Ürünleri ve Mobilya ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Ahşap, Orman Ürünleri ve Mobilya'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Mobilya', 'Ofis Mobilyası'
    );

  -- ── Endüstriyel ve Kurumsal Hizmetler ────────────────────────────────────
  -- (En sona bırakıldı — geniş kapsam, diğerleri önce eşleşsin)
  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Endüstriyel', 'Mühendislik', 'Hizmet', 'Metroloji',
      'Denetim', 'Montaj', 'Kalite Kontrol', 'Laboratuvar',
      'Endüstriyel Tedarik', 'Servis', 'Teknik Servis',
      'Müşavirlik', 'Kalibrasyon'
    );

END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Kontrol — pass3 sonrası kalan kayıtlar
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
