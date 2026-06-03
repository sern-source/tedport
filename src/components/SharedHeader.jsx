// Enes Doğanay | 6 Mayıs 2026: SharedHeader — slim wrapper, alt bileşenlere delege eder
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import './SharedHeader.css';
import { useTheme } from '../hooks/useTheme';
import HeaderSearchBar from './HeaderSearchBar';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderMobileMenu from './HeaderMobileMenu';

// Enes Doğanay | 8 Mayıs 2026: Module seviyesine taşındı — her render’da yeni referans oluşturmasını önler
// Enes Doğanay | 3 Haziran 2026: Bilgi Merkezi nav'a eklendi
const DEFAULT_NAV_ITEMS = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Firmalar', href: '/firmalar' },
    { label: 'İhaleler', href: '/ihaleler' },
    { label: 'Bilgi Merkezi', href: '/blog' },
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'İletişim', href: '/iletisim' },
];

const SharedHeader = ({
    search, setSearch, showSearchBar = false, navItems = null,
    suggestions = [], onSuggestionClick = null, onSearchSubmit = null,
    noResults = false, searchHistory = [], onHistorySelect = null,
    onHistoryRemove = null, onHistoryClear = null,
    // Enes Doğanay | 11 Mayıs 2026: Gelişmiş arama modu — sadece FirmalarPage'den gelir
    searchMode = null, onSearchModeChange = null,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { authChecked, userProfile, isCurrentUserAdmin, managedCompanyId, managedCompanyName, unreadNotifCount, pendingQuoteCount, myOffersUnreadCount, ihaleYonetimiUnreadCount, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const dropdownRef = useRef(null);
    const searchBarRef = useRef(null);
    // Enes Doğanay | 14 Mayıs 2026: Mobil menü dışarı tıklayınca kapansın
    const headerRef = useRef(null);
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

    // Enes Doğanay | 14 Mayıs 2026: Mobil menü açıkken header dışına tıklayınca kapat
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const closeMobileMenu = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', closeMobileMenu);
        return () => document.removeEventListener('mousedown', closeMobileMenu);
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    const items = (navItems || DEFAULT_NAV_ITEMS).filter(item => item.href !== pathname);
    const isHomePage = pathname === '/';

    return (
        <header className="shared-header" ref={headerRef}>
            <div className="shared-header-inner">
                {/* Enes Doğanay | 14 Nisan 2026: Sol grup — geri butonu + logo */}
                <div className="shared-header-left">
                    <button type="button" className="shared-back-btn" onClick={() => router.back()}
                        aria-label="Geri dön"
                        style={isHomePage ? { visibility: 'hidden' } : undefined}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <Link href="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
                        {/* Enes Doğanay | 23 Mayıs 2026: CSS ile logo geçişi — data-theme script'e bağlı, React state flash'ını önler */}
                        <img className="shared-logo-image shared-logo-light"
                            src="/tedport-logo_no-background.png"
                            alt="Tedport Logo" />
                        <img className="shared-logo-image shared-logo-dark"
                            src="/tedport-logo_no-background-dark.png"
                            alt="" aria-hidden="true" />
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
                        searchMode={searchMode} onSearchModeChange={onSearchModeChange}
                    />
                )}

                {/* Enes Doğanay | 14 Nisan 2026: Sağ grup — nav + kullanıcı + tema */}
                <div className="shared-header-right">
                    <button className="shared-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menü"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <span></span><span></span><span></span>
                    </button>
                    <div className="shared-nav">
                        <div className="shared-nav-links">
                            {items.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
                            {authChecked && !userProfile && pathname !== '/login' && <Link href="/login">Giriş Yap</Link>}
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
                                pathname !== '/register' && (
                                    <button className="shared-register-btn" onClick={() => router.push('/register')} type="button">
                                        Kayıt Ol
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    {/* Enes Doğanay | 3 Mayıs 2026: Dark mode toggle */}
                    <button type="button" className="shared-theme-toggle" onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Karanlık temaya geç'}
                        suppressHydrationWarning>
                        <span className="material-symbols-outlined" suppressHydrationWarning>{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                </div>
            </div>

            {/* Enes Doğanay | 6 Mayıs 2026: Mobil menü alt bileşeni */}
            {isMobileMenuOpen && (
                <HeaderMobileMenu
                    items={items} authChecked={authChecked} userProfile={userProfile}
                    locationPathname={pathname} managedCompanyId={managedCompanyId}
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
