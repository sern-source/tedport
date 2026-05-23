// Enes Doğanay | 14 Mayıs 2026: Firma Analitik Dashboard hook
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats, fetchCompletedTendersReport } from '../services/dashboardService';

const useFirmaDashboard = (companyId, isActive) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler raporu — sadece kullanıcı isteyince yüklenir
    const [completedReport, setCompletedReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    const load = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDashboardStats(companyId);
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

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

    // Enes Doğanay | 14 Mayıs 2026: Sekme aktif olduğunda yükle
    useEffect(() => {
        if (isActive) load();
    }, [isActive, load]);

    return { stats, loading, error, reload: load, completedReport, reportLoading, loadCompletedReport };
};

export default useFirmaDashboard;
