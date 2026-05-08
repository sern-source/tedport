// Enes Doğanay | 6 Mayıs 2026: AuthContext — slim provider, yükler iki hook'a delege eder
import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { supabase, supabaseUrl } from './supabaseClient'; // Enes Doğanay | 8 Mayıs 2026: onAuthStateChange için
import { setRealtimeAuth, signOutGlobal } from './services/authService';
import { useAuthLoader } from './hooks/useAuthLoader';
import { useAuthNotifications } from './hooks/useAuthNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loader = useAuthLoader();
  // Enes Doğanay | 7 Mayıs 2026: Stable callback — inline yazılırsa her AuthProvider render'ında realtime kanal kopar
  const onNewNotification = useCallback(() => {}, []);
  const notifs = useAuthNotifications({
    authChecked: loader.authChecked,
    realtimeUserId: loader.realtimeUserId,
    notifPrefsRef: loader.notifPrefsRef,
    onNewNotification,
    managedCompanyId: loader.managedCompanyId,
  });

  useEffect(() => {
    const authFallbackTimer = setTimeout(() => {
      loader.setAuthChecked(prev => { if (!prev) return true; return prev; });
    }, 5000);
    loader.loadUserData().catch(() => {}).finally(() => clearTimeout(authFallbackTimer));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (loader.isLoggingOutRef.current) return;
      // Enes Doğanay | 7 Mayıs 2026: Login akışı sırasında (validatingLoginRef=true) gelen SIGNED_OUT
      // sinyali yok sayılır — authService.signIn içindeki scope:'local' signOut'tan kaynaklanır
      if (event === 'SIGNED_OUT') {
        if (!loader.validatingLoginRef.current) { loader.clearAuthState(); loader.setAuthChecked(true); }
        return;
      }
      if (event === 'TOKEN_REFRESHED') {
        if (session?.access_token) setRealtimeAuth(session.access_token);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (loader.validatingLoginRef.current) return;
        const currentUserId = loader.userIdRef.current;
        const incomingUserId = session?.user?.id;
        if (currentUserId && incomingUserId && currentUserId !== incomingUserId) return;
        if (session?.access_token) setRealtimeAuth(session.access_token);
        loader.loadUserData().catch(() => {});
      }
    });
    return () => { subscription.unsubscribe(); clearTimeout(authFallbackTimer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Enes Doğanay | 7 Mayıs 2026: useCallback — context consumer'lar yeniden render edilmesin
  const logout = useCallback(async () => {
    loader.isLoggingOutRef.current = true;
    await signOutGlobal();
    try {
      const projectRef = new URL(supabaseUrl).host.split('.')[0];
      window.localStorage.removeItem(`sb-${projectRef}-auth-token`);
      window.sessionStorage.removeItem(`sb-${projectRef}-auth-token`);
      window.localStorage.removeItem('tedport-auth-storage-mode');
      window.sessionStorage.removeItem('tedport-auth-storage-mode');
      window.sessionStorage.removeItem('tom_compare_hint_dismissed');
    } catch {}
    loader.clearAuthState();
    loader.setAuthChecked(true);
    setTimeout(() => { loader.isLoggingOutRef.current = false; }, 2000);
  }, [loader.clearAuthState, loader.setAuthChecked]);

  const setValidatingLogin = useCallback((v) => { loader.validatingLoginRef.current = v; }, []);

  // Enes Doğanay | 7 Mayıs 2026: useMemo — herhangi bir state değişince yalnızca ilgili consumer'lar re-render edilir
  const value = useMemo(() => ({
    authChecked: loader.authChecked,
    userProfile: loader.userProfile,
    getUserId: loader.getUserId,
    isCurrentUserAdmin: loader.isCurrentUserAdmin,
    managedCompanyId: loader.managedCompanyId,
    managedCompanyName: loader.managedCompanyName,
    unreadNotifCount: loader.unreadNotifCount,
    pendingQuoteCount: loader.pendingQuoteCount,
    myOffersUnreadCount: loader.myOffersUnreadCount,
    setMyOffersUnreadCount: loader.setMyOffersUnreadCount,
    ihaleYonetimiUnreadCount: loader.ihaleYonetimiUnreadCount,
    setIhaleYonetimiUnreadCount: loader.setIhaleYonetimiUnreadCount,
    toasts: notifs.toasts,
    dismissToast: notifs.dismissToast,
    logout,
    refreshCounts: loader.refreshCounts,
    latestNotification: notifs.latestNotification,
    setActiveViewingTeklifId: notifs.setActiveViewingTeklifId,
    updateNotifPrefsCache: loader.updateNotifPrefsCache,
    setValidatingLogin,
    reloadUserData: loader.loadUserData,
  }), [
    loader.authChecked, loader.userProfile, loader.getUserId, loader.isCurrentUserAdmin,
    loader.managedCompanyId, loader.managedCompanyName, loader.unreadNotifCount,
    loader.pendingQuoteCount, loader.myOffersUnreadCount, loader.setMyOffersUnreadCount,
    loader.ihaleYonetimiUnreadCount, loader.setIhaleYonetimiUnreadCount,
    loader.refreshCounts, loader.updateNotifPrefsCache, loader.loadUserData,
    notifs.toasts, notifs.dismissToast, notifs.latestNotification, notifs.setActiveViewingTeklifId,
    logout, setValidatingLogin,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
