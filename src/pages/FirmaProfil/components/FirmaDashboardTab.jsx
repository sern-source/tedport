// Enes Doğanay | 14 Mayıs 2026: Firma Analitik Dashboard bileşeni
import React, { useMemo, useState, useCallback } from 'react';
import './FirmaDashboardTab.css';

/* ─── Para birimi formatı ─── */
// Enes Doğanay | 23 Mayıs 2026: Türkçe para formatı
const CURRENCY_SYMBOL = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
const formatMoney = (n, c = 'TRY') => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '—';
    return `${CURRENCY_SYMBOL[c] || c} ${num.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
};

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
// Enes Doğanay | 23 Mayıs 2026: onTamamlandiClick + reportOpen prop eklendi — tamamlandi pill kliklenilebilir
const TenderStatusRow = ({ tenderStats, onTamamlandiClick, reportOpen }) => {
    const entries = Object.entries(tenderStats).filter(([k]) => k !== 'draft');
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return (
        <div className="fdb-status-row">
            {entries.map(([key, count]) => {
                const meta = TENDER_DURUM[key] || { label: key, cls: 'canli' };
                const pct = total ? Math.round((count / total) * 100) : 0;
                const clickable = key === 'tamamlandi' && count > 0;
                return (
                    <div
                        key={key}
                        className={`fdb-status-pill fdb-status-pill--${meta.cls}${clickable ? ' fdb-status-pill--clickable' : ''}${clickable && reportOpen ? ' fdb-status-pill--active' : ''}`}
                        onClick={clickable ? onTamamlandiClick : undefined}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onKeyDown={clickable ? (e) => e.key === 'Enter' && onTamamlandiClick() : undefined}
                    >
                        <span className="fdb-status-pill-count">{count}</span>
                        <span className="fdb-status-pill-label">
                            {meta.label}
                            {clickable && (
                                <span className="material-symbols-outlined fdb-pill-chevron">
                                    {reportOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            )}
                        </span>
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

/* ─── Tamamlanan ihaleler rapor içeriği ─── */
// Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler raporu — özet metrikler + ürün listesi + ihale kartları
const CompletedReportContent = ({ data }) => {
    const { tenders, summary } = data;
    const spendEntries = Object.entries(summary.totalSpend).filter(([, v]) => v > 0);
    return (
        <>
            <div className="fdb-report-summary">
                <div className="fdb-report-stat">
                    <span className="material-symbols-outlined">gavel</span>
                    <span className="fdb-report-stat-val">{tenders.length}</span>
                    <span className="fdb-report-stat-lbl">Tamamlanan</span>
                </div>
                <div className="fdb-report-stat">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="fdb-report-stat-val">{summary.totalAcceptedOffers}</span>
                    <span className="fdb-report-stat-lbl">Kabul Edilen Teklif</span>
                </div>
                {spendEntries.length > 0
                    ? spendEntries.map(([c, v]) => (
                        <div key={c} className="fdb-report-stat fdb-report-stat--spend">
                            <span className="material-symbols-outlined">payments</span>
                            <span className="fdb-report-stat-val">{formatMoney(v, c)}</span>
                            <span className="fdb-report-stat-lbl">Toplam Harcama ({c})</span>
                        </div>
                    ))
                    : (
                        <div className="fdb-report-stat">
                            <span className="material-symbols-outlined">payments</span>
                            <span className="fdb-report-stat-val">—</span>
                            <span className="fdb-report-stat-lbl">Tutar Bilgisi Yok</span>
                        </div>
                    )
                }
            </div>
            {tenders.length === 0 ? (
                <div className="fdb-report-empty">
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                    <p>Henüz tamamlanan ihale bulunmuyor.</p>
                </div>
            ) : (
                <div className="fdb-report-grid">
                    <div className="fdb-report-col">
                        <div className="fdb-report-col-title">
                            <span className="material-symbols-outlined">list_alt</span>
                            İhaleler
                        </div>
                        {tenders.map((t) => (
                            <div key={t.id} className="fdb-report-tender-item">
                                <div className="fdb-report-tender-head">
                                    <span className="fdb-report-tender-name">{t.baslik}</span>
                                    {t.kategori && <span className="fdb-report-tender-cat">{t.kategori}</span>}
                                </div>
                                {t.acceptedOffer ? (
                                    <div className="fdb-report-offer">
                                        <span className="fdb-report-offer-firm">
                                            <span className="material-symbols-outlined">business</span>
                                            {t.acceptedOffer.gonderen_firma_adi || t.acceptedOffer.gonderen_ad_soyad || 'Bilinmeyen'}
                                        </span>
                                        <span className="fdb-report-offer-amount">
                                            {formatMoney(t.acceptedOffer.toplam_tutar, t.acceptedOffer.para_birimi)}
                                            {t.acceptedOffer.kdv_dahil && <span className="fdb-report-kdv"> KDV dahil</span>}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="fdb-report-no-offer">Kabul edilen teklif bulunamadı</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="fdb-report-col">
                        <div className="fdb-report-col-title">
                            <span className="material-symbols-outlined">inventory_2</span>
                            En Çok Alınan Ürünler
                        </div>
                        {summary.topProducts.length === 0 ? (
                            <span className="fdb-empty-note">Kalem bilgisi bulunamadı</span>
                        ) : summary.topProducts.map((p, i) => (
                            <div key={p.madde} className="fdb-report-product-row">
                                <span className="fdb-report-product-rank">{i + 1}</span>
                                <div className="fdb-report-product-info">
                                    <span className="fdb-report-product-name">{p.madde}</span>
                                    {p.avgFiyat != null && (
                                        <span className="fdb-report-product-price">
                                            Ort. {formatMoney(p.avgFiyat)} / {p.birim || 'adet'}
                                        </span>
                                    )}
                                </div>
                                <span className="fdb-report-product-qty">{p.totalAdet} {p.birim || 'adet'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

/* ─── Tamamlanan ihaleler raporu wrapper (accordion) ─── */
const CompletedTendersReport = ({ completedReport, reportLoading, onClose }) => (
    <div className="fdb-section fdb-section--wide fdb-completed-report">
        <div className="fdb-section-header">
            <span className="material-symbols-outlined">assignment_turned_in</span>
            Tamamlanan İhaleler — Detay Raporu
            <button className="fdb-report-close" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
                Kapat
            </button>
        </div>
        <div className="fdb-section-body">
            {reportLoading ? (
                <div className="fdb-report-loading">
                    <span className="material-symbols-outlined fdb-report-spin">hourglass_top</span>
                    <span>Rapor yükleniyor…</span>
                </div>
            ) : !completedReport || completedReport.error ? (
                <span className="fdb-empty-note">{completedReport?.error || 'Veri yüklenemedi'}</span>
            ) : (
                <CompletedReportContent data={completedReport} />
            )}
        </div>
    </div>
);

/* ─── Ana bileşen ─── */
// Enes Doğanay | 23 Mayıs 2026: completedReport, reportLoading, loadCompletedReport prop eklendi
const FirmaDashboardTab = ({ stats, loading, error, completedReport, reportLoading, loadCompletedReport }) => {
    const [showReport, setShowReport] = useState(false);
    const handleTamamlandiClick = useCallback(() => {
        setShowReport((prev) => {
            if (!prev) loadCompletedReport?.();
            return !prev;
        });
    }, [loadCompletedReport]);
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
                        {(tenderStats?.tamamlandi ?? 0) > 0 && (
                            <span className="fdb-section-badge">
                                {showReport ? 'Raporu Kapat' : 'Tamamlananları Gör'}
                            </span>
                        )}
                    </div>
                    <div className="fdb-section-body">
                        <TenderStatusRow
                            tenderStats={tenderStats ?? {}}
                            onTamamlandiClick={handleTamamlandiClick}
                            reportOpen={showReport}
                        />
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

            {/* Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler detay raporu — accordion */}
            {showReport && (
                <CompletedTendersReport
                    completedReport={completedReport}
                    reportLoading={reportLoading}
                    onClose={() => setShowReport(false)}
                />
            )}
        </div>
    );
};

export default FirmaDashboardTab;
