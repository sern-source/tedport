import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Home.css';
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

    // Enes Doğanay | 9 Nisan 2026: Hero arama çubuğunda canlı firma önerileri
    const [heroSuggestions, setHeroSuggestions] = useState([]);
    const [heroNoResults, setHeroNoResults] = useState(false);
    const heroSearchRef = useRef(null);

    const sanitizeSearch = (input) => input.replace(/[\\"%#_]/g, '').trim();

    const fetchHeroSuggestions = useCallback(async (term) => {
        const trimmed = term?.trim() || '';
        if (trimmed.length < 2) {
            setHeroSuggestions([]);
            setHeroNoResults(false);
            return;
        }
        const safe = sanitizeSearch(trimmed);
        if (safe.length < 2) { setHeroSuggestions([]); setHeroNoResults(false); return; }

        const { data } = await supabase
            .from('firmalar')
            .select('firmaID, firma_adi, il_ilce, logo_url')
            .or(`firma_adi.ilike."%${safe}%",ana_sektor.ilike."%${safe}%",urun_kategorileri.ilike."%${safe}%"`)
            .order('best', { ascending: false })
            .limit(6);

        if (data && data.length > 0) {
            setHeroSuggestions(data.map(f => ({
                id: f.firmaID,
                name: f.firma_adi,
                location: f.il_ilce || '',
                logo: f.logo_url?.includes('firma-logolari') ? f.logo_url : null
            })));
            setHeroNoResults(false);
        } else {
            setHeroSuggestions([]);
            setHeroNoResults(true);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHeroSuggestions(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchHeroSuggestions]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (heroSearchRef.current && !heroSearchRef.current.contains(e.target)) {
                setHeroSuggestions([]);
                setHeroNoResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/firmalar?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate(`/firmalar`);
        }
    };

    // Enes Doğanay | 8 Nisan 2026: Verified firmalar öncelikli, kalan slotlar best=true (iso1000) ile doldurulur
    useEffect(() => {
        const fetchRandomSuppliers = async () => {
            // Enes Doğanay | 8 Nisan 2026: onayli_hesap=true olan firmaları doğrudan çek
            const { data: verifiedData } = await supabase
                .from('firmalar')
                .select('firmaID, firma_adi, il_ilce, ana_sektor, logo_url, urun_kategorileri')
                .eq('onayli_hesap', true);
            const verifiedFirmalar = (verifiedData || []).map(f => ({ ...f, _isVerified: true }));

            // Enes Doğanay | 8 Nisan 2026: Kalan slotları best=true firmalardan rastgele doldur
            const remainingSlots = 4 - Math.min(verifiedFirmalar.length, 4);
            let bestPool = [];
            if (remainingSlots > 0) {
                const excludeIds = verifiedFirmalar.map(f => f.firmaID);
                let q = supabase
                    .from('firmalar')
                    .select('firmaID, firma_adi, il_ilce, ana_sektor, logo_url, urun_kategorileri')
                    .eq('best', true)
                    .eq('onayli_hesap', false);
                if (excludeIds.length > 0) {
                    q = q.not('firmaID', 'in', `(${excludeIds.join(',')})`);
                }
                const { data } = await q;
                bestPool = (data || []).map(f => ({ ...f, _isVerified: false }));
            }

            // Fisher-Yates shuffle
            for (let i = bestPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bestPool[i], bestPool[j]] = [bestPool[j], bestPool[i]];
            }

            // Verified önce, kalan slotları random best ile doldur
            const result = [...verifiedFirmalar.slice(0, 4), ...bestPool.slice(0, remainingSlots)];
            setTopSuppliers(result.slice(0, 4));
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
                                <h1 className="sc-hero-title">Doğru Tedarikçiyi6 Hemen Bulun</h1>
                                {/* Enes Doğanay | 6 Nisan 2026: Türkiye odaklı alt başlık */}
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
                                            onKeyDown={(e) => { if (e.key === 'Enter') { setHeroSuggestions([]); setHeroNoResults(false); handleSearch(); } }}
                                        />
                                        {/* Enes Doğanay | 9 Nisan 2026: Arama kutusunu tek tıkla temizleyen X butonu */}
                                        {searchTerm && searchTerm.length > 0 && (
                                            <span
                                                className="material-symbols-outlined sc-search-clear"
                                                onClick={() => { setSearchTerm(''); setHeroSuggestions([]); setHeroNoResults(false); }}
                                                style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '20px', marginLeft: '4px' }}
                                            >close</span>
                                        )}
                                    </div>

                                    <button className="sc-search-btn" onClick={() => { setHeroSuggestions([]); setHeroNoResults(false); handleSearch(); }}>Ara</button>
                                </div>

                                {/* Enes Doğanay | 9 Nisan 2026: Canlı firma önerileri dropdown */}
                                {heroSuggestions.length > 0 && (
                                    <div className="sc-hero-suggestions">
                                        {heroSuggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                className="sc-hero-suggestion-item"
                                                onClick={() => { setHeroSuggestions([]); setHeroNoResults(false); navigate(`/firmadetay/${item.id}`); }}
                                            >
                                                <div className="sc-hero-suggestion-avatar">
                                                    {item.logo
                                                        ? <img src={item.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                                        : item.name?.charAt(0)
                                                    }
                                                </div>
                                                <div className="sc-hero-suggestion-info">
                                                    <span className="sc-hero-suggestion-name">{item.name}</span>
                                                    {item.location && <span className="sc-hero-suggestion-location">{item.location}</span>}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Enes Doğanay | 9 Nisan 2026: Tüm sonuçları gör bağlantısı */}
                                        <div className="sc-hero-suggestion-all" onClick={() => { setHeroSuggestions([]); setHeroNoResults(false); handleSearch(); }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                            Tüm sonuçları gör
                                        </div>
                                    </div>
                                )}

                                {heroNoResults && heroSuggestions.length === 0 && searchTerm.trim().length >= 2 && (
                                    <div className="sc-hero-suggestions">
                                        <div className="sc-hero-suggestion-no-result">
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>search_off</span>
                                            <span>Sonuç bulunamadı</span>
                                        </div>
                                    </div>
                                )}

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
                            {/* Enes Doğanay | 11 Nisan 2026: Logo, mavi onaylı badge ve ürün kategorileri eklendi */}
                            {topSuppliers.map((firma, index) => {
                                const validLogo = firma.logo_url?.includes('firma-logolari') ? firma.logo_url : null;
                                const tags = (() => {
                                    let raw = firma.urun_kategorileri;
                                    if (!raw) return [];
                                    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { return []; } }
                                    if (!Array.isArray(raw)) return [];
                                    return raw.map(k => k.ana_kategori).filter(Boolean).slice(0, 3);
                                })();
                                return (
                                <div className="sc-sup-card" key={`supplier-${index}`}>
                                    <div className="sc-sup-header">
                                        {validLogo ? (
                                            <img className="sc-sup-avatar" src={validLogo} alt={firma.firma_adi} style={{ objectFit: 'contain', background: '#fff', border: '1px solid #e0e7ff' }} />
                                        ) : (
                                            <div className="sc-sup-avatar" style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>{firma.firma_adi?.charAt(0)}</div>
                                        )}
                                        {firma._isVerified && (
                                            <div className="sc-sup-verified"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span> Onaylı Firma</div>
                                        )}
                                    </div>
                                    <div>
                                        {/* Enes Doğanay | 11 Nisan 2026: Firma ismine tıklayarak detaya gitme, Görüntüle butonu kaldırıldı */}
                                        <h3 className="sc-sup-name" onClick={() => navigate(`/firmadetay/${firma.firmaID}`)} style={{ cursor: 'pointer' }}>{firma.firma_adi}</h3>
                                        <div className="sc-sup-location"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span> {firma.il_ilce}</div>
                                    </div>
                                    <div className="sc-sup-tags">
                                        {tags.length > 0 ? tags.map((tag, i) => (
                                            <span className="sc-tag" key={i}>{tag}</span>
                                        )) : (
                                            <span className="sc-tag">{firma.ana_sektor}</span>
                                        )}
                                    </div>
                                </div>
                                );
                            })}

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