// Enes Doğanay | 5 Mayıs 2026: Ihaleler sayfasına ait paylaşılan yardımcı sabitler ve fonksiyonlar
import { getCurrencySymbol } from './constants/currencies';

export const TENDERS_PAGE_SIZE = 12;

// Enes Doğanay | 5 Mayıs 2026: Form sabiti IhalelerUtils'e taşındı — hook ve sayfada ortak kullanım
// Enes Doğanay | 10 Nisan 2026: Kategori, bütçe notu kaldırıldı; kdv, teslim il/ilçe, gereksinimler, davet emailleri, davetli firmalar eklendi
// Enes Doğanay | 10 Nisan 2026: Stepper form yapısına geçildi, teslim_suresi eklendi
export const EMPTY_FORM = {
    baslik: '', aciklama: '', ihale_tipi: 'Açık İhale',
    kdv_durumu: 'haric',
    yayin_tarihi: '', son_basvuru_tarihi: '',
    teslim_suresi: '',
    durum: 'canli',
    referans_no: '',
    teslim_il: '', teslim_ilce: '',
    // Enes Doğanay | 12 Mayıs 2026: Sektör — isteğe bağlı, landing page SEO için
    sektor: '',
    gereksinimler: [],       // [{id, madde, aciklama}]
    davet_emailleri: [],     // string[]
    davetli_firmalar: [],    // [{firma_id, firma_adi, onayli}]
    ek_dosyalar: [],         // File[]
    // Enes Doğanay | 2 Mayıs 2026: Anonim ihale — firma adı gizlenir
    anonim: false,
    // Enes Doğanay | 3 Haziran 2026: Akıllı puanlama ağırlıkları — fiyat/teslim dengesi
    puanlama_agirliklar: { price: 50, delivery: 50 },
};

// Enes Doğanay | 10 Nisan 2026: Stepper adım tanımları
export const STEPPER_LABELS = [
    { key: 'temel', label: 'Temel Bilgiler', icon: 'edit_note' },
    { key: 'detay', label: 'İhale Detayları', icon: 'tune' },
    { key: 'sartlar', label: 'Teknik Şartlar', icon: 'checklist' },
    { key: 'onizleme', label: 'Önizleme', icon: 'preview' },
];

// Enes Doğanay | 6 Nisan 2026: DB'den gelen tarih ISO formatında olabilir, <input type="date"> için YYYY-MM-DD'ye çevir
export const toDateInput = (v) => {
    if (!v) return '';
    const s = String(v);
    if (s.includes('T')) return s.split('T')[0];
    return s.length >= 10 ? s.slice(0, 10) : s;
};

// Enes Doğanay | 10 Nisan 2026: Kalem toplamı hesapla
export const getKalemToplam = (kalem) => {
    const birim = parseFloat(kalem.birim_fiyat) || 0;
    const miktar = parseFloat(kalem.miktar) || 0;
    return birim * miktar;
};

// Enes Doğanay | 10 Nisan 2026: Para birimi formatla
// Enes Doğanay | 14 Nisan 2026: Tüm para birimlerini destekleyecek şekilde güncellendi
export const formatCurrency = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol} ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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
