// Enes Doğanay | 23 Mayıs 2026: Tek metrik kart bileşeni
import React from 'react';

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

export default MetricCard;
