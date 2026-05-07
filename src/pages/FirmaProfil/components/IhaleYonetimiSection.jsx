// Enes Doğanay | 6 Mayıs 2026: IhaleYonetimiSection — tüm ihale yönetimi hook'larını birleştirir
import React, { useMemo, useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import useIhaleCore from '../hooks/useIhaleCore';
import useIhaleChat from '../hooks/useIhaleChat';
import useIhaleCreate from '../hooks/useIhaleCreate';
import useIhaleTenderActions from '../hooks/useIhaleTenderActions';
import useIhaleOfferActions from '../hooks/useIhaleOfferActions';
import useIhaleOfferModals from '../hooks/useIhaleOfferModals';
import IhaleHeroBanner from './IhaleHeroBanner';
import IhaleYonetimiBody from './IhaleYonetimiBody';
import IhaleYonetimiOverlays from './IhaleYonetimiOverlays';

const IhaleYonetimiSection = ({ companyId, onUnreadCountChange }) => {
    const { getUserId, setActiveViewingTeklifId, refreshCounts } = useAuth() || {};

    // Enes Doğanay | 6 Mayıs 2026: Core data + realtime
    const core = useIhaleCore({ companyId, onUnreadCountChange, refreshCounts });
    // Enes Doğanay | 6 Mayıs 2026: Realtime chat
    const chat = useIhaleChat({ offersByTender: core.offersByTender, loading: core.loading, setActiveViewingTeklifId, refreshCounts });
    // Enes Doğanay | 6 Mayıs 2026: Create/edit stepper
    const create = useIhaleCreate({ companyId, reloadTenders: core.reloadTenders });
    // Enes Doğanay | 6 Mayıs 2026: Tender aksiyonlar
    const tenderActions = useIhaleTenderActions({
        tenders: core.tenders, setTenders: core.setTenders,
        setOffersByTender: core.setOffersByTender, offersByTender: core.offersByTender,
        selectedId: core.selectedId, setSelectedId: core.setSelectedId, companyId,
    });
    // Enes Doğanay | 6 Mayıs 2026: Teklif görüntüleme
    const offerActions = useIhaleOfferActions({ rawOffers: core.rawOffers, selectedTender: core.selectedTender });
    // Enes Doğanay | 6 Mayıs 2026: Teklif modalleri
    const offerModals = useIhaleOfferModals({ selectedId: core.selectedId, selectedTender: core.selectedTender, rawOffers: core.rawOffers, companyId, setOffersByTender: core.setOffersByTender });

    // Enes Doğanay | 6 Mayıs 2026: Okunmadık sayı → üst bileşene bildir
    useEffect(() => { onUnreadCountChange?.(chat.unread.ids.size); }, [chat.unread.ids.size, onUnreadCountChange]);

    // Enes Doğanay | 6 Mayıs 2026: Highlight scroll
    useEffect(() => {
        if (offerActions.highlightState.offerId && offerActions.highlightRef.current)
            setTimeout(() => offerActions.highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }, [offerActions.highlightState.offerId]);

    // Enes Doğanay | 6 Mayıs 2026: URL params → ihale/teklif navigasyon
    useEffect(() => {
        if (core.loading || core.tenders.length === 0) return;
        const ihaleParam = core.searchParams.get('ihale');
        const teklifUserParam = core.searchParams.get('teklif_user');
        const openTenderChatParam = core.searchParams.get('open_tender_chat');
        // Enes Doğanay | 7 Mayıs 2026: Bildirim tıklamasından gelen tek başına open_tender_chat paramı — ihale paramı olmadan handle et
        if (openTenderChatParam && !ihaleParam) {
            for (const [tenderId, offersList] of Object.entries(core.offersByTender)) {
                const offer = offersList.find(o => String(o.id) === String(openTenderChatParam));
                if (offer) { core.setSelectedId(Number(tenderId)); setTimeout(() => chat.openTenderChat(offer), 300); break; }
            }
            const cleanParams = new URLSearchParams(core.searchParams);
            cleanParams.delete('open_tender_chat');
            core.setSearchParams(cleanParams, { replace: true });
            return;
        }
        if (!ihaleParam) return;
        const tender = core.tenders.find(t => String(t.id) === String(ihaleParam));
        if (tender) core.setSelectedId(tender.id);
        const offers = core.offersByTender[String(ihaleParam)] || [];
        if (openTenderChatParam && teklifUserParam) {
            const offer = offers.find(o => String(o.user_id) === String(teklifUserParam) || String(o.gonderen_email) === teklifUserParam);
            if (offer) setTimeout(() => chat.openTenderChat(offer), 300);
        } else if (openTenderChatParam) {
            // Enes Doğanay | 7 Mayıs 2026: Toast tıklaması — ihale+open_tender_chat gelir, teklif ID ile bul ve chat aç
            const offer = offers.find(o => String(o.id) === String(openTenderChatParam));
            if (offer) setTimeout(() => chat.openTenderChat(offer), 300);
        } else if (teklifUserParam) {
            const offer = offers.find(o => String(o.user_id) === String(teklifUserParam) || String(o.gonderen_email) === teklifUserParam);
            if (offer) offerActions.setHighlightState({ offerId: offer.id });
        }
        const newParams = new URLSearchParams(core.searchParams);
        newParams.delete('ihale'); newParams.delete('teklif_user'); newParams.delete('open_tender_chat');
        core.setSearchParams(newParams, { replace: true });
    // Enes Doğanay | 7 Mayıs 2026: searchParams eklendi — aynı sayfadayken toast tıklaması
    // tenders/loading değişmeden effect tetiklensin diye dep array'e dahil edildi
    }, [core.loading, core.tenders.length, core.searchParams]); // eslint-disable-line

    // Enes Doğanay | 6 Mayıs 2026: sessionStorage nav → chat açma
    useEffect(() => {
        if (core.loading || core.tenders.length === 0) return;
        const chatTeklifId = sessionStorage.getItem('tom_open_teklif_chat');
        if (!chatTeklifId) return;
        sessionStorage.removeItem('tom_open_teklif_chat');
        for (const [tenderId, offers] of Object.entries(core.offersByTender)) {
            const offer = offers.find(o => String(o.id) === String(chatTeklifId));
            if (offer) { core.setSelectedId(Number(tenderId)); setTimeout(() => chat.openTenderChat(offer), 300); break; }
        }
    }, [core.loading, core.tenders.length]); // eslint-disable-line

    // Enes Doğanay | 6 Mayıs 2026: Okunmadık ihale önce sort
    const sortedFilteredTenders = useMemo(() => {
        const list = [...core.filteredTenders];
        list.sort((a, b) => (chat.tenderUnreadSet.has(String(a.id)) ? 0 : 1) - (chat.tenderUnreadSet.has(String(b.id)) ? 0 : 1));
        return list;
    }, [core.filteredTenders, chat.tenderUnreadSet]);

    // Enes Doğanay | 6 Mayıs 2026: Teklif aksiyon + modal kombine
    const combinedModals = useMemo(() => ({
        ...offerModals,
        toggleCompare: offerActions.toggleCompare, toggleShortlist: offerActions.toggleShortlist,
        handleNoteChange: offerActions.handleNoteChange, exportOffersCSV: offerActions.exportOffersCSV,
        clearCompare: offerActions.clearCompare,
        rawOfferCount: offerActions.rawOfferCount,
        openTenderChat: chat.openTenderChat, statusConfirm: (offerId, status) => offerModals.setStatusConfirmPopup({ offerId, status }),
    }), [offerModals, offerActions, chat.openTenderChat]);

    const selectedTender = core.selectedTender;
    // Enes Doğanay | 7 Mayıs 2026: 'canli' ve 'active' her ikisi de açık ihale sayılır
    const isTenderClosed = selectedTender && !['active', 'canli'].includes(String(selectedTender.durum).toLowerCase());

    return (
        <div className="tom-root">
            <IhaleHeroBanner totalTenders={core.tenders.length} activeTenders={core.activeTenders} totalOffers={core.totalOffers} onNewTender={create.openCreateModal} />
            {core.error && (
                <div className="tom-error-banner">
                    <span className="material-symbols-outlined">error</span>
                    <p>{core.error}</p>
                </div>
            )}
            {core.loading ? (
                <div className="tom-loading">
                    <span className="material-symbols-outlined tom-spin">progress_activity</span>
                    <p>Yükleniyor…</p>
                </div>
            ) : (
                <IhaleYonetimiBody core={core} chat={chat} create={create} tenderActions={tenderActions}
                    offerActions={offerActions} combinedModals={combinedModals} sortedFilteredTenders={sortedFilteredTenders} />
            )}
            <IhaleYonetimiOverlays chat={chat} offerModals={offerModals} tenderActions={tenderActions}
                create={create} offerActions={offerActions} selectedTender={selectedTender}
                isTenderClosed={isTenderClosed} getUserId={getUserId} />
        </div>
    );
};

export default IhaleYonetimiSection;
