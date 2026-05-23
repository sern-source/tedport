// Enes Doğanay | 23 Mayıs 2026: Profil görüntüleme bar chart — günlük veya haftalık
import React, { useMemo } from 'react';
import { shortDay } from './dashboardConstants';

const ViewsChart = ({ chartViews }) => {
    const max = useMemo(() => Math.max(1, ...(chartViews || []).map(d => d.count)), [chartViews]);

    if (!chartViews?.length) return <span className="fdb-empty-note">Veri bulunamadı</span>;

    return (
        <div className="fdb-chart">
            {chartViews.map(d => (
                <div key={d.date} className="fdb-chart-col">
                    <span className="fdb-chart-count">{d.count || ''}</span>
                    <div className="fdb-chart-bar-wrap">
                        <div
                            className="fdb-chart-bar"
                            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                        />
                    </div>
                    <span className="fdb-chart-day">{d.label ?? shortDay(d.date)}</span>
                </div>
            ))}
        </div>
    );
};

export default ViewsChart;
