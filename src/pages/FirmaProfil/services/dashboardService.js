// Enes Doğanay | 23 Mayıs 2026: Dashboard servis orkestratörü — alt servislerden toplar
import { fetchProfileViewStats } from './viewStatsService';
import { fetchTenderAndOfferStats } from './tenderStatsService';
import { fetchQuoteRequestStats } from './quoteStatsService';
export { fetchCompletedTendersReport } from './completedReportService';

// Enes Doğanay | 23 Mayıs 2026: dateRange config → { since, until } ISO string çevirici
export const computeDateRange = (dateRange) => {
    const until = new Date();
    until.setHours(23, 59, 59, 999);
    if (dateRange.type === 'preset') {
        const since = new Date();
        since.setDate(since.getDate() - dateRange.days);
        since.setHours(0, 0, 0, 0);
        return { since: since.toISOString(), until: until.toISOString() };
    }
    return {
        since: new Date(dateRange.start + 'T00:00:00').toISOString(),
        until: new Date(dateRange.end + 'T23:59:59.999').toISOString(),
    };
};

// Enes Doğanay | 23 Mayıs 2026: Tüm dashboard metriklerini paralel çeker
export const fetchDashboardStats = async (firmaId, since, until) => {
    const [viewStats, tenderOfferStats, quoteStats] = await Promise.all([
        fetchProfileViewStats(firmaId, since, until),
        fetchTenderAndOfferStats(firmaId, since, until),
        fetchQuoteRequestStats(firmaId, since, until),
    ]);
    return { viewStats, ...tenderOfferStats, quoteStats };
};
