-- Enes Doğanay | 23 Mayıs 2026: PASS 4 — Kalan kısa/varyant ana_sektor değerleri
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
      'Metal İşlem', 'Metalurji', 'Metalürji',
      'Çelik Eşya', 'Demir-Çelik ve Metal Sanayi',
      'Metal Kesim', 'Lazer Kesim', 'Sertleştirme',
      'Aşındırıcı', 'Çelik Boru', 'Ağır Sanayi'
    );

  -- ── Makine ve Endüstriyel Ekipmanlar ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Makine ve Endüstriyel Ekipmanlar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Havalandırma', 'Hidrolik Makine', 'Pres',
      'Ticari Soğutma', 'Endüstriyel Soğutma',
      'Filtre', 'Kalıp Teknolojileri', 'Kesici Uç',
      'Isıtıcı', 'Makine Koruma', 'Beyaz Eşya Yan Sanayi'
    );

  -- ── Mekanik Sistemler ve Mühendislik ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Kayış', 'Sızdırmazlık', 'Bant',
      'Pnömatik', 'Mobil Hidrolik', 'Akış Kontrol',
      'Güç İletim', 'Regülasyon', 'Teknik Yay',
      'Vana İmalatı'
    );

  -- ── Endüstriyel Otomasyon Sistemleri ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Sensör', 'Robotik', 'Görüntü İşleme',
      'Pnömatik Otomasyon'
    );

  -- ── Elektrik ve Elektrik Ekipmanları ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Kablo', 'Özel Kablo', 'Enerji Kablosu',
      'Anahtarlama', 'Pano Sistemleri',
      'Asenkron Motor', 'Bobinaj'
    );

  -- ── Enerji ve Güç Sistemleri ─────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Enerji ve Güç Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Enerji Çözümleri', 'Enerji - Elektrik Üretimi',
      'Enerji / Maden', 'Enerji Kalitesi',
      'Güç Kontrol', 'E-Mobilite'
    );

  -- ── Kimya ve Endüstriyel Kimyasallar ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Kimya ve Endüstriyel Kimyasallar'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Performans Kimyasalları'
    );

  -- ── Plastik ve Plastik Üretimi ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Plastik ve Plastik Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Plastik Film', 'Teknik Köpük'
    );

  -- ── Ambalaj ve Paketleme Sistemleri ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Ambalaj ve Paketleme Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Markalama', 'Rulo Etiket', 'Etiket Baskı',
      'Ahşap Ambalaj', 'Esnek Ambalaj (Flexible Packaging)'
    );

  -- ── Boya, Vernik ve Yüzey Kaplama Sistemleri ─────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Boya, Vernik ve Yüzey Kaplama Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Boya', 'Kaplama'
    );

  -- ── Lojistik ve Tedarik Zinciri ───────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Lojistik', 'Raf Sistemleri', 'Forwarding'
    );

  -- ── Tekstil ve Tekstil Üretimi ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Tekstil ve Tekstil Üretimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Ev Tekstili', 'Tekstil ve Kumaş', 'Polyester İplik'
    );

  -- ── Kağıt, Karton ve Baskı Sanayi ────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Kağıt, Karton ve Baskı Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Baskı'
    );

  -- ── İnşaat ve Yapı Malzemeleri ────────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'İnşaat ve Yapı Malzemeleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Hazır Beton', 'Kalıp İskele'
    );

  -- ── Gıda ve Gıda Üretim Teknolojileri ────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Gıda ve Gıda Üretim Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Süt Endüstrisi', 'Kırmızı Et İşleme'
    );

  -- ── Tarım, Hayvancılık ve Tarımsal Teknolojiler ───────────────────────────
  UPDATE firmalar SET ana_sektor = 'Tarım, Hayvancılık ve Tarımsal Teknolojiler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Karma Yem', 'Hububat ve Yem', 'Hazır Fide'
    );

  -- ── Otomotiv ve Otomotiv Yan Sanayi ──────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Otomotiv ve Otomotiv Yan Sanayi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Araç Üstü Ekipman', 'Fren Sistemleri'
    );

  -- ── Güvenlik Sistemleri ve Teknolojileri ─────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Güvenlik Sistemleri ve Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Söndürme', 'Söndürme Cihazları',
      'Koruma Sistemleri', 'Fiziksel Güvenlik',
      'Geçiş Sistemleri'
    );

  -- ── Bilişim, Yazılım ve BT Çözümleri ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Bilişim, Yazılım ve BT Çözümleri'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Sistem Yönetimi'
    );

  -- ── Çevre Teknolojileri ve Atık Yönetimi ─────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Çevre Teknolojileri ve Atık Yönetimi'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Sürdürülebilirlik', 'Toz Tutma'
    );

  -- ── Ahşap, Orman Ürünleri ve Mobilya ─────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Ahşap, Orman Ürünleri ve Mobilya'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Dekorasyon'
    );

  -- ── Hırdavat ve Teknik Malzemeler ────────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Hırdavat ve Teknik Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Teknik Parça', 'İş Bağlama', 'El Aletleri',
      'Teknik Bant'
    );

  -- ── Endüstriyel ve Kurumsal Hizmetler ────────────────────────────────────
  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors)
    AND ana_sektor IN (
      'Laboratuvar Sarf', 'Yönetim Danışmanlığı',
      'Endüstriyel Bakım', 'Kalite Yönetimi',
      'NDT', 'Test Cihazı', 'Eğitim',
      'Endüstriyel Temizlik', 'Hijyen',
      'Uygulama', 'Sistem'
    );

END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Kontrol — pass4 sonrası kalan kayıtlar
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
