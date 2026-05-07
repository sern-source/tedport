// Enes Doğanay | 7 Mayıs 2026: TeklifChatModal — SharedChatModal sarmalayıcı (firma teklif yönetimi)
import React from 'react';
import SharedChatModal from '../../../components/SharedChatModal';

/* Enes Doğanay | 7 Mayıs 2026: Mesajları normalize et — firma incoming: company=mine */
const TeklifChatModal = ({
    activeQuoteChat, chatMessages, chatLoading, chatInput, setChatInput,
    chatSending, chatEndRef, handleSendChatMessage, setActiveQuoteChat,
    incomingQuotes,
    setReportModal, setReportNeden, setReportAciklama,
    handleOpenQuoteContact, handleQuoteStatusChange,
    confirmRejectQuoteId, setConfirmRejectQuoteId,
    confirmCloseQuoteId, setConfirmCloseQuoteId,
}) => {
    if (!activeQuoteChat) return null;

    const q = activeQuoteChat;
    const isIncoming = (incomingQuotes || []).some(iq => iq.id === q.id);
    const isClosed = q.durum === 'closed' || q.durum === 'rejected';
    const senderName = isIncoming
        ? (q.ad_soyad || q.email || 'Müşteri')
        : (q._alici_firma_adi || 'Alıcı');

    const normalizedMessages = (chatMessages || []).map(m => ({
        ...m,
        _isMine: isIncoming ? m.sender_role === 'company' : m.sender_role !== 'company',
        _senderLabel: isIncoming
            ? (m.sender_role === 'company' ? 'Siz' : senderName)
            : (m.sender_role !== 'company' ? 'Siz' : senderName),
    }));

    /* Enes Doğanay | 7 Mayıs 2026: Header aksiyon butonları — sadece gelen + açık tekliflerde */
    const canAct = isIncoming && !isClosed;
    const extraActions = canAct ? (
        <>
            {/* Enes Doğanay | 7 Mayıs 2026: Reddet */}
            {q.durum !== 'rejected' && (
                confirmRejectQuoteId === q.id ? (
                    <span className="scm-confirm-row">
                        <span className="scm-confirm-label">Reddet?</span>
                        <button className="scm-confirm-yes" onClick={() => handleQuoteStatusChange(q.id, 'rejected')}>E</button>
                        <button className="scm-confirm-no" onClick={() => setConfirmRejectQuoteId(null)}>H</button>
                    </span>
                ) : (
                    <button
                        className="scm-btn-icon scm-btn-icon--danger"
                        data-tooltip="Reddet"
                        onClick={() => { setConfirmRejectQuoteId(q.id); setConfirmCloseQuoteId(null); }}
                    >
                        <span className="material-symbols-outlined">cancel</span>
                    </button>
                )
            )}
            {/* Enes Doğanay | 7 Mayıs 2026: Görüşmeyi Sonlandır */}
            {confirmCloseQuoteId === q.id ? (
                <span className="scm-confirm-row">
                    <span className="scm-confirm-label">Kapat?</span>
                    <button className="scm-confirm-yes" onClick={() => { handleQuoteStatusChange(q.id, 'closed'); setConfirmCloseQuoteId(null); }}>E</button>
                    <button className="scm-confirm-no" onClick={() => setConfirmCloseQuoteId(null)}>H</button>
                </span>
            ) : (
                <button
                    className="scm-btn-icon"
                    data-tooltip="Görüşmeyi Sonlandır"
                    onClick={() => { setConfirmCloseQuoteId(q.id); setConfirmRejectQuoteId(null); }}
                >
                    <span className="material-symbols-outlined">archive</span>
                </button>
            )}
            {/* Enes Doğanay | 7 Mayıs 2026: İletişim bilgileri */}
            <button
                className="scm-btn-icon"
                data-tooltip="İletişim Bilgileri"
                onClick={() => handleOpenQuoteContact?.(q)}
            >
                <span className="material-symbols-outlined">contact_phone</span>
            </button>
        </>
    ) : null;

    return (
        <SharedChatModal
            title={senderName}
            subtitle={isIncoming ? q.email : null}
            tenderTag={q.konu}
            messages={normalizedMessages}
            loading={chatLoading}
            input={chatInput}
            setInput={setChatInput}
            sending={chatSending}
            endRef={chatEndRef}
            isClosed={isClosed}
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
            extraActions={extraActions}
        />
    );
};

export default TeklifChatModal;
