// Enes Doğanay | 6 Mayıs 2026: Profil içerik yardımcı hook — bildirim türevi state ve notif tıklama
import { NOTIF_LIMIT } from '../utils/profileUtils';

const useProfileContent = ({ notifData, quotesData, navigate, setSearchParams, setMopChatTrigger }) => {
    const { handleMarkNotificationRead, getFilteredNotifications, showAllNotifications, upcomingReminders, notifications } = notifData;
    const { openQuoteChat } = quotesData;

    // Enes Doğanay | 6 Mayıs 2026: Bildirim tıklama — navigasyon + okundu işlemi
    const handleNotifClick = (notification) => {
        const { type, is_read, id, metadata, firma_id } = notification;
        if (type === 'tender_offer_status') {
            if (!is_read) handleMarkNotificationRead(id);
            if (metadata?.ihale_id) sessionStorage.setItem('mop_highlight_ihale', String(metadata.ihale_id));
            navigate('/profile?tab=my-offers');
        } else if (type === 'tender_new_offer' || type === 'tender_offer_updated') {
            // Enes Doğanay | 7 Mayıs 2026: firma_id varsa firma profil paneline yönlendir, yoksa kişisel
            if (!is_read) handleMarkNotificationRead(id);
            if (notification.firma_id) navigate(`/firma-profil?tab=bildirimler`);
            else navigate('/profile?tab=quotes');
        } else if (type === 'tender_updated' || type === 'tender_closed' || type === 'tender_cancelled') {
            if (!is_read) handleMarkNotificationRead(id);
            if (metadata?.ihale_id) navigate(`/ihaleler?ihale=${metadata.ihale_id}`);
        } else if (type === 'tender_offer_message') {
            if (!is_read) handleMarkNotificationRead(id);
            if (metadata?.teklif_id) {
                sessionStorage.setItem('mop_open_teklif_chat', String(metadata.teklif_id));
                setMopChatTrigger(String(metadata.teklif_id));
            }
            setSearchParams({ tab: 'my-offers' });
        } else if (type === 'firma_daveti') {
            if (!is_read) handleMarkNotificationRead(id);
            navigate('/profile?tab=sirketim');
        } else if (metadata?.teklif_id) {
            handleMarkNotificationRead(id);
            setSearchParams({ tab: 'quotes' });
            openQuoteChat(metadata.teklif_id);
        } else if (firma_id) {
            if (!is_read) handleMarkNotificationRead(id);
            navigate(`/firmadetay/${firma_id}`);
        }
    };

    // Enes Doğanay | 6 Mayıs 2026: Türevlenmiş bildirim state'leri
    // Enes Doğanay | 7 Mayıs 2026: Kişisel profil feed'inde şirket taraflı teklif bildirimlerini gizle
    // (firma_id'li tender_new_offer/updated/withdrawn — bunlar FirmaProfil panelinde görünür)
    const COMPANY_TENDER_TYPES = ['tender_new_offer', 'tender_offer_updated', 'tender_offer_withdrawn'];
    const filteredNotifications = getFilteredNotifications().filter(
      n => !(COMPANY_TENDER_TYPES.includes(n.type) && n.firma_id)
    );
    const visibleNotifications = showAllNotifications ? filteredNotifications : filteredNotifications.slice(0, NOTIF_LIMIT);
    const hasMoreNotifications = filteredNotifications.length > NOTIF_LIMIT;
    const unreadNotificationsCount = filteredNotifications.filter(n => !n.is_read).length;
    const futureUpcomingReminders = upcomingReminders.filter(r => new Date(r.reminder_at).getTime() > Date.now());
    const overduePendingReminders = upcomingReminders.filter(r => new Date(r.reminder_at).getTime() <= Date.now());
    const unreadQuoteIds = new Set(
        notifications.filter(n => !n.is_read && (n.type === 'quote_reply' || n.type === 'quote_message') && n.metadata?.teklif_id).map(n => n.metadata.teklif_id)
    );

    return { handleNotifClick, filteredNotifications, visibleNotifications, hasMoreNotifications, unreadNotificationsCount, futureUpcomingReminders, overduePendingReminders, unreadQuoteIds };
};

export default useProfileContent;
