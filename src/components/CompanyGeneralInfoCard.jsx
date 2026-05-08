// Enes Doğanay | 6 Mayıs 2026: Genel firma bilgileri kartı — ad, sektör, web, logo
import React from 'react';
import CompanyLogoSection from './CompanyLogoSection';

const CompanyGeneralInfoCard = ({ fields, set, logoPreview, logoUploading, pendingLogoUrl, logoRedNotu, handleLogoUpload }) => (
    <div className="cmp-card">
        <div className="cmp-card__head">
            <span className="material-symbols-outlined">apartment</span>
            <div>
                <h3>Genel Firma Bilgileri</h3>
                <p>Firmalar listesinde ve detay sayfası başlığında görünen kimlik bilgileri.</p>
            </div>
        </div>
        <div className="cmp-grid cmp-grid--3">
            <label className="cmp-field">
                <span>Firma Adı *</span>
                <input type="text" value={fields.firma_adi} onChange={e => set('firma_adi', e.target.value)} required placeholder="Örn. ABC Makine San. A.Ş." />
            </label>
            <label className="cmp-field">
                <span>Ana Sektör</span>
                <input type="text" value={fields.category_name} onChange={e => set('category_name', e.target.value)} placeholder="Örn. Boru ve Profil Üreticisi" />
            </label>
            <label className="cmp-field">
                <span>Web Sitesi</span>
                <div className="cmp-field-web">
                    <input type="text" value={fields.web_sitesi} onChange={e => set('web_sitesi', e.target.value)} placeholder="www.ornekfirma.com" />
                    {/* Enes Doğanay | 8 Mayıs 2026: aria-label — data-tooltip screen reader için yeterli değil */}
                    {fields.web_sitesi?.trim() && (
                        <a href={/^https?:\/\//i.test(fields.web_sitesi.trim()) ? fields.web_sitesi.trim() : `https://${fields.web_sitesi.trim()}`} target="_blank" rel="noopener noreferrer" className="cmp-field-web__link" data-tooltip="Web sitesini aç" aria-label="Web sitesini yeni sekmede aç">
                            <span className="material-symbols-outlined">open_in_new</span>
                        </a>
                    )}
                </div>
            </label>
        </div>
        <CompanyLogoSection logoPreview={logoPreview} logoUploading={logoUploading} pendingLogoUrl={pendingLogoUrl} logoRedNotu={logoRedNotu} handleLogoUpload={handleLogoUpload} />
    </div>
);

export default CompanyGeneralInfoCard;
