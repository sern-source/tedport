// Enes Doğanay | 7 Mayıs 2026: NotificationsTab — bildirim merkezi koordinatörü
import React, { useState } from 'react';
import NotifPrefsPanel from './NotifPrefsPanel';
import NotifFeedSection from './NotifFeedSection';
import ReminderCard from './ReminderCard';
import './NotificationsTab.css';
import './NotificationsTab.cards.css';
import './NotificationsTab.responsive.css';
import './NotificationsTab.dark.css';

// Enes Doğanay | 6 Mayıs 2026: Bireysel profil varsayılan tercih listesi
const DEFAULT_NOTIF_PREFS_LIST = [
    { key: 'teklif_yanitlari', icon: 'reply', label: 'Teklif Yanıtları', desc: 'Teklif taleplerinize yanıt geldiğinde bildirim al' },
    { key: 'teklif_mesajlari', icon: 'chat', label: 'Teklif Mesajları', desc: 'Teklif sohbetlerinde yeni mesaj geldiğinde bildirim al' },
    { key: 'hatirlatmalar', icon: 'alarm', label: 'Hatırlatmalar', desc: 'Zamanlanmış hatırlatmalarınız geldiğinde bildirim al' },
    { key: 'ihale_durum_degisiklikleri', icon: 'swap_horiz', label: 'İhale Durum Değişiklikleri', desc: 'İhale tekliflerinizin durumu değiştiğinde bildirim al' },
    { key: 'ihale_teklif_mesajlari', icon: 'forum', label: 'İhale Teklif Mesajları', desc: 'İhale teklifleriniz üzerinden gelen mesajlarda bildirim al' },
    { key: 'anlik_bildirimler', icon: 'notifications_active', label: 'Anlık Bildirimler (Pop-up)', desc: "Ekranda anlık bildirim pop-up'ları gösterilsin" },
];

const REMINDER_PREVIEW = 4;

