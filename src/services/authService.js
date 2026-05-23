// Enes Doğanay | 6 Mayıs 2026: Auth veri katmanı — AuthContext Supabase sorguları buraya taşındı
import { supabase } from '../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: Kullanıcı profili — first_name, last_name
// Enes Doğanay | 23 Mayıs 2026: .single() → .maybeSingle() — profil yoksa error değil null döner;
// böylece geçici ağ/RLS hatası mevcut profili override etmez
export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .maybeSingle();
  return { data, error };
}

// Enes Doğanay | 6 Mayıs 2026: Owner rolüyle bağlı firma ID'si
export async function fetchOwnedCompanyId(userId) {
  const { data } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .select('firma_id')
    .eq('user_id', userId)
    .eq('role', 'owner')
    .maybeSingle();
  return data?.firma_id || null;
}

// Enes Doğanay | 6 Mayıs 2026: Okunmamış bildirimleri id+type+firma_id ile çek
export async function fetchUnreadNotifications(userId) {
  const { data } = await supabase
    .from('bildirimler')
    .select('id, type, firma_id')
    .eq('user_id', userId)
    .eq('is_read', false);
  return data || [];
}

// Enes Doğanay | 25 Mayıs 2026: firma_id → slug çözümleyici — bildirim/toast navigasyonu için
export async function fetchFirmaSlugById(firmaId) {
  if (!firmaId) return null;
  const { data } = await supabase
    .from('firmalar')
    .select('slug')
    .eq('firmaID', firmaId)
    .maybeSingle();
  return data?.slug || null;
}

// Enes Doğanay | 6 Mayıs 2026: Kullanıcı bildirim tercihleri
export async function fetchNotifPrefs(userId) {
  const { data } = await supabase
    .from('bildirim_tercihleri')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data || null;
}

// Enes Doğanay | 6 Mayıs 2026: OAuth ile ilk giriş — profil oluştur + KVKK consent kaydı
// Enes Doğanay | 23 Mayıs 2026: upsert → insert; sadece profil YOK iken çağrılır,
// mevcut profil verilerini (isim/avatar) asla override etmez
export async function upsertOAuthProfile(userId, meta, userEmail, userAgent, provider) {
  const fullName = meta.full_name || meta.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || meta.email?.split('@')[0] || 'Kullanıcı';
  const lastName = nameParts.slice(1).join(' ') || '';
  const profileData = {
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email: meta.email || userEmail || '',
    avatar: meta.avatar_url || null,
  };
  // Enes Doğanay | 23 Mayıs 2026: onConflict:'id' ile duplicate-safe — aynı user tekrar gelirse row yoksayılır, mevcut profil bozulmaz
  const { error } = await supabase.from('profiles').insert(profileData).onConflict('id').ignoreDuplicates();
  if (!error) {
    await supabase.from('consent_logs').insert({
      user_id: userId,
      kvkk_accepted: true,
      marketing_accepted: false,
      consent_text_version: '1.0',
      signup_method: `oauth_${provider}`,
      ip_address: null,
      user_agent: userAgent,
    });
  }
  return { error, profile: { first_name: firstName, last_name: lastName } };
}

// Enes Doğanay | 13 Mayıs 2026: Kurumsal badge sayıları — tek RPC sorgusu (N+1 → 1)
// Döner: { firmaAdi, pendingQuoteCount, ihaleYonetimiUnreadCount }
// Enes Doğanay | 13 Mayıs 2026: RPC hata verirse firmalar'dan doğrudan firma_adi çekilir (fallback)
export async function fetchCompanyBadgeCounts(userId, companyId) {
  let firmaAdi = null;
  let pendingQuoteCount = 0;
  let ihaleYonetimiUnreadCount = 0;

  try {
    const { data, error } = await supabase.rpc('get_user_badge_counts', {
      p_user_id:    userId,
      p_company_id: String(companyId),
    });
    if (error) throw new Error(error.message);
    firmaAdi                 = data.firma_adi             || null;
    pendingQuoteCount        = data.pending_quote_count   || 0;
    ihaleYonetimiUnreadCount = data.ihale_yonetimi_unread || 0;
  } catch {
    /* RPC mevcut değil veya hata verdi — badge sayıları 0, firma adı fallback'ten alınır */
  }

  // Enes Doğanay | 13 Mayıs 2026: RPC firma adı döndüremediyse firmalar tablosundan doğrudan çek
  if (!firmaAdi) {
    const { data: fw } = await supabase
      .from('firmalar')
      .select('firma_adi')
      .eq('firmaID', companyId)
      .maybeSingle();
    firmaAdi = fw?.firma_adi || null;
  }

  return { firmaAdi, pendingQuoteCount, ihaleYonetimiUnreadCount };
}

// Enes Doğanay | 13 Mayıs 2026: Bireysel badge sayıları — tek RPC sorgusu
// Döner: { pendingQuoteCount, myOffersUnreadCount }
export async function fetchIndividualBadgeCounts(userId) {
  const { data, error } = await supabase.rpc('get_user_badge_counts', {
    p_user_id:    userId,
    p_company_id: null,
  });
  if (error) throw new Error(error.message);
  return {
    pendingQuoteCount:   data.notif_unread      || 0,
    myOffersUnreadCount: data.my_offers_unread  || 0,
  };
}

// Enes Doğanay | 6 Mayıs 2026: Bildirimi okundu olarak işaretle
export async function markNotificationRead(notifId) {
  const { error } = await supabase
    .from('bildirimler')
    .update({ is_read: true })
    .eq('id', notifId);
  if (error) throw new Error(error.message);
}

// Enes Doğanay | 6 Mayıs 2026: Profil e-postasını güncelle (e-posta değişiklik akışı)
export async function updateProfileEmail(userId, email) {
  const { error } = await supabase
    .from('profiles')
    .update({ email })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

// Enes Doğanay | 6 Mayıs 2026: Profil e-postasını oku (e-posta değişiklik karşılaştırması)
export async function fetchProfileEmail(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Enes Doğanay | 6 Mayıs 2026: Son N bildirim ID'si — realtime duplicate guard seed için
export async function fetchLatestNotificationIds(userId, limit = 20) {
  const { data } = await supabase
    .from('bildirimler')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).map(n => n.id);
}

// Enes Doğanay | 8 Mayıs 2026: Auth session'ı al — hook'larda doğrudan supabase çağrısını engeller
export async function getAuthSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Enes Doğanay | 8 Mayıs 2026: Realtime token güncelle — lifecycle servis katmanında
export function setRealtimeAuth(accessToken) {
  supabase.realtime.setAuth(accessToken);
}

// Enes Doğanay | 8 Mayıs 2026: Oturumu kapat (global scope) — hook'larda doğrudan supabase çağrısını engeller
export async function signOutGlobal() {
  try { await supabase.auth.signOut({ scope: 'global' }); } catch { /* sessiz */ }
}
