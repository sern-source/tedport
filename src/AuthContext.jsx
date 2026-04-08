/**
 * AuthContext - Uygulama genelinde auth durumunu tek seferde yönetir
 * Enes Doğanay | 8 Nisan 2026: Sayfa geçişlerinde tekrar sorgu atılmasını önler
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';
import { getManagedCompanyId } from './companyManagementApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [managedCompanyId, setManagedCompanyId] = useState(null);
  const [managedCompanyName, setManagedCompanyName] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [pendingQuoteCount, setPendingQuoteCount] = useState(0);
  // Enes Doğanay | 8 Nisan 2026: Anlık toast bildirimleri state'i
  const [toasts, setToasts] = useState([]);
  const realtimeChannelRef = useRef(null);
  const userIdRef = useRef(null);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Enes Doğanay | 8 Nisan 2026: Realtime subscription için user id'yi ref'te tut
      userIdRef.current = session.user.id;
      const [adminResult, companyId, profileResult, notifResult] = await Promise.all([
        resolveIsAdminUser(session.user.email, isAdminEmail),
        getManagedCompanyId(),
        supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single(),
        supabase.from('bildirimler').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('is_read', false)
      ]);

      setIsCurrentUserAdmin(adminResult);
      setManagedCompanyId(companyId);
      setUserProfile(profileResult.data || { first_name: 'Profilime', last_name: 'Git' });
      setUnreadNotifCount(notifResult.count || 0);

      if (companyId) {
        const [firmResult, quoteResult] = await Promise.all([
          supabase.from('firmalar').select('firma_adi').eq('firmaID', companyId).single(),
          supabase.from('teklif_talepleri').select('id', { count: 'exact', head: true }).eq('firma_id', companyId).eq('durum', 'pending')
        ]);
        setManagedCompanyName(firmResult.data?.firma_adi || null);
        setPendingQuoteCount(quoteResult.count || 0);
      } else {
        setManagedCompanyName(null);
        const { count: quoteCount } = await supabase
          .from('teklif_talepleri')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('durum', 'pending');
        setPendingQuoteCount(quoteCount || 0);
      }
    } else {
      userIdRef.current = null;
      setUserProfile(null);
      setIsCurrentUserAdmin(false);
      setManagedCompanyId(null);
      setManagedCompanyName(null);
      setUnreadNotifCount(0);
      setPendingQuoteCount(0);
    }
    setAuthChecked(true);
  };

  useEffect(() => {
    loadUserData();

    // Enes Doğanay | 8 Nisan 2026: Auth değişikliklerini dinle (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Küçük gecikme ile çakışmaları önle
      setTimeout(() => loadUserData(), 100);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setIsCurrentUserAdmin(false);
    setManagedCompanyId(null);
    setManagedCompanyName(null);
    setUnreadNotifCount(0);
    setPendingQuoteCount(0);
  };

  // Enes Doğanay | 8 Nisan 2026: Badge sayılarını yenileme (bildirim okunduysa, teklif durum değiştiyse vb.)
  const refreshCounts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { count: notifCount } = await supabase
      .from('bildirimler')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    setUnreadNotifCount(notifCount || 0);

    // Enes Doğanay | 8 Nisan 2026: Bekleyen teklif sayısını da yenile
    const cid = await getManagedCompanyId();
    if (cid) {
      const { count: qCount } = await supabase
        .from('teklif_talepleri')
        .select('id', { count: 'exact', head: true })
        .eq('firma_id', cid)
        .eq('durum', 'pending');
      setPendingQuoteCount(qCount || 0);
    } else {
      const { count: qCount } = await supabase
        .from('teklif_talepleri')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('durum', 'pending');
      setPendingQuoteCount(qCount || 0);
    }
  };

  // Enes Doğanay | 8 Nisan 2026: Toast bildirimi kaldır (animasyonlu)
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.map(t => t.id === toastId ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 350);
  }, []);

  // Enes Doğanay | 8 Nisan 2026: Supabase realtime — bildirimler tablosundaki INSERT'leri dinle
  useEffect(() => {
    if (!authChecked || !userIdRef.current) {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      return;
    }

    const userId = userIdRef.current;
    const channel = supabase
      .channel('toast-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bildirimler', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new;
          setToasts(prev => [...prev, {
            id: n.id,
            type: n.type || 'default',
            title: n.title || 'Yeni Bildirim',
            message: n.message || '',
            exiting: false
          }]);
          setUnreadNotifCount(prev => prev + 1);
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [authChecked, userIdRef.current]);

  return (
    <AuthContext.Provider value={{
      authChecked,
      userProfile,
      isCurrentUserAdmin,
      managedCompanyId,
      managedCompanyName,
      unreadNotifCount,
      pendingQuoteCount,
      toasts,
      dismissToast,
      logout,
      refreshCounts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
