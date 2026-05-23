// Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler detay raporu servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: Kabul edilen tekliflerden harcama + ürün özeti hesaplar
const buildCompletedSummary = (tenders) => {
    const totalSpend = {};
    let totalAcceptedOffers = 0;
    const productMap = {};

    for (const t of tenders) {
        if (!t.acceptedOffer) continue;
        totalAcceptedOffers++;
        const { toplam_tutar, para_birimi } = t.acceptedOffer;
        if (toplam_tutar != null) {
            totalSpend[para_birimi || 'TRY'] = (totalSpend[para_birimi || 'TRY'] || 0) + Number(toplam_tutar);
        }
        for (const item of t.acceptedOffer.kalemler || []) {
            const key = item.madde_adi || item.madde || '';
            if (!key) continue;
            if (!productMap[key]) productMap[key] = { madde: key, birim: item.birim, totalAdet: 0, fiyatlar: [] };
            productMap[key].totalAdet += Number(item.miktar || 0);
            if (item.birim_fiyat) productMap[key].fiyatlar.push(Number(item.birim_fiyat));
        }
    }
    const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalAdet - a.totalAdet)
        .slice(0, 8)
        .map(p => ({
            ...p,
            avgFiyat: p.fiyatlar.length ? p.fiyatlar.reduce((s, v) => s + v, 0) / p.fiyatlar.length : null,
        }));
    return { totalSpend, totalAcceptedOffers, topProducts };
};

// Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler + kabul edilen teklifler + kalemler
export const fetchCompletedTendersReport = async (firmaId) => {
    const { data: tenders, error } = await supabase
        .from('firma_ihaleleri')
        .select('id, baslik, kategori, created_at')
        .eq('firma_id', String(firmaId))
        .eq('durum', 'tamamlandi')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    if (!tenders?.length) return { tenders: [], summary: { totalSpend: {}, totalAcceptedOffers: 0, topProducts: [] } };

    const tenderIds = tenders.map(t => t.id);
    const { data: accepted, error: offErr } = await supabase
        .from('ihale_teklifleri')
        .select('ihale_id, toplam_tutar, para_birimi, kdv_dahil, gonderen_firma_adi, gonderen_ad_soyad, kalemler')
        .in('ihale_id', tenderIds)
        .eq('durum', 'kabul');
    if (offErr) throw new Error(offErr.message);

    const acceptedMap = {};
    for (const o of accepted || []) acceptedMap[o.ihale_id] = o;

    const enriched = tenders.map(t => ({ ...t, acceptedOffer: acceptedMap[t.id] || null }));
    return { tenders: enriched, summary: buildCompletedSummary(enriched) };
};
