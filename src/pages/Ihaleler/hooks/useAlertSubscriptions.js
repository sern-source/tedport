// Enes Doğanay | 13 Mayıs 2026: Çoklu uyarı aboneliği hook — kategori bazlı toggle
import { useState, useEffect, useCallback } from 'react';
import { getUserAlerts, subscribeToAlerts, unsubscribeFromAlerts } from '../../../services/alertService';

// Enes Doğanay | 13 Mayıs 2026: Tüm aktif abonelikleri yönetir
// kategori=null → tüm ihaleler, kategori='...' → sadece o sektör
export function useAlertSubscriptions({ userId }) {
    // [{id, kategori, aktif, created_at}]
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState(null);

    // Enes Doğanay | 13 Mayıs 2026: Hata 3 sn sonra otomatik sıfırlanır
    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(null), 3000);
        return () => clearTimeout(t);
    }, [error]);

    // Enes Doğanay | 13 Mayıs 2026: İlk yüklemede tüm aktif abonelikleri getir
    useEffect(() => {
        if (!userId) { setSubscriptions([]); setInitializing(false); return; }
        let cancelled = false;
        setInitializing(true);
        getUserAlerts(userId)
            .then(data => { if (!cancelled) setSubscriptions(data); })
            .catch(() => { if (!cancelled) setSubscriptions([]); })
            .finally(() => { if (!cancelled) setInitializing(false); });
        return () => { cancelled = true; };
    }, [userId]);

    // Enes Doğanay | 13 Mayıs 2026: kategori=null = tüm ihaleler, string = sektör adı
    const toggleSubscription = useCallback(async (kategori) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const existing = subscriptions.find(s =>
                kategori === null ? s.kategori === null : s.kategori === kategori
            );
            if (existing) {
                await unsubscribeFromAlerts(existing.id);
                setSubscriptions(prev => prev.filter(s => s.id !== existing.id));
            } else {
                const newSub = await subscribeToAlerts(userId, kategori);
                setSubscriptions(prev => [...prev, { ...newSub, kategori }]);
            }
        } catch (err) {
            setError(err.message || 'Abonelik işlemi başarısız.');
        } finally {
            setLoading(false);
        }
    }, [userId, subscriptions]);

    // Enes Doğanay | 13 Mayıs 2026: Belirli bir kategoride aktif abonelik var mı?
    const isSubscribed = useCallback((kategori) => {
        return subscriptions.some(s =>
            kategori === null ? s.kategori === null : s.kategori === kategori
        );
    }, [subscriptions]);

    return { subscriptions, loading, initializing, error, toggleSubscription, isSubscribed };
}
