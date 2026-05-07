// Enes Doğanay | 6 Mayıs 2026: İhale Tekliflerim — hero banner ve KPI kartları
import React from 'react';

const MyOffersHero = ({ kpis }) => (
    <div className="mop-hero">
        <div className="mop-hero__inner">
            <div className="mop-hero__title">
                <span className="material-symbols-outlined">gavel</span>
                <div>
                    <h2>İhale Tekliflerim</h2>
                    <p>Gönderdiğiniz teklifleri takip edin ve iletişim kurun.</p>
                </div>
            </div>
            <div className="mop-kpis">
                <div className="mop-kpi"><span className="mop-kpi__value">{kpis.total}</span><span className="mop-kpi__label">Toplam</span></div>
                <div className="mop-kpi mop-kpi--review"><span className="mop-kpi__value">{kpis.review}</span><span className="mop-kpi__label">Değerlendiriliyor</span></div>
                <div className="mop-kpi mop-kpi--accepted"><span className="mop-kpi__value">{kpis.accepted}</span><span className="mop-kpi__label">Kabul Edildi</span></div>
                <div className="mop-kpi mop-kpi--rejected"><span className="mop-kpi__value">{kpis.rejected}</span><span className="mop-kpi__label">Reddedildi</span></div>
            </div>
        </div>
    </div>
);

export default MyOffersHero;
