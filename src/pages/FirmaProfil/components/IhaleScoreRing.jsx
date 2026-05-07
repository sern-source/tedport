// Enes Doğanay | 6 Mayıs 2026: Animasyonlu puan halkası SVG bileşeni
import React, { useState, useEffect } from 'react';

const IhaleScoreRing = ({ score, size = 52 }) => {
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        setDisplayed(0);
        if (!score) return;
        const steps = 28;
        const interval = 600 / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            setDisplayed(Math.round((score / steps) * current));
            if (current >= steps) { setDisplayed(score); clearInterval(timer); }
        }, interval);
        return () => clearInterval(timer);
    }, [score]);

    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (displayed / 100) * circ;
    const color = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#ef4444';

    return (
        <div className="tom-score-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth="3.5"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
            </svg>
            <span className="tom-score-ring__val">{displayed}</span>
        </div>
    );
};

export default IhaleScoreRing;
