// Enes Doğanay | 6 Mayıs 2026: Logo yükleme bölümü — pending onay sistemi
import React from 'react';
import './CompanyLogoSection.css';

/* Enes Doğanay | 6 Mayıs 2026: logoPreview, logoUploading, pendingLogoUrl, logoRedNotu, handleLogoUpload */
const CompanyLogoSection = ({ logoPreview, logoUploading, pendingLogoUrl, logoRedNotu, handleLogoUpload }) => {
    return (
        <div className="cmp-logo-upload">
            <div className="cmp-logo-upload__preview">
                {logoPreview ? (
                    <img src={logoPreview} alt="Firma logosu" loading="lazy" />
                ) : (
                    <div className="cmp-logo-upload__placeholder">
                        <span className="material-symbols-outlined">image</span>
                    </div>
                )}
            </div>
            <div className="cmp-logo-upload__info">
                <strong>Firma Logosu</strong>
                <p>PNG, JPG, WebP veya SVG — maks. 2 MB.</p>
                {pendingLogoUrl && (
                    <div className="cmp-logo-pending-badge">
                        <span className="material-symbols-outlined">schedule</span>
                        Yeni logo admin onayı bekliyor
                    </div>
                )}
                {!pendingLogoUrl && logoRedNotu && (
                    <div className="cmp-logo-red-badge">
                        <span className="material-symbols-outlined">cancel</span>
                        Logo reddedildi: {logoRedNotu}
                    </div>
                )}
                <label className="cmp-btn cmp-btn--ghost cmp-btn--sm cmp-logo-upload__btn">
                    <span className="material-symbols-outlined">upload</span>
                    {logoUploading ? 'Yükleniyor…' : 'Fotoğraf Seç'}
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        disabled={logoUploading || !!pendingLogoUrl}
                        hidden
                    />
                </label>
                {pendingLogoUrl && (
                    <p className="cmp-logo-pending-hint">Bekleyen onay varken yeni logo yüklenemez.</p>
                )}
            </div>
        </div>
    );
};

export default CompanyLogoSection;
