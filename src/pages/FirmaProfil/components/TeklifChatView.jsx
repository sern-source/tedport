// Enes Doğanay | 6 Mayıs 2026: Teklif chat görünümü — mesajlar, giriş, kapalı banner
// Enes Doğanay | 7 Mayıs 2026: Mesaj alanı SharedChatModal inline ile yükseltildi
import React from 'react';
import SharedChatModal from '../../../components/SharedChatModal';
import QuoteChatHeader from './QuoteChatHeader';
import '../../../components/QuoteChatShared.css';

/* Enes Doğanay | 6 Mayıs 2026: Chat view — header, mesajlar, input */
const TeklifChatView = ({
  activeQuoteChat: q,
  setActiveQuoteChat,
  incomingQuotes,
  chatMessages,
  chatLoading,
  chatInput,
  setChatInput,
  chatSending,
  chatEndRef,
  confirmRejectQuoteId,
  setConfirmRejectQuoteId,
  confirmCloseQuoteId,
  setConfirmCloseQuoteId,
  handleQuoteStatusChange,
  handleSendChatMessage,
  handleOpenQuoteContact,
  setReportModal,
  setReportNeden,
  setReportAciklama,
}) => {
  const isIncoming = incomingQuotes.some((iq) => iq.id === q.id);
  const isClosed = q.durum === 'closed' || q.durum === 'rejected';

  // Enes Doğanay | 7 Mayıs 2026: Mesajları SharedChatModal formatına normalize et
  const normalizedMessages = (chatMessages || []).map(m => {
    const isCompany = m.sender_role === 'company';
    let _senderLabel;
    if (isCompany && isIncoming) _senderLabel = m._senderName || 'Firma';
    else if (isCompany) _senderLabel = 'Firma';
    else if (isIncoming) _senderLabel = q.ad_soyad;
    else _senderLabel = 'Siz';
    return { ...m, _isMine: isIncoming ? isCompany : !isCompany, _senderLabel };
  });

  return (
    <div className="cmp-quote-chat-view">
      <button className="quote-chat-back" onClick={() => setActiveQuoteChat(null)}>
        <span className="material-symbols-outlined">arrow_back</span> Teklif Listesine Dön
      </button>
      <QuoteChatHeader
        q={q}
        isIncoming={isIncoming}
        handleOpenQuoteContact={handleOpenQuoteContact}
        handleQuoteStatusChange={handleQuoteStatusChange}
        confirmRejectQuoteId={confirmRejectQuoteId}
        setConfirmRejectQuoteId={setConfirmRejectQuoteId}
        confirmCloseQuoteId={confirmCloseQuoteId}
        setConfirmCloseQuoteId={setConfirmCloseQuoteId}
      />
      {/* Enes Doğanay | 7 Mayıs 2026: SharedChatModal inline — mesaj ve input alanı */}
      <SharedChatModal
        inline
        hideHeader
        messages={normalizedMessages}
        loading={chatLoading}
        input={chatInput}
        setInput={setChatInput}
        sending={chatSending}
        endRef={chatEndRef}
        isClosed={isClosed}
        closedMessage="Bu teklif talebi kapatılmıştır — mesaj gönderilemez."
        onClose={() => setActiveQuoteChat(null)}
        onSend={handleSendChatMessage}
        onReport={(msgId) => {
          const msg = (chatMessages || []).find(m => m.id === msgId);
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

export default TeklifChatView;

