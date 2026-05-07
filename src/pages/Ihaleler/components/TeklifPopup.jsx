// Enes Doğanay | 6 Mayıs 2026: Teklif ver popup — tüm teklif akışı wrapper
import React from 'react';
import './TeklifPopup.css';
import './TeklifPopup.form.css';
import './TeklifPopup.responsive.css';
import './TeklifPopup.overlay.css';
import './TeklifPopup.dark.css';
import TeklifMainPopup from './TeklifMainPopup';
import TeklifCurrencyModal from './TeklifCurrencyModal';
import TeklifConfirmModal from './TeklifConfirmModal';
import TeklifSuccessOverlay from './TeklifSuccessOverlay';
import TeklifFirmaContactPopup from './TeklifFirmaContactPopup';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — tüm state ve handler'lar props ile gelir
const TeklifPopup = ({
    teklifTender, teklifForm, setTeklifForm,
    teklifDosya, setTeklifDosya, teklifDosyaRef,
    teklifSaving, teklifError,
    teklifSuccess, setTeklifSuccess,
    userOffers,
    withdrawConfirm, setWithdrawConfirm, withdrawing,
    draftDeleteConfirm, setDraftDeleteConfirm, draftDeleting,
    currencyModalIdx, setCurrencyModalIdx,
    currencySearch, setCurrencySearch,
    loginPromptTenderId, loginPromptPos, loginPromptRef,
    firmaContactPopup, setFirmaContactPopup,
    onClose, onSubmit, onDeleteDraft, onWithdraw, onUpdateKalem, getGroupedTotals, onLogin,
}) => (
    <>
        <TeklifMainPopup
            teklifTender={teklifTender} teklifForm={teklifForm} setTeklifForm={setTeklifForm}
            teklifDosya={teklifDosya} setTeklifDosya={setTeklifDosya} teklifDosyaRef={teklifDosyaRef}
            teklifSaving={teklifSaving} teklifError={teklifError} userOffers={userOffers}
            setCurrencyModalIdx={setCurrencyModalIdx} setCurrencySearch={setCurrencySearch}
            setWithdrawConfirm={setWithdrawConfirm} setDraftDeleteConfirm={setDraftDeleteConfirm}
            onClose={onClose} onSubmit={onSubmit} onUpdateKalem={onUpdateKalem} getGroupedTotals={getGroupedTotals}
        />
        {/* Enes Doğanay | 14 Nisan 2026: Para birimi seçim modal */}
        <TeklifCurrencyModal
            currencyModalIdx={currencyModalIdx} setCurrencyModalIdx={setCurrencyModalIdx}
            currencySearch={currencySearch} setCurrencySearch={setCurrencySearch}
            setTeklifForm={setTeklifForm} onUpdateKalem={onUpdateKalem}
        />
        {/* Enes Doğanay | 13 Nisan 2026: Teklifi Geri Çek onay */}
        <TeklifConfirmModal
            isOpen={withdrawConfirm} onClose={() => setWithdrawConfirm(false)} disabled={withdrawing}
            title="Teklifinizi Geri Çekmek İstediğinize Emin Misiniz?"
            message="Bu işlem geri alınamaz. Teklifiniz bu ihaleden tamamen silinecektir."
            confirmLabel={withdrawing ? 'Çekiliyor…' : 'Evet, Geri Çek'} confirmIcon="undo" onConfirm={onWithdraw}
        />
        {/* Enes Doğanay | 15 Nisan 2026: Taslağı Sil onay */}
        <TeklifConfirmModal
            isOpen={draftDeleteConfirm} onClose={() => setDraftDeleteConfirm(false)} disabled={draftDeleting}
            title="Taslağı Silmek İstediğinize Emin Misiniz?"
            message="Bu işlem geri alınamaz. Taslak teklifiniz tamamen silinecektir."
            confirmLabel={draftDeleting ? 'Siliniyor…' : 'Evet, Sil'} confirmIcon="delete" onConfirm={onDeleteDraft}
        />
        {/* Enes Doğanay | 13 Nisan 2026: Başarı ekranı */}
        <TeklifSuccessOverlay teklifSuccess={teklifSuccess} setTeklifSuccess={setTeklifSuccess} />
        {/* Enes Doğanay | 13 Nisan 2026: Fixed login prompt */}
        {loginPromptTenderId && loginPromptPos && (
            <div className="tender-login-prompt" ref={loginPromptRef}
                style={loginPromptPos.top != null ? { top: loginPromptPos.top, left: loginPromptPos.left } : { bottom: loginPromptPos.bottom, left: loginPromptPos.left }}>
                <span className="material-symbols-outlined tender-login-prompt__icon">lock</span>
                <p className="tender-login-prompt__text">İhaleye teklif vermek için giriş yapın.</p>
                <button className="tender-login-prompt__btn" onClick={onLogin}>Giriş Yap</button>
            </div>
        )}
        {/* Enes Doğanay | 15 Nisan 2026: Firma iletişim popup */}
        <TeklifFirmaContactPopup firmaContactPopup={firmaContactPopup} setFirmaContactPopup={setFirmaContactPopup} />
    </>
);

export default TeklifPopup;
