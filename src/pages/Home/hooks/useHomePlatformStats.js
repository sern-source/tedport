// Enes Doğanay | 13 Mayıs 2026: Platform istatistikleri hook — gerçek zamanlı DB count
import { useState, useEffect } from 'react';
import { fetchPlatformStats } from '../services/homeService';

const FALLBACK = { firmaCount: 5000, ihaleCount: 0 };

export function useHomePlatformStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        fetchPlatformStats()
            .then(data => { if (!cancelled) setStats(data); })
            .catch(() => { if (!cancelled) setStats(FALLBACK); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, []);

    return { stats: stats || FALLBACK, loading };
}
