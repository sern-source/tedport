// Enes Doğanay | 6 Mayıs 2026: Kurumsal başvuru formu — koordinatör
import React from 'react';
import CitySelect from '../../../components/CitySelect';
import { TURKEY_DISTRICTS } from '../../../constants/turkeyDistricts';
import FirmaAutocompleteField from './FirmaAutocompleteField';
import CorporateAuthDocUpload from './CorporateAuthDocUpload';
import CorporateConsents from './CorporateConsents';
import './CorporateForm.css';

const CorporateForm = ({ corporate, kvkkAccepted, onKvkkChange, marketingConsent, onMarketingChange, showMarketingTooltip, onToggleMarketingTooltip, onOpenMarketingModal }) => {
    const { corporateForm, setField, corporateErrors, firmaSuggestions, showFirmaSuggestions, setShowFirmaSuggestions, firmaSearchRef, handleFirmaSearch, handleFirmaSelect, loading, handleSubmit } = corporate;
    return (
        <div className="form-body corporate-form-body">
            <div className="form-row">
                <div className="input-group">
                    <label>Başvuran Adı</label>
                    <input className={`form-input${corporateErrors.applicantFirstName ? ' form-input--error' : ''}`} type="text" placeholder="Adınızı girin" value={corporateForm.applicantFirstName} onChange={e => setField('applicantFirstName', e.target.value)} name="crp_fn_x" autoComplete="one-time-code" />
                    {corporateErrors.applicantFirstName && <span className="field-error-text">{corporateErrors.applicantFirstName}</span>}
                </div>
                <div className="input-group">
                    <label>Başvuran Soyadı</label>
                    <input className={`form-input${corporateErrors.applicantLastName ? ' form-input--error' : ''}`} type="text" placeholder="Soyadınızı girin" value={corporateForm.applicantLastName} onChange={e => setField('applicantLastName', e.target.value)} name="crp_ln_x" autoComplete="one-time-code" />
                    {corporateErrors.applicantLastName && <span className="field-error-text">{corporateErrors.applicantLastName}</span>}
                </div>
            </div>
            <div className="form-row">
                <div className="input-group">
                    <label>Pozisyonunuz</label>
                    <input className={`form-input${corporateErrors.applicantTitle ? ' form-input--error' : ''}`} type="text" placeholder="Örn. Kurucu, Satın Alma Müdürü" value={corporateForm.applicantTitle} onChange={e => setField('applicantTitle', e.target.value)} />
                    {corporateErrors.applicantTitle && <span className="field-error-text">{corporateErrors.applicantTitle}</span>}
                </div>
                <div className="input-group">
                    <label>Başvuranın Telefon Numarası</label>
                    <div className="input-wrapper">
                        <input className={`form-input${corporateErrors.phone ? ' form-input--error' : ''}`} type="tel" placeholder="0 (XXX) XXX XX XX" value={corporateForm.phone} onChange={e => setField('phone', e.target.value)} name="crp_ph_x" autoComplete="one-time-code" />
                        <span className="material-symbols-outlined input-icon">phone</span>
                    </div>
                    {corporateErrors.phone && <span className="field-error-text">{corporateErrors.phone}</span>}
                </div>
            </div>
            <FirmaAutocompleteField corporateForm={corporateForm} corporateErrors={corporateErrors} firmaSuggestions={firmaSuggestions} showFirmaSuggestions={showFirmaSuggestions} setShowFirmaSuggestions={setShowFirmaSuggestions} firmaSearchRef={firmaSearchRef} handleFirmaSearch={handleFirmaSearch} handleFirmaSelect={handleFirmaSelect} />
            <div className="form-row">
                <div className="input-group">
                    <label>Web Sitesi</label>
                    <div className="input-wrapper">
                        <input className={`form-input${corporateErrors.websiteUrl ? ' form-input--error' : ''}`} type="text" placeholder="ornekfirma.com" value={corporateForm.websiteUrl} onChange={e => setField('websiteUrl', e.target.value)} name="crp_ws_x" autoComplete="one-time-code" />
                        <span className="material-symbols-outlined input-icon">language</span>
                    </div>
                    {corporateErrors.websiteUrl && <span className="field-error-text">{corporateErrors.websiteUrl}</span>}
                </div>
                <div className="input-group">
                    <label>Kurumsal E-posta</label>
                    <div className="input-wrapper">
                        <input className={`form-input${corporateErrors.corporateEmail ? ' form-input--error' : ''}`} type="email" placeholder="tedport@sirketiniz.com" value={corporateForm.corporateEmail} onChange={e => setField('corporateEmail', e.target.value)} name="crp_ce_x" autoComplete="one-time-code" />
                        <span className="material-symbols-outlined input-icon">mail</span>
                    </div>
                    <span className="field-hint">Test için kişisel e-posta kullanabilirsiniz; canlıda şirket adresi tercih edilir.</span>
                    {corporateErrors.corporateEmail && <span className="field-error-text">{corporateErrors.corporateEmail}</span>}
                </div>
            </div>
            <div className="input-group">
                <label>Şirket Telefon Numarası</label>
                <div className="input-wrapper">
                    <input className={`form-input${corporateErrors.companyPhone ? ' form-input--error' : ''}`} type="tel" placeholder="0 (2XX) XXX XX XX" value={corporateForm.companyPhone} onChange={e => setField('companyPhone', e.target.value)} name="crp_cph_x" autoComplete="one-time-code" />
                    <span className="material-symbols-outlined input-icon">phone</span>
                </div>
                {corporateErrors.companyPhone && <span className="field-error-text">{corporateErrors.companyPhone}</span>}
            </div>
            <fieldset className="corporate-address-block">
                <legend><span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>location_on</span>İletişim ve Konum</legend>
                <div className="form-row">
                    <div className="input-group">
                        <label>İl</label>
                        <CitySelect value={corporateForm.companyIl} onChange={val => { setField('companyIl', val); setField('companyIlce', ''); }} placeholder="İl seçin" />
                        {corporateErrors.companyIl && <span className="field-error-text">{corporateErrors.companyIl}</span>}
                    </div>
                    <div className="input-group">
                        <label>İlçe</label>
                        <CitySelect value={corporateForm.companyIlce} onChange={val => setField('companyIlce', val)} options={TURKEY_DISTRICTS[corporateForm.companyIl] || []} placeholder={corporateForm.companyIl ? 'İlçe seçin' : 'Önce il seçin'} icon="map" />
                        {corporateErrors.companyIlce && <span className="field-error-text">{corporateErrors.companyIlce}</span>}
                    </div>
                </div>
                <div className="input-group">
                    <label>Açık Adres</label>
                    <input className={`form-input${corporateErrors.companyOpenAddress ? ' form-input--error' : ''}`} type="text" placeholder="Cadde, sokak, bina no, kat / daire" value={corporateForm.companyOpenAddress} onChange={e => setField('companyOpenAddress', e.target.value)} name="crp_adr_x" autoComplete="one-time-code" />
                    {corporateErrors.companyOpenAddress && <span className="field-error-text">{corporateErrors.companyOpenAddress}</span>}
                </div>
            </fieldset>
            <div className="input-group">
                <label>Doğrulama Notu <span className="field-optional">(Opsiyonel)</span></label>
                <textarea className="form-textarea" placeholder="Şirket sahipliği, ticaret sicili, mevcut firma kaydıyla bağınız veya incelemeyi hızlandıracak notları yazın" value={corporateForm.verificationNote} onChange={e => setField('verificationNote', e.target.value)} />
            </div>
            <CorporateAuthDocUpload corporateForm={corporateForm} corporateErrors={corporateErrors} setField={setField} />
            <div className="corporate-process-box">
                <span className="material-symbols-outlined">info</span>
                <p>Onay geldiğinde hesabınız bizim tarafımızdan oluşturulur. Size gönderilecek şifre belirleme bağlantısıyla hesabınızı aktif edip kurumsal giriş yaparsınız.</p>
            </div>
            <CorporateConsents kvkkAccepted={kvkkAccepted} onKvkkChange={onKvkkChange} marketingConsent={marketingConsent} onMarketingChange={onMarketingChange} showMarketingTooltip={showMarketingTooltip} onToggleMarketingTooltip={onToggleMarketingTooltip} onOpenMarketingModal={onOpenMarketingModal} loading={loading} handleSubmit={handleSubmit} />
        </div>
    );
};

export default CorporateForm;
