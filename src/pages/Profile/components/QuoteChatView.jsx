// Enes Doğanay | 7 Mayıs 2026: QuoteChatView — aktif teklif talebi chat görünümü
// Enes Doğanay | 7 Mayıs 2026: Firma tarafıyla aynı class yapısına ve tasarımına geçildi
import React from 'react';
import SharedChatModal from '../../../components/SharedChatModal';
import { getQuoteAttachmentSignedUrl } from '../services/quotesService';
import '../../../components/QuoteChatShared.css';
import './QuoteChatView.css';

const STATUS_MAP = {
  pending: 'Beklemede', read: 'Firma Görüntüledi', replied: 'Yanıt Geldi',
  awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı',
};

const QuoteChatView = ({
  activeQuote, quoteChatMessages, quoteChatLoading, quoteChatInput, setQuoteChatInput,
  quoteChatSending, quoteChatEndRef, sendQuoteChatMessage, setActiveQuoteId, setReportModal,
  setReportNeden, setReportAciklama, navigate,
}) => {
  const displayDurum = activeQuote._displayStatus || activeQuote.durum;
  const isClosed = activeQuote.durum === 'closed' || activeQuote.durum === 'rejected';

  const handleOpenAttachment = async () => {
    const url = await getQuoteAttachmentSignedUrl(activeQuote.ek_dosya_url);
    if (url) window.open(url, '_blank');
  };

  // Enes Doğanay | 7 Mayıs 2026: Mesajları SharedChatModal formatına normalize et
  const normalizedMessages = (quoteChatMessages || []).map(m => ({
    ...m,
    _isMine: m.sender_role === 'user',
    _senderLabel: m.sender_role === 'user' ? 'Siz' : activeQuote._firma_adi,
  }));

  return (
    <div className="cmp-quote-chat-view">
      <button className="quote-chat-back" onClick={() => setActiveQuoteId(null)}>
        <span className="material-symbols-outlined">arrow_back</span> Teklif Listesine Dön
      </button>

      {/* Enes Doğanay | 14 Mayıs 2026: Yeniden tasarlanmış talep kart başlığı — IhaleOfferCard stiliyle */}
      <div className="qcv-card">
        <div className="qcv-card__bar" />
        <div className="qcv-card__body">
          <div className="qcv-card__top">
            <div className="qcv-card__title-wrap">
              <h2 className="qcv-card__title">
                <span className="material-symbols-outlined">request_quote</span>
                {activeQuote.konu}
              </h2>
              {/* Enes Doğanay | 25 Mayıs 2026: slug URL öncelikli — slug yoksa eski id URL'e fallback */}
              {activeQuote.firma_id ? (
              <button className="qcv-card__firma-btn" onClick={() => navigate(activeQuote._firma_slug ? `/firmalar/${activeQuote._firma_slug}` : `/firmadetay/${activeQuote.firma_id}`)}>
                  <span className="material-symbols-outlined">storefront</span>
                  {activeQuote._firma_adi}
                  <span className="material-symbols-outlined qcv-card__ext-icon">open_in_new</span>
                </button>
              ) : (
                <span className="qcv-card__firma-btn">{activeQuote._firma_adi}</span>
              )}
            </div>
            <span className={`cmp-quote-status cmp-quote-status--${displayDurum}`}>
              {STATUS_MAP[displayDurum] || 'Beklemede'}
            </span>
          </div>

          {(activeQuote.teslim_tarihi || activeQuote.teslim_yeri) && (
            <div className="qcv-card__meta">
              {activeQuote.teslim_tarihi && (
                <span className="qcv-meta-tag">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span><strong>Talep Edilen Teslim:</strong> {new Date(activeQuote.teslim_tarihi).toLocaleDateString('tr-TR')}</span>
                </span>
              )}
              {activeQuote.teslim_yeri && (
                <span className="qcv-meta-tag">
                  <span className="material-symbols-outlined">location_on</span>
                  <span><strong>Teslim Yeri:</strong> {activeQuote.teslim_yeri}</span>
                </span>
              )}
            </div>
          )}

          {Array.isArray(activeQuote.kalemler) && activeQuote.kalemler.length > 0 && (
            <div className="qcv-kalemler">
              <h4>
                <span className="material-symbols-outlined">list_alt</span>
                Talep Kalemleri ({activeQuote.kalemler.length})
              </h4>
              <div className="qcv-kalemler__wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Miktar</th><th>Kalem</th><th>Açıklama</th></tr>
                  </thead>
                  <tbody>
                    {activeQuote.kalemler.map((k, i) => (
                      <tr key={`${k.madde || 'kalem'}-${i}`}>
                        <td>{i + 1}</td>
                        <td>{k.adet}{k.birim && <span className="qcv-birim-badge">{k.birim}</span>}</td>
                        <td><strong>{k.madde}</strong></td>
                        <td>{k.aciklama || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeQuote.mesaj && (
            <div className="qcv-detail-msg">
              <small>
                <span className="material-symbols-outlined">notes</span>
                Talep Detayları
              </small>
              <p>{activeQuote.mesaj}</p>
            </div>
          )}

          {activeQuote.ek_dosya_url && activeQuote.ek_dosya_adi && (
            <div className="quote-chat-attachment" onClick={handleOpenAttachment}>
              <div className="quote-chat-attachment-icon">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="quote-chat-attachment-info">
                <span className="quote-chat-attachment-name">{activeQuote.ek_dosya_adi}</span>
                <span className="quote-chat-attachment-hint">Eki görüntülemek için tıklayın</span>
              </div>
              <span className="quote-chat-attachment-open">
                <span className="material-symbols-outlined">open_in_new</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Enes Doğanay | 7 Mayıs 2026: SharedChatModal inline — mesaj ve input alanı */}
      <SharedChatModal
        inline
        hideHeader
        messages={normalizedMessages}
        loading={quoteChatLoading}
        input={quoteChatInput}
        setInput={setQuoteChatInput}
        sending={quoteChatSending}
        endRef={quoteChatEndRef}
        isClosed={isClosed}
        closedMessage="Bu teklif talebi kapatılmıştır — mesaj gönderilemez."
        onClose={() => setActiveQuoteId(null)}
        onSend={sendQuoteChatMessage}
        onReport={(msgId) => {
          const msg = (quoteChatMessages || []).find(m => m.id === msgId);
          if (msg) {
            setReportModal({ mesajId: msg.id, mesajIcerik: msg.mesaj });
            setReportNeden('spam');
            setReportAciklama('');
          }
        }}
      />
    </div>
  );
};

export default QuoteChatView;
