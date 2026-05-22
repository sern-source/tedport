// Enes Doğanay | 7 Mayıs 2026: Public ihale listesi servisi — Supabase sorguları
// Enes Doğanay | 13 Mayıs 2026: Sunucu tarafı filtreleme + sayfalama + sort eklendi
import { supabase } from '../../../supabaseClient';

const isMissingRelationError = (error) =>
    error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

// Enes Doğanay | 13 Mayıs 2026: IhalelerUtils'teki TENDERS_PAGE_SIZE ile eşleştirildi (12)
export const PAGE_SIZE = 12;

// Enes Doğanay | 13 Mayıs 2026: sortBy + statusFilter'a göre sunucu tarafı sıralama
const applySort = (query, sortBy, statusFilter) => {
    if (statusFilter && statusFilter !== 'all') {
        if (sortBy === 'newest') return query.order('yayin_tarihi', { ascending: false });
        if (sortBy === 'title')  return query.order('baslik', { ascending: true });
        // deadline (varsayılan) — null son tarihler sona gelir
        return query.order('son_basvuru_tarihi', { ascending: true, nullsFirst: false });
    }
    // "Tümü" görünümü: öne çıkan + en yeni yayın
    return query
        .order('is_featured', { ascending: false })
        .order('yayin_tarihi', { ascending: false });
};

// Enes Doğanay | 13 Mayıs 2026: kapali_gorunurluk filtresi — gizle olanları dışlar, NULL geçer
const applyVisibility = (query, statusFilter) => {
    if (statusFilter === 'kapali') {
        // kapali_gorunurluk IS NULL veya != 'gizle' olanları göster
        return query.or('kapali_gorunurluk.is.null,kapali_gorunurluk.neq.gizle');
    }
    if (!statusFilter || statusFilter === 'all') {
        // Tüm durumlar: kapali+gizle satırları hariç tut
        return query.or('durum.neq.kapali,kapali_gorunurluk.is.null,kapali_gorunurluk.neq.gizle');
    }
    return query; // canli, yaklasan, acil — kapali satırı olmaz
};

// Enes Doğanay | 13 Mayıs 2026: Sunucu tarafı sayfalama + tüm filtreler
export const fetchPublicTenders = async ({ page = 1, firmaFilter, statusFilter = 'all', searchTerm, sortBy = 'deadline', isDemoUser = false } = {}) => {
    const from = (page - 1) * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let query = supabase
        .from('firma_ihaleleri')
        .select('*', { count: 'exact' })
        .neq('durum', 'draft')
        // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleler genel listeden gizlenir
        .neq('ihale_tipi', 'Davetli İhale');

    // Enes Doğanay | 16 Mayıs 2026: Demo ayrımı — demo hesaplar sadece demo ihaleleri, gerçek kullanıcılar gerçek ihaleleri görür
    // NULL slug'lar gerçek ihaleler olduğu için dahil edilir (or ile handle edilir)
    if (isDemoUser) {
        query = query.ilike('slug', 'demo-%');
    } else {
        query = query.or('slug.is.null,slug.not.ilike.demo-%');
    }

    if (firmaFilter) query = query.eq('firma_id', firmaFilter);

    // Enes Doğanay | 14 Mayıs 2026: Durum filtresi — tarih koşulları eklendi
    if (statusFilter === 'acil') {
        const now       = new Date().toISOString();
        const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        query = query.eq('durum', 'canli').gt('son_basvuru_tarihi', now).lt('son_basvuru_tarihi', threeDays);
    } else if (statusFilter === 'canli') {
        // Canlı = durum 'canli' + yayında (yayin_tarihi geçmiş) + son tarih geçmemiş
        const now = new Date().toISOString();
        query = query
            .eq('durum', 'canli')
            .or(`yayin_tarihi.is.null,yayin_tarihi.lte.${now}`)
            .or(`son_basvuru_tarihi.is.null,son_basvuru_tarihi.gt.${now}`);
    } else if (statusFilter === 'yaklasan') {
        // Yaklaşan = DB'de 'yaklasan' VEYA 'canli' ama henüz yayınlanmamış (yayin_tarihi > şimdi)
        const now = new Date().toISOString();
        query = query.or(`durum.eq.yaklasan,and(durum.eq.canli,yayin_tarihi.gt.${now})`);
    } else if (statusFilter && statusFilter !== 'all') {
        query = query.eq('durum', statusFilter);
    }

    query = applyVisibility(query, statusFilter);

    // Metin arama — başlık, firma adı veya referans no
    if (searchTerm && searchTerm.trim().length >= 2) {
        const safe = searchTerm.trim().replace(/[%_]/g, '\\$&');
        query = query.or(`baslik.ilike.%${safe}%,firma_adi.ilike.%${safe}%,referans_no.ilike.%${safe}%`);
    }

    query = applySort(query, sortBy, statusFilter);
    query = query.range(from, to);

    const { data: tenderData, error: tenderError, count } = await query;

    if (tenderError) {
        if (tenderError.name === 'AbortError') return { tenders: null, tableMissing: false, total: 0 };
        if (isMissingRelationError(tenderError)) return { tenders: [], tableMissing: true, total: 0 };
        throw tenderError;
    }

    // Firma adı + konum join (mevcut sayfadaki firmalar için)
    const firmaIds = [...new Set((tenderData || []).map(t => t.firma_id).filter(Boolean))];
    const { data: firmsData, error: firmsError } = firmaIds.length > 0
        // Enes Doğanay | 23 Mayıs 2026: slug eklendi — firma navigasyonu slug URL kullanacak
        ? await supabase.from('firmalar').select('firmaID, slug, firma_adi, category_name, il_ilce').in('firmaID', firmaIds)
        : { data: [], error: null };

    if (firmsError) throw firmsError;

    const tenders = (tenderData || []).map(tender => {
        const firm = (firmsData || []).find(f => String(f.firmaID) === String(tender.firma_id)) || {};
        return {
            ...tender,
            firma_adi:      firm.firma_adi      || tender.firma_adi || 'Firma bilgisi bulunamadı',
            firma_kategori: firm.category_name  || '',
            firma_konum:    firm.il_ilce         || tender.il_ilce  || 'Konum belirtilmedi',
            firma_slug:     firm.slug            || null,
        };
    });

    return { tenders, tableMissing: false, total: count ?? 0 };
};

