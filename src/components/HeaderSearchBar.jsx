// Enes Doğanay | 6 Mayıs 2026: Arama çubuğu alt bileşeni — öneriler + arama geçmişi
import React from 'react';

const HeaderSearchBar = ({
    search, setSearch, onSearchSubmit,
    searchFocused, setSearchFocused,
    suggestions, onSuggestionClick,
    noResults,
    searchHistory, onHistorySelect, onHistoryRemove, onHistoryClear,
    searchBarRef,
}) => (
    <div className="shared-search-bar" ref={searchBarRef}>
        <div className="shared-search-icon">
            <span className="material-symbols-outlined">search</span>
        </div>
        <input
            type="text"
            placeholder="Firma, ürün ya da kategori ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchSubmit) { onSearchSubmit(search); setSearchFocused(false); }
                if (e.key === 'Escape') setSearchFocused(false);
            }}
        />
        {search && search.length > 0 && (
            <button className="shared-search-clear" onClick={() => setSearch('')} type="button">
                <span className="material-symbols-outlined shared-search-clear-icon">close</span>
            </button>
        )}
        {suggestions.length > 0 && (
            <div className="shared-search-suggestions">
                {suggestions.map((item) => (
                    <div key={item.id} className="shared-suggestion-item" onClick={() => onSuggestionClick && onSuggestionClick(item)}>
                        <div className="shared-suggestion-avatar">{item.name?.charAt(0)}</div>
                        <div className="shared-suggestion-info">
                            <span className="shared-suggestion-name">{item.name}</span>
                            <span className="shared-suggestion-location">{item.location}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
        {noResults && suggestions.length === 0 && (
            <div className="shared-search-suggestions">
                <div className="shared-suggestion-no-result">
                    <span className="material-symbols-outlined shared-suggestion-no-result-icon">search_off</span>
                    <span>Sonuç bulunamadı</span>
                </div>
            </div>
        )}
        {searchFocused && suggestions.length === 0 && !noResults && (!search || search.length < 2) && searchHistory.length > 0 && (
            <div className="shared-search-suggestions shared-search-history">
                <div className="shared-history-header">
                    <span>Son Aramalar</span>
                    {onHistoryClear && (
                        <button className="shared-history-clear" onClick={onHistoryClear} type="button">Temizle</button>
                    )}
                </div>
                {searchHistory.map((term) => (
                    <div key={term} className="shared-history-item">
                        <div className="shared-history-item-main" onClick={() => { if (onHistorySelect) { onHistorySelect(term); setSearchFocused(false); } }}>
                            <span className="material-symbols-outlined shared-history-icon">history</span>
                            <span>{term}</span>
                        </div>
                        {onHistoryRemove && (
                            <button className="shared-history-remove" type="button" onClick={(e) => { e.stopPropagation(); onHistoryRemove(term); }} aria-label="Geçmişten kaldır">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default HeaderSearchBar;
