// Enes Doğanay | 23 Mayıs 2026: Bu ay vs geçen ay karşılaştırma kartları
import React from 'react';

const MONTHS_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const now = new Date();
const THIS_MONTH  = MONTHS_TR[now.getMonth()];
const LAST_MONTH  = MONTHS_TR[(now.getMonth() + 11) % 12];

// Enes Doğanay | 23 Mayıs 2026: Değişim oranı badge'i — yukarı/aşağı yön ikonu
const DeltaBadge = ({ curr, prev }) => {
    const diff = curr - prev;
    if (!diff) return <span className="fdb-delta-badge fdb-delta-badge--flat">Değişim yok</span>;
    const up = diff > 0;
    return (
        <span className={`fdb-delta-badge fdb-delta-badge--${up ? 'up' : 'down'}`}>
            <span className="material-symbols-outlined">{up ? 'trending_up' : 'trending_down'}</span>
            {up ? '+' : ''}{diff}
        </span>
    );
};

// Enes Doğanay | 23 Mayıs 2026: İki metrik (görüntüleme + teklif) için ay karşılaştırması
const MonthComparison = ({ comparison, loading }) => {
    if (loading) return <span className="fdb-empty-note">Yükleniyor…</span>;
    if (!comparison) return <span className="fdb-empty-note">Karşılaştırma verisi yok</span>;

    const { thisViews, lastViews, thisOffers, lastOffers } = comparison;
    const items = [
        { icon: 'visibility', label: 'Profil Görüntüleme', curr: thisViews,  prev: lastViews  },
        { icon: 'handshake',  label: 'Gelen Teklif',      curr: thisOffers, prev: lastOffers },
    ];

    return (
        <div className="fdb-month-grid">
            {items.map(item => (
                <div key={item.icon} className="fdb-month-card">
                    <div className="fdb-month-card-header">
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                    </div>
                    <div className="fdb-month-vals">
                        <div className="fdb-month-col">
                            <span className="fdb-month-col-period">Geçen Ay ({LAST_MONTH})</span>
                            <span className="fdb-month-col-num">{item.prev}</span>
                        </div>
                        <DeltaBadge curr={item.curr} prev={item.prev} />
                        <div className="fdb-month-col fdb-month-col--curr">
                            <span className="fdb-month-col-period">Bu Ay ({THIS_MONTH})</span>
                            <span className="fdb-month-col-num">{item.curr}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MonthComparison;
