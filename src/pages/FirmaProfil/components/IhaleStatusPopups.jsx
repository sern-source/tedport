// Enes Doğanay | 6 Mayıs 2026: Statü onay ve statü başarı popup'ları
import React from 'react';

export const IhaleStatusConfirmPopup = ({ statusConfirmPopup, setStatusConfirmPopup, onConfirmStatus }) => {
    if (!statusConfirmPopup) return null;
    const handleConfirm = () => { onConfirmStatus(statusConfirmPopup.offerId, statusConfirmPopup.status); setStatusConfirmPopup(null); };
    return (
        <div className="tom-contact-overlay" onClick={() => setStatusConfirmPopup(null)}>
            <div className="tom-accept-close-card" role="dialog" aria-modal="true" aria-labelledby="status-confirm-title" onClick={e => e.stopPropagation()}>
                <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                    <span className="material-symbols-outlined">hourglass_top</span>
                </div>
                <h3 id="status-confirm-title">Değerlendirmeye Al</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>Bu teklifi tekrar değerlendirmeye almak istediğinize emin misiniz?</p>
                <div className="tom-accept-close-actions">
                    <button className="tom-btn tom-btn--accept" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }} onClick={handleConfirm}>
                        <span className="material-symbols-outlined">hourglass_top</span>Değerlendirmeye Al
                    </button>
                    <button className="tom-btn tom-btn--cancel-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStatusConfirmPopup(null)}>İptal</button>
                </div>
            </div>
        </div>
    );
};

export const IhaleStatusSuccessPopup = ({ statusSuccessModal, setStatusSuccessModal }) => {
    if (!statusSuccessModal) return null;
    return (
        <div className="tom-contact-overlay" onClick={() => setStatusSuccessModal(null)}>
            <div className="tom-accept-close-card" role="dialog" aria-modal="true" aria-labelledby="status-success-title" onClick={e => e.stopPropagation()}>
                <div className="tom-scoring-info-card__icon" style={{ background: statusSuccessModal.color }}>
                    <span className="material-symbols-outlined">{statusSuccessModal.icon}</span>
                </div>
                <h3 id="status-success-title">{statusSuccessModal.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>{statusSuccessModal.text}</p>
                <button className="tom-btn tom-btn--accept" style={{ width: '100%', justifyContent: 'center', background: statusSuccessModal.color }} onClick={() => setStatusSuccessModal(null)}>
                    <span className="material-symbols-outlined">check</span>Tamam
                </button>
            </div>
        </div>
    );
};
