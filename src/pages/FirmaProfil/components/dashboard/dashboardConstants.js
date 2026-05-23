// Enes Doğanay | 23 Mayıs 2026: Dashboard bileşenleri için ortak sabitler ve yardımcı fonksiyonlar

export const CURRENCY_SYMBOL = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };

// Enes Doğanay | 23 Mayıs 2026: Türkçe para birimi formatı
export const formatMoney = (n, c = 'TRY') => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '—';
    return `${CURRENCY_SYMBOL[c] || c} ${num.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
};

export const DAY_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const MONTHS_TR_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export const shortDay = (dateStr) => DAY_TR[new Date(dateStr).getDay()];

// Enes Doğanay | 23 Mayıs 2026: İhale durumu — etiket + CSS sınıfı
export const TENDER_DURUM = {
    canli:      { label: 'Canlı',      cls: 'canli' },
    yaklasan:   { label: 'Yaklaşan',   cls: 'yaklasan' },
    kapali:     { label: 'Kapandı',    cls: 'kapali' },
    tamamlandi: { label: 'Tamamlandı', cls: 'tamamlandi' },
    draft:      { label: 'Taslak',     cls: 'draft' },
};

// Enes Doğanay | 23 Mayıs 2026: Tarih aralığı preset seçenekleri
export const PRESETS = [
    { days: 30, label: '30 Gün' },
    { days: 60, label: '60 Gün' },
    { days: 90, label: '90 Gün' },
];

export const fmtCustomLabel = (dateRange) => {
    if (dateRange.type !== 'custom') return 'Özel Aralık';
    const fmt = (s) => {
        const d = new Date(s);
        return `${d.getDate()} ${MONTHS_TR_SHORT[d.getMonth()]}`;
    };
    return `${fmt(dateRange.start)} — ${fmt(dateRange.end)}`;
};
