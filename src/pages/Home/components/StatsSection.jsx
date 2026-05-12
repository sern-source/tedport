// Enes Doğanay | 6 Mayıs 2026: Platform istatistikleri — statik veri
// Enes Doğanay | 12 Mayıs 2026: İkon + renk eklendi, güven sinyali güçlendirildi
import React from 'react';
import './StatsSection.css';

// Enes Doğanay | 12 Mayıs 2026: Gerçek veriye dayalı stat'lar — yanıltıcı rakam yok
const STATS = [
    { num: '5.000+', label: 'Firma',            icon: 'domain',      color: '#2563eb' },
    { num: '20',     label: 'Sektör',            icon: 'category',    color: '#0891b2' },
    { num: '81 İl',  label: 'Türkiye Geneli',    icon: 'location_on', color: '#059669' },
    { num: '100%',   label: 'Ücretsiz Üyelik',   icon: 'verified',    color: '#7c3aed' },
];

const StatsSection = () => (
    <section className="sc-stats">
        <div className="container">
            {/* Enes Doğanay | 12 Mayıs 2026: Başlık satırı */}
            <div className="sc-stats-header">
                <span className="sc-stats-badge">
                    <span className="material-symbols-outlined">bar_chart</span>
                    Platform Metrikleri
                </span>
            </div>
            <div className="sc-stats-grid">
                {STATS.map(({ num, label, icon, color }) => (
                    <div className="sc-stat-item" key={label}>
                        <div className="sc-stat-icon" style={{ '--stat-color': color }}>
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                        <span className="sc-stat-num" style={{ color }}>{num}</span>
                        <span className="sc-stat-label">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default StatsSection;
