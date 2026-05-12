// Enes Doğanay | 6 Mayıs 2026: Teklif İste modal bileşeni
import React from 'react';
import DatePicker from '../../../components/DatePicker';
import CitySelect from '../../../components/CitySelect';
import './FdQuoteModal.css';

const FdQuoteModal = ({
    firma, userProfile,
    quoteForm, onFormChange,
    quoteSending, quoteSent,
    quoteFile, setQuoteFile,
    onClose, onSubmit, onFileWarning
}) => (
    <div className="quote-modal-overlay">
        {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal */}
        <div className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="fdquote-title" onClick={(e) => e.stopPropagation()}>
            {quoteSent ? (
                <div className="quote-modal-success">
                    <span className="material-symbols-outlined quote-success-icon">check_circle</span>
                    <h3>Teklif Talebiniz Gönderildi!</h3>
                    <p>Firma en kısa sürede talebinizi inceleyecektir.</p>
                </div>
            ) : (
                <>
                    {/* Enes Doğanay | 12 Mayıs 2026: Modern gradient header — logo + firma kimliği */}
                    <div className="quote-modal-header">
                        <div className="quote-modal-header__identity">
                            <div className="quote-modal-logo">
                                {firma?.logo_url?.includes('firma-logolari')
                                    ? <img src={firma.logo_url} alt={firma.firma_adi} className="quote-modal-logo__img" />
                                    : <span className="quote-modal-logo__fallback">{(firma?.firma_adi || '?')[0].toUpperCase()}</span>
                                }
                            </div>
                            <div className="quote-modal-header__text">
                                <span className="quote-modal-header__label">
                                    <span className="material-symbols-outlined">request_quote</span>Teklif Talebi
                                </span>
                                <h3 id="fdquote-title">{firma?.firma_adi}</h3>
                            </div>
                        </div>
                        <button className="quote-modal-close" onClick={() => { onClose(); setQuoteFile(null); }} type="button">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="quote-modal-body">
                        <div className="quote-form-group">
                            <label>Talep Başlığı *</label>
                            <input
                                type="text"
                                placeholder="Ör: Paslanmaz Çelik Boru Fiyat Talebi"
                                value={quoteForm.konu}
                                onChange={(e) => onFormChange('konu', e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="quote-form-row">
                            <div className="quote-form-group">
                                <label>Miktar</label>
                                <input
                                    type="number"
                                    placeholder="Ör: 500"
                                    value={quoteForm.miktar}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === '' || (Number(v) >= 0 && Number(v) <= 99999)) onFormChange('miktar', v);
                                    }}
                                    min={1}
                                    max={99999}
                                />
                            </div>
                            <div className="quote-form-group">
                                <label>Talep Edilen Teslim Tarihi</label>
                                <DatePicker
                                    value={quoteForm.teslim_tarihi}
                                    onChange={(val) => onFormChange('teslim_tarihi', val)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="quote-form-group">
                            <label>Teslim Yeri</label>
                            <CitySelect
                                value={quoteForm.teslim_yeri}
                                onChange={(city) => onFormChange('teslim_yeri', city)}
                            />
                        </div>

                        <div className="quote-form-group">
                            <label>Talep Detayları *</label>
                            <textarea
                                placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi vb.)"
                                value={quoteForm.mesaj}
                                onChange={(e) => onFormChange('mesaj', e.target.value)}
                                rows={4}
                                maxLength={2000}
                            />
                        </div>

                        <div className="quote-form-group">
                            <label>
                                Ek Dosya{' '}
                                <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: '#9ca3af' }}>
                                    (Opsiyonel — teknik şartname, çizim vb.)
                                </span>
                            </label>
                            <div className="quote-file-upload">
                                <label className="quote-file-btn" htmlFor="detay-quote-file">
                                    <span className="material-symbols-outlined">attach_file</span>
                                    {quoteFile ? quoteFile.name : 'Dosya Seç'}
                                </label>
                                <input
                                    id="detay-quote-file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f && f.size <= 10 * 1024 * 1024) setQuoteFile(f);
                                        else if (f) onFileWarning('Dosya boyutu en fazla 10 MB olabilir.');
                                    }}
                                />
                                {quoteFile && (
                                    <button type="button" className="quote-file-remove" onClick={() => setQuoteFile(null)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="quote-form-info">
                            <span className="material-symbols-outlined">info</span>
                            <span>İletişim bilgileriniz ({userProfile?.email}) taleple birlikte paylaşılacaktır.</span>
                        </div>
                    </div>

                    <div className="quote-modal-footer">
                        <button
                            className="btn btn-outline quote-btn-cancel"
                            onClick={() => { onClose(); setQuoteFile(null); }}
                            type="button"
                        >
                            İptal
                        </button>
                        <button
                            className="btn btn-primary quote-btn-send"
                            onClick={onSubmit}
                            disabled={quoteSending || !quoteForm.konu.trim() || !quoteForm.mesaj.trim()}
                            type="button"
                        >
                            {quoteSending ? 'Gönderiliyor...' : 'Teklif İste'}
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
);

export default FdQuoteModal;
