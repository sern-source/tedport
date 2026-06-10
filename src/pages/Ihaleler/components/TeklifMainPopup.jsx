// Enes Doğanay | 6 Mayıs 2026: Teklif ver — ana popup penceresi koordinatör
import React, { useState } from 'react';
import { formatTenderDate } from '../../../constants/tenderUtils';
import { ALLOWED_EK_DOSYA_UZANTILARI, ALLOWED_EK_DOSYA_ACCEPT, ALLOWED_EK_DOSYA_HATA, ALLOWED_EK_DOSYA_ETIKET } from '../../../constants/fileUpload';
import TeklifDetaySection from './TeklifDetaySection';
import TeklifPopupFooter from './TeklifPopupFooter';

const TeklifMainPopup = ({
    teklifTender, teklifForm, setTeklifForm,
    teklifDosya, setTeklifDosya, teklifDosyaRef,
    teklifSaving, teklifError, userOffers,
    setCurrencyModalIdx, setCurrencySearch,
    setWithdrawConfirm, setDraftDeleteConfirm,
    onClose, onSubmit, onUpdateKalem, getGroupedTotals, isTeklifDirty,
}) => {
    // Enes Doğanay | 10 Haziran 2026: Hook koşullu return'den ÖNCE çağrılmalı — rules-of-hooks
    const [fileTypeError, setFileTypeError] = useState('');
    if (!teklifTender) return null;
    const tt = teklifTender;
    const gereksinimler = Array.isArray(tt.gereksinimler) ? tt.gereksinimler : [];
    const hasKalemler = teklifForm.kalemler.length > 0;
    const isUpdateMode = !!userOffers[String(tt.id)];
    const isDraftMode = isUpdateMode && userOffers[String(tt.id)].durum === 'taslak';

    return (
        <div className="teklif-popup-overlay">
            <div className="teklif-popup" onClick={e => e.stopPropagation()}>
                <div className="teklif-popup__head">
                    <div className="teklif-popup__head-left">
                        <span className="material-symbols-outlined teklif-popup__head-icon">{isUpdateMode ? (isDraftMode ? 'draft' : 'edit') : 'handshake'}</span>
                        <div>
                            <h2>{isUpdateMode ? (isDraftMode ? 'Taslağı Görüntüle' : 'Teklifi Güncelle') : 'Teklif Ver'}</h2>
                            <p className="teklif-popup__tender-name">{tt.baslik}</p>
                            {!tt.anonim && (
                                <p className="teklif-popup__tender-firma">
                                    <span className="material-symbols-outlined">apartment</span>
                                    {tt.firma_adi}
                                    {tt.referans_no && <span className="teklif-popup__ref"> • {tt.referans_no}</span>}
                                </p>
                            )}
                        </div>
                    </div>
                    <button type="button" className="teklif-popup__close" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="teklif-popup__body">
                    <div className="teklif-popup__summary-strip">
                        <div className="teklif-popup__summary-item"><span className="material-symbols-outlined">event_busy</span><div><strong>Son Başvuru</strong><span>{formatTenderDate(tt.son_basvuru_tarihi)}</span></div></div>
                        <div className="teklif-popup__summary-item"><span className="material-symbols-outlined">location_on</span><div><strong>Teslim Yeri</strong><span>{[tt.teslim_il, tt.teslim_ilce].filter(Boolean).join(', ') || '—'}</span></div></div>
                        <div className="teklif-popup__summary-item"><span className="material-symbols-outlined">receipt_long</span><div><strong>KDV</strong><span>{tt.kdv_durumu === 'dahil' ? 'Dahil' : 'Hariç'}</span></div></div>
                        {hasKalemler && <div className="teklif-popup__summary-item"><span className="material-symbols-outlined">checklist</span><div><strong>Kalem Sayısı</strong><span>{gereksinimler.length}</span></div></div>}
                    </div>
                    <TeklifDetaySection teklifForm={teklifForm} setTeklifForm={setTeklifForm} hasKalemler={hasKalemler} onUpdateKalem={onUpdateKalem} setCurrencyModalIdx={setCurrencyModalIdx} setCurrencySearch={setCurrencySearch} getGroupedTotals={getGroupedTotals} />
                    <div className="teklif-popup__section">
                        <h3><span className="material-symbols-outlined">local_shipping</span> Teslimat</h3>
                        <div className="teklif-popup__inline-row">
                            <div className="teklif-popup__inline-field"><label>Tahmini Teslim Süresi (gün)</label><input type="number" min="1" placeholder="ör: 15" value={teklifForm.teslim_suresi_gun} onChange={e => setTeklifForm(p => ({ ...p, teslim_suresi_gun: e.target.value }))} /></div>
                            <div className="teklif-popup__inline-field teklif-popup__inline-field--grow">
                                <label>Teslim Açıklaması <small className="teklif-popup__optional">(opsiyonel)</small></label>
                                {/* Enes Doğanay | 23 Mayıs 2026: 3 satır maks, scrollHeight kontrolü */}
                                <textarea
                                    rows={1}
                                    placeholder="ör: Fabrikadan teslim, kargo dahil"
                                    value={teklifForm.teslim_aciklamasi}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && e.target.value.split('\n').length >= 3) e.preventDefault();
                                    }}
                                    onChange={e => {
                                        // Enes Doğanay | 23 Mayıs 2026: 3 satır (66px) aşılırsa geri al
                                        const el = e.target;
                                        el.style.height = 'auto';
                                        if (el.scrollHeight > 66) {
                                            el.value = teklifForm.teslim_aciklamasi;
                                            el.style.height = 'auto';
                                            el.style.height = el.scrollHeight + 'px';
                                            return;
                                        }
                                        setTeklifForm(p => ({ ...p, teslim_aciklamasi: el.value }));
                                        el.style.height = el.scrollHeight + 'px';
                                    }}
                                    className="teklif-popup__inline-textarea" />
                            </div>
                        </div>
                    </div>
                    <div className="teklif-popup__section">
                        <h3><span className="material-symbols-outlined">attach_file</span> Teklif Dosyası</h3>
                        <div className="teklif-popup__file-area">
                            {teklifDosya ? (
                                <div className="teklif-popup__file-chip">
                                    <span className="material-symbols-outlined">description</span>
                                    <span>{teklifDosya.name}</span>
                                    <button type="button" onClick={() => { setTeklifDosya(null); if (teklifDosyaRef.current) teklifDosyaRef.current.value = ''; }}><span className="material-symbols-outlined">close</span></button>
                                </div>
                            ) : (
                                <button type="button" className="teklif-popup__file-upload" onClick={() => teklifDosyaRef.current?.click()}>
                                    <span className="material-symbols-outlined">cloud_upload</span>
                                    <span>Dosya Yükle</span><small>{ALLOWED_EK_DOSYA_ETIKET} — maks. 10 MB</small>
                                </button>
                            )}
                            <input ref={teklifDosyaRef} type="file" accept={ALLOWED_EK_DOSYA_ACCEPT} style={{ display: 'none' }} onChange={e => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                const ext = f.name.split('.').pop()?.toLowerCase() || '';
                                if (!ALLOWED_EK_DOSYA_UZANTILARI.has(ext)) { setFileTypeError(ALLOWED_EK_DOSYA_HATA); if (teklifDosyaRef.current) teklifDosyaRef.current.value = ''; return; }
                                if (f.size > 10 * 1024 * 1024) { setFileTypeError('Dosya boyutu en fazla 10 MB olabilir.'); if (teklifDosyaRef.current) teklifDosyaRef.current.value = ''; return; }
                                setFileTypeError('');
                                setTeklifDosya(f);
                            }} />
                        </div>
                        {/* Enes Doğanay | 16 Mayıs 2026: Dosya türü hata mesajı */}
                        {fileTypeError && <div className="teklif-popup__error" style={{ marginTop: 6 }}><span className="material-symbols-outlined">error</span>{fileTypeError}</div>}
                    </div>
                    <div className="teklif-popup__section">
                        <h3><span className="material-symbols-outlined">sticky_note_2</span> Ek Not <small>(opsiyonel)</small></h3>
                        <textarea rows="3" placeholder="İhale sahibine iletmek istediğiniz ek bilgi veya notlar…" value={teklifForm.not} onChange={e => setTeklifForm(p => ({ ...p, not: e.target.value }))} className="teklif-popup__textarea" />
                    </div>
                    {teklifError && <div className="teklif-popup__error"><span className="material-symbols-outlined">error</span>{teklifError}</div>}
                </div>
                <TeklifPopupFooter getGroupedTotals={getGroupedTotals} teklifForm={teklifForm} teklifSaving={teklifSaving} isUpdateMode={isUpdateMode} isDraftMode={isDraftMode} setWithdrawConfirm={setWithdrawConfirm} setDraftDeleteConfirm={setDraftDeleteConfirm} onSubmit={onSubmit} isTeklifDirty={isTeklifDirty} />
            </div>
        </div>
    );
};

export default TeklifMainPopup;
