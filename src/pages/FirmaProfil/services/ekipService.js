// Enes Doğanay | 6 Mayıs 2026: Ekip yönetimi servisi
import { supabase } from '../../../supabaseClient';

const DEFAULT_PERMS = {
  firma_paneli: false,
  teklif_yonetimi: true,
  ihale_yonetimi: true,
  ekip_yonetimi: false,
};

/* Enes Doğanay | 6 Mayıs 2026: Ekip listesi + bekleyen davetleri getir */
export const fetchEkip = async (companyId) => {
  const [, davetRes] = await Promise.all([
    supabase
      .from('firma_ekip_public')
      .select('role, title, joined_at, first_name, last_name')
      .eq('firma_id', String(companyId)),
    supabase
      .from('firma_davetleri')
      .select('id, invited_email, role, title, status, created_at, expires_at')
      .eq('firma_id', String(companyId))
      .eq('status', 'pending'),
  ]);

  const { data: rawEkip } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .select('user_id, role, title, created_at, is_public, page_permissions')
    .eq('firma_id', String(companyId));

  let ekipList = [];
  if (rawEkip && rawEkip.length > 0) {
    const userIds = rawEkip.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);
    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    ekipList = rawEkip.map((r) => ({
      ...r,
      first_name: profileMap[r.user_id]?.first_name || '',
      last_name: profileMap[r.user_id]?.last_name || '',
      is_public: r.is_public !== false,
      page_permissions: r.page_permissions || DEFAULT_PERMS,
    }));
  }

  return { ekip: ekipList, bekleyenDavetler: davetRes.data || [] };
};

/* Enes Doğanay | 6 Mayıs 2026: Ekip daveti gönder */
export const sendDavet = async ({ companyId, userId, firmaAdi, email, role, title }) => {
  const { data: profRes } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (!profRes) {
    throw new Error(
      "Bu e-posta adresiyle kayıtlı bir Tedport hesabı bulunamadı. Çalışanınızdan önce Tedport'a kayıt olmasını isteyin."
    );
  }

  const { data: existingMember } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .select('firma_id')
    .eq('user_id', profRes.id)
    .maybeSingle();

  if (existingMember) {
    throw new Error('Bu kullanıcı zaten bir firmaya bağlı.');
  }

  const defaultPerms =
    role === 'admin'
      ? { firma_paneli: true, teklif_yonetimi: true, ihale_yonetimi: true, ekip_yonetimi: false }
      : DEFAULT_PERMS;

  const { error } = await supabase.from('firma_davetleri').insert({
    firma_id: String(companyId),
    invited_email: email.trim().toLowerCase(),
    invited_user_id: profRes.id,
    invited_by: userId,
    role,
    title: title?.trim() || null,
    page_permissions: defaultPerms,
  });
  if (error) throw new Error(error.message);

  await supabase.from('bildirimler').insert({
    user_id: profRes.id,
    type: 'firma_daveti',
    title: `${firmaAdi || 'Bir firma'} sizi ekibine davet etti`,
    message: `${firmaAdi || 'Firma'} tarafından ${role === 'admin' ? 'Yönetici' : 'Üye'} olarak davet edildiniz. Profilinizden daveti kabul edebilirsiniz.`,
    metadata: { firma_id: String(companyId), davet_id: null },
    is_read: false,
  });
};

/* Enes Doğanay | 6 Mayıs 2026: Daveti iptal et */
export const cancelDavet = async (davetId) => {
  const { error } = await supabase
    .from('firma_davetleri')
    .update({ status: 'cancelled' })
    .eq('id', davetId);
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Ekip üyesini çıkar */
export const removeEkipMember = async (targetUserId, companyId) => {
  const { error } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .delete()
    .eq('user_id', targetUserId)
    .eq('firma_id', String(companyId));
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Üye rol ve unvan güncelle */
export const updateMemberRole = async (targetUserId, companyId, role, title) => {
  const { error } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .update({ role, title: title || null })
    .eq('user_id', targetUserId)
    .eq('firma_id', String(companyId));
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Üye bireysel görünürlük toggle */
export const toggleMemberVisibility = async (targetUserId, companyId, newValue) => {
  const { error } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .update({ is_public: newValue })
    .eq('user_id', targetUserId)
    .eq('firma_id', String(companyId));
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Üye sayfa izinlerini güncelle */
export const updateMemberPermissions = async (targetUserId, companyId, permissions) => {
  const { error } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .update({ page_permissions: permissions })
    .eq('user_id', targetUserId)
    .eq('firma_id', String(companyId));
  if (error) throw new Error(error.message);
};
