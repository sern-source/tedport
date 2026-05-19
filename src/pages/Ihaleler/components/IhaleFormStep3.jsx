// Enes Doganay | 6 Mayis 2026: Ihale form adim 3 - Teknik/Ticari Sartlar
// Enes Doganay | 14 Mayis 2026: Birim dropdown - position:fixed ile modal overflow'dan cikar
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Enes Doğanay | 19 Mayıs 2026: Kategorili birim listesi — geniş sektör kapsamı için
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

const IhaleFormStep3 = ({
    form,
    yeniGereksinimMadde, setYeniGereksinimMadde,
    yeniGereksinimAciklama, setYeniGereksinimAciklama,
    yeniGereksinimAdet, setYeniGereksinimAdet,
    yeniGereksinimBirim, setYeniGereksinimBirim,
    fileInputRef,
    addGereksinim, removeGereksinim,
    handleFileAdd, removeFile,
}) => {
    const [birimOpen, setBirimOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
    // Enes Doğanay | 19 Mayıs 2026: Özel birim modu — kullanıcı istediği birimi yazar
    const [customBirimMode, setCustomBirimMode] = useState(false);
    const [customBirimInput, setCustomBirimInput] = useState('');
    const triggerRef = useRef(null);
    const customBirimRef = useRef(null);
    const secilenBirim = yeniGereksinimBirim || 'Adet';

    useEffect(() => {
        if (customBirimMode && customBirimRef.current) customBirimRef.current.focus();
    }, [customBirimMode]);

    const handleToggle = () => {
        if (!birimOpen && triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            setMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 170) });
        }
        if (birimOpen) { setCustomBirimMode(false); setCustomBirimInput(''); }
        setBirimOpen(o => !o);
    };

    const handleSelect = (b) => {
        setYeniGereksinimBirim(b);
        setBirimOpen(false);
        setCustomBirimMode(false);
        setCustomBirimInput('');
    };

    return (
        <div className="ihale-step-content">
            <div className="ihale-section ihale-section--no-border">
                <span className="ihale-section__title">
                    <span className="material-symbols-outlined">checklist</span>
                    Talep Kalemleri *
                </span>
                <p className="ihale-section__desc">Teklif alacağınız ürün ve malzemeleri miktar ve birimle birlikte ekleyin.</p>
                <div className="ihale-req-input-row">
                    <div className="ihale-req-adet-group">
                        {/* Enes Doğanay | 19 Mayıs 2026: Stepper butonları — teklif iste popup ile tutarlılık */}
                        <button type="button" className="ihale-req-step-btn" tabIndex={-1}
                            onClick={() => setYeniGereksinimAdet(String(Math.max(1, (parseInt(yeniGereksinimAdet) || 1) - 1)))}>
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <input
                            type="number" min="1" value={yeniGereksinimAdet}
                            onChange={e => setYeniGereksinimAdet(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }}
                            className="ihale-req-adet-input"
                            style={{ width: `calc(${Math.max(1, String(yeniGereksinimAdet || '').length)}ch + 8px)` }}
                        />
                        <button type="button" className="ihale-req-step-btn" tabIndex={-1}
                            onClick={() => setYeniGereksinimAdet(String(Math.min(99999, (parseInt(yeniGereksinimAdet) || 1) + 1)))}>
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <div className="ihale-birim-wrap">
                            <button
                                ref={triggerRef}
                                type="button"
                                className={birimOpen ? 'ihale-birim-trigger open' : 'ihale-birim-trigger'}
                                onClick={handleToggle}
                            >
                                <span className="ihale-birim-label">{secilenBirim}</span>
                                <span className={birimOpen ? 'material-symbols-outlined ihale-birim-chevron open' : 'material-symbols-outlined ihale-birim-chevron'}>expand_more</span>
                            </button>
                        </div>
                    </div>
                    <input type="text" placeholder="Ürün / Malzeme adı *" value={yeniGereksinimMadde}
                        onChange={e => setYeniGereksinimMadde(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }} />
                    <input type="text" placeholder="Açıklama (opsiyonel)" value={yeniGereksinimAciklama}
                        onChange={e => setYeniGereksinimAciklama(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }} />
                    <button type="button" className="ihale-req-add-btn" onClick={addGereksinim} disabled={!yeniGereksinimMadde.trim()}>
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                {birimOpen && createPortal(
                    <>
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
                            onClick={() => { setBirimOpen(false); setCustomBirimMode(false); setCustomBirimInput(''); }}
                        />
                        <div
                            className="ihale-birim-menu"
                            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: menuPos.width, zIndex: 99999 }}
                        >
                            {BIRIM_CATEGORIES.map(cat => (
                                <div key={cat.label}>
                                    <div className="ihale-birim-category">{cat.label}</div>
                                    {cat.options.map(b => (
                                        <button
                                            key={b} type="button"
                                            className={secilenBirim === b ? 'ihale-birim-option active' : 'ihale-birim-option'}
                                            onClick={() => handleSelect(b)}
                                        >
                                            <span className="ihale-birim-option-label">{b}</span>
                                            {secilenBirim === b && <span className="material-symbols-outlined ihale-birim-check">check</span>}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            <div className="ihale-birim-category-divider" />
                            {customBirimMode ? (
                                <div className="ihale-birim-custom-input-wrap">
                                    <input
                                        ref={customBirimRef}
                                        type="text"
                                        className="ihale-birim-custom-input"
                                        placeholder="Birim adı girin..."
                                        value={customBirimInput}
                                        onChange={e => setCustomBirimInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && customBirimInput.trim()) { handleSelect(customBirimInput.trim()); }
                                            if (e.key === 'Escape') { setCustomBirimMode(false); setCustomBirimInput(''); }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="ihale-birim-custom-confirm"
                                        disabled={!customBirimInput.trim()}
                                        onClick={() => { if (customBirimInput.trim()) handleSelect(customBirimInput.trim()); }}
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="ihale-birim-option ihale-birim-option--custom"
                                    onClick={e => { e.stopPropagation(); setCustomBirimMode(true); }}
                                >
                                    <span className="ihale-birim-option-label">✏️ Özel Birim...</span>
                                </button>
                            )}
                        </div>
                    </>,
                    document.body
                )}
                {form.gereksinimler.length > 0 && (
                    <div className="ihale-req-table">
                        <div className="ihale-req-table__header">
                            <span>#</span><span>Miktar</span><span>Kalem</span><span>Açıklama</span><span></span>
                        </div>
                        {form.gereksinimler.map((g, i) => (
                            <div key={g.id} className="ihale-req-table__row">
                                <span className="ihale-req-table__num">{i + 1}</span>
                                <span className="ihale-req-table__adet">{g.adet || 1} {g.birim || 'Adet'}</span>
                                <span className="ihale-req-table__madde">{g.madde}</span>
                                <span className="ihale-req-table__aciklama">{g.aciklama || '—'}</span>
                                <button type="button" className="ihale-req-table__remove" onClick={() => removeGereksinim(g.id)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="ihale-section">
                <span className="ihale-section__title">
                    <span className="material-symbols-outlined">attach_file</span>
                    Ek Dokümanlar
                </span>
                <p className="ihale-section__desc">Teknik şartname, çizim veya diğer dokümanları ekleyin. (Maks. 10 MB / dosya)</p>
                <div className="ihale-file-upload">
                    <button type="button" className="ihale-file-btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                        <span className="material-symbols-outlined">upload_file</span>
                        Dosya Seç
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.dwg"
                        style={{ display: 'none' }} onChange={handleFileAdd} />
                </div>
                {form.ek_dosyalar.length > 0 && (
                    <div className="ihale-file-list">
                        {form.ek_dosyalar.map((f, i) => (
                            <div key={i} className="ihale-file-item">
                                <span className="material-symbols-outlined">description</span>
                                <span className="ihale-file-name">{f.name}</span>
                                <span className="ihale-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                                <button type="button" onClick={() => removeFile(i)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IhaleFormStep3;