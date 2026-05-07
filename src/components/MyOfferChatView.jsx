// Enes Doğanay | 7 Mayıs 2026: MyOfferChatView — SharedChatModal üzerinden thin wrapper (teklif veren tarafı)
import React from 'react';
import { getTenderStatus } from '../hooks/useMyOffers';
import SharedChatModal from './SharedChatModal';

const MyOfferChatView = ({
    activeMopChat,
    mopChatMessages,
    mopChatLoading,
    mopChatError,
    mopChatInput,
    setMopChatInput,
    mopChatSending,
    mopChatEndRef,
    tenderMap,
    onClose,
    onSend,
    onOpenReportModal,
}) => {
    if (!activeMopChat) return null;

    const { offer, tenderTitle, firmaAdi, firmaLogo, anonim } = activeMopChat;
    const tender = tenderMap[String(offer.ihale_id)] || {};
    const isClosed = getTenderStatus(tender.durum).tone === 'closed';
    const displayName = anonim ? 'Anonim Firma' : (firmaAdi || 'Firma');

    // Enes Doğanay | 7 Mayıs 2026: mesajları SharedChatModal formatına dönüştür
    const normalizedMessages = (mopChatMessages || []).map(m => ({
        ...m,
        _isMine: m.sender_role === 'bidder',
        _senderLabel: m.sender_role === 'bidder' ? 'Siz' : displayName,
    }));

    return (
        <SharedChatModal
            title={displayName}
            subtitle={offer.gonderen_email}
            avatarUrl={anonim ? null : firmaLogo}
            tenderTag={tenderTitle}
            messages={normalizedMessages}
            loading={mopChatLoading}
            error={mopChatError}
            input={mopChatInput}
            setInput={setMopChatInput}
            sending={mopChatSending}
            endRef={mopChatEndRef}
            isClosed={isClosed}
            onClose={onClose}
            onSend={onSend}
            onReport={onOpenReportModal ? (msgId) => {
                const msg = mopChatMessages.find(m => m.id === msgId);
                if (msg) onOpenReportModal({ mesajId: msg.id, mesajIcerik: msg.mesaj });
            } : null}
        />
    );
};

export default MyOfferChatView;
