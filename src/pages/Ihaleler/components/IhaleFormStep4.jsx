// Enes Doğanay | 6 Mayıs 2026: İhale form adım 4 — Önizleme ve Gönderim
import React from 'react';

// Enes Doğanay | 6 Mayıs 2026: Önizleme ızgara kalemi
const PreviewItem = ({ icon, label, value }) => (
    <div className="ihale-preview__item">
        <span className="material-symbols-outlined">{icon}</span>
        <div><strong>{label}</strong><span>{value}</span></div>
    </div>
);

// Enes Doğanay | 6 Mayıs 2026: Önizleme bölüm başlığı + etiket listesi
const PreviewSection = ({ icon, label, tags }) => (
    <div className="ihale-preview__section">
        <strong><span className="material-symbols-outlined">{icon}</span> {label}</strong>
        <div className="ihale-preview__tags">{tags.map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>
);

const formatDate = d => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const IhaleFormStep4 = ({ form, formError, formSaving, editingTender, onClose, handleFormSubmit, onOpenSaveTemplate, isFormDirty }) => (
    <div className="ihale-step-content ihale-preview">
        <div className="ihale-preview__card">
            <div className="ihale-preview__header">
                <h4>{form.baslik || 'Başlık belirtilmedi'}</h4>
                <span className="tender-card-status tender-card-status-canli">{form.ihale_tipi}</span>
            </div>
            {/* Enes Doğanay | 2 Mayıs 2026: Önizlemede anonim durumu göster */}
            {form.anonim && (
                <div className="ihale-preview__anonim-badge">
                    <span className="material-symbols-outlined">visibility_off</span>
                    Firma adınız gizlenecek (Anonim İhale)
                </div>
            )}
            {form.aciklama && <p className="ihale-preview__desc">{form.aciklama}</p>}
            <div className="ihale-preview__grid">
                <PreviewItem icon="event" label="İhale Açılış" value={formatDate(form.yayin_tarihi)} />
                <PreviewItem icon="hourglass_bottom" label="İhale Kapanış" value={formatDate(form.son_basvuru_tarihi)} />
                <PreviewItem icon="local_shipping" label="Teslim Süresi" value={form.teslim_suresi || '—'} />
                <PreviewItem icon="receipt_long" label="KDV" value={form.kdv_durumu === 'dahil' ? 'KDV Dahil' : 'KDV Hariç'} />
                <PreviewItem icon="location_on" label="Teslim Yeri" value={[form.teslim_il, form.teslim_ilce].filter(Boolean).join(' / ') || '—'} />
                <PreviewItem icon="badge" label="Referans" value={form.referans_no || '—'} />
                {/* Enes Doğanay | 12 Mayıs 2026: Sektör önizlemede göster — sadece seçildiyse */}
                {form.sektor && <PreviewItem icon="domain" label="Sektör" value={form.sektor} />}
            </div>
            {form.gereksinimler.length > 0 && (
                <div className="ihale-preview__section">
                    {/* Enes Doğanay | 12 Mayıs 2026: Talep Kalemleri — form adım 3 ile aynı tablo tasarımı */}
                    <strong><span className="material-symbols-outlined">checklist</span> Talep Kalemleri ({form.gereksinimler.length})</strong>
                    <div className="ihale-preview__req-table">
                        <div className="ihale-preview__req-table-head">
                            <span>#</span><span>Adet</span><span>Kalem</span><span>Açıklama</span>
                        </div>
                        {form.gereksinimler.map((g, i) => (
                            <div key={g.id} className="ihale-preview__req-table-row">
                                <span className="ihale-preview__req-num">{i + 1}</span>
                                <span className="ihale-preview__req-adet">{g.adet || 1}</span>
                                <span className="ihale-preview__req-madde">{g.madde}</span>
                                <span className="ihale-preview__req-aciklama">{g.aciklama || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {form.davet_emailleri.length > 0 && (
                <PreviewSection icon="mail" label={`Davet E-postaları (${form.davet_emailleri.length})`} tags={form.davet_emailleri} />
            )}
            {form.davetli_firmalar.length > 0 && (
                <PreviewSection icon="business" label={`Davetli Firmalar (${form.davetli_firmalar.length})`} tags={form.davetli_firmalar.map(f => f.firma_adi)} />
            )}
            {form.ek_dosyalar.length > 0 && (
                <PreviewSection icon="attach_file" label={`Ek Dokümanlar (${form.ek_dosyalar.length})`} tags={form.ek_dosyalar.map(f => f.name)} />
            )}
        </div>
        {formError && <p className="ihale-form-error">{formError}</p>}
        <div className="ihale-modal__footer ihale-modal__footer--preview">
            <button type="button" className="ihale-btn-cancel" onClick={onClose}>İptal</button>
            {/* Enes Doğanay | 11 Mayıs 2026: Şablon kaydet butonu — context varsa her zaman göster */}
            {onOpenSaveTemplate && (
                <button type="button" className="ihale-btn-template" onClick={onOpenSaveTemplate}>
                    <span className="material-symbols-outlined">bookmark_add</span>
                    Şablon Kaydet
                </button>
            )}
            <button type="button" className="ihale-btn-draft" disabled={formSaving} onClick={() => handleFormSubmit(null, 'draft')}>
                <span className="material-symbols-outlined">save</span>
                {formSaving ? 'Kaydediliyor…' : 'Taslak Kaydet'}
            </button>
            {/* Enes Doğanay | 12 Mayıs 2026: Draft düzenlemede "İhaleyi Yayınla" göster; form.durum kontrolü her iki sayfayla uyumlu */}
            <button type="button" className="ihale-btn-save"
                disabled={formSaving || (!!editingTender && form.durum !== 'draft' && !isFormDirty)}
                onClick={() => handleFormSubmit(null, (!!editingTender && form.durum === 'draft') ? 'canli' : null)}>
                {formSaving ? 'Kaydediliyor…' : (editingTender && form.durum !== 'draft' ? 'Güncelle' : 'İhaleyi Yayınla')}
            </button>
        </div>
    </div>
);

export default IhaleFormStep4;
