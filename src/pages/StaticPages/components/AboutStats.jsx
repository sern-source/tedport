// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — istatistikler section
// Enes Doğanay | 14 Mayıs 2026: Anasayfa StatsSection ile birebir eşleştirildi — dinamik firma sayısı + ikonlu tasarım
import React from 'react';
import { useHomePlatformStats } from '../../Home/hooks/useHomePlatformStats';

// Enes Doğanay | 14 Mayıs 2026: Anasayfayla aynı buildStats fonksiyonu — dinamik firmaCount
const buildStats = ({ firmaCount }) => [
    { num: `${firmaCount}`, label: 'Firma',          icon: 'domain',      color: '#2563eb' },
    { num: '20',            label: 'Sektör',          icon: 'category',    color: '#0891b2' },
    { num: '81 İl',         label: 'Türkiye Geneli',  icon: 'location_on', color: '#059669' },
    // Enes Doğanay | 16 Mayıs 2026: "Ücretsiz Üyelik" → platform kalite metriğine çevrildi
    { num: '7/24',          label: 'Kesintisiz Erişim', icon: 'schedule',    color: '#7c3aed' },
];

const AboutStats = () => {
    // Enes Doğanay | 14 Mayıs 2026: Canlı platform verileri — anasayfayla aynı hook
    const { stats, loading } = useHomePlatformStats();
    const items = buildStats(stats);

    return (
        <section className="about-stats-section">
            <div className="about-container">
                <div className="about-stats-header">
                    <span className="about-stats-badge">
                        <span className="material-symbols-outlined">bar_chart</span>
                        Platform Metrikleri
                    </span>
                </div>
                <div className="about-stats-grid">
                    {items.map(({ num, label, icon, color }) => (
                        <div className={`about-stat-item${loading ? ' about-stat-item--loading' : ''}`} key={label}>
                            <div className="about-stat-icon" style={{ '--stat-color': color }}>
                                <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <span className="about-stat-num" style={{ color }}>{num}</span>
                            <span className="about-stat-label">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutStats;

