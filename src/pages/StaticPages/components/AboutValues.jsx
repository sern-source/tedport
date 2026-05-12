// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — misyon & vizyon kartları
// Enes Doğanay | 12 Mayıs 2026: Kısaltıldı — uzun paragraflar okunmuyor
import React from 'react';

const AboutValues = () => (
    <section className="about-section">
        <div className="about-container">
            <div className="about-section-header">
                <h2>Misyon &amp; Vizyon</h2>
                <p>Bizi bu işe iten neden ve hedeflediğimiz yer.</p>
            </div>
            <div className="about-values-grid">
                <div className="about-value-card">
                    <div className="about-value-icon">
                        <span className="material-symbols-outlined">target</span>
                    </div>
                    <h3>Misyonumuz</h3>
                    <p>Türkiye'deki firmaların doğru tedarikçiye, doğru müşteriye ve doğru iş fırsatına daha kısa sürede ulaşmasını sağlamak. Satınalma ve satış süreçlerini merkezi, şeffaf ve ölçülebilir hale getirmek.</p>
                    <div className="about-value-glow glow-blue"></div>
                </div>
                <div className="about-value-card">
                    <div className="about-value-icon">
                        <span className="material-symbols-outlined">visibility</span>
                    </div>
                    <h3>Vizyonumuz</h3>
                    <p>Türkiye'nin en çok tercih edilen B2B dijital ticaret ağı olmak. Satınalma profesyonelleri, satış ekipleri ve tedarikçi firmalar için tek adres — yazılım şirketi değil, ekosistem kurucusu.</p>
                    <div className="about-value-glow glow-purple"></div>
                </div>
            </div>
        </div>
    </section>
);

export default AboutValues;
