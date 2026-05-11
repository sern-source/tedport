// Enes Doğanay | 6 Mayıs 2026: İhale teklif sohbet state — realtime kanal + okunmamış takibi
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as ihaleService from '../services/ihaleService';
import { enrichMessagesWithSender, fetchSenderAvatarUrl } from '../services/ihaleService';
import { getAuthSession } from '../services/firmaService';
import { supabase } from '../../../supabaseClient'; // Enes Doğanay | 8 Mayıs 2026: sadece realtime channel için

const useIhaleChat = ({ offersByTender, loading, setActiveViewingTeklifId, refreshCounts }) => {
    const [activeTenderChat, setActiveTenderChat] = useState(null);
    const [tenderChatMessages, setTenderChatMessages] = useState([]);
    const [tenderChatLoading, setTenderChatLoading] = useState(false);
    const [tenderChatError, setTenderChatError] = useState(false);
    const [tenderChatInput, setTenderChatInput] = useState('');
    const [tenderChatSending, setTenderChatSending] = useState(false);
    // Enes Doğanay | 6 Mayıs 2026: Okunmamış mesaj takibi — id seti + sayı haritası
    const [unread, setUnread] = useState({ ids: new Set(), counts: {} });
    const [reportState, setReportState] = useState({ modal: null, neden: 'spam', aciklama: '', success: false });

    const tenderChatChannelRef = useRef(null);
    const tenderChatEndRef = useRef(null);
    const unreadChannelRef = useRef(null);
    // Enes Doğanay | 7 Mayıs 2026: Aynı mesaj ID'si için tekrar sayım önle — Supabase bazen duplicate event gönderir
    const seenMsgIdsRef = useRef(new Set());

    // Enes Doğanay | 11 Mayıs 2026: Hook unmount cleanup — başka sayfaya geçilince
    // activeViewingTeklifId sıfırlanmazsa toast bildirimleri suppress olur
    useEffect(() => {
        return () => {
            if (tenderChatChannelRef.current) { supabase.removeChannel(tenderChatChannelRef.current); tenderChatChannelRef.current = null; }
            setActiveViewingTeklifId?.(null);
        };
    }, []); // eslint-disable-line

    // Enes Doğanay | 6 Mayıs 2026: İlk yüklemede okunmamış sayılarını çek
    useEffect(() => {
        if (loading) return;
        const allOfferIds = Object.values(offersByTender).flat().map(o => o.id);
        if (!allOfferIds.length) return;
        ihaleService.fetchUnreadChatCounts(allOfferIds).then(({ counts, ids, msgIds }) => {
            setUnread({ ids, counts });
            // Enes Doğanay | 11 Mayıs 2026: Başlangıçta okunan mesaj ID'leri seenMsgIdsRef'e ekle
            // Böylece realtime INSERT aynı mesajı tekrar saymaz
            msgIds.forEach(id => seenMsgIdsRef.current.add(id));
        }).catch(() => {});
    }, [loading, offersByTender]);

    // Enes Doğanay | 6 Mayıs 2026: Realtime — yeni bidder mesajı gelince badge güncelle
    useEffect(() => {
        if (loading) return;
        const allOfferIds = Object.values(offersByTender).flat().map(o => o.id);
        if (!allOfferIds.length) return;
        if (unreadChannelRef.current) supabase.removeChannel(unreadChannelRef.current);
        const channel = supabase.channel('tom-unread-broadcast-watch')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ihale_teklif_mesajlari', filter: 'sender_role=eq.bidder' }, (payload) => {
                const m = payload.new;
                if (!allOfferIds.includes(m.teklif_id)) return;
                // Enes Doğanay | 7 Mayıs 2026: Duplicate event guard — aynı mesaj ID'si 2 kez işlenmesin
                if (seenMsgIdsRef.current.has(m.id)) return;
                seenMsgIdsRef.current.add(m.id);
                if (seenMsgIdsRef.current.size > 500) {
                    const oldest = [...seenMsgIdsRef.current].slice(0, 250);
                    oldest.forEach(id => seenMsgIdsRef.current.delete(id));
                }
                setActiveTenderChat(cur => {
                    if (cur?.offer?.id !== m.teklif_id) {
                        setUnread(prev => ({ ids: new Set([...prev.ids, m.teklif_id]), counts: { ...prev.counts, [m.teklif_id]: (prev.counts[m.teklif_id] || 0) + 1 } }));
                    }
                    return cur;
                });
            })
            .subscribe();
        unreadChannelRef.current = channel;
        return () => { supabase.removeChannel(channel); unreadChannelRef.current = null; };
    }, [loading, offersByTender]);

    // Enes Doğanay | 6 Mayıs 2026: tenderUnreadSet — her ihale için okunmamış var mı?
    const tenderUnreadSet = useMemo(() => {
        const s = new Set();
        for (const [tenderId, offers] of Object.entries(offersByTender)) {
            if (offers.some(o => unread.ids.has(o.id))) s.add(String(tenderId));
        }
        return s;
    }, [offersByTender, unread.ids]);

    // Enes Doğanay | 7 Mayıs 2026: scrollIntoView — daha güvenilir, container bağımsız
    const scrollToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            tenderChatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);

    const openTenderChat = useCallback(async (offer, tenderTitle, tenderDurum) => {
        if (tenderChatChannelRef.current) { supabase.removeChannel(tenderChatChannelRef.current); tenderChatChannelRef.current = null; }
        setActiveTenderChat({ offer, tenderTitle, tenderDurum, senderAvatar: null });
        setActiveViewingTeklifId?.(offer.id);
        setTenderChatLoading(true);
        setTenderChatError(false);
        setTenderChatInput('');
        setTenderChatMessages([]);
        // Enes Doğanay | 7 Mayıs 2026: Avatar ve mesajlar paralel fetch
        const [, senderAvatar] = await Promise.allSettled([
            (async () => {
                const data = await ihaleService.fetchChatMessages(offer.id);
                const enriched = await enrichMessagesWithSender(data);
                setTenderChatMessages(enriched.map(m => ({ ...m, _isMine: m.sender_role === 'company' })));
                scrollToBottom(false);
                const unreadMsgs = data.filter(m => m.sender_role === 'bidder' && !m.okundu_firma);
                if (unreadMsgs.length) {
                    await ihaleService.markChatMessagesRead(unreadMsgs.map(m => m.id));
                    setUnread(prev => { const newIds = new Set(prev.ids); newIds.delete(offer.id); const newCounts = { ...prev.counts }; delete newCounts[offer.id]; return { ids: newIds, counts: newCounts }; });
                }
                await ihaleService.markTenderChatNotificationsRead(offer.id).then(() => refreshCounts?.());
            })(),
            fetchSenderAvatarUrl(offer).catch(() => null),
        ]);
        const avatarUrl = senderAvatar.status === 'fulfilled' ? senderAvatar.value : null;
        setActiveTenderChat(prev => prev ? { ...prev, senderAvatar: avatarUrl } : prev);
        setTenderChatLoading(false);
        const channel = supabase.channel(`tender-chat-${offer.id}`)
            .on('broadcast', { event: 'new-tender-message' }, ({ payload }) => {
                setTenderChatMessages(prev => { if (prev.some(m => m.id === payload.id)) return prev; return [...prev, { ...payload, _isMine: payload.sender_role === 'company' }]; });
                scrollToBottom();
                if (payload.sender_role === 'bidder') { ihaleService.markChatMessagesRead([payload.id]).catch(() => {}); }
            })
            .subscribe();
        tenderChatChannelRef.current = channel;
    }, [scrollToBottom, setActiveViewingTeklifId, refreshCounts]);

    const closeTenderChat = useCallback(() => {
        if (tenderChatChannelRef.current) { supabase.removeChannel(tenderChatChannelRef.current); tenderChatChannelRef.current = null; }
        setActiveViewingTeklifId?.(null);
        setActiveTenderChat(null);
        setTenderChatMessages([]);
        setTenderChatInput('');
    }, [setActiveViewingTeklifId]);

    const sendTenderChatMessage = useCallback(async (getUserId) => {
        if (!tenderChatInput.trim() || !activeTenderChat) return;
        if (activeTenderChat.tenderDurum === 'kapali') return;
        const senderId = getUserId?.();
        if (!senderId) return;
        const messageText = tenderChatInput.trim();
        setTenderChatSending(true);
        try {
            const data = await ihaleService.sendChatMessage({ teklif_id: activeTenderChat.offer.id, sender_id: senderId, sender_role: 'company', mesaj: messageText, okundu_firma: true });
            setTenderChatMessages(prev => [...prev, { ...data, _isMine: true }]);
            setTenderChatInput('');
            setTenderChatSending(false);
            scrollToBottom();
            enrichMessagesWithSender([data]).then(([enriched]) => { if (enriched) setTenderChatMessages(prev => prev.map(m => m.id === enriched.id ? enriched : m)); }).catch(() => {});
            if (tenderChatChannelRef.current) tenderChatChannelRef.current.send({ type: 'broadcast', event: 'new-tender-message', payload: data }).catch(() => {});
            if (activeTenderChat.offer.user_id) {
                ihaleService.insertNotification({ user_id: activeTenderChat.offer.user_id, type: 'tender_offer_message', title: 'İhale teklifine yeni mesaj', message: `"${activeTenderChat.tenderTitle || 'İhale'}" teklifinize firma yanıt verdi.`, is_read: false, metadata: { ihale_id: activeTenderChat.offer.ihale_id, teklif_id: activeTenderChat.offer.id, ihale_baslik: activeTenderChat.tenderTitle } });
            }
        } catch {
            setTenderChatInput(messageText);
            setTenderChatSending(false);
        }
    }, [tenderChatInput, activeTenderChat, scrollToBottom]);

    const submitReport = useCallback(async () => {
        if (!reportState.modal || reportState.sending) return;
        setReportState(p => ({ ...p, sending: true }));
        // Enes Doğanay | 8 Mayıs 2026: auth servis katmanından alınır
        const session = await getAuthSession();
        const reporterId = session?.user?.id;
        if (!reporterId) { setReportState(p => ({ ...p, sending: false })); return; }
        try {
            await ihaleService.submitMesajSikayet({ reporter_id: reporterId, mesaj_id: String(reportState.modal.mesajId), kaynak: 'ihale_teklifi', mesaj_icerik: reportState.modal.mesajIcerik, neden: reportState.neden, aciklama: reportState.aciklama.trim() || null });
            setReportState({ modal: null, neden: 'spam', aciklama: '', success: true });
            setTimeout(() => setReportState(p => ({ ...p, success: false })), 3500);
        } catch {
            setReportState(p => ({ ...p, sending: false }));
        }
    }, [reportState]);

    useEffect(() => () => { if (tenderChatChannelRef.current) supabase.removeChannel(tenderChatChannelRef.current); }, []);

    return {
        activeTenderChat, tenderChatMessages, tenderChatLoading, tenderChatError,
        tenderChatInput, setTenderChatInput, tenderChatSending, tenderChatEndRef,
        unread, tenderUnreadSet, reportState, setReportState,
        openTenderChat, closeTenderChat, sendTenderChatMessage, submitReport,
    };
};

export default useIhaleChat;
