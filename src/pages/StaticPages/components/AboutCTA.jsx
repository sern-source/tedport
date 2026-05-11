// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — CTA section
import React from 'react';

const AboutCTA = ({ onRegister, onFirmalar }) => (
    <section className="about-cta-section">
        <div className="about-container">
            <div className="about-cta-inner">
                <div className="about-cta-content">
                    <h2>Bizimle Büyümeye Hazır Mısınız?</h2>
                    <p>Hemen üye olun, firmanızı listeleyin ve yeni iş fırsatlarına kapı aralayın.</p>
                    <div className="about-cta-buttons">
                        <button className="about-btn-white about-btn-icon" onClick={onRegister}>
                            <span className="material-symbols-outlined">person_add</span>
                            Hemen Üye Ol
                        </button>
                        <button className="about-btn-transparent about-btn-icon" onClick={onFirmalar}>
                            <span className="material-symbols-outlined">business</span>
                            Firmaları Keşfet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default AboutCTA;
