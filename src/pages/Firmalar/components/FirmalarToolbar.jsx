// Enes Doğanay | 6 Mayıs 2026: Sonuç sayısı + mini pagination + sıralama + görünüm toggle toolbar
import React, { useState, useRef, useEffect } from 'react';
import './FirmalarToolbar.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Akıllı Sıralama', icon: 'auto_awesome' },
  { value: 'a-z', label: "A'dan Z'ye", icon: 'arrow_downward' },
  { value: 'z-a', label: "Z'den A'ya", icon: 'arrow_upward' },
];

const FirmalarToolbar = ({ totalCount, hasSearch, page, totalPages, onPageChange, sortMode, onSortChange, viewMode, onViewToggle }) => {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  const currentSort = SORT_OPTIONS.find(o => o.value === sortMode) || SORT_OPTIONS[0];

  return (
    <div className="firmalar-toolbar-row">
      {hasSearch && (
        <p className="firmalar-result-count">
          <span>{totalCount}</span> firma listeleniyor
        </p>
      )}

      {totalPages > 1 && (
        <div className="mini-pagination">
          <button className="mini-page-btn" disabled={page === 1} onClick={() => onPageChange(1)} data-tooltip="İlk sayfa" data-tooltip-pos="bottom">
            <span className="material-symbols-outlined">first_page</span>
          </button>
          <button className="mini-page-btn" disabled={page === 1} onClick={() => onPageChange(p => p - 1)}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="mini-page-info">
            <span className="mini-page-current">{page}</span> / {totalPages}
          </span>
          <button className="mini-page-btn" disabled={page === totalPages} onClick={() => onPageChange(p => p + 1)}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button className="mini-page-btn" disabled={page === totalPages} onClick={() => onPageChange(totalPages)} data-tooltip="Son sayfa" data-tooltip-pos="bottom">
            <span className="material-symbols-outlined">last_page</span>
          </button>
        </div>
      )}

      <div className="firmalar-toolbar-actions">
        <div className="firmalar-sort-wrap" ref={sortRef}>
          <button type="button" className="firmalar-sort-trigger" onClick={() => setSortOpen(o => !o)}>
            <span className="material-symbols-outlined firmalar-sort-icon">sort</span>
            <span className="firmalar-sort-label">{currentSort.label}</span>
            <span className={`material-symbols-outlined firmalar-sort-chevron${sortOpen ? ' open' : ''}`}>expand_more</span>
          </button>
          {sortOpen && (
            <div className="firmalar-sort-menu">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`firmalar-sort-option${sortMode === opt.value ? ' active' : ''}`}
                  onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                >
                  <span className="material-symbols-outlined">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="firmalar-view-toggle"
          onClick={onViewToggle}
          data-tooltip={viewMode === 'grid' ? 'Liste görünümüne geç' : 'Kart görünümüne geç'}
          data-tooltip-pos="bottom"
        >
          <span className="material-symbols-outlined">{viewMode === 'grid' ? 'view_list' : 'grid_view'}</span>
        </button>
      </div>
    </div>
  );
};

export default FirmalarToolbar;
