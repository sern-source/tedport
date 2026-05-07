// Enes Doğanay | 5 Mayıs 2026: İhale yayınlama başarı modalı bileşeni
import React from 'react';
import './IhalePublishSuccess.css';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — state props ile gelir
const IhalePublishSuccess = ({ ihalePublishSuccess, publishedLinkCopied, setPublishedLinkCopied, onClose }) => {
    if (!ihalePublishSuccess) return null;

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
