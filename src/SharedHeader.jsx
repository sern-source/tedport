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
 */
const SharedHeader = ({
    search,
    setSearch,
    showSearchBar = false,
    navItems = null
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const dropdownRef = useRef(null);

    // Handle dropdown close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
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
                <div
                    className="shared-logo-area"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <img
                        src="/tedport-logo.jpg"
                        alt="Tedport Logo"
                        style={{ height: '60px', objectFit: 'contain' }}
                    />
                </div>

                {/* Search Bar (optional) */}
                {showSearchBar && search !== undefined && setSearch && (
                    <div className="shared-search-bar">
                        <div className="shared-search-icon">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Firma, ürün ya da kategori ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                            <a key={idx} href={item.href}>
                                {item.label}
                            </a>
                        ))}
                        {!userProfile && <a href="/login">Giriş Yap</a>}
                    </div>

                    {/* User Actions */}
                    <div className="shared-user-actions">
                        {userProfile ? (
                            <div
                                className="shared-user-dropdown"
                                ref={dropdownRef}
                                style={{ position: 'relative' }}
                            >
                                <button
                                    className="shared-user-btn"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {`${userProfile.first_name} ${userProfile.last_name}`.trim()}
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: '0',
                                            marginTop: '8px',
                                            width: '200px',
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                            zIndex: 100,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/profile');
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                color: '#334155',
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
                                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', pointerEvents: 'none' }}>
                                                person
                                            </span>
                                            <span style={{ pointerEvents: 'none', fontSize: '14px', fontWeight: '500' }}>
                                                Profil
                                            </span>
                                        </div>

                                        <div
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/profile?tab=favorites');
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                color: '#334155',
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
                                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', pointerEvents: 'none' }}>
                                                favorite
                                            </span>
                                            <span style={{ pointerEvents: 'none', fontSize: '14px', fontWeight: '500' }}>
                                                Favoriler
                                            </span>
                                        </div>

                                        <div
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#fef2f2')}
                                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', pointerEvents: 'none' }}>
                                                logout
                                            </span>
                                            <span style={{ pointerEvents: 'none', fontSize: '14px', fontWeight: '500' }}>
                                                Çıkış Yap
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/register')}
                                style={{
                                    background: 'white',
                                    color: '#1d4ed8',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #bfdbfe',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease'
                                }}
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
                        <a key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            {item.label}
                        </a>
                    ))}
                    {!userProfile && <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</a>}
                    {!userProfile && <a href="/register" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#137fec', fontWeight: '700' }}>Kayıt Ol</a>}
                    {userProfile && (
                        <>
                            {!(location.pathname === '/profile' && !location.search) && (
                                <a href="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profil</a>
                            )}
                            {!(location.pathname === '/profile' && location.search === '?tab=favorites') && (
                                <a href="/profile?tab=favorites" onClick={() => setIsMobileMenuOpen(false)}>Favoriler</a>
                            )}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                style={{
                                    padding: '12px 0',
                                    color: '#ef4444',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%'
                                }}
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
