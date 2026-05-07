// Enes Doğanay | 5 Mayıs 2026: İhale kapatma → görünürlük sorusu popup bileşeni
import React from 'react';
import './CloseVisibilityPopup.css';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — state ve handler'lar props ile gelir
const CloseVisibilityPopup = ({ closeVisibilityPopup, closingTenderId, onGoster, onGizle, onCancel }) => {
    if (!closeVisibilityPopup) return null;

    return (
        <div className="ihale-modal-overlay" onClick={onCancel}>
            <div className="ihale-close-visibility-card" onClick={e => e.stopPropagation()}>
                <div className="ihale-close-visibility-card__icon">
                    <span className="material-symbols-outlined">visibility</span>
                </div>
                <h3>İhale Görünürlüğü</h3>
                <p>Kapattığınız ihale, İhaleler sayfasında diğer kullanıcılara gösterilmeye devam etsin mi?</p>
                <div className="ihale-close-visibility-card__actions">
                    <button className="my-tender-btn my-tender-btn--repeat" onClick={onGoster} disabled={closingTenderId === closeVisibilityPopup}>
                        <span className="material-symbols-outlined">visibility</span>
                        {closingTenderId === closeVisibilityPopup ? 'Kapatılıyor…' : 'Evet, Görüntülensin'}
                    </button>
                    <button className="my-tender-btn my-tender-btn--edit" onClick={onGizle} disabled={closingTenderId === closeVisibilityPopup}>
                        <span className="material-symbols-outlined">visibility_off</span>
                        {closingTenderId === closeVisibilityPopup ? 'Kapatılıyor…' : 'Hayır, Gizlensin'}
                    </button>
                    <button className="my-tender-btn my-tender-btn--cancel" style={{ width: '100%', justifyContent: 'center' }} onClick={onCancel}>İptal</button>
                </div>
            </div>
        </div>
    );
};

export default CloseVisibilityPopup;
