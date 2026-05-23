// Enes Doğanay | 23 Mayıs 2026: Firma Analitik Dashboard — ana bileşen (ince sarıcı)
import React, { useState, useCallback, useEffect } from 'react';
import './FirmaDashboardTab.css';
import './DashboardPrint.css';
import MetricCard from './dashboard/MetricCard';
import DateRangeFilter from './dashboard/DateRangeFilter';
import ViewsChart from './dashboard/ViewsChart';
import TenderStatusRow from './dashboard/TenderStatusRow';
import OfferBar from './dashboard/OfferBar';
import TopTenders from './dashboard/TopTenders';
import CompletedTendersReport from './dashboard/CompletedReport';
import AnalyticsExtended from './dashboard/AnalyticsExtended';
import { MONTHS_TR_SHORT } from './dashboard/dashboardConstants';

// Enes Doğanay | 23 Mayıs 2026: Seçili tarih aralığına göre kısa badge metni
const getRangeBadge = (dateRange) => {
    if (dateRange?.type === 'preset') return `Son ${dateRange.days} gün`;
    const fmt = (s) => { const d = new Date(s); return `${d.getDate()} ${MONTHS_TR_SHORT[d.getMonth()]}`; };
    return `${fmt(dateRange?.start)} — ${fmt(dateRange?.end)}`;
};

// Enes Doğanay | 23 Mayıs 2026: Grafik bölümü için dönem etiketi
const getChartLabel = (dateRange, views) => {
    if (!views?.length) return '';
    if (dateRange?.type === 'preset') return dateRange.days <= 30 ? `Son ${Math.min(14, dateRange.days)} Gün` : `Son ${views.length} Hafta`;
    return 'Seçili Dönem';
};

