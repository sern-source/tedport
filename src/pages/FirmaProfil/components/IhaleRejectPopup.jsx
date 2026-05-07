// Enes Doğanay | 6 Mayıs 2026: Teklif red notu popup
import React from 'react';

const IhaleRejectPopup = ({ rejectNoteState, setRejectNoteState, onConfirmReject }) => {
    if (!rejectNoteState.offerId) return null;
    const onClose = () => setRejectNoteState({ offerId: null, note: '' });
    return (
        <div className="tom-contact-overlay" onClick={onClose}>
            <div className="tom-reject-note-card" onClick={e => e.stopPropagation()}>
                <button className="tom-contact-card__close" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
                <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    <span className="material-symbols-outlined">cancel</span>
                </div>
                <h3>Teklifi Reddet</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 16px', textAlign: 'center' }}>İsteğe bağlı olarak red nedeninizi yazabilirsiniz. Bu not, teklif veren kişiye e-posta ile iletilecektir.</p>
                <textarea className="tom-reject-note-textarea" rows={3} value={rejectNoteState.note}
                    onChange={e => setRejectNoteState(p => ({ ...p, note: e.target.value }))}
                    placeholder="Red nedeni (opsiyonel)..." />
                <div className="tom-reject-note-actions">
                    <button className="tom-btn tom-btn--cancel-sm" onClick={onClose}>İptal</button>
                    <button className="tom-btn tom-btn--reject" onClick={onConfirmReject}>
                        <span className="material-symbols-outlined">close</span>Reddet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IhaleRejectPopup;
