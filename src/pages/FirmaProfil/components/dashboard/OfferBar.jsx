// Enes Doğanay | 23 Mayıs 2026: Teklif durum dağılım çubuğu
import React from 'react';

// Enes Doğanay | 23 Mayıs 2026: DB değerleriyle uyumlu — gonderildi/kabul/red (ihaleConstants ile aynı)
const SEGMENTS = [
    { key: 'gonderildi', label: 'Bekliyor', cls: 'pending' },
    { key: 'kabul',      label: 'Kabul',    cls: 'kabul'   },
    { key: 'red',        label: 'Red',      cls: 'red'     },
];

const OfferBar = ({ byStatus, total }) => {
    if (!total) return <span className="fdb-empty-note">Henüz teklif alınmadı</span>;
    const segments = SEGMENTS.map(s => ({ ...s, val: byStatus[s.key] ?? 0 })).filter(s => s.val > 0);

    return (
        <div className="fdb-offer-bar-wrap">
            <div className="fdb-offer-bar">
                {segments.map(s => (
                    <div
                        key={s.key}
                        className={`fdb-offer-bar-seg fdb-offer-bar-seg--${s.cls}`}
                        style={{ flex: s.val }}
                        data-tooltip={`${s.label}: ${s.val}`}
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

export default OfferBar;
