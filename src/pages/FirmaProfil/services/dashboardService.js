// Enes Doğanay | 14 Mayıs 2026: Firma Analitik Dashboard servisi — profil, ihale, teklif metrikleri
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 14 Mayıs 2026: Son 30 gün profil görüntüleme — günlük dağılım + benzersiz izleyici
export const fetchProfileViewStats = async (firmaId) => {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
        .from('firma_goruntulemeler')
        .select('created_at, viewer_id')
        .eq('firma_id', String(firmaId))
        .gte('created_at', since30);

    const views = data || [];
    const total30 = views.length;
    const uniqueViewers = new Set(views.filter(v => v.viewer_id).map(v => v.viewer_id)).size;

    // Son 7 gün günlük dağılım
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().split('T')[0]] = 0;
    }
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    for (const v of views) {
        if (v.created_at >= since7) {
            const key = v.created_at.split('T')[0];
            if (dayMap[key] !== undefined) dayMap[key]++;
        }
    }

    return {
        total30,
        uniqueViewers,
        dailyViews: Object.entries(dayMap).map(([date, count]) => ({ date, count })),
    };
};

// Enes Doğanay | 14 Mayıs 2026: Firma ihalelerinin durum dağılımı + en çok teklif alan ihaleler
export const fetchTenderAndOfferStats = async (firmaId) => {
    const { data: tenders } = await supabase
        .from('firma_ihaleleri')
        .select('id, durum, baslik')
        .eq('firma_id', String(firmaId));

    const allTenders = tenders || [];
    const tenderStats = { canli: 0, yaklasan: 0, kapali: 0, tamamlandi: 0, draft: 0 };
    for (const t of allTenders) {
        if (tenderStats[t.durum] !== undefined) tenderStats[t.durum]++;
    }

    const activeTenderIds = allTenders.filter(t => t.durum !== 'draft').map(t => t.id);
    if (!activeTenderIds.length) {
        return { tenderStats, offerStats: { total: 0, byStatus: {}, recent30: 0 }, topTenders: [] };
    }

    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: offers } = await supabase
        .from('ihale_teklifleri')
        .select('ihale_id, durum, created_at')
        .in('ihale_id', activeTenderIds)
        .neq('durum', 'taslak');

    const allOffers = offers || [];
    const recent30 = allOffers.filter(o => o.created_at >= since30).length;
    const byStatus = { pending: 0, approved: 0, kabul: 0, red: 0 };
    for (const o of allOffers) {
        if (byStatus[o.durum] !== undefined) byStatus[o.durum]++;
    }

    // En çok teklif alan ilk 5 ihale
    const countMap = {};
    for (const t of allTenders) countMap[t.id] = { baslik: t.baslik, count: 0, durum: t.durum };
    for (const o of allOffers) {
        if (countMap[o.ihale_id]) countMap[o.ihale_id].count++;
    }
    const topTenders = Object.entries(countMap)
        .map(([id, v]) => ({ id, ...v }))
        .filter(t => t.durum !== 'draft')
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        tenderStats,
        offerStats: { total: allOffers.length, byStatus, recent30 },
        topTenders,
    };
};

// Enes Doğanay | 14 Mayıs 2026: Teklif talepleri — son 30 gün gelen + giden
export const fetchQuoteRequestStats = async (firmaId) => {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const fid = String(firmaId);
    const [inRes, outRes] = await Promise.all([
        supabase.from('teklif_talepleri').select('id', { count: 'exact', head: true })
            .eq('firma_id', fid).gte('created_at', since30),
        supabase.from('teklif_talepleri').select('id', { count: 'exact', head: true })
            .eq('gonderen_firma_id', fid).gte('created_at', since30),
    ]);
    return { incoming30: inRes.count ?? 0, outgoing30: outRes.count ?? 0 };
};

// Enes Doğanay | 14 Mayıs 2026: Tüm dashboard metriklerini paralel olarak çeker
export const fetchDashboardStats = async (firmaId) => {
    const [viewStats, tenderOfferStats, quoteStats] = await Promise.all([
        fetchProfileViewStats(firmaId),
        fetchTenderAndOfferStats(firmaId),
        fetchQuoteRequestStats(firmaId),
    ]);
    return { viewStats, ...tenderOfferStats, quoteStats };
};

// Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler için detaylı rapor — kabul edilen teklifler + ürün özeti
export const fetchCompletedTendersReport = async (firmaId) => {
    const { data: tenders } = await supabase
        .from('firma_ihaleleri')
        .select('id, baslik, kategori, yayin_tarihi, son_basvuru_tarihi')
        .eq('firma_id', String(firmaId))
        .eq('durum', 'tamamlandi')
        .order('son_basvuru_tarihi', { ascending: false });

    if (!tenders?.length) {
        return { tenders: [], summary: { totalSpend: {}, topProducts: [], totalAcceptedOffers: 0 } };
    }

    const tenderIds = tenders.map((t) => t.id);
    const { data: offers } = await supabase
        .from('ihale_teklifleri')
        .select('ihale_id, gonderen_firma_adi, gonderen_ad_soyad, toplam_tutar, para_birimi, kdv_dahil, kalemler, created_at')
        .in('ihale_id', tenderIds)
        .eq('durum', 'kabul');

    const allOffers = offers || [];

    // Her ihaleye ait ilk kabul edilen teklifi eşleştir
    const offerByTender = {};
    for (const o of allOffers) {
        if (!offerByTender[o.ihale_id]) offerByTender[o.ihale_id] = o;
    }

    // Tüm kabul edilen tekliflerdeki kalemleri agregasyon için topla
    const productMap = {};
    const totalSpend = {};
    for (const o of allOffers) {
        if (Number(o.toplam_tutar) > 0) {
            totalSpend[o.para_birimi] = (totalSpend[o.para_birimi] || 0) + Number(o.toplam_tutar);
        }
        const items = Array.isArray(o.kalemler) ? o.kalemler : [];
        for (const item of items) {
            const key = item.madde || 'Bilinmeyen Ürün';
            if (!productMap[key]) {
                productMap[key] = { madde: key, birim: item.birim || '', totalAdet: 0, prices: [] };
            }
            productMap[key].totalAdet += Number(item.miktar || item.adet || 1);
            const p = Number(item.birim_fiyat);
            if (p > 0) productMap[key].prices.push(p);
        }
    }

    const topProducts = Object.values(productMap)
        .map((p) => ({
            madde: p.madde,
            birim: p.birim,
            totalAdet: p.totalAdet,
            avgFiyat: p.prices.length ? p.prices.reduce((a, b) => a + b, 0) / p.prices.length : null,
            minFiyat: p.prices.length ? Math.min(...p.prices) : null,
            maxFiyat: p.prices.length ? Math.max(...p.prices) : null,
        }))
        .sort((a, b) => b.totalAdet - a.totalAdet)
        .slice(0, 8);

    return {
        tenders: tenders.map((t) => ({ ...t, acceptedOffer: offerByTender[t.id] || null })),
        summary: { totalSpend, topProducts, totalAcceptedOffers: allOffers.length },
    };
};
