// Enes Doğanay | 23 Mayıs 2026: Profil ziyaretçi şirketleri listesi — yatay bar grafik
import React from 'react';

// Enes Doğanay | 23 Mayıs 2026: Ziyaretçi listesi — en çok bakandan en aza sıralı
const VisitorCompanies = ({ visitors, loading }) => {
    if (loading) return <span className="fdb-empty-note">Yükleniyor…</span>;
    if (!visitors?.length) return (
        <span className="fdb-empty-note">Henüz ziyaretçi şirket verisi yok</span>
    );

    const max = visitors[0]?.count || 1;
    return (
        <div className="fdb-visitors-list">
            {visitors.map((v, i) => (
                <div key={`${v.name}-${i}`} className="fdb-visitor-row">
                    <span className="fdb-visitor-rank">#{i + 1}</span>
                    <span className="fdb-visitor-name">{v.name}</span>
                    <div className="fdb-visitor-bar-wrap">
                        <div
                            className="fdb-visitor-bar"
                            style={{ width: `${Math.round((v.count / max) * 100)}%` }}
                        />
                    </div>
                    <span className="fdb-visitor-count">{v.count}</span>
                </div>
            ))}
        </div>
    );
};

export default VisitorCompanies;
