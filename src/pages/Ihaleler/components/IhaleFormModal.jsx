// Enes Doğanay | 6 Mayıs 2026: İhale oluştur/düzenle — 4 adımlı stepper modal wrapper
import React from 'react';
import './IhaleFormModal.css';
import './IhaleFormModal.email-firma.css';
import './IhaleFormModal.stepper.css';
import './IhaleFormModal.responsive.css';
import './IhaleFormModal.dark.css';
import { STEPPER_LABELS } from '../IhalelerUtils';
import IhaleFormStep1 from './IhaleFormStep1';
import IhaleFormStep2 from './IhaleFormStep2';
import IhaleFormStep3 from './IhaleFormStep3';
import IhaleFormStep4 from './IhaleFormStep4';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — tüm state ve handler'lar props ile gelir
const IhaleFormModal = ({
    showModal, editingTender, form, setForm, formSaving, formError, setFormError,
    stepperStep, setStepperStep,
    yeniGereksinimMadde, setYeniGereksinimMadde,
    yeniGereksinimAciklama, setYeniGereksinimAciklama,
    emailInput, emailStatus,
    firmaSearchTerm, firmaSearchResults, firmaSearching,
    fileInputRef, firmaResultsRef, refNoCopied, setRefNoCopied, isVerifiedUser,
    onClose, addGereksinim, removeGereksinim,
    handleEmailInputChange, handleEmailKeyDown, addEmail, removeEmail,
    handleFirmaSearch, addDavetliFirma, removeDavetliFirma,
    handleFileAdd, removeFile, handleFormSubmit,
}) => {
    if (!showModal) return null;

    // Enes Doğanay | 10 Nisan 2026: Adım bazlı doğrulama
    const handleNext = () => {
        if (stepperStep === 0) {
            if (!form.baslik.trim()) { setFormError('İhale başlığı zorunludur.'); return; }
            if (!form.teslim_il) { setFormError('Teslim yeri il seçimi zorunludur.'); return; }
            if (!form.teslim_ilce) { setFormError('Teslim yeri ilçe seçimi zorunludur.'); return; }
        }
        if (stepperStep === 1) {
            if (!form.yayin_tarihi) { setFormError('İhale açılış tarihi zorunludur.'); return; }
            if (!form.son_basvuru_tarihi) { setFormError('İhale kapanış tarihi zorunludur.'); return; }
            if (!form.teslim_suresi.trim()) { setFormError('Talep edilen teslim süresi zorunludur.'); return; }
        }
        if (stepperStep === 2) {
            if (form.gereksinimler.length === 0) { setFormError('En az bir ihale gereksinimi eklemelisiniz.'); return; }
        }
        setFormError('');
        setStepperStep(s => s + 1);
    };

    // Enes Doğanay | 7 Mayıs 2026: Portal kaldırıldı — ProfilePage.css layoutIn animasyonundan transform temizlendi
    return (
        <div className="ihale-modal-overlay">
            <div className="ihale-modal ihale-modal--stepper">
                <div className="ihale-modal__head">
                    <h3>{editingTender ? 'İhaleyi Düzenle' : 'Yeni İhale Oluştur'}</h3>
                    <button type="button" className="ihale-modal__close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {/* Enes Doğanay | 10 Nisan 2026: Segment tabanlı stepper */}
                <div className="ihale-stepper-bar">
                    {STEPPER_LABELS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <button type="button"
                                className={`ihale-stepper-item${i === stepperStep ? ' ihale-stepper-item--active' : ''}${i < stepperStep ? ' ihale-stepper-item--done' : ''}`}
                                onClick={() => i <= stepperStep && setStepperStep(i)}>
                                <span className="ihale-stepper-num">
                                    {i < stepperStep
                                        ? <span className="material-symbols-outlined">check</span>
                                        : <span className="material-symbols-outlined">{s.icon}</span>}
                                </span>
                                <span className="ihale-stepper-label">{s.label}</span>
                            </button>
                            {i < STEPPER_LABELS.length - 1 && (
                                <div className={`ihale-stepper-track${i < stepperStep ? ' ihale-stepper-track--done' : ''}${i === stepperStep ? ' ihale-stepper-track--active' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <form className="ihale-modal__form" onSubmit={e => e.preventDefault()}>
                    {stepperStep === 0 && <IhaleFormStep1 form={form} setForm={setForm} />}
                    {stepperStep === 1 && (
                        <IhaleFormStep2
                            form={form} setForm={setForm} isVerifiedUser={isVerifiedUser}
                            refNoCopied={refNoCopied} setRefNoCopied={setRefNoCopied}
                            emailInput={emailInput} emailStatus={emailStatus}
                            firmaSearchTerm={firmaSearchTerm} firmaSearchResults={firmaSearchResults}
                            firmaSearching={firmaSearching} firmaResultsRef={firmaResultsRef}
                            handleEmailInputChange={handleEmailInputChange} handleEmailKeyDown={handleEmailKeyDown}
                            addEmail={addEmail} removeEmail={removeEmail}
                            handleFirmaSearch={handleFirmaSearch} addDavetliFirma={addDavetliFirma} removeDavetliFirma={removeDavetliFirma}
                        />
                    )}
                    {stepperStep === 2 && (
                        <IhaleFormStep3
                            form={form} yeniGereksinimMadde={yeniGereksinimMadde} setYeniGereksinimMadde={setYeniGereksinimMadde}
                            yeniGereksinimAciklama={yeniGereksinimAciklama} setYeniGereksinimAciklama={setYeniGereksinimAciklama}
                            fileInputRef={fileInputRef} addGereksinim={addGereksinim} removeGereksinim={removeGereksinim}
                            handleFileAdd={handleFileAdd} removeFile={removeFile}
                        />
                    )}
                    {stepperStep === 3 && (
                        <IhaleFormStep4
                            form={form} formError={formError} formSaving={formSaving}
                            editingTender={editingTender} onClose={onClose} handleFormSubmit={handleFormSubmit}
                        />
                    )}
                    {stepperStep < 3 && (
                        <div className="ihale-stepper-nav">
                            {stepperStep > 0 && (
                                <button type="button" className="ihale-stepper-back" onClick={() => setStepperStep(s => s - 1)}>
                                    <span className="material-symbols-outlined">arrow_back</span>Geri
                                </button>
                            )}
                            <div className="ihale-stepper-nav__spacer" />
                            {formError && <p className="ihale-form-error ihale-form-error--inline">{formError}</p>}
                            <button type="button" className="ihale-stepper-next" onClick={handleNext}>
                                {stepperStep === 2 ? 'Önizlemeye Geç' : 'Devam Et'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default IhaleFormModal;
