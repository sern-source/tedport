// Enes Doğanay | 6 Mayıs 2026: İhale yönetimi sabitleri ve saf yardımcı fonksiyonlar

/* ─── Para Formatlama ─── */
export const formatMoney = (amount, currency = 'TRY') => {
    if (amount == null || amount === '') return '—';
    const num = Number(amount);
    if (isNaN(num)) return String(amount);
    const localeMap = { TRY: 'tr-TR', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB' };
    const locale = localeMap[currency] || 'tr-TR';
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
    } catch {
        return `${num.toLocaleString()} ${currency}`;
    }
};

export const getOfferGroupedTotals = (offer) => {
    const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];
    const groups = {};
    kalemler.forEach(k => {
        const c = k.para_birimi || offer.para_birimi || 'TRY';
        groups[c] = (groups[c] || 0) + ((Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0));
    });
    return groups;
};

export const renderOfferAmount = (offer) => {
    const groups = getOfferGroupedTotals(offer);
    const entries = Object.entries(groups).filter(([, v]) => v > 0);
    if (entries.length > 0) return entries.map(([c, v]) => formatMoney(v, c)).join(' + ');
    if (offer.toplam_tutar) return formatMoney(offer.toplam_tutar, offer.para_birimi || 'TRY');
    return '—';
};

/* ─── Tarih Formatlama ─── */
export const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return '—'; }
};

export const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).setHours(23, 59, 59) - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const timeAgo = (iso) => {
    if (!iso) return '';
    const secs = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (secs < 60) return 'Az önce';
    if (secs < 3600) return `${Math.floor(secs / 60)} dk önce`;
    if (secs < 86400) return `${Math.floor(secs / 3600)} sa önce`;
    return `${Math.floor(secs / 86400)} gün önce`;
};

export const toDateInput = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
};

/* ─── Durum Haritaları ─── */
export const TENDER_STATUS = {
    canli: { label: 'Canlı', tone: 'active', icon: 'radio_button_checked' },
    active: { label: 'Canlı', tone: 'active', icon: 'radio_button_checked' },
    taslak: { label: 'Taslak', tone: 'draft', icon: 'edit_note' },
    draft: { label: 'Taslak', tone: 'draft', icon: 'edit_note' },
    kapali: { label: 'Kapandı', tone: 'closed', icon: 'lock' },
    closed: { label: 'Kapandı', tone: 'closed', icon: 'lock' },
    completed: { label: 'Tamamlandı', tone: 'closed', icon: 'check_circle' },
    cancelled: { label: 'İptal', tone: 'cancelled', icon: 'cancel' },
    iptal: { label: 'İptal', tone: 'cancelled', icon: 'cancel' },
};
export const getTenderStatus = (v) => TENDER_STATUS[String(v || '').toLowerCase()] || { label: v || 'Bilinmiyor', tone: 'draft', icon: 'help' };

export const OFFER_STATUS = {
    gonderildi: { label: 'Değerlendiriliyor', tone: 'review',    icon: 'hourglass_top' },
    kabul:      { label: 'Kabul Edildi',       tone: 'accepted',  icon: 'check_circle' },
    red:        { label: 'Reddedildi',         tone: 'rejected',  icon: 'cancel' },
    taslak:     { label: 'Taslak',             tone: 'draft',     icon: 'edit_note' },
};
export const getOfferStatus = (v) => OFFER_STATUS[String(v || '').toLowerCase()] || { label: v || 'Bilinmiyor', tone: 'pending', icon: 'help' };

/* ─── Puanlama ─── */
export const calculateOfferScore = (offer, allOffers, weights) => {
    const prices = allOffers.map(o => Number(o.toplam_tutar || 0)).filter(v => v > 0);
    const deliveries = allOffers.map(o => Number(o.teslim_suresi_gun || 0)).filter(v => v > 0);
    const price = Number(offer.toplam_tutar || 0);
    const delivery = Number(offer.teslim_suresi_gun || 0);
    const minP = Math.min(...prices, price || Infinity);
    const maxP = Math.max(...prices, price || 0);
    const minD = Math.min(...deliveries, delivery || Infinity);
    const maxD = Math.max(...deliveries, delivery || 0);
    // Enes Doğanay | 7 Mayıs 2026: Orantılı puanlama — en iyi 100, diğerleri orantılı
    // (maxP - price) / (maxP - minP) formülü 2 teklifte 100/0 veriyordu; minP/price daha adil
    const priceScore = !price ? 0 : minP === maxP ? 100 : Math.min(100, (minP / price) * 100);
    const deliveryScore = !delivery ? 15 : minD === maxD ? 100 : Math.min(100, (minD / delivery) * 100);
    const wP = Number(weights.price || 0);
    const wD = Number(weights.delivery || 0);
    const total = wP + wD || 1;
    return {
        overall: Math.round((priceScore * wP + deliveryScore * wD) / total),
        price: Math.round(priceScore),
        delivery: Math.round(deliveryScore),
    };
};

/* ─── Sayfalama ─── */
export const TOM_PAGE_SIZE = 10;

/* ─── Stepper Etiketleri ─── */
export const STEPPER_LABELS = [
    { key: 'temel', label: 'Temel Bilgiler', icon: 'edit_note' },
    { key: 'detay', label: 'İhale Detayları', icon: 'tune' },
    { key: 'sartlar', label: 'Teknik Şartlar', icon: 'checklist' },
    { key: 'onizleme', label: 'Önizleme', icon: 'preview' },
];

/* ─── Boş Form ─── */
export const CREATE_EMPTY_FORM = {
    baslik: '', aciklama: '', ihale_tipi: 'Açık İhale', kdv_durumu: 'haric',
    yayin_tarihi: '', son_basvuru_tarihi: '', teslim_suresi: '', durum: 'canli',
    referans_no: '', teslim_il: '', teslim_ilce: '',
    gereksinimler: [], davet_emailleri: [], davetli_firmalar: [], ek_dosyalar: [],
};
