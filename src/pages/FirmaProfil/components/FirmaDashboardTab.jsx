// Enes Doğanay | 14 Mayıs 2026: Firma Analitik Dashboard bileşeni
import React, { useMemo } from 'react';
import './FirmaDashboardTab.css';

/* ─── Yardımcı: kısa gün adı ─── */
const DAY_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const shortDay = (dateStr) => DAY_TR[new Date(dateStr).getDay()];

/* ─── Yardımcı: ihale durumu etiketi + renk class ─── */
const TENDER_DURUM = {
    canli:      { label: 'Canlı',      cls: 'canli' },
    yaklasan:   { label: 'Yaklaşan',   cls: 'yaklasan' },
    kapali:     { label: 'Kapandı',    cls: 'kapali' },
    tamamlandi: { label: 'Tamamlandı', cls: 'tamamlandi' },
    draft:      { label: 'Taslak',     cls: 'draft' },
};

/* ─── Tek metrik kartı ─── */
const MetricCard = ({ icon, label, value, sub, accent }) => (
    <div className={`fdb-metric-card fdb-metric-card--${accent}`}>
        <div className="fdb-metric-icon">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="fdb-metric-body">
            <span className="fdb-metric-value">{value ?? '—'}</span>
            <span className="fdb-metric-label">{label}</span>
            {sub && <span className="fdb-metric-sub">{sub}</span>}
        </div>
    </div>
);

/* ─── Profil görüntüleme bar chart (son 7 gün, pure CSS) ─── */
const ViewsChart = ({ dailyViews }) => {
    const max = useMemo(() => Math.max(1, ...dailyViews.map(d => d.count)), [dailyViews]);
    return (
        <div className="fdb-chart">
            {dailyViews.map(d => (
                <div key={d.date} className="fdb-chart-col">
                    <span className="fdb-chart-count">{d.count || ''}</span>
                    <div className="fdb-chart-bar-wrap">
                        <div
                            className="fdb-chart-bar"
                            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                        />
                    </div>
                    <span className="fdb-chart-day">{shortDay(d.date)}</span>
                </div>
            ))}
        </div>
    );
};

/* ─── İhale durum dağılımı ─── */
const TenderStatusRow = ({ tenderStats }) => {
    const entries = Object.entries(tenderStats).filter(([k]) => k !== 'draft');
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return (
        <div className="fdb-status-row">
            {entries.map(([key, count]) => {
                const meta = TENDER_DURUM[key] || { label: key, cls: 'canli' };
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={key} className={`fdb-status-pill fdb-status-pill--${meta.cls}`}>
                        <span className="fdb-status-pill-count">{count}</span>
                        <span className="fdb-status-pill-label">{meta.label}</span>
                        {total > 0 && <span className="fdb-status-pill-pct">{pct}%</span>}
                    </div>
                );
            })}
            {total === 0 && (
                <span className="fdb-empty-note">Henüz hiç ihale yok</span>
            )}
        </div>
    );
};

