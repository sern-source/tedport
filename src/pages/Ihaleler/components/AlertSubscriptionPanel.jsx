// Enes Doğanay | 13 Mayıs 2026: İhale uyarı aboneliği panel — sektör bazlı filtre
import React, { useRef, useEffect, useState } from 'react';
import { useAlertSubscriptions } from '../hooks/useAlertSubscriptions';
import { SEKTORLER } from '../../Firmalar/utils/sektorData';
import './AlertSubscriptionPanel.css';

// Enes Doğanay | 13 Mayıs 2026: Tüm ihaleler veya belirli sektörler için uyarı paneli
const AlertSubscriptionPanel = ({ userId }) => {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const { subscriptions, loading, initializing, error, toggleSubscription, isSubscribed } = useAlertSubscriptions({ userId });

    // Enes Doğanay | 13 Mayıs 2026: Dışarı tıkla kapat
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!userId || initializing) return null;

    const activeCount = subscriptions.length;

    return (
        <div className="alert-panel-wrap" ref={wrapRef}>
            {/* Enes Doğanay | 13 Mayıs 2026: Tetikleyici buton */}
            <button
                className={`alert-panel-trigger${activeCount > 0 ? ' alert-panel-trigger--active' : ''}`}
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span className="material-symbols-outlined">
                    {activeCount > 0 ? 'notifications_active' : 'notifications'}
                </span>
                <span className="alert-panel-trigger__label">
                    {activeCount > 0 ? `${activeCount} Uyarı Aktif` : 'Uyarı Al'}
                </span>
                <span className={`material-symbols-outlined alert-panel-chevron${open ? ' alert-panel-chevron--open' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Enes Doğanay | 13 Mayıs 2026: Dropdown panel */}
            {open && (
                <div className="alert-panel-menu">
                    <div className="alert-panel-header">
                        <span className="material-symbols-outlined">notifications</span>
                        <div>
                            <p className="alert-panel-header__title">E-posta uyarıları</p>
                            <p className="alert-panel-header__sub">Yeni ihale açıldığında bildirim al</p>
                        </div>
                    </div>

                    {error && <div className="alert-panel-error">{error}</div>}

                    {/* Tüm ihaleler */}
                    <div
                        className={`alert-panel-item${isSubscribed(null) ? ' alert-panel-item--active' : ''}`}
                        onClick={() => !loading && toggleSubscription(null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && !loading && toggleSubscription(null)}
                    >
                        <span className="material-symbols-outlined alert-panel-item__icon">all_inbox</span>
                        <span className="alert-panel-item__label">Tüm İhaleler</span>
                        <span className={`alert-panel-item__check material-symbols-outlined${isSubscribed(null) ? ' alert-panel-item__check--on' : ''}`}>
                            {isSubscribed(null) ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                    </div>

                    <div className="alert-panel-divider">
                        <span>Sektöre göre filtrele</span>
                    </div>

                    {/* Sektörler */}
                    <div className="alert-panel-sectors">
                        {SEKTORLER.map(sektor => (
                            <div
                                key={sektor}
                                className={`alert-panel-item${isSubscribed(sektor) ? ' alert-panel-item--active' : ''}`}
                                onClick={() => !loading && toggleSubscription(sektor)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && !loading && toggleSubscription(sektor)}
                            >
                                <span className="material-symbols-outlined alert-panel-item__icon">domain</span>
                                <span className="alert-panel-item__label">{sektor}</span>
                                <span className={`alert-panel-item__check material-symbols-outlined${isSubscribed(sektor) ? ' alert-panel-item__check--on' : ''}`}>
                                    {isSubscribed(sektor) ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {loading && (
                        <div className="alert-panel-loading">
                            <span className="material-symbols-outlined">sync</span>
                            İşleniyor...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlertSubscriptionPanel;
