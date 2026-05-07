// Enes Doğanay | 6 Mayıs 2026: İhale Tekliflerim — arama + filtre toolbar
import React from 'react';

const FILTER_OPTIONS = [
    { value: 'all',        label: 'Tümü' },
    { value: 'gonderildi', label: 'Değerlendiriliyor' },
    { value: 'kabul',      label: 'Kabul Edildi' },
    { value: 'red',        label: 'Reddedildi' },
    { value: 'taslak',     label: 'Taslak' },
];

const MyOffersToolbar = ({ search, setSearch, filter, setFilter, setCurrentPage }) => (
    <div className="mop-toolbar">
        <div className="mop-toolbar__search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="İhale adı veya referans ara…" value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
            {search && (
                <button className="mop-toolbar__clear" onClick={() => { setSearch(''); setCurrentPage(1); }} aria-label="Aramayı temizle">
                    <span className="material-symbols-outlined">close</span>
                </button>
            )}
        </div>
        <div className="mop-toolbar__filters">
            {FILTER_OPTIONS.map(opt => (
                <button key={opt.value} className={`mop-filter-chip${filter === opt.value ? ' mop-filter-chip--active' : ''}`}
                    onClick={() => { setFilter(opt.value); setCurrentPage(1); }}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export default MyOffersToolbar;
