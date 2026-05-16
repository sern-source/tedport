// Enes Doğanay | 6 Mayıs 2026: Platform istatistikleri
// Enes Doğanay | 13 Mayıs 2026: Gerçek DB count — firma + aktif ihale sayısı canlı
import React from 'react';
import './StatsSection.css';
import { useHomePlatformStats } from '../hooks/useHomePlatformStats';

// Enes Doğanay | 13 Mayıs 2026: DB'den gelen sayılara göre stat dizisi — Sektör statik, firma tam sayı
const buildStats = ({ firmaCount }) => [
    {
        // Enes Doğanay | 13 Mayıs 2026: Tam sayı formatı — noktalı ayraç olmadan gerçek sayı
        num: `${firmaCount}`,
        label: 'Firma',
        icon: 'domain',
        color: '#2563eb',
    },
    // Enes Doğanay | 13 Mayıs 2026: "İhale" yerine "Sektör" — ihale olmayınca "0+" kötü gösterir
    { num: '20',    label: 'Sektör',           icon: 'category',    color: '#0891b2' },
    { num: '81 İl', label: 'Türkiye Geneli',   icon: 'location_on', color: '#059669' },
    // Enes Doğanay | 16 Mayıs 2026: "Ücretsiz Üyelik" → platform kalite metriğine çevrildi
    { num: '7/24',  label: 'Kesintisiz Erişim',   icon: 'schedule',    color: '#7c3aed' },
];

const StatsSection = () => {
    const { stats, loading } = useHomePlatformStats();
    const items = buildStats(stats);

    return (
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
                    {items.map(({ num, label, icon, color }) => (
                        <div className={`sc-stat-item${loading ? ' sc-stat-item--loading' : ''}`} key={label}>
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
};

export default StatsSection;
