/**
 * hakkimizda.jsx - About Page
 * 
 * Mobile Responsive Design & Hamburger Menu Implementation
 * Date: April 4, 2026
 * Author: Enes Doğanay
 * 
 * Features:
 * - Responsive header with hamburger menu for mobile (< 1024px)
 * - Full navigation bar for desktop (>= 1024px)
 * - Hero section with CTA buttons
 * - Company mission, vision, and values sections
 * - Team/Stats presentation modes
 * - Responsive grid layouts for all content
 * - Mobile-first design approach
 */

// Enes Doğanay | 6 Nisan 2026: useState/useEffect kullanılmıyor, kaldırıldı
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './hakkimizda.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import SharedFooter from './SharedFooter';
import SEO from './SEO'; // Enes Doğanay | 16 Nisan 2026: SEO meta tag desteği

const About = () => {
    const navigate = useNavigate();

    return (
        <>
            <SEO title="Hakkımızda" description="Tedport hakkında bilgi edinin. Türkiye'nin B2B tedarik portalı hikayesi ve misyonu." path="/hakkimizda" />
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <div className="about-page-wrapper">
                <main className="about-main">
                    {/* Hero Section */}
                    <section className="about-section about-hero">
                        <div className="about-container about-hero-inner">
                            <div className="about-hero-content">
                                <span className="about-badge">Hakkımızda</span>
                                <h1 className="about-hero-title">Biz Kimiz?</h1>
                                <p className="about-hero-desc">
                                    Tedport olarak, Türkiye'deki işletmeleri en güvenilir ve kaliteli tedarikçilerle buluşturuyoruz. B2B dünyasında şeffaflık, hız ve güven inşa ederek ticaretin geleceğini şekillendiriyoruz.
                                </p>
                                {/* Enes Doğanay | 14 Nisan 2026: İletişime Geçin → /iletisim, Ekibimizle Tanışın kaldırıldı */}
                                <div className="about-hero-buttons">
                                    <button className="about-btn-primary" onClick={() => navigate('/iletisim')}>İletişime Geçin</button>
                                </div>
                            </div>
                            {/* Enes Doğanay | 14 Nisan 2026: Ofiste çalışan ekip fotoğrafı */}
                            <div className="about-hero-image">
                                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Tedport Ekibi" loading="lazy" />
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    {/* Enes Doğanay | 14 Nisan 2026: Gerçekçi istatistikler — yeni kurulan startup verileri */}
                    <section className="about-stats-section">
                        <div className="about-container">
                            <div className="about-stats-grid">
                                <div className="about-stat-item">
                                    <span className="about-stat-num">500+</span>
                                    <span className="about-stat-label">Kayıtlı Firma</span>
                                </div>
                                <div className="about-stat-item">
                                    <span className="about-stat-num">20+</span>
                                    <span className="about-stat-label">Sektör</span>
                                </div>
                                <div className="about-stat-item">
                                    <span className="about-stat-num">81</span>
                                    <span className="about-stat-label">İl Kapsamı</span>
                                </div>
                                <div className="about-stat-item">
                                    <span className="about-stat-num">7/24</span>
                                    <span className="about-stat-label">Destek Hizmeti</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Values Section */}
                    <section className="about-section">
                        <div className="about-container">
                            <div className="about-section-header">
                                <h2>Değerlerimiz & Hedeflerimiz</h2>
                                <p>Bizi biz yapan temel prensiplerimiz ve geleceğe bakış açımız.</p>
                            </div>
                            {/* Enes Doğanay | 14 Nisan 2026: Misyon/Vizyon gerçekçi hale getirildi */}
                            <div className="about-values-grid">
                                {/* Mission */}
                                <div className="about-value-card">
                                    <div className="about-value-icon">
                                        <span className="material-symbols-outlined">target</span>
                                    </div>
                                    <h3>Misyonumuz</h3>
                                    <p>Türkiye’deki işletmelerin tedarik süreçlerini hızlandırmak, doğru iş ortaklıkları kurmalarını sağlamak ve B2B süreçlerini dijitalleştirerek herkes için erişilebilir kılmak.</p>
                                    <div className="about-value-glow glow-blue"></div>
                                </div>
                                {/* Vision */}
                                <div className="about-value-card">
                                    <div className="about-value-icon">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </div>
                                    <h3>Vizyonumuz</h3>
                                    <p>Türkiye’nin en kapsamlı ve güvenilir B2B tedarikçi platformu olarak sektörün dijital dönüşümüne öncülük etmek ve sürdürülebilir ticaretin standartlarını belirlemek.</p>
                                    <div className="about-value-glow glow-purple"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Why Us Section */}
                    <section className="about-section about-gray-bg">
                        <div className="about-container">
                            <div className="about-why-inner">
                                <div className="about-why-content">
                                    <h2>Neden Biz?</h2>
                                    <div className="about-feature-list">
                                        <div className="about-feature-item">
                                            <div className="about-feature-icon">
                                                <span className="material-symbols-outlined">verified_user</span>
                                            </div>
                                            <div className="about-feature-text">
                                                <h4>Güvenilirlik</h4>
                                                <p>Platformumuzdaki tüm tedarikçiler, sıkı bir denetim sürecinden geçer. Sadece belgeli ve referanslı firmalarla çalışarak riskinizi minimize ederiz.</p>
                                            </div>
                                        </div>
                                        <div className="about-feature-item">
                                            <div className="about-feature-icon">
                                                <span className="material-symbols-outlined">rocket_launch</span>
                                            </div>
                                            <div className="about-feature-text">
                                                <h4>Hız ve Verimlilik</h4>
                                                <p>Akıllı eşleştirme algoritmamız sayesinde aradığınız ürüne veya hizmete saniyeler içinde ulaşın. Teklif toplama sürecini günlerden saatlere indirin.</p>
                                            </div>
                                        </div>
                                        <div className="about-feature-item">
                                            <div className="about-feature-icon">
                                                <span className="material-symbols-outlined">hub</span>
                                            </div>
                                            <div className="about-feature-text">
                                                <h4>Geniş Firma Ağı</h4>
                                                <p>Türkiye’nin 81 ilinde farklı sektörlerden yüzlerce kayıtlı firma ile her ölçekten ihtiyaca cevap veriyoruz.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline Section */}
                    <section className="about-section">
                        <div className="about-container">
                            {/* Enes Doğanay | 14 Nisan 2026: Tarihçe gerçekçi hale getirildi — 2026 başlangıç */}
                            <h2 className="about-timeline-title">Tarihçemiz</h2>
                            <div className="about-timeline">
                                <div className="about-timeline-line"></div>

                                <div className="about-timeline-item left">
                                    <div className="about-timeline-content text-right">
                                        {/* Enes Doğanay | 1 Mayıs 2026: Eylül 2025 ve Ocak 2026 timeline maddeleri eklendi */}
                                        <h3>Eylül 2025</h3>
                                        <h4>Fikrin Doğuşu</h4>
                                        <p>Tedport fikri, Türkiye’deki B2B tedarik süreçlerinin dijitalleştirilmesi ihtiyacından doğdu. 3 kişilik kurucu ekip olarak yolculuğumuza başladık.</p>
                                    </div>
                                    <div className="about-timeline-dot"><div></div></div>
                                    <div className="about-timeline-empty"></div>
                                </div>

                                <div className="about-timeline-item right">
                                    <div className="about-timeline-empty"></div>
                                    <div className="about-timeline-dot outline"><div></div></div>
                                    <div className="about-timeline-content text-left">
                                        <h3>Ocak 2026</h3>
                                        <h4>Platform Geliştirme</h4>
                                        <p>Yoğun geliştirme sürecine girildi. Teknik altyapı kuruldu, tasarım tamamlandı ve beta testleri başlatıldı.</p>
                                    </div>
                                </div>

                                <div className="about-timeline-item left">
                                    <div className="about-timeline-content text-right">
                                        <h3>Mart 2026</h3>
                                        <h4>Platform Lansmanı</h4>
                                        <p>Tedport.com yayına alındı. Firma kayıtları, arama, filtreleme ve teklif sistemi ile hizmete başlandı.</p>
                                    </div>
                                    <div className="about-timeline-dot outline"><div></div></div>
                                    <div className="about-timeline-empty"></div>
                                </div>

                                <div className="about-timeline-item right">
                                    <div className="about-timeline-empty"></div>
                                    <div className="about-timeline-dot outline"><div></div></div>
                                    <div className="about-timeline-content text-left">
                                        <h3>Nisan 2026</h3>
                                        <h4>Büyüme Dönemi</h4>
                                        <p>İhale sistemi, kurumsal hesaplar ve gelişmiş filtreleme özellikleri eklendi. 81 il kapsamında hizmet verilmeye başlandı.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="about-cta-section">
                        <div className="about-container about-cta-inner">
                            <h2>Bizimle Büyümeye Hazır Mısınız?</h2>
                            <p>Tedarik ağınızı güçlendirmek veya ürünlerinizi binlerce alıcıya ulaştırmak için bugün katılın.</p>
                            <div className="about-cta-buttons">
                                <button className="about-btn-white" onClick={() => navigate('/register')}>Hemen Başlayın</button>
                                <button className="about-btn-transparent" onClick={() => navigate('/firmalar')}>Tedarikçileri Keşfet</button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Enes Doğanay | 14 Nisan 2026: Ortak footer bileşeni */}
                <SharedFooter />
            </div>
        </>
    );
};

export default About;