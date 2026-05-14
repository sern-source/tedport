// Enes Doğanay | 6 Mayıs 2026: Teklif İste modal bileşeni
// Enes Doğanay | 14 Mayıs 2026: Kalem kalem ekleme sistemi — ihale formuyla aynı mantık
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from '../../../components/DatePicker';
import CitySelect from '../../../components/CitySelect';
import { useAuth } from '../../../AuthContext';
import './FdQuoteModal.css';

// Enes Doğanay | 14 Mayıs 2026: Kalem birim seçenekleri
const BIRIM_OPTIONS = ['Adet', 'Kg', 'Ton', 'Gram', 'Litre', 'Metre', 'm²', 'Metreküp', 'Kutu', 'Paket', 'Set', 'Takım', 'Rulo', 'Palet', 'Lot'];

const FdQuoteModal = ({
    firma, userProfile,
    quoteForm, onFormChange,
    quoteSending, quoteSent,
    quoteFile, setQuoteFile,
    onClose, onSubmit, onFileWarning
}) => {
    // Enes Doğanay | 14 Mayıs 2026: Firma kullanıcısı mı tespiti + auto-close
    const { managedCompanyId } = useAuth();
    const isFirmaUser = Boolean(managedCompanyId);
    // Enes Doğanay | 14 Mayıs 2026: Yeni kalem input state
    const [yeniMadde, setYeniMadde] = useState('');
    const [yeniAdet, setYeniAdet] = useState('1');
    const [yeniBirim, setYeniBirim] = useState('Adet');
    const [yeniAciklama, setYeniAciklama] = useState('');
    const [kalemBirimOpen, setKalemBirimOpen] = useState(false);
    const [kalemBirimMenuPos, setKalemBirimMenuPos] = useState({ top: 0, left: 0, width: 0 });
    const kalemBirimRef = useRef(null);
    // Enes Doğanay | 14 Mayıs 2026: Kalem eklendikten sonra madde input'a fokuslan
    const maddeInputRef = useRef(null);

    // Enes Doğanay | 14 Mayıs 2026: Teklif gönderildikten 4 saniye sonra modalı otomatik kapat
    useEffect(() => {
        if (!quoteSent) return;
        const t = setTimeout(() => onClose(), 4000);
        return () => clearTimeout(t);
    }, [quoteSent, onClose]);

    const handleKalemBirimToggle = () => {
        if (!kalemBirimOpen && kalemBirimRef.current) {
            const r = kalemBirimRef.current.getBoundingClientRect();
            setKalemBirimMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 120) });
        }
        setKalemBirimOpen(o => !o);
    };

    const handleAddKalem = () => {
        if (!yeniMadde.trim()) return;
        onFormChange('kalemler', [...(quoteForm.kalemler || []), {
            id: Date.now().toString(),
            adet: Number(yeniAdet) || 1,
            birim: yeniBirim,
            madde: yeniMadde.trim(),
            aciklama: yeniAciklama.trim(),
        }]);
        setYeniMadde(''); setYeniAdet('1'); setYeniAciklama('');
        // Enes Doğanay | 14 Mayıs 2026: Madde input'a fokuslan — state güncellenmesi beklenir
        setTimeout(() => maddeInputRef.current?.focus(), 0);
    };

    const handleRemoveKalem = (id) =>
        onFormChange('kalemler', (quoteForm.kalemler || []).filter(k => k.id !== id));

    return (
    <div className="quote-modal-overlay">
        {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal */}
        <div className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="fdquote-title" onClick={(e) => e.stopPropagation()}>
            {quoteSent ? (
                <div className="quote-modal-success">
                    <span className="material-symbols-outlined quote-success-icon">check_circle</span>
                    <h3>Teklif Talebiniz Gönderildi!</h3>
                    <p>Firma en kısa sürede talebinizi inceleyecektir.</p>
                    {/* Enes Doğanay | 14 Mayıs 2026: Kullanıcı tipine göre yönlendirme — firma → Teklif Yönetimi, alıcı → Teklif Taleplerim */}
                    <div className="quote-success-info">
                        <span className="material-symbols-outlined">request_quote</span>
                        {isFirmaUser ? (
                            <span><a href="/firma-profil?tab=teklifler">Teklif Yönetimi</a> sayfasından teklifinizin durumunu takip edebilirsiniz.</span>
                        ) : (
                            <span><a href="/profile?tab=quotes">Teklif Taleplerim</a> sayfasından teklifinizin durumunu takip edebilirsiniz.</span>
                        )}
                    </div>
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

                        {/* Enes Doğanay | 14 Mayıs 2026: Kalem kalem ekleme sistemi */}
                        <div className="quote-form-group">
                            <label className="quote-kalem-label">
                                <span className="material-symbols-outlined">checklist</span>
                                Talep Kalemleri
                            </label>
                            <p className="quote-kalem-desc">Teklif alacağınız ürün ve malzemeleri miktar ve birimle birlikte ekleyin.</p>
                            <div className="quote-kalem-input-row">
                                <div className="quote-kalem-adet-group">
                                    <input
                                        type="number" min="1" max="99999" placeholder="1"
                                        value={yeniAdet} onChange={e => setYeniAdet(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKalem(); } }}
                                        className="quote-kalem-adet-input"
                                    />
                                    <div className="quote-kalem-birim-wrap">
                                        <button
                                            ref={kalemBirimRef} type="button"
                                            className={kalemBirimOpen ? 'quote-kalem-birim-trigger open' : 'quote-kalem-birim-trigger'}
                                            onClick={handleKalemBirimToggle}
                                        >
                                            <span className="quote-kalem-birim-label">{yeniBirim}</span>
                                            <span className="material-symbols-outlined quote-kalem-birim-chevron">expand_more</span>
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text" placeholder="Ürün / Malzeme adı *"
                                    value={yeniMadde} onChange={e => setYeniMadde(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKalem(); } }}
                                    className="quote-kalem-madde-input"
                                    ref={maddeInputRef}
                                />
                                <input
                                    type="text" placeholder="Açıklama (opsiyonel)"
                                    value={yeniAciklama} onChange={e => setYeniAciklama(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKalem(); } }}
                                    className="quote-kalem-aciklama-input"
                                />
                                <button type="button" className="quote-kalem-add-btn" onClick={handleAddKalem} disabled={!yeniMadde.trim()}>
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                            {(quoteForm.kalemler || []).length > 0 && (
                                <div className="quote-kalem-table">
                                    <div className="quote-kalem-table__header">
                                        <span>#</span><span>Miktar</span><span>Kalem</span><span>Açıklama</span><span></span>
                                    </div>
                                    {(quoteForm.kalemler || []).map((k, i) => (
                                        <div key={k.id} className="quote-kalem-table__row">
                                            <span className="quote-kalem-table__num">{i + 1}</span>
                                            <span className="quote-kalem-table__adet">{k.adet} {k.birim}</span>
                                            <span className="quote-kalem-table__madde">{k.madde}</span>
                                            <span className="quote-kalem-table__aciklama">{k.aciklama || '—'}</span>
                                            <button type="button" className="quote-kalem-table__remove" onClick={() => handleRemoveKalem(k.id)}>
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="quote-form-row">
                            <div className="quote-form-group">
                                <label>Talep Edilen Teslim Tarihi</label>
                                <DatePicker
                                    value={quoteForm.teslim_tarihi}
                                    onChange={(val) => onFormChange('teslim_tarihi', val)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="quote-form-group">
                                <label>Teslim Yeri</label>
                                <CitySelect
                                    value={quoteForm.teslim_yeri}
                                    onChange={(city) => onFormChange('teslim_yeri', city)}
                                />
                            </div>
                        </div>

                        <div className="quote-form-group">
                            <label>Talep Detayları *</label>
                            <textarea
                                placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi vb.)"
                                value={quoteForm.mesaj}
                                onChange={(e) => onFormChange('mesaj', e.target.value)}
                                rows={3}
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
        {kalemBirimOpen && createPortal(
            <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onClick={() => setKalemBirimOpen(false)} />
                <div className="quote-birim-menu" style={{ position: 'fixed', top: kalemBirimMenuPos.top, left: kalemBirimMenuPos.left, minWidth: kalemBirimMenuPos.width, zIndex: 99999 }}>
                    {BIRIM_OPTIONS.map(b => (
                        <button key={b} type="button"
                            className={yeniBirim === b ? 'quote-birim-option active' : 'quote-birim-option'}
                            onClick={() => { setYeniBirim(b); setKalemBirimOpen(false); }}
                        >
                            <span className="quote-birim-option-label">{b}</span>
                            {yeniBirim === b && <span className="material-symbols-outlined quote-birim-check">check</span>}
                        </button>
                    ))}
                </div>
            </>,
            document.body
        )}
    </div>
    );
};

export default FdQuoteModal;
