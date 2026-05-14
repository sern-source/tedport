// Enes Doğanay | 14 Mayıs 2026: Modern aktif filtre şeridi — icon, temiz buton, inline style kaldırıldı
import React from 'react';

const FirmalarActiveFilterTags = ({ activeTags, removeFilterTag, setFilters }) => {
    if (!activeTags.length) return null;
    return (
        <div className="active-filter-tags">
            <span className="active-filter-tags-label">
                <span className="material-symbols-outlined">filter_list</span>
                Filtreler
            </span>
            {activeTags.map(({ type, value }) => (
                <span key={`${type}-${value}`} className={`filter-chip filter-chip--${type}`}>
                    {value}
                    <button className="filter-chip-close" onClick={() => removeFilterTag(type, value)} aria-label={`${value} filtresini kaldır`}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </span>
            ))}
            <button className="active-filter-clear-all" onClick={() => setFilters({ cities: [], categories: [], sectors: [] })}>
                <span className="material-symbols-outlined">close</span>
                Temizle
            </button>
        </div>
    );
};

export default FirmalarActiveFilterTags;
