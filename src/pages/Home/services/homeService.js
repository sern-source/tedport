// Enes Doğanay | 6 Mayıs 2026: Home sayfası Supabase servisleri
import { supabase } from '../../../supabaseClient';
import { expandSearchTerms } from '../../../constants/synonyms';
// Enes Doğanay | 23 Mayıs 2026: "İlçe, İl" formatı — Firmalar sayfasıyla aynı
import { formatLocation } from '../../Firmalar/utils/firmaUtils';

// Enes Doğanay | 6 Mayıs 2026: Canlı firma önerileri — hero arama
export async function fetchHeroSuggestions(term) {
    const safe = term.replace(/[\\"%#_]/g, '').trim();
    if (safe.length < 2) return [];

    const { data, error } = await supabase
        .from('firmalar')
        // Enes Doğanay | 23 Mayıs 2026: has_logo + onayli_hesap eklendi — sıralama önceliği
        .select('firmaID, slug, firma_adi, il_ilce, logo_url, has_logo, onayli_hesap, best')
        .or(
            expandSearchTerms(safe).flatMap(t => [
                `firma_adi.ilike."%${t}%"`,
                `ana_sektor.ilike."%${t}%"`,
                `urun_kategorileri.ilike."%${t}%"`,
                `arama_etiketleri.ilike."%${t}%"`,
            ]).join(',')
        )
        .order('has_logo',     { ascending: false, nullsFirst: false })
        .order('onayli_hesap', { ascending: false, nullsFirst: false })
        .order('best',         { ascending: false })
        .limit(10);

    if (error) throw new Error(error.message);
    const lower = safe.toLowerCase();
    // Enes Doğanay | 23 Mayıs 2026: Client sıralama — onaylı → logolu → best → metin eşleşme
    return (data || [])
        .sort((a, b) => {
            if ((b.onayli_hesap ? 1 : 0) !== (a.onayli_hesap ? 1 : 0)) return (b.onayli_hesap ? 1 : 0) - (a.onayli_hesap ? 1 : 0);
            if ((b.has_logo ? 1 : 0) !== (a.has_logo ? 1 : 0)) return (b.has_logo ? 1 : 0) - (a.has_logo ? 1 : 0);
            if ((b.best ? 1 : 0) !== (a.best ? 1 : 0)) return (b.best ? 1 : 0) - (a.best ? 1 : 0);
            const aName = (a.firma_adi || '').toLowerCase();
            const bName = (b.firma_adi || '').toLowerCase();
            const sc = n => (n === lower ? 3 : n.startsWith(lower) ? 2 : n.includes(lower) ? 1 : 0);
            return sc(bName) - sc(aName);
        })
        .slice(0, 6)
        .map(f => ({
            id: f.firmaID,
            slug: f.slug,
            name: f.firma_adi,
            location: formatLocation(f.il_ilce),
            logo: f.logo_url?.includes('firma-logolari') ? f.logo_url : null,
        }));
}

// Enes Doğanay | 6 Mayıs 2026: Öne çıkan tedarikçiler — rastgele 4 firma
export async function fetchTopSuppliers() {
    const { data, error } = await supabase
        .from('firmalar')
        // Enes Doğanay | 23 Mayıs 2026: slug eklendi
        .select('firmaID, slug, firma_adi, il_ilce, ana_sektor, logo_url, urun_kategorileri, onayli_hesap, best, has_logo')
        .order('has_logo', { ascending: false, nullsFirst: false })
        .order('onayli_hesap', { ascending: false, nullsFirst: false })
        .order('best', { ascending: false })
        .order('firmaID', { ascending: true })
        .limit(8);

    if (error) throw new Error(error.message);

    const pool = (data || []).map(f => ({ ...f, _isVerified: f.onayli_hesap === true }));
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 4);
}

// Enes Doğanay | 13 Mayıs 2026: Platform istatistikleri — firmalar + aktif ihaleler
export async function fetchPlatformStats() {
    // Enes Doğanay | 13 Mayıs 2026: firma_ihaleleri.durum (status değil) — ayrı hata yönetimi
    const firmaRes = await supabase.from('firmalar').select('firmaID', { count: 'exact', head: true });
    if (firmaRes.error) throw new Error(firmaRes.error.message);

    return {
        firmaCount: firmaRes.count ?? 0,
        ihaleCount: 0,
    };
}
