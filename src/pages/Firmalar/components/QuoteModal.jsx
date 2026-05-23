// Enes Doğanay | 6 Mayıs 2026: Teklif talebi modalı — kart ve liste görünümü paylaşımlı
// Enes Doğanay | 14 Mayıs 2026: Kalem kalem ekleme sistemi — ihale formuyla aynı mantık
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import CitySelect from '../../../components/CitySelect';
import DatePicker from '../../../components/DatePicker';
import { useAuth } from '../../../AuthContext';
import { ALLOWED_EK_DOSYA_UZANTILARI, ALLOWED_EK_DOSYA_ACCEPT, ALLOWED_EK_DOSYA_HATA, ALLOWED_EK_DOSYA_ETIKET } from '../../../constants/fileUpload';
import './QuoteModal.css';

// Enes Doğanay | 19 Mayıs 2026: Kategorili birim listesi
const BIRIM_CATEGORIES = [
  { label: '📦 Adet / Paketleme', options: ['Adet', 'Paket', 'Kutu', 'Koli', 'Palet', 'Rulo', 'Takım', 'Set', 'Çift', 'Deste', 'Varil', 'Bidon', 'Çuval', 'Şişe', 'Tüp', 'Konteyner'] },
  { label: '⚖️ Ağırlık', options: ['Gram', 'Kilogram', 'Ton', 'Miligram'] },
  { label: '📏 Uzunluk', options: ['Milimetre', 'Santimetre', 'Metre', 'Kilometre'] },
  { label: '🧱 Alan / Hacim', options: ['m²', 'Dekar', 'Hektar', 'Mililitre', 'Litre', 'm³'] },
  { label: '⏱️ Zaman', options: ['Saat', 'Gün', 'Hafta', 'Ay', 'Yıl'] },
  { label: '👷 Hizmet / İş Gücü', options: ['Kişi', 'Adam/Saat', 'Sefer', 'Vardiya', 'Proje', 'Hizmet', 'İş Kalemi'] },
  { label: '🚛 Lojistik', options: ['Tır', 'Kamyon', 'Yük', 'Parti'] },
  { label: '⚡ Enerji / Teknik', options: ['Watt', 'Kilowatt', 'kWh', 'kVA', 'Volt', 'Amper'] },
  { label: '💻 Yazılım / Dijital', options: ['Lisans', 'Kullanıcı', 'Abonelik'] },
];

