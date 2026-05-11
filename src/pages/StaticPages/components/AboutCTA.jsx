// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — CTA section (ana sayfa stiliyle eşleştirildi)
import React from 'react';

const AboutCTA = ({ onRegister, onFirmalar }) => (
    <section className="about-cta-section">
        <div className="container">
            <div className="about-cta-inner">
                <h2>Bizimle Büyümeye Hazır Mısınız?</h2>
                <p>Hemen üye olun, firmanızı listeleyin ve yeni iş fırsatlarına kapı aralayın.</p>
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
