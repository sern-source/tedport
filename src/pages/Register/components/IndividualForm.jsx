// Enes Doğanay | 6 Mayıs 2026: Bireysel kayıt formu — koordinatör
import React from 'react';
import IndividualOAuthButtons from './IndividualOAuthButtons';
import './IndividualForm.css';

const IndividualForm = ({
    individual,
    kvkkAccepted, onKvkkChange,
    marketingConsent, onMarketingChange,
    showMarketingTooltip, onToggleMarketingTooltip, onOpenMarketingModal,
}) => {
    const {
        firstName, setFirstName, lastName, setLastName,
        companyName, setCompanyName, phone, setPhone,
        email, setEmail, password, setPassword,
        passwordConfirm, setPasswordConfirm,
        showPassword, setShowPassword,
        profilePhoto, handlePhotoChange,
        loading, handleSubmit,
        handleGoogleSignIn, handleLinkedInSignIn,
    } = individual;

    return (
        <form className="form-body" onSubmit={handleSubmit}>
        <IndividualOAuthButtons handleGoogleSignIn={handleGoogleSignIn} handleLinkedInSignIn={handleLinkedInSignIn} />

            <div className="photo-upload-container">
                <label className="photo-upload-box">
                    <span className="material-symbols-outlined photo-upload-icon">
                        {profilePhoto ? 'check_circle' : 'add_a_photo'}
                    </span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                </label>
                <span className="photo-label">{profilePhoto ? 'Fotoğraf Seçildi' : 'Profil Fotoğrafı'}</span>
            </div>

            <div className="form-row">
                <div className="input-group">
                    <label>Ad</label>
                    <input className="form-input" type="text" placeholder="Adınızı girin" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label>Soyad</label>
                    <input className="form-input" type="text" placeholder="Soyadınızı girin" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
            </div>

            <div className="input-group">
                <label>Şirket Adı</label>
                <div className="input-wrapper">
                    <input className="form-input" type="text" placeholder="Şirket ismini girin" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    <span className="material-symbols-outlined input-icon">business</span>
                </div>
            </div>

            <div className="input-group">
                <label>Telefon Numarası</label>
                <div className="input-wrapper">
                    <input className="form-input" type="tel" placeholder="0 (5XX) XXX XX XX" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <span className="material-symbols-outlined input-icon">phone</span>
                </div>
            </div>

            <div className="input-group">
                <label>E-posta Adresi</label>
                <div className="input-wrapper">
                    <input className="form-input" type="email" placeholder="ornek@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    <span className="material-symbols-outlined input-icon">mail</span>
                </div>
            </div>

            <div className="input-group">
                <label>Şifre</label>
                <div className="input-wrapper">
                    <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <span className="material-symbols-outlined input-icon clickable" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </div>
            </div>

            <div className="input-group">
                <label>Şifre Tekrarı</label>
                <div className="input-wrapper">
                    <input
                        className={`form-input${passwordConfirm && password !== passwordConfirm ? ' form-input--error' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={passwordConfirm}
                        onChange={e => setPasswordConfirm(e.target.value)}
                        required
                    />
                    <span className="material-symbols-outlined input-icon">lock</span>
                </div>
                {passwordConfirm && password !== passwordConfirm && (
                    <span className="field-error-text">Şifreler uyuşmuyor</span>
                )}
            </div>

            <div className="checkbox-group">
                <input type="checkbox" id="terms-individual" checked={kvkkAccepted} onChange={e => onKvkkChange(e.target.checked)} />
                <label htmlFor="terms-individual" className="checkbox-label checkbox-required">
                    <a href="/hizmet-sartlari" target="_blank" rel="noopener noreferrer" className="text-link-inline">Hizmet Şartları</a>'nı,{' '}
                    <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="text-link-inline">Gizlilik Politikası</a>'nı ve{' '}
                    <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-link-inline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. <span className="required-star">*</span>
                </label>
            </div>

            <div className="checkbox-group">
                <input type="checkbox" id="marketing-individual" checked={marketingConsent} onChange={e => onMarketingChange(e.target.checked)} />
                <div className="checkbox-label-row">
                    <label htmlFor="marketing-individual" className="checkbox-label">
                        Yeni tedarik fırsatları, kampanyalar ve bana özel önerilerden haberdar olmak istiyorum.
                    </label>
                    <div className="marketing-info-wrap">
                        <button type="button" className="marketing-info-btn" aria-label="Detaylı bilgi" onClick={onToggleMarketingTooltip}>
                            <span className="material-symbols-outlined">info</span>
                        </button>
                        {showMarketingTooltip && (
                            <div className="marketing-tooltip">
                                <p className="marketing-tooltip-note">Bu onay tamamen isteğe bağlıdır. Pazarlama amaçlı e-posta/SMS almak için 6563 sayılı Kanun kapsamında açık rızanızı talep ediyoruz.</p>
                                <button type="button" className="marketing-tooltip-detail-btn" onClick={onOpenMarketingModal}>
                                    Detaylı Metni Gör
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button type="submit" className="register-btn-primary register-btn-submit" disabled={loading}>
                {loading ? 'Kayıt Yapılıyor...' : 'Hesap Oluştur'}
            </button>
        </form>
    );
};

export default IndividualForm;
