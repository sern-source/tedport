// Enes Doğanay | 6 Mayıs 2026: İhale kartı aksiyon butonları — teklif ver, düzenle, kabul
import React from 'react';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';

const TenderCardActions = ({ tender, isOwnTender, userOffer, onEdit, onTeklif, onContact, onDetail }) => {
    const st = getTenderStatusMeta(tender);
    const isClosed = st.key === 'kapali' || st.key === 'iptal';
    const offer = userOffer;
    const hasOffer = !!offer;
    const isDraft = hasOffer && offer.durum === 'taslak';
    const isAccepted = hasOffer && offer.durum === 'kabul';
    const isRejected = hasOffer && offer.durum === 'red';

    return (
        <div className="tender-card__actions">
            {isOwnTender ? (
                <button type="button" className="tender-action tender-action--own-edit" onClick={onEdit} disabled={isClosed}>
                    <span className="material-symbols-outlined">edit_square</span>İhaleyi Düzenle
                </button>
            ) : isAccepted ? (
                <>
                    <span className="tender-action tender-action--accepted"><span className="material-symbols-outlined">verified</span>Teklifiniz Kabul Edildi</span>
                    <button type="button" className="tender-action tender-action--contact" onClick={onContact}>
                        <span className="material-symbols-outlined">contact_phone</span>İletişime Geç
                    </button>
                </>
            ) : (!isClosed || hasOffer) ? (
                <button type="button" className={`tender-action ${hasOffer ? (isDraft ? 'tender-action--draft' : (isRejected ? 'tender-action--rejected' : 'tender-action--update')) : 'tender-action--join'}`} onClick={onTeklif} disabled={isClosed && hasOffer && !isDraft}>
                    <span className="material-symbols-outlined">{hasOffer ? (isDraft ? 'draft' : (isRejected ? 'refresh' : 'edit')) : 'handshake'}</span>
                    {hasOffer ? (isDraft ? 'Taslağı Görüntüle' : (isRejected ? 'Yeniden Teklif Ver' : (isClosed ? 'Teklif Verildi' : 'Teklifi Güncelle'))) : 'Teklif Ver'}
                </button>
            ) : null}
            <button type="button" className="tender-action tender-action--detail" onClick={onDetail}>
                <span className="material-symbols-outlined">open_in_full</span>Detay
            </button>
        </div>
    );
};

export default TenderCardActions;