/* ─── Teklif durum çubuğu ─── */
const OfferBar = ({ byStatus, total }) => {
    if (!total) return <span className="fdb-empty-note">Henüz teklif alınmadı</span>;
    const segments = [
        { key: 'pending',  label: 'Bekliyor', cls: 'pending',  val: byStatus.pending ?? 0 },
        { key: 'kabul',    label: 'Kabul',    cls: 'kabul',    val: byStatus.kabul ?? 0 },
        { key: 'red',      label: 'Red',      cls: 'red',      val: byStatus.red ?? 0 },
        { key: 'approved', label: 'Onaylı',   cls: 'approved', val: byStatus.approved ?? 0 },
    ].filter(s => s.val > 0);
    return (
        <div className="fdb-offer-bar-wrap">
            <div className="fdb-offer-bar">
                {segments.map(s => (
                    <div
                        key={s.key}
                        className={`fdb-offer-bar-seg fdb-offer-bar-seg--${s.cls}`}
                        style={{ flex: s.val }}
                        title={`${s.label}: ${s.val}`}
                    />
                ))}
            </div>
            <div className="fdb-offer-legend">
                {segments.map(s => (
                    <span key={s.key} className={`fdb-offer-legend-item fdb-offer-legend-item--${s.cls}`}>
                        <span className="fdb-offer-legend-dot" />
                        {s.label} ({s.val})
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ─── En çok teklif alan ihaleler ─── */
const TopTenders = ({ topTenders }) => {
    if (!topTenders.length) return <span className="fdb-empty-note">Henüz teklif alınan ihale yok</span>;
    const max = Math.max(1, ...topTenders.map(t => t.count));
    return (
        <div className="fdb-top-tenders">
            {topTenders.map((t, i) => {
                const meta = TENDER_DURUM[t.durum] || { label: t.durum, cls: 'canli' };
                return (
                    <div key={t.id} className="fdb-top-tender-row">
                        <span className="fdb-top-tender-rank">#{i + 1}</span>
                        <div className="fdb-top-tender-info">
                            <span className="fdb-top-tender-name">{t.baslik || '—'}</span>
                            <div className="fdb-top-tender-bar-wrap">
                                <div
                                    className="fdb-top-tender-bar"
                                    style={{ width: `${(t.count / max) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className={`fdb-top-tender-durum fdb-top-tender-durum--${meta.cls}`}>{meta.label}</span>
                        <span className="fdb-top-tender-count">{t.count}</span>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── Ana bileşen ─── */
const FirmaDashboardTab = ({ stats, loading, error }) => {
    if (loading) return (
        <div className="fdb-loading">
            <span className="material-symbols-outlined fdb-loading-icon">bar_chart</span>
            <p>Veriler yükleniyor…</p>
        </div>
    );

    if (error) return (
        <div className="fdb-error">
            <span className="material-symbols-outlined">error</span>
            <p>Veriler yüklenemedi: {error}</p>
        </div>
    );

    if (!stats) return null;

    const { viewStats, tenderStats, offerStats, quoteStats, topTenders } = stats;
    const activeCount = (tenderStats?.canli ?? 0) + (tenderStats?.yaklasan ?? 0);

    return (
        <div className="fdb-root">
            {/* Başlık */}
            <div className="fdb-header">
                <div className="fdb-header-title">
                    <span className="material-symbols-outlined">bar_chart</span>
                    Analitik Dashboard
                </div>
                <span className="fdb-header-sub">Son 30 günlük performans özeti</span>
            </div>

            {/* Metrik kartlar */}
            <div className="fdb-metrics-grid">
                <MetricCard
                    icon="visibility"
                    label="Profil Görüntüleme"
                    value={viewStats?.total30}
                    sub={`${viewStats?.uniqueViewers ?? 0} benzersiz ziyaretçi`}
                    accent="blue"
                />
                <MetricCard
                    icon="gavel"
                    label="Aktif İhale"
                    value={activeCount}
                    sub={`Toplam ${(tenderStats?.canli ?? 0) + (tenderStats?.yaklasan ?? 0) + (tenderStats?.kapali ?? 0) + (tenderStats?.tamamlandi ?? 0)} ihale`}
                    accent="green"
                />
                <MetricCard
                    icon="handshake"
                    label="Gelen Teklif (30 gün)"
                    value={offerStats?.recent30}
                    sub={`Toplam ${offerStats?.total ?? 0} teklif`}
                    accent="purple"
                />
                <MetricCard
                    icon="request_quote"
                    label="Teklif Talebi (30 gün)"
                    value={quoteStats?.incoming30}
                    sub={`${quoteStats?.outgoing30 ?? 0} tane gönderildi`}
                    accent="orange"
                />
            </div>

            {/* Alt bölümler */}
            <div className="fdb-sections">
                {/* Profil görüntüleme grafiği */}
                <div className="fdb-section">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">show_chart</span>
                        Profil Görüntüleme — Son 7 Gün
                    </div>
                    <div className="fdb-section-body">
                        <ViewsChart dailyViews={viewStats?.dailyViews ?? []} />
                    </div>
                </div>

                {/* İhale durum dağılımı */}
                <div className="fdb-section">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">pie_chart</span>
                        İhale Durumları
                    </div>
                    <div className="fdb-section-body">
                        <TenderStatusRow tenderStats={tenderStats ?? {}} />
                    </div>
                </div>

                {/* Teklif dağılımı */}
                <div className="fdb-section fdb-section--wide">
                    <div className="fdb-section-header">
                        <span className="material-symbols-outlined">donut_small</span>
                        Teklif Durum Dağılımı
                        {offerStats?.total > 0 && (
                            <span className="fdb-section-badge">{offerStats.total} toplam</span>
                        )}
                    </div>
                    <div className="fdb-section-body">
                        <OfferBar byStatus={offerStats?.byStatus ?? {}} total={offerStats?.total ?? 0} />
                    </div>
                </div>

                {/* En çok teklif alan ihaleler */}
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
        </div>
    );
};

export default FirmaDashboardTab;
