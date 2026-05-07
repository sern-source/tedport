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

      <div className="quote-chat-header-card">
        <div className="quote-chat-header-top">
          <div>
            <h2>{activeQuote.konu}</h2>
            {activeQuote.firma_id ? (
              <p className="quote-chat-firma">
                <button
                  className="quote-chat-sender-btn"
                  onClick={() => navigate(`/firmadetay/${activeQuote.firma_id}`)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>storefront</span>
                  {activeQuote._firma_adi}
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                </button>
              </p>
            ) : (
              <p className="quote-chat-firma">{activeQuote._firma_adi}</p>
            )}
          </div>
          <span className={`cmp-quote-status cmp-quote-status--${displayDurum}`}>
            {STATUS_MAP[displayDurum] || 'Beklemede'}
          </span>
        </div>
        <div className="quote-chat-meta">
          {activeQuote.miktar && (
            <span className="my-quote-tag"><strong>Miktar:</strong> {activeQuote.miktar}</span>
          )}
          {activeQuote.teslim_tarihi && (
            <span className="my-quote-tag">
              <strong>Talep Edilen Teslim Tarihi:</strong>{' '}
              {new Date(activeQuote.teslim_tarihi).toLocaleDateString('tr-TR')}
            </span>
          )}
          {activeQuote.teslim_yeri && (
            <span className="my-quote-tag"><strong>Teslim Yeri:</strong> {activeQuote.teslim_yeri}</span>
          )}
        </div>
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
        <div className="quote-chat-initial-msg">
          <small>Talep Detayları</small>
          <p>{activeQuote.mesaj}</p>
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
