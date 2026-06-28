// Enes Doğanay | 5 Mayıs 2026: Tekil ihale kartı bileşeni — grid görünümü için
// Enes Doğanay | 12 Mayıs 2026: Yeni badge, urgency renk, verified rozet
import React from 'react';
import './TenderCard.css';
import { formatTenderDate, getTenderStatusMeta } from '../../../constants/tenderUtils';
import TenderCardActions from './TenderCardActions';

const TenderCard = ({ tender, isHighlighted, isOwnTender, userOffer, highlightRef, onDetail, onEdit, onTeklif, onContact, onNavigateFirma }) => {
    const statusMeta = getTenderStatusMeta(tender);
    const deadline = tender.son_basvuru_tarihi ? new Date(tender.son_basvuru_tarihi) : null;
    const now = new Date();
    // Enes Doğanay | 12 Mayıs 2026: Son 24 saatte yayınlanan → Yeni badge
    const isNew = tender.yayin_tarihi && (now - new Date(tender.yayin_tarihi)) < 24 * 60 * 60 * 1000;
    // Enes Doğanay | 12 Mayıs 2026: 2 günden az kalan canlı ihale → urgency
    const isUrgent = deadline && statusMeta.key === 'canli' && (deadline - now) < 2 * 24 * 60 * 60 * 1000 && (deadline - now) > 0;
    let countdownText = '';
    if (deadline && statusMeta.key === 'canli') {
        const diffMs = deadline - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (diffDays > 0) countdownText = `${diffDays} gün ${diffHours} saat kaldı`;
        else if (diffHours > 0) countdownText = `${diffHours} saat kaldı`;
        else if (diffMs > 0) countdownText = 'Son saatler!';
    }
    const gereksinimCount = Array.isArray(tender.gereksinimler) ? tender.gereksinimler.length : 0;
    const teslimYeri = [tender.teslim_il, tender.teslim_ilce].filter(Boolean).join(', ');

    return (
        <article ref={highlightRef} className={`tender-card tender-card--${statusMeta.className}${isHighlighted ? ' tender-card--highlight' : ''}${isOwnTender ? ' tender-card--own' : ''}${isUrgent ? ' tender-card--urgent' : ''}`}>
            {/* Enes Doğanay | 14 Mayıs 2026: Davetli ihale bandı — üstte özel davet göstergesi */}
            {tender._isInvited && (
                <div className="tender-card__invite-banner">
                    <span className="material-symbols-outlined">mark_email_read</span>
                    Davet Edildiniz
                </div>
            )}
            <div className="tender-card__header">
                {tender.anonim ? (
                    <span className="tender-card__company tender-card__company--anonim"><span className="material-symbols-outlined">visibility_off</span>Anonim Firma</span>
                ) : (
                    <button type="button" className="tender-card__company" onClick={onNavigateFirma}>
                        <span className="material-symbols-outlined">apartment</span>
                        {tender.firma_adi}
                    </button>
                )}
                <div className="tender-card__header-badges">
                    {isNew && <span className="tender-card__new-badge">Yeni</span>}
                    <span className={`tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                </div>
            </div>
            <h2 className="tender-card__title">{tender.baslik}</h2>
            {tender.aciklama && <p className="tender-card__desc">{tender.aciklama.length > 120 ? tender.aciklama.slice(0, 120) + '…' : tender.aciklama}</p>}
            <div className="tender-card__chips">
                {tender.ihale_tipi && <span className="tender-chip tender-chip--type"><span className="material-symbols-outlined">category</span>{tender.ihale_tipi}</span>}
                {tender.kdv_durumu && <span className="tender-chip tender-chip--kdv"><span className="material-symbols-outlined">receipt_long</span>KDV {tender.kdv_durumu === 'dahil' ? 'Dahil' : 'Hariç'}</span>}
                {teslimYeri && <span className="tender-chip tender-chip--location"><span className="material-symbols-outlined">location_on</span>{teslimYeri}</span>}
            </div>
            <div className="tender-card__info">
                {/* Enes Doğanay | 12 Mayıs 2026: Sektör — uzun olabilir, chip satırı yerine info satırına alındı */}
                {tender.kategori && <div className="tender-card__info-row"><span className="material-symbols-outlined">domain</span><span className="tender-card__info-label">Sektör</span><span className="tender-card__info-value">{tender.kategori}</span></div>}
                <div className="tender-card__info-row"><span className="material-symbols-outlined">event</span><span className="tender-card__info-label">İhale Açılış Tarihi</span><span className="tender-card__info-value">{formatTenderDate(tender.yayin_tarihi)}</span></div>
                <div className="tender-card__info-row"><span className="material-symbols-outlined">event_busy</span><span className="tender-card__info-label">İhale Kapanış Tarihi</span><span className="tender-card__info-value">{formatTenderDate(tender.son_basvuru_tarihi)}</span></div>
                {tender.teslim_suresi && <div className="tender-card__info-row"><span className="material-symbols-outlined">local_shipping</span><span className="tender-card__info-label">Teslim</span><span className="tender-card__info-value">{tender.teslim_suresi}</span></div>}
                {gereksinimCount > 0 && <div className="tender-card__info-row"><span className="material-symbols-outlined">checklist</span><span className="tender-card__info-label">Gereksinimler</span><span className="tender-card__info-value">{gereksinimCount} madde</span></div>}
            </div>
            {countdownText && <div className={`tender-card__countdown${isUrgent ? ' tender-card__countdown--urgent' : ''}`}><span className="material-symbols-outlined">{isUrgent ? 'warning' : 'timer'}</span>{countdownText}</div>}
            {tender.referans_no && !tender.anonim && <div className="tender-card__ref"><span className="material-symbols-outlined">tag</span>{tender.referans_no}</div>}
            <TenderCardActions tender={tender} isOwnTender={isOwnTender} userOffer={userOffer} onEdit={onEdit} onTeklif={onTeklif} onContact={onContact} onDetail={onDetail} />
        </article>
    );
};

// Enes Doğanay | 28 Haziran 2026: React.memo — büYük listelerde gereksiz re-render önler
export default React.memo(TenderCard);
