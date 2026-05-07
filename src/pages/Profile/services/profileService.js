// Enes Doğanay | 6 Mayıs 2026: Profile sayfası Supabase servisleri
import { supabase } from '../../../supabaseClient';

export const fetchSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) return null;
  return session;
};

export const fetchProfileData = async (userId) => {
  const [profileRes, cityRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, company_name, phone, location, avatar, email, marketing_consent')
      .eq('id', userId)
      .single(),
    supabase.from('sehirler').select('sehir').order('sehir', { ascending: true }),
  ]);
  return {
    profile: profileRes.data || null,
    cities: (cityRes.data || []).map((c) => c.sehir),
  };
};

export const updateProfileField = async (userId, field, value) => {
  const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', userId);
  if (error) throw new Error(error.message);
};

export const updateUserEmail = async (newEmail, redirectTo) => {
  const { error } = await supabase.auth.updateUser({ email: newEmail }, { emailRedirectTo: redirectTo });
  if (error) throw error;
};

export const uploadAvatar = async (userId, file) => {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};

export const syncEmailAfterConfirm = async (freshUser) => {
  if (!freshUser?.email) return false;
  const { data } = await supabase.from('profiles').select('email').eq('id', freshUser.id).single();
  if (data && freshUser.email !== data.email) {
    await supabase.from('profiles').update({ email: freshUser.email }).eq('id', freshUser.id);
    return true;
  }
  return false;
};

export const fetchCompanyMembership = async (userId) => {
  const { data } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .select('firma_id, role, title, page_permissions')
    .eq('user_id', userId)
    .maybeSingle();
  return data || null;
};

export const fetchFirmaById = async (firmaId) => {
  const { data } = await supabase
    .from('firmalar')
    .select('firmaID, firma_adi, ana_sektor, il_ilce, logo_url')
    .eq('firmaID', firmaId)
    .maybeSingle();
  return data || null;
};

export const fetchPendingInvites = async (userId) => {
  const { data: rawInvites } = await supabase
    .from('firma_davetleri')
    .select('*')
    .eq('invited_user_id', userId)
    .eq('status', 'pending');
  if (!rawInvites?.length) return [];
  const firmaIds = [...new Set(rawInvites.map((d) => d.firma_id))];
  const { data: firmalar } = await supabase
    .from('firmalar')
    .select('firmaID, firma_adi')
    .in('firmaID', firmaIds);
  const map = Object.fromEntries((firmalar || []).map((f) => [f.firmaID, f.firma_adi]));
  return rawInvites.map((d) => ({ ...d, _firma_adi: map[d.firma_id] || null }));
};

export const acceptFirmaDavetiService = async (davetId) => {
  const { error } = await supabase.rpc('accept_firma_daveti', { p_davet_id: davetId });
  if (error) throw new Error(error.message);
};

export const rejectFirmaDavetiService = async (davetId) => {
  await supabase.from('firma_davetleri').update({ status: 'rejected' }).eq('id', davetId);
};

export const saveMarketingConsent = async (userId, value) => {
  const { error } = await supabase.from('profiles').update({ marketing_consent: value }).eq('id', userId);
  if (error) throw new Error(error.message);
};
