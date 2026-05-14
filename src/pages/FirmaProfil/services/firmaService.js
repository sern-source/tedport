// Enes Doğanay | 6 Mayıs 2026: Firma profil temel veri servisi
import { supabase } from '../../../supabaseClient';

/* Enes Doğanay | 6 Mayıs 2026: Firma bilgilerini getir */
export const fetchFirmaData = async (companyId) => {
  const { data, error } = await supabase
    .from('firmalar')
    .select('*')
    .eq('firmaID', companyId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

/* Enes Doğanay | 6 Mayıs 2026: Kullanıcının firmadaki rolünü getir */
// Enes Doğanay | 14 Mayıs 2026: page_permissions de alındı — analitik izin desteği
export const fetchUserRole = async (userId, companyId) => {
  const { data, error } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .select('role, page_permissions')
    .eq('user_id', userId)
    .eq('firma_id', String(companyId))
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { role: data.role, page_permissions: data.page_permissions || {} };
};

/* Enes Doğanay | 6 Mayıs 2026: Bildirim tercihlerini getir */
export const fetchNotifPrefs = async (userId) => {
  const { data } = await supabase
    .from('bildirim_tercihleri')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
};

/* Enes Doğanay | 6 Mayıs 2026: Firma geneli ekip görünürlüğünü güncelle */
export const updateEkipPublicToggle = async (companyId, newValue) => {
  const { error } = await supabase
    .from('firmalar')
    .update({ show_ekip_public: newValue })
    .eq('firmaID', String(companyId));
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Tekli bildirimi okundu işaretle */
export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from('bildirimler')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Toplu bildirimleri okundu işaretle */
export const markNotificationsRead = async (ids) => {
  if (!ids || ids.length === 0) return;
  const { error } = await supabase
    .from('bildirimler')
    .update({ is_read: true })
    .in('id', ids);
  if (error) throw new Error(error.message);
};

// Enes Doğanay | 14 Mayıs 2026: Tüm firma üyelerinin teklif bildirimlerini okundu yap — SECURITY DEFINER RPC
export const markTeklifFirmaNotificationsRead = async (teklifId, companyId) => {
  const { error } = await supabase.rpc('mark_teklif_firma_notifications_read', {
    p_teklif_id: teklifId,
    p_firma_id: String(companyId),
  });
  if (error) throw new Error(error.message);
};

// Enes Doğanay | 8 Mayıs 2026: Auth session'ı döndür — hook'larda doğrudan supabase çağrısını engeller
export const getAuthSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Enes Doğanay | 8 Mayıs 2026: Oturumu kapat — hook'larda doğrudan supabase çağrısını engeller
export const signOutService = async () => {
  await supabase.auth.signOut();
};
