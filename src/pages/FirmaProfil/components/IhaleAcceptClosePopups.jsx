// Enes Doğanay | 6 Mayıs 2026: Teklif kabul ve ihale kapat görünürlük popup'ları
import React from 'react';

export const IhaleAcceptClosePopup = ({ acceptClosePopup, setAcceptClosePopup, onConfirmAccept }) => {
    if (!acceptClosePopup) return null;
    return (
        <div className="tom-contact-overlay" onClick={() => setAcceptClosePopup(null)}>
            <div className="tom-accept-close-card" role="dialog" aria-modal="true" aria-labelledby="accept-close-title" onClick={e => e.stopPropagation()}>
                <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                    <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h3 id="accept-close-title">Teklif Kabul Edilecek</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>Bu teklifi kabul ettikten sonra ihaleyi kapatmak ister misiniz?</p>
                <div className="tom-accept-close-actions">
                    <button className="tom-btn tom-btn--accept" onClick={() => onConfirmAccept(acceptClosePopup, true)}>
                        <span className="material-symbols-outlined">lock</span>Kabul Et ve İhaleyi Kapat
                    </button>
                    <button className="tom-btn tom-btn--outline" onClick={() => onConfirmAccept(acceptClosePopup, false)}>
                        <span className="material-symbols-outlined">check</span>Kabul Et, İhale Açık Kalsın
                    </button>
                    <button className="tom-btn tom-btn--cancel-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAcceptClosePopup(null)}>İptal</button>
                </div>
            </div>
        </div>
    );
};

export const IhaleCloseVisibilityPopup = ({ closeState, setCloseState, onConfirmClose }) => {
    if (!closeState.visibilityPopupId) return null;
    const onClose = () => setCloseState(p => ({ ...p, visibilityPopupId: null }));
    return (
        <div className="tom-contact-overlay" onClick={onClose}>
            <div className="tom-accept-close-card" role="dialog" aria-modal="true" aria-labelledby="close-visibility-title" onClick={e => e.stopPropagation()}>
                <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <span className="material-symbols-outlined">visibility</span>
                </div>
                <h3 id="close-visibility-title">İhale Görünürlüğü</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>Kapattığınız ihale, İhaleler sayfasında diğer kullanıcılara gösterilmeye devam etsin mi?</p>
                <div className="tom-accept-close-actions">
                    <button className="tom-btn tom-btn--accept" onClick={() => onConfirmClose(closeState.visibilityPopupId, 'goster')}>
                        <span className="material-symbols-outlined">visibility</span>Evet, Görüntülensin
                    </button>
                    <button className="tom-btn tom-btn--outline" onClick={() => onConfirmClose(closeState.visibilityPopupId, 'gizle')}>
                        <span className="material-symbols-outlined">visibility_off</span>Hayır, Gizlensin
                    </button>
                    <button className="tom-btn tom-btn--cancel-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>İptal</button>
                </div>
            </div>
        </div>
    );
};
