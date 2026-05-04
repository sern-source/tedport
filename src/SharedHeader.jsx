import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
// Enes Doğanay | 2 Mayıs 2026: Faz 2 — dark mode tema hook'u
import { useTheme } from './useTheme';

/**
 * SharedHeader Component - Reusable Header for All Pages
 * 
 * Author: Enes Doğanay
 * Date: April 5, 2026
 * 
 * Purpose: Unified header component eliminating code duplication across all pages
 * Integrates with: Home, Firmalar, Hakkımızda, İletişim, Profile, Login, Register, FirmaDetay
 * 
 * Features:
 * - Reusable header for all pages (Home, Firmalar, Hakkımızda, İletişim, etc.)
 * - User session management via Supabase
 * - Mobile hamburger menu with responsive navigation
 * - User dropdown menu (Profil, Favoriler, Bildirimler, Çıkış Yap)
 * - Optional search bar (configurable per page)
 * - Custom navigation items (configurable per page)
 * - Logout redirect to home page (KVKK compliant security)
 * 
 * Props:
 * - search: optional - search input value
 * - setSearch: optional - search input setter (only shown if provided)
 * - showSearchBar: boolean - whether to show search bar (default: false)
 * - navItems: array - custom navigation items (default: standard nav items)
 * - suggestions: array - autocomplete suggestion list [{id, name, location}] (default: [])
 * - onSuggestionClick: function - callback when a suggestion is clicked
 * - onSearchSubmit: function - callback when Enter is pressed in search bar
 * - noResults: boolean - true when search has no results, shows 'Sonuç bulunamadı' message
 */
