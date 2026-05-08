// Enes Doğanay | 6 Mayıs 2026: Realtime bildirimler + toast yönetimi
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { fetchNotifPrefs, fetchLatestNotificationIds } from '../services/authService';
import { NOTIF_TYPE_TO_PREF_KEY, COMPANY_TENDER_TYPES } from '../constants/notifTypes';

export const useAuthNotifications = ({ authChecked, realtimeUserId, notifPrefsRef, onNewNotification, managedCompanyId }) => {
    const [toasts, setToasts] = useState([]);
    const [latestNotification, setLatestNotification] = useState(null);
    const activeViewingTeklifIdRef = useRef(null);
    const seenNotifIdsRef = useRef(new Set());
    const realtimeChannelRef = useRef(null);
    const lastNotifIdRef = useRef(null);

    const setActiveViewingTeklifId = useCallback((id) => { activeViewingTeklifIdRef.current = id; }, []);

    // Enes Doğanay | 8 Nisan 2026: Toast bildirimi kaldır (animasyonlu)
    const dismissToast = useCallback((toastId) => {
        setToasts(prev => prev.map(t => t.id === toastId ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 350);
    }, []);

    // Enes Doğanay | 9 Nisan 2026: Yeni bildirim — toast + count güncelle
    const handleNewNotification = useCallback((n) => {
        if (!n?.id) return;
        // Enes Doğanay | 5 Mayıs 2026: Duplicate guard
        if (seenNotifIdsRef.current.has(n.id)) return;
        if (seenNotifIdsRef.current.size > 500) {
            const oldest = [...seenNotifIdsRef.current].slice(0, 250);
            oldest.forEach(id => seenNotifIdsRef.current.delete(id));
        }
        seenNotifIdsRef.current.add(n.id);
        // Enes Doğanay | 7 Mayıs 2026: Şirket teklif bildirimleri — firma sahibi kullanıcıysa her sayfada toast göster,
        // bireysel kullanıcıysa (managedCompanyId yok) sadece latestNotification set edilir, toast bastirılır.
        const isCompanyTender = COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id;
        if (isCompanyTender && !managedCompanyId) {
            setLatestNotification(n);
            lastNotifIdRef.current = n.id;
            onNewNotification();
            return;
        }
        const prefs = notifPrefsRef.current;
        if (prefs) {
            const prefKey = NOTIF_TYPE_TO_PREF_KEY[n.type];
            if (prefKey && prefs[prefKey] === false) return;
        }
        const isChatNotif = ['quote_reply', 'quote_message', 'quote_received', 'tender_offer_message'].includes(n.type);
        const isViewingThisChat = isChatNotif && n.metadata?.teklif_id && String(activeViewingTeklifIdRef.current) === String(n.metadata.teklif_id);
        if (!isViewingThisChat) {
            if (!prefs || prefs.anlik_bildirimler !== false) {
                setToasts(prev => {
                    if (prev.some(t => t.id === n.id)) return prev;
                    // Enes Doğanay | 5 Mayıs 2026: Max 5 toast
                    return [...prev.slice(-4), { id: n.id, type: n.type || 'default', title: n.title || 'Yeni Bildirim', message: n.message || '', metadata: n.metadata || null, firma_id: n.firma_id || null, exiting: false }];
                });
            }
            onNewNotification();
        }
        // Enes Doğanay | 7 Mayıs 2026: _isViewingChat flag — sayfa effect'inin hangi kola gireceğini bildirir
        // Tüm bildirim tipleri (quote_reply, quote_message, quote_received, tender_offer_message) için çalışır
        setLatestNotification(isViewingThisChat ? { ...n, _isViewingChat: true } : n);
        lastNotifIdRef.current = n.id;
    }, [notifPrefsRef, onNewNotification, managedCompanyId]);

    useEffect(() => {
        if (!authChecked || !realtimeUserId) {
            if (realtimeChannelRef.current) { supabase.removeChannel(realtimeChannelRef.current); realtimeChannelRef.current = null; }
            return;
        }
        const userId = realtimeUserId;
        // Enes Doğanay | 7 Mayıs 2026: Kullanıcı değişince eski seen ID'leri temizle — farklı hesap
        // login olduğunda önceki kullanıcının ID seti kalmış olabilir; clearAuthState bu hook'a erişemez
        seenNotifIdsRef.current = new Set();
        lastNotifIdRef.current = null;
        fetchNotifPrefs(userId).then(p => { notifPrefsRef.current = p; }).catch(() => {});
        // Bilinen son 20 ID'yi seed'le — reconnect'te duplicate toast'ı önler
        fetchLatestNotificationIds(userId).then(ids => {
            if (ids.length > 0) { lastNotifIdRef.current = ids[0]; ids.forEach(id => seenNotifIdsRef.current.add(id)); }
        }).catch(() => {});

        const channel = supabase
            .channel(`toast-notifications-${userId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bildirimler', filter: `user_id=eq.${userId}` },
                payload => handleNewNotification(payload.new))
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED' && status !== 'CLOSED' && status !== 'CHANNEL_ERROR') { /* sessiz — realtime durum geçişi */ }
            });
        realtimeChannelRef.current = channel;
        return () => {
            if (realtimeChannelRef.current) { supabase.removeChannel(realtimeChannelRef.current); realtimeChannelRef.current = null; }
        };
    }, [authChecked, realtimeUserId, handleNewNotification, notifPrefsRef]);

    return { toasts, dismissToast, latestNotification, setActiveViewingTeklifId };
};
