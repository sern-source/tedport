// Enes Doğanay | 6 Mayıs 2026: Yayın başarı, düzenleme başarı ve puanlama bilgi popup'ları
import React from 'react';

export const IhalePublishSuccessPopup = ({ publishState, setPublishState }) => {
    const onClose = () => setPublishState(p => ({ ...p, successId: null, linkCopied: false }));
    if (!publishState.successId) return null;
    const link = `https://tedport.com/ihaleler?ihale=${publishState.successId}`;
    return (
        <div className="teklif-success-overlay" onClick={onClose}>
            {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal */}
            <div className="teklif-success-card" role="dialog" aria-modal="true" aria-labelledby="publish-success-title" onClick={e => e.stopPropagation()}>
                <div className="teklif-success-card__icon"><span className="material-symbols-outlined">check_circle</span></div>
                <h3 id="publish-success-title">İhaleniz Yayınlandı!</h3>
                <p>İhaleniz başarıyla yayınlanmıştır. Tedarikçiler artık ihalenizi görebilir ve teklif verebilir.</p>
                <div className="ihale-publish-link-row">
                    <span className="material-symbols-outlined ihale-publish-link-row__icon">link</span>
                    <input className="ihale-publish-link-row__input" readOnly value={link} onFocus={e => e.target.select()} />
                    <button className={`ihale-publish-link-row__copy${publishState.linkCopied ? ' ihale-publish-link-row__copy--done' : ''}`}
                        onClick={() => { navigator.clipboard.writeText(link); setPublishState(p => ({ ...p, linkCopied: true })); }}>
                        <span className="material-symbols-outlined">{publishState.linkCopied ? 'check' : 'content_copy'}</span>
                        {publishState.linkCopied ? 'Kopyalandı!' : 'Linki Kopyala'}
                    </button>
                </div>
                <button className="teklif-success-card__btn" onClick={() => setPublishState(p => ({ ...p, successId: null }))}>Tamam</button>
            </div>
        </div>
    );
};

export const IhaleEditSavedPopup = ({ publishState, setPublishState }) => {
    if (!publishState.editSaved) return null;
    return (
        <div className="teklif-success-overlay" onClick={() => setPublishState(p => ({ ...p, editSaved: false }))}>
            {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal */}
            <div className="teklif-success-card" role="dialog" aria-modal="true" aria-labelledby="edit-saved-title" onClick={e => e.stopPropagation()}>
                <div className="teklif-success-card__icon"><span className="material-symbols-outlined">check_circle</span></div>
                <h3 id="edit-saved-title">Değişiklikler Kaydedildi!</h3>
                <p>İhaleniz başarıyla güncellendi. Tedarikçiler yeni bilgileri görebilir.</p>
                <button className="teklif-success-card__btn" onClick={() => setPublishState(p => ({ ...p, editSaved: false }))}>Tamam</button>
            </div>
        </div>
    );
};

export const IhaleScoringInfoPopup = ({ showScoringInfo, setShowScoringInfo }) => {
    if (!showScoringInfo) return null;
    return (
        <div className="tom-contact-overlay" onClick={() => setShowScoringInfo(false)}>
            {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal */}
            <div className="tom-scoring-info-card" role="dialog" aria-modal="true" aria-labelledby="scoring-info-title" onClick={e => e.stopPropagation()}>
                <button className="tom-contact-card__close" onClick={() => setShowScoringInfo(false)} aria-label="Kapat"><span className="material-symbols-outlined">close</span></button>
                <div className="tom-scoring-info-card__icon"><span className="material-symbols-outlined">psychology</span></div>
                <h3 id="scoring-info-title">Akıllı Puanlama Nasıl Çalışır?</h3>
                <div className="tom-scoring-info-card__body">
                    <p>Akıllı puanlama sistemi, gelen teklifleri otomatik olarak değerlendirerek size en uygun teklifi hızlıca bulmanıza yardımcı olur.</p>
                    <div className="tom-scoring-info-item">
                        <span className="material-symbols-outlined" style={{ color: '#059669' }}>payments</span>
                        <div><strong>Fiyat Puanı</strong><p>Teklif edilen fiyat ne kadar düşükse puan o kadar yüksek olur.</p></div>
                    </div>
                    <div className="tom-scoring-info-item">
                        <span className="material-symbols-outlined" style={{ color: '#d97706' }}>local_shipping</span>
                        <div><strong>Teslim Hızı Puanı</strong><p>Teslim süresi ne kadar kısa ise puan o kadar yüksek olur.</p></div>
                    </div>
                    <div className="tom-scoring-info-item">
                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>tune</span>
                        <div><strong>Ağırlık Ayarları</strong><p>Kaydırıcılarla Fiyat ve Teslim Hızı kriterlerinin ağırlığını değiştirebilirsiniz.</p></div>
                    </div>
                    <div className="tom-scoring-info-item">
                        <span className="material-symbols-outlined" style={{ color: '#7c3aed' }}>compare_arrows</span>
                        <div><strong>Karşılaştırma</strong><p>En fazla 3 teklifi seçerek yan yana karşılaştırabilirsiniz.</p></div>
                    </div>
                </div>
                <button className="tom-btn tom-btn--accept" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => setShowScoringInfo(false)}>
                    <span className="material-symbols-outlined">check</span>Anladım
                </button>
            </div>
        </div>
    );
};
