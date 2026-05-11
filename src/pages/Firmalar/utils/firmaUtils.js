// Enes Doğanay | 6 Mayıs 2026: Firmalar sayfası yardımcı sabitler ve saf fonksiyonlar
import { TURKEY_DISTRICTS } from '../../../constants/turkeyDistricts';
// Enes Doğanay | 11 Mayıs 2026: Sektör verisi ayrı dosyaya taşındı — firmaUtils saf fonksiyonlara odaklanır
export { SEKTORLER, getSektorKeywords } from './sektorData';

export const ISTANBUL_AVRUPA = [
  'Arnavutköy', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir',
  'Bayrampaşa', 'Beşiktaş', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca',
  'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören',
  'Kağıthane', 'Küçükçekmece', 'Sarıyer', 'Silivri', 'Sultangazi', 'Şişli', 'Zeytinburnu'
];

export const ISTANBUL_ANADOLU = [
  'Adalar', 'Ataşehir', 'Beykoz', 'Çekmeköy', 'Kadıköy', 'Kartal',
  'Maltepe', 'Pendik', 'Sancaktepe', 'Sultanbeyli', 'Şile', 'Tuzla', 'Ümraniye', 'Üsküdar'
];

const CITY_SET = new Set(Object.keys(TURKEY_DISTRICTS));

// Enes Doğanay | 6 Mayıs 2026: "İlçe, İl" formatına normalize et
export const formatLocation = (raw) => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s*[/,-]\s*/).filter(Boolean);
  if (parts.length === 1) return trimmed;
  let cityPart = null;
  const districtParts = [];
  for (const p of parts) {
    if (CITY_SET.has(p) && !cityPart) cityPart = p;
    else districtParts.push(p);
  }
  if (!cityPart) return parts.join(', ');
  if (districtParts.length === 0) return cityPart;
  return `${districtParts.join(', ')}, ${cityPart}`;
};

// Enes Doğanay | 6 Mayıs 2026: ilike özel karakterlerini escape et
export const sanitizeSearch = (input) => input.replace(/[\\"%#_]/g, '').trim();

// Enes Doğanay | 6 Mayıs 2026: urun_kategorileri JSON'dan ana_kategori listesi çıkar
export const degerleriDiziyeCevir = (rawData) => {
  if (!rawData) return [];
  let data = rawData;
  if (typeof rawData === 'string') {
    try { data = JSON.parse(rawData); } catch { return []; }
  }
  if (!Array.isArray(data)) return [];
  return data.flatMap(k => (k.ana_kategori ? [k.ana_kategori] : []));
};

// Enes Doğanay | 6 Mayıs 2026: Akıllı sayfa numaraları (ellipsis ile)
export const getSmartPages = (current, total) => {
  const delta = 2;
  const pages = [];
  let last = null;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      if (last && i - last > 1) pages.push('...');
      pages.push(i);
      last = i;
    }
  }
  return pages;
};
