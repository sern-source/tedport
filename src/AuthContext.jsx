/**
 * AuthContext - Uygulama genelinde auth durumunu tek seferde yönetir
 * Enes Doğanay | 8 Nisan 2026: Sayfa geçişlerinde tekrar sorgu atılmasını önler
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { supabaseUrl } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';


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
  tender_cancelled: 'ihale_durum_degisiklikleri',
  /* Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajlaşma bildirimi — teklif_mesajlari'ndan bağımsız */
  tender_offer_message: 'ihale_teklifleri'
};

export function AuthProvider({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [managedCompanyId, setManagedCompanyId] = useState(null);
  const [managedCompanyName, setManagedCompanyName] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [pendingQuoteCount, setPendingQuoteCount] = useState(0);
  // Enes Doğanay | 22 Mayıs 2026: İhale Tekliflerim okunmamış mesaj sayısı — bireysel kullanıcı için
  const [myOffersUnreadCount, setMyOffersUnreadCount] = useState(0);
  // Enes Doğanay | 22 Mayıs 2026: İhale Yönetimi okunmamış mesaj sayısı — kurumsal kullanıcı için
  const [ihaleYonetimiUnreadCount, setIhaleYonetimiUnreadCount] = useState(0);
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

  /* Enes Doğanay | 5 Mayıs 2026: userId ref — reactive state yerine ref kullanılır
   * Bu sayede user.id null→uuid değişince tüm consumer'lar yeniden render olmaz (AbortError cascade önlenir) */
  const userIdRef = useRef(null);
  const getUserId = useCallback(() => userIdRef.current, []);

  // Enes Doğanay | 10 Nisan 2026: State'i temizleyen yardımcı — tekrar kullanım için
  const clearAuthState = () => {
    setRealtimeUserId(null);
    userIdRef.current = null;
    setUserProfile(null);
    setIsCurrentUserAdmin(false);
    setManagedCompanyId(null);
    setManagedCompanyName(null);
    setUnreadNotifCount(0);
    setPendingQuoteCount(0);
    setMyOffersUnreadCount(0);
    setIhaleYonetimiUnreadCount(0);
  };

  // Enes Doğanay | 10 Nisan 2026: Logout sırasında auto-refresh yarış koşulunu engelleyen flag
  const isLoggingOutRef = useRef(false);
  // Enes Doğanay | 2 Mayıs 2026: Sekme doğrulaması sürerken SIGNED_IN → loadUserData'yı engelle
  const validatingLoginRef = useRef(false);
  // Enes Doğanay | 5 Mayıs 2026: Concurrency lock — aynı anda birden fazla loadUserData çalışmasın
  const isLoadingRef = useRef(false);
  // Enes Doğanay | 5 Mayıs 2026: refreshCounts concurrency lock — buton spam veya rapid event'te çift sorgu önle
  const isRefreshingRef = useRef(false);

  /* Enes Doğanay | 5 Mayıs 2026: loadBadgeCounts — loadUserData god function'dan ayrıldı
   * Firma/bireysel badge sayılarını (pending quote, ihale mesajları) bağımsız yükler.
   * Enes Doğanay | 5 Mayıs 2026: useCallback ile sarıldı — loadUserData'nın boş dep array'iyle stale closure riski önlenir.
   * Tüm state setter'lar stable referans (useState garantisi), dep array boş doğru. */
  const loadBadgeCounts = useCallback(async (userId, companyId) => {
    if (companyId) {
      // Enes Doğanay | 5 Mayıs 2026: Her Promise grubu kendi try/catch'i içinde — tek sorgu hatası tüm badge'leri sıfırlamasın
      try {
        const [firmResult, quoteResult, firmTendersResult] = await Promise.all([
          supabase.from('firmalar').select('firma_adi').eq('firmaID', companyId).single(),
          supabase.from('teklif_talepleri').select('id', { count: 'exact', head: true }).eq('firma_id', companyId).eq('durum', 'pending'),
          // Enes Doğanay | 22 Mayıs 2026: İhale yönetimi okunmamış mesaj sayısı
          supabase.from('firma_ihaleleri').select('id').eq('firma_id', companyId)
        ]);
        setManagedCompanyName(firmResult.data?.firma_adi || null);
        setPendingQuoteCount(quoteResult.count || 0);
        const tenderIds = (firmTendersResult.data || []).map(t => t.id);
        if (tenderIds.length > 0) {
          try {
            const { data: allOfferIds } = await supabase.from('ihale_teklifleri').select('id').in('ihale_id', tenderIds);
            const offerIds = (allOfferIds || []).map(o => o.id);
            if (offerIds.length > 0) {
              const { count: tomCount } = await supabase.from('ihale_teklif_mesajlari')
                .select('id', { count: 'exact', head: true })
                .in('teklif_id', offerIds).eq('sender_role', 'bidder').eq('okundu_firma', false);
              setIhaleYonetimiUnreadCount(tomCount || 0);
            } else {
              setIhaleYonetimiUnreadCount(0);
            }
          } catch { setIhaleYonetimiUnreadCount(0); }
        } else {
          setIhaleYonetimiUnreadCount(0);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') console.warn('[Badge] Kurumsal badge yüklenemedi:', err);
      }
    } else {
      setManagedCompanyName(null);
      // Enes Doğanay | 5 Mayıs 2026: Bireysel badge grubu kendi try/catch'i içinde
      try {
        /* Enes Doğanay | 9 Nisan 2026: Bireysel kullanıcı için okunmamış teklif yanıt/mesaj bildirimlerini say */
        const [{ count: quoteNotifCount }, { data: userOffersForMop }] = await Promise.all([
          supabase.from('bildirimler').select('id', { count: 'exact', head: true })
            .eq('user_id', userId).eq('is_read', false).in('type', ['quote_reply', 'quote_message']),
          // Enes Doğanay | 22 Mayıs 2026: İhale teklifleri okunmamış mesaj sayısı için offer id'leri al
          supabase.from('ihale_teklifleri').select('id').eq('user_id', userId)
        ]);
        setPendingQuoteCount(quoteNotifCount || 0);
        // Enes Doğanay | 22 Mayıs 2026: Okunmamış ihale teklif mesajlarını say (bidder tarafı)
        const mopOfferIds = (userOffersForMop || []).map(o => o.id);
        if (mopOfferIds.length > 0) {
          try {
            const { count: mopCount } = await supabase.from('ihale_teklif_mesajlari')
              .select('id', { count: 'exact', head: true })
              .in('teklif_id', mopOfferIds)
              .eq('sender_role', 'company')
              .eq('okundu_bidder', false);
            setMyOffersUnreadCount(mopCount || 0);
          } catch { setMyOffersUnreadCount(0); }
        } else {
          setMyOffersUnreadCount(0);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') console.warn('[Badge] Bireysel badge yüklenemedi:', err);
      }
    }
  }, []); // tüm bağımlılıklar stable (state setter'lar) — boş dep array doğru

  // Enes Doğanay | 13 Nisan 2026: useCallback ile sarıldı — stabil referans, gereksiz yeniden oluşturma önlenir
  const loadUserData = useCallback(async () => {
    // Enes Doğanay | 10 Nisan 2026: Logout sırasında session tekrar yüklenmesin
    if (isLoggingOutRef.current) return;
    // Enes Doğanay | 5 Mayıs 2026: Concurrency lock — önceki çağrı bitmeden yeni çağrı başlamasın
    // (TOKEN_REFRESHED + SIGNED_IN aynı anda gelince race condition oluşuyordu)
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      // Enes Doğanay | 5 Mayıs 2026: Tek source of truth — getSession() local cache'den okur,
      // ağ isteği yok, token refresh ile yarışmaz
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // Enes Doğanay | 5 Mayıs 2026: AUTH CHECK TAMAM — hemen authChecked=true yap
      // DB queryleri bitmesini bekleme; UI bloklanmasın, badge'ler lazy gelir
      setAuthChecked(true);

      if (!user) { clearAuthState(); return; }
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
      setRealtimeUserId(user.id);
      userIdRef.current = user.id;

      // Enes Doğanay | 5 Mayıs 2026: DB sorguları iç try/catch — DB hatası auth state'ini temizlemesin
      try {
      const [adminResult, companyResult, profileResult, notifResult, prefsResult] = await Promise.all([
        resolveIsAdminUser(user.email, isAdminEmail),
        // Enes Doğanay | 4 Mayıs 2026: Sadece owner kurumsal panel alır; admin/member bireysel kullanıcıdır
        supabase.from('kurumsal_firma_yoneticileri').select('firma_id').eq('user_id', user.id).eq('role', 'owner').maybeSingle(),
        supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
        /* Enes Doğanay | 17 Nisan 2026: type dahil çek — tercih filtresi için */
        supabase.from('bildirimler').select('id, type').eq('user_id', user.id).eq('is_read', false),
        /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihlerini de ilk yüklemede çek */
        supabase.from('bildirim_tercihleri').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      // Enes Doğanay | 14 Nisan 2026: Google OAuth kullanıcıları için profil satırı yoksa otomatik oluştur
      if (profileResult.error) {
        const meta = user.user_metadata;
        if (meta && (meta.full_name || meta.name || meta.email)) {
          const fullName = meta.full_name || meta.name || '';
          const nameParts = fullName.trim().split(/\s+/);
          const autoFirstName = nameParts[0] || meta.email?.split('@')[0] || 'Kullanıcı';
          const autoLastName = nameParts.slice(1).join(' ') || '';
          const autoProfile = {
            id: user.id,
            first_name: autoFirstName,
            last_name: autoLastName,
            email: meta.email || user.email || '',
            avatar: meta.avatar_url || null
          };
          const { error: insertError } = await supabase.from('profiles').upsert(autoProfile);
          if (insertError) {
            try { await supabase.auth.signOut(); } catch {}
            clearAuthState();
            return;
          }

          // Enes Doğanay | 1 Mayıs 2026: OAuth ile ilk kayıt — şartları kabul etmiş sayılır, consent_logs'a yaz
          const provider = user.app_metadata?.provider || 'oauth';
          await supabase.from('consent_logs').insert({
            user_id: user.id,
            kvkk_accepted: true,
            marketing_accepted: false,
            consent_text_version: '1.0',
            signup_method: `oauth_${provider}`,
            ip_address: null,
            user_agent: navigator.userAgent
          });

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

      // Enes Doğanay | 5 Mayıs 2026: Badge sayıları loadBadgeCounts'a taşındı — god function split
      await loadBadgeCounts(user.id, companyId);
      } catch (dataErr) {
        // Enes Doğanay | 5 Mayıs 2026: DB hatası — oturum korunur, sadece logla (clearAuthState çağrılmaz)
        if (dataErr?.name !== 'AbortError' && !dataErr?.message?.includes('abort')) {
          console.warn('[Auth] Veri yükleme hatası (oturum korunuyor):', dataErr);
        }
      }
    } catch (authErr) {
      if (authErr?.name === 'AbortError' || authErr?.message?.includes('abort')) return;
      console.error('Auth hatası:', authErr);
      clearAuthState();
    } finally {
      // Enes Doğanay | 5 Mayıs 2026: Lock'u serbest bırak — bir sonraki çağrı girebilsin
      isLoadingRef.current = false;
      // authChecked zaten session kontrolünden hemen sonra set edildi; burası fallback
      setAuthChecked(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Enes Doğanay | 5 Mayıs 2026: UI bloklama önleme — 5sn içinde bitmezse authChecked=true zorla
    // (skeleton/fallback göster, kullanıcı sonsuz yükleme ekranında kalmasın)
    const authFallbackTimer = setTimeout(() => {
      setAuthChecked(prev => { if (!prev) console.warn('[Auth] loadUserData timeout — authChecked zorla true'); return true; });
    }, 5000);

    // Enes Doğanay | 16 Nisan 2026: Unhandled promise rejection önlenir — loadUserData kendi içinde catch eder ama güvenlik için
    loadUserData().catch(() => {}).finally(() => clearTimeout(authFallbackTimer));

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

      // Enes Doğanay | 5 Mayıs 2026: TOKEN_REFRESHED — kullanıcı verisi değişmedi, sadece realtime token güncelle
      // loadUserData çağırma: token refresh aynı anda kuyruğa girince race condition oluşuyordu
      if (event === 'TOKEN_REFRESHED') {
        if (session?.access_token) supabase.realtime.setAuth(session.access_token);
        return;
      }

      // Enes Doğanay | 5 Mayıs 2026: Sadece SIGNED_IN / USER_UPDATED'da full load — setTimeout kaldırıldı
      // isLoadingRef eş zamanlı çağrıları zaten engelliyor, setTimeout riskli ve gereksizdi
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (validatingLoginRef.current) return;
        // Enes Doğanay | 5 Mayıs 2026: Cross-tab localStorage event koruması —
        // Başka sekmede farklı bir kullanıcı localStorage'a token yazarsa Supabase bu sekmede
        // de SIGNED_IN tetikler. Mevcut yüklü kullanıcı ile yeni session farklıysa loadUserData
        // çalıştır; aynıysa (sadece token refresh cross-tab) atla.
        // Enes Doğanay | 5 Mayıs 2026: userIdRef.current kullanılır — userProfile?.id closure'da
        // hep null görülebilir (callback mount'ta oluşturuldu, o an userProfile=null'du).
        const currentUserId = userIdRef.current;
        const incomingUserId = session?.user?.id;
        if (currentUserId && incomingUserId && currentUserId !== incomingUserId) {
          // Başka sekmedeki farklı kullanıcı bu sekmeyi etkilemesin — yoksay
          return;
        }
        if (session?.access_token) supabase.realtime.setAuth(session.access_token);
        loadUserData().catch(() => {});
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(authFallbackTimer);
    };
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
    // Enes Doğanay | 5 Mayıs 2026: Logout'ta realtime kanalını kapat — stale user event'leri dinlenmesin
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    // Enes Doğanay | 5 Mayıs 2026: seenIds sıfırla — yeni login'de eski ID'ler engel çıkarmasın
    seenNotifIdsRef.current = new Set();
    clearAuthState();
    setAuthChecked(true);
    // Enes Doğanay | 5 Mayıs 2026: Logout'ta concurrency lock'u da sıfırla
    isLoadingRef.current = false;
    // Flag'i 2sn sonra kaldır — auto-refresh timer'ı ölmüş olur
    setTimeout(() => { isLoggingOutRef.current = false; }, 2000);
  };

  // Enes Doğanay | 8 Nisan 2026: Badge sayılarını yenileme (bildirim okunduysa, teklif durum değiştiyse vb.)
  // Enes Doğanay | 5 Mayıs 2026: getSession() + getManagedCompanyId() kaldırıldı —
  // Her ikisi de network/lock bekliyordu. userIdRef.current anında verir;
  // managedCompanyId state'i her render'da capture edilir (refreshCounts plain fn olduğu için her zaman güncel).
  const refreshCounts = async () => {
    // Enes Doğanay | 5 Mayıs 2026: Concurrency lock — rapid çağrılarda sunucuya çift sorgu gitmesin
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
    const userId = userIdRef.current;
    if (!userId) return;
    // Enes Doğanay | 5 Mayıs 2026: managedCompanyId state — loadUserData'da role='owner' filtresiyle set edildi.
    // getManagedCompanyId() role filtresi olmadan sorgu yapabiliyordu (tutarsızlık).
    const cid = managedCompanyId;
    /* Enes Doğanay | 17 Nisan 2026: Tercih filtresinden geçirilmiş sayıç */
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

    // Enes Doğanay | 8 Nisan 2026: Bekleyen teklif sayısını da yenile
    if (cid) {
      const [{ count: qCount }, { data: refreshTenders }] = await Promise.all([
        supabase.from('teklif_talepleri').select('id', { count: 'exact', head: true }).eq('firma_id', cid).eq('durum', 'pending'),
        // Enes Doğanay | 22 Mayıs 2026: Refresh sırasında ihale yönetimi okunmamış sayısını da güncelle
        supabase.from('firma_ihaleleri').select('id').eq('firma_id', cid)
      ]);
      setPendingQuoteCount(qCount || 0);
      const tidList = (refreshTenders || []).map(t => t.id);
      if (tidList.length > 0) {
        const { data: tomOfferIds } = await supabase.from('ihale_teklifleri').select('id').in('ihale_id', tidList);
        const oidList = (tomOfferIds || []).map(o => o.id);
        if (oidList.length > 0) {
          const { count: tomCount } = await supabase.from('ihale_teklif_mesajlari')
            .select('id', { count: 'exact', head: true })
            .in('teklif_id', oidList).eq('sender_role', 'bidder').eq('okundu_firma', false);
          setIhaleYonetimiUnreadCount(tomCount || 0);
        } else { setIhaleYonetimiUnreadCount(0); }
      } else { setIhaleYonetimiUnreadCount(0); }
    } else {
      /* Enes Doğanay | 9 Nisan 2026: Bireysel kullanıcı için okunmamış teklif yanıt/mesaj bildirimi say */
      const [{ count: qCount }, { data: userOffersRefresh }] = await Promise.all([
        supabase.from('bildirimler').select('id', { count: 'exact', head: true })
          .eq('user_id', userId).eq('is_read', false).in('type', ['quote_reply', 'quote_message']),
        // Enes Doğanay | 22 Mayıs 2026: Refresh sırasında da mop sayısını güncelle
        supabase.from('ihale_teklifleri').select('id').eq('user_id', userId)
      ]);
      setPendingQuoteCount(qCount || 0);
      const mopIds = (userOffersRefresh || []).map(o => o.id);
      if (mopIds.length > 0) {
        const { count: mopCount } = await supabase.from('ihale_teklif_mesajlari')
          .select('id', { count: 'exact', head: true })
          .in('teklif_id', mopIds)
          .eq('sender_role', 'company')
          .eq('okundu_bidder', false);
        setMyOffersUnreadCount(mopCount || 0);
      } else {
        setMyOffersUnreadCount(0);
      }
    }
    } catch (err) {
      if (err?.name !== 'AbortError' && !err?.message?.includes('abort')) {
        console.warn('[Auth] refreshCounts hatası:', err);
      }
    } finally {
      // Enes Doğanay | 5 Mayıs 2026: Her koşulda lock'u serbest bırak
      isRefreshingRef.current = false;
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
  // Enes Doğanay | 5 Mayıs 2026: Görülmüş bildirim ID seti — realtime reconnect/duplicate event koruması
  const seenNotifIdsRef = useRef(new Set());
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
      // Enes Doğanay | 5 Mayıs 2026: Duplicate guard — reconnect/tekrar event'te aynı bildirim iki kez işlenmesin
      if (seenNotifIdsRef.current.has(n.id)) return;
      // Enes Doğanay | 5 Mayıs 2026: Memory leak koruması — 500'den fazla ID birikince en eski yarısını sil.
      // clear() yerine partial silme: temizleme anında gelen event başarılı geçmiş ID'yi tekrar işlemez.
      if (seenNotifIdsRef.current.size > 500) {
        const oldest = [...seenNotifIdsRef.current].slice(0, 250);
        oldest.forEach(id => seenNotifIdsRef.current.delete(id));
      }
      seenNotifIdsRef.current.add(n.id);

      /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihine göre filtrele — tercih kapalıysa tamamen yok say */
      const prefs = notifPrefsRef.current;
      if (prefs) {
        const prefKey = NOTIF_TYPE_TO_PREF_KEY[n.type];
        if (prefKey && prefs[prefKey] === false) return;
      }

      // Enes Doğanay | 4 Mayıs 2026: tender_offer_message türü de eklendi — TOM/MOP popup açıkken bastır
      const isChatNotif = (n.type === 'quote_reply' || n.type === 'quote_message' || n.type === 'quote_received' || n.type === 'tender_offer_message');
      const notifTeklifId = n.metadata?.teklif_id;
      const isViewingThisChat = isChatNotif && notifTeklifId && String(activeViewingTeklifIdRef.current) === String(notifTeklifId);

      if (!isViewingThisChat) {
        /* Enes Doğanay | 17 Nisan 2026: Anlık bildirimler (pop-up) tercihi kapalıysa toast gösterme */
        if (!prefs || prefs.anlik_bildirimler !== false) {
          setToasts(prev => {
            if (prev.some(t => t.id === n.id)) return prev;
            // Enes Doğanay | 5 Mayıs 2026: Toast spam koruması — max 5 toast göster (slice ile eskiler düşer)
            return [...prev.slice(-4), {
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
        // Enes Doğanay | 5 Mayıs 2026: Math.max(0) — counter negatife düşmesin (concurrent event edge-case)
        setUnreadNotifCount(prev => Math.max(0, prev + 1));
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
        if (status === 'SUBSCRIBED') { /* bildirimler kanalına bağlandı */ }
        else console.warn('[Realtime] bildirimler kanal durumu:', status, err);
      });

    realtimeChannelRef.current = channel;

    // Enes Doğanay | 5 Mayıs 2026: Polling kaldırıldı — realtime INSERT listener zaten yeni bildirimleri yakalar.
    // Polling realtime ile birlikte çalışıyordu: her 10sn'de 2 ekstra DB sorgusu + realtime duplikasyon.
    // Realtime fail olursa kullanıcı sayfayı yenilediğinde loadUserData zaten badge'i günceller.
    // İlk açılışta son bildirim ID'sini seed'le — realtime bağlanmadan önce gelen bildirimi kaçırmasın
    (async () => {
      const { data: seedData } = await supabase
        .from('bildirimler')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        // Enes Doğanay | 5 Mayıs 2026: limit(20) — reconnect'te son 20 ID seed'lenir, tekrar basılmaz
        .limit(20);
      if (seedData && seedData.length > 0) {
        lastNotifIdRef.current = seedData[0].id;
        // Enes Doğanay | 5 Mayıs 2026: Son 20 ID'yi seed'le — reconnect'te birden fazla kaçırılan bildirimi de engelle
        seedData.forEach(n => seenNotifIdsRef.current.add(n.id));
      }
    })();

    return () => {
      // Enes Doğanay | 5 Mayıs 2026: Cleanup race fix — ref üzerinden kapat, closure'daki channel stale olabilir
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
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
      // Enes Doğanay | 5 Mayıs 2026: Stable getter — re-render tetiklemez, her zaman güncel userId döner
      getUserId,
      isCurrentUserAdmin,
      managedCompanyId,
      managedCompanyName,
      unreadNotifCount,
      pendingQuoteCount,
      // Enes Doğanay | 22 Mayıs 2026: İhale Tekliflerim badge — SharedHeader ve Profile.jsx tarafından kullanılır
      myOffersUnreadCount,
      setMyOffersUnreadCount,
      // Enes Doğanay | 22 Mayıs 2026: İhale Yönetimi badge — FirmaProfil ve SharedHeader tarafından kullanılır
      ihaleYonetimiUnreadCount,
      setIhaleYonetimiUnreadCount,
      toasts,
      dismissToast,
      logout,
      refreshCounts,
      latestNotification,
      setActiveViewingTeklifId,
      updateNotifPrefsCache,
      // Enes Doğanay | 2 Mayıs 2026: Login sekme doğrulaması için — flag ve yeniden yükleme
      setValidatingLogin: (v) => { validatingLoginRef.current = v; },
      reloadUserData: loadUserData
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
