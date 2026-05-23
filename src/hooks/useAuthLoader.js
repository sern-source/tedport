// Enes Doğanay | 7 Mayıs 2026: Auth veri yukleme koordinator — state, oturum, profil
import { useState, useRef, useCallback } from 'react';
import { isAdminEmail } from '../pages/Admin/adminAccess';
import { resolveIsAdminUser } from '../services/corporateApplicationsApi';
import { fetchUserProfile, fetchOwnedCompanyId, fetchUnreadNotifications, fetchNotifPrefs, upsertOAuthProfile, getAuthSession, setRealtimeAuth, signOutGlobal } from '../services/authService';
import { NOTIF_TYPE_TO_PREF_KEY, COMPANY_TENDER_TYPES } from '../constants/notifTypes';
import { useAuthBadgeCounts } from './useAuthBadgeCounts';

export const useAuthLoader = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
    const [managedCompanyId, setManagedCompanyId] = useState(null);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [realtimeUserId, setRealtimeUserId] = useState(null);

    const userIdRef = useRef(null);
    const notifPrefsRef = useRef(null);
    const isLoggingOutRef = useRef(false);
    const validatingLoginRef = useRef(false);
    const isLoadingRef = useRef(false);
    const isRefreshingRef = useRef(false);

    const badges = useAuthBadgeCounts({ managedCompanyId, setUnreadNotifCount, notifPrefsRef });

    const clearAuthState = useCallback(() => {
        setRealtimeUserId(null);
        userIdRef.current = null;
        setUserProfile(null);
        setIsCurrentUserAdmin(false);
        setManagedCompanyId(null);
        badges.setManagedCompanyName(null);
        setUnreadNotifCount(0);
        // Enes Doğanay | 7 Mayıs 2026: Logout'ta tüm badge sayıları sıfırlanır
        badges.setPendingQuoteCount(0);
        badges.setMyOffersUnreadCount(0);
        badges.setIhaleYonetimiUnreadCount(0);
        // Enes Doğanay | 23 Mayıs 2026: Middleware cookie'sini temizle
        if (typeof document !== 'undefined') document.cookie = 'tedport-session=; path=/; max-age=0; SameSite=Lax';
    }, [badges.setManagedCompanyName, badges.setPendingQuoteCount, badges.setMyOffersUnreadCount, badges.setIhaleYonetimiUnreadCount]);

    const loadUserData = useCallback(async () => {
        if (isLoggingOutRef.current || isLoadingRef.current) return;
        isLoadingRef.current = true;
        try {
            const session = await getAuthSession();
            const user = session?.user;
            setAuthChecked(true);
            if (!user) { clearAuthState(); return; }
            if (session?.access_token) setRealtimeAuth(session.access_token);
            setRealtimeUserId(user.id);
            userIdRef.current = user.id;
            try {
                const [adminResult, companyId, profileResult, unreadNotifs, prefs] = await Promise.all([
                    resolveIsAdminUser(user.email, isAdminEmail),
                    fetchOwnedCompanyId(user.id),
                    fetchUserProfile(user.id),
                    fetchUnreadNotifications(user.id),
                    fetchNotifPrefs(user.id),
                ]);
                // Enes Doğanay | 23 Mayıs 2026: profileResult.error yerine !data kontrolü —
                // .maybeSingle() ağ/RLS hatasında error döndürür ama satır yoksa data=null error=null döner;
                // sadece gerçekten profil yoksa OAuth insert çalışır
                if (!profileResult.data && !profileResult.error) {
                    const meta = user.user_metadata;
                    if (meta && (meta.full_name || meta.name || meta.email)) {
                        const { error: upsertError, profile: oauthProfile } = await upsertOAuthProfile(user.id, meta, user.email, navigator.userAgent, user.app_metadata?.provider || 'oauth');
                        if (upsertError) { await signOutGlobal(); clearAuthState(); return; }
                        profileResult.data = oauthProfile;
                    } else { await signOutGlobal(); clearAuthState(); return; }
                }
                setIsCurrentUserAdmin(adminResult);
                notifPrefsRef.current = prefs;
                // Enes Doğanay | 7 Mayıs 2026: Şirket teklif bildirimleri (firma_id'li) kiŞisel sayaca dahil edilmez
                const filtered = prefs
                    ? unreadNotifs.filter(n => {
                        const pk = NOTIF_TYPE_TO_PREF_KEY[n.type];
                        if (pk && prefs[pk] === false) return false;
                        if (!companyId && COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id) return false;
                        return true;
                    })
                    : unreadNotifs.filter(n => !(!companyId && COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id));
                setUnreadNotifCount(filtered.length);
                // Enes Doğanay | 7 Mayıs 2026: Flash önleme — kurumsal hesapta setUserProfile'dan önce
                // loadBadgeCounts çalıştırılır (firma adını içten set eder). React 18 automatic
                // batching: loadBadgeCounts resolve olunca hemen arkasından gelen setManagedCompanyId +
                // setUserProfile aynı sync continuation'da → tek render'da doğru firma adıyla görünür.
                await badges.loadBadgeCounts(user.id, companyId);
                setManagedCompanyId(companyId);
                // Enes Doğanay | 13 Mayıs 2026: email AuthContext'te de tutulur — alertService için
                setUserProfile({ ...(profileResult.data || { first_name: 'Profilime', last_name: 'Git' }), id: user.id, email: user.email });
                // Enes Doğanay | 23 Mayıs 2026: Middleware cookie — oturum doğrulandı, /profile ve /firma-profil erişilebilir
                if (typeof document !== 'undefined') document.cookie = 'tedport-session=1; path=/; SameSite=Lax';
            } catch {
                /* sessiz — AbortError veya ağ hatası, session etkilenmez */
            }
        } catch (authErr) {
            if (authErr?.name !== 'AbortError' && !authErr?.message?.includes('abort')) {
                clearAuthState();
            }
        } finally {
            isLoadingRef.current = false;
            setAuthChecked(true);
        }
    }, [clearAuthState, badges.loadBadgeCounts]);

    // Enes Doğanay | 7 Mayıs 2026: useCallback — AuthContext useMemo dep array'de kararlı referans
    const refreshCounts = useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        try {
            await badges.refreshBadges(userIdRef.current);
        } finally { isRefreshingRef.current = false; }
    }, [badges.refreshBadges]);

    const updateNotifPrefsCache = useCallback(async (newPrefs) => {
        notifPrefsRef.current = newPrefs;
        try {
            const userId = userIdRef.current;
            if (!userId) return;
            const allUnread = await fetchUnreadNotifications(userId);
            // Enes Doğanay | 7 Mayıs 2026: Şirket teklif bildirimleri kiŞisel badge'e dahil edilmez
            const filtered = allUnread.filter(n => {
                const pk = NOTIF_TYPE_TO_PREF_KEY[n.type];
                if (pk && newPrefs[pk] === false) return false;
                if (!managedCompanyId && COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id) return false;
                return true;
            });
            setUnreadNotifCount(filtered.length);
        } catch {
            /* sessiz — bildirim tercihi yenileme başarısız, kritik değil */
        }
    }, [managedCompanyId]);

    // Enes Doğanay | 8 Mayıs 2026: Top-level'a taşındı — return {} içinde useCallback çağırmak anti-pattern (lint + okunabilirlik)
    const getUserId = useCallback(() => userIdRef.current, []);

    return {
        authChecked, setAuthChecked, userProfile, isCurrentUserAdmin, managedCompanyId,
        managedCompanyName: badges.managedCompanyName,
        unreadNotifCount, pendingQuoteCount: badges.pendingQuoteCount,
        myOffersUnreadCount: badges.myOffersUnreadCount, setMyOffersUnreadCount: badges.setMyOffersUnreadCount,
        ihaleYonetimiUnreadCount: badges.ihaleYonetimiUnreadCount, setIhaleYonetimiUnreadCount: badges.setIhaleYonetimiUnreadCount,
        realtimeUserId, setRealtimeUserId,
        userIdRef, notifPrefsRef, isLoggingOutRef, validatingLoginRef,
        loadUserData, refreshCounts, clearAuthState, updateNotifPrefsCache, getUserId,
    };
};