const SharedHeader = ({
    search,
    setSearch,
    showSearchBar = false,
    navItems = null,
    suggestions = [],
    onSuggestionClick = null,
    onSearchSubmit = null,
    noResults = false,
    searchHistory = [],
    onHistorySelect = null,
    onHistoryRemove = null,
    onHistoryClear = null,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    // Enes Doğanay | 8 Nisan 2026: AuthContext'ten gelen global auth state kullanımı (her sayfada tekrar sorgu atılmaz)
    const { authChecked, userProfile, isCurrentUserAdmin, managedCompanyId, managedCompanyName, unreadNotifCount, pendingQuoteCount, logout } = useAuth();
    // Enes Doğanay | 2 Mayıs 2026: Faz 2 — dark mode toggle
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const dropdownRef = useRef(null);
    // Enes Doğanay | 5 Nisan 2026: Search bar dışına tıklayınca öneri dropdown'ını kapatmak için ref
    const searchBarRef = useRef(null);
    // Enes Doğanay | 13 Nisan 2026: onSuggestionClick ref ile stabilize — useEffect dependency sorunu önlenir
    const onSuggestionClickRef = useRef(onSuggestionClick);
    onSuggestionClickRef.current = onSuggestionClick;

    // Handle dropdown close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            // Enes Doğanay | 5 Nisan 2026: Search öneri dropdown'ı dış tıklamada kapat
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                if (onSuggestionClickRef.current) onSuggestionClickRef.current(null);
                setSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Enes Doğanay | 8 Nisan 2026: Auth artık AuthContext üzerinden yönetiliyor, SharedHeader'da sorgu yok
    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    // Default navigation items
    // Enes Doğanay | 4 Mayıs 2026: Anasayfa eklendi; mevcut sayfa nav'dan gizlenir
    const defaultNavItems = [
        { label: 'Anasayfa', href: '/' },
        { label: 'Firmalar', href: '/firmalar' },
        { label: 'İhaleler', href: '/ihaleler' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim', href: '/iletisim' }
    ];

    const allItems = navItems || defaultNavItems;
    // Enes Doğanay | 4 Mayıs 2026: Bulunduğumuz sayfanın linki nav'da gizlenir
    const items = allItems.filter(item => item.href !== location.pathname);

    {/* Enes Doğanay | 16 Nisan 2026: Ana sayfa dışında tüm sayfalarda geri butonu */}
    const isHomePage = location.pathname === '/';

    return (
        <header className="shared-header">
            <div className="shared-header-inner">
                {/* Enes Doğanay | 14 Nisan 2026: Sol grup — geri butonu + logo sabit konumda */}
                <div className="shared-header-left">
                    <button
                        type="button"
                        className="shared-back-btn"
                        onClick={() => navigate(-1)}
                        aria-label="Geri dön"
                        title="Geri dön"
                        style={isHomePage ? { visibility: 'hidden' } : undefined}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    <Link to="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
                        {/* Enes Doğanay | 3 Mayıs 2026: Dark modda ayrı logo kullan */}
                        <img className="shared-logo-image" src={theme === 'dark' ? '/tedport-logo_no-background-dark.png' : '/tedport-logo_no-background.png'} alt="Tedport Logo" />
                    </Link>
                </div>

                {/* Enes Doğanay | 5 Nisan 2026: Search Bar (optional) — orta alan */}
                {showSearchBar && search !== undefined && setSearch && (
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
                                if (e.key === 'Enter' && onSearchSubmit) {
                                    onSearchSubmit(search);
                                    setSearchFocused(false);
                                }
                                if (e.key === 'Escape') setSearchFocused(false);
                            }}
                        />

                        {search && search.length > 0 && (
                            <button
                                className="shared-search-clear"
                                onClick={() => setSearch('')}
                                type="button"
                            >
                                <span className="material-symbols-outlined shared-search-clear-icon">close</span>
                            </button>
                        )}

                        {suggestions.length > 0 && (
                            <div className="shared-search-suggestions">
                                {suggestions.map((item) => (
                                    <div
                                        key={item.id}
                                        className="shared-suggestion-item"
                                        onClick={() => onSuggestionClick && onSuggestionClick(item)}
                                    >
                                        <div className="shared-suggestion-avatar">
                                            {item.name?.charAt(0)}
                                        </div>
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

                        {/* Arama Geçmişi — suggestions/noResults yokken ve input boşken */}
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
                                        <div
                                            className="shared-history-item-main"
                                            onClick={() => { if (onHistorySelect) { onHistorySelect(term); setSearchFocused(false); } }}
                                        >
                                            <span className="material-symbols-outlined shared-history-icon">history</span>
                                            <span>{term}</span>
                                        </div>
                                        {onHistoryRemove && (
                                            <button
                                                className="shared-history-remove"
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onHistoryRemove(term); }}
                                                aria-label="Geçmişten kaldır"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Enes Doğanay | 14 Nisan 2026: Sağ grup — nav + kullanıcı sabit konumda */}
                <div className="shared-header-right">
                    {/* Mobile Hamburger */}
                    <button
                        className="shared-hamburger"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="shared-nav">
                        <div className="shared-nav-links">
                            {items.map((item, idx) => (
                                <Link key={idx} to={item.href}>
                                    {item.label}
                                </Link>
                            ))}
                            {authChecked && !userProfile && location.pathname !== '/login' && <Link to="/login">Giriş Yap</Link>}
                        </div>

                    {/* User Actions */}
                    <div className="shared-user-actions">
                        {!authChecked ? null : userProfile ? (
                            <div
                                className="shared-user-dropdown"
                                ref={dropdownRef}
                            >
                                <button
                                    className="shared-user-btn"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    type="button"
                                >
                                    {/* Enes Doğanay | 9 Nisan 2026: Uzun isim taşmasını önlemek için span wrapper */}
                                    <span className="shared-user-btn-label">
                                        {managedCompanyName || `${userProfile.first_name} ${userProfile.last_name}`.trim()}
                                    </span>
                                    <span className="material-symbols-outlined shared-user-btn-icon">
                                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="shared-user-menu">
                                        {managedCompanyId ? (
                                            <>
                                            {/* Enes Doğanay | 7 Nisan 2026: Firma profil sayfasına yönlendirme — panel, teklifler, bildirimler */}
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/firma-profil?tab=panel');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    storefront
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Firma Paneli
                                                </span>
                                            </button>
                                            {/* Enes Doğanay | 9 Nisan 2026: Sıralama değiştirildi — Favorilerim öne alındı */}
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/firma-profil?tab=favoriler');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    collections_bookmark
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Favorilerim
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/firma-profil?tab=teklifler');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    request_quote
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Teklif Yönetimi
                                                </span>
                                                {pendingQuoteCount > 0 && <span className="shared-menu-badge">{pendingQuoteCount}</span>}
                                            </button>
                                            {/* Enes Doğanay | 13 Nisan 2026: İhale Yönetimi menü girişi — kurumsal */}
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/firma-profil?tab=ihale-yonetimi');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    gavel
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    İhale Yönetimi
                                                </span>
                                            </button>
                                            {/* Enes Doğanay | 4 Mayıs 2026: Ekip Yönetimi dropdown — sadece owner (managedCompanyId) */}
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/firma-profil?tab=ekip');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    group
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Ekip Yönetimi
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/firma-profil?tab=bildirimler');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    notifications
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Bildirimler
                                                </span>
                                                {unreadNotifCount > 0 && <span className="shared-menu-badge">{unreadNotifCount}</span>}
                                            </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/profile');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    person
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Profil Bilgileri
                                                </span>
                                            </button>
                                        )}

                                        {isCurrentUserAdmin && (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/admin/kurumsal-basvurular');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    admin_panel_settings
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Kurumsal Başvurular
                                                </span>
                                            </button>
                                        )}

                                        {/* Enes Doğanay | 13 Nisan 2026: Admin firma düzenleme menü girişi */}
                                        {isCurrentUserAdmin && (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/admin/firma-duzenle');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    edit_note
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Firma Düzenleme
                                                </span>
                                            </button>
                                        )}

                                        {/* Enes Doğanay | 14 Nisan 2026: Admin iletişim mesajları menü girişi */}
                                        {isCurrentUserAdmin && (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/admin/iletisim-mesajlari');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    contact_mail
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    İletişim Mesajları
                                                </span>
                                            </button>
                                        )}
                                        {isCurrentUserAdmin && (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/admin/chatbot-egitimi');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    smart_toy
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Chatbot Eğitimi
                                                </span>
                                            </button>
                                        )}
                                        {/* Enes Doğanay | 2 Mayıs 2026: Admin dropdown — Onay Merkezi butonu */}
                                        {isCurrentUserAdmin && (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/admin/etiket-onay');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    verified
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Onay Merkezi
                                                </span>
                                            </button>
                                        )}
                                        {/* Enes Doğanay | 2 Mayıs 2026: Admin dropdown — Mesaj Şikayetleri butonu */}
                                        {isCurrentUserAdmin && (
                                            <button
                                                type="button"
                                                className="shared-user-menu-item"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/admin/mesaj-sikayetleri');
                                                }}
                                            >
                                                <span className="material-symbols-outlined shared-user-menu-icon">
                                                    flag
                                                </span>
                                                <span className="shared-user-menu-label">
                                                    Mesaj Şikayetleri
                                                </span>
                                            </button>
                                        )}

                                        {!managedCompanyId && (
                                            <>
                                                {/* Enes Doğanay | 9 Nisan 2026: Sıralama güncellendi — Favorilerim öne, isimler düzeltildi */}
                                                <button
                                                    type="button"
                                                    className="shared-user-menu-item"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/profile?tab=favorites');
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined shared-user-menu-icon">
                                                        collections_bookmark
                                                    </span>
                                                    <span className="shared-user-menu-label">
                                                        Favorilerim
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="shared-user-menu-item"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/profile?tab=quotes');
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined shared-user-menu-icon">
                                                        request_quote
                                                    </span>
                                                    <span className="shared-user-menu-label">
                                                        Teklif Taleplerim
                                                    </span>
                                                    {pendingQuoteCount > 0 && <span className="shared-menu-badge">{pendingQuoteCount}</span>}
                                                </button>

                                                {/* Enes Doğanay | 13 Nisan 2026: İhale Tekliflerim menü girişi — bireysel */}
                                                <button
                                                    type="button"
                                                    className="shared-user-menu-item"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/profile?tab=my-offers');
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined shared-user-menu-icon">
                                                        assignment_turned_in
                                                    </span>
                                                    <span className="shared-user-menu-label">
                                                        İhale Tekliflerim
                                                    </span>
                                                </button>

                                                {/* Enes Doğanay | 4 Mayıs 2026: Şirketim menü girişi — bireysel */}
                                                <button
                                                    type="button"
                                                    className="shared-user-menu-item"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/profile?tab=sirketim');
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined shared-user-menu-icon">
                                                        domain
                                                    </span>
                                                    <span className="shared-user-menu-label">
                                                        Şirketim
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="shared-user-menu-item"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/profile?tab=notifications');
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined shared-user-menu-icon">
                                                        notifications
                                                    </span>
                                                    <span className="shared-user-menu-label">
                                                        Bildirimler
                                                    </span>
                                                    {unreadNotifCount > 0 && <span className="shared-menu-badge">{unreadNotifCount}</span>}
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            className="shared-user-menu-item shared-user-menu-item-danger"
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            <span className="material-symbols-outlined shared-user-menu-icon">
                                                logout
                                            </span>
                                            <span className="shared-user-menu-label">
                                                Çıkış Yap
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            location.pathname !== '/register' && (
                            <button
                                className="shared-register-btn"
                                onClick={() => navigate('/register')}
                                type="button"
                            >
                                Kayıt Ol
                            </button>
                            )
                        )}
                    </div>
                </div>
                    {/* Enes Doğanay | 3 Mayıs 2026: Dark mode toggle en sağa taşındı */}
                    <button
                        type="button"
                        className="shared-theme-toggle"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Karanlık temaya geç'}
                        title={theme === 'dark' ? 'Açık tema' : 'Karanlık tema'}
                    >
                        <span className="material-symbols-outlined">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="shared-mobile-menu">
                    {items.map((item, idx) => (
                        <Link key={idx} to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            {item.label}
                        </Link>
                    ))}
                    {authChecked && !userProfile && location.pathname !== '/login' && <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</Link>}
                    {authChecked && !userProfile && location.pathname !== '/register' && <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="shared-mobile-register">Kayıt Ol</Link>}
                    {userProfile && (
                        <>
                            {managedCompanyId ? (
                                <>
                                    {/* Enes Doğanay | 9 Nisan 2026: Kurumsal mobil menü — sıralama güncellendi */}
                                    <Link to="/firma-profil?tab=panel" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">storefront</span>
                                        Firma Paneli
                                    </Link>
                                    <Link to="/firma-profil?tab=favoriler" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">collections_bookmark</span>
                                        Favorilerim
                                    </Link>
                                    <Link to="/firma-profil?tab=teklifler" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">request_quote</span>
                                        Teklif Yönetimi
                                        {pendingQuoteCount > 0 && <span className="shared-mobile-badge">{pendingQuoteCount}</span>}
                                    </Link>
                                    {/* Enes Doğanay | 13 Nisan 2026: İhale Yönetimi mobil menü — kurumsal */}
                                    <Link to="/firma-profil?tab=ihale-yonetimi" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">gavel</span>
                                        İhale Yönetimi
                                    </Link>
                                    {/* Enes Doğanay | 4 Mayıs 2026: Ekip Yönetimi mobil menü — sadece owner */}
                                    <Link to="/firma-profil?tab=ekip" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">group</span>
                                        Ekip Yönetimi
                                    </Link>
                                    <Link to="/firma-profil?tab=bildirimler" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">notifications</span>
                                        Bildirimler
                                        {unreadNotifCount > 0 && <span className="shared-mobile-badge">{unreadNotifCount}</span>}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {/* Enes Doğanay | 10 Nisan 2026: Bireysel mobil menü — isimlendirme web dropdown ile uyumlu hale getirildi */}
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">person</span>
                                        Profil Bilgileri
                                    </Link>
                                    <Link to="/profile?tab=favorites" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">collections_bookmark</span>
                                        Favorilerim
                                    </Link>
                                    <Link to="/profile?tab=quotes" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">request_quote</span>
                                        Teklif Taleplerim
                                        {pendingQuoteCount > 0 && <span className="shared-mobile-badge">{pendingQuoteCount}</span>}
                                    </Link>
                                    {/* Enes Doğanay | 13 Nisan 2026: İhale Tekliflerim mobil menü — bireysel */}
                                    <Link to="/profile?tab=my-offers" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">assignment_turned_in</span>
                                        İhale Tekliflerim
                                    </Link>
                                    {/* Enes Doğanay | 4 Mayıs 2026: Şirketim mobil menü — bireysel */}
                                    <Link to="/profile?tab=sirketim" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">domain</span>
                                        Şirketim
                                    </Link>
                                    <Link to="/profile?tab=notifications" onClick={() => setIsMobileMenuOpen(false)}>
                                        <span className="material-symbols-outlined shared-mobile-menu-icon">notifications</span>
                                        Bildirimler
                                        {unreadNotifCount > 0 && <span className="shared-mobile-badge">{unreadNotifCount}</span>}
                                    </Link>
                                </>
                            )}
                            {isCurrentUserAdmin && (
                                <Link to="/admin/kurumsal-basvurular" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="material-symbols-outlined shared-mobile-menu-icon">admin_panel_settings</span>
                                    Kurumsal Başvurular
                                </Link>
                            )}
                            {/* Enes Doğanay | 13 Nisan 2026: Admin firma düzenleme — mobil menü */}
                            {isCurrentUserAdmin && (
                                <Link to="/admin/firma-duzenle" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="material-symbols-outlined shared-mobile-menu-icon">edit_note</span>
                                    Firma Düzenleme
                                </Link>
                            )}
                            {/* Enes Doğanay | 14 Nisan 2026: Admin iletişim mesajları — mobil menü */}
                            {isCurrentUserAdmin && (
                                <Link to="/admin/iletisim-mesajlari" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="material-symbols-outlined shared-mobile-menu-icon">contact_mail</span>
                                    İletişim Mesajları
                                </Link>
                            )}
                            {isCurrentUserAdmin && (
                                <Link to="/admin/chatbot-egitimi" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="material-symbols-outlined shared-mobile-menu-icon">smart_toy</span>
                                    Chatbot Eğitimi
                                </Link>
                            )}
                            {/* Enes Doğanay | 2 Mayıs 2026: Mobil menü — Onay Merkezi linki */}
                            {isCurrentUserAdmin && (
                                <Link to="/admin/etiket-onay" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="material-symbols-outlined shared-mobile-menu-icon">verified</span>
                                    Onay Merkezi
                                </Link>
                            )}
                            {/* Enes Doğanay | 2 Mayıs 2026: Mobil menü — Mesaj Şikayetleri linki */}
                            {isCurrentUserAdmin && (
                                <Link to="/admin/mesaj-sikayetleri" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="material-symbols-outlined shared-mobile-menu-icon">flag</span>
                                    Mesaj Şikayetleri
                                </Link>
                            )}
                            <button
                                className="shared-mobile-logout"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                type="button"
                            >
                                Çıkış Yap
                            </button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default SharedHeader;
