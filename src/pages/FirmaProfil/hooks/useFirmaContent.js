// Enes Doğanay | 6 Mayıs 2026: Türetilmiş sayfa state'i + kurumsal bildirim routing
import { useMemo, useCallback } from 'react';
import { QUOTE_STATUS_SORT } from '../constants/firmaProfilConstants';
import { NOTIF_LIMIT } from '../../Profile/utils/profileUtils';

/* Enes Doğanay | 6 Mayıs 2026: Hem derived state hem handleNotifClick — page'i temiz tutar */
export const useFirmaContent = ({
  notifications,
  upcomingReminders,
  showAllNotifications,
  getFilteredNotifications,
  incomingQuotes,
  outgoingQuotes,
  setTab,
  navigate,
  handleMarkNotificationRead,
  handleOpenQuoteChat,
}) => {
  const limit = NOTIF_LIMIT;

  const filteredNotifications = getFilteredNotifications();
  const visibleNotifications = showAllNotifications
    ? filteredNotifications
    : filteredNotifications.slice(0, limit);
  const hasMoreNotifications = filteredNotifications.length > limit;
  const unreadNotifCount = filteredNotifications.filter((n) => !n.is_read).length;

  // Enes Doğanay | 10 Haziran 2026: now sabitleniyor — react-hooks/purity: Date.now render başında bir kez
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const futureUpcomingReminders = upcomingReminders.filter(
    (r) => new Date(r.reminder_at).getTime() > now
  );
  const overduePendingReminders = upcomingReminders.filter(
    (r) => new Date(r.reminder_at).getTime() <= now
  );

  // Enes Doğanay | 6 Mayıs 2026: Okunmamış teklif bildirim ID'leri
  const unreadQuoteIds = useMemo(
    () =>
      new Set(
        notifications
          .filter(
            (n) =>
              !n.is_read &&
              (n.type === 'quote_reply' ||
                n.type === 'quote_message' ||
                n.type === 'quote_received') &&
              n.metadata?.teklif_id
          )
          .map((n) => n.metadata.teklif_id)
      ),
    [notifications]
  );

  // Enes Doğanay | 6 Mayıs 2026: Akıllı sıralama — okunmamış önce, sonra durum
  const sortedIncomingQuotes = useMemo(
    () =>
      [...incomingQuotes].sort((a, b) => {
        const aU = unreadQuoteIds.has(a.id) ? 0 : 1;
        const bU = unreadQuoteIds.has(b.id) ? 0 : 1;
        if (aU !== bU) return aU - bU;
        const aOrd = QUOTE_STATUS_SORT[a._displayStatus || a.durum] ?? 2;
        const bOrd = QUOTE_STATUS_SORT[b._displayStatus || b.durum] ?? 2;
        if (aOrd !== bOrd) return aOrd - bOrd;
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      }),
    [incomingQuotes, unreadQuoteIds]
  );

  const pendingCount = incomingQuotes.filter((q) => q.durum === 'pending').length;

  // Enes Doğanay | 6 Mayıs 2026: Kurumsal bildirim tıklama — tab yönlendirme + okundu
  const handleNotifClick = useCallback(
    (notification) => {
      if (
        notification.type === 'tender_new_offer' ||
        notification.type === 'tender_offer_updated' ||
        notification.type === 'tender_offer_withdrawn'
      ) {
        const params = { tab: 'ihale-yonetimi' };
        if (notification.metadata?.ihale_id) params.ihale = notification.metadata.ihale_id;
        if (notification.metadata?.teklif_user_id)
          params.teklif_user = notification.metadata.teklif_user_id;
        setTab(params);
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
      } else if (notification.type === 'tender_offer_status') {
        if (notification.metadata?.ihale_id)
          sessionStorage.setItem('mop_highlight_ihale', String(notification.metadata.ihale_id));
        setTab({ tab: 'ihale-yonetimi', subtab: 'katildigim' });
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
      } else if (
        notification.type === 'tender_updated' ||
        notification.type === 'tender_closed' ||
        notification.type === 'tender_cancelled'
      ) {
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
        if (notification.metadata?.ihale_id)
          navigate(`/ihaleler?ihale=${notification.metadata.ihale_id}`);
      } else if (notification.type === 'tender_offer_message') {
        // Enes Doğanay | 7 Mayıs 2026: URL param kullan — sessionStorage IhaleYonetimiSection mount'ken effect tetiklemiyor
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
        if (notification.metadata?.teklif_id)
          setTab({ tab: 'ihale-yonetimi', open_tender_chat: String(notification.metadata.teklif_id) });
        else
          setTab({ tab: 'ihale-yonetimi' });
      } else if (notification.metadata?.teklif_id) {
        const teklifId = notification.metadata.teklif_id;
        setTab({ tab: 'teklifler' });
        const found = [...incomingQuotes, ...outgoingQuotes].find((q) => q.id === teklifId);
        if (found) setTimeout(() => handleOpenQuoteChat(found), 200);
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
      }
    },
    [setTab, navigate, handleMarkNotificationRead, handleOpenQuoteChat, incomingQuotes, outgoingQuotes]
  );

  return {
    filteredNotifications,
    visibleNotifications,
    hasMoreNotifications,
    unreadNotifCount,
    futureUpcomingReminders,
    overduePendingReminders,
    unreadQuoteIds,
    sortedIncomingQuotes,
    pendingCount,
    handleNotifClick,
  };
};
