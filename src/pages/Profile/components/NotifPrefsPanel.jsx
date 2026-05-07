// Enes Doğanay | 6 Mayıs 2026: Bildirim tercihleri paneli — accordion switch listesi
import React from 'react';

const NotifPrefsPanel = ({
    notifPrefsList, notifPrefs, handleToggleNotifPref,
    notifPrefsOpen, setNotifPrefsOpen, notifPrefSaved,
    marketingConsent, marketingConsentSaving, handleToggleMarketing,
}) => (
    <div className="notif-prefs-panel">
        <button className="notif-prefs-toggle" onClick={() => setNotifPrefsOpen(!notifPrefsOpen)}>
            <div className="notif-prefs-toggle-left">
                <span className="material-symbols-outlined">tune</span>
                <strong>Bildirim Tercihleri</strong>
                {notifPrefSaved && (
                    <span className="notif-pref-saved-badge">
                        <span className="material-symbols-outlined">check_circle</span> Kaydedildi
                    </span>
                )}
            </div>
            <span className={`material-symbols-outlined notif-prefs-chevron ${notifPrefsOpen ? 'open' : ''}`}>expand_more</span>
        </button>
        {notifPrefsOpen && (
            <div className="notif-prefs-list">
                {notifPrefsList.map(item => (
                    <div key={item.key} className="notif-pref-row">
                        <div className="notif-pref-info">
                            <span className="material-symbols-outlined notif-pref-icon">{item.icon}</span>
                            <div><strong>{item.label}</strong><p>{item.desc}</p></div>
                        </div>
                        <button className={`notif-pref-switch ${notifPrefs[item.key] ? 'active' : ''}`}
                            onClick={() => handleToggleNotifPref(item.key)}
                            aria-label={`${item.label} ${notifPrefs[item.key] ? 'açık' : 'kapalı'}`}>
                            <span className="notif-pref-switch-knob" />
                        </button>
                    </div>
                ))}
                <div className="notif-pref-row notif-pref-row--marketing">
                    <div className="notif-pref-info">
                        <span className="material-symbols-outlined notif-pref-icon">mark_email_read</span>
                        <div><strong>Pazarlama İletişimi</strong><p>Kampanya, fırsat ve önerilerle ilgili e-posta al</p></div>
                    </div>
                    <button className={`notif-pref-switch ${marketingConsent ? 'active' : ''} ${marketingConsentSaving ? 'saving' : ''}`}
                        onClick={handleToggleMarketing} disabled={marketingConsentSaving}
                        aria-label={`Pazarlama iletişimi ${marketingConsent ? 'açık' : 'kapalı'}`}>
                        <span className="notif-pref-switch-knob" />
                    </button>
                </div>
            </div>
        )}
    </div>
);

export default NotifPrefsPanel;
