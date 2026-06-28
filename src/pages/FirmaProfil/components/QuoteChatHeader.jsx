// Enes Doğanay | 6 Mayıs 2026: Teklif chat başlık kartı — metadata, ek dosya, aksiyonlar
import React from 'react';
import { getAttachmentSignedUrl } from '../services/teklifService';
// Enes Doğanay | 28 Haziran 2026: Durum etiket haritaları constants'a taşındı — QuoteCard, QuoteChatView ile paylaşımlı
import { QUOTE_STATUS_LABELS_IN, QUOTE_STATUS_LABELS_OUT } from '../../../constants/quoteStatus';

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
  const st = (isIncoming ? QUOTE_STATUS_LABELS_IN : QUOTE_STATUS_LABELS_OUT)[displayDurum] || 'Yeni';

  const handleOpenAttachment = async () => {
    const url = await getAttachmentSignedUrl(q.ek_dosya_url);
    if (url) window.open(url, '_blank');
  };

  /* Enes Doğanay | 14 Mayıs 2026: gönderen/alıcı bilgisi */
  const senderLabel = isIncoming
    ? (q.ad_soyad || q.email || 'Bilinmiyor')
    : (q._alici_firma_adi || 'Firma');
  const firmaLabel = q.firma_adi ? ` • ${q.firma_adi}` : '';
  const hasKalemler = Array.isArray(q.kalemler) && q.kalemler.length > 0;

  return (
    <div className="qcv-card">
      <div className="qcv-card__bar" />
      <div className="qcv-card__body">
        {/* Başlık ve durum */}
        <div className="qcv-card__top">
          <div className="qcv-card__title-wrap">
            <h2 className="qcv-card__title">
              <span className="material-symbols-outlined">request_quote</span>
              {q.konu}
            </h2>
            {isIncoming ? (
              <button
                className="qcv-card__firma-btn"
                onClick={() => handleOpenQuoteContact(q)}
                data-tooltip="Profili Görüntüle"
                aria-label="Profili Görüntüle"
              >
                <span className="material-symbols-outlined">person</span>
                {senderLabel}{firmaLabel}
                <span className="material-symbols-outlined qcv-card__ext-icon">open_in_new</span>
              </button>
            ) : (
              <span className="qcv-card__firma-btn" style={{ cursor: 'default' }}>
                <span className="material-symbols-outlined">storefront</span>
                {senderLabel}{firmaLabel}
              </span>
            )}
          </div>
          <span className={`cmp-quote-status cmp-quote-status--${displayDurum}`}>{st}</span>
        </div>
        {/* Meta etiketler */}
        <div className="qcv-card__meta">
          {isIncoming && q.email && (
            <span className="qcv-meta-tag">
              <span className="material-symbols-outlined">mail</span>
              <strong>E-posta:</strong> {q.email}
            </span>
          )}
          {q.miktar && (
            <span className="qcv-meta-tag">
              <span className="material-symbols-outlined">inventory_2</span>
              <strong>Miktar:</strong> {q.miktar}
            </span>
          )}
          {q.teslim_tarihi && (
            <span className="qcv-meta-tag">
              <span className="material-symbols-outlined">calendar_today</span>
              <strong>Teslim Tarihi:</strong>{' '}
              {new Date(q.teslim_tarihi).toLocaleDateString('tr-TR')}
            </span>
          )}
          {q.teslim_yeri && (
            <span className="qcv-meta-tag">
              <span className="material-symbols-outlined">location_on</span>
              <strong>Teslim Yeri:</strong> {q.teslim_yeri}
            </span>
          )}
        </div>
        {/* Talep kalemleri tablosu */}
        {hasKalemler && (
          <div className="qcv-kalemler">
            <h4>
              <span className="material-symbols-outlined">checklist</span>
              Talep Kalemleri
            </h4>
            <div className="qcv-kalemler__wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Miktar</th>
                    <th>Kalem</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {q.kalemler.map((k, i) => (
                    <tr key={`${k.madde || 'kalem'}-${i}`}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{k.adet}</strong>
                        {k.birim && <span className="qcv-birim-badge">{k.birim}</span>}
                      </td>
                      <td><strong>{k.madde}</strong></td>
                      <td>{k.aciklama || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Ek dosya */}
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
        {/* Talep mesajı */}
        <div className="qcv-detail-msg">
          <small>
            <span className="material-symbols-outlined">notes</span>
            Talep Detayları
          </small>
          <p>{q.mesaj}</p>
        </div>
        {/* Gelen talep aksiyonları */}
        {isIncoming && (
          <div className="cmp-quote-actions" style={{ marginTop: '4px' }}>
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
    </div>
  );
};

export default QuoteChatHeader;
