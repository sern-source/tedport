// Enes Doğanay | 23 Mayıs 2026: Kategori bazlı ihale performans servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: Firmanın kategorilere göre ihale + teklif dağılımı
export const fetchCategoryPerformance = async (firmaId) => {
    const { data: tenders, error } = await supabase
        .from('firma_ihaleleri')
        .select('id, kategori, durum')
        .eq('firma_id', String(firmaId));
    if (error) throw new Error(error.message);
    if (!tenders?.length) return [];

    const ids = tenders.map(t => t.id);
    const { data: offers } = await supabase
        .from('ihale_teklifleri')
        .select('ihale_id, durum')
        .in('ihale_id', ids);

    const map = {};
    for (const t of tenders) {
        const cat = t.kategori || 'Diğer';
        if (!map[cat]) map[cat] = { kategori: cat, tenderCount: 0, offerCount: 0, kabul: 0 };
        map[cat].tenderCount++;
    }
    for (const o of offers || []) {
        const t = tenders.find(x => x.id === o.ihale_id);
        const cat = t?.kategori || 'Diğer';
        if (map[cat]) {
            map[cat].offerCount++;
            if (o.durum === 'kabul') map[cat].kabul++;
        }
    }
    return Object.values(map)
        .sort((a, b) => b.offerCount - a.offerCount)
        .slice(0, 8);
};
