// Enes Doğanay | 23 Mayıs 2026: Sektör kıyaslaması — aynı sektördeki aktif ihale karşılaştırması
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: Firmanın ana_sektor bilgisini çeker
const getFirmaSektor = async (firmaId) => {
    const { data } = await supabase
        .from('firmalar')
        .select('ana_sektor')
        .eq('firmaID', String(firmaId))
        .single();
    return data?.ana_sektor || null;
};

// Enes Doğanay | 23 Mayıs 2026: Aynı sektördeki firmaları aktif ihale sayısına göre karşılaştırır
export const fetchSectorBenchmark = async (firmaId) => {
    const sektor = await getFirmaSektor(firmaId);
    if (!sektor) return null;

    const { data: sectorFirms } = await supabase
        .from('firmalar')
        .select('firmaID')
        .eq('ana_sektor', sektor)
        .limit(100);

    const sectorIds = (sectorFirms || []).map(f => f.firmaID);
    if (sectorIds.length < 2) return null;

    const { data: tenders } = await supabase
        .from('firma_ihaleleri')
        .select('firma_id')
        .in('firma_id', sectorIds)
        .in('durum', ['canli', 'yaklasan']);

    const countMap = {};
    for (const id of sectorIds) countMap[id] = 0;
    for (const t of tenders || []) countMap[t.firma_id] = (countMap[t.firma_id] || 0) + 1;

    const counts = Object.values(countMap);
    const avg = Math.round((counts.reduce((s, v) => s + v, 0) / counts.length) * 10) / 10;
    const myCount = countMap[String(firmaId)] || 0;
    const rank = [...counts].sort((a, b) => b - a).indexOf(myCount) + 1;
    const topPercent = Math.round((rank / sectorIds.length) * 100);

    return { sektor, firmCount: sectorIds.length, myTenders: myCount, avgTenders: avg, topPercent };
};
