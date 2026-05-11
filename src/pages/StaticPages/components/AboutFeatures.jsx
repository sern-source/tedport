// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — platform özellikleri section
import React from 'react';

const FEATURES = [
    { icon: 'search', title: 'Tedarikçi Araştırması', desc: "Türkiye'nin 81 ilindeki binlerce firma arasından sektör, konum ve ürün bazlı arama yaparak doğru tedarikçiye hızla ulaşın." },
    { icon: 'gavel', title: 'Satınalma Talepleri ve İhaleler', desc: 'Satınalma taleplerinizi ve ihalelerinizi kolayca yayınlayın, tedarikçilerden teklif toplayın.' },
    { icon: 'compare', title: 'Teklif Karşılaştırma', desc: 'Birden fazla tedarikçiden gelen teklifleri yan yana değerlendirin, en uygun seçeneği hızla belirleyin.' },
    { icon: 'group_add', title: 'Yeni Müşteri Keşfetme', desc: 'Hedef sektör ve bölgelerdeki potansiyel müşterilere ulaşın, satış fırsatlarınızı artırın.' },
    { icon: 'trending_up', title: 'Satış ve Pazarlama', desc: 'Firma profilinizi güçlendirerek görünürlüğünüzü artırın, satış ve pazarlama süreçlerinizi hızlandırın.' },
    { icon: 'bookmark', title: 'Favori Firma Listesi', desc: 'Hedef firmalara favori listenizdeki hızlı erişimle ticari ilişkilerinizi düzenli tutun.' },
    { icon: 'manage_accounts', title: 'Kurumsal Profil Yönetimi', desc: 'Firma profilinizi yöneterek gelen teklif ve ihale taleplerine hızlı dönüş sağlayın.' },
];

const AboutFeatures = () => (
    <section className="about-section about-gray-bg">
        <div className="about-container">
            <div className="about-section-header">
                <h2>Tedport&apos;ta Neler Yapabilirsiniz?</h2>
                <p>Satınalma, tedarik ve satış süreçlerinizi tek platformda yönetin.</p>
            </div>
            <div className="about-why-inner">
                <div className="about-why-content">
                    <div className="about-feature-list">
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
            </div>
        </div>
    </section>
);

export default AboutFeatures;
