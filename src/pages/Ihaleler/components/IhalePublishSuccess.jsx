// Enes Doğanay | 5 Mayıs 2026: İhale yayınlama başarı modalı bileşeni
// Enes Doğanay | 12 Mayıs 2026: type='update' desteği eklendi
import React from 'react';
import './IhalePublishSuccess.css';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — state props ile gelir
const IhalePublishSuccess = ({ ihalePublishSuccess, publishedLinkCopied, setPublishedLinkCopied, onClose, type }) => {
    if (!ihalePublishSuccess) return null;

    if (type === 'update') {
        return (
            <div className="teklif-success-overlay" onClick={onClose}>
                <div className="teklif-success-card" onClick={e => e.stopPropagation()}>
                    <div className="teklif-success-card__icon">
                        <span className="material-symbols-outlined">edit_note</span>
                    </div>
                    <h3>İhale Güncellendi!</h3>
                    <p>Değişiklikleriniz başarıyla kaydedildi.</p>
                    <button className="teklif-success-card__btn" onClick={onClose}>Tamam</button>
                </div>
            </div>
        );
    }

    // Enes Doğanay | 12 Mayıs 2026: Taslak kaydedildi modalı (mevcut ihale güncelleme)
    if (type === 'draft') {
        return (
            <div className="teklif-success-overlay" onClick={onClose}>
                <div className="teklif-success-card" onClick={e => e.stopPropagation()}>
                    <div className="teklif-success-card__icon">
                        <span className="material-symbols-outlined">save</span>
                    </div>
                    <h3>Taslak Kaydedildi!</h3>
                    <p>Değişiklikleriniz taslak olarak kaydedildi.</p>
                    <button className="teklif-success-card__btn" onClick={onClose}>Tamam</button>
                </div>
            </div>
        );
    }

    // Enes Doğanay | 14 Mayıs 2026: Yeni ihale taslak olarak oluşturuldu
    if (type === 'draft-new') {
        return (
            <div className="teklif-success-overlay" onClick={onClose}>
                <div className="teklif-success-card" onClick={e => e.stopPropagation()}>
                    <div className="teklif-success-card__icon">
                        <span className="material-symbols-outlined">save</span>
                    </div>
                    <h3>Taslak Oluşturuldu!</h3>
                    <p>İhaleniz taslak olarak kaydedildi. Hazır olduğunuzda düzenleyip yayınlayabilirsiniz.</p>
                    <button className="teklif-success-card__btn" onClick={onClose}>Tamam</button>
                </div>
            </div>
        );
    }

    return (
        <div className="teklif-success-overlay" onClick={onClose}>
            <div className="teklif-success-card" onClick={e => e.stopPropagation()}>
                <div className="teklif-success-card__icon">
                    <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h3>İhaleniz Yayınlandı!</h3>
                <p>İhaleniz başarıyla yayınlanmıştır. Tedarikçiler artık ihalenizi görebilir ve teklif verebilir.</p>
                <div className="ihale-publish-link-row">
                    <span className="material-symbols-outlined ihale-publish-link-row__icon">link</span>
                    <input
                        className="ihale-publish-link-row__input"
                        readOnly
                        value={`https://tedport.com/ihaleler?ihale=${ihalePublishSuccess}`}
                        onFocus={e => e.target.select()}
                    />
                    <button
                        className={`ihale-publish-link-row__copy${publishedLinkCopied ? ' ihale-publish-link-row__copy--done' : ''}`}
                        onClick={() => {
                            navigator.clipboard.writeText(`https://tedport.com/ihaleler?ihale=${ihalePublishSuccess}`);
                            setPublishedLinkCopied(true);
                            setTimeout(() => setPublishedLinkCopied(false), 2000);
                        }}
                    >
                        <span className="material-symbols-outlined">{publishedLinkCopied ? 'check' : 'content_copy'}</span>
                        {publishedLinkCopied ? 'Kopyalandı!' : 'Linki Kopyala'}
                    </button>
                </div>
                <button className="teklif-success-card__btn" onClick={onClose}>
                    Tamam
                </button>
            </div>
        </div>
    );
};

export default IhalePublishSuccess;
