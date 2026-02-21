import React, { useState, useEffect } from 'react';
import './Home.css';
import { supabase } from './supabaseClient';
import { NavLink } from 'react-router-dom';

const Home = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [topSuppliers, setTopSuppliers] = useState([]);



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


    return (
        <>
            {/* HEADER */}
            <header className="header">
                <div className="header-container2">
                    <div className="logo-area">
                        <span className="material-symbols-outlined logo-icon icon-filled">inventory_2</span>
                        <h2 className="logo-text">Tedport</h2>
                    </div>

                    <div className={`nav-desktop ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                        <NavLink to="/kategoriler" className="nav-link">Kategorilere Göz At</NavLink>
                        <NavLink to="/firmalar" className="nav-link">Firmalar</NavLink>
                        <NavLink to="/tedarikciler" className="nav-link">Tedarikçiler İçin</NavLink>
                        <NavLink to="/login" className="nav-link">Giriş Yap</NavLink>
                        <button className="btn-primary">Kayıt Ol</button>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="hero-section">
                    <div className="hero-wrapper">
                        <div className="hero-banner">
                            <div className="hero-content">
                                <h1 className="hero-title">Doğru Tedarikçiyi Hemen Bulun</h1>
                                <p className="hero-subtitle">
                                    Dünya çapındaki doğrulanmış üreticiler, toptancılar ve distribütörlerle bağlantı kurun.
                                </p>
                            </div>

                            <div className="search-box">
                                <div className="search-input-group">
                                    <span className="material-symbols-outlined search-icon">search</span>
                                    <input className="search-input" type="text" placeholder="Ürün veya firma ara..." />
                                </div>

                                <button className="search-btn">
                                    Ara
                                </button>
                            </div>

                            <div className="popular-tags">
                                <span>Popüler:</span>
                                <a href="#">Çelik Borular</a>
                                <a href="#">Pamuklu Kumaş</a>
                                <a href="#">Ambalaj</a>
                                <a href="#">Elektronik</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS SECTION */}
                <section className="stats-section">
                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-number">150k+</span>
                            <span className="stat-label">Onaylı Tedarikçi</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">2M+</span>
                            <span className="stat-label">Listelenen Ürün</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">180+</span>
                            <span className="stat-label">Hizmet Verilen Ülke</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">4.8/5</span>
                            <span className="stat-label">Kullanıcı Memnuniyeti</span>
                        </div>
                    </div>
                </section>

                {/* CATEGORIES SECTION */}
                <section className="categories-bg">
                    <div className="section-wrapper">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Öne Çıkan Kategoriler</h2>
                                <p className="section-desc">Kapsamlı endüstriyel kategorilerimizi keşfedin.</p>
                            </div>
                            <a href="#" className="view-all-link">
                                Tüm kategorileri gör <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                            </a>
                        </div>

                        <div className="categories-grid">
                            {/* Category Items */}
                            {[
                                { icon: 'checkroom', title: 'Tekstil', desc: 'Kumaş & Hazır Giyim' },
                                { icon: 'restaurant', title: 'Gıda', desc: 'İçerik & İşlenmiş' },
                                { icon: 'build', title: 'Makine', desc: 'Ekipman & Aletler' },
                                { icon: 'devices', title: 'Teknoloji', desc: 'Tüketici & Parçalar' },
                                { icon: 'local_shipping', title: 'Lojistik', desc: 'Nakliye & Kargo' },
                                { icon: 'science', title: 'Kimya', desc: 'Lab & Endüstriyel' },
                            ].map((cat, index) => (
                                <a key={index} href="#" className="category-card">
                                    <div className="icon-circle">
                                        <span className="material-symbols-outlined">{cat.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="cat-title">{cat.title}</h3>
                                        <p className="cat-desc">{cat.desc}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TOP SUPPLIERS SECTION */}
                <section className="suppliers-section">
                    <div className="section-wrapper">
                        <h2 className="section-title" style={{ marginBottom: '32px' }}>En İyi Tedarikçiler</h2>
                        <div className="suppliers-grid">

                            {topSuppliers.map((firma) => (
                                <div key={firma.firmaID} className="supplier-card">

                                    <div className="card-header">
                                        <div
                                            className="company-logo-box"
                                            style={{
                                                background: '#eef2ff',
                                                color: '#4f46e5',
                                                border: '1px solid #e0e7ff'
                                            }}
                                        >
                                            {firma.firma_adi?.charAt(0)}
                                        </div>

                                        {true && (
                                            <div className="verified-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                                    verified
                                                </span>
                                                Onaylı
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="supplier-name">{firma.firma_adi}</h3>

                                        <div className="supplier-loc">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                location_on
                                            </span>
                                            {firma.il_ilce}
                                        </div>
                                    </div>

                                    <div className="rating-row">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className="material-symbols-outlined icon-filled"
                                                    style={{ color: i < Math.round(firma.puan || 4) ? '#facc15' : '#cbd5e1' }}
                                                >
                                                    star
                                                </span>
                                            ))}
                                        </div>
                                        <span className="rating-number">{firma.puan || '4.5'}</span>
                                        <span className="review-count">({firma.yorum_sayisi || 0})</span>
                                    </div>

                                    <div className="tags-row">

                                        <span className="tag-badge">{firma.ana_sektor}</span>
                                    </div>

                                    <button className="btn-outline">
                                        Tedarikçiyle İletişime Geç
                                    </button>
                                </div>
                            ))}


                        </div>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section className="cta-section">
                    <div className="cta-container">
                        <h2 className="cta-title">İşinizi Büyütmeye Hazır mısınız?</h2>
                        <p className="cta-desc">
                            Her gün uluslararası alıcılarla bağlantı kuran binlerce tedarikçiye katılın. Ücretsiz profilinizi şimdi oluşturun.
                        </p>
                        <div className="cta-buttons">
                            <button className="btn-white">Tedarikçi Olarak Katıl</button>
                            <button className="btn-transparent">Ben Bir Alıcıyım</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        <div className="footer-about">
                            <div className="logo-area" style={{ marginBottom: '16px' }}>
                                <span className="material-symbols-outlined logo-icon icon-filled">inventory_2</span>
                                <span className="logo-text">Tedport</span>
                            </div>
                            <p>Küresel ticaret için lider B2B pazaryeri. Doğrulanmış tedarikçileri dünya genelindeki alıcılarla buluşturuyoruz.</p>
                            <div className="social-links">
                                <a href="#"><span className="material-symbols-outlined">public</span></a>
                                <a href="#"><span className="material-symbols-outlined">mail</span></a>
                                <a href="#"><span className="material-symbols-outlined">call</span></a>
                            </div>



                        </div>

                        <div className="footer-col">
                            <h4>Alıcılar İçin</h4>
                            <ul className="footer-links">
                                <li><a href="#">Kategorilere Göz At</a></li>
                                <li><a href="#">Teklif İste</a></li>
                                <li><a href="#">Doğrulanmış Tedarikçiler</a></li>
                                <li><a href="#">Alıcı Başarı Hikayeleri</a></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Tedarikçiler İçin</h4>
                            <ul className="footer-links">
                                <li><a href="#">Tedport'te Satış Yap</a></li>
                                <li><a href="#">Üyelik Planları</a></li>
                                <li><a href="#">Reklam Çözümleri</a></li>
                                <li><a href="#">Tedarikçi Eğitim Merkezi</a></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Şirket</h4>
                            <ul className="footer-links">
                                <li><a href="#">Hakkımızda</a></li>
                                <li><a href="#">Kariyer</a></li>
                                <li><a href="#">Basın</a></li>
                                <li><a href="#">Destek ile İletişime Geç</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2025 Tedport. Tüm hakları saklıdır.</p>
                        <div className="footer-legal">
                            <a href="#">Gizlilik Politikası</a>
                            <a href="#">Hizmet Şartları</a>
                            <a href="#">Çerez Ayarları</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Home;