-- Enes Doğanay | 23 Mayıs 2026: PASS 7 — Final pass + kalan her şeyi NULL
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

  UPDATE firmalar SET ana_sektor = 'Makine ve Endüstriyel Ekipmanlar'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Isı Değiştirici', 'Ambalaj Makineleri', 'Kaldırma Sistemleri',
    'Kabin İmalatı', 'Kimya Makinesi', 'Takım Tutucu',
    'Asansör Makine Motoru', 'Yağlama Cihazları', 'Baskül',
    'Hava'
  );

  UPDATE firmalar SET ana_sektor = 'Metal ve Metal İşleme Sanayi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Metal İmalat', 'Metalurji / Ağır Sanayi', 'Ağır Sanayi / Metalurji',
    'Paslanmaz Tesisat', 'Profil İşleme', 'Profil Sistemleri', 'Profil',
    'Alüminyum Profil Üretimi', 'Metal Aksesuar',
    'Tel Örgü', 'Taşlama', 'Diş Açma', 'İşleme', 'Delikli Sac'
  );

  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kontrol Cihazı', 'Simülasyon', 'Ölçüm Sistemleri'
  );

  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kabinet', 'Elektrik Test', 'Elektrikli Isıtma',
    'Aydınlatma', 'Güç Kalitesi', 'Enerji Ekipmanı'
  );

  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Gazlı Amortisör', 'Boru Hatları', 'Fittings',
    'Mekanik Salmastra', 'Manşon'
  );

  UPDATE firmalar SET ana_sektor = 'Hırdavat ve Teknik Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Bağlama Elemanları', 'Testere'
  );

  UPDATE firmalar SET ana_sektor = 'Kimya ve Endüstriyel Kimyasallar'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Özel Kimyasallar', 'Teknik Kimyasallar',
    'Ayakkabı ve Deri Yapıştırıcıları', 'Madeni Yağ Üretimi'
  );

  UPDATE firmalar SET ana_sektor = 'Plastik ve Plastik Üretimi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kauçuk Profil', 'PET Şişirme', 'Kauçuk Pres'
  );

  UPDATE firmalar SET ana_sektor = 'Ambalaj ve Paketleme Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Plastik Ambalaj', 'Endüstriyel Ambalaj', 'Oluklu Mukavva'
  );

  UPDATE firmalar SET ana_sektor = 'Boya, Vernik ve Yüzey Kaplama Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Yüzey Hazırlık', 'Boya Tesisi'
  );

  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Depo Ekipmanı', 'Raf'
  );

  UPDATE firmalar SET ana_sektor = 'İnşaat ve Yapı Malzemeleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Duvar Kaplamaları', 'Teknik Zemin', 'Yeşil Bina'
  );

  UPDATE firmalar SET ana_sektor = 'Tekstil ve Tekstil Üretimi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Baskılı Kumaş', 'Fermuar Sistemleri', 'Fantezi İplik',
    'İş Elbiseleri', 'Halı Sanayi', 'Fantezi Kumaş',
    'Düğme İmalatı', 'Filtre Bezi', 'Büyükbaş Deri İşleme',
    'Sinyalizasyon'
  );

  UPDATE firmalar SET ana_sektor = 'Gıda ve Gıda Üretim Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Gıda / Bitkisel Yağlar', 'Gıda ve Yem Sanayi',
    'Gıda Proses', 'Gıda ve Kuruyemiş', 'Süt Teknolojileri'
  );

  UPDATE firmalar SET ana_sektor = 'Tarım, Hayvancılık ve Tarımsal Teknolojiler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Traktör İmalatı'
  );

  UPDATE firmalar SET ana_sektor = 'Otomotiv ve Otomotiv Yan Sanayi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Motor Aksamı', 'Motor Servisi'
  );

  UPDATE firmalar SET ana_sektor = 'Medikal ve Sağlık Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Hastane Mobilyaları', 'Çevre Sağlığı'
  );

  UPDATE firmalar SET ana_sektor = 'Bilişim, Yazılım ve BT Çözümleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Güvenlik Yazılımı', 'Akıllı Ev', 'Dijital Üretim',
    'Kurumsal Yazılım'
  );

  UPDATE firmalar SET ana_sektor = 'Güvenlik Sistemleri ve Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Sinyalizasyon', 'Gözetim', 'Trafik Güvenliği',
    'Koruma', 'Yangın Güvenliği'
  );

  UPDATE firmalar SET ana_sektor = 'Ahşap, Orman Ürünleri ve Mobilya'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Tasarım Mobilya'
  );

  UPDATE firmalar SET ana_sektor = 'Kağıt, Karton ve Baskı Sanayi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Endüstriyel Baskı'
  );

  UPDATE firmalar SET ana_sektor = 'Madencilik ve Mineral İşleme'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Doğal Taş İşleme'
  );

  UPDATE firmalar SET ana_sektor = 'Denizcilik, Gemi ve Su Araçları'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Liman Hizmetleri'
  );

  UPDATE firmalar SET ana_sektor = 'İlaç, Eczacılık ve Biyoteknoloji'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kişisel Bakım'
  );

  UPDATE firmalar SET ana_sektor = 'Çevre Teknolojileri ve Atık Yönetimi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Su Şartlandırma'
  );

  UPDATE firmalar SET ana_sektor = 'Elektronik ve Elektronik Üretim'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Elektronik İmalat'
  );

  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kalite Güvence', 'Kalite', 'Ölçüm', 'Hassas Ölçüm',
    'Ürün Güvenliği', 'CE Belgelendirme', 'Hukuk', 'Akademi',
    'Bölgesel Hizmet'
  );

  -- ── FINAL: Hâlâ eşleşmeyen her şeyi NULL yap ─────────────────────────────
  -- (demo olmayan firmalar, geçerli sektör listesinde olmayan, boş olmayan)
  UPDATE firmalar
  SET ana_sektor = NULL
  WHERE (is_demo = false OR is_demo IS NULL)
    AND ana_sektor IS NOT NULL
    AND ana_sektor <> ''
    AND ana_sektor != ALL(valid_sektors);

END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Doğrulama — artık 0 satır gelmeli:
-- ─────────────────────────────────────────────────────────────────────────────
/*
SELECT ana_sektor, COUNT(*) AS kalan_firma
FROM firmalar
WHERE (is_demo = false OR is_demo IS NULL)
  AND ana_sektor IS NOT NULL AND ana_sektor <> ''
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
GROUP BY ana_sektor ORDER BY kalan_firma DESC;
*/
