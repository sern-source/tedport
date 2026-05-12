// Enes Doğanay | 5 Mayıs 2026: Toolbar — arama, filtre, sıralama, mini sayfalama
import React from 'react';
import './TendersToolbar.css';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — tüm state ve handler'lar props ile gelir
const TendersToolbar = ({
    searchTerm, setSearchTerm,
    viewMode, toggleViewMode,
    statusFilter, setStatusFilter,
    sortBy, setSortBy,
    sortDropdownOpen, setSortDropdownOpen, sortDropdownRef,
    page, setPage, totalPages,
}) => (
    <section className="tenders-toolbar">
        <div className="tenders-search-box">
            <span className="material-symbols-outlined">search</span>
            <input
                type="text"
                placeholder="İhale, firma veya referans ara…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
                <button type="button" className="tenders-search-clear" onClick={() => setSearchTerm('')}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            )}
            <button
                type="button"
                className="tenders-view-toggle"
                onClick={toggleViewMode}
                data-tooltip={viewMode === 'grid' ? 'Liste görünümüne geç' : 'Kart görünümüne geç'}
                data-tooltip-pos="bottom"
            >
                <span className="material-symbols-outlined">{viewMode === 'grid' ? 'view_list' : 'grid_view'}</span>
            </button>
        </div>

        <div className="tenders-filter-pills">
            {[
                { key: 'all',      label: 'Tümü',     icon: 'apps' },
                { key: 'canli',    label: 'Canlı',     icon: 'bolt' },
                { key: 'acil',     label: 'Acil',      icon: 'local_fire_department' },
                { key: 'yaklasan', label: 'Yaklaşan',  icon: 'schedule' },
                { key: 'kapali',   label: 'Kapalı',    icon: 'lock' }
            ].map((filterOption) => (
                <button
                    key={filterOption.key}
                    type="button"
                    className={`tenders-filter-pill${filterOption.key === 'acil' ? ' tenders-filter-pill--acil' : ''} ${statusFilter === filterOption.key ? 'active' : ''}`}
                    onClick={() => setStatusFilter(filterOption.key)}
                >
                    <span className="material-symbols-outlined">{filterOption.icon}</span>
                    {filterOption.label}
                </button>
            ))}
        </div>

        <div className="tenders-sort-box" ref={sortDropdownRef}>
            <button
                type="button"
                className="tenders-sort-trigger"
                onClick={() => setSortDropdownOpen(o => !o)}
            >
                <span className="material-symbols-outlined">swap_vert</span>
                <span className="tenders-sort-label">
                    {sortBy === 'deadline' ? 'Son Başvuru Tarihi' : sortBy === 'newest' ? 'Yeni Yayınlanan' : 'Başlığa Göre'}
                </span>
                <span className={`material-symbols-outlined tenders-sort-chevron${sortDropdownOpen ? ' open' : ''}`}>expand_more</span>
            </button>
            {sortDropdownOpen && (
                <div className="tenders-sort-menu">
                    {[
                        { value: 'deadline', label: 'Son Başvuru Tarihi', icon: 'event' },
                        { value: 'newest',   label: 'Yeni Yayınlanan',   icon: 'fiber_new' },
                        { value: 'title',    label: 'Başlığa Göre',      icon: 'sort_by_alpha' }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`tenders-sort-option${sortBy === opt.value ? ' active' : ''}`}
                            onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                        >
                            <span className="material-symbols-outlined">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {totalPages > 1 && (
            <div className="tenders-mini-pagination">
                <button className="tenders-mini-page-btn" disabled={page === 1} onClick={() => setPage(1)} data-tooltip="İlk sayfa" data-tooltip-pos="bottom">
                    <span className="material-symbols-outlined">first_page</span>
                </button>
                <button className="tenders-mini-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} data-tooltip="Önceki sayfa" data-tooltip-pos="bottom">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="tenders-mini-page-info">
                    <span className="tenders-mini-page-current">{page}</span> / {totalPages}
                </span>
                <button className="tenders-mini-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} data-tooltip="Sonraki sayfa" data-tooltip-pos="bottom">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="tenders-mini-page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)} data-tooltip="Son sayfa" data-tooltip-pos="bottom">
                    <span className="material-symbols-outlined">last_page</span>
                </button>
            </div>
        )}
    </section>
);

export default TendersToolbar;
