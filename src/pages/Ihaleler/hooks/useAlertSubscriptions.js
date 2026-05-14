// Enes Doğanay | 13 Mayıs 2026: Çoklu uyarı aboneliği hook — kategori bazlı toggle
// Enes Doğanay | 14 Mayıs 2026: Toplu işlemler için subscribeToAlertsAll / unsubscribeAllAlerts kullanılıyor
import { useState, useEffect, useCallback } from 'react';
import { getUserAlerts, subscribeToAlerts, unsubscribeFromAlerts, subscribeToAlertsAll, unsubscribeAllAlerts } from '../../../services/alertService';
import { SEKTORLER } from '../../Firmalar/utils/sektorData';

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

    // Enes Doğanay | 14 Mayıs 2026: Tüm İhaleler için batch işlem; tek sektör değişimi için tekli sorgu
    const toggleSubscription = useCallback(async (kategori) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            if (kategori === null) {
                const nullSub = subscriptions.find(s => s.kategori === null);
                if (nullSub) {
                    // Tüm abonelikleri tek sorguda kaldır
                    await unsubscribeAllAlerts(userId);
                    setSubscriptions([]);
                } else {
                    // Null + tüm sektörleri batch insert/update ile abone ol (tek round-trip)
                    const all = await subscribeToAlertsAll(userId, [null, ...SEKTORLER]);
                    setSubscriptions(all);
                }
            } else {
                const existing = subscriptions.find(s => s.kategori === kategori);
                const nullSub = subscriptions.find(s => s.kategori === null);
                if (existing) {
                    // Sektörü kaldır; null aboneliği de varsa onu da kaldır
                    const toRemove = nullSub ? [existing.id, nullSub.id] : [existing.id];
                    await Promise.all(toRemove.map(id => unsubscribeFromAlerts(id)));
                    setSubscriptions(prev => prev.filter(s => !toRemove.includes(s.id)));
                } else {
                    const newSub = await subscribeToAlerts(userId, kategori);
                    setSubscriptions(prev => [...prev, { ...newSub, kategori }]);
                }
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
