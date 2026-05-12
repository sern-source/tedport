// Enes Doğanay | 6 Mayıs 2026: İhale tablosu liste görünümü satırları
import React from 'react';
import { formatTenderDate, getTenderStatusMeta } from '../../../constants/tenderUtils';

// Enes Doğanay | 6 Mayıs 2026: Liste satırı aksiyonları — kendi ihalesi, teklif durumu
const RowActions = ({ tender, isOwnTender, userOffers, onEdit, onTeklif, onContact, onDetail }) => {
    if (isOwnTender) {
        const isClosed = ['kapali', 'iptal'].includes(getTenderStatusMeta(tender).key);
        return (
            <>
                {!isClosed && (
                    <button type="button" className="tenders-list-action-btn tenders-list-action-btn--own-edit" data-tooltip="İhaleyi Düzenle"
                        onClick={(e) => { e.stopPropagation(); onEdit(tender); }}>
                        <span className="material-symbols-outlined">edit_square</span>
                    </button>
                )}
                <button type="button" className="tenders-list-action-btn tenders-list-action-btn--detail" data-tooltip="Detay" onClick={() => onDetail(tender)}>
                    <span className="material-symbols-outlined">visibility</span>
                </button>
            </>
        );
    }
    const offer = userOffers[String(tender.id)];
    const hasOffer = !!offer;
    const isAccepted = hasOffer && offer.durum === 'kabul';
    const isRejected = hasOffer && offer.durum === 'red';
    const isDraft = hasOffer && offer.durum === 'taslak';
    // Enes Doğanay | 9 Mayıs 2026: Kapalı ihalede teklif yoksa buton gösterme
    const isClosed = ['kapali', 'iptal'].includes(getTenderStatusMeta(tender).key);
    return (
        <>
            {isAccepted ? (
                <>
                    <span className="tenders-list-action-btn tenders-list-action-btn--accepted" data-tooltip="Teklifiniz Kabul Edildi">
                        <span className="material-symbols-outlined">check_circle</span>
                    </span>
                    <button type="button" className="tenders-list-action-btn tenders-list-action-btn--contact" data-tooltip="Firma ile İletişime Geç"
                        onClick={(e) => { e.stopPropagation(); onContact(tender); }}>
                        <span className="material-symbols-outlined">contact_phone</span>
                    </button>
                </>
            ) : (!isClosed || hasOffer) ? (
                <button type="button"
                    className={`tenders-list-action-btn ${hasOffer ? (isDraft ? 'tenders-list-action-btn--draft' : (isRejected ? 'tenders-list-action-btn--rejected' : 'tenders-list-action-btn--update')) : 'tenders-list-action-btn--join'}`}
                    data-tooltip={hasOffer ? (isDraft ? 'Taslağı Görüntüle' : (isRejected ? 'Reddedildi — Güncelle' : 'Teklifi Güncelle')) : 'Teklif Ver'}
                    onClick={(e) => onTeklif(tender, e)}>
                    <span className="material-symbols-outlined">{hasOffer ? (isDraft ? 'draft' : (isRejected ? 'refresh' : 'edit')) : 'handshake'}</span>
                </button>
            ) : null}
            <button type="button" className="tenders-list-action-btn tenders-list-action-btn--detail" data-tooltip="Detay" onClick={() => onDetail(tender)}>
                <span className="material-symbols-outlined">visibility</span>
            </button>
        </>
    );
};

const TendersListView = ({
    paginatedTenders, highlightTenderId, highlightTenderRef, authManagedCompanyId, userOffers,
    onDetail, onEdit, onTeklif, onContact, onNavigateFirma,
}) => (
    <section className="tenders-list-view">
        <div className="tenders-list-header">
            <span className="tenders-list-col tenders-list-col--firma">Firma</span>
            <span className="tenders-list-col tenders-list-col--baslik">Başlık</span>
            <span className="tenders-list-col tenders-list-col--konum">Teslim Yeri</span>
            <span className="tenders-list-col tenders-list-col--tarih">İhale Açılış</span>
            <span className="tenders-list-col tenders-list-col--tarih">İhale Kapanış</span>
            <span className="tenders-list-col tenders-list-col--durum">Durum</span>
            <span className="tenders-list-col tenders-list-col--actions">İşlem</span>
        </div>
        {paginatedTenders.map(tender => {
            const statusMeta = getTenderStatusMeta(tender);
            const isHighlighted = highlightTenderId === tender.id;
            const isOwnTender = !!(authManagedCompanyId && String(tender.firma_id) === String(authManagedCompanyId));
            // Enes Doğanay | 12 Mayıs 2026: Grid ile uyumluluk — Yeni badge + urgency satır rengi
            const now = new Date();
            const isNew = tender.yayin_tarihi && (now - new Date(tender.yayin_tarihi)) < 24 * 60 * 60 * 1000;
            const deadline = tender.son_basvuru_tarihi ? new Date(tender.son_basvuru_tarihi) : null;
            const isUrgent = deadline && statusMeta.key === 'canli' && (deadline - now) < 2 * 24 * 60 * 60 * 1000 && (deadline - now) > 0;
            return (
                <div key={tender.id} ref={isHighlighted ? highlightTenderRef : null}
                    className={`tenders-list-row${isHighlighted ? ' tenders-list-row--highlight' : ''}${isOwnTender ? ' tenders-list-row--own' : ''}${isUrgent ? ' tenders-list-row--urgent' : ''}`}
                    onClick={() => onDetail(tender)}>
                    <span className="tenders-list-col tenders-list-col--firma"
                        onClick={(e) => { if (tender.anonim) return; e.stopPropagation(); onNavigateFirma(tender); }}>
                        {tender.anonim ? (
                            <span className="tenders-list-anonim"><span className="material-symbols-outlined">visibility_off</span>Anonim</span>
                        ) : tender.firma_adi}
                    </span>
                    <span className="tenders-list-col tenders-list-col--baslik">
                        {isNew && <span className="tenders-list-new-badge">Yeni</span>}
                        {tender.baslik}
                    </span>
                    <span className="tenders-list-col tenders-list-col--konum">{[tender.teslim_il, tender.teslim_ilce].filter(Boolean).join(' / ') || '—'}</span>
                    <span className="tenders-list-col tenders-list-col--tarih">{formatTenderDate(tender.yayin_tarihi)}</span>
                    <span className="tenders-list-col tenders-list-col--tarih">{formatTenderDate(tender.son_basvuru_tarihi)}</span>
                    <span className={`tenders-list-col tenders-list-col--durum tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                    <span className="tenders-list-col tenders-list-col--actions" onClick={e => e.stopPropagation()}>
                        <RowActions tender={tender} isOwnTender={isOwnTender} userOffers={userOffers}
                            onEdit={onEdit} onTeklif={onTeklif} onContact={onContact} onDetail={onDetail} />
                    </span>
                </div>
            );
        })}
    </section>
);

export default TendersListView;