const QuoteModal = ({ supplier, form, quoteFile, sending, sent, userProfile, onClose, onSetField, onSetFile, onSubmit, fieldError = { key: '', msg: '' } }) => {
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
  // Enes Doğanay | 19 Mayıs 2026: Özel birim modu
  const [customBirimMode, setCustomBirimMode] = useState(false);
  const [customBirimInput, setCustomBirimInput] = useState('');
  // Enes Doğanay | 23 Mayıs 2026: Birim arama
  const [birimSearch, setBirimSearch] = useState('');
  // Enes Doğanay | 16 Mayıs 2026: Dosya türü hata mesajı — component yerel state
  const [fileError, setFileError] = useState('');
  const kalemBirimRef = useRef(null);
  const customBirimRef = useRef(null);
  const birimSearchRef = useRef(null);
  // Enes Doğanay | 14 Mayıs 2026: Kalem eklendikten sonra madde input'a fokuslan
  const maddeInputRef = useRef(null);
  // Enes Doğanay | 23 Mayıs 2026: Auto-expand textarea ref'leri
  const aciklamaRef = useRef(null);
  const konuRef = useRef(null);

  useEffect(() => {
    if (customBirimMode && customBirimRef.current) customBirimRef.current.focus();
  }, [customBirimMode]);
  // Enes Doğanay | 23 Mayıs 2026: Dropdown açılınca arama input'una fokuslan
  useEffect(() => {
    if (kalemBirimOpen && birimSearchRef.current) birimSearchRef.current.focus();
  }, [kalemBirimOpen]);

  // Enes Doğanay | 14 Mayıs 2026: Teklif gönderildikten 4 saniye sonra modalı otomatik kapat
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(t);
  }, [sent, onClose]);

  const handleKalemBirimToggle = () => {
    if (!kalemBirimOpen && kalemBirimRef.current) {
      const r = kalemBirimRef.current.getBoundingClientRect();
      setKalemBirimMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 170) });
    }
    if (kalemBirimOpen) { setCustomBirimMode(false); setCustomBirimInput(''); setBirimSearch(''); }
    setKalemBirimOpen(o => !o);
  };

  // Enes Doğanay | 23 Mayıs 2026: Auto-expand textarea — max 3 satır, fazlası reddedilir
  const handleExpandChange = (e, prevVal, setter) => {
    const el = e.target;
    const newVal = el.value;
    el.style.height = 'auto';
    const s = getComputedStyle(el);
    const lh = parseFloat(s.lineHeight) || 18;
    const maxH = lh * 3 + parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
    if (el.scrollHeight > maxH + 1 && newVal.length > prevVal.length) {
      el.style.height = maxH + 'px';
      return; // 3 satır limitine ulaşıldı — reddedildi
    }
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
    setter(newVal);
  };

  const handleAddKalem = () => {
    if (!yeniMadde.trim()) return;
    onSetField('kalemler', [...(form.kalemler || []), {
      id: Date.now().toString(),
      adet: Number(yeniAdet) || 1,
      birim: yeniBirim,
      madde: yeniMadde.trim(),
      aciklama: yeniAciklama.trim(),
    }]);
    setYeniMadde(''); setYeniAdet('1'); setYeniAciklama('');
    // Enes Doğanay | 23 Mayıs 2026: Textarea yüksekliklerini sıfırla
    if (maddeInputRef.current) maddeInputRef.current.style.height = '';
    if (aciklamaRef.current) aciklamaRef.current.style.height = '';
    // Enes Doğanay | 14 Mayıs 2026: Madde input'a fokuslan — state güncellenmesi beklenir
    setTimeout(() => maddeInputRef.current?.focus(), 0);
  };

  const handleRemoveKalem = (id) =>
    onSetField('kalemler', (form.kalemler || []).filter(k => k.id !== id));

  // Enes Doğanay | 16 Mayıs 2026: + basılmadan submit edilirse pending kalemi otomatik dahil et
  const handleSubmitClick = () => {
    const pendingKalem = yeniMadde.trim() ? {
      id: Date.now().toString(),
      adet: Number(yeniAdet) || 1,
      birim: yeniBirim,
      madde: yeniMadde.trim(),
      aciklama: yeniAciklama.trim(),
    } : null;
    onSubmit(pendingKalem);
  };

  return (
  <div className="quote-modal-overlay">
    {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal */}
    <div className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="flquote-title" onClick={e => e.stopPropagation()}>
      {sent ? (
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
          {/* Enes Doğanay | 12 Mayıs 2026: Modern gradient header — logo + firma adı */}
          <div className="quote-modal-header">
            <div className="quote-modal-header__identity">
              <div className="quote-modal-logo">
                {/* Enes Doğanay | 23 Mayıs 2026: next/image — WebP optimizasyon */}
                {supplier.images
                  ? <Image src={supplier.images} alt={supplier.name || 'Logo'} width={44} height={44} style={{ objectFit: 'contain' }} />
                  : <span className="quote-modal-logo__fallback">{(supplier.name || '?')[0].toUpperCase()}</span>
                }
              </div>
              <div className="quote-modal-header__text">
                <span className="quote-modal-header__label">
                  <span className="material-symbols-outlined">request_quote</span>Teklif Talebi
                </span>
                <h3 id="flquote-title">{supplier.name}</h3>
              </div>
            </div>
            <button className="quote-modal-close" onClick={onClose} type="button" aria-label="Kapat">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="quote-modal-body">
            <div className="quote-form-group">
              <label>Talep Başlığı *</label>
              {/* Enes Doğanay | 23 Mayıs 2026: Auto-expand textarea — max 3 satır */}
              <textarea
                rows={1} placeholder="Ör: Paslanmaz Çelik Boru Fiyat Talebi"
                value={form.konu}
                onChange={e => handleExpandChange(e, form.konu, v => onSetField('konu', v))}
                onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                maxLength={200} className="quote-expand-ta" ref={konuRef}
              />
              {fieldError.key === 'konu' && <span className="cmp-field-err"><span className="material-symbols-outlined">error</span>{fieldError.msg}</span>}
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
                  {/* Enes Doğanay | 16 Mayıs 2026: Adet stepper butonları */}
                  <button type="button" className="quote-kalem-step-btn" tabIndex={-1} onClick={() => setYeniAdet(String(Math.max(1, (parseInt(yeniAdet) || 1) - 1)))}><span className="material-symbols-outlined">remove</span></button>
                  <input
                    type="number" min="1" max="99999" placeholder="1"
                    value={yeniAdet} onChange={e => setYeniAdet(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKalem(); } }}
                    className="quote-kalem-adet-input"
                    style={{ width: `calc(${Math.max(1, String(yeniAdet || '').length)}ch + 8px)` }}
                  />
                  <button type="button" className="quote-kalem-step-btn" tabIndex={-1} onClick={() => setYeniAdet(String(Math.min(99999, (parseInt(yeniAdet) || 1) + 1)))}><span className="material-symbols-outlined">add</span></button>
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
                {/* Enes Doğanay | 23 Mayıs 2026: Auto-expand textarea — max 3 satır */}
                <textarea
                  rows={1} placeholder="Ürün / Malzeme adı *"
                  value={yeniMadde}
                  onChange={e => handleExpandChange(e, yeniMadde, setYeniMadde)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKalem(); } }}
                  className="quote-kalem-madde-input"
                  ref={maddeInputRef}
                />
                {/* Enes Doğanay | 23 Mayıs 2026: Auto-expand textarea — max 3 satır */}
                <textarea
                  rows={1} placeholder="Açıklama (opsiyonel)"
                  value={yeniAciklama}
                  onChange={e => handleExpandChange(e, yeniAciklama, setYeniAciklama)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKalem(); } }}
                  className="quote-kalem-aciklama-input"
                  ref={aciklamaRef}
                />
                <button type="button" className="quote-kalem-add-btn" onClick={handleAddKalem} disabled={!yeniMadde.trim()}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              {(form.kalemler || []).length > 0 && (
                <div className="quote-kalem-table">
                  <div className="quote-kalem-table__header">
                    <span>#</span><span>Miktar</span><span>Kalem</span><span>Açıklama</span><span></span>
                  </div>
                  {(form.kalemler || []).map((k, i) => (
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
              {fieldError.key === 'kalemler' && <span className="cmp-field-err"><span className="material-symbols-outlined">error</span>{fieldError.msg}</span>}
            </div>

            <div className="quote-form-row">
              <div className="quote-form-group">
                <label>Talep Edilen Teslim Tarihi</label>
                <DatePicker
                  value={form.teslim_tarihi}
                  onChange={val => onSetField('teslim_tarihi', val)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="quote-form-group">
                <label>Teslim Yeri</label>
                <CitySelect value={form.teslim_yeri} onChange={city => onSetField('teslim_yeri', city)} />
              </div>
            </div>

            <div className="quote-form-group">
              <label>Talep Detayları *</label>
              <textarea
                placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi vb.)"
                value={form.mesaj} onChange={e => onSetField('mesaj', e.target.value)}
                rows={3} maxLength={2000} className="quote-detaylar-ta"
              />
              {fieldError.key === 'mesaj' && <span className="cmp-field-err"><span className="material-symbols-outlined">error</span>{fieldError.msg}</span>}
            </div>

            <div className="quote-form-group">
              <label>Ek Dosya <span className="quote-file-optional">(Opsiyonel — teknik şartname, çizim vb.)</span></label>
              <div className="quote-file-upload">
                <label className="quote-file-btn" htmlFor="quote-modal-file">
                  <span className="material-symbols-outlined">attach_file</span>
                  {quoteFile ? quoteFile.name : 'Dosya Seç'}
                </label>
                <input
                  id="quote-modal-file" type="file"
                  accept={ALLOWED_EK_DOSYA_ACCEPT}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const ext = f.name.split('.').pop()?.toLowerCase() || '';
                    if (!ALLOWED_EK_DOSYA_UZANTILARI.has(ext)) { setFileError(ALLOWED_EK_DOSYA_HATA); e.target.value = ''; return; }
                    if (f.size > 10 * 1024 * 1024) { setFileError('Dosya boyutu en fazla 10 MB olabilir.'); e.target.value = ''; return; }
                    setFileError('');
                    onSetFile(f);
                  }}
                />
                {quoteFile && (
                  <button type="button" className="quote-file-remove" onClick={() => onSetFile(null)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
              {/* Enes Doğanay | 16 Mayıs 2026: Dosya türü hata mesajı */}
              {fileError && <p style={{ margin: '4px 0 0', fontSize: '0.77rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{fileError}</p>}
            </div>

            <div className="quote-form-info">
              <span className="material-symbols-outlined">info</span>
              <span>İletişim bilgileriniz ({userProfile?.email}) taleple birlikte paylaşılacaktır.</span>
            </div>
          </div>

          <div className="quote-modal-footer">
            <button className="btn btn-outline quote-btn-cancel" onClick={onClose} type="button">İptal</button>
            <button
              className="btn btn-primary quote-btn-send" onClick={handleSubmitClick} type="button"
              disabled={sending || !form.konu.trim() || !form.mesaj.trim()}
            >
              {sending ? 'Gönderiliyor...' : 'Teklif İste'}
            </button>
          </div>
        </>
      )}
    </div>
    {kalemBirimOpen && createPortal(
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onClick={() => { setKalemBirimOpen(false); setCustomBirimMode(false); setCustomBirimInput(''); }} />
        <div className="quote-birim-menu" style={{ position: 'fixed', top: kalemBirimMenuPos.top, left: kalemBirimMenuPos.left, minWidth: kalemBirimMenuPos.width, zIndex: 99999 }}>
          {/* Enes Doğanay | 23 Mayıs 2026: Birim arama çubuğu */}
          <div className="quote-birim-search-wrap">
            <span className="material-symbols-outlined quote-birim-search-icon">search</span>
            <input ref={birimSearchRef} type="text" className="quote-birim-search"
              placeholder="Birim ara..."
              value={birimSearch}
              onChange={e => setBirimSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') { setKalemBirimOpen(false); setBirimSearch(''); } }}
            />
            {birimSearch && (
              <button type="button" className="quote-birim-search-clear" onClick={() => setBirimSearch('')}>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
          {(() => {
            const q = birimSearch.trim().toLowerCase();
            const cats = q
              ? BIRIM_CATEGORIES.map(c => ({ ...c, options: c.options.filter(o => o.toLowerCase().includes(q)) })).filter(c => c.options.length > 0)
              : BIRIM_CATEGORIES;
            if (cats.length === 0) return <div className="quote-birim-empty">Eşleşen birim bulunamadı</div>;
            return cats.map(cat => (
              <div key={cat.label}>
                {!q && <div className="quote-birim-category">{cat.label}</div>}
                {cat.options.map(b => (
                  <button key={b} type="button"
                    className={yeniBirim === b ? 'quote-birim-option active' : 'quote-birim-option'}
                    onClick={() => { setYeniBirim(b); setKalemBirimOpen(false); setCustomBirimMode(false); setCustomBirimInput(''); setBirimSearch(''); }}
                  >
                    <span className="quote-birim-option-label">{b}</span>
                    {yeniBirim === b && <span className="material-symbols-outlined quote-birim-check">check</span>}
                  </button>
                ))}
              </div>
            ));
          })()}
          <div className="quote-birim-category-divider" />
          {customBirimMode ? (
            <div className="quote-birim-custom-input-wrap">
              <input ref={customBirimRef} type="text" className="quote-birim-custom-input"
                placeholder="Birim adı girin..."
                value={customBirimInput} onChange={e => setCustomBirimInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customBirimInput.trim()) { setYeniBirim(customBirimInput.trim()); setKalemBirimOpen(false); setCustomBirimMode(false); setCustomBirimInput(''); }
                  if (e.key === 'Escape') { setCustomBirimMode(false); setCustomBirimInput(''); }
                }}
              />
              <button type="button" className="quote-birim-custom-confirm" disabled={!customBirimInput.trim()}
                onClick={() => { if (customBirimInput.trim()) { setYeniBirim(customBirimInput.trim()); setKalemBirimOpen(false); setCustomBirimMode(false); setCustomBirimInput(''); } }}
              >
                <span className="material-symbols-outlined">check</span>
              </button>
            </div>
          ) : (
            <button type="button" className="quote-birim-option quote-birim-option--custom"
              onClick={e => { e.stopPropagation(); setCustomBirimMode(true); }}
            >
              <span className="quote-birim-option-label">✏️ Özel Birim...</span>
            </button>
          )}
        </div>
      </>,
      document.body
    )}
  </div>
  );
};

export default QuoteModal;
