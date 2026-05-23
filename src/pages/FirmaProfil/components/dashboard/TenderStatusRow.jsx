// Enes Doğanay | 23 Mayıs 2026: İhale durum dağılımı — tamamlandi pill kliklenilebilir
import React from 'react';
import { TENDER_DURUM } from './dashboardConstants';

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
            {total === 0 && <span className="fdb-empty-note">Henüz hiç ihale yok</span>}
        </div>
    );
};

export default TenderStatusRow;
