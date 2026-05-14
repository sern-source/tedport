// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — platform özellikleri section
import React from 'react';

const FEATURES = [
    { icon: 'search', title: 'Tedarikçi ve Firma Keşfi', desc: "Türkiye'nin 81 ilindeki binlerce firmaya sektör, konum ve ürün bazlı filtrelerle kolayca ulaşın." },
    { icon: 'gavel', title: 'Satınalma Talepleri ve İhaleler', desc: 'Satınalma taleplerinizi yayınlayın, ilgili firmalardan hızlı şekilde teklifler alın.' },
    { icon: 'compare', title: 'Teklif Yönetimi', desc: 'Birden fazla firmadan gelen teklifleri tek ekranda karşılaştırın ve süreçlerinizi daha verimli yönetin.' },
    { icon: 'group_add', title: 'Yeni Müşteri Fırsatları', desc: 'Hedef sektörlerdeki potansiyel müşterilere ulaşarak iş ağınızı genişletin.' },
    { icon: 'trending_up', title: 'Kurumsal Görünürlük', desc: 'Firma profilinizi güçlendirin, markanızın dijital görünürlüğünü artırın.' },
    { icon: 'bookmark', title: 'Favori Firma Yönetimi', desc: 'İlgilendiğiniz firmaları favorilerinize ekleyerek iş bağlantılarınızı düzenli yönetin.' },
    { icon: 'manage_accounts', title: 'Merkezi Profil Yönetimi', desc: 'Firma bilgilerinizi güncel tutun, gelen talepleri ve fırsatları tek noktadan yönetin.' },
];

const AboutFeatures = () => (
    <section className="about-section about-gray-bg">
        <div className="about-container">
            <div className="about-section-header">
                <span className="about-badge">Platform Özellikleri</span>
                <h2>Tedport&apos;ta Neler Yapabilirsiniz?</h2>
                <p>Satınalma, tedarikçi keşfi ve iş geliştirme süreçlerinizi tek platformda yönetin.</p>
            </div>
            <div className="about-feature-grid">
                {FEATURES.map(f => (
                    <div key={f.icon} className="about-feature-item">
                        <div className="about-feature-icon">
                            <span className="material-symbols-outlined">{f.icon}</span>
                        </div>
                        <div className="about-feature-text">
                            <h4>{f.title}</h4>
                            <p>{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default AboutFeatures;
