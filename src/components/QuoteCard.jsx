// Enes Doğanay | 7 Mayıs 2026: Ortak teklif kartı bileşeni — bireysel ve kurumsal profil
import React from 'react';
import './QuoteCard.css';

/* Enes Doğanay | 7 Mayıs 2026: Durum etiket haritaları */
const STATUS_MAP_IN = {
  pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı',
  awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı',
};
const STATUS_MAP_OUT = {
  pending: 'Beklemede', read: 'Firma Görüntüledi', replied: 'Yanıt Geldi',
  awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı',
};

/* Enes Doğanay | 7 Mayıs 2026: Teklif listesi kartı */
const QuoteCard = ({
  q,
  isIncoming,
  senderLabel: senderLabelProp,
  unreadQuoteIds,
  confirmDeleteQuoteId,
  setConfirmDeleteQuoteId,
  handleOpenQuoteChat,
  handleDeleteQuote,
}) => {
  const stMap = isIncoming ? STATUS_MAP_IN : STATUS_MAP_OUT;
  const displayDurum = q._displayStatus || q.durum;
  const senderLabel = senderLabelProp !== undefined
    ? senderLabelProp
    : isIncoming
      ? `${q.ad_soyad}${q.firma_adi ? ` • ${q.firma_adi}` : ''}`
      : q._alici_firma_adi;

  return (
    <article
      className={`cmp-quote-card${unreadQuoteIds.has(q.id) ? ' cmp-quote-card--new' : ''}`}
      onClick={() => handleOpenQuoteChat(q)}
      style={{ cursor: 'pointer' }}
    >
      <div className="cmp-quote-top">
        <div className="cmp-quote-top-left">
          <span className={`cmp-quote-status cmp-quote-status--${displayDurum}`}>
            {stMap[displayDurum] || (isIncoming ? 'Yeni' : 'Beklemede')}
          </span>
          {unreadQuoteIds.has(q.id) && <span className="cmp-quote-new-badge">Yeni Mesaj</span>}
          <strong className="cmp-quote-subject">{q.konu}</strong>
        </div>
        <div className="cmp-quote-top-right">
          <div className="cmp-quote-sender-info">
            <span className="cmp-quote-sender">{senderLabel}</span>
            <span className="cmp-quote-date">
              {new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <button
            className="cmp-quote-delete-trigger"
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuoteId(q.id); }}
            data-tooltip="Teklifi Sil"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      <p className="cmp-quote-preview">{q.mesaj}</p>
      {confirmDeleteQuoteId === q.id && (
        <div className="cmp-quote-delete-confirm" onClick={(e) => e.stopPropagation()}>
          <span>Silmek istediğinize emin misiniz?</span>
          <button
            className="cmp-quote-delete-btn cmp-quote-delete-btn--yes"
            onClick={(e) => { e.stopPropagation(); handleDeleteQuote(q.id, isIncoming); }}
          >
            Evet
          </button>
          <button
            className="cmp-quote-delete-btn cmp-quote-delete-btn--no"
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuoteId(null); }}
          >
            Hayır
          </button>
        </div>
      )}
    </article>
  );
};

export default QuoteCard;
