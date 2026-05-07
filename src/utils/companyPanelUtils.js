// Enes Doğanay | 6 Mayıs 2026: CompanyManagementPanel için saf yardımcı fonksiyonlar ve sabitler
import { TURKEY_DISTRICTS } from '../constants/turkeyDistricts';

// Enes Doğanay | 6 Mayıs 2026: Benzersiz geçici ID üretici
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Enes Doğanay | 6 Mayıs 2026: DB'den gelen katalog JSON'ını editör yapısına çevirir
export const parseCatalog = (raw) => {
    if (!raw) return [];
    let p = raw;
    if (typeof raw === 'string') { try { p = JSON.parse(raw); } catch { return []; } }
    if (!Array.isArray(p)) return [];
    return p.map(cat => ({
        id: uid(),
        name: cat?.ana_kategori || '',
        subs: (Array.isArray(cat?.alt_kategoriler) ? cat.alt_kategoriler : []).map(sub => ({
            id: uid(),
            name: sub?.baslik || '',
            products: (Array.isArray(sub?.urunler) ? sub.urunler : []).map(u => ({ id: uid(), name: String(u || '') }))
        }))
    }));
};

// Enes Doğanay | 6 Mayıs 2026: Editör yapısını DB formatına geri çevirir
export const serializeCatalog = (cats) =>
    cats
        .filter(c => c.name.trim() || c.subs.some(s => s.name.trim()))
        .map(c => ({
            ana_kategori: c.name.trim(),
            alt_kategoriler: c.subs
                .filter(s => s.name.trim() || s.products.some(p => p.name.trim()))
                .map(s => ({
                    baslik: s.name.trim(),
                    urunler: s.products.map(p => p.name.trim()).filter(Boolean)
                }))
        }));

// Enes Doğanay | 6 Mayıs 2026: "ilçe/il" formatını {city, district} objesine çevirir
export const parseLocation = (val) => {
    const s = String(val || '').trim();
    if (!s) return { city: '', district: '' };
    if (s.includes('/')) { const [d, c] = s.split('/').map(x => x.trim()); return { district: d, city: c }; }
    if (s.includes(',')) { const [d, c] = s.split(',').map(x => x.trim()); return { district: d, city: c }; }
    return { city: s, district: '' };
};

// Enes Doğanay | 6 Mayıs 2026: {city, district} objesini "ilçe/il" formatına çevirir
export const buildLocation = ({ city, district }) => {
    const c = String(city || '').trim();
    const d = String(district || '').trim();
    return (d && c) ? `${d}/${c}` : (c || d);
};

// Enes Doğanay | 6 Mayıs 2026: Katalog dizisinde belirli bir kategoriyi günceller (immutable)
export const mapCat = (cats, cid, fn) => cats.map(c => c.id === cid ? fn(c) : c);

// Enes Doğanay | 6 Mayıs 2026: Katalog dizisinde belirli bir alt kategoriyi günceller (immutable)
export const mapSub = (cats, cid, sid, fn) =>
    mapCat(cats, cid, c => ({ ...c, subs: c.subs.map(s => s.id === sid ? fn(s) : s) }));

// Enes Doğanay | 6 Mayıs 2026: İstanbul/Ankara/Kocaeli önde, geri kalanı alfabetik il listesi
const PRIORITY_CITIES = ['İstanbul', 'Ankara', 'Kocaeli'];
const allCityKeys = Object.keys(TURKEY_DISTRICTS);
export const ALL_CITIES = [
    ...PRIORITY_CITIES.filter(c => allCityKeys.includes(c)),
    ...allCityKeys.filter(c => !PRIORITY_CITIES.includes(c)).sort((a, b) => a.localeCompare(b, 'tr'))
];
