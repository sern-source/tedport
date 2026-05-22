// Enes Doğanay | 6 Mayıs 2026: Firma arama + autocomplete dropdown
import React from 'react';
import Image from 'next/image';

const FirmaAutocompleteField = ({ corporateForm, corporateErrors, firmaSuggestions, showFirmaSuggestions, setShowFirmaSuggestions, firmaSearchRef, handleFirmaSearch, handleFirmaSelect }) => (
    <div className="input-group" ref={firmaSearchRef} style={{ position: 'relative' }}>
        <label>Tedport'ta Görünmesini İstediğiniz İçin Başvurduğunuz Şirket</label>
        <div className="input-wrapper">
            <input
                className={`form-input${corporateForm.selectedFirmaId ? ' form-input--matched' : ''}${corporateErrors.listedCompanyName ? ' form-input--error' : ''}`}
                type="text"
                placeholder="Şirket adını yazın — Tedport'ta kayıtlıysa listeden seçin"
                value={corporateForm.listedCompanyName}
                onChange={e => handleFirmaSearch(e.target.value)}
                onFocus={() => { if (firmaSuggestions.length > 0) setShowFirmaSuggestions(true); }}
                autoComplete="off"
            />
            <span className="material-symbols-outlined input-icon">{corporateForm.selectedFirmaId ? 'check_circle' : 'search'}</span>
        </div>
        {corporateForm.selectedFirmaId && (
            <span className="field-hint field-hint--success">
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>link</span>
                Mevcut firma kaydı eşleştirildi — onay sonrası bu firma sayfasının yönetimi size bağlanacak.
            </span>
        )}
        {!corporateForm.selectedFirmaId && corporateForm.listedCompanyName && (
            <span className="field-hint">Listede yoksa yeni firma kaydı oluşturulur.</span>
        )}
        {showFirmaSuggestions && firmaSuggestions.length > 0 && (
            <div className="firma-autocomplete-dropdown">
                {firmaSuggestions.map(firma => (
                    <button key={firma.firmaID} type="button" className={`firma-autocomplete-item${firma.isManaged ? ' firma-autocomplete-item--managed' : ''}`} onClick={() => !firma.isManaged && handleFirmaSelect(firma)} disabled={firma.isManaged}>
                        <div className="firma-autocomplete-avatar">
                            {/* Enes Doğanay | 23 Mayıs 2026: next/image — 36×36 WebP thumbnail */}
                            {firma.logo_url ? <Image src={firma.logo_url} alt="" width={36} height={36} style={{ objectFit: 'contain', borderRadius: '8px' }} /> : <span>{firma.firma_adi?.charAt(0)}</span>}
                        </div>
                        <div className="firma-autocomplete-info">
                            <span className="firma-autocomplete-name">{firma.firma_adi}</span>
                            {firma.il_ilce && <span className="firma-autocomplete-location">{firma.il_ilce}</span>}
                        </div>
                        {firma.isManaged && (
                            <span className="firma-autocomplete-managed-badge">
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>Yönetiliyor
                            </span>
                        )}
                    </button>
                ))}
            </div>
        )}
        {corporateErrors.listedCompanyName && <span className="field-error-text">{corporateErrors.listedCompanyName}</span>}
    </div>
);

export default FirmaAutocompleteField;
