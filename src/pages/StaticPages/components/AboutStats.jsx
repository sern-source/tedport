// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — istatistikler section
import React from 'react';

const STATS = [
    { num: '500+', label: 'Kayıtlı Firma' },
    { num: '20+', label: 'Sektör' },
    { num: '81', label: 'İl Kapsamı' },
    { num: '7/24', label: 'Destek Hizmeti' },
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
