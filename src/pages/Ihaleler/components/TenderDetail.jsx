// Enes Doğanay | 6 Mayıs 2026: İhale detay modalı — koordinatör
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
                <div className="tender-detail__head">
                    <div>
                        <span className={`tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                        <h2>{dt.baslik}</h2>
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
                    <button type="button" className="tender-detail__close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
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
