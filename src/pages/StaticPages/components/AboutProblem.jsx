// Enes Doğanay | 12 Mayıs 2026: Hakkımızda — problem → çözüm section
import React from 'react';

const BENEFITS = [
    { icon: 'hub',           title: 'Doğru Çözüm Ortaklarına Hızlı Erişim',             desc: 'Sektör, konum ve ürün bazlı gelişmiş filtreleme sayesinde firmalar ihtiyaçlarına uygun çözüm ortaklarını hızlıca keşfedebilir.' },
    { icon: 'request_quote', title: 'Teklif Süreçlerinde Merkezi Yönetim',               desc: 'Teklif toplama, değerlendirme ve iletişim süreçleri tek platform üzerinden daha düzenli ve takip edilebilir hale gelir.' },
    { icon: 'verified',      title: 'Güven Odaklı Firma Ekosistemi',                    desc: 'Kurumsal firma profilleri ve doğrulanabilir bilgiler sayesinde firmalar daha güvenli bağlantılar kurabilir.' },
    { icon: 'speed',         title: 'Satış ve Satınalma Süreçlerinde Verimlilik',       desc: 'Firmalar yeni müşterilere ulaşabilir, satınalma ekipleri ise ihtiyaç duydukları tedarikçilere daha kısa sürede erişebilir.' },
    { icon: 'network_node',  title: 'Tek Platformda Güçlü İş Ağı',                      desc: 'Firmalar, teklifler, satınalma talepleri ve iş fırsatları merkezi bir yapıda bir araya gelir.' },
];

const AboutProblem = () => (
    <section className="about-section">
        <div className="about-container">
            <div className="about-section-header">
                <span className="about-badge about-badge--orange">Neden Tedport?</span>
                <h2>Firmaların Büyümesini Destekleyen Güçlü Altyapı</h2>
                <p>Tedport, firmaların doğru bağlantıları daha kolay kurabilmesi ve süreçlerini daha verimli yönetebilmesi için geliştirildi.</p>
            </div>
            <div className="about-problem-grid">
                {BENEFITS.map(p => (
                    <div key={p.icon} className="about-problem-card">
                        <div className="about-problem-icon">
                            <span className="material-symbols-outlined">{p.icon}</span>
                        </div>
                        <h4>{p.title}</h4>
                        <p>{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default AboutProblem;
