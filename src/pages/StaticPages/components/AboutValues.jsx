// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — misyon & vizyon kartları
// Enes Doğanay | 12 Mayıs 2026: Kısaltıldı — uzun paragraflar okunmuyor
import React from 'react';

const AboutValues = () => (
    <section className="about-section">
        <div className="about-container">
            <div className="about-section-header">
                <h2>Misyon &amp; Vizyon</h2>
                <p>Tedport&apos;u inşa ederken bize yol gösteren temel amaç ve uzun vadeli hedefimiz.</p>
            </div>
            <div className="about-values-grid">
                <div className="about-value-card">
                    <div className="about-value-icon">
                        <span className="material-symbols-outlined">target</span>
                    </div>
                    <h3>Misyonumuz</h3>
                    <p>Türkiye&apos;deki firmaların doğru çözüm ortaklarına, doğru müşterilere ve yeni iş fırsatlarına daha hızlı ulaşmasını sağlamak. Satınalma, teklif ve iş geliştirme süreçlerini daha verimli, ölçülebilir ve erişilebilir hale getirmek.</p>
                    <div className="about-value-glow glow-blue"></div>
                </div>
                <div className="about-value-card">
                    <div className="about-value-icon">
                        <span className="material-symbols-outlined">visibility</span>
                    </div>
                    <h3>Vizyonumuz</h3>
                    <p>Türkiye&apos;nin en çok tercih edilen B2B çözüm ortaklığı platformu olmak. Firmaların yalnızca bağlantı kurduğu değil; birlikte büyüdüğü, iş geliştirdiği ve uzun vadeli iş birlikleri oluşturduğu güçlü bir ekosistem inşa etmek.</p>
                    <div className="about-value-glow glow-purple"></div>
                </div>
            </div>
        </div>
    </section>
);

export default AboutValues;
