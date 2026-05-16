// Enes Doğanay | 6 Mayıs 2026: Bildirimler, hatırlatmalar ve tercihler state + handlers
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient'; // Enes Doğanay | 8 Mayıs 2026: sadece realtime channel için
import { isMissingRelationError, NOTIF_TYPE_TO_PREF_KEY } from '../utils/profileUtils';
import {
    fetchNotifications, fetchReminders,
    markNotifReadService, markAllNotifsReadService,
    deleteNotifService, deleteAllNotifsService,
    deleteReminderService, upsertNotifPrefsService,
} from '../services/notificationsService';

// Enes Doğanay | 16 Mayıs 2026: refreshCounts — AuthContext header badge'ini anlık günceller
export const useNotifications = (userId, notifPrefs, setNotifPrefs, updateNotifPrefsCache, showPrToast, refreshCounts = () => {}) => {
  const [notifications, setNotifications] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState(null);
  const [notifPrefsLoading] = useState(false);
  const [notifPrefsOpen, setNotifPrefsOpen] = useState(false);
  const [notifPrefSaved, setNotifPrefSaved] = useState(false);

  // Enes Doğanay | 8 Mayıs 2026: İlk yükleme — servis fonksiyonları ile
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const [notifs, reminders] = await Promise.all([
          fetchNotifications(userId),
          fetchReminders(userId),
        ]);
        setNotifications(notifs);
        setUpcomingReminders(reminders.filter(r => r.status === 'pending'));
      } catch { /* sessiz */ }
    };
    load();
  }, [userId]);

  // Enes Doğanay | 8 Mayıs 2026: Hatırlatıcı polling — 15s, servis fonksiyonu ile
  useEffect(() => {
    if (!userId) return;
    const poll = async () => {
      // Enes Doğanay | 7 Mayıs 2026: try/catch — AbortError session'u bozmasın
      try {
        const data = await fetchReminders(userId);
        setUpcomingReminders(data.filter(r => r.status === 'pending'));
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
    try {
      await markNotifReadService(userId, notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      refreshCounts();
    } catch (err) {
      if (!isMissingRelationError(err)) showPrToast('error', 'Bildirim güncellenemedi.');
    }
  }, [userId, showPrToast, refreshCounts]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (!unread.length) return;
    try {
      await markAllNotifsReadService(userId, unread.map(n => n.id));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshCounts();
    } catch (err) {
      if (!isMissingRelationError(err)) showPrToast('error', 'Bildirimler güncellenemedi.');
    }
  }, [notifications, userId, showPrToast, refreshCounts]);

  const handleDeleteNotification = useCallback(async (notifId) => {
    try {
      await deleteNotifService(userId, notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      refreshCounts();
    } catch { showPrToast('error', 'Bildirim silinemedi.'); }
  }, [userId, showPrToast, refreshCounts]);

  const handleDeleteAllNotifications = useCallback(async () => {
    if (!notifications.length) return;
    try {
      await deleteAllNotifsService(userId);
      setNotifications([]);
      refreshCounts();
    } catch { showPrToast('error', 'Bildirimler silinemedi.'); }
  }, [notifications.length, userId, showPrToast, refreshCounts]);

  const handleDeleteReminder = useCallback(async (reminder) => {
    try {
      await deleteReminderService(userId, reminder.id, reminder.note_id);
      setUpcomingReminders(prev => prev.filter(r => r.id !== reminder.id));
      setConfirmDeleteReminder(null);
    } catch { showPrToast('error', 'Hatırlatıcı silinemedi.'); }
  }, [userId, showPrToast]);

  const handleToggleNotifPref = useCallback(async (key) => {
    const newValue = !notifPrefs[key];
    const updatedPrefs = { ...notifPrefs, [key]: newValue };
    setNotifPrefs(updatedPrefs);
    try {
      await upsertNotifPrefsService(userId, updatedPrefs);
      updateNotifPrefsCache(updatedPrefs);
      setNotifPrefSaved(true);
      setTimeout(() => setNotifPrefSaved(false), 1500);
    } catch {
      showPrToast('error', 'Bildirim tercihi kaydedilemedi.');
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
