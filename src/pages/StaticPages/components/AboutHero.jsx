// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — hero section
import React from 'react';

const AboutHero = ({ onContact }) => (
    <section className="about-section about-hero">
        <div className="about-container about-hero-inner">
            <div className="about-hero-content">
                <span className="about-badge">Hakkımızda</span>
                <h1 className="about-hero-title">Biz Kimiz?</h1>
                <p className="about-hero-desc">
                    Tedport, firmaların satınalma, tedarikçi bulma, müşteri kazanma ve satış süreçlerini
                    dijital ortamda daha hızlı, verimli ve güvenilir şekilde yönetebilmesi için
                    geliştirilmiş yeni nesil bir B2B iş platformudur.
                </p>
                <p className="about-hero-desc">
                    Günümüzde şirketler için doğru tedarikçiye ulaşmak, güvenilir iş ortakları bulmak
                    ve satınalma operasyonlarını etkin yönetmek ciddi zaman ve maliyet gerektirmektedir.
                    Tedport, bu süreci kolaylaştırmak amacıyla binlerce firmayı tek platform altında
                    buluşturarak şirketlerin ticari bağlantılarını güçlendirmesine ve yeni iş fırsatlarına
                    daha hızlı ulaşmasına yardımcı olur.
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
