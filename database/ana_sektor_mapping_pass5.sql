-- Enes Doğanay | 23 Mayıs 2026: PASS 5 — Son kalan 2'li kayıtlar
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

  -- ── Elektronik ve Elektronik Üretim ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Elektronik ve Elektronik Üretim'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Elektronik', 'Direnç'
    );

  -- ── Metal ve Metal İşleme Sanayi ─────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Metal ve Metal İşleme Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Hafif Metal', 'Metal Sanayi - Alüminyum',
      'Özel Çelik', 'Boru İşleme', 'Tel Çit',
      'Hassas İşleme', 'Metal Pres', 'Ağır İmalat'
    );

  -- ── Makine ve Endüstriyel Ekipmanlar ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Makine ve Endüstriyel Ekipmanlar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Pres İmalatı', 'Lazer', 'Isıtma Soğutma',
      'Dozajlama', 'Rulo', 'Metal Pres',
      'Kaynak', 'Proses Ekipmanı', 'Sıcak Su',
      'Yıkama Makinesi', 'İnşaat Makineleri',
      'Tank İmalatı', 'Makine Parçası',
      'Hat Sonu', 'Soğutma Taahhüt', 'Ağır İmalat'
    );

  -- ── Mekanik Sistemler ve Mühendislik ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Hidrolik Ekipman'
    );

  -- ── Elektrik ve Elektrik Ekipmanları ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Dış Aydınlatma', 'Yüksek Gerilim', 'Alçak Gerilim',
      'Elektrik Bağlantı', 'Solenoid', 'Elektrik Bakım'
    );

  -- ── Endüstriyel Otomasyon Sistemleri ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Endüstriyel Otomasyon', 'Motor Kontrol',
      'Proses Kontrol', 'Ortam İzleme',
      'Görüntüleme Sistemleri', 'Kaynak Otomasyonu',
      'Seviye Ölçüm'
    );

  -- ── Kimya ve Endüstriyel Kimyasallar ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Kimya ve Endüstriyel Kimyasallar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Yağlama'
    );

  -- ── Plastik ve Plastik Üretimi ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Plastik ve Plastik Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Kauçuk Parça', 'Plastik Profil',
      'Lifli Çember', 'Akrilik Banyo Ürünleri'
    );

  -- ── Ambalaj ve Paketleme Sistemleri ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Ambalaj ve Paketleme Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Sentetik Ambalaj', 'Metal Ambalaj', 'Endüstriyel Etiket'
    );

  -- ── Boya, Vernik ve Yüzey Kaplama Sistemleri ─────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Boya, Vernik ve Yüzey Kaplama Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Silindir Kaplama', 'Oto Tamir ve Sanayi Boyaları'
    );

  -- ── Lojistik ve Tedarik Zinciri ───────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Proje Lojistiği', 'Tanker', 'Kontrat Lojistiği',
      'Depo Sistemleri', 'Soğuk Zincir'
    );

  -- ── İnşaat ve Yapı Malzemeleri ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'İnşaat ve Yapı Malzemeleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Kapı İmalatı', 'Beton Ekipmanı',
      'Endüstriyel İzolasyon', 'İskele Sistemleri'
    );

  -- ── Tekstil ve Tekstil Üretimi ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Tekstil ve Tekstil Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Tekstil Yan Sanayi', 'Perde ve Döşemelik'
    );

  -- ── Gıda ve Gıda Üretim Teknolojileri ────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Gıda ve Gıda Üretim Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Un Sanayi', 'Su Ürünleri'
    );

  -- ── Tarım, Hayvancılık ve Tarımsal Teknolojiler ───────────────────────────
  UPDATE firmalar SET ana_sektor = 'Tarım, Hayvancılık ve Tarımsal Teknolojiler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Traktör', 'Karma Yem Sanayi'
    );

  -- ── Otomotiv ve Otomotiv Yan Sanayi ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Otomotiv ve Otomotiv Yan Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Tekerlek', 'Sürtünme Malzemeleri',
      'Direksiyon ve Süspansiyon Parçaları',
      'Treyler Üretimi', 'Araç Üstü'
    );

  -- ── Seramik, Porselen ve Refrakter Malzemeler ────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Seramik, Porselen ve Refrakter Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Monolitik'
    );

  -- ── Medikal ve Sağlık Teknolojileri ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Medikal ve Sağlık Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Diagnostik'
    );

  -- ── Bilişim, Yazılım ve BT Çözümleri ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Bilişim, Yazılım ve BT Çözümleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Haberleşme', 'Lojistik Yazılım', 'Bilişim'
    );

  -- ── Çevre Teknolojileri ve Atık Yönetimi ─────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Çevre Teknolojileri ve Atık Yönetimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Bitkisel Atık', 'Biyolojik Arıtma',
      'Plastik Geri Kazanım', 'Çevre'
    );

  -- ── Ahşap, Orman Ürünleri ve Mobilya ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Ahşap, Orman Ürünleri ve Mobilya'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Laboratuvar Mobilyası', 'Proje Mobilyası'
    );

  -- ── Denizcilik, Gemi ve Su Araçları ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Denizcilik, Gemi ve Su Araçları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Deniz Taşımacılığı'
    );

  -- ── Hırdavat ve Teknik Malzemeler ────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Hırdavat ve Teknik Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Bağlantı Elemanları (Fasteners)', 'Kelepçe',
      'Vida', 'Zımpara', 'Kilit', 'Komponent'
    );

  -- ── Endüstriyel ve Kurumsal Hizmetler ────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Malzeme Testi', 'İnşaat Test', 'Analiz',
      'KKD Tedariği', 'Paslanmaz Bakım',
      'Hassas Tartım', 'Sistem Belgelendirme',
      'Ölçüm Cihazları', 'Mali Müşavirlik',
      'Temizlik Ekipmanları', 'Proje Yönetimi',
      'Temiz Oda', 'Elektrik Bakım',
      'Akredite', 'Ekipman'
    );

END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Kontrol — pass5 sonrası kalan kayıtlar
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
