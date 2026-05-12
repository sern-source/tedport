// Enes Doğanay | 6 Mayıs 2026: Genel firma bilgileri kartı — ad, sektör, web, logo
// Enes Doğanay | 12 Mayıs 2026: ana_sektor combobox — listeden seç veya serbest yaz
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CompanyLogoSection from './CompanyLogoSection';
import { SEKTORLER } from '../pages/Firmalar/utils/sektorData';

const CompanyGeneralInfoCard = ({ fields, set, logoPreview, logoUploading, pendingLogoUrl, logoRedNotu, handleLogoUpload }) => {
    const [sektorOpen, setSektorOpen] = useState(false);
    const [sektorQuery, setSektorQuery] = useState('');
    const sektorRef = useRef(null);
    const inputRef = useRef(null);

    // Enes Doğanay | 12 Mayıs 2026: dışarı tıkla dropdown kapansın
    useEffect(() => {
        const handler = (e) => {
            if (sektorRef.current && !sektorRef.current.contains(e.target)) {
                setSektorOpen(false);
                setSektorQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Enes Doğanay | 12 Mayıs 2026: query yoksa tüm liste, varsa filtrele
    const filtered = useMemo(() => {
        if (!sektorQuery.trim()) return SEKTORLER;
        const q = sektorQuery.toLowerCase();
        return SEKTORLER.filter(s => s.toLowerCase().includes(q));
    }, [sektorQuery]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSektorQuery(val);
        set('ana_sektor', val);
        if (!sektorOpen) setSektorOpen(true);
    };

    const handleSelect = (s) => {
        set('ana_sektor', s);
        setSektorQuery('');
        setSektorOpen(false);
    };

    const handleInputFocus = () => {
        setSektorQuery('');
        setSektorOpen(true);
    };

    return (
        <div className="cmp-card">
            <div className="cmp-card__head">
                <span className="material-symbols-outlined">apartment</span>
                <div>
                    <h3>Genel Firma Bilgileri</h3>
                    <p>Firmalar listesinde ve detay sayfası başlığında görünen kimlik bilgileri.</p>
                </div>
            </div>
            <div className="cmp-grid cmp-grid--3">
                <label className="cmp-field">
                    <span>Firma Adı *</span>
                    <input type="text" value={fields.firma_adi} onChange={e => set('firma_adi', e.target.value)} required placeholder="Örn. ABC Makine San. A.Ş." />
                </label>
                {/* Enes Doğanay | 12 Mayıs 2026: Ana Sektör combobox — listeden seç veya serbest metin */}
                <div className="cmp-field">
                    <span>Ana Sektör</span>
                    <div className="cmp-sektor-wrap" ref={sektorRef}>
                        <div className={`cmp-sektor-trigger${sektorOpen ? ' cmp-sektor-trigger--open' : ''}`}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="cmp-sektor-input"
                                value={sektorOpen ? sektorQuery : (fields.ana_sektor || '')}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="Sektör seçin veya yazın..."
                                autoComplete="off"
                            />
                            <span
                                className="material-symbols-outlined cmp-sektor-chevron"
                                onMouseDown={e => { e.preventDefault(); setSektorOpen(p => !p); if (!sektorOpen) inputRef.current?.focus(); }}
                            >expand_more</span>
                        </div>
                        {sektorOpen && (
                            <div className="cmp-sektor-menu">
                                {filtered.length === 0 ? (
                                    <div className="cmp-sektor-empty">
                                        <span className="material-symbols-outlined">info</span>
                                        <span>"{sektorQuery}" — serbest metin olarak kaydedilecek</span>
                                    </div>
                                ) : (
                                    filtered.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            className={`cmp-sektor-option${fields.ana_sektor === s ? ' cmp-sektor-option--active' : ''}`}
                                            onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                                        >
                                            <span>{s}</span>
                                            {fields.ana_sektor === s && <span className="material-symbols-outlined cmp-sektor-check">check</span>}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <label className="cmp-field">
                    <span>Kategori / Açıklayıcı Ad</span>
                    <input type="text" value={fields.category_name} onChange={e => set('category_name', e.target.value)} placeholder="Örn. Boru ve Profil Üreticisi" />
                </label>
                <label className="cmp-field">
                    <span>Web Sitesi</span>
                    <div className="cmp-field-web">
                        <input type="text" value={fields.web_sitesi} onChange={e => set('web_sitesi', e.target.value)} placeholder="www.ornekfirma.com" />
                        {/* Enes Doğanay | 8 Mayıs 2026: aria-label — data-tooltip screen reader için yeterli değil */}
                        {fields.web_sitesi?.trim() && (
                            <a href={/^https?:\/\//i.test(fields.web_sitesi.trim()) ? fields.web_sitesi.trim() : `https://${fields.web_sitesi.trim()}`} target="_blank" rel="noopener noreferrer" className="cmp-field-web__link" data-tooltip="Web sitesini aç" aria-label="Web sitesini yeni sekmede aç">
                                <span className="material-symbols-outlined">open_in_new</span>
                            </a>
                        )}
                    </div>
                </label>
            </div>
            <CompanyLogoSection logoPreview={logoPreview} logoUploading={logoUploading} pendingLogoUrl={pendingLogoUrl} logoRedNotu={logoRedNotu} handleLogoUpload={handleLogoUpload} />
        </div>
    );
};

export default CompanyGeneralInfoCard;
