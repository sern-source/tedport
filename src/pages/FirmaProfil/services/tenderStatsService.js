// Enes Doğanay | 23 Mayıs 2026: İhale ve teklif istatistikleri servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: Firma ihalelerinin durum dağılımı + teklif sayıları
export const fetchTenderAndOfferStats = async (firmaId, since) => {
    // Adım 1: Firmanın ihale ID'lerini al
    const { data: tenderRows, error: tenderErr } = await supabase
        .from('firma_ihaleleri')
        .select('id, durum')
        .eq('firma_id', String(firmaId))
        .neq('durum', 'draft');
    if (tenderErr) throw new Error(tenderErr.message);

    const tenders = tenderRows || [];
    const tenderIds = tenders.map(t => t.id);

    if (!tenderIds.length) {
        return {
            tenderStats: { canli: 0, yaklasan: 0, kapali: 0, tamamlandi: 0, draft: 0 },
            offerStats: { total: 0, recentCount: 0, byStatus: { gonderildi: 0, kabul: 0, red: 0 } },
            topTenders: [],
        };
    }

    // Adım 2: Bu ihalelere ait teklifleri al
    const [offerAllRes, offerRecentRes] = await Promise.all([
        supabase.from('ihale_teklifleri').select('id, ihale_id, durum').in('ihale_id', tenderIds),
        supabase.from('ihale_teklifleri').select('id, durum, ihale_id').in('ihale_id', tenderIds).gte('created_at', since),
    ]);
    if (offerAllRes.error)    throw new Error(offerAllRes.error.message);
    if (offerRecentRes.error) throw new Error(offerRecentRes.error.message);

    const allOffers    = offerAllRes.data    || [];
    const recentOffers = offerRecentRes.data || [];

    const tenderStats = { canli: 0, yaklasan: 0, kapali: 0, tamamlandi: 0, draft: 0 };
    for (const t of tenders) tenderStats[t.durum] = (tenderStats[t.durum] ?? 0) + 1;

    // Enes Doğanay | 23 Mayıs 2026: gonderildi/kabul/red — ihaleConstants ile uyumlu
    const byStatus = { gonderildi: 0, kabul: 0, red: 0 };
    for (const o of allOffers) {
        const k = o.durum;
        if (k && k in byStatus) byStatus[k]++;
    }

    const topCandidates = {};
    for (const o of allOffers) topCandidates[o.ihale_id] = (topCandidates[o.ihale_id] ?? 0) + 1;

    // Enes Doğanay | 23 Mayıs 2026: Top 5 ihale — başlık firma_ihaleleri'nden alınır
    const topTendersRaw = Object.entries(topCandidates)
        .sort(([, a], [, b]) => b - a).slice(0, 5)
        .map(([id, count]) => ({ id, count }));
    const topTenderDetails = await Promise.all(
        topTendersRaw.map(({ id, count }) =>
            supabase.from('firma_ihaleleri').select('id, baslik, durum').eq('id', id).single()
                .then(({ data }) => ({ id, count, baslik: data?.baslik, durum: data?.durum }))
        )
    );

    return {
        tenderStats,
        offerStats: { total: allOffers.length, recentCount: recentOffers.length, byStatus },
        topTenders: topTenderDetails,
    };
};
