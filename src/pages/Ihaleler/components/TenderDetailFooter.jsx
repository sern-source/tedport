// Enes Doğanay | 6 Mayıs 2026: İhale detay footer — teklif/düzenle butonu + giriş kapısı
import React from 'react';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';

const TenderDetailActions = ({ dt, isOwnTender, userOffer, onTeklif, onEdit }) => {
    const stMeta = getTenderStatusMeta(dt);
    // Enes Doğanay | 9 Haziran 2026: tamamlandi da kapalı sayılır — teklif verilemez
    const isClosed = stMeta.key === 'kapali' || stMeta.key === 'iptal' || stMeta.key === 'tamamlandi';
    if (isOwnTender) return (
        <button type="button" className="tender-action tender-action--own-edit tender-action--full" onClick={onEdit} disabled={isClosed}>
            <span className="material-symbols-outlined">edit_square</span>İhaleyi Düzenle
        </button>
    );
    const offer = userOffer;
    const hasOffer = !!offer;
    const isDraft = hasOffer && offer.durum === 'taslak';
    const isAccepted = hasOffer && offer.durum === 'kabul';
    const isRejected = hasOffer && offer.durum === 'red';
    if (isAccepted) return (
        <span className="tender-action tender-action--accepted tender-action--full">
            <span className="material-symbols-outlined">verified</span>Teklifiniz Kabul Edildi
        </span>
    );
    // Enes Doğanay | 9 Haziran 2026: Kapalı/tamamlandı + teklif yok → buton gösterme
    if (isClosed && !hasOffer) return null;
    const btnClass = hasOffer ? (isDraft ? 'tender-action--draft' : (isRejected ? 'tender-action--rejected' : 'tender-action--update')) : 'tender-action--join';
    const btnIcon = hasOffer ? (isDraft ? 'draft' : (isRejected ? 'refresh' : 'edit')) : 'handshake';
    // Enes Doğanay | 9 Haziran 2026: Kapalı/tamamlandı'da her durumda 'Teklif Verildi'
    const btnLabel = hasOffer ? (isDraft ? 'Taslağı Görüntüle' : (isClosed ? 'Teklif Verildi' : (isRejected ? 'Yeniden Teklif Ver' : 'Teklifi Güncelle'))) : 'Teklif Ver';
    return (
        <button type="button" className={`tender-action ${btnClass} tender-action--full`} onClick={onTeklif} disabled={isClosed}>
            <span className="material-symbols-outlined">{btnIcon}</span>{btnLabel}
        </button>
    );
};

const TenderDetailFooter = ({ dt, isOwnTender, userOffer, userProfile, onTeklif, onEdit, onLogin, onRegister }) => (
    <>
        <div className="tender-detail__footer">
            <TenderDetailActions dt={dt} isOwnTender={isOwnTender} userOffer={userOffer} onTeklif={onTeklif} onEdit={onEdit} />
        </div>
        {!userProfile && (
            <div className="tender-detail-auth-gate">
                <div className="tender-detail-auth-gate__cta">
                    <span className="material-symbols-outlined">lock</span>
                    <h3>İhale detayını görmek için giriş yapın</h3>
                    <p>İhale detaylarını görüntülemek ve teklif verebilmek için hesabınıza giriş yapın.</p>
                    <button type="button" className="tender-detail-auth-gate__btn" onClick={onLogin}>İhalelere Giriş Yap</button>
                    <span className="tender-detail-auth-gate__register">Hesabınız yok mu? <button type="button" onClick={onRegister}>Kayıt Ol</button></span>
                </div>
            </div>
        )}
    </>
);

export default TenderDetailFooter;
