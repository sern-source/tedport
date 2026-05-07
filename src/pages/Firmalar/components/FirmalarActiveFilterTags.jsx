// Enes Doğanay | 6 Mayıs 2026: Aktif filtre etiketleri şeridi
import React from 'react';

const FirmalarActiveFilterTags = ({ activeTags, removeFilterTag, setFilters }) => {
    if (!activeTags.length) return null;
    return (
        <div className="active-filter-tags">
            <span className="active-filter-tags-label">Filtreler:</span>
            {activeTags.map(({ type, value }) => (
                <span key={`${type}-${value}`} className={`filter-chip filter-chip--${type}`}>
                    {value}
                    <button onClick={() => removeFilterTag(type, value)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', lineHeight: 1 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>close</span>
                    </button>
                </span>
            ))}
            <button className="active-filter-clear-all" onClick={() => setFilters({ cities: [], categories: [], sectors: [] })}>Temizle</button>
        </div>
    );
};

export default FirmalarActiveFilterTags;
