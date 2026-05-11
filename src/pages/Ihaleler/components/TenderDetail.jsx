// Enes Doğanay | 6 Mayıs 2026: İhale detay modalı — koordinatör
// Enes Doğanay | 11 Mayıs 2026: Header redesign — hero banner, status+close üst satır, büyük başlık
import React from 'react';
import './TenderDetail.css';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';
import TenderDetailBody from './TenderDetailBody';
import TenderDetailFooter from './TenderDetailFooter';

const TenderDetail = ({ tender, userOffer, isOwnTender, userProfile, onClose, onTeklif, onEdit, onNavigateFirma, onLogin, onRegister }) => {
    const dt = tender;
    const statusMeta = getTenderStatusMeta(dt);
    return (
        <div className="tender-detail-overlay tender-detail-overlay--center" onClick={onClose}>
            <div className="tender-detail-modal" onClick={e => e.stopPropagation()}>
                {/* Enes Doğanay | 11 Mayıs 2026: Hero header — üst satır status+close, başlık+firma altta */}
                <div className="tender-detail__head">
                    <div className="tender-detail__head-toprow">
                        <span className={`tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                        <button type="button" className="tender-detail__close" onClick={onClose}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    {/* Enes Doğanay | 12 Mayıs 2026: İhale Başlığı etiketi */}
                    <span className="tender-detail__head-label">İhale Başlığı</span>
                    <h2 className="tender-detail__title">{dt.baslik}</h2>
                    {dt.anonim ? (
                        <span className="tender-detail__company-link tender-detail__company-link--anonim">
                            <span className="material-symbols-outlined">visibility_off</span>Anonim Firma
                        </span>
                    ) : (
                        <button type="button" className="tender-detail__company-link" onClick={onNavigateFirma}>
                            <span className="material-symbols-outlined">apartment</span>{dt.firma_adi}
                        </button>
                    )}
                </div>
                <div className={`tender-detail__content${!userProfile ? ' tender-detail__content--locked' : ''}`}>
                    <TenderDetailBody dt={dt} />
                    <TenderDetailFooter dt={dt} isOwnTender={isOwnTender} userOffer={userOffer} userProfile={userProfile} onTeklif={onTeklif} onEdit={onEdit} onLogin={onLogin} onRegister={onRegister} />
                </div>
            </div>
        </div>
    );
};

export default TenderDetail;
