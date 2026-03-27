import React, { useState, useEffect, useRef } from 'react';
import './Home2.css';
import { supabase } from './supabaseClient';
import { NavLink, useNavigate } from 'react-router-dom';

const SupplierConnect = () => {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [topSuppliers, setTopSuppliers] = useState([]);

    // Kullanıcı bilgisi için state'ler
    const [userProfile, setUserProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown menü durumu

    const navigate = useNavigate();
    const dropdownRef = useRef(null); // Tıklama dışı alanı algılamak için

    const handleSearch = () => {
        if (searchTerm.trim()) {
            // Kelime girildiyse parametre ile yönlendir
            navigate(`/firmalar?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            // Kelime girilmediyse boş yönlendir
            navigate(`/firmalar`);
        }
    };

    // Menü dışında bir yere tıklanınca dropdown'ı kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 👤 Oturum Kontrolü ve Profil Bilgisi Çekme İşlemi
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Giriş yapılmışsa profiles tablosundan ismini çek
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', session.user.id)
                    .single();

                if (profileData) {
                    setUserProfile(profileData);
                } else {
                    // Veritabanında ismi yoksa varsayılan metin göster
                    setUserProfile({ first_name: 'Profilime', last_name: 'Git' });
                }
            }
        };

        checkUserSession();
    }, []);

    // 🏢 Rastgele Firmaları Çekme İşlemi
    useEffect(() => {
        const fetchRandomSuppliers = async () => {
            // 1️⃣ toplam firma sayısı
            const { count, error: countError } = await supabase
                .from('firmalar')
                .select('*', { count: 'exact', head: true });

            if (countError || !count || count < 4) {
                console.error('Firma sayısı alınamadı');
                return;
            }

            // 2️⃣ rastgele offset
            const randomOffset = Math.floor(Math.random() * (count - 4));

            // 3️⃣ rastgele 4 firma çek
            const { data, error } = await supabase
                .from('firmalar')
                .select('*')
                .range(randomOffset, randomOffset + 3);

            if (error) {
                console.error(error);
            } else {
                setTopSuppliers(data);
            }
        };

        fetchRandomSuppliers();
    }, []);

    // Çıkış Yapma İşlemi
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUserProfile(null);
        setIsDropdownOpen(false);
        navigate('/'); // Opsiyonel: Çıkış yaptıktan sonra sayfayı yeniletebilirsiniz window.location.reload();
    };

    return (
        <div className="supplier-connect-wrapper">
            {/* Header */}
            <header className="sc-header">
                <div className="container sc-header-inner">
                    <div className="sc-logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {/* LOGO BURAYA EKLENDİ */}
                        <img
                            src="/tedport-logo.jpg"
                            alt="Tedport Logo"
                            style={{ height: '60px', objectFit: 'contain' }}
                        />
                    </div>

                    <div className="sc-nav">
                        <div className="sc-nav-links">
                            <a href="/firmalar">Firmalar</a>
                            <a href="/hakkimizda">Hakkımızda</a>
                            <a href="/iletisim">İletişim</a>
                            {/* Sadece giriş YAPILMAMIŞSA Giriş Yap linkini göster */}
                            {!userProfile && <a href="/login">Giriş Yap</a>}
                        </div>

                        {/* Koşullu Buton ve Dropdown Gösterimi */}
                        {userProfile ? (
                            <div
                                className="user-dropdown-container"
                                ref={dropdownRef}
                                style={{ position: 'relative' }}

                            >
                                <button
                                    className="sc-btn-primary"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >

                                    {`${userProfile.first_name} ${userProfile.last_name}`.trim()}
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        {isDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {/* Dropdown Menü (Açık ise gösterilir) */}
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
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                            zIndex: 100,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            onClick={() => navigate('/profile')}
                                            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', pointerEvents: 'none' }}>person</span>
                                            <span style={{ pointerEvents: 'none' }}>Profil</span>
                                        </div>

                                        <div
                                            onClick={() => navigate('/profile?tab=favorites')} // Favoriler sekmesini Profile sayfasında yönetebilirsiniz
                                            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', pointerEvents: 'none' }}>favorite</span>
                                            <span style={{ pointerEvents: 'none' }}>Favoriler</span>
                                        </div>

                                        <div
                                            onClick={handleLogout}
                                            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ef4444', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', pointerEvents: 'none' }}>logout</span>
                                            <span style={{ pointerEvents: 'none' }}>Çıkış Yap</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="sc-btn-primary" onClick={() => navigate(`/register`)}>Kayıt Ol</button>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="sc-hero-section">
                    <div className="container">
                        <div className="sc-hero-box">
                            <div style={{ zIndex: 10 }}>
                                <h1 className="sc-hero-title">Doğru Tedarikçiyi Hemen Bulun</h1>
                                <p className="sc-hero-subtitle">Dünya çapındaki doğrulanmış üreticiler, toptancılar ve distribütörlerle bağlantı kurun.</p>
                            </div>

                            <div className="sc-search-container">
                                <div className="sc-search-box">
                                    <div className="sc-search-input-group">
                                        <span className="material-symbols-outlined" style={{ color: '#94a3b8', marginRight: '12px' }}>search</span>
                                        <input
                                            type="text"
                                            placeholder="Ürün veya firma ara..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>

                                    <button className="sc-search-btn" onClick={handleSearch}>Ara</button>
                                </div>

                                <div className="sc-popular-tags">
                                    <span>Popüler:</span>
                                    <a href="/firmalar?search=çelik">Çelik Borular</a>
                                    <a href="/firmalar?search=pamuk">Pamuklu Kumaş</a>
                                    <a href="/firmalar?search=ambalaj">Ambalaj</a>
                                    <a href="/firmalar?search=elektronik">Elektronik</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="sc-stats">
                    <div className="container">
                        <div className="sc-stats-grid">
                            <div className="sc-stat-item">
                                <span className="sc-stat-num">150k+</span>
                                <span className="sc-stat-label">Onaylı Tedarikçi</span>
                            </div>
                            <div className="sc-stat-item">
                                <span className="sc-stat-num">2M+</span>
                                <span className="sc-stat-label">Listelenen Ürün</span>
                            </div>
                            <div className="sc-stat-item">
                                <span className="sc-stat-num">180+</span>
                                <span className="sc-stat-label">Hizmet Verilen Ülke</span>
                            </div>
                            <div className="sc-stat-item">
                                <span className="sc-stat-num">4.8/5</span>
                                <span className="sc-stat-label">Kullanıcı Memnuniyeti</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="sc-categories">
                    <div className="container">
                        <div className="sc-section-header">
                            <div>
                                <h2 className="sc-section-title">Öne Çıkan Kategoriler</h2>
                                <p className="sc-section-desc">Kapsamlı endüstriyel kategorilerimizi keşfedin.</p>
                            </div>
                            <a href="/firmalar" className="sc-view-all">
                                Tüm kategorileri gör <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                            </a>
                        </div>

                        <div className="sc-cat-grid">
                            {/* Kategori 1 */}
                            <a href="/firmalar?search=tekstil" className="sc-cat-card">
                                <div className="sc-cat-icon"><span className="material-symbols-outlined">checkroom</span></div>
                                <div>
                                    <h3 className="sc-cat-name">Tekstil</h3>
                                    <p className="sc-cat-sub">Kumaş & Hazır Giyim</p>
                                </div>
                            </a>
                            {/* Kategori 2 */}
                            <a href="/firmalar?search=gıda" className="sc-cat-card">
                                <div className="sc-cat-icon"><span className="material-symbols-outlined">restaurant</span></div>
                                <div>
                                    <h3 className="sc-cat-name">Gıda</h3>
                                    <p className="sc-cat-sub">İçerik & İşlenmiş</p>
                                </div>
                            </a>
                            {/* Kategori 3 */}
                            <a href="/firmalar?search=makine" className="sc-cat-card">
                                <div className="sc-cat-icon"><span className="material-symbols-outlined">build</span></div>
                                <div>
                                    <h3 className="sc-cat-name">Makine</h3>
                                    <p className="sc-cat-sub">Ekipman & Aletler</p>
                                </div>
                            </a>
                            {/* Kategori 4 */}
                            <a href="/firmalar?search=teknoloji" className="sc-cat-card">
                                <div className="sc-cat-icon"><span className="material-symbols-outlined">devices</span></div>
                                <div>
                                    <h3 className="sc-cat-name">Teknoloji</h3>
                                    <p className="sc-cat-sub">Tüketici & Parçalar</p>
                                </div>
                            </a>
                            {/* Kategori 5 */}
                            <a href="/firmalar?search=lojistik" className="sc-cat-card">
                                <div className="sc-cat-icon"><span className="material-symbols-outlined">local_shipping</span></div>
                                <div>
                                    <h3 className="sc-cat-name">Lojistik</h3>
                                    <p className="sc-cat-sub">Nakliye & Kargo</p>
                                </div>
                            </a>
                            {/* Kategori 6 */}
                            <a href="/firmalar?search=kimya" className="sc-cat-card">
                                <div className="sc-cat-icon"><span className="material-symbols-outlined">science</span></div>
                                <div>
                                    <h3 className="sc-cat-name">Kimya</h3>
                                    <p className="sc-cat-sub">Lab & Endüstriyel</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Top Suppliers Section */}
                <section className="sc-suppliers">
                    <div className="container">
                        <h2 className="sc-section-title" style={{ marginBottom: '32px' }}>En İyi Tedarikçiler</h2>
                        <div className="sc-sup-grid">

                            {/* Tedarikçiler */}
                            {topSuppliers.map((firma) => (
                                <div className="sc-sup-card" key={firma.firmaID || Math.random()}>
                                    <div className="sc-sup-header">
                                        <div className="sc-sup-avatar" style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>{firma.firma_adi?.charAt(0)}</div>
                                        <div className="sc-sup-verified"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span> Onaylı</div>
                                    </div>
                                    <div>
                                        <h3 className="sc-sup-name">{firma.firma_adi}</h3>
                                        <div className="sc-sup-location"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span> {firma.il_ilce}</div>
                                    </div>
                                    <div className="sc-sup-rating">
                                        <div className="sc-stars">
                                            <span className="material-symbols-outlined icon-filled">star</span><span className="material-symbols-outlined icon-filled">star</span><span className="material-symbols-outlined icon-filled">star</span><span className="material-symbols-outlined icon-filled">star</span><span className="material-symbols-outlined icon-filled">star_half</span>
                                        </div>
                                        <span className="sc-rating-num">4.8</span> <span className="sc-rating-count">(210)</span>
                                    </div>
                                    <div className="sc-sup-tags">
                                        <span className="sc-tag">{firma.ana_sektor}</span>
                                    </div>
                                    <button
                                        className="sc-btn-outline"
                                        onClick={() => navigate(`/firmadetay/${firma.firmaID}`)}
                                    >
                                        Görüntüle
                                    </button>
                                </div>
                            ))}

                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="sc-cta">
                    <div className="container">
                        <h2>İşinizi Büyütmeye Hazır mısınız?</h2>
                        <p>Her gün uluslararası alıcılarla bağlantı kuran binlerce tedarikçiye katılın. Ücretsiz profilinizi şimdi oluşturun.</p>
                        <div className="sc-cta-buttons">
                            <button className="sc-btn-white" onClick={() => navigate(userProfile ? '/profile' : '/register')}>
                                {userProfile ? 'Profilime Git' : 'Tedarikçi Olarak Katıl'}
                            </button>
                            <button className="sc-btn-transparent" onClick={() => navigate('/firmalar')}>
                                Ürünleri Keşfet
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="sc-footer">
                <div className="container">
                    <div className="sc-footer-grid">
                        <div className="sc-footer-brand">
                            <div className="sc-logo-area" style={{ display: 'flex', alignItems: 'center' }}>
                                {/* LOGO BURAYA EKLENDİ */}
                                <img
                                    src="/tedport-logo.jpg"
                                    alt="Tedport Logo"
                                    style={{ height: '60px', objectFit: 'contain' }}
                                />
                            </div>
                            <p>Küresel ticaret için lider B2B pazaryeri. Doğrulanmış tedarikçileri dünya genelindeki alıcılarla buluşturuyoruz.</p>
                            <div className="sc-socials">
                                <a href="#web"><span className="material-symbols-outlined">public</span></a>
                                <a href="#mail"><span className="material-symbols-outlined">mail</span></a>
                                <a href="#phone"><span className="material-symbols-outlined">call</span></a>
                            </div>
                        </div>

                        <div>
                            <h4>Alıcılar İçin</h4>
                            <ul>
                                <li><a href="#link">Teklif İste</a></li>
                                <li><a href="#link">Doğrulanmış Tedarikçiler</a></li>
                                <li><a href="#link">Alıcı Başarı Hikayeleri</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4>Tedarikçiler İçin</h4>
                            <ul>
                                <li><a href="#link">Üyelik Planları</a></li>
                                <li><a href="#link">Reklam Çözümleri</a></li>
                                <li><a href="#link">Tedarikçi Eğitim Merkezi</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4>Şirket</h4>
                            <ul>
                                <li><a href="#link">Hakkımızda</a></li>
                                <li><a href="#link">Kariyer</a></li>
                                <li><a href="#link">Destek ile İletişime Geç</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="sc-footer-bottom">
                        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
                        <div className="sc-legal-links">
                            <a href="#privacy">Gizlilik Politikası</a>
                            <a href="#terms">Hizmet Şartları</a>
                            <a href="#cookies">Çerez Ayarları</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SupplierConnect;