// Enes Doğanay | 23 Mayıs 2026: En çok teklif alan ihaleler listesi
import React from 'react';
import { TENDER_DURUM } from './dashboardConstants';

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

export default TopTenders;
