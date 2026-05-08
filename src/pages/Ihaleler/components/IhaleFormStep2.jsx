// Enes Doğanay | 6 Mayıs 2026: İhale form adım 2 — İhale Detayları
import React from 'react';
import SimpleSelect from '../../../components/SimpleSelect';
import DatePicker from '../../../components/DatePicker';
import IhaleEmailSection from './IhaleEmailSection';
import IhaleInviteFirmaSection from './IhaleInviteFirmaSection';

const IhaleFormStep2 = ({
    form, setForm, isVerifiedUser,
    refNoCopied, setRefNoCopied,
    emailInput, emailStatus,
    firmaSearchTerm, firmaSearchResults, firmaSearching, firmaResultsRef,
    handleEmailInputChange, handleEmailKeyDown, addEmail, removeEmail,
    handleFirmaSearch, addDavetliFirma, removeDavetliFirma,
}) => (
    <div className="ihale-step-content">
        <div className="ihale-modal__grid">
            <div className="ihale-field">
                <span>İhale Tipi *</span>
                <SimpleSelect
                    value={form.ihale_tipi}
                    onChange={val => {
                        if (val === 'Davetli İhale' && !isVerifiedUser) return;
                        setForm(p => ({ ...p, ihale_tipi: val, ...(val !== 'Davetli İhale' ? { davetli_firmalar: [] } : {}) }));
                    }}
                    options={[
                        { value: 'Açık İhale', label: 'Açık İhale', icon: 'public' },
                        { value: 'Davetli İhale', label: isVerifiedUser ? 'Davetli İhale' : 'Davetli İhale (Onaylı hesap gerekli)', icon: 'group', disabled: !isVerifiedUser },
                    ]}
                />
            </div>
            <div className="ihale-field">
                <span>KDV Durumu</span>
                <SimpleSelect
                    value={form.kdv_durumu}
                    onChange={val => setForm(p => ({ ...p, kdv_durumu: val }))}
                    options={[
                        { value: 'haric', label: 'KDV Hariç', icon: 'receipt_long' },
                        { value: 'dahil', label: 'KDV Dahil', icon: 'receipt' },
                    ]}
                />
            </div>
            <label className="ihale-field">
                <span>İhale Açılış Tarihi *</span>
                <DatePicker value={form.yayin_tarihi} onChange={val => setForm(p => ({ ...p, yayin_tarihi: val }))} compact />
            </label>
            <label className="ihale-field">
                <span>İhale Kapanış Tarihi *</span>
                <DatePicker value={form.son_basvuru_tarihi} onChange={val => setForm(p => ({ ...p, son_basvuru_tarihi: val }))} min={form.yayin_tarihi || undefined} compact />
            </label>
            <label className="ihale-field">
                <span>Talep Edilen Teslim Süresi *</span>
                <input type="text" value={form.teslim_suresi} onChange={e => setForm(p => ({ ...p, teslim_suresi: e.target.value }))} placeholder="Örn. 30 iş günü" />
            </label>
            {/* Enes Doğanay | 1 Mayıs 2026: Referans no panoya kopyalama butonu */}
            <label className="ihale-field">
                <span>Referans No</span>
                <div className="ihale-refno-copy-row">
                    <input type="text" value={form.referans_no} readOnly className="ihale-field--readonly" tabIndex={-1} />
                    <button type="button" className={`ihale-refno-copy-btn${refNoCopied ? ' ihale-refno-copy-btn--done' : ''}`}
                        onClick={() => { if (!form.referans_no) return; navigator.clipboard.writeText(form.referans_no); setRefNoCopied(true); setTimeout(() => setRefNoCopied(false), 2000); }}
                        aria-label={refNoCopied ? 'Kopyalandı' : 'Referans numarasını kopyala'}
                        data-tooltip={refNoCopied ? 'Kopyalandı!' : 'Referans numarasını kopyala'}>
                        <span className="material-symbols-outlined">{refNoCopied ? 'check' : 'content_copy'}</span>
                    </button>
                </div>
            </label>
        </div>
        {form.son_basvuru_tarihi && (
            <div className="ihale-deadline-sticky">
                <span className="material-symbols-outlined">timer</span>
                <span>İhale Kapanış: <strong>{new Date(form.son_basvuru_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
            </div>
        )}
        <IhaleEmailSection
            form={form} emailInput={emailInput} emailStatus={emailStatus}
            handleEmailInputChange={handleEmailInputChange} handleEmailKeyDown={handleEmailKeyDown}
            addEmail={addEmail} removeEmail={removeEmail}
        />
        {form.ihale_tipi === 'Davetli İhale' && (
            <IhaleInviteFirmaSection
                form={form} firmaSearchTerm={firmaSearchTerm} firmaSearchResults={firmaSearchResults}
                firmaSearching={firmaSearching} firmaResultsRef={firmaResultsRef}
                handleFirmaSearch={handleFirmaSearch} addDavetliFirma={addDavetliFirma} removeDavetliFirma={removeDavetliFirma}
            />
        )}
    </div>
);

export default IhaleFormStep2;
