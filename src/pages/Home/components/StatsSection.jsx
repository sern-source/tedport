// Enes Doğanay | 6 Mayıs 2026: Platform istatistikleri — statik veri
import React from 'react';
import './StatsSection.css';

const STATS = [
    { num: '150k+', label: 'Onaylı Tedarikçi' },
    { num: '2M+', label: 'Listelenen Ürün' },
    { num: '81 İl', label: 'Türkiye Genelinde Hizmet' },
    { num: '50+', label: 'Sektör Kategorisi' },
];

const StatsSection = () => (
    <section className="sc-stats">
        <div className="container">
            <div className="sc-stats-grid">
                {STATS.map(({ num, label }) => (
                    <div className="sc-stat-item" key={label}>
                        <span className="sc-stat-num">{num}</span>
                        <span className="sc-stat-label">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default StatsSection;
