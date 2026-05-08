// Enes Doğanay | 6 Mayıs 2026: Auth veri katmanı — AuthContext Supabase sorguları buraya taşındı
import { supabase } from '../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: Kullanıcı profili — first_name, last_name
export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single();
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
  const { error } = await supabase.from('profiles').upsert(profileData);
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

// Enes Doğanay | 6 Mayıs 2026: Kurumsal badge sayıları
// Döner: { firmaAdi, pendingQuoteCount, ihaleYonetimiUnreadCount }
export async function fetchCompanyBadgeCounts(companyId) {
  const [firmResult, quoteResult, firmTendersResult] = await Promise.all([
    supabase.from('firmalar').select('firma_adi').eq('firmaID', companyId).single(),
    supabase.from('teklif_talepleri').select('id', { count: 'exact', head: true }).eq('firma_id', companyId).eq('durum', 'pending'),
    supabase.from('firma_ihaleleri').select('id').eq('firma_id', companyId),
  ]);
  const result = {
    firmaAdi: firmResult.data?.firma_adi || null,
    pendingQuoteCount: quoteResult.count || 0,
    ihaleYonetimiUnreadCount: 0,
  };
  const tenderIds = (firmTendersResult.data || []).map(t => t.id);
  if (tenderIds.length > 0) {
    try {
      const { data: offerRows } = await supabase.from('ihale_teklifleri').select('id').in('ihale_id', tenderIds);
      const offerIds = (offerRows || []).map(o => o.id);
      if (offerIds.length > 0) {
        const { count } = await supabase.from('ihale_teklif_mesajlari')
          .select('id', { count: 'exact', head: true })
          .in('teklif_id', offerIds)
          .eq('sender_role', 'bidder')
          .eq('okundu_firma', false);
        result.ihaleYonetimiUnreadCount = count || 0;
      }
    } catch {
      result.ihaleYonetimiUnreadCount = 0;
    }
  }
  return result;
}

// Enes Doğanay | 6 Mayıs 2026: Bireysel badge sayıları
// Döner: { pendingQuoteCount, myOffersUnreadCount }
export async function fetchIndividualBadgeCounts(userId) {
  const [{ count: quoteCount }, { data: userOffers }] = await Promise.all([
    supabase.from('bildirimler').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('is_read', false).in('type', ['quote_reply', 'quote_message']),
    supabase.from('ihale_teklifleri').select('id').eq('user_id', userId),
  ]);
  const result = { pendingQuoteCount: quoteCount || 0, myOffersUnreadCount: 0 };
  const offerIds = (userOffers || []).map(o => o.id);
  if (offerIds.length > 0) {
    try {
      const { count } = await supabase.from('ihale_teklif_mesajlari')
        .select('id', { count: 'exact', head: true })
        .in('teklif_id', offerIds)
        .eq('sender_role', 'company')
        .eq('okundu_bidder', false);
      result.myOffersUnreadCount = count || 0;
    } catch {
      result.myOffersUnreadCount = 0;
    }
  }
  return result;
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
