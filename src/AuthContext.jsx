/**
 * AuthContext - Uygulama genelinde auth durumunu tek seferde yönetir
 * Enes Doğanay | 8 Nisan 2026: Sayfa geçişlerinde tekrar sorgu atılmasını önler
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
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

  // Enes Doğanay | 8 Nisan 2026: Badge sayılarını yenileme (bildirim okunduysa vb.)
  const refreshCounts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { count: notifCount } = await supabase
      .from('bildirimler')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    setUnreadNotifCount(notifCount || 0);
  };

  return (
    <AuthContext.Provider value={{
      authChecked,
      userProfile,
      isCurrentUserAdmin,
      managedCompanyId,
      managedCompanyName,
      unreadNotifCount,
      pendingQuoteCount,
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
