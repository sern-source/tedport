// Enes Doğanay | 6 Mayıs 2026: Geri çek / taslak sil onay modal — paylaşımlı bileşen
import React from 'react';

const TeklifConfirmModal = ({ isOpen, onClose, disabled, title, message, confirmLabel, confirmIcon, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="teklif-success-overlay" onClick={() => !disabled && onClose()}>
            <div className="teklif-success-card teklif-success-card--withdraw-confirm" onClick={e => e.stopPropagation()}>
                <div className="teklif-success-card__icon teklif-success-card__icon--warn">
                    <span className="material-symbols-outlined">warning</span>
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="teklif-withdraw-modal-actions">
                    <button className="teklif-withdraw-modal-btn teklif-withdraw-modal-btn--cancel" onClick={onClose} disabled={disabled}>
                        Vazgeç
                    </button>
                    <button className="teklif-withdraw-modal-btn teklif-withdraw-modal-btn--confirm" onClick={onConfirm} disabled={disabled}>
                        <span className="material-symbols-outlined">{confirmIcon}</span>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeklifConfirmModal;
