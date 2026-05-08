// Enes Doğanay | 6 Mayıs 2026: Teklif chat başlık kartı — metadata, ek dosya, aksiyonlar
import React from 'react';
import { getAttachmentSignedUrl } from '../services/teklifService';

/* Enes Doğanay | 6 Mayıs 2026: Durum etiket haritaları */
const STATUS_MAP_IN = {
  pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı',
  awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı',
};
const STATUS_MAP_OUT = {
  pending: 'Beklemede', read: 'Firma Görüntüledi', replied: 'Yanıt Geldi',
  awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı',
};

/* Enes Doğanay | 6 Mayıs 2026: Chat başlık kartı — teklif bilgileri + aksiyonlar */
const QuoteChatHeader = ({
  q,
  isIncoming,
  handleOpenQuoteContact,
  handleQuoteStatusChange,
  confirmRejectQuoteId,
  setConfirmRejectQuoteId,
  confirmCloseQuoteId,
  setConfirmCloseQuoteId,
}) => {
  const displayDurum = q._displayStatus || q.durum;
  const st = (isIncoming ? STATUS_MAP_IN : STATUS_MAP_OUT)[displayDurum] || 'Yeni';

  const handleOpenAttachment = async () => {
    const url = await getAttachmentSignedUrl(q.ek_dosya_url);
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="quote-chat-header-card">
      <div className="quote-chat-header-top">
        <div>
          <h2>{q.konu}</h2>
          <p className="quote-chat-firma">
            {isIncoming ? (
              <button
                className="quote-chat-sender-btn"
                onClick={() => handleOpenQuoteContact(q)}
                data-tooltip="Profili Görüntüle"
                aria-label="Profili Görüntüle"
              >
                {q.ad_soyad}
              </button>
            ) : (
              q._alici_firma_adi || 'Firma'
            )}
            {q.firma_adi ? ` • ${q.firma_adi}` : ''}
          </p>
        </div>
        <span className={`cmp-quote-status cmp-quote-status--${displayDurum}`}>{st}</span>
      </div>
      <div className="quote-chat-meta">
        {isIncoming && <span className="my-quote-tag"><strong>E-posta:</strong> {q.email}</span>}
        {q.miktar && <span className="my-quote-tag"><strong>Miktar:</strong> {q.miktar}</span>}
        {q.teslim_tarihi && (
          <span className="my-quote-tag">
            <strong>Talep Edilen Teslim Tarihi:</strong>{' '}
            {new Date(q.teslim_tarihi).toLocaleDateString('tr-TR')}
          </span>
        )}
        {q.teslim_yeri && (
          <span className="my-quote-tag"><strong>Teslim Yeri:</strong> {q.teslim_yeri}</span>
        )}
      </div>
      {q.ek_dosya_url && q.ek_dosya_adi && (
        <div className="quote-chat-attachment" onClick={handleOpenAttachment}>
          <div className="quote-chat-attachment-icon">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div className="quote-chat-attachment-info">
            <span className="quote-chat-attachment-name">{q.ek_dosya_adi}</span>
            <span className="quote-chat-attachment-hint">Eki görüntülemek için tıklayın</span>
          </div>
          <span className="quote-chat-attachment-open">
            <span className="material-symbols-outlined">open_in_new</span>
          </span>
        </div>
      )}
      <div className="quote-chat-initial-msg">
        <small>Talep detayları</small>
        <p>{q.mesaj}</p>
      </div>
      {isIncoming && (
        <div className="cmp-quote-actions" style={{ marginTop: '12px' }}>
          {q.durum !== 'rejected' && q.durum !== 'closed' && (
            confirmRejectQuoteId === q.id ? (
              <div className="cmp-quote-delete-confirm" style={{ display: 'inline-flex' }}>
                <span>Reddetmek istediğinize emin misiniz?</span>
                <button
                  className="cmp-quote-delete-btn cmp-quote-delete-btn--yes"
                  onClick={() => handleQuoteStatusChange(q.id, 'rejected')}
                >
                  Evet
                </button>
                <button
                  className="cmp-quote-delete-btn cmp-quote-delete-btn--no"
                  onClick={() => setConfirmRejectQuoteId(null)}
                >
                  Hayır
                </button>
              </div>
            ) : (
              <button
                className="cmp-btn cmp-btn--sm cmp-btn--rejected"
                onClick={() => setConfirmRejectQuoteId(q.id)}
              >
                <span className="material-symbols-outlined">close</span> Reddet
              </button>
            )
          )}
          {q.durum !== 'closed' && q.durum !== 'rejected' && !confirmRejectQuoteId && (
            confirmCloseQuoteId === q.id ? (
              <div className="cmp-quote-delete-confirm" style={{ display: 'inline-flex' }}>
                <span>Sonlandırmak istediğinize emin misiniz?</span>
                <button
                  className="cmp-quote-delete-btn cmp-quote-delete-btn--yes"
                  onClick={() => { handleQuoteStatusChange(q.id, 'closed'); setConfirmCloseQuoteId(null); }}
                >
                  Evet
                </button>
                <button
                  className="cmp-quote-delete-btn cmp-quote-delete-btn--no"
                  onClick={() => setConfirmCloseQuoteId(null)}
                >
                  Hayır
                </button>
              </div>
            ) : (
              <button
                className="cmp-btn cmp-btn--sm cmp-btn--closed"
                onClick={() => setConfirmCloseQuoteId(q.id)}
              >
                <span className="material-symbols-outlined">archive</span> Görüşmeyi Sonlandır
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteChatHeader;