// Enes Doğanay | 23 Mayıs 2026: Dashboard ana bileşeni — yükleme/hata/boş durum + bölümler
const FirmaDashboardTab = ({ stats, loading, error, completedReport, reportLoading, loadCompletedReport, dateRange, setDateRange, analyticsExt, extLoading, loadAnalyticsExt }) => {
    const [showReport, setShowReport] = useState(false);
    // Enes Doğanay | 23 Mayıs 2026: Gelişmiş analitik bölümünü aç/kapat
    const [showExtended, setShowExtended] = useState(false);

    const handleTamamlandiClick = useCallback(() => {
        const next = !showReport;
        if (next) loadCompletedReport?.();
        setShowReport(next);
    }, [showReport, loadCompletedReport]);

    // Enes Doğanay | 23 Mayıs 2026: Gelişmiş analitik açılınca veriyi yükle
    const handleToggleExtended = useCallback(() => {
        const next = !showExtended;
        if (next) loadAnalyticsExt?.();
        setShowExtended(next);
    }, [showExtended, loadAnalyticsExt]);

    // Enes Doğanay | 23 Mayıs 2026: Tarih aralığı değişince genişletilmiş panel açıksa otomatik yeniden yükle
    useEffect(() => {
        if (showExtended && !analyticsExt && !extLoading) {
            loadAnalyticsExt?.();
        }
    }, [showExtended, analyticsExt, extLoading, loadAnalyticsExt]);

    // Enes Doğanay | 23 Mayıs 2026: Yazdırmadan önce dark mode kaldırılır (PDF her zaman açık renkli); afterprint ile geri yüklenir
    const handlePrint = useCallback(() => {
        const html = document.documentElement;
        const prevTheme = html.getAttribute('data-theme');
        const restore = () => {
            if (prevTheme) html.setAttribute('data-theme', prevTheme);
            window.removeEventListener('afterprint', restore);
        };
        html.removeAttribute('data-theme');
        window.addEventListener('afterprint', restore);
        window.print();
    }, []);

    if (loading) return <div className="fdb-loading"><span className="material-symbols-outlined fdb-loading-icon">bar_chart</span><p>Veriler yükleniyor…</p></div>;
    if (error)   return <div className="fdb-error"><span className="material-symbols-outlined">error</span><p>Veriler yüklenemedi: {error}</p></div>;
    if (!stats)  return null;

    const { viewStats, tenderStats, offerStats, quoteStats, topTenders } = stats;
    const activeCount  = (tenderStats?.canli ?? 0) + (tenderStats?.yaklasan ?? 0);
    const totalTenders = activeCount + (tenderStats?.kapali ?? 0) + (tenderStats?.tamamlandi ?? 0);
    const rangeBadge   = getRangeBadge(dateRange);
    const chartLabel   = getChartLabel(dateRange, viewStats?.chartViews);
    // Enes Doğanay | 23 Mayıs 2026: Genışletilmiş bölüm henzüz yüklenmiyorsa yazdırma devre dışı
    const isReadyToPrint = !showExtended || !extLoading;

    return (
        <table className="fdb-print-wrap">
            {/* Enes Doğanay | 23 Mayıs 2026: Native <thead> — Chrome print her sayfada tekrar eder */}
            <thead>
                <tr><td>
                    <div className="fdb-print-header-inner">
                        <img src="/tedport-logo_no-background.png" alt="Tedport" className="fdb-print-header-img" />
                        <div className="fdb-print-header-center">
                            <span className="fdb-print-header-title">Firma Analitik Raporu</span>
                            {/* Enes Doğanay | 23 Mayıs 2026: Rapor dönemi bilgisi */}
                            <span className="fdb-print-header-sub">{rangeBadge} Performans Özeti</span>
                        </div>
                        <span className="fdb-print-header-date">{new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                </td></tr>
            </thead>
            <tbody><tr><td>
            <div className="fdb-root">
            {/* Enes Doğanay | 23 Mayıs 2026: Hero banner — diğer sayfalara uyumlu (notif-hero, tv-hero sistemi) */}
            <div className="fdb-hero">
                <div className="fdb-hero__inner">
                    <div className="fdb-hero__title">
                        <div className="fdb-hero__icon">
                            <span className="material-symbols-outlined">bar_chart</span>
                        </div>
                        <div>
                            <h2>Analitik Dashboard</h2>
                            <p>{rangeBadge} performans özeti</p>
                        </div>
                    </div>
                    <div className="fdb-hero__right">
                        <div className="fdb-hero__kpis">
                            <div className="fdb-kpi fdb-kpi--views">
                                <span className="fdb-kpi__value">{viewStats?.total ?? 0}</span>
                                <span className="fdb-kpi__label">Görüntüleme</span>
                            </div>
                            <div className="fdb-kpi fdb-kpi--tenders">
                                <span className="fdb-kpi__value">{activeCount}</span>
                                <span className="fdb-kpi__label">Aktif İhale</span>
                            </div>
                            <div className="fdb-kpi fdb-kpi--offers">
                                <span className="fdb-kpi__value">{offerStats?.total ?? 0}</span>
                                <span className="fdb-kpi__label">Toplam Teklif</span>
                            </div>
                        </div>
                        <div className="fdb-hero__actions">
                            <button className="fdb-btn-extended" onClick={handleToggleExtended}>
                                <span className="material-symbols-outlined">{showExtended ? 'expand_less' : 'expand_more'}</span>
                                {showExtended ? 'Daha Az' : 'Daha Fazla Analitik'}
                            </button>
                            <button className="fdb-print-btn" onClick={handlePrint} disabled={!isReadyToPrint} data-tooltip={isReadyToPrint ? 'PDF olarak indir' : 'Yükleniyor…'}>
                                <span className="material-symbols-outlined">print</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {dateRange && setDateRange && (
                <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            )}
            <div className="fdb-metrics-grid">
                <MetricCard icon="visibility"    label="Profil Görüntüleme"              value={viewStats?.total}        sub={`${viewStats?.uniqueViewers ?? 0} benzersiz ziyaretçi`} accent="blue"   />
                <MetricCard icon="gavel"         label="Aktif İhale"                     value={activeCount}             sub={`Toplam ${totalTenders} ihale`}                         accent="green"  />
                <MetricCard icon="handshake"     label={`Gelen Teklif (${rangeBadge})`}  value={offerStats?.recentCount} sub={`Toplam ${offerStats?.total ?? 0} teklif`}              accent="purple" />
                <MetricCard icon="request_quote" label={`Teklif Talebi (${rangeBadge})`} value={quoteStats?.incoming}    sub={`${quoteStats?.outgoing ?? 0} tane gönderildi`}         accent="orange" />
            </div>
            <div className="fdb-sections">
                <div className="fdb-section">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">show_chart</span>
                        Profil Görüntüleme{chartLabel ? ` — ${chartLabel}` : ''}
                    </div>
                    <div className="fdb-section-body">
                        <ViewsChart chartViews={viewStats?.chartViews ?? []} />
                    </div>
                </div>
                <div className="fdb-section">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">pie_chart</span>
                        İhale Durumları
                    </div>
                    <div className="fdb-section-body">
                        <TenderStatusRow tenderStats={tenderStats ?? {}} onTamamlandiClick={handleTamamlandiClick} reportOpen={showReport} />
                    </div>
                </div>
                {showReport && (
                    <CompletedTendersReport completedReport={completedReport} reportLoading={reportLoading} onClose={() => setShowReport(false)} />
                )}
                <div className="fdb-section fdb-section--wide">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">donut_small</span>
                        Teklif Durum Dağılımı
                        {offerStats?.total > 0 && <span className="fdb-section-badge">{offerStats.total} toplam</span>}
                    </div>
                    <div className="fdb-section-body">
                        <OfferBar byStatus={offerStats?.byStatus ?? {}} total={offerStats?.total ?? 0} />
                    </div>
                </div>
                <div className="fdb-section fdb-section--wide">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">emoji_events</span>
                        En Çok Teklif Alan İhaleler
                    </div>
                    <div className="fdb-section-body">
                        <TopTenders topTenders={topTenders ?? []} />
                    </div>
                </div>
            </div>
            {/* Enes Doğanay | 23 Mayıs 2026: Genişletilmiş analitik bölümü */}
            {showExtended && (
                <AnalyticsExtended
                    analyticsExt={analyticsExt}
                    extLoading={extLoading}
                    offerStats={stats?.offerStats}
                />
            )}
            </div>
            </td></tr></tbody>
        </table>
    );
};

export default FirmaDashboardTab;
