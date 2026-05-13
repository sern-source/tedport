// Enes Doğanay | 13 Mayıs 2026: İhale uyarı aboneliği hook — subscribe/unsubscribe
import { useState, useEffect, useCallback } from 'react';
import { checkAlertSubscription, subscribeToAlerts, unsubscribeFromAlerts } from '../../../services/alertService';

export function useAlertSubscription({ userId, kategori = null }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    // Enes Doğanay | 13 Mayıs 2026: Hata state — 3 sn sonra otomatik sıfırlanır
    const [error, setError] = useState(null);

    useEffect(() => {
        if (error === null) return;
        const t = setTimeout(() => setError(null), 3000);
        return () => clearTimeout(t);
    }, [error]);

    useEffect(() => {
        if (!userId) { setSubscription(null); return; }
        let cancelled = false;
        setChecking(true);
        checkAlertSubscription(userId, kategori)
            .then(sub => { if (!cancelled) setSubscription(sub); })
            .catch(() => { if (!cancelled) setSubscription(null); })
            .finally(() => { if (!cancelled) setChecking(false); });
        return () => { cancelled = true; };
    }, [userId, kategori]);

    const handleToggle = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            if (subscription) {
                await unsubscribeFromAlerts(subscription.id);
                setSubscription(null);
            } else {
                const sub = await subscribeToAlerts(userId, kategori);
                setSubscription(sub);
            }
        } catch (err) {
            setError(err.message || 'Abonelik işlemi başarısız.');
        } finally {
            setLoading(false);
        }
    }, [userId, kategori, subscription]);

    return { subscription, loading, checking, error, handleToggle };
}
