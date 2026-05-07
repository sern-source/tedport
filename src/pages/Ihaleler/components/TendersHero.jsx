// Enes Doğanay | 5 Mayıs 2026: Kompakt hero — başlık + canlı/yaklaşan/kapanmış sayaçları
import React from 'react';
import './TendersHero.css';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — props ile gelir
const TendersHero = ({ selectedFirmaName, liveCount, upcomingCount, closedCount }) => (
    <section className="tenders-hero-compact">
        <div className="tenders-hero-compact__left">
            <h1>{selectedFirmaName ? `${selectedFirmaName} İhaleleri` : 'İhaleler'}</h1>
            <p>
                {selectedFirmaName
                    ? 'Bu firmaya ait aktif, yaklaşan ve kapanmış ihaleleri takip edin.'
                    : 'Canlı satın alma fırsatlarını, yaklaşan talepleri ve kapanmış ihaleleri inceleyin.'}
            </p>
        </div>
        <div className="tenders-hero-compact__stats">
            <div className="tenders-mini-stat tenders-mini-stat--live">
                <span className="material-symbols-outlined">bolt</span>
                <strong>{liveCount}</strong>
                <span>Canlı</span>
            </div>
            <div className="tenders-mini-stat tenders-mini-stat--upcoming">
                <span className="material-symbols-outlined">schedule</span>
                <strong>{upcomingCount}</strong>
                <span>Yaklaşan</span>
            </div>
            <div className="tenders-mini-stat tenders-mini-stat--closed">
                <span className="material-symbols-outlined">check_circle</span>
                <strong>{closedCount}</strong>
                <span>Kapanmış</span>
            </div>
        </div>
    </section>
);

export default TendersHero;
