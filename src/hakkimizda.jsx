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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './hakkimizda.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';

const About = () => {
    const navigate = useNavigate();

    return (
        <>
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
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
                                    Tedport olarak, işletmeleri en güvenilir ve kaliteli tedarikçilerle buluşturuyoruz. B2B dünyasında şeffaflık, hız ve güven inşa ederek ticaretin geleceğini şekillendiriyoruz. Modern çözümlerimizle iş süreçlerinizi optimize etmenize yardımcı oluyoruz.
                                </p>
                                <div className="about-hero-buttons">
                                    <button className="about-btn-primary">İletişime Geçin</button>
                                    <button className="about-btn-outline">Ekibimizle Tanışın</button>
                                </div>
                            </div>
                            <div className="about-hero-image">
                                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Ofis ortamı" />
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="about-stats-section">
                        <div className="about-container">
                            <div className="about-stats-grid">
                                <div className="about-stat-item">
                                    <span className="about-stat-num">5K+</span>
                                    <span className="about-stat-label">Onaylı Tedarikçi</span>
                                </div>
                                <div className="about-stat-item">
                                    <span className="about-stat-num">120+</span>
                                    <span className="about-stat-label">Hizmet Verilen Ülke</span>
                                </div>
                                <div className="about-stat-item">
                                    <span className="about-stat-num">500M₺</span>
                                    <span className="about-stat-label">Yıllık İşlem Hacmi</span>
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
                            <div className="about-values-grid">
                                {/* Mission */}
                                <div className="about-value-card">
                                    <div className="about-value-icon">
                                        <span className="material-symbols-outlined">target</span>
                                    </div>
                                    <h3>Misyonumuz</h3>
                                    <p>İşletmelerin tedarik süreçlerini hızlandırmak, maliyetlerini düşürmek ve en güvenilir iş ortaklıklarını kurmalarını sağlamak. Teknolojinin gücünü kullanarak karmaşık B2B süreçlerini basitleştirmek ve herkes için erişilebilir kılmak.</p>
                                    <div className="about-value-glow glow-blue"></div>
                                </div>
                                {/* Vision */}
                                <div className="about-value-card">
                                    <div className="about-value-icon">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </div>
                                    <h3>Vizyonumuz</h3>
                                    <p>Dünyanın en kapsamlı, güvenilir ve tercih edilen B2B tedarikçi ağı olmak. Küresel ticarette sınırları kaldırarak, sürdürülebilir ve etik ticaretin öncüsü haline gelmek ve sektör standartlarını belirlemek.</p>
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
                                                <h4>Geniş Tedarikçi Ağı</h4>
                                                <p>Yerel üreticilerden global distribütörlere kadar uzanan geniş ağımızla, her sektörden ve her ölçekten ihtiyaca cevap veriyoruz.</p>
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
                            <h2 className="about-timeline-title">Tarihçemiz</h2>
                            <div className="about-timeline">
                                <div className="about-timeline-line"></div>

                                <div className="about-timeline-item left">
                                    <div className="about-timeline-content text-right">
                                        <h3>2018</h3>
                                        <h4>Kuruluş</h4>
                                        <p>İstanbul'da küçük bir ofiste, 3 kişilik kurucu ekiple yolculuğumuza başladık.</p>
                                    </div>
                                    <div className="about-timeline-dot"><div></div></div>
                                    <div className="about-timeline-empty"></div>
                                </div>

                                <div className="about-timeline-item right">
                                    <div className="about-timeline-empty"></div>
                                    <div className="about-timeline-dot outline"><div></div></div>
                                    <div className="about-timeline-content text-left">
                                        <h3>2020</h3>
                                        <h4>İlk 1000 Tedarikçi</h4>
                                        <p>Platformumuz hızla büyüdü ve onaylı tedarikçi sayımız 1000'i aştı.</p>
                                    </div>
                                </div>

                                <div className="about-timeline-item left">
                                    <div className="about-timeline-content text-right">
                                        <h3>2022</h3>
                                        <h4>Global Açılım</h4>
                                        <p>Avrupa ve Orta Doğu pazarlarına açılarak ilk uluslararası ofisimizi kurduk.</p>
                                    </div>
                                    <div className="about-timeline-dot outline"><div></div></div>
                                    <div className="about-timeline-empty"></div>
                                </div>

                                <div className="about-timeline-item right">
                                    <div className="about-timeline-empty"></div>
                                    <div className="about-timeline-dot outline"><div></div></div>
                                    <div className="about-timeline-content text-left">
                                        <h3>2024</h3>
                                        <h4>Sektör Liderliği</h4>
                                        <p>B2B pazar yerleri arasında Türkiye'nin en çok tercih edilen platformu olduk.</p>
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

                {/* Footer */}
                <footer className="about-footer">
                    <div className="about-container">
                        <div className="about-footer-grid">
                            <div className="about-footer-brand">
                                {/* FOOTER LOGO BURAYA EKLENDİ */}
                                <div className="about-logo" style={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src="/tedport-logo.jpg"
                                        alt="Tedport Logo"
                                        style={{ height: '50px', objectFit: 'contain' }}
                                    />
                                </div>
                                <p style={{ marginTop: '12px' }}>Türkiye'nin en güvenilir B2B tedarik platformu. İşinizi büyütmek için doğru adres.</p>
                                <div className="about-socials">
                                    <a href="#"></a><a href="#"></a><a href="#"></a>
                                </div>
                            </div>

                            <div className="about-footer-links">
                                <h3>Kurumsal</h3>
                                <ul>
                                    <li><a href="/hakkimizda">Hakkımızda</a></li>
                                    <li><a href="#">Kariyer</a></li>
                                    <li><a href="#">Basın Odası</a></li>
                                    <li><a href="/iletisim">İletişim</a></li>
                                </ul>
                            </div>

                            <div className="about-footer-links">
                                <h3>Platform</h3>
                                <ul>
                                    <li><a href="/register">Tedarikçi Ol</a></li>
                                    <li><a href="/firmalar">Tedarikçi Bul</a></li>
                                    <li><a href="#">Fiyatlandırma</a></li>
                                    <li><a href="#">Yardım Merkezi</a></li>
                                </ul>
                            </div>

                            <div className="about-footer-links">
                                <h3>Yasal</h3>
                                <ul>
                                    <li><a href="#">Kullanım Şartları</a></li>
                                    <li><a href="#">Gizlilik Politikası</a></li>
                                    <li><a href="#">Çerezler</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="about-footer-bottom">
                            <p>© 2026 Tedport Teknoloji A.Ş. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default About;