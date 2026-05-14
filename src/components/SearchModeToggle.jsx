// Enes Doğanay | 11 Mayıs 2026: Arama modu seçici — input içi inline dropdown
import React, { useState, useRef, useEffect } from 'react';

const MODES = [
    { key: 'all',   label: 'Tümü',  icon: 'apps' },
    { key: 'firma', label: 'Firma', icon: 'business' },
    { key: 'urun',  label: 'Ürün',  icon: 'category' },
];

// Enes Doğanay | 14 Mayıs 2026: searchMode null ise render edilmez — diğer sayfalarda görünmez
const SearchModeToggle = ({ searchMode, onSearchModeChange }) => {
    if (!searchMode || !onSearchModeChange) return null;
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const current = MODES.find(m => m.key === searchMode) || MODES[0];

    return (
        <div className="smt-wrap" ref={ref}>
            <button
                type="button"
                className="smt-trigger"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Arama kapsamını seç"
            >
                <span className="material-symbols-outlined smt-icon">{current.icon}</span>
                <span className="smt-label">{current.label}</span>
                <span className={`material-symbols-outlined smt-chevron${open ? ' open' : ''}`}>expand_more</span>
            </button>
            {open && (
                <div className="smt-menu" role="listbox" aria-label="Arama kapsamı">
                    {MODES.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            type="button"
                            className={`smt-option${searchMode === key ? ' active' : ''}`}
                            role="option"
                            aria-selected={searchMode === key}
                            onClick={() => { onSearchModeChange(key); setOpen(false); }}
                        >
                            <span className="material-symbols-outlined">{icon}</span>
                            {label}
                            {searchMode === key && <span className="material-symbols-outlined smt-check">check</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchModeToggle;
