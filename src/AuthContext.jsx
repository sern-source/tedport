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
  // Enes Doğanay | 9 Nisan 2026: Realtime userId state olarak tutulur (ref re-render tetiklemez, dependency'de çalışmaz)
  const [realtimeUserId, setRealtimeUserId] = useState(null);
  // Enes Doğanay | 9 Nisan 2026: Son gelen bildirim — alt componentlerin anlık bildirim alması için
  const [latestNotification, setLatestNotification] = useState(null);
  /* Enes Doğanay | 9 Nisan 2026: Aktif görüntülenen teklif chat id'si — toast bastırmak için */
  const activeViewingTeklifIdRef = useRef(null);
  const setActiveViewingTeklifId = useCallback((id) => { activeViewingTeklifIdRef.current = id; }, []);

  // Enes Doğanay | 10 Nisan 2026: State'i temizleyen yardımcı — tekrar kullanım için
  const clearAuthState = () => {
    setRealtimeUserId(null);
    setUserProfile(null);
    setIsCurrentUserAdmin(false);
    setManagedCompanyId(null);
    setManagedCompanyName(null);
    setUnreadNotifCount(0);
    setPendingQuoteCount(0);
  };

  const loadUserData = async () => {
    try {
      // Enes Doğanay | 10 Nisan 2026: getSession localStorage'dan okur (network çağrısı yok)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        clearAuthState();
        return;
      }

      // Enes Doğanay | 10 Nisan 2026: Session var ama geçerli mi? getUser ile doğrula (network çağrısı)
      // Şifre/email değişikliğinde token revoke olur — bunu tespit etmek şart
      let sessionStale = false;
      try {
        const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser();
        if (verifyError || !verifiedUser) sessionStale = true;
      } catch (verifyErr) {
        // getUser fırlattı (abort/network) — geçici hata, session'ı geçerli kabul et
        if (verifyErr?.message?.includes('abort')) {
          sessionStale = false; // AbortError → devam et
        } else {
          sessionStale = true; // Gerçek hata → stale
        }
      }

      if (sessionStale) {
        // Token geçersiz — storage'dan temizle, header "Giriş Yap" göstersin
        try { await supabase.auth.signOut(); } catch {}
        clearAuthState();
        return;
      }

      // Enes Doğanay | 9 Nisan 2026: Realtime RLS için access_token'ı global olarak set et
      if (session.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
      setRealtimeUserId(session.user.id);

      // Enes Doğanay | 10 Nisan 2026: Veri yükleme ayrı try/catch — hata olursa session'ı öldürme
      // getManagedCompanyId() yerine direkt sorgu — fazladan getUser() çağrısını önler (AbortError kaynağıydı)
      try {
        const [adminResult, companyResult, profileResult, notifResult] = await Promise.all([
          resolveIsAdminUser(session.user.email, isAdminEmail),
          supabase.from('kurumsal_firma_yoneticileri').select('firma_id').eq('user_id', session.user.id).maybeSingle(),
          supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single(),
          supabase.from('bildirimler').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('is_read', false)
        ]);

        const companyId = companyResult.data?.firma_id || null;
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
          /* Enes Doğanay | 9 Nisan 2026: Bireysel kullanıcı için okunmamış teklif yanıt/mesaj bildirimlerini say */
          const { count: quoteNotifCount } = await supabase
            .from('bildirimler')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false)
            .in('type', ['quote_reply', 'quote_message']);
          setPendingQuoteCount(quoteNotifCount || 0);
        }
      } catch (dataErr) {
        // Enes Doğanay | 10 Nisan 2026: Veri sorgusu başarısız ama session geçerli
        // Session'ı öldürme! Minimal profil göster, kullanıcı giriş yapmış olarak kalsın
        if (!dataErr?.message?.includes('abort')) {
          console.error('Kullanıcı verisi yüklenemedi:', dataErr);
        }
        setUserProfile(prev => prev || { first_name: session.user.email?.split('@')[0] || 'Kullanıcı', last_name: '' });
      }
    } catch (err) {
      // Enes Doğanay | 10 Nisan 2026: getSession bile çöktüyse — tamamen beklenmedik hata
      // signOut çağırma — ölüm sarmalı yaratır (onAuthStateChange → loadUserData → signOut → ...)
      if (!err?.message?.includes('abort')) {
        console.error('Auth hatası:', err);
      }
      clearAuthState();
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    loadUserData();

    // Enes Doğanay | 8 Nisan 2026: Auth değişikliklerini dinle (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Enes Doğanay | 9 Nisan 2026: Token yenilendiğinde realtime auth'u da güncelle
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
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
      /* Enes Doğanay | 9 Nisan 2026: Bireysel kullanıcı için okunmamış teklif yanıt/mesaj bildirimi say */
      const { count: qCount } = await supabase
        .from('bildirimler')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false)
        .in('type', ['quote_reply', 'quote_message']);
      setPendingQuoteCount(qCount || 0);
    }
  };

  // Enes Doğanay | 8 Nisan 2026: Toast bildirimi kaldır (animasyonlu)
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.map(t => t.id === toastId ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 350);
  }, []);

  // Enes Doğanay | 9 Nisan 2026: Supabase realtime — bildirimler tablosundaki INSERT'leri dinle (sync — setAuth loadUserData'da yapılıyor)
  // + Polling fallback: her 10 saniyede bildirim sayısını kontrol et, yeni varsa toast göster
  const lastNotifIdRef = useRef(null);
  useEffect(() => {
    if (!authChecked || !realtimeUserId) {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      return;
    }

    const userId = realtimeUserId;

    // Enes Doğanay | 9 Nisan 2026: Yeni bildirimi toast + state'e ekleyen ortak fonksiyon
    /* Enes Doğanay | 9 Nisan 2026: Kullanıcı zaten ilgili teklifin chat'indeyse toast gösterme */
    const handleNewNotification = (n) => {
      if (!n || !n.id) return;
      const isQuoteNotif = (n.type === 'quote_reply' || n.type === 'quote_message' || n.type === 'quote_received');
      const notifTeklifId = n.metadata?.teklif_id;
      const isViewingThisChat = isQuoteNotif && notifTeklifId && activeViewingTeklifIdRef.current === notifTeklifId;

      if (!isViewingThisChat) {
        setToasts(prev => {
          if (prev.some(t => t.id === n.id)) return prev;
          return [...prev, {
            id: n.id,
            type: n.type || 'default',
            title: n.title || 'Yeni Bildirim',
            message: n.message || '',
            metadata: n.metadata || null,
            firma_id: n.firma_id || null,
            exiting: false
          }];
        });
        setUnreadNotifCount(prev => prev + 1);
      }
      setLatestNotification(n);
      lastNotifIdRef.current = n.id;
    };

    const channel = supabase
      .channel(`toast-notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bildirimler', filter: `user_id=eq.${userId}` },
        (payload) => handleNewNotification(payload.new)
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') console.log('[Realtime] bildirimler kanalına bağlandı, userId:', userId);
        else console.warn('[Realtime] bildirimler kanal durumu:', status, err);
      });

    realtimeChannelRef.current = channel;

    // Enes Doğanay | 9 Nisan 2026: Polling fallback — her 10 sn'de en son bildirimi kontrol et
    // Enes Doğanay | 9 Nisan 2026: İlk açılışta mevcut son bildirimi seed'le — tekrar toast göstermesin
    let notifPollInterval;
    (async () => {
      const { data: seedData } = await supabase
        .from('bildirimler')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (seedData && seedData.length > 0) {
        lastNotifIdRef.current = seedData[0].id;
      }

      notifPollInterval = setInterval(async () => {
        const { data } = await supabase
          .from('bildirimler')
          .select('*')
          .eq('user_id', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          const latest = data[0];
          if (lastNotifIdRef.current !== latest.id) {
            handleNewNotification(latest);
          }
          // Okunmamış sayıyı da güncelle
          const { count } = await supabase
            .from('bildirimler')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);
          setUnreadNotifCount(count || 0);
        }
      }, 10000);
    })();

    return () => {
      if (notifPollInterval) clearInterval(notifPollInterval);
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [authChecked, realtimeUserId]);

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
      refreshCounts,
      latestNotification,
      setActiveViewingTeklifId
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
