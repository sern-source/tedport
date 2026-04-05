import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

/**
 * SharedHeader Component - Reusable Header for All Pages
 * 
 * Author: Enes Doğanay
 * Date: April 5, 2026
 * 
 * Purpose: Unified header component eliminating code duplication across all pages
 * Integrates with: Home2, Firmalar, Hakkımızda, İletişim, Profile, Login, Register, FirmaDetay
 * 
 * Features:
 * - Reusable header for all pages (Home2, Firmalar, Hakkımızda, İletişim, etc.)
 * - User session management via Supabase
 * - Mobile hamburger menu with responsive navigation
 * - User dropdown menu (Profil, Favoriler, Çıkış Yap)
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
    noResults = false
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const dropdownRef = useRef(null);
    // Enes Doğanay | 5 Nisan 2026: Search bar dışına tıklayınca öneri dropdown'ını kapatmak için ref
    const searchBarRef = useRef(null);

    // Handle dropdown close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            // Enes Doğanay | 5 Nisan 2026: Search öneri dropdown'ı dış tıklamada kapat
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                if (onSuggestionClick) onSuggestionClick(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check user session and fetch profile
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', session.user.id)
                    .single();

                if (profileData) {
                    setUserProfile(profileData);
                } else {
                    setUserProfile({ first_name: 'Profilime', last_name: 'Git' });
                }
            }
        };
        checkUserSession();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUserProfile(null);
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    // Default navigation items
    const defaultNavItems = [
        { label: 'Firmalar', href: '/firmalar' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim', href: '/iletisim' }
    ];

    const items = navItems || defaultNavItems;

    return (
        <header className="shared-header">
            <div className="shared-header-inner">
                {/* Logo */}
                <Link to="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
                    <img
                        className="shared-logo-image"
                        src="/tedport-logo.jpg"
                        alt="Tedport Logo"
                    />
                </Link>

                {/* Search Bar (optional) */}
                {/* Enes Doğanay | 5 Nisan 2026: Autocomplete öneri dropdown desteği eklendi */}
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && onSearchSubmit) {
                                    onSearchSubmit(search);
                                }
                            }}
                        />

                        {/* Enes Doğanay | 5 Nisan 2026: Arama kutusunu tek tıkla temizleyen X butonu */}
                        {search && search.length > 0 && (
                            <button
                                className="shared-search-clear"
                                onClick={() => setSearch('')}
                                type="button"
                            >
                                <span className="material-symbols-outlined shared-search-clear-icon">close</span>
                            </button>
                        )}

                        {/* Enes Doğanay | 5 Nisan 2026: Autocomplete öneri listesi veya sonuç bulunamadı mesajı */}
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

                        {/* Enes Doğanay | 5 Nisan 2026: Sonuç bulunamadı mesajı */}
                        {noResults && suggestions.length === 0 && (
                            <div className="shared-search-suggestions">
                                <div className="shared-suggestion-no-result">
                                    <span className="material-symbols-outlined shared-suggestion-no-result-icon">search_off</span>
                                    <span>Sonuç bulunamadı</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                        {!userProfile && <Link to="/login">Giriş Yap</Link>}
                    </div>

                    {/* User Actions */}
                    <div className="shared-user-actions">
                        {userProfile ? (
                            <div
                                className="shared-user-dropdown"
                                ref={dropdownRef}
                            >
                                <button
                                    className="shared-user-btn"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    type="button"
                                >
                                    {`${userProfile.first_name} ${userProfile.last_name}`.trim()}
                                    <span className="material-symbols-outlined shared-user-btn-icon">
                                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="shared-user-menu">
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
                                                Profil
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className="shared-user-menu-item"
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/profile?tab=favorites');
                                            }}
                                        >
                                            <span className="material-symbols-outlined shared-user-menu-icon">
                                                favorite
                                            </span>
                                            <span className="shared-user-menu-label">
                                                Favoriler
                                            </span>
                                        </button>

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
                            <button
                                className="shared-register-btn"
                                onClick={() => navigate('/register')}
                                type="button"
                            >
                                Kayıt Ol
                            </button>
                        )}
                    </div>
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
                    {!userProfile && <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</Link>}
                    {!userProfile && <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="shared-mobile-register">Kayıt Ol</Link>}
                    {userProfile && (
                        <>
                            {!(location.pathname === '/profile' && !location.search) && (
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profil</Link>
                            )}
                            {!(location.pathname === '/profile' && location.search === '?tab=favorites') && (
                                <Link to="/profile?tab=favorites" onClick={() => setIsMobileMenuOpen(false)}>Favoriler</Link>
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
