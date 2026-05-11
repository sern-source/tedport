// Enes Doğanay | 6 Mayıs 2026: Filtre sidebar — şehir, sektör, kategori filtreleri
import React, { useState } from 'react';
import { SEKTORLER } from '../utils/firmaUtils';
import './FirmaFilterSidebar.css';

// Enes Doğanay | 11 Mayıs 2026: Pill chip filtreler — checkbox yerine modern pill toggle
const FilterSection = ({ title, items, selected, search, onSearch, expandedCount, onExpand, onToggle }) => {
  const filtered = items.filter(item =>
    item.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))
  );
  const selectedCount = selected.length;
  return (
    <details>
      <summary>
        <span className="fs-summary-left">
          {title}
          {selectedCount > 0 && <span className="fs-count-badge">{selectedCount}</span>}
        </span>
        <span className="material-symbols-outlined">expand_more</span>
      </summary>
      <div className="filter-content">
        <input
          type="text" placeholder={`${title} ara...`} value={search}
          onChange={e => onSearch(e.target.value)} className="filter-search-input"
        />
        <div className="fs-pills">
          {filtered.slice(0, expandedCount).map(item => (
            <button
              key={item}
              type="button"
              className={`fs-pill${selected.includes(item) ? ' fs-pill--on' : ''}`}
              onClick={() => onToggle(item)}
            >
              {selected.includes(item) && <span className="material-symbols-outlined">check</span>}
              {item}
            </button>
          ))}
        </div>
        {filtered.length > expandedCount && (
          <button onClick={() => onExpand(filtered.length)} className="filter-show-more-btn">
            +{filtered.length - expandedCount} daha göster
          </button>
        )}
      </div>
    </details>
  );
};

const FirmaFilterSidebar = ({
  cities, categories, selectedCities, selectedCategories, selectedSectors,
  loading, isOpen, handleToggle: onToggle, handleClearAll: onClearAll
}) => {
  const [citiesSearch, setCitiesSearch] = useState('');
  const [sectorsSearch, setSectorsSearch] = useState('');
  const [categoriesSearch, setCategoriesSearch] = useState('');
  const [expandedCount, setExpandedCount] = useState({ cities: 5, sectors: 5, categories: 5 });

  const expand = (section, count) => setExpandedCount(prev => ({ ...prev, [section]: count }));

  return (
    <aside id="firma-filter-sidebar" className={`sidebar${isOpen ? ' sidebar-mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h3>Filtreler</h3>
        <button className="clear-btn" onClick={onClearAll}>Tümünü temizle</button>
      </div>
      <div className="filter-group">
        <FilterSection
          title="Konum"
          items={cities.map(c => c.sehir)}
          selected={selectedCities}
          search={citiesSearch}
          onSearch={setCitiesSearch}
          expandedCount={expandedCount.cities}
          onExpand={c => expand('cities', c)}
          onToggle={v => onToggle('cities', v)}
        />
        <FilterSection
          title="Sektör"
          items={SEKTORLER}
          selected={selectedSectors}
          search={sectorsSearch}
          onSearch={setSectorsSearch}
          expandedCount={expandedCount.sectors}
          onExpand={c => expand('sectors', c)}
          onToggle={v => onToggle('sectors', v)}
        />
        {!loading && (
          <FilterSection
            title="Kategori"
            items={categories}
            selected={selectedCategories}
            search={categoriesSearch}
            onSearch={setCategoriesSearch}
            expandedCount={expandedCount.categories}
            onExpand={c => expand('categories', c)}
            onToggle={v => onToggle('categories', v)}
          />
        )}
      </div>
    </aside>
  );
};

export default FirmaFilterSidebar;
