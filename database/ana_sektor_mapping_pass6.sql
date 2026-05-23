-- Enes Doğanay | 23 Mayıs 2026: PASS 6 — Son kalan 2'li kayıtlar (final)
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
    'Vakum', 'Makine Otomasyonu', 'Kalıp Parçaları', 'Kalıp İmalatı',
    'Basınçlı Tank', 'Endüstriyel Isıtma', 'Isıtma Elemanı',
    'Sıvı Filtrasyon', 'Chiller', 'Endüstriyel Pompa',
    'Kabin Soğutma', 'Hidrolik Sistem', 'Testere İmalatı',
    'Yüksek Basınç', 'Tartı Aletleri', 'Panel Radyatör'
  );

  UPDATE firmalar SET ana_sektor = 'Metal ve Metal İşleme Sanayi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Çelik Yapı', 'Hafif Çelik Yapı', 'Delikli Sac',
    'Kardan', 'Direnç Kaynağı'
  );

  UPDATE firmalar SET ana_sektor = 'Endüstriyel Otomasyon Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Sistem Entegrasyon', 'Endüstri 4.0', 'Enstrümantasyon',
    'Telematik', 'Terminal'
  );

  UPDATE firmalar SET ana_sektor = 'Elektrik ve Elektrik Ekipmanları'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Elektrik ve Elektronik - Kablo Sanayi', 'Akü',
    'Elektrik Motoru', 'Elektromekanik Sanayi',
    'Teknik Aydınlatma'
  );

  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kavrama', 'Fren ve Kavrama', 'Boru Büküm',
    'Gaz Kontrol'
  );

  UPDATE firmalar SET ana_sektor = 'Hırdavat ve Teknik Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Kaynak Aksesuarı', 'Montaj Ekipmanları',
    'Aksesuar', 'Sarf Malzemesi', 'İşaretleme'
  );

  UPDATE firmalar SET ana_sektor = 'Kimya ve Endüstriyel Kimyasallar'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Endüstriyel Yapıştırıcılar', 'Yüzey Hazırlama',
    'Hammadde Dağıtımı'
  );

  UPDATE firmalar SET ana_sektor = 'Plastik ve Plastik Üretimi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Nonwoven', 'Hijyenik Nonwoven'
  );

  UPDATE firmalar SET ana_sektor = 'Ambalaj ve Paketleme Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Ambalaj ve Etiket', 'Baskılı Esnek Ambalaj',
    'Karton Ambalaj', 'Serigrafi'
  );

  UPDATE firmalar SET ana_sektor = 'Boya, Vernik ve Yüzey Kaplama Sistemleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Fırın Malzemesi'
  );

  UPDATE firmalar SET ana_sektor = 'Lojistik ve Tedarik Zinciri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'İntralojistik', 'Depo Rafı'
  );

  UPDATE firmalar SET ana_sektor = 'İnşaat ve Yapı Malzemeleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Taahhüt', 'Tesis Kurulum',
    'Yol Teknolojileri', 'İnşaat Kimyasalları'
  );

  UPDATE firmalar SET ana_sektor = 'Tekstil ve Tekstil Üretimi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Sentetik İplik ve Kumaş', 'Ayakkabı Yan Sanayi',
    'İplik ve Kumaş', 'Fermuar', 'Nonwoven',
    'Teknik Kumaş', 'Kumaş Hazırlık',
    'Tekstil ve Halı Sanayi', 'Endüstriyel İplik'
  );

  UPDATE firmalar SET ana_sektor = 'Gıda ve Gıda Üretim Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Gıda Katkıları', 'Gıda Aroması',
    'Kuruyemiş İşleme', 'Endüstriyel Mutfak'
  );

  UPDATE firmalar SET ana_sektor = 'Tarım, Hayvancılık ve Tarımsal Teknolojiler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Ekim Makineleri', 'Sebze Islahı', 'Fidecilik'
  );

  UPDATE firmalar SET ana_sektor = 'Otomotiv ve Otomotiv Yan Sanayi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Lastik Üretimi', 'Beyaz Eşya Üretimi'
  );

  UPDATE firmalar SET ana_sektor = 'Medikal ve Sağlık Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Sağlık Ürünleri', 'Tanı Sistemleri', 'Beşeri İlaç',
    'Veteriner Sağlık'
  );

  UPDATE firmalar SET ana_sektor = 'Bilişim, Yazılım ve BT Çözümleri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Üretim Yazılımı'
  );

  UPDATE firmalar SET ana_sektor = 'Güvenlik Sistemleri ve Teknolojileri'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Yangın Ekipmanları', 'Söndürme Sistemleri',
    'Güvenlik', 'Elektronik Güvenlik'
  );

  UPDATE firmalar SET ana_sektor = 'Seramik, Porselen ve Refrakter Malzemeler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Seramik ve Vitrifiye'
  );

  UPDATE firmalar SET ana_sektor = 'Ahşap, Orman Ürünleri ve Mobilya'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Endüstriyel Ahşap', 'Teknik Mobilya',
    'Endüstriyel Mobilya', 'Ahşap Palet', 'Ofis ve Arşiv'
  );

  UPDATE firmalar SET ana_sektor = 'Kağıt, Karton ve Baskı Sanayi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Duvar Kağıdı'
  );

  UPDATE firmalar SET ana_sektor = 'Çevre Teknolojileri ve Atık Yönetimi'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Arıtma', 'Hurda'
  );

  UPDATE firmalar SET ana_sektor = 'İlaç, Eczacılık ve Biyoteknoloji'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Makyaj Ürünleri'
  );

  -- ── Endüstriyel ve Kurumsal Hizmetler (en sona) ──────────────────────────
  UPDATE firmalar SET ana_sektor = 'Endüstriyel ve Kurumsal Hizmetler'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Profesyonel Temizlik', 'Tesis Kurulum', 'KKD',
    'Endüstriyel Hijyen', 'Bakım', 'Değerleme',
    'Proses', 'Sistem Entegrasyon'
  );

  -- ── Makine → Boru (genel boru ürünleri → Mekanik) ────────────────────────
  UPDATE firmalar SET ana_sektor = 'Mekanik Sistemler ve Mühendislik'
  WHERE ana_sektor != ALL(valid_sektors) AND ana_sektor IN (
    'Boru'
  );

END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Son kontrol — artık 1'li kayıtlar kalıyorsa NULL'a çekebilirsin:
-- UPDATE firmalar SET ana_sektor = NULL
-- WHERE (is_demo = false OR is_demo IS NULL)
--   AND ana_sektor IS NOT NULL
--   AND ana_sektor != ALL(ARRAY[...32 sektör...]);
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
