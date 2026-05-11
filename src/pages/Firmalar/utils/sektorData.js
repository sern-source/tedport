// Enes Doğanay | 11 Mayıs 2026: Sektör statik verisi — SEKTORLER listesi + akıllı keyword çıkarma

/* ── Suffix kümesi ──────────────────────────────────────────────────────
   Sektör adını parçalara böldükten sonra bu kelimeler çekirdek terimi
   bulmak için ayıklanır. Örnek: "Basınçlı Kaplar, Kazan ve Eşanjör Sistemleri"
   → ["Basınçlı Kaplar", "Kazan", "Eşanjör"] (Sistemleri ayıklandı) ─────── */
const SUFFIX_SET = new Set([
  'Sistemleri', 'Teknolojileri', 'Hizmetleri', 'Ürünleri', 'Ürünler',
  'Çözümleri', 'Malzemeleri', 'Sanayi', 'Üretimi',
  'Ekipmanları', 'Parçaları', 'Yazılımları',
]);

/* ── Override map ───────────────────────────────────────────────────────
   Otomatik çıkarımın yetersiz kaldığı durumlar:
   kısaltmalar (ERP, MRO, RFID…) ve DB uyum gerektiren eski kısa değerler ─── */
// Enes Doğanay | 11 Mayıs 2026: Kısaltma veya DB uyum override'ları (hem Sektör hem Kategori filtresi için)
const KEYWORD_OVERRIDES = {
  // Kategori spesifik override'ları — DB category_name eşleşmesi
  'ADR Ambalaj ve Tehlikeli Madde Lojistiği':           ['ADR', 'Tehlikeli Madde', 'Lojistik'],
  'AG Şalt Malzemeleri ve Enerji Dağıtım Sistemleri':  ['AG Şalt', 'AG', 'Enerji Dağıtım'],
  'Ar-Ge, Prototipleme ve Ürün Geliştirme Hizmetleri': ['Ar-Ge', 'Prototip', 'Ürün Geliştirme'],
  'Bakım Yönetim Yazılımları ve CMMS Sistemleri':       ['CMMS', 'Bakım Yönetim'],
  'Bakım, Onarım ve MRO Hizmetleri':                   ['MRO', 'Bakım', 'Onarım'],
  'Barkod, RFID ve İzlenebilirlik Teknolojileri':      ['Barkod', 'RFID', 'İzlenebilirlik'],
  'Depo Otomasyonu ve WMS Yazılımları':                ['WMS', 'Depo Otomasyonu', 'Depo'],
  'ERP, MRP ve Üretim Yönetim Yazılımları':            ['ERP', 'MRP', 'Üretim Yönetim'],
  'ESD Ürünleri ve Antistatik Sistemler':              ['ESD', 'Antistatik'],
  'İş Güvenliği (İSG) ve OSGB Hizmetleri':            ['İSG', 'OSGB', 'İş Güvenliği'],
  'İş Makineleri ve Endüstriyel Ekipmanlar':           ['İş Makineleri', 'Makine'],
  // Geniş sektör override'ları — DB ana_sektor eşleşmesi
  'Bilişim, Yazılım ve BT Çözümleri':                  ['Bilişim', 'Yazılım', 'BT'],
  'Güvenlik Sistemleri ve Teknolojileri':              ['Güvenlik', 'Güvenlik Sistemleri'],
  'Endüstriyel Otomasyon Sistemleri':                  ['Otomasyon', 'Endüstriyel Otomasyon'],
  'Endüstriyel ve Kurumsal Hizmetler':                 ['Endüstriyel', 'Kurumsal', 'Hizmet'],
};

/* ── Keyword extraction ─────────────────────────────────────────────────
   1. Override map'e bak — varsa döndür
   2. " ve " ve "," ile böl
   3. Her parçadan SUFFIX_SET kelimelerini ayıkla
   4. Max 3 keyword döndür                                                ─── */
// Enes Doğanay | 11 Mayıs 2026: Sektör adından DB arama keyword'leri türetir
export const getSektorKeywords = (sectorName) => {
  if (KEYWORD_OVERRIDES[sectorName]) return KEYWORD_OVERRIDES[sectorName];
  const parts = sectorName.split(/\s*,\s*|\s+ve\s+/i);
  const keywords = parts
    .map(part => {
      const words = part.trim().split(/\s+/).filter(w => !SUFFIX_SET.has(w));
      return words.join(' ').trim();
    })
    .filter(kw => kw.length > 1)
    .slice(0, 3);
  return keywords.length > 0 ? keywords : [sectorName.split(' ')[0]];
};

// Enes Doğanay | 11 Mayıs 2026: 20 geniş ana sektör — DB ana_sektor alanıyla eşleşir
export const SEKTORLER = [
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
];
