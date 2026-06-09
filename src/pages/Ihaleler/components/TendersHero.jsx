// Enes Doğanay | 5 Mayıs 2026: Kompakt hero — başlık + canlı/yaklaşan/kapanmış sayaçları
// Enes Doğanay | 12 Mayıs 2026: Copy güncellendi — canlı B2B fırsat ağı hissi
import React from 'react';
import './TendersHero.css';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — props ile gelir
const TendersHero = ({ selectedFirmaName, liveCount, upcomingCount, closedCount, tamamlandiCount }) => (
    <section className="tenders-hero-compact">
        <div className="tenders-hero-compact__left">
            <h1>{selectedFirmaName ? `${selectedFirmaName} İhaleleri` : 'İhaleler'}</h1>
            <p>
                {selectedFirmaName
                    ? 'Bu firmaya ait aktif, yaklaşan ve kapanmış ihaleleri takip edin.'
                    : 'Gerçek zamanlı ihaleleri keşfedin, satınalma süreçlerinizi hızlandırın ve kalıcı tedarik ortaklıkları kurun.'}
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
            {/* Enes Doğanay | 9 Haziran 2026: Tamamlandı sayacı */}
            <div className="tenders-mini-stat tenders-mini-stat--done">
                <span className="material-symbols-outlined">task_alt</span>
                <strong>{tamamlandiCount}</strong>
                <span>Tamamlandı</span>
            </div>
        </div>
    </section>
);

export default TendersHero;
