// Enes Doğanay | 23 Mayıs 2026: Profil görüntüleme istatistikleri servisi
import { supabase } from '../../../supabaseClient';

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DAY_TR    = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// Enes Doğanay | 23 Mayıs 2026: Görüntüleme verilerini günlük (≤30 gün) veya haftalık bucket'lara ayırır
const buildChartBuckets = (views, since, until) => {
    const untilDate = new Date(until);
    const rangeDays = Math.ceil((untilDate - new Date(since)) / 86400000);

    if (rangeDays <= 30) {
        const showDays = Math.min(14, rangeDays);
        const dayMap = {};
        for (let i = showDays - 1; i >= 0; i--) {
            const d = new Date(untilDate);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dayMap[key] = { date: key, count: 0, label: DAY_TR[d.getDay()] };
        }
        for (const v of views) {
            const key = v.created_at.split('T')[0];
            if (dayMap[key] !== undefined) dayMap[key].count++;
        }
        return Object.values(dayMap);
    }

    const totalWeeks = Math.min(Math.ceil(rangeDays / 7), 12);
    const buckets = [];
    for (let i = totalWeeks - 1; i >= 0; i--) {
        const endW = new Date(untilDate);
        endW.setDate(endW.getDate() - i * 7);
        const startW = new Date(endW);
        startW.setDate(startW.getDate() - 6);
        buckets.push({
            date: startW.toISOString().split('T')[0],
            endDate: endW.toISOString().split('T')[0],
            count: 0,
            label: `${startW.getDate()} ${MONTHS_TR[startW.getMonth()]}`,
        });
    }
    for (const v of views) {
        const vDate = v.created_at.split('T')[0];
        for (const b of buckets) {
            if (vDate >= b.date && vDate <= b.endDate) { b.count++; break; }
        }
    }
    return buckets.map(({ date, count, label }) => ({ date, count, label }));
};

// Enes Doğanay | 23 Mayıs 2026: Profil görüntüleme istatistikleri — seçili tarih aralığında
export const fetchProfileViewStats = async (firmaId, since, until) => {
    const { data, error } = await supabase
        .from('firma_goruntulemeler')
        .select('created_at, viewer_id')
        .eq('firma_id', String(firmaId))
        .gte('created_at', since)
        .lte('created_at', until);
    if (error) throw new Error(error.message);
    const views = data || [];
    return {
        total: views.length,
        uniqueViewers: new Set(views.filter(v => v.viewer_id).map(v => v.viewer_id)).size,
        chartViews: buildChartBuckets(views, since, until),
    };
};
