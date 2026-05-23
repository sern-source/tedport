// Enes Doğanay | 23 Mayıs 2026: Kategori bazlı ihale performans grafikleri
import React from 'react';

// Enes Doğanay | 23 Mayıs 2026: Her kategoride ihale, teklif ve kabul oranı satırı
const CategoryPerformance = ({ categories, loading }) => {
    if (loading) return <span className="fdb-empty-note">Yükleniyor…</span>;
    if (!categories?.length) return <span className="fdb-empty-note">Kategori verisi yok</span>;

    const maxOffers = Math.max(...categories.map(c => c.offerCount), 1);

    return (
        <div className="fdb-cat-list">
            {categories.map((c, i) => {
                const acceptRate = c.offerCount > 0
                    ? Math.round((c.kabul / c.offerCount) * 100)
                    : 0;
                const barW = Math.round((c.offerCount / maxOffers) * 100);
                const kabulW = c.offerCount > 0 ? Math.round((c.kabul / c.offerCount) * 100) : 0;

                return (
                    <div key={i} className="fdb-cat-row">
                        <div className="fdb-cat-meta">
                            <span className="fdb-cat-name">{c.kategori}</span>
                            <div className="fdb-cat-stats">
                                <span>{c.tenderCount} ihale</span>
                                <span className="fdb-cat-dot">·</span>
                                <span>{c.offerCount} teklif</span>
                                <span className="fdb-cat-dot">·</span>
                                <span className="fdb-cat-rate">%{acceptRate} kabul</span>
                            </div>
                        </div>
                        <div className="fdb-cat-bar-track">
                            <div className="fdb-cat-bar-offers" style={{ width: `${barW}%` }}>
                                {kabulW > 0 && (
                                    <div className="fdb-cat-bar-kabul" style={{ width: `${kabulW}%` }} />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryPerformance;
