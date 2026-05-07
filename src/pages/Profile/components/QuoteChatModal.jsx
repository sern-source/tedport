// Enes Doğanay | 7 Mayıs 2026: QuoteChatModal — SharedChatModal sarmalayıcı (kullanıcı teklif talebi)
import React from 'react';
import SharedChatModal from '../../../components/SharedChatModal';

/* Enes Doğanay | 7 Mayıs 2026: Mesajları SharedChatModal formatına normalize et — user=mine */
const QuoteChatModal = ({
    activeQuoteId, myQuotes, quoteChatMessages, quoteChatLoading,
    quoteChatInput, setQuoteChatInput, quoteChatSending, quoteChatEndRef,
    sendQuoteChatMessage, setActiveQuoteId,
    setReportModal, setReportNeden, setReportAciklama,
}) => {
    const activeQuote = activeQuoteId ? (myQuotes || []).find(q => q.id === activeQuoteId) : null;
    if (!activeQuote) return null;

    const isClosed = activeQuote.durum === 'closed' || activeQuote.durum === 'rejected';
    const firmaAdi = activeQuote._firma_adi || 'Firma';

    const normalizedMessages = (quoteChatMessages || []).map(m => ({
        ...m,
        _isMine: m.sender_role === 'user',
        _senderLabel: m.sender_role === 'user' ? 'Siz' : firmaAdi,
    }));

    return (
        <SharedChatModal
            title={firmaAdi}
            tenderTag={activeQuote.konu}
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
    );
};

export default QuoteChatModal;
