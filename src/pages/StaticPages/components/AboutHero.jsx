// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — hero section
// Enes Doğanay | 12 Mayıs 2026: Sorun odaklı framing — "Neyi değiştiriyoruz?"
import React from 'react';

const AboutHero = ({ onContact }) => (
    <section className="about-section about-hero">
        <div className="about-container about-hero-inner">
            <div className="about-hero-content">
                <span className="about-badge">Hakkımızda</span>
                <h1 className="about-hero-title">Türkiye&apos;nin Dijital Ticaret Altyapısını Kuruyoruz</h1>
                <p className="about-hero-desc">
                    Firmalar birbirini bulamıyor. Satınalma süreçleri yavaş. Güven problemi çözülmemiş.
                    Tedport, bu döngüyü kırmak için kuruldu.
                </p>
                <p className="about-hero-desc">
                    B2B satınalma, tedarikçi keşfi ve ihale süreçlerini tek platformda toplayarak
                    Türkiye&apos;deki firmaların birbirine doğrudan, güvenli ve hızlı bağlandığı
                    bir ticaret ağı inşa ediyoruz.
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
