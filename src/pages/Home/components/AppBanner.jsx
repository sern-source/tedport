// Enes Doğanay | 6 Mayıs 2026: Mobil uygulama yakında banner — statik
import React from 'react';
import './AppBanner.css';

const AppBanner = () => (
    <section className="sc-app-banner">
        <div className="container">
            <div className="sc-app-banner-inner">
                <div className="sc-app-banner-icon">
                    <span className="material-symbols-outlined">phone_iphone</span>
                </div>
                <div className="sc-app-banner-content">
                    {/* Enes Doğanay | 13 Mayıs 2026: Q3 2026 tahmini lansman tarihi */}
                    <div className="sc-app-banner-badge">2026 Q3</div>
                    <h3>Tedport Her Yerde Yanınızda</h3>
                    <p>Firma bağlantılarınızı, teklif süreçlerinizi ve satınalma operasyonlarınızı mobil cihazlarınızdan yönetin. iOS ve Android için 2026 Q3'te hizmetinizde.</p>
                </div>
                <div className="sc-app-banner-stores">
                    <div className="sc-store-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        <div>
                            <span className="sc-store-label">2026 Q3'te</span>
                            <span className="sc-store-name">App Store</span>
                        </div>
                    </div>
                    <div className="sc-store-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M3.18 23.67c-.38-.21-.68-.62-.68-1.15V1.48C2.5.82 2.93.36 3.46.23l10.08 11.3L3.18 23.67zm1.47-23L16.23 9.4l-2.73 3.07L4.65.66zm13.72 10.42l2.88 1.66c.53.31.53.81 0 1.12l-2.88 1.66-3.1-3.47 3.1-2.97zM4.65 23.34l8.85-8.81 2.73 3.07L4.65 23.34z" />
                        </svg>
                        <div>
                            <span className="sc-store-label">2026 Q3'te</span>
                            <span className="sc-store-name">Google Play</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default AppBanner;
