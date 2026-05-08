// Enes Doğanay | 7 Mayıs 2026: IhaleChatModal — SharedChatModal üzerinden thin wrapper (ihale sahibi tarafı)
import React from 'react';
import SharedChatModal from '../../../components/SharedChatModal';

const IhaleChatModal = ({ activeTenderChat, tenderChatMessages, tenderChatLoading, tenderChatError, tenderChatInput, setTenderChatInput, tenderChatSending, tenderChatEndRef, isTenderClosed, onClose, onSend, onOpenContact, onOpenReport }) => {
    if (!activeTenderChat) return null;

    const { offer, senderAvatar } = activeTenderChat;
    const senderName = offer.gonderen_firma_adi || offer.gonderen_ad_soyad || offer.gonderen_email;
    // Enes Doğanay | 7 Mayıs 2026: Mesajları SharedChatModal formatına dönüştür — ihale sahibi = mine
    const normalizedMessages = (tenderChatMessages || []).map(m => ({
        ...m,
        _isMine: m.sender_role === 'company' || m._isMine,
        _senderLabel: (m.sender_role === 'company' || m._isMine) ? 'Siz' : senderName,
    }));

    // Enes Doğanay | 7 Mayıs 2026: mesaj içeriğini bul — onReport sadece msgId geçirir, tam obje gerekli
    const handleReport = onOpenReport
        ? (msgId) => {
            const msg = (tenderChatMessages || []).find(m => m.id === msgId);
            if (msg) onOpenReport({ mesajId: msg.id, mesajIcerik: msg.mesaj });
        }
        : null;

    return (
        <SharedChatModal
            title={senderName}
            subtitle={offer.gonderen_email}
            avatarUrl={senderAvatar || null}
            tenderTag={activeTenderChat.tenderTitle}
            messages={normalizedMessages}
            loading={tenderChatLoading}
            error={tenderChatError}
            input={tenderChatInput}
            setInput={setTenderChatInput}
            sending={tenderChatSending}
            endRef={tenderChatEndRef}
            isClosed={isTenderClosed}
            onClose={onClose}
            onSend={onSend}
            onReport={handleReport}
            extraActions={
                onOpenContact && (
                    <button className="scm-btn-icon" onClick={onOpenContact}>
                        <span className="material-symbols-outlined">contact_phone</span>
                    </button>
                )
            }
        />
    );
};

export default IhaleChatModal;

