// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — istatistikler section
// Enes Doğanay | 12 Mayıs 2026: Anasayfayla eşleştirildi — tutarlı rakamlar
import React from 'react';

const STATS = [
    { num: '5.000+', label: 'Kayıtlı Firma' },
    { num: '20',     label: 'Sektör' },
    { num: '81 İl',  label: 'Türkiye Geneli' },
    { num: '%100',   label: 'Ücretsiz Üyelik' },
];

const AboutStats = () => (
    <section className="about-stats-section">
        <div className="about-container">
            <div className="about-stats-grid">
                {STATS.map(s => (
                    <div key={s.label} className="about-stat-item">
                        <span className="about-stat-num">{s.num}</span>
                        <span className="about-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default AboutStats;
