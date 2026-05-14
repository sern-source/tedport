// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — CTA section
// Enes Doğanay | 12 Mayıs 2026: Copy güncellendi — platform hissi
import React from 'react';

const AboutCTA = ({ onRegister, onFirmalar }) => (
    <section className="about-cta-section">
        <div className="container">
            <div className="about-cta-inner">
                <h2>İş Ağınızı Güçlendirin</h2>
                <p>Binlerce firma Tedport ekosisteminde yeni çözüm ortaklarıyla buluşuyor. Doğru firmaları keşfedin, satınalma süreçlerinizi yönetin ve yeni iş fırsatlarına ulaşın — ücretsiz.</p>
                <div className="about-cta-buttons">
                    <button className="about-btn-white" onClick={onRegister}>
                        Hemen Üye Ol
                    </button>
                    <button className="about-btn-transparent" onClick={onFirmalar}>
                        Firmaları Keşfet
                    </button>
                </div>
            </div>
        </div>
    </section>
);

export default AboutCTA;
