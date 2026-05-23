// Enes Doğanay | 23 Mayıs 2026: Tamamlanan ihaleler raporu — içerik bileşenleri + accordion sarıcı
import React from 'react';
import './CompletedReport.css';
import { formatMoney } from './dashboardConstants';

/* ─── Harcama özeti satırı ─── */
const SpendStats = ({ tenders, summary, spendEntries }) => (
    <>
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
    </>
);

/* ─── İhale listesi sütunu ─── */
const TenderList = ({ tenders }) => (
    <div className="fdb-report-col">
        <div className="fdb-report-col-title">
            <span className="material-symbols-outlined">list_alt</span>İhaleler
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
);

/* ─── Ürün listesi sütunu ─── */
const ProductList = ({ topProducts }) => (
    <div className="fdb-report-col">
        <div className="fdb-report-col-title">
            <span className="material-symbols-outlined">inventory_2</span>En Çok Alınan Ürünler
        </div>
        {topProducts.length === 0 ? (
            <span className="fdb-empty-note">Kalem bilgisi bulunamadı</span>
        ) : topProducts.map((p, i) => (
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
);

/* ─── Rapor içeriği ─── */
const CompletedReportContent = ({ data }) => {
    const { tenders, summary } = data;
    const spendEntries = Object.entries(summary.totalSpend).filter(([, v]) => v > 0);
    return (
        <>
            <div className="fdb-report-summary">
                <SpendStats tenders={tenders} summary={summary} spendEntries={spendEntries} />
            </div>
            {tenders.length === 0 ? (
                <div className="fdb-report-empty">
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                    <p>Henüz tamamlanan ihale bulunmuyor.</p>
                </div>
            ) : (
                <div className="fdb-report-grid">
                    <TenderList tenders={tenders} />
                    <ProductList topProducts={summary.topProducts} />
                </div>
            )}
        </>
    );
};

/* ─── Accordion sarıcı ─── */
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

export default CompletedTendersReport;
