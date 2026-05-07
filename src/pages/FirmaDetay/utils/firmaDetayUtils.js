// Enes Doğanay | 6 Mayıs 2026: Pure utility fonksiyonlar - FirmaDetay sayfası

export const isMissingRelationError = (error) =>
    error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

export const toReminderInputValues = (isoValue) => {
    if (!isoValue) return { date: '', time: '' };
    const date = new Date(isoValue);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const [datePart, timePartWithSeconds] = localDate.toISOString().split('T');
    return { date: datePart, time: (timePartWithSeconds || '').slice(0, 5) };
};

export const formatReminderLabel = (isoValue) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    return `${date.toLocaleDateString('tr-TR')} • ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

export function degerleriDiziyeCevir(rawData) {
    if (!rawData) return [];
    let data = rawData;
    if (typeof rawData === 'string') {
        try { data = JSON.parse(rawData); } catch { return []; }
    }
    if (!Array.isArray(data)) return [];
    const sonuc = [];
    data.forEach((kategori) => {
        if (kategori.ana_kategori) sonuc.push(kategori.ana_kategori);
        if (Array.isArray(kategori.alt_kategoriler)) {
            kategori.alt_kategoriler.forEach((alt) => {
                if (alt.baslik) sonuc.push(alt.baslik);
                if (Array.isArray(alt.urunler)) sonuc.push(...alt.urunler);
            });
        }
    });
    return sonuc;
}

function convertFlatToCategorized(rawData) {
    const items = degerleriDiziyeCevir(rawData);
    if (items.length === 0) return [];
    return [{ ana_kategori: 'Tüm Ürünler', alt_kategoriler: [{ baslik: 'Ürün Listesi', urunler: items }] }];
}

export function parseHiyerarsikKategoriler(rawData) {
    if (!rawData) return [];
    let data = rawData;
    if (typeof rawData === 'string') {
        try { data = JSON.parse(rawData); } catch { return []; }
    }
    if (!Array.isArray(data)) return [];
    if (data.length > 0 && data[0].ana_kategori) return data;
    return convertFlatToCategorized(rawData);
}

export const parseNotePayload = (rawNoteText) => {
    if (!rawNoteText) return { title: '', tag: '', body: '' };
    try {
        const parsed = JSON.parse(rawNoteText);
        if (parsed && typeof parsed === 'object' && 'body' in parsed) {
            return { title: parsed.title || '', tag: parsed.tag || '', body: parsed.body || '' };
        }
    } catch { /* eski düz metin notlar için fallback */ }
    return { title: '', tag: '', body: rawNoteText };
};

export const serializeNotePayload = (title, body) =>
    JSON.stringify({ title: title.trim(), tag: '', body: body.trim() });

export const getNoteGroupLabel = (dateValue) => {
    const noteDate = new Date(dateValue);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const noteStart = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());
    if (noteStart.getTime() === todayStart.getTime()) return 'Bugün';
    if (noteStart.getTime() === yesterdayStart.getTime()) return 'Dün';
    return 'Daha Eski';
};
