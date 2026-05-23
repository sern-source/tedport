// Enes Doğanay | 23 Mayıs 2026: Firma Analitik Dashboard hook — dinamik tarih aralığı desteği
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats, fetchCompletedTendersReport, computeDateRange } from '../services/dashboardService';
import { fetchVisitorCompanies } from '../services/visitorCompaniesService';
import { fetchMonthComparison } from '../services/monthComparisonService';
import { fetchCategoryPerformance } from '../services/categoryPerformanceService';
import { fetchSectorBenchmark } from '../services/sectorBenchmarkService';

// Enes Doğanay | 23 Mayıs 2026: Varsayılan tarih aralığı — son 30 gün
const DEFAULT_DATE_RANGE = { type: 'preset', days: 30 };

const useFirmaDashboard = (companyId, isActive) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Enes Doğanay | 23 Mayıs 2026: Seçili tarih aralığı — preset (30/60/90 gün) veya özel
    const [dateRange, setDateRangeState] = useState(DEFAULT_DATE_RANGE);
    const [completedReport, setCompletedReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    // Enes Doğanay | 23 Mayıs 2026: Gelişmiş analitik verisi + yükleme durumu
    const [analyticsExt, setAnalyticsExt] = useState(null);
    const [extLoading, setExtLoading] = useState(false);

    const load = useCallback(async (range) => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const { since, until } = computeDateRange(range || DEFAULT_DATE_RANGE);
            const data = await fetchDashboardStats(companyId, since, until);
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    // Enes Doğanay | 23 Mayıs 2026: Tarih aralığı değiştiğinde veriyi yeniden çeker — tüm türev cache'ler sıfırlanır
    const setDateRange = useCallback((newRange) => {
        setDateRangeState(newRange);
        setCompletedReport(null);
        setAnalyticsExt(null); // Enes Doğanay | 23 Mayıs 2026: Genişletilmiş analitik stale kalmasın — yeni aralıkta yeniden yüklenecek
        load(newRange);
    }, [load]);

    const loadCompletedReport = useCallback(async () => {
        if (!companyId || completedReport) return;
        setReportLoading(true);
        try {
            const data = await fetchCompletedTendersReport(companyId);
            setCompletedReport(data);
        } catch (err) {
            setCompletedReport({ error: err.message, tenders: [], summary: { totalSpend: {}, topProducts: [], totalAcceptedOffers: 0 } });
        } finally {
            setReportLoading(false);
        }
    }, [companyId, completedReport]);

    // Enes Doğanay | 23 Mayıs 2026: Sekme aktif olduğunda mevcut dateRange ile yükle
    useEffect(() => {
        if (isActive) load(dateRange);
        // dateRange'i dep listesine almıyoruz — setDateRange zaten load çağırıyor
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, load]);

    // Enes Doğanay | 23 Mayıs 2026: Gelişmiş analitik verilerini paralel yükler
    const loadAnalyticsExt = useCallback(async () => {
        if (!companyId || analyticsExt) return;
        setExtLoading(true);
        try {
            const { since } = computeDateRange(dateRange);
            const [visitors, monthComparison, categories, benchmark] = await Promise.all([
                fetchVisitorCompanies(companyId, since),
                fetchMonthComparison(companyId),
                fetchCategoryPerformance(companyId),
                fetchSectorBenchmark(companyId),
            ]);
            setAnalyticsExt({ visitors, monthComparison, categories, benchmark });
        } catch (err) {
            setAnalyticsExt({ error: err.message });
        } finally {
            setExtLoading(false);
        }
    }, [companyId, analyticsExt, dateRange]);

    return { stats, loading, error, reload: () => load(dateRange), completedReport, reportLoading, loadCompletedReport, dateRange, setDateRange, analyticsExt, extLoading, loadAnalyticsExt };
};

export default useFirmaDashboard;
