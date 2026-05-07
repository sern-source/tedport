// Enes Doğanay | 6 Mayıs 2026: İhale form adım 3 — Teknik/Ticari Şartlar
import React from 'react';

const IhaleFormStep3 = ({
    form,
    yeniGereksinimMadde, setYeniGereksinimMadde,
    yeniGereksinimAciklama, setYeniGereksinimAciklama,
    fileInputRef,
    addGereksinim, removeGereksinim,
    handleFileAdd, removeFile,
}) => (
    <div className="ihale-step-content">
        <div className="ihale-section ihale-section--no-border">
            <span className="ihale-section__title">
                <span className="material-symbols-outlined">checklist</span>
                İhale Gereksinimleri *
            </span>
            <p className="ihale-section__desc">Kalem kalem gereksinimlerinizi ekleyin.</p>
            <div className="ihale-req-input-row">
                <input type="text" placeholder="Gereksinim maddesi *" value={yeniGereksinimMadde}
                    onChange={e => setYeniGereksinimMadde(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }} />
                <input type="text" placeholder="Açıklama (opsiyonel)" value={yeniGereksinimAciklama}
                    onChange={e => setYeniGereksinimAciklama(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }} />
                <button type="button" className="ihale-req-add-btn" onClick={addGereksinim} disabled={!yeniGereksinimMadde.trim()}>
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>
            {form.gereksinimler.length > 0 && (
                <div className="ihale-req-table">
                    <div className="ihale-req-table__header">
                        <span>#</span><span>Madde</span><span>Açıklama</span><span></span>
                    </div>
                    {form.gereksinimler.map((g, i) => (
                        <div key={g.id} className="ihale-req-table__row">
                            <span className="ihale-req-table__num">{i + 1}</span>
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
                <button type="button" className="ihale-file-btn" onClick={() => fileInputRef.current?.click()}>
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

export default IhaleFormStep3;
