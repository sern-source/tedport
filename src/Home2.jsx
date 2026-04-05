import React, { useState, useEffect } from 'react';
import './Home2.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';
/* Enes Doğanay | 6 Nisan 2026: Kullanılmayan NavLink import kaldırıldı */
import { useNavigate } from 'react-router-dom';

/**
 * SupplierConnect Component - Home Page / Landing Page
 * 
 * Mobile Responsive Design & Hamburger Menu Implementation
 * Date: April 4, 2026
 * Author: Enes Doğanay
 * 
 * This component implements a responsive header with hamburger menu for mobile devices,
 * user authentication dropdown, and search functionality. The layout automatically
 * adapts between mobile (hamburger menu) and desktop (full navigation) views.
 */

const SupplierConnect = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [topSuppliers, setTopSuppliers] = useState([]);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/firmalar?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate(`/firmalar`);
        }
    };

    // 🏢 Rastgele Firmaları Çekme İşlemi
    /* Enes Doğanay | 5 Nisan 2026: best=true olan firmalardan rastgele 4 tanesi çekiliyor */
    useEffect(() => {
        const fetchRandomSuppliers = async () => {
            const { data: bestFirmalar, error } = await supabase
                .from('firmalar')
                .select('firmaID, firma_adi, il_ilce, ana_sektor')
                .eq('best', true);

            if (error || !bestFirmalar || bestFirmalar.length < 4) {
                console.error('Best firmalar alınamadı');
                return;
            }

            // Fisher-Yates shuffle ile rastgele 4 firma seç
            const shuffled = [...bestFirmalar];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setTopSuppliers(shuffled.slice(0, 4));
        };

        fetchRandomSuppliers();
    }, []);

    return (
        <div className="supplier-connect-wrapper">
            <SharedHeader />

            <main>
                {/* Hero Section */}
                <section className="sc-hero-section">
                    <div className="container">
                        <div className="sc-hero-box">
                            <div style={{ zIndex: 10 }}>
                                <h1 className="sc-hero-title">Doğru Tedarikçiyi Hemen Bulun</h1>
                                {/* Enes Doğanay | 6 Nisan 2026: Türkiye odaklı alt başlık */}
                                <p className="sc-hero-subtitle">Türkiye genelindeki doğrulanmış üreticiler, toptancılar ve distribütörlerle bağlantı kurun.</p>
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
                {/* Enes Doğanay | 5 Nisan 2026: "Hizmet Verilen Ülke" ve "Kullanıcı Memnuniyeti" kaldırıldı.
                 * Türkiye odaklı platform olduğu için "81 İl" ve puan sistemi olmadığı için "50+ Sektör Kategorisi" eklendi. */}
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
                                <span className="sc-stat-num">81 İl</span>
                                <span className="sc-stat-label">Türkiye Genelinde Hizmet</span>
                            </div>
                            <div className="sc-stat-item">
                                <span className="sc-stat-num">50+</span>
                                <span className="sc-stat-label">Sektör Kategorisi</span>
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
                        <h2 className="sc-section-title" style={{ marginBottom: '32px' }}>Örnek Tedarikçiler</h2>
                        <div className="sc-sup-grid">

                            {/* Tedarikçiler */}
                            {/* Enes Doğanay | 5 Nisan 2026: key olarak index kullanıldı, rastgele çekimde tekrar eden firmaID çakışmasını önler */}
                            {topSuppliers.map((firma, index) => (
                                <div className="sc-sup-card" key={`supplier-${index}`}>
                                    <div className="sc-sup-header">
                                        <div className="sc-sup-avatar" style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>{firma.firma_adi?.charAt(0)}</div>
                                        <div className="sc-sup-verified"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span> Onaylı</div>
                                    </div>
                                    <div>
                                        <h3 className="sc-sup-name">{firma.firma_adi}</h3>
                                        <div className="sc-sup-location"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span> {firma.il_ilce}</div>
                                    </div>
                                    {/* Enes Doğanay | 5 Nisan 2026: Yıldız/puan derecelendirme sistemi kaldırıldı */}
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
                            <button className="sc-btn-white" onClick={() => navigate('/register')}>
                                Tedarikçi Olarak Katıl
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
                            {/* Enes Doğanay | 6 Nisan 2026: Türkiye odaklı footer açıklaması */}
                            <p>Türkiye'nin lider B2B tedarikçi portalı. Doğrulanmış tedarikçileri Türkiye genelindeki alıcılarla buluşturuyoruz.</p>
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
                                {/* Enes Doğanay | 6 Nisan 2026: Footer linkleri gerçek sayfalara yönlendiriliyor */}
                                <li><a href="/hakkimizda">Hakkımızda</a></li>
                                <li><a href="#link">Kariyer</a></li>
                                <li><a href="/iletisim">Destek ile İletişime Geç</a></li>
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