// Enes Doğanay | 6 Mayıs 2026: Teklif popup footer — toplam tutarlar + aksiyon butonları
import React from 'react';
import { formatCurrency } from '../IhalelerUtils';

// Enes Doğanay | 6 Mayıs 2026: IIFE anti-pattern yerine yardımcı bileşen
const GroupedTotals = ({ getGroupedTotals }) => {
    const entries = Object.entries(getGroupedTotals()).filter(([, a]) => a > 0);
    return entries.length
        ? entries.map(([c, a]) => <strong key={c}>{formatCurrency(a, c)}</strong>)
        : <strong>{formatCurrency(0, 'TRY')}</strong>;
};

const TeklifPopupFooter = ({ getGroupedTotals, teklifForm, teklifSaving, isUpdateMode, isDraftMode, setWithdrawConfirm, setDraftDeleteConfirm, onSubmit, isTeklifDirty }) => (
    <div className="teklif-popup__footer">
        <div className="teklif-popup__footer-total">
            <span>Toplam Teklif</span>
            <div className="teklif-popup__footer-amounts">
                <GroupedTotals getGroupedTotals={getGroupedTotals} />
            </div>
            {teklifForm.kdv_dahil && <small>KDV Dahil</small>}
        </div>
        <div className="teklif-popup__footer-actions">
            {isDraftMode && (
                <button type="button" className="teklif-btn teklif-btn--delete-draft" disabled={teklifSaving} onClick={() => setDraftDeleteConfirm(true)}>
                    <span className="material-symbols-outlined">delete</span>Taslağı Sil
                </button>
            )}
            {isUpdateMode && !isDraftMode ? (
                <button type="button" className="teklif-btn teklif-btn--withdraw" disabled={teklifSaving} onClick={() => setWithdrawConfirm(true)}>
                    <span className="material-symbols-outlined">undo</span>Teklifi Geri Çek
                </button>
            ) : (
                <button type="button" className="teklif-btn teklif-btn--draft" disabled={teklifSaving} onClick={() => onSubmit(true)}>
                    <span className="material-symbols-outlined">save</span>{teklifSaving ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                </button>
            )}
            <button type="button" className="teklif-btn teklif-btn--submit" disabled={teklifSaving || (isUpdateMode && !isDraftMode && !isTeklifDirty)} onClick={() => onSubmit(false)}>
                <span className="material-symbols-outlined">{isUpdateMode && !isDraftMode ? 'edit' : 'send'}</span>
                {teklifSaving ? 'Gönderiliyor…' : (isUpdateMode && !isDraftMode ? 'Teklifi Güncelle' : 'Teklifi Gönder')}
            </button>
        </div>
    </div>
);

export default TeklifPopupFooter;
