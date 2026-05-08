// Enes Doğanay | 7 Mayıs 2026: Badge sayıları — firma vs bireysel, refresh
import { useState, useCallback } from 'react';
import { fetchCompanyBadgeCounts, fetchIndividualBadgeCounts, fetchUnreadNotifications } from '../services/authService';
import { NOTIF_TYPE_TO_PREF_KEY, COMPANY_TENDER_TYPES } from '../constants/notifTypes';

export const useAuthBadgeCounts = ({ managedCompanyId, setUnreadNotifCount, notifPrefsRef }) => {
    const [pendingQuoteCount, setPendingQuoteCount] = useState(0);
    const [myOffersUnreadCount, setMyOffersUnreadCount] = useState(0);
    const [ihaleYonetimiUnreadCount, setIhaleYonetimiUnreadCount] = useState(0);
    const [managedCompanyName, setManagedCompanyName] = useState(null);

    const loadBadgeCounts = useCallback(async (userId, companyId) => {
        if (companyId) {
            try {
                const counts = await fetchCompanyBadgeCounts(companyId);
                setManagedCompanyName(counts.firmaAdi);
                setPendingQuoteCount(counts.pendingQuoteCount);
                setIhaleYonetimiUnreadCount(counts.ihaleYonetimiUnreadCount);
            } catch (err) {
                if (err?.name !== 'AbortError') { /* sessiz — badge yükleme başarısız, kritik değil */ }
            }
        } else {
            setManagedCompanyName(null);
            try {
                const counts = await fetchIndividualBadgeCounts(userId);
                setPendingQuoteCount(counts.pendingQuoteCount);
                setMyOffersUnreadCount(counts.myOffersUnreadCount);
            } catch (err) {
                if (err?.name !== 'AbortError') { /* sessiz — badge yükleme başarısız, kritik değil */ }
            }
        }
    }, []);

    const refreshBadges = useCallback(async (userId) => {
        try {
            const allUnread = await fetchUnreadNotifications(userId);
            const prefs = notifPrefsRef.current;
            // Enes Doğanay | 7 Mayıs 2026: Şirket teklif bildirimleri kiŞisel badge'e dahil edilmez
            const filtered = prefs
                ? allUnread.filter(n => {
                    const pk = NOTIF_TYPE_TO_PREF_KEY[n.type];
                    if (pk && prefs[pk] === false) return false;
                    if (!managedCompanyId && COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id) return false;
                    return true;
                })
                : allUnread.filter(n => !(!managedCompanyId && COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id));
            setUnreadNotifCount(filtered.length);
            if (managedCompanyId) {
                const counts = await fetchCompanyBadgeCounts(managedCompanyId);
                setPendingQuoteCount(counts.pendingQuoteCount);
                setIhaleYonetimiUnreadCount(counts.ihaleYonetimiUnreadCount);
            } else {
                const counts = await fetchIndividualBadgeCounts(userId);
                setPendingQuoteCount(counts.pendingQuoteCount);
                setMyOffersUnreadCount(counts.myOffersUnreadCount);
            }
        } catch (err) {
            if (err?.name !== 'AbortError') { /* sessiz — badge yenileme başarısız, kritik değil */ }
        }
    }, [managedCompanyId, setUnreadNotifCount, notifPrefsRef]);

    return {
        pendingQuoteCount, setPendingQuoteCount,
        myOffersUnreadCount, setMyOffersUnreadCount,
        ihaleYonetimiUnreadCount, setIhaleYonetimiUnreadCount,
        managedCompanyName, setManagedCompanyName,
        loadBadgeCounts, refreshBadges,
    };
};
