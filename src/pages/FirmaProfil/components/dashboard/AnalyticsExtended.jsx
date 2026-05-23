// Enes Doğanay | 23 Mayıs 2026: Gelişmiş analitik paneli — tüm ek seksiyon wrapper'ı
import React from 'react';
import './AnalyticsExtended.css';
import VisitorCompanies from './VisitorCompanies';
import OfferFunnel from './OfferFunnel';
import MonthComparison from './MonthComparison';
import CategoryPerformance from './CategoryPerformance';
import SectorBenchmark from './SectorBenchmark';

// Enes Doğanay | 23 Mayıs 2026: Bölüm başlığı yardımcı bileşeni
const Section = ({ icon, title, badge, children }) => (
    <div className="fdb-section">
        <div className="fdb-section-header">
            <span className="fdb-section-icon material-symbols-outlined">{icon}</span>
            <span className="fdb-section-title">{title}</span>
            {badge && <span className="fdb-section-badge">{badge}</span>}
        </div>
        <div className="fdb-section-body">{children}</div>
    </div>
);

// Enes Doğanay | 23 Mayıs 2026: 5 yeni analitik bölümü tek wrapper içinde gösterir
const AnalyticsExtended = ({ analyticsExt, extLoading, offerStats }) => {
    const ext = analyticsExt || {};

    return (
        <div className="fdb-extended">
            <Section icon="business" title="Ziyaretçi Şirketler" badge="Top 10">
                <VisitorCompanies visitors={ext.visitors} loading={extLoading} />
            </Section>

            <Section icon="filter_alt" title="Teklif Başarı Hunisi">
                <OfferFunnel offerStats={offerStats} />
            </Section>

            <Section icon="calendar_month" title="Bu Ay / Geçen Ay Karşılaştırması">
                <MonthComparison comparison={ext.monthComparison} loading={extLoading} />
            </Section>

            <Section icon="category" title="Kategori Bazlı Performans">
                <CategoryPerformance categories={ext.categories} loading={extLoading} />
            </Section>

            <Section icon="leaderboard" title="Sektör Kıyaslaması">
                <SectorBenchmark benchmark={ext.benchmark} loading={extLoading} />
            </Section>
        </div>
    );
};

export default AnalyticsExtended;
