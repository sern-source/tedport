// Enes Doğanay | 23 Mayıs 2026: Sektör kıyaslama widget'ı
import React from 'react';

// Enes Doğanay | 23 Mayıs 2026: Firmanın aktif ihale sayısını sektör ortalamasıyla karşılaştırır
const SectorBenchmark = ({ benchmark, loading }) => {
    if (loading) return <span className="fdb-empty-note">Yükleniyor…</span>;
    if (!benchmark) return <span className="fdb-empty-note">Sektör verisi bulunamadı</span>;

    const { sektor, firmCount, myTenders, avgTenders, topPercent } = benchmark;
    const aboveAvg = myTenders >= avgTenders;
    const barMy  = Math.min(100, myTenders  > 0 ? Math.round((myTenders  / Math.max(myTenders, avgTenders)) * 100) : 0);
    const barAvg = Math.min(100, avgTenders > 0 ? Math.round((avgTenders / Math.max(myTenders, avgTenders)) * 100) : 0);

    return (
        <div className="fdb-benchmark">
            <div className="fdb-benchmark-head">
                <span className="fdb-benchmark-sektor">{sektor}</span>
                <span className="fdb-benchmark-count">{firmCount} firma</span>
            </div>
            <div className="fdb-benchmark-rows">
                <div className="fdb-benchmark-row">
                    <span className="fdb-benchmark-row-label">Sizin aktif ihaleniz</span>
                    <div className="fdb-benchmark-track">
                        <div className="fdb-benchmark-bar fdb-benchmark-bar--me" style={{ width: `${barMy}%` }} />
                    </div>
                    <span className="fdb-benchmark-row-val">{myTenders}</span>
                </div>
                <div className="fdb-benchmark-row">
                    <span className="fdb-benchmark-row-label">Sektör ortalaması</span>
                    <div className="fdb-benchmark-track">
                        <div className="fdb-benchmark-bar fdb-benchmark-bar--avg" style={{ width: `${barAvg}%` }} />
                    </div>
                    <span className="fdb-benchmark-row-val">{avgTenders}</span>
                </div>
            </div>
            <div className={`fdb-benchmark-verdict fdb-benchmark-verdict--${aboveAvg ? 'good' : 'low'}`}>
                <span className="material-symbols-outlined">{aboveAvg ? 'emoji_events' : 'trending_up'}</span>
                {aboveAvg
                    ? `Sektörün üst %${topPercent}'indesiniz`
                    : `Sektör ortalamasına ulaşmak için ${Math.ceil(avgTenders - myTenders)} daha fazla aktif ihale açabilirsiniz`
                }
            </div>
        </div>
    );
};

export default SectorBenchmark;