// Enes Doğanay | 13 Mayıs 2026: Header badge sayıları — 3 paralel COUNT sorgusu
export const fetchTenderCounts = async ({ firmaFilter, isDemoUser = false } = {}) => {
    const makeBase = () => {
        let q = supabase
            .from('firma_ihaleleri')
            .select('*', { count: 'exact', head: true })
            .neq('durum', 'draft')
            // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleler sayaçlara dahil edilmez
            .neq('ihale_tipi', 'Davetli İhale');
        // Enes Doğanay | 16 Mayıs 2026: Demo ayrımı — NULL slug'lar gerçek ihaleler, or ile dahil edilir
        if (isDemoUser) {
            q = q.ilike('slug', 'demo-%');
        } else {
            q = q.or('slug.is.null,slug.not.ilike.demo-%');
        }
        if (firmaFilter) q = q.eq('firma_id', firmaFilter);
        return q;
    };

    // Enes Doğanay | 14 Mayıs 2026: Sayaçlar tarih koşullarıyla hizalandı
    const now = new Date().toISOString();
    const [canliRes, yaklaşanRes, kapaliRes] = await Promise.all([
        makeBase()
            .eq('durum', 'canli')
            .or(`yayin_tarihi.is.null,yayin_tarihi.lte.${now}`)
            .or(`son_basvuru_tarihi.is.null,son_basvuru_tarihi.gt.${now}`),
        makeBase().or(`durum.eq.yaklasan,and(durum.eq.canli,yayin_tarihi.gt.${now})`),
        makeBase().eq('durum', 'kapali').or('kapali_gorunurluk.is.null,kapali_gorunurluk.neq.gizle'),
    ]);

    return {
        liveCount:     canliRes.count    ?? 0,
        upcomingCount: yaklaşanRes.count ?? 0,
        closedCount:   kapaliRes.count   ?? 0,
    };
};

// Enes Doğanay | 14 Mayıs 2026: Davetli ihaleler — sadece davetli email/firma için
export const fetchInvitedTenders = async (email, firmaId) => {
    if (!email && !firmaId) return [];
    const queries = [];

    if (email) {
        const safeEmail = email.trim().toLowerCase();
        queries.push(
            supabase
                .from('firma_ihaleleri')
                .select('*')
                .eq('ihale_tipi', 'Davetli İhale')
                .neq('durum', 'draft')
                // Enes Doğanay | 14 Mayıs 2026: JSONB array için filter+cs+JSON.stringify — .contains() dizi için PG array formatı üretir, JSONB'de çalışmaz
                .filter('davet_emailleri', 'cs', JSON.stringify([safeEmail]))
        );
    }
    if (firmaId) {
        queries.push(
            supabase
                .from('firma_ihaleleri')
                .select('*')
                .eq('ihale_tipi', 'Davetli İhale')
                .neq('durum', 'draft')
                .filter('davetli_firmalar', 'cs', JSON.stringify([{ firma_id: String(firmaId) }]))
        );
    }

    // Enes Doğanay | 19 Mayıs 2026: Firmanın kendi açtığı davetli ihaleler — sahibi olduğu için listede görünmeli
    // ownQueryIndex: -1 ise kendi sorgusu eklenmedi (yalnızca email varsa)
    let ownQueryIndex = -1;
    if (firmaId) {
        ownQueryIndex = queries.length;
        queries.push(
            supabase
                .from('firma_ihaleleri')
                .select('*')
                .eq('ihale_tipi', 'Davetli İhale')
                .neq('durum', 'draft')
                .eq('firma_id', String(firmaId))
        );
    }

    const results = await Promise.all(queries);
    const seen = new Set();
    const all = [];
    results.forEach(({ data }, idx) => {
        for (const t of (data || [])) {
            if (!seen.has(t.id)) {
                seen.add(t.id);
                // Enes Doğanay | 19 Mayıs 2026: Kendi ihalesi → _isOwn; davetli → olduğu gibi
                all.push(idx === ownQueryIndex ? { ...t, _isOwn: true } : t);
            }
        }
    });
    if (!all.length) return [];

    // Enes Doğanay | 14 Mayıs 2026: Firma bilgisi join
    const firmaIds = [...new Set(all.map(t => t.firma_id).filter(Boolean))];
    const { data: firmsData } = firmaIds.length
        // Enes Doğanay | 23 Mayıs 2026: slug eklendi — firma navigasyonu slug URL kullanacak
        ? await supabase.from('firmalar').select('firmaID, slug, firma_adi, category_name, il_ilce').in('firmaID', firmaIds)
        : { data: [] };

    return all.map(tender => {
        const firm = (firmsData || []).find(f => String(f.firmaID) === String(tender.firma_id)) || {};
        return {
            ...tender,
            firma_adi:      tender.anonim ? null : (firm.firma_adi || tender.firma_adi || 'Firma bilgisi bulunamadı'),
            firma_kategori: firm.category_name || '',
            firma_konum:    firm.il_ilce || tender.il_ilce || 'Konum belirtilmedi',
            firma_slug:     firm.slug || null,
        };
    });
};
