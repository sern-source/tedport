// Enes Doğanay | 14 Mayıs 2026: Firma Analitik Dashboard hook
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats } from '../services/dashboardService';

const useFirmaDashboard = (companyId, isActive) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    // Enes Doğanay | 14 Mayıs 2026: Sekme aktif olduğunda yükle
    useEffect(() => {
        if (isActive) load();
    }, [isActive, load]);

    return { stats, loading, error, reload: load };
};

export default useFirmaDashboard;
