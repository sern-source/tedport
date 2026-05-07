// Enes Doğanay | 6 Mayıs 2026: Bildirimler, hatırlatmalar ve tercihler state + handlers
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { isMissingRelationError, NOTIF_TYPE_TO_PREF_KEY } from '../utils/profileUtils';

export const useNotifications = (userId, notifPrefs, setNotifPrefs, updateNotifPrefsCache, showPrToast) => {
  const [notifications, setNotifications] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState(null);
  const [notifPrefsLoading] = useState(false);
  const [notifPrefsOpen, setNotifPrefsOpen] = useState(false);
  const [notifPrefSaved, setNotifPrefSaved] = useState(false);

  // Enes Doğanay | 6 Mayıs 2026: İlk yükleme
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [notifRes, remindersRes] = await Promise.all([
        supabase.from('bildirimler').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
        supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userId).in('status', ['pending', 'sent']).order('reminder_at', { ascending: true }),
      ]);
      if (!notifRes.error || isMissingRelationError(notifRes.error)) setNotifications(notifRes.data || []);
      if (!remindersRes.error || isMissingRelationError(remindersRes.error)) {
        setUpcomingReminders((remindersRes.data || []).filter(r => r.status === 'pending'));
      }
    };
    load();
  }, [userId]);

  // Enes Doğanay | 6 Mayıs 2026: Hatırlatıcı polling — 15s
  useEffect(() => {
    if (!userId) return;
    const poll = async () => {
      // Enes Doğanay | 7 Mayıs 2026: try/catch — AbortError session'u bozmasın
      try {
        const { data } = await supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userId).in('status', ['pending', 'sent']).order('reminder_at', { ascending: true });
        if (data) setUpcomingReminders(data.filter(r => r.status === 'pending'));
      } catch { /* sessiz */ }
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  // Enes Doğanay | 6 Mayıs 2026: Bildirim UPDATE realtime dinle
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`profile-notif-updates-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bildirimler', filter: `user_id=eq.${userId}` },
        (payload) => setNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n))
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleMarkNotificationRead = useCallback(async (notifId) => {
    const { error } = await supabase.from('bildirimler').update({ is_read: true }).eq('id', notifId).eq('user_id', userId);
    if (error && !isMissingRelationError(error)) { showPrToast('error', 'Bildirim güncellenemedi.'); return; }
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  }, [userId, showPrToast]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (!unread.length) return;
    const { error } = await supabase.from('bildirimler').update({ is_read: true }).eq('user_id', userId).in('id', unread.map(n => n.id));
    if (error && !isMissingRelationError(error)) { showPrToast('error', 'Bildirimler güncellenemedi.'); return; }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [notifications, userId, showPrToast]);

  const handleDeleteNotification = useCallback(async (notifId) => {
    const { error } = await supabase.from('bildirimler').delete().eq('id', notifId).eq('user_id', userId);
    if (error) { showPrToast('error', 'Bildirim silinemedi.'); return; }
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  }, [userId, showPrToast]);

  const handleDeleteAllNotifications = useCallback(async () => {
    if (!notifications.length) return;
    const { error } = await supabase.from('bildirimler').delete().eq('user_id', userId);
    if (error) { showPrToast('error', 'Bildirimler silinemedi.'); return; }
    setNotifications([]);
  }, [notifications.length, userId, showPrToast]);

  const handleDeleteReminder = useCallback(async (reminder) => {
    const { error } = await supabase.from('kullanici_hatirlaticilari').delete().eq('id', reminder.id).eq('user_id', userId);
    if (error) { showPrToast('error', 'Hatırlatıcı silinemedi.'); return; }
    if (reminder.note_id) {
      await supabase.from('kisisel_notlar').delete().eq('id', reminder.note_id).eq('user_id', userId);
    }
    setUpcomingReminders(prev => prev.filter(r => r.id !== reminder.id));
    setConfirmDeleteReminder(null);
  }, [userId, showPrToast]);

  const handleToggleNotifPref = useCallback(async (key) => {
    const newValue = !notifPrefs[key];
    const updatedPrefs = { ...notifPrefs, [key]: newValue };
    setNotifPrefs(updatedPrefs);
    try {
      const payload = { user_id: userId, ...updatedPrefs, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('bildirim_tercihleri').upsert(payload, { onConflict: 'user_id' });
      if (error) {
        showPrToast('error', 'Bildirim tercihi kaydedilemedi.');
        setNotifPrefs(prev => ({ ...prev, [key]: !newValue }));
        return;
      }
      updateNotifPrefsCache(updatedPrefs);
      setNotifPrefSaved(true);
      setTimeout(() => setNotifPrefSaved(false), 1500);
    } catch {
      setNotifPrefs(prev => ({ ...prev, [key]: !newValue }));
    }
  }, [notifPrefs, userId, showPrToast, setNotifPrefs, updateNotifPrefsCache]);

  // Enes Doğanay | 6 Mayıs 2026: Filtrelenmiş bildirimler
  const getFilteredNotifications = useCallback(() =>
    notifications.filter(n => {
      const prefKey = NOTIF_TYPE_TO_PREF_KEY[n.type];
      return !prefKey || notifPrefs[prefKey] !== false;
    }), [notifications, notifPrefs]);

  return {
    notifications, setNotifications, upcomingReminders, showAllNotifications, setShowAllNotifications,
    confirmDeleteReminder, setConfirmDeleteReminder, notifPrefsLoading, notifPrefsOpen, setNotifPrefsOpen,
    notifPrefSaved,
    handleMarkNotificationRead, handleMarkAllNotificationsRead, handleDeleteNotification,
    handleDeleteAllNotifications, handleDeleteReminder, handleToggleNotifPref,
    getFilteredNotifications,
  };
};
