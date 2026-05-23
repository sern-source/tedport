// Enes Doğanay | 23 Mayıs 2026: Teklif başarı hunisi — gelen → değerlendirilen → kabul
import React from 'react';

const STEPS = [
    { key: 'all',        label: 'Gelen Teklif',       cls: 'all'    },
    { key: 'gonderildi', label: 'Değerlendiriliyor',  cls: 'review' },
    { key: 'kabul',      label: 'Kabul Edildi',        cls: 'kabul'  },
    { key: 'red',        label: 'Reddedildi',          cls: 'red'    },
];

// Enes Doğanay | 23 Mayıs 2026: Teklif sayılarından huni adımlarını hesaplar
const OfferFunnel = ({ offerStats }) => {
    const total = offerStats?.total ?? 0;
    if (!total) return <span className="fdb-empty-note">Henüz teklif alınmadı</span>;

    const byStatus = offerStats?.byStatus ?? {};
    const pct = (n) => Math.round((n / total) * 100);
    const steps = STEPS.map(s => ({
        ...s,
        value: s.key === 'all' ? total : (byStatus[s.key] ?? 0),
        pct: s.key === 'all' ? 100 : pct(byStatus[s.key] ?? 0),
    }));

    return (
        <div className="fdb-funnel">
            {steps.map(s => (
                <div key={s.key} className="fdb-funnel-step">
                    <div className="fdb-funnel-bar-wrap">
                        <div
                            className={`fdb-funnel-bar fdb-funnel-bar--${s.cls}`}
                            style={{ width: `${s.pct}%` }}
                        />
                    </div>
                    <div className="fdb-funnel-info">
                        <span className="fdb-funnel-label">{s.label}</span>
                        <span className="fdb-funnel-val">
                            {s.value}
                            <span className="fdb-funnel-pct"> (%{s.pct})</span>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OfferFunnel;
