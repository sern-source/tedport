// Enes Doğanay | 6 Mayıs 2026: Kurumsal form onay checkboxları + gönder butonu
import React from 'react';

const CorporateConsents = ({ kvkkAccepted, onKvkkChange, marketingConsent, onMarketingChange, showMarketingTooltip, onToggleMarketingTooltip, onOpenMarketingModal, loading, handleSubmit }) => (
    <>
        <div className="checkbox-group">
            <input type="checkbox" id="terms-corporate" checked={kvkkAccepted} onChange={e => onKvkkChange(e.target.checked)} />
            <label htmlFor="terms-corporate" className="checkbox-label checkbox-required">
                <a href="/hizmet-sartlari" target="_blank" rel="noopener noreferrer" className="text-link-inline">Hizmet Şartları</a>'nı,{' '}
                <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="text-link-inline">Gizlilik Politikası</a>'nı ve{' '}
                <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-link-inline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. <span className="required-star">*</span>
            </label>
        </div>
        <div className="checkbox-group">
            <input type="checkbox" id="marketing-corporate" checked={marketingConsent} onChange={e => onMarketingChange(e.target.checked)} />
            <div className="checkbox-label-row">
                <label htmlFor="marketing-corporate" className="checkbox-label">
                    Yeni tedarik fırsatları, kampanyalar ve bana özel önerilerden haberdar olmak istiyorum.
                </label>
                <div className="marketing-info-wrap">
                    <button type="button" className="marketing-info-btn" aria-label="Detaylı bilgi" onClick={onToggleMarketingTooltip}>
                        <span className="material-symbols-outlined">info</span>
                    </button>
                    {showMarketingTooltip && (
                        <div className="marketing-tooltip">
                            <p className="marketing-tooltip-note">Bu onay tamamen isteğe bağlıdır. Pazarlama amaçlı e-posta/SMS almak için 6563 sayılı Kanun kapsamında açık rızanızı talep ediyoruz.</p>
                            <button type="button" className="marketing-tooltip-detail-btn" onClick={onOpenMarketingModal}>Detaylı Metni Gör</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <button type="button" className="register-btn-primary register-btn-submit" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Başvurunuz Gönderiliyor...' : 'Kurumsal Başvuru Gönder'}
        </button>
    </>
);

export default CorporateConsents;
