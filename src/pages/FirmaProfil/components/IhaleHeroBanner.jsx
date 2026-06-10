// Enes Doğanay | 6 Mayıs 2026: Hero banner — KPI sayaçları animasyonlu
import React, { useState, useEffect } from 'react';

const CountUp = ({ value }) => {
    const [displayed, setDisplayed] = useState(0);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayed(0);
        if (!value) return;
        const steps = 20;
        const intervalMs = 600 / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            setDisplayed(Math.round((value / steps) * current));
            if (current >= steps) { setDisplayed(value); clearInterval(timer); }
        }, intervalMs);
        return () => clearInterval(timer);
    }, [value]);
    return <>{displayed}</>;
};

const IhaleHeroBanner = ({ totalTenders, activeTenders, totalOffers }) => (
    <div className="tom-hero">
        <div className="tom-hero__text">
            <h1>
                <span className="material-symbols-outlined">gavel</span>
                İhalelerim & Gelen Teklifler
            </h1>
            <p>Tüm ihalelerinizi tek ekranda yönetin, teklifleri karşılaştırın ve hızlı karar verin.</p>
        </div>
        <div className="tom-hero__stats">
            <div className="tom-stat">
                <span className="material-symbols-outlined">description</span>
                <div><strong><CountUp value={totalTenders} /></strong><span>Toplam İhale</span></div>
            </div>
            <div className="tom-stat tom-stat--green">
                <span className="material-symbols-outlined">radio_button_checked</span>
                <div><strong><CountUp value={activeTenders} /></strong><span>Aktif</span></div>
            </div>
            <div className="tom-stat">
                <span className="material-symbols-outlined">mail</span>
                <div><strong><CountUp value={totalOffers} /></strong><span>Gelen Teklif</span></div>
            </div>
        </div>
    </div>
);

export default IhaleHeroBanner;
