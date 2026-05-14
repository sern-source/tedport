// Enes Doganay | 6 Mayis 2026: Ihale form adim 3 - Teknik/Ticari Sartlar
// Enes Doganay | 14 Mayis 2026: Birim dropdown - position:fixed ile modal overflow'dan cikar
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// Enes Doganay | 14 Mayis 2026: Desteklenen birim secenekleri
const BIRIM_OPTIONS = [
    'Adet', 'Kg', 'Ton', 'Gram', 'Litre',
    'Metre', 'm²', 'Metreküp', 'Kutu', 'Paket',
    'Set', 'Takım', 'Rulo', 'Palet', 'Lot',
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
    const triggerRef = useRef(null);
    const secilenBirim = yeniGereksinimBirim || 'Adet';

    const handleToggle = () => {
        if (!birimOpen && triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            setMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 130) });
        }
        setBirimOpen(o => !o);
    };

    const handleSelect = (b) => {
        setYeniGereksinimBirim(b);
        setBirimOpen(false);
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
                        <input
                            type="number" min="1" value={yeniGereksinimAdet}
                            onChange={e => setYeniGereksinimAdet(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }}
                            className="ihale-req-adet-input"
                        />
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
                            onClick={() => setBirimOpen(false)}
                        />
                        <div
                            className="ihale-birim-menu"
                            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: menuPos.width, zIndex: 99999 }}
                        >
                            {BIRIM_OPTIONS.map(b => (
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