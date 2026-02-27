import React from 'react';
import './hakkimizda.css';

const About = () => {
    return (
        <div className="about-page-wrapper">
            {/* Header / Navbar */}
            <header className="about-header">
                <div className="about-container about-header-inner">
                    <div className="about-header-left">
                        {/* Logo */}
                        <a className="about-logo" href="/">
                            <div className="about-logo-icon">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                                    <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2>Tedport</h2>
                        </a>
                        {/* Nav Links */}

                    </div>

                    <div className="about-header-right">
                        <nav className="about-nav-links hidden-mobile">
                            <a href="/">Ana Sayfa</a>
                            <a href="/firmalar">Firmalar</a>
                            <a href="/hakkimizda" >Hakkımızda</a>
                            <a href="/iletisim">İletişim</a>

                        </nav>
                        <div className="about-actions">
                            <button className="about-btn-primary">Giriş Yap</button>
                        </div>
                    </div>
                </div>
            </header>

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
                            <div className="about-why-image">
                                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800" alt="İş toplantısı" />
                                <div className="about-why-overlay"></div>
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
                            <button className="about-btn-white">Hemen Başlayın</button>
                            <button className="about-btn-transparent">Daha Fazla Bilgi</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="about-footer">
                <div className="about-container">
                    <div className="about-footer-grid">
                        <div className="about-footer-brand">
                            <div className="about-logo">
                                <div className="about-logo-icon">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path></svg>
                                </div>
                                <span>Tedport</span>
                            </div>
                            <p>Türkiye'nin en güvenilir B2B tedarik platformu. İşinizi büyütmek için doğru adres.</p>
                            <div className="about-socials">
                                <a href="#"></a><a href="#"></a><a href="#"></a>
                            </div>
                        </div>

                        <div className="about-footer-links">
                            <h3>Kurumsal</h3>
                            <ul>
                                <li><a href="#">Hakkımızda</a></li>
                                <li><a href="#">Kariyer</a></li>
                                <li><a href="#">Basın Odası</a></li>
                                <li><a href="#">İletişim</a></li>
                            </ul>
                        </div>

                        <div className="about-footer-links">
                            <h3>Platform</h3>
                            <ul>
                                <li><a href="#">Tedarikçi Ol</a></li>
                                <li><a href="#">Tedarikçi Bul</a></li>
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
                        <p>© 2024 Tedport Teknoloji A.Ş. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;