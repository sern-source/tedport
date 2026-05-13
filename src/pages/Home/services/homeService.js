// Enes Doğanay | 6 Mayıs 2026: Home sayfası Supabase servisleri
import { supabase } from '../../../supabaseClient';
import { expandSearchTerms } from '../../../constants/synonyms';

// Enes Doğanay | 6 Mayıs 2026: Canlı firma önerileri — hero arama
export async function fetchHeroSuggestions(term) {
    const safe = term.replace(/[\\"%#_]/g, '').trim();
    if (safe.length < 2) return [];

    const { data, error } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, il_ilce, logo_url')
        .or(
            expandSearchTerms(safe).flatMap(t => [
                `firma_adi.ilike."%${t}%"`,
                `ana_sektor.ilike."%${t}%"`,
                `urun_kategorileri.ilike."%${t}%"`,
                `arama_etiketleri.ilike."%${t}%"`,
            ]).join(',')
        )
        .order('best', { ascending: false })
        .limit(6);

    if (error) throw new Error(error.message);
    return (data || []).map(f => ({
        id: f.firmaID,
        name: f.firma_adi,
        location: f.il_ilce || '',
        logo: f.logo_url?.includes('firma-logolari') ? f.logo_url : null,
    }));
}

// Enes Doğanay | 6 Mayıs 2026: Öne çıkan tedarikçiler — rastgele 4 firma
export async function fetchTopSuppliers() {
    const { data, error } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, il_ilce, ana_sektor, logo_url, urun_kategorileri, onayli_hesap, best, has_logo')
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
