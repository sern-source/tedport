/**
 * AuthContext - Uygulama genelinde auth durumunu tek seferde yönetir
 * Enes Doğanay | 8 Nisan 2026: Sayfa geçişlerinde tekrar sorgu atılmasını önler
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { supabaseUrl } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';
import { getManagedCompanyId } from './companyManagementApi';

const AuthContext = createContext(null);

/* Enes Doğanay | 17 Nisan 2026: Bildirim tipi → tercih key eşleştirmesi (modül seviyesi) */
const NOTIF_TYPE_TO_PREF_KEY = {
  quote_received: 'teklif_talepleri',
  quote_reply: 'teklif_yanitlari',
  quote_message: 'teklif_mesajlari',
  reminder: 'hatirlatmalar',
  tender_new_offer: 'ihale_teklifleri',
  tender_offer_updated: 'ihale_teklifleri',
  tender_offer_withdrawn: 'ihale_teklifleri',
  tender_offer_status: 'ihale_durum_degisiklikleri',
  tender_updated: 'ihale_durum_degisiklikleri',
  tender_closed: 'ihale_durum_degisiklikleri',
  tender_cancelled: 'ihale_durum_degisiklikleri'
};

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
  /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihlerini cache'le — loadUserData ve realtime handler'da kullanılır */
  const notifPrefsRef = useRef(null);

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

  // Enes Doğanay | 10 Nisan 2026: Logout sırasında auto-refresh yarış koşulunu engelleyen flag
  const isLoggingOutRef = useRef(false);

  // Enes Doğanay | 13 Nisan 2026: useCallback ile sarıldı — stabil referans, gereksiz yeniden oluşturma önlenir
  const loadUserData = useCallback(async () => {
    // Enes Doğanay | 10 Nisan 2026: Logout sırasında session tekrar yüklenmesin
    if (isLoggingOutRef.current) return;
    try {
      // Enes Doğanay | 10 Nisan 2026: getSession localStorage/memory'den okur — hızlı, network yok
      // Şifre değişikliğinde refresh token revoke olur → getSession otomatik null döner
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        clearAuthState();
        return;
      }

      // Enes Doğanay | 9 Nisan 2026: Realtime RLS için access_token'ı global olarak set et
      if (session.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
      setRealtimeUserId(session.user.id);

      // Enes Doğanay | 10 Nisan 2026: Veri yükleme — hata olursa session temizle (stale token tespiti)
      const [adminResult, companyResult, profileResult, notifResult, prefsResult] = await Promise.all([
        resolveIsAdminUser(session.user.email, isAdminEmail),
        supabase.from('kurumsal_firma_yoneticileri').select('firma_id').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single(),
        /* Enes Doğanay | 17 Nisan 2026: type dahil çek — tercih filtresi için */
        supabase.from('bildirimler').select('id, type').eq('user_id', session.user.id).eq('is_read', false),
        /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihlerini de ilk yüklemede çek */
        supabase.from('bildirim_tercihleri').select('*').eq('user_id', session.user.id).maybeSingle()
      ]);

      // Enes Doğanay | 14 Nisan 2026: Google OAuth kullanıcıları için profil satırı yoksa otomatik oluştur
      if (profileResult.error) {
        const meta = session.user.user_metadata;
        if (meta && (meta.full_name || meta.name || meta.email)) {
          const fullName = meta.full_name || meta.name || '';
          const nameParts = fullName.trim().split(/\s+/);
          const autoFirstName = nameParts[0] || meta.email?.split('@')[0] || 'Kullanıcı';
          const autoLastName = nameParts.slice(1).join(' ') || '';
          const autoProfile = {
            id: session.user.id,
            first_name: autoFirstName,
            last_name: autoLastName,
            email: meta.email || session.user.email || '',
            avatar: meta.avatar_url || null
          };
          const { error: insertError } = await supabase.from('profiles').upsert(autoProfile);
          if (insertError) {
            try { await supabase.auth.signOut(); } catch {}
            clearAuthState();
            return;
          }
          profileResult.data = { first_name: autoFirstName, last_name: autoLastName };
        } else {
          try { await supabase.auth.signOut(); } catch {}
          clearAuthState();
          return;
        }
      }

      const companyId = companyResult.data?.firma_id || null;
      setIsCurrentUserAdmin(adminResult);
      setManagedCompanyId(companyId);
      setUserProfile(profileResult.data || { first_name: 'Profilime', last_name: 'Git' });

      /* Enes Doğanay | 17 Nisan 2026: Tercihleri cache'le ve filtrelenmiş sayacı hesapla */
      const prefs = prefsResult.data || null;
      notifPrefsRef.current = prefs;
      const unreadAll = notifResult.data || [];
      const filteredUnread = prefs
        ? unreadAll.filter(n => { const pk = NOTIF_TYPE_TO_PREF_KEY[n.type]; return !(pk && prefs[pk] === false); })
        : unreadAll;
      setUnreadNotifCount(filteredUnread.length);

      // Enes Doğanay | 13 Nisan 2026: Girintileme düzeltildi
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
    } catch (err) {
      // Enes Doğanay | 10 Nisan 2026: AbortError = race condition, state'i temizleme — onAuthStateChange tekrar tetikleyecek
      // Enes Doğanay | 16 Nisan 2026: name kontrolü eklendi — DOMException AbortError'ları da yakala
      if (err?.name === 'AbortError' || err?.message?.includes('abort')) return;
      console.error('Auth hatası:', err);
      clearAuthState();
    } finally {
      setAuthChecked(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Enes Doğanay | 16 Nisan 2026: Unhandled promise rejection önlenir — loadUserData kendi içinde catch eder ama güvenlik için
    loadUserData().catch(() => {});

    // Enes Doğanay | 10 Nisan 2026: Event tipine göre akıllı handling — SIGNED_OUT'ta loadUserData çağırma
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Enes Doğanay | 10 Nisan 2026: Logout flag'i aktifken hiçbir event'i işleme — auto-refresh yarışını engelle
      if (isLoggingOutRef.current) return;

      if (event === 'SIGNED_OUT') {
        // Enes Doğanay | 10 Nisan 2026: Logout — direkt state temizle, loadUserData çağırma
        clearAuthState();
        setAuthChecked(true);
        return;
      }

      // Token yenilendiğinde realtime auth'u güncelle
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
      // Enes Doğanay | 16 Nisan 2026: setTimeout içindeki promise yakalanır — Uncaught AbortError önlenir
      setTimeout(() => loadUserData().catch(() => {}), 100);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    // Enes Doğanay | 10 Nisan 2026: Flag ile auto-refresh'in session'ı geri getirmesini engelle
    isLoggingOutRef.current = true;
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}
    // Storage'ı manuel temizle — auto-refresh kalıntısı kalmasın
    // Enes Doğanay | 13 Nisan 2026: supabaseUrl import'u kullanıldı — hardcoded URL kaldırıldı
    try {
      const projectRef = new URL(supabaseUrl).host.split('.')[0];
      window.localStorage.removeItem(`sb-${projectRef}-auth-token`);
      window.sessionStorage.removeItem(`sb-${projectRef}-auth-token`);
      window.localStorage.removeItem('tedport-auth-storage-mode');
      window.sessionStorage.removeItem('tedport-auth-storage-mode');
      /* Enes Doğanay | 15 Nisan 2026: Çıkışta onboarding ipuçlarını sıfırla */
      window.sessionStorage.removeItem('tom_compare_hint_dismissed');
    } catch {}
    clearAuthState();
    setAuthChecked(true);
    // Flag'i 2sn sonra kaldır — auto-refresh timer'ı ölmüş olur
    setTimeout(() => { isLoggingOutRef.current = false; }, 2000);
  };

  // Enes Doğanay | 8 Nisan 2026: Badge sayılarını yenileme (bildirim okunduysa, teklif durum değiştiyse vb.)
  const refreshCounts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    /* Enes Doğanay | 17 Nisan 2026: Tercih filtresinden geçirilmiş sayaç */
    const { data: allUnread } = await supabase
      .from('bildirimler')
      .select('id, type')
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    const prefs = notifPrefsRef.current;
    const filtered = prefs
      ? (allUnread || []).filter(n => { const pk = NOTIF_TYPE_TO_PREF_KEY[n.type]; return !(pk && prefs[pk] === false); })
      : (allUnread || []);
    setUnreadNotifCount(filtered.length);

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

    /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihlerini DB'den çek ve cache'le */
    (async () => {
      const { data } = await supabase
        .from('bildirim_tercihleri')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      notifPrefsRef.current = data;
    })();

    // Enes Doğanay | 9 Nisan 2026: Yeni bildirimi toast + state'e ekleyen ortak fonksiyon
    /* Enes Doğanay | 9 Nisan 2026: Kullanıcı zaten ilgili teklifin chat'indeyse toast gösterme */
    const handleNewNotification = (n) => {
      if (!n || !n.id) return;

      /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihine göre filtrele — tercih kapalıysa tamamen yok say */
      const prefs = notifPrefsRef.current;
      if (prefs) {
        const prefKey = NOTIF_TYPE_TO_PREF_KEY[n.type];
        if (prefKey && prefs[prefKey] === false) return;
      }

      const isQuoteNotif = (n.type === 'quote_reply' || n.type === 'quote_message' || n.type === 'quote_received');
      const notifTeklifId = n.metadata?.teklif_id;
      const isViewingThisChat = isQuoteNotif && notifTeklifId && activeViewingTeklifIdRef.current === notifTeklifId;

      if (!isViewingThisChat) {
        /* Enes Doğanay | 17 Nisan 2026: Anlık bildirimler (pop-up) tercihi kapalıysa toast gösterme */
        if (!prefs || prefs.anlik_bildirimler !== false) {
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
        }
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
          /* Enes Doğanay | 17 Nisan 2026: Okunmamış sayısını tercih filtresinden geçir */
          const { data: allUnread } = await supabase
            .from('bildirimler')
            .select('id, type')
            .eq('user_id', userId)
            .eq('is_read', false);
          const prefs = notifPrefsRef.current;
          const filtered = prefs
            ? (allUnread || []).filter(n => { const pk = NOTIF_TYPE_TO_PREF_KEY[n.type]; return !(pk && prefs[pk] === false); })
            : (allUnread || []);
          setUnreadNotifCount(filtered.length);
        }
      }, 10000);
    })();

    return () => {
      if (notifPollInterval) clearInterval(notifPollInterval);
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [authChecked, realtimeUserId]);

  /* Enes Doğanay | 17 Nisan 2026: Profile/FirmaProfil'den tercih değiştiğinde cache + sayacı güncelle */
  const updateNotifPrefsCache = useCallback(async (newPrefs) => {
    notifPrefsRef.current = newPrefs;
    /* Sayacı yeniden hesapla — DB'den okunmamış bildirimleri çekip filtrele */
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: allUnread } = await supabase
        .from('bildirimler')
        .select('id, type')
        .eq('user_id', session.user.id)
        .eq('is_read', false);
      const filtered = (allUnread || []).filter(n => {
        const pk = NOTIF_TYPE_TO_PREF_KEY[n.type];
        return !(pk && newPrefs[pk] === false);
      });
      setUnreadNotifCount(filtered.length);
    } catch { /* sessiz */ }
  }, []);

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
      setActiveViewingTeklifId,
      updateNotifPrefsCache
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
