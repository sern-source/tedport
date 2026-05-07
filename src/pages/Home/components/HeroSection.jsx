// Enes Doğanay | 6 Mayıs 2026: Hero arama bölümü — koordinatör
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSearchDropdown from './HeroSearchDropdown';
import './HeroSection.css';

// Enes Doğanay | 6 Mayıs 2026: Tüm search state ve handler'lar hook'tan gelir
const HeroSection = ({
    searchTerm,
    setSearchTerm,
    heroSuggestions,
    heroNoResults,
    heroDidYouMean,
    setHeroDidYouMean,
    heroHistoryVisible,
    setHeroHistoryVisible,
    heroSearchRef,
    searchHistory,
    removeFromHistory,
    clearHistory,
    handleSearch,
    handleClearSearch,
    handleCloseSuggestions,
}) => {
    const navigate = useNavigate();

    return (
        <section className="sc-hero-section">
            <div className="container">
                <div className="sc-hero-box">
                    <div style={{ zIndex: 10 }}>
                        <h1 className="sc-hero-title">Doğru Tedarikçiyi Hemen Bulun</h1>
                        <p className="sc-hero-subtitle">Türkiye genelindeki doğrulanmış üreticiler, toptancılar ve distribütörlerle bağlantı kurun.</p>
                    </div>

                    <div className="sc-search-container" ref={heroSearchRef}>
                        <div className="sc-search-box">
                            <div className="sc-search-input-group">
                                <span className="material-symbols-outlined" style={{ color: '#94a3b8', marginRight: '12px' }}>search</span>
                                <input
                                    type="text"
                                    placeholder="Ürün veya firma ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setHeroHistoryVisible(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { handleCloseSuggestions(); handleSearch(); }
                                        if (e.key === 'Escape') { handleCloseSuggestions(); }
                                    }}
                                />
                                {searchTerm.length > 0 && (
                                    <span
                                        className="material-symbols-outlined sc-search-clear"
                                        onClick={handleClearSearch}
                                        style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '20px', marginLeft: '4px' }}
                                    >close</span>
                                )}
                            </div>
                            <button
                                className="sc-search-btn"
                                onClick={() => { handleCloseSuggestions(); handleSearch(); }}
                            >Ara</button>
                        </div>

                        <HeroSearchDropdown heroSuggestions={heroSuggestions} heroNoResults={heroNoResults} heroDidYouMean={heroDidYouMean} setSearchTerm={setSearchTerm} setHeroDidYouMean={setHeroDidYouMean} heroHistoryVisible={heroHistoryVisible} searchHistory={searchHistory} searchTerm={searchTerm} removeFromHistory={removeFromHistory} clearHistory={clearHistory} handleCloseSuggestions={handleCloseSuggestions} handleSearch={handleSearch} />

                        <div className="sc-popular-tags">
                            <span>Popüler:</span>
                            <span className="sc-popular-tag" onClick={() => navigate('/firmalar?search=çelik')}>Çelik Borular</span>
                            <span className="sc-popular-tag" onClick={() => navigate('/firmalar?search=pamuk')}>Pamuklu Kumaş</span>
                            <span className="sc-popular-tag" onClick={() => navigate('/firmalar?search=ambalaj')}>Ambalaj</span>
                            <span className="sc-popular-tag" onClick={() => navigate('/firmalar?search=elektronik')}>Elektronik</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
