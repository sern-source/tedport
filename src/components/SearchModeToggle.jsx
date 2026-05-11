// Enes Doğanay | 11 Mayıs 2026: Gelişmiş arama modu seçici — Firma / Ürün toggle
import React from 'react';

const MODES = [
    { key: 'firma', label: 'Firma', icon: 'business' },
    { key: 'urun', label: 'Ürün', icon: 'category' },
];

// Enes Doğanay | 11 Mayıs 2026: searchMode null ise render edilmez — diğer sayfalarda görünmez
const SearchModeToggle = ({ searchMode, onSearchModeChange }) => {
    if (!searchMode || !onSearchModeChange) return null;

    return (
        <div className="search-mode-toggle" role="group" aria-label="Arama modu">
            <span className="search-mode-label-prefix">Ara:</span>
            {MODES.map(({ key, label, icon }) => (
                <button
                    key={key}
                    type="button"
                    className={`search-mode-pill${searchMode === key ? ' search-mode-pill--on' : ''}`}
                    onClick={() => onSearchModeChange(searchMode === key ? 'all' : key)}
                    aria-pressed={searchMode === key}
                    title={`${label} ara`}
                >
                    <span className="material-symbols-outlined search-mode-icon">{icon}</span>
                    <span className="search-mode-text">{label}</span>
                </button>
            ))}
        </div>
    );
};

export default SearchModeToggle;
