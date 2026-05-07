// Enes Doğanay | 6 Mayıs 2026: Bildirimler ve hatırlatmalar Supabase servisleri
import { supabase } from '../../../supabaseClient';

export const fetchNotifications = async (userId) => {
  const { data } = await supabase
    .from('bildirimler')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
};

export const fetchReminders = async (userId) => {
  const { data } = await supabase
    .from('kullanici_hatirlaticilari')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'sent'])
    .order('reminder_at', { ascending: true });
  return data || [];
};

export const markNotifReadService = async (userId, notifId) => {
  await supabase.from('bildirimler').update({ is_read: true }).eq('id', notifId).eq('user_id', userId);
};

export const markAllNotifsReadService = async (userId, ids) => {
  await supabase.from('bildirimler').update({ is_read: true }).in('id', ids).eq('user_id', userId);
};

export const deleteNotifService = async (userId, notifId) => {
  await supabase.from('bildirimler').delete().eq('id', notifId).eq('user_id', userId);
};

export const deleteAllNotifsService = async (userId) => {
  await supabase.from('bildirimler').delete().eq('user_id', userId);
};

export const deleteReminderService = async (userId, reminderId, noteId) => {
  await supabase.from('kullanici_hatirlaticilari').delete().eq('id', reminderId).eq('user_id', userId);
  if (noteId) {
    await supabase.from('kisisel_notlar').delete().eq('id', noteId).eq('user_id', userId);
  }
};

export const fetchNotifPrefsService = async (userId) => {
  const { data } = await supabase
    .from('bildirim_tercihleri')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data || null;
};

export const upsertNotifPrefsService = async (userId, prefs) => {
  const { error } = await supabase.from('bildirim_tercihleri').upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
};
