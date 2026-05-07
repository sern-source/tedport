// Enes Doğanay | 6 Mayıs 2026: SSS (FAQ) sayfası hook
import { useState, useEffect, useMemo } from 'react';
import { fetchFAQ } from '../services/sssService';

// Enes Doğanay | 6 Mayıs 2026: Kategori sıralama sabiti
const CATEGORY_ORDER = [
  'Platform Genel',
  'Kayıt ve Üyelik',
  'Kurumsal Başvuru',
  'Giriş ve Şifre',
  'İhale Yönetimi',
  'Teklif Verme',
  'Firma Rehberi',
  'Profil ve Hesap',
  'Bildirimler',
  'Fiyatlandırma',
  'Teknik',
  'Favoriler',
  'Teklif Talebi',
  'Gizlilik ve KVKK',
  'Destek ve İletişim',
];

// Enes Doğanay | 6 Mayıs 2026: HTML tag'lerini temizler
function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '');
}

// Enes Doğanay | 6 Mayıs 2026: SSS state + filtre + gruplama mantığı
export const useSSS = () => {
  const [qaList, setQaList]         = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [activeCategory, setActive] = useState('Tümü');
  const [openId, setOpenId]         = useState(null);
  const [search, setSearch]         = useState('');

  // Enes Doğanay | 6 Mayıs 2026: FAQ verisini yükle
  useEffect(() => {
    fetchFAQ()
      .then(data => setQaList(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Enes Doğanay | 6 Mayıs 2026: Sıralı kategori listesi
  const categories = useMemo(() => {
    const cats = [...new Set(qaList.map(q => q.category).filter(Boolean))];
    return cats.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b, 'tr');
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [qaList]);

  // Enes Doğanay | 6 Mayıs 2026: Filtrelenmiş sorular
  const filtered = useMemo(() => {
    let list = qaList.filter(q => q.question);
    if (activeCategory !== 'Tümü') list = list.filter(q => q.category === activeCategory);
    if (search.trim().length >= 2) {
      const lower = search.toLocaleLowerCase('tr');
      list = list.filter(q =>
        q.question?.toLocaleLowerCase('tr').includes(lower) ||
        stripHtml(q.answer).toLocaleLowerCase('tr').includes(lower)
      );
    }
    return list;
  }, [qaList, activeCategory, search]);

  // Enes Doğanay | 6 Mayıs 2026: Kategoriye göre gruplandırılmış sorular
  const grouped = useMemo(() => {
    const isSearching = search.trim().length >= 2;
    if (activeCategory !== 'Tümü' || isSearching) {
      const label = isSearching ? 'Arama Sonuçları' : activeCategory;
      return [{ cat: label, items: filtered }];
    }
    const map = {};
    filtered.forEach(q => {
      const cat = q.category || 'Diğer';
      if (!map[cat]) map[cat] = [];
      map[cat].push(q);
    });
    return CATEGORY_ORDER
      .filter(cat => map[cat]?.length)
      .map(cat => ({ cat, items: map[cat] }));
  }, [filtered, activeCategory, search]);

  // Enes Doğanay | 6 Mayıs 2026: JSON-LD FAQPage schema
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qaList
      .filter(q => q.question && q.answer)
      .map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: stripHtml(q.answer) },
      })),
  }), [qaList]);

  const totalCount = qaList.filter(q => q.question).length;

  // Enes Doğanay | 6 Mayıs 2026: Kategori değişim handler
  const handleCategoryChange = (cat) => {
    setActive(cat);
    setSearch('');
    setOpenId(null);
  };

  // Enes Doğanay | 6 Mayıs 2026: Arama değişim handler
  const handleSearchChange = (value) => {
    setSearch(value);
    setActive('Tümü');
  };

  // Enes Doğanay | 6 Mayıs 2026: Aramayı sıfırla handler
  const handleReset = () => {
    setSearch('');
    setActive('Tümü');
  };

  return {
    isLoading,
    categories,
    filtered,
    grouped,
    jsonLd,
    totalCount,
    activeCategory,
    openId,
    search,
    setOpenId,
    handleCategoryChange,
    handleSearchChange,
    handleReset,
  };
};
