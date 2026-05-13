// Enes Doğanay | 13 Mayıs 2026: Yeni ihale uyarı butonu — abonelik toggle
import React from 'react';
import { useAlertSubscription } from '../hooks/useAlertSubscription';
import './TenderAlertButton.css';

const TenderAlertButton = ({ userId, kategori }) => {
    const { subscription, loading, checking, error, handleToggle } = useAlertSubscription({ userId, kategori });

    if (!userId || checking) return null;

    return (
        <div className="tender-alert-wrap">
            <button
                className={`tender-alert-btn${subscription ? ' tender-alert-btn--active' : ''}${error ? ' tender-alert-btn--error' : ''}`}
                onClick={handleToggle}
                disabled={loading}
            >
                <span className="material-symbols-outlined">
                    {error ? 'error' : subscription ? 'notifications_active' : 'notifications'}
                </span>
                <span className="tender-alert-btn__label">
                    {loading ? 'İşleniyor...' : error ? 'Hata oluştu' : subscription ? 'Uyarı Aktif' : 'Uyarı Al'}
                </span>
            </button>
            {/* Enes Doğanay | 13 Mayıs 2026: Abonelik başarı/iptal mesajı */}
            {!error && !loading && subscription === null && (
                <span className="tender-alert-status" aria-live="polite" />
            )}
        </div>
    );
};

export default TenderAlertButton;
