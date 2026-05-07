// Enes Doğanay | 7 Mayıs 2026: Bildirim akışı listesi — 4 preview + scroll container
import React from 'react';
import { formatRelativeNotificationTime } from '../utils/profileUtils';

/* Enes Doğanay | 7 Mayıs 2026: Kapalıda gösterilecek kart sayısı */
const FEED_PREVIEW = 4;

const NOTIF_TYPE_LABEL = {
    reminder: '⏰ Hatırlatma', quote_received: '📩 Yeni Teklif', quote_reply: '💬 Yanıt Geldi',
    quote_message: '✉️ Yeni Mesaj', tender_new_offer: '📋 Yeni İhale Teklifi', tender_offer_updated: '✏️ Teklif Güncellendi',
    tender_offer_status: '📊 Teklif Durumu', tender_updated: '📝 İhale Güncellendi', tender_closed: '🔒 İhale Kapandı',
    tender_cancelled: '❌ İhale İptal', tender_offer_withdrawn: '↩️ Teklif Geri Çekildi',
    tender_offer_message: '💬 İhale Teklif Mesajı', firma_daveti: '🏢 Firma Daveti',
};

const isClickable = (n) => !!(n.metadata?.teklif_id || n.firma_id || n.type?.startsWith('tender_') || n.type === 'firma_daveti');

const NotifFeedSection = ({
    filteredNotifications, showAllNotifications, setShowAllNotifications,
    handleMarkNotificationRead, handleDeleteNotification, onNotifClick,
}) => {
    const visibleCards = showAllNotifications
        ? filteredNotifications
        : filteredNotifications.slice(0, FEED_PREVIEW);
    const hasMore = filteredNotifications.length > FEED_PREVIEW;

    return (
    <section className="notifications-panel notifications-panel-feed">
        <div className="notifications-panel-header">
            <div><h3>Son Bildirimler</h3><p>Teklif güncellemeleri ve mesajlarınız</p></div>
        </div>
        {filteredNotifications.length === 0 ? (
            <div className="notifications-empty-state">
                <span className="material-symbols-outlined">notifications_none</span>
                <p>Henüz bildiriminiz yok.</p>
            </div>
        ) : (
            <>
                <div className={`notif-scroll-list${showAllNotifications ? ' notif-scroll-list--open' : ''}`}>
                    {visibleCards.map(notification => (
                        <article key={notification.id}
                            className={`notification-feed-card ${notification.is_read ? '' : 'unread'} ${isClickable(notification) ? 'clickable' : ''}`}
                            onClick={() => onNotifClick(notification)}
                            style={{ cursor: isClickable(notification) ? 'pointer' : 'default' }}>
                            <div className="notification-feed-top">
                                <div>
                                    <span className="notification-feed-type">{NOTIF_TYPE_LABEL[notification.type] || '🔔 Bildirim'}</span>
                                    <h4>{notification.title}</h4>
                                </div>
                                <span className="notification-feed-time">{formatRelativeNotificationTime(notification.created_at)}</span>
                            </div>
                            <p>{notification.message}</p>
                            <div className="notification-feed-actions">
                                {!notification.is_read && (
                                    <button type="button" className="notification-read-btn"
                                        onClick={e => { e.stopPropagation(); handleMarkNotificationRead(notification.id); }}>
                                        Okundu Yap
                                    </button>
                                )}
                                <button type="button" className="notification-delete-btn"
                                    onClick={e => { e.stopPropagation(); handleDeleteNotification(notification.id); }}>
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
                {hasMore && (
                    <button type="button" className="notif-show-more-btn"
                        onClick={() => setShowAllNotifications(v => !v)}>
                        {showAllNotifications
                            ? 'Daha Az Göster'
                            : `Tümünü Göster (${filteredNotifications.length - FEED_PREVIEW} daha)`}
                    </button>
                )}
            </>
        )}
    </section>
    );
};

export default NotifFeedSection;
