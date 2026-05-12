// Enes Doğanay | 12 Mayıs 2026: Hakkımızda — problem → çözüm section
import React from 'react';

const PROBLEMS = [
    { icon: 'search_off',        title: 'Doğru tedarikçi bulunamıyor',     desc: 'Firmalar saatlerce arama yapar, yanlış kişilerle vakit kaybeder, süreci e-postayla yönetir.' },
    { icon: 'mark_email_unread', title: 'Teklif toplamak kaos',            desc: 'Dağınık e-posta zincirleri, kayıp teklifler, takip edilemeyen süreçler.' },
    { icon: 'gpp_maybe',         title: 'Güven problemi çözülmemiş',       desc: 'Karşı firmanın gerçek mi, güvenilir mi olduğu bilinmiyor. Referans doğrulaması yok.' },
    { icon: 'trending_down',     title: 'Satış ekipleri verimsiz',         desc: 'Hedef müşteriye ulaşmak zorlaşıyor; dönüşüm düşük, operasyon maliyeti yüksek.' },
];

const AboutProblem = () => (
    <section className="about-section">
        <div className="about-container">
            <div className="about-section-header">
                <span className="about-badge about-badge--orange">Neden Tedport?</span>
                <h2>B2B Ticarette Gerçek Problemler</h2>
                <p>Türkiye'deki firmalar her gün bu sorunlarla vakit kaybediyor.</p>
            </div>
            <div className="about-problem-grid">
                {PROBLEMS.map(p => (
                    <div key={p.icon} className="about-problem-card">
                        <div className="about-problem-icon">
                            <span className="material-symbols-outlined">{p.icon}</span>
                        </div>
                        <h4>{p.title}</h4>
                        <p>{p.desc}</p>
                    </div>
                ))}
            </div>
            <div className="about-solution-banner">
                <span className="material-symbols-outlined">bolt</span>
                <div>
                    <strong>Tedport bu döngüyü kırıyor.</strong>
                    <p>Firmalar, ihaleler ve teklifler tek platformda — doğrulanmış verilerle, şeffaf ve hızlı.</p>
                </div>
            </div>
        </div>
    </section>
);

export default AboutProblem;
