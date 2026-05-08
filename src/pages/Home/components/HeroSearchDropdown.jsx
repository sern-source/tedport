// Enes Doğanay | 6 Mayıs 2026: Hero arama dropdown paneli — öneriler, sonuç yok, geçmiş
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSearchDropdown = ({ heroSuggestions, heroNoResults, heroDidYouMean, setSearchTerm, setHeroDidYouMean, heroHistoryVisible, searchHistory, searchTerm, removeFromHistory, clearHistory, handleCloseSuggestions, handleSearch }) => {
    const navigate = useNavigate();

    // Enes Doğanay | 6 Mayıs 2026: Canlı firma önerileri
    if (heroSuggestions.length > 0) return (
        <div className="sc-hero-suggestions">
            {heroSuggestions.map((item) => (
                // Enes Doğanay | 8 Mayıs 2026: role=button + klavye desteği
                <div key={item.id} className="sc-hero-suggestion-item"
                    onClick={() => { handleCloseSuggestions(); navigate(`/firmadetay/${item.id}`); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleCloseSuggestions(); navigate(`/firmadetay/${item.id}`); } }}
                >
                    <div className="sc-hero-suggestion-avatar">
                        {item.logo ? <img src={item.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : item.name?.charAt(0)}
                    </div>
                    <div className="sc-hero-suggestion-info">
                        <span className="sc-hero-suggestion-name">{item.name}</span>
                        {item.location && <span className="sc-hero-suggestion-location">{item.location}</span>}
                    </div>
                </div>
            ))}
            <div className="sc-hero-suggestion-all"
                onClick={() => { handleCloseSuggestions(); handleSearch(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleCloseSuggestions(); handleSearch(); } }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                Tüm sonuçları gör
            </div>
        </div>
    );

    // Enes Doğanay | 6 Mayıs 2026: Sonuç yok + yazım önerisi
    if (heroNoResults && searchTerm.trim().length >= 2) return (
        <div className="sc-hero-suggestions">
            <div className="sc-hero-suggestion-no-result">
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>search_off</span>
                <span>Sonuç bulunamadı</span>
            </div>
            {heroDidYouMean && (
                // Enes Doğanay | 8 Mayıs 2026: role=button + klavye desteği
                <div className="sc-hero-suggestion-did-you-mean"
                    onClick={() => { setSearchTerm(heroDidYouMean); setHeroDidYouMean(null); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSearchTerm(heroDidYouMean); setHeroDidYouMean(null); } }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>spellcheck</span>
                    Bunu mu demek istediniz? <strong>{heroDidYouMean}</strong>
                </div>
            )}
        </div>
    );

    // Enes Doğanay | 6 Mayıs 2026: Arama geçmişi
    if (heroHistoryVisible && !heroNoResults && searchTerm.trim().length < 2 && searchHistory.length > 0) return (
        <div className="sc-hero-suggestions sc-hero-history">
            <div className="sc-history-header">
                <span>Son Aramalar</span>
                <button className="sc-history-clear" onClick={clearHistory} type="button">Temizle</button>
            </div>
            {searchHistory.map((term) => (
                <div key={term} className="sc-history-item">
                    {/* Enes Doğanay | 8 Mayıs 2026: role=button + klavye desteği */}
                    <div className="sc-history-item-main"
                        onClick={() => { handleCloseSuggestions(); navigate(`/firmalar?search=${encodeURIComponent(term)}`); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleCloseSuggestions(); navigate(`/firmalar?search=${encodeURIComponent(term)}`); } }}
                    >
                        <span className="material-symbols-outlined sc-history-icon">history</span>
                        <span>{term}</span>
                    </div>
                    <button className="sc-history-remove" type="button" onClick={(e) => { e.stopPropagation(); removeFromHistory(term); }} aria-label="Geçmişten kaldır">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            ))}
        </div>
    );

    return null;
};

export default HeroSearchDropdown;
