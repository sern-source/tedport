// Enes Doğanay | 23 Mayıs 2026: Bu ay vs geçen ay karşılaştırma servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: Ay başı ve sonu ISO string'i hesaplar
const monthRange = (offset = 0) => {
    const d = new Date(), y = d.getFullYear(), m = d.getMonth() + offset;
    return {
        start: new Date(y, m, 1).toISOString(),
        end: new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
    };
};

// Enes Doğanay | 23 Mayıs 2026: Firma görüntülemelerini aralığa göre sayar
const countViews = async (firmaId, start, end) => {
    const { count } = await supabase
        .from('firma_goruntulemeler')
        .select('id', { count: 'exact', head: true })
        .eq('firma_id', String(firmaId))
        .gte('created_at', start).lte('created_at', end);
    return count ?? 0;
};

// Enes Doğanay | 23 Mayıs 2026: Bu ay ve geçen ay görüntüleme + teklif karşılaştırması
export const fetchMonthComparison = async (firmaId) => {
    const cur = monthRange(0), prev = monthRange(-1);

    const { data: tenders } = await supabase
        .from('firma_ihaleleri').select('id').eq('firma_id', String(firmaId));
    const ids = (tenders || []).map(t => t.id);

    const [tv, pv] = await Promise.all([
        countViews(firmaId, cur.start, cur.end),
        countViews(firmaId, prev.start, prev.end),
    ]);

    let to = 0, po = 0;
    if (ids.length) {
        [to, po] = await Promise.all([
            supabase.from('ihale_teklifleri').select('id', { count: 'exact', head: true }).in('ihale_id', ids).gte('created_at', cur.start).lte('created_at', cur.end).then(r => r.count ?? 0),
            supabase.from('ihale_teklifleri').select('id', { count: 'exact', head: true }).in('ihale_id', ids).gte('created_at', prev.start).lte('created_at', prev.end).then(r => r.count ?? 0),
        ]);
    }
    return { thisViews: tv, lastViews: pv, thisOffers: to, lastOffers: po };
};
