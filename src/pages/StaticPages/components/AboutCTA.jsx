// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — CTA section
// Enes Doğanay | 12 Mayıs 2026: Copy güncellendi — platform hissi
import React from 'react';

const AboutCTA = ({ onRegister, onFirmalar }) => (
    <section className="about-cta-section">
        <div className="container">
            <div className="about-cta-inner">
                <h2>Ticaret Ağınıza Katılın</h2>
                <p>Binlerce firma zaten burada. Tedarikçi bulun, ihale açın, yeni müşteriler kazanın — ücretsiz.</p>
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
