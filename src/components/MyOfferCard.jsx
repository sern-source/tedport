// Enes Doğanay | 6 Mayıs 2026: MyOfferCard — tek ihale teklifi kartı (accordion)
import React from 'react';
import { getStatus, getTenderStatus } from '../hooks/useMyOffers';
import MyOfferCardDetail from './MyOfferCardDetail';
import './MyOfferCard.css';
import './MyOfferCard.dark.css';

// Enes Doğanay | 8 Mayıs 2026: ALL_CURRENCIES kaldırıldı — bu dosyada kullanılmıyordu (ölü kod)
const formatMoney = (amount, currency) => {
    const v = Number(amount || 0);
    if (!v) return '—';
    try { return v.toLocaleString('tr-TR', { style: 'currency', currency: currency || 'TRY', maximumFractionDigits: 0 }); }
    catch { return `${currency || ''} ${v.toLocaleString('tr-TR')}`; }
};
const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'Az önce';
    if (diff < 60) return `${diff} dk önce`;
    const hr = Math.round(diff / 60);
    if (hr < 24) return `${hr} sa önce`;
    const days = Math.round(hr / 24);
    if (days < 30) return `${days} gün önce`;
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Enes Doğanay | 6 Mayıs 2026: Teklif tutarı render — tek tutar veya kalem grupları
const renderOfferAmount = (offer) => {
    const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];
    if (kalemler.length === 0) return formatMoney(offer.toplam_tutar, offer.para_birimi);
    const groups = {};
    kalemler.forEach(k => {
        const c = k.para_birimi || offer.para_birimi || 'TRY';
        const t = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
        if (t > 0) groups[c] = (groups[c] || 0) + t;
    });
    const entries = Object.entries(groups);
    if (entries.length === 0) return formatMoney(offer.toplam_tutar, offer.para_birimi);
    return entries.map(([c, v], i) => <span key={c}>{i > 0 && ' + '}{formatMoney(v, c)}</span>);
};

const MyOfferCard = ({
    offer, tender, firmaAdi, isExpanded, isHighlight, highlightRef,
    unreadMopChatIds, unreadMopChatCounts,
    onToggle, onOpenChat, onDelete, navigate,
}) => {
    const st = getStatus(offer.durum);
    const tenderSt = getTenderStatus(tender?.durum);
    return (
        <div className={`mop-card${isExpanded ? ' mop-card--expanded' : ''}${isHighlight ? ' mop-card--highlight' : ''}`}
            ref={isHighlight ? highlightRef : undefined}>
            {/* Enes Doğanay | 8 Mayıs 2026: role="button" + aria-expanded + onKeyDown — klavye erişilebilirliği */}
            <div
                className={`mop-card__main${unreadMopChatIds.has(offer.id) ? ' mop-card__main--has-unread' : ''}`}
                onClick={onToggle}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
            >
                <div className="mop-card__tender">
                    <h3>{tender?.baslik || 'İhale bulunamadı'}</h3>
                    <div className="mop-card__meta">
                        {tender?.anonim ? (
                            <span className="mop-card__firma mop-card__firma--anonim">
                                <span className="material-symbols-outlined">apartment</span>Anonim Firma
                            </span>
                        ) : (
                            // Enes Doğanay | 25 Mayıs 2026: slug URL öncelikli — slug yoksa eski id URL'e fallback
                            <span
                                className="mop-card__firma"
                                onClick={e => { e.stopPropagation(); if (tender?.firma_id) navigate(tender.firma_slug ? `/firmalar/${tender.firma_slug}` : `/firmadetay/${tender.firma_id}`); }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); if (tender?.firma_id) navigate(tender.firma_slug ? `/firmalar/${tender.firma_slug}` : `/firmadetay/${tender.firma_id}`); } }}
                            >
                                <span className="material-symbols-outlined">apartment</span>{firmaAdi}
                            </span>
                        )}
                        {tender?.referans_no && !tender.anonim && (
                            <span className="mop-card__ref"><span className="material-symbols-outlined">tag</span>{tender.referans_no}</span>
                        )}
                        <span className={`mop-tender-badge mop-tender-badge--${tenderSt.tone}`}>{tenderSt.label}</span>
                    </div>
                </div>
                <div className="mop-card__summary">
                    <div className="mop-card__amount"><span className="material-symbols-outlined">payments</span><strong>{renderOfferAmount(offer)}</strong></div>
                    {offer.teslim_suresi_gun && (
                        <div className="mop-card__delivery"><span className="material-symbols-outlined">local_shipping</span>{offer.teslim_suresi_gun} gün</div>
                    )}
                </div>
                <div className="mop-card__status-area">
                    {unreadMopChatIds.has(offer.id) && (
                        <div className="mop-card__unread-msg-indicator">
                            <span className="material-symbols-outlined">forum</span>
                            {(unreadMopChatCounts[offer.id] || 0) > 0 ? unreadMopChatCounts[offer.id] : ''} Yeni Mesaj
                        </div>
                    )}
                    <span className={`mop-status mop-status--${st.tone}`}>
                        <span className="material-symbols-outlined">{st.icon}</span>{st.label}
                    </span>
                    <span className="mop-card__time">{timeAgo(offer.created_at)}</span>
                </div>
                <span className="material-symbols-outlined mop-card__chevron" aria-hidden="true">{isExpanded ? 'expand_less' : 'expand_more'}</span>
            </div>
            {isExpanded && (
                <MyOfferCardDetail
                    offer={offer} tender={tender} firmaAdi={firmaAdi}
                    unreadMopChatIds={unreadMopChatIds} unreadMopChatCounts={unreadMopChatCounts}
                    onOpenChat={onOpenChat} onDelete={onDelete} navigate={navigate}
                    tenderSt={tenderSt.tone} stTone={st.tone}
                />
            )}
        </div>
    );
};

// Enes Doğanay | 28 Haziran 2026: React.memo — tekliflerim listesinde gereksiz re-render önler
export default React.memo(MyOfferCard);
