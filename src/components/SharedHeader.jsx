// Enes Doğanay | 6 Mayıs 2026: SharedHeader — slim wrapper, alt bileşenlere delege eder
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './SharedHeader.css';
import { useTheme } from '../hooks/useTheme';
import HeaderSearchBar from './HeaderSearchBar';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderMobileMenu from './HeaderMobileMenu';

const SharedHeader = ({
    search, setSearch, showSearchBar = false, navItems = null,
    suggestions = [], onSuggestionClick = null, onSearchSubmit = null,
    noResults = false, searchHistory = [], onHistorySelect = null,
    onHistoryRemove = null, onHistoryClear = null,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { authChecked, userProfile, isCurrentUserAdmin, managedCompanyId, managedCompanyName, unreadNotifCount, pendingQuoteCount, myOffersUnreadCount, ihaleYonetimiUnreadCount, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const dropdownRef = useRef(null);
    const searchBarRef = useRef(null);
    // Enes Doğanay | 13 Nisan 2026: ref ile stabilize — useEffect dependency sorunu önlenir
    const onSuggestionClickRef = useRef(onSuggestionClick);
    onSuggestionClickRef.current = onSuggestionClick;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
            if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
                if (onSuggestionClickRef.current) onSuggestionClickRef.current(null);
                setSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const defaultNavItems = [
        { label: 'Anasayfa', href: '/' },
        { label: 'Firmalar', href: '/firmalar' },
        { label: 'İhaleler', href: '/ihaleler' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim', href: '/iletisim' },
    ];
    const items = (navItems || defaultNavItems).filter(item => item.href !== location.pathname);
    const isHomePage = location.pathname === '/';

    return (
        <header className="shared-header">
            <div className="shared-header-inner">
                {/* Enes Doğanay | 14 Nisan 2026: Sol grup — geri butonu + logo */}
                <div className="shared-header-left">
                    <button type="button" className="shared-back-btn" onClick={() => navigate(-1)}
                        aria-label="Geri dön" data-tooltip="Geri dön" data-tooltip-pos="bottom"
                        style={isHomePage ? { visibility: 'hidden' } : undefined}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <Link to="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
                        <img className="shared-logo-image"
                            src={theme === 'dark' ? '/tedport-logo_no-background-dark.png' : '/tedport-logo_no-background.png'}
                            alt="Tedport Logo" />
                    </Link>
                </div>

                {/* Enes Doğanay | 5 Nisan 2026: Orta alan — arama çubuğu (opsiyonel) */}
                {showSearchBar && search !== undefined && setSearch && (
                    <HeaderSearchBar
                        search={search} setSearch={setSearch} onSearchSubmit={onSearchSubmit}
                        searchFocused={searchFocused} setSearchFocused={setSearchFocused}
                        suggestions={suggestions} onSuggestionClick={onSuggestionClick}
                        noResults={noResults} searchHistory={searchHistory}
                        onHistorySelect={onHistorySelect} onHistoryRemove={onHistoryRemove}
                        onHistoryClear={onHistoryClear} searchBarRef={searchBarRef}
                    />
                )}

                {/* Enes Doğanay | 14 Nisan 2026: Sağ grup — nav + kullanıcı + tema */}
                <div className="shared-header-right">
                    <button className="shared-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
                        <span></span><span></span><span></span>
                    </button>
                    <div className="shared-nav">
                        <div className="shared-nav-links">
                            {items.map((item, idx) => <Link key={idx} to={item.href}>{item.label}</Link>)}
                            {authChecked && !userProfile && location.pathname !== '/login' && <Link to="/login">Giriş Yap</Link>}
                        </div>
                        <div className="shared-user-actions">
                            {!authChecked ? null : userProfile ? (
                                <HeaderUserMenu
                                    isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen}
                                    dropdownRef={dropdownRef} userProfile={userProfile}
                                    managedCompanyId={managedCompanyId} managedCompanyName={managedCompanyName}
                                    isCurrentUserAdmin={isCurrentUserAdmin} pendingQuoteCount={pendingQuoteCount}
                                    ihaleYonetimiUnreadCount={ihaleYonetimiUnreadCount} unreadNotifCount={unreadNotifCount}
                                    myOffersUnreadCount={myOffersUnreadCount} handleLogout={handleLogout}
                                />
                            ) : (
                                location.pathname !== '/register' && (
                                    <button className="shared-register-btn" onClick={() => navigate('/register')} type="button">
                                        Kayıt Ol
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    {/* Enes Doğanay | 3 Mayıs 2026: Dark mode toggle */}
                    <button type="button" className="shared-theme-toggle" onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Karanlık temaya geç'}
                        data-tooltip={theme === 'dark' ? 'Açık tema' : 'Karanlık tema'} data-tooltip-pos="bottom">
                        <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                </div>
            </div>

            {/* Enes Doğanay | 6 Mayıs 2026: Mobil menü alt bileşeni */}
            {isMobileMenuOpen && (
                <HeaderMobileMenu
                    items={items} authChecked={authChecked} userProfile={userProfile}
                    locationPathname={location.pathname} managedCompanyId={managedCompanyId}
                    isCurrentUserAdmin={isCurrentUserAdmin} pendingQuoteCount={pendingQuoteCount}
                    ihaleYonetimiUnreadCount={ihaleYonetimiUnreadCount} unreadNotifCount={unreadNotifCount}
                    myOffersUnreadCount={myOffersUnreadCount} handleLogout={handleLogout}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
            )}
        </header>
    );
};

export default SharedHeader;
