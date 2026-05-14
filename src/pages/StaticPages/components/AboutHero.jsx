// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — hero section
// Enes Doğanay | 12 Mayıs 2026: Sorun odaklı framing — "Neyi değiştiriyoruz?"
import React from 'react';

const AboutHero = ({ onContact }) => (
    <section className="about-section about-hero">
        <div className="about-container about-hero-inner">
            <div className="about-hero-content">
                <span className="about-badge">Hakkımızda</span>
                <h1 className="about-hero-title">Türkiye&apos;nin B2B Çözüm Ortaklığı Platformunu İnşa Ediyoruz</h1>
                <p className="about-hero-desc">
                    Firmaların doğru iş ortaklarına daha hızlı ulaşabildiği, satınalma ve teklif süreçlerini
                    daha verimli yönetebildiği güçlü bir dijital ekosistem oluşturuyoruz.
                </p>
                <p className="about-hero-desc">
                    Tedport; satınalma, tedarikçi keşfi ve ihale süreçlerini tek platformda bir araya getirerek
                    firmaların güvenle bağlantı kurmasını, yeni fırsatlar keşfetmesini ve iş süreçlerini
                    hızlandırmasını sağlayan bir çözüm ortaklığı platformudur.
                </p>
                <p className="about-hero-desc">
                    Türkiye&apos;nin dört bir yanındaki firmaları daha görünür, daha erişilebilir ve daha
                    bağlantılı hale getiren sürdürülebilir bir iş ağı kurmayı hedefliyoruz.
                </p>
                <div className="about-hero-buttons">
                    <button className="about-btn-primary" onClick={onContact}>İletişime Geçin</button>
                </div>
            </div>
            <div className="about-hero-image">
                <img
                    src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Tedport Ekibi"
                    loading="lazy"
                />
            </div>
        </div>
    </section>
);

export default AboutHero;