const NotificationsTab = ({
    filteredNotifications, visibleNotifications, hasMoreNotifications, showAllNotifications, setShowAllNotifications,
    futureUpcomingReminders, overduePendingReminders,
    unreadNotificationsCount, notifications, confirmDeleteReminder, setConfirmDeleteReminder,
    notifPrefs, notifPrefsOpen, setNotifPrefsOpen, notifPrefSaved, marketingConsent, marketingConsentSaving,
    handleMarkNotificationRead, handleMarkAllNotificationsRead, handleDeleteNotification, handleDeleteAllNotifications,
    handleDeleteReminder, handleToggleNotifPref, handleToggleMarketing,
    onNotifClick, navigate,
    notifPrefsList = DEFAULT_NOTIF_PREFS_LIST,
}) => {
    /* Enes Doğanay | 7 Mayıs 2026: Hatırlatmalar tümünü göster state */
    const [showAllReminders, setShowAllReminders] = useState(false);

    const allReminders = [...futureUpcomingReminders, ...overduePendingReminders];
    const visibleReminders = showAllReminders ? allReminders : allReminders.slice(0, REMINDER_PREVIEW);
    const hasMoreReminders = allReminders.length > REMINDER_PREVIEW;

    return (
    <div className="notifications-section">
        {/* Enes Doğanay | 7 Mayıs 2026: Hero banner — teal gradient, KPI pills */}
        <div className="notif-hero">
            <div className="notif-hero__inner">
                <div className="notif-hero__title">
                    <span className="notif-hero__icon">
                        <span className="material-symbols-outlined">notifications</span>
                    </span>
                    <div>
                        <h2>Bildirim Merkezi</h2>
                        <p>Teklif yanıtları, mesajlar ve hatırlatmalarınız burada.</p>
                    </div>
                </div>
                <div className="notif-hero__right">
                    <div className="notif-kpis">
                        {/* Enes Doğanay | 7 Mayıs 2026: Toplam bildirim sayısı */}
                        {notifications.length > 0 && (
                            <div className="notif-kpi notif-kpi--notif">
                                <span className="notif-kpi__value">{notifications.length}</span>
                                <span className="notif-kpi__label">Bildirim</span>
                            </div>
                        )}
                        {unreadNotificationsCount > 0 && (
                            <div className="notif-kpi notif-kpi--unread">
                                <span className="notif-kpi__value">{unreadNotificationsCount}</span>
                                <span className="notif-kpi__label">Okunmamış</span>
                            </div>
                        )}
                        {futureUpcomingReminders.length > 0 && (
                            <div className="notif-kpi notif-kpi--reminder">
                                <span className="notif-kpi__value">{futureUpcomingReminders.length}</span>
                                <span className="notif-kpi__label">Hatırlatma</span>
                            </div>
                        )}
                    </div>
                    <div className="notif-hero__actions">
                        <button className="notifications-mark-all" onClick={handleMarkAllNotificationsRead} disabled={unreadNotificationsCount === 0}>
                            <span className="material-symbols-outlined">done_all</span> Okundu
                        </button>
                        <button className="notifications-delete-all" onClick={handleDeleteAllNotifications} disabled={notifications.length === 0}>
                            <span className="material-symbols-outlined">delete_sweep</span> Temizle
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <NotifPrefsPanel notifPrefsList={notifPrefsList} notifPrefs={notifPrefs} handleToggleNotifPref={handleToggleNotifPref}
            notifPrefsOpen={notifPrefsOpen} setNotifPrefsOpen={setNotifPrefsOpen} notifPrefSaved={notifPrefSaved}
            marketingConsent={marketingConsent} marketingConsentSaving={marketingConsentSaving} handleToggleMarketing={handleToggleMarketing} />

        <div className="notifications-grid">
            <NotifFeedSection filteredNotifications={filteredNotifications} visibleNotifications={visibleNotifications}
                hasMoreNotifications={hasMoreNotifications} showAllNotifications={showAllNotifications}
                setShowAllNotifications={setShowAllNotifications}
                handleMarkNotificationRead={handleMarkNotificationRead} handleDeleteNotification={handleDeleteNotification}
                onNotifClick={onNotifClick} />

            {/* Enes Doğanay | 7 Mayıs 2026: Hatırlatmalar — REMINDER_PREVIEW + scroll container */}
            <section className="notifications-panel notifications-panel-reminders">
                <div className="notifications-panel-header">
                    <div><h3>Yaklaşan Hatırlatmalar</h3><p>Planladığınız hatırlatmalar e-postanıza gönderilecek.</p></div>
                </div>
                {allReminders.length === 0 ? (
                    <div className="notifications-empty-state">
                        <span className="material-symbols-outlined">alarm_off</span>
                        <p>Aktif hatırlatmanız yok. Firma notlarından hatırlatma oluşturabilirsiniz.</p>
                    </div>
                ) : (
                    <>
                        <div className={`notif-scroll-list${showAllReminders ? ' notif-scroll-list--open' : ''}`}>
                            {visibleReminders.map(r => {
                                const isOverdue = overduePendingReminders.some(o => o.id === r.id);
                                return (
                                    <ReminderCard key={r.id} reminder={r}
                                        badge={isOverdue ? 'Gönderiliyor' : 'Planlandı'}
                                        badgeClass={isOverdue ? 'overdue' : ''}
                                        isOverdue={isOverdue}
                                        confirmDeleteReminder={confirmDeleteReminder}
                                        setConfirmDeleteReminder={setConfirmDeleteReminder}
                                        handleDeleteReminder={handleDeleteReminder}
                                        navigate={navigate} />
                                );
                            })}
                        </div>
                        {hasMoreReminders && (
                            <button type="button" className="notif-show-more-btn"
                                onClick={() => setShowAllReminders(v => !v)}>
                                {showAllReminders
                                    ? 'Daha Az Göster'
                                    : `Tümünü Göster (${allReminders.length - REMINDER_PREVIEW} daha)`}
                            </button>
                        )}
                    </>
                )}
            </section>
        </div>
    </div>
    );
};

export default NotificationsTab;
