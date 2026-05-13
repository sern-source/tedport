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
    // Enes Doğanay | 13 Mayıs 2026: Canlı firma sayısı — fallback 5000
    firmaCount = 5000,
}) => {
    const navigate = useNavigate();

    return (
        <section className="sc-hero-section">
            <div className="container">
                {/* Enes Doğanay | 12 Mayıs 2026: Depth katmanları — blur blob'lar */}
                <div className="sc-hero-box">
                    <div className="sc-hero-blob sc-hero-blob--1" aria-hidden="true" />
                    <div className="sc-hero-blob sc-hero-blob--2" aria-hidden="true" />
                    <div style={{ zIndex: 10 }}>
                        {/* Enes Doğanay | 12 Mayıs 2026: Güçlü B2B positioning — ekosistem mesajı */}
                        <h1 className="sc-hero-title">Türkiye'nin Dijital Ticaret Ağı</h1>
                        <p className="sc-hero-subtitle">ERP değil. CRM değil. Satınalma + tedarik + bağlantı — hepsi tek platformda. Doğrulanmış firmalarla saniyeler içinde teklif alın.</p>
                    </div>

                    {/* Enes Doğanay | 12 Mayıs 2026: Platform metrik badge'leri — güven sinyali */}
                    <div className="sc-hero-metrics" style={{ zIndex: 10 }}>
                        <span className="sc-hero-metric">
                            <span className="material-symbols-outlined">domain</span>
                            {firmaCount} Firma
                        </span>
                        <span className="sc-hero-metric">
                            <span className="material-symbols-outlined">receipt_long</span>
                            20 Sektör
                        </span>
                        <span className="sc-hero-metric">
                            <span className="material-symbols-outlined">location_on</span>
                            81 İl Kapsama
                        </span>
                    </div>

                    <div className="sc-search-container" ref={heroSearchRef}>
                        <div className="sc-search-box">
                            <div className="sc-search-input-group">
                                <span className="material-symbols-outlined" style={{ color: '#94a3b8', marginRight: '12px' }}>search</span>
                                <input
                                    type="text"
                                    aria-label="Ürün veya firma ara"
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
                                    // Enes Doğanay | 8 Mayıs 2026: role=button + klavye desteği — DatePicker/CitySelect ile aynı pattern
                                    <span
                                        className="material-symbols-outlined sc-search-clear"
                                        onClick={handleClearSearch}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Aramayı temizle"
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClearSearch(); }}
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

                        {/* Enes Doğanay | 12 Mayıs 2026: Popüler etiketler — arama terimi label ile tam eşleşir */}
                        <div className="sc-popular-tags">
                            <span>Popüler:</span>
                            <span className="sc-popular-tag" role="button" tabIndex={0} onClick={() => navigate('/firmalar?search=Çelik%20Boru')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar?search=Çelik%20Boru'); }}>Çelik Boru</span>
                            <span className="sc-popular-tag" role="button" tabIndex={0} onClick={() => navigate('/firmalar?search=Ambalaj')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar?search=Ambalaj'); }}>Ambalaj</span>
                            <span className="sc-popular-tag" role="button" tabIndex={0} onClick={() => navigate('/firmalar?search=Elektronik')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar?search=Elektronik'); }}>Elektronik</span>
                            <span className="sc-popular-tag" role="button" tabIndex={0} onClick={() => navigate('/firmalar?search=Makine')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar?search=Makine'); }}>Makine</span>
                            <span className="sc-popular-tag" role="button" tabIndex={0} onClick={() => navigate('/firmalar?search=Tekstil')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar?search=Tekstil'); }}>Tekstil</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
