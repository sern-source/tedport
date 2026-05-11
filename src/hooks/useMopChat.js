// Enes Doğanay | 7 Mayıs 2026: MOP (My Offers Panel) chat state + realtime + handler'lar
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
    fetchChatMessages, markMessagesReadByBidder, markTeklifNotificationsRead,
    sendChatMessage, notifyFirmaManagers, markSingleMessageRead, fetchFirmaManagerIds,
} from '../services/myOffersService';
// Enes Doğanay | 7 Mayıs 2026: Chat + unread badge state — offers/tenderMap/firmaMap dışarıdan gelir
const TENDER_STATUS_MAP = { canli: 'active', active: 'active', kapali: 'closed', closed: 'closed', iptal: 'cancelled', cancelled: 'cancelled', taslak: 'draft', draft: 'draft' };
const getTenderTone = (v) => TENDER_STATUS_MAP[String(v || '').toLowerCase()] || 'unknown';
export function useMopChat({ offers, tenderMap, firmaMap, firmaLogoMap, userProfile, getUserId, setActiveViewingTeklifId, refreshCounts, loading, mopChatTrigger, onChatOpened, onUnreadCountChange }) {
    const [activeMopChat, setActiveMopChat] = useState(null);
    const [mopChatMessages, setMopChatMessages] = useState([]);
    const [mopChatLoading, setMopChatLoading] = useState(false);
    const [mopChatError, setMopChatError] = useState(false);
    const [mopChatInput, setMopChatInput] = useState('');
    const [mopChatSending, setMopChatSending] = useState(false);
    const [unreadMopChatIds, setUnreadMopChatIds] = useState(() => new Set());
    const [unreadMopChatCounts, setUnreadMopChatCounts] = useState({});
    const mopChatChannelRef = useRef(null);
    const mopChatEndRef = useRef(null);
    const unreadBroadcastChannelRef = useRef(null);
    // Enes Doğanay | 7 Mayıs 2026: Aynı mesaj ID'si için tekrar badge artışını önle — Supabase duplicate event
    const seenMsgIdsRef = useRef(new Set());

    // Enes Doğanay | 7 Mayıs 2026: scrollIntoView — daha güvenilir, container bağımsız
    const scrollMopChatToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            mopChatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);

    // Enes Doğanay | 7 Mayıs 2026: Realtime — yeni firma mesajı gelince badge güncelle
    useEffect(() => {
        if (loading || offers.length === 0) return;
        const myOfferIds = offers.map(o => o.id);
        if (unreadBroadcastChannelRef.current) supabase.removeChannel(unreadBroadcastChannelRef.current);
        const channel = supabase.channel('mop-unread-broadcast-watch')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ihale_teklif_mesajlari', filter: 'sender_role=eq.company' }, (payload) => {
                const m = payload.new;
                if (!myOfferIds.includes(m.teklif_id)) return;
                // Enes Doğanay | 7 Mayıs 2026: Duplicate event guard — aynı mesaj ID'si 2 kez işlenmesi
                if (seenMsgIdsRef.current.has(m.id)) return;
                seenMsgIdsRef.current.add(m.id);
                if (seenMsgIdsRef.current.size > 500) {
                    const oldest = [...seenMsgIdsRef.current].slice(0, 250);
                    oldest.forEach(id => seenMsgIdsRef.current.delete(id));
                }
                setUnreadMopChatIds(prev => { const s = new Set(prev); s.add(m.teklif_id); return s; });
                setUnreadMopChatCounts(prev => ({ ...prev, [m.teklif_id]: (prev[m.teklif_id] || 0) + 1 }));
            })
            .subscribe();
        unreadBroadcastChannelRef.current = channel;
        return () => { supabase.removeChannel(channel); unreadBroadcastChannelRef.current = null; };
    }, [loading, offers]);

    // Enes Doğanay | 7 Mayıs 2026: sessionStorage chat açma — bildirimden yönlendirme
    useEffect(() => {
        if (loading || offers.length === 0) return;
        const chatTeklifId = sessionStorage.getItem('mop_open_teklif_chat');
        if (!chatTeklifId) return;
        sessionStorage.removeItem('mop_open_teklif_chat');
        const target = offers.find(o => String(o.id) === chatTeklifId);
        if (target) {
            const t = tenderMap[String(target.ihale_id)] || {};
            // Enes Doğanay | 7 Mayıs 2026: firmaLogo burada hesaplanır — stale closure önlemi
            const logo = t.firma_id ? (firmaLogoMap?.[String(t.firma_id)] || null) : null;
            handleOpenMopChat(target, t.baslik, t.anonim ? 'Anonim Firma' : (firmaMap[String(t.firma_id)] || 'Firma'), t.anonim, logo);
        }
    }, [loading, offers]); // eslint-disable-line react-hooks/exhaustive-deps

    // Enes Doğanay | 7 Mayıs 2026: prop'tan chat açma tetikleme
    useEffect(() => {
        if (!mopChatTrigger || loading || offers.length === 0) return;
        const target = offers.find(o => String(o.id) === String(mopChatTrigger));
        if (target) {
            const t = tenderMap[String(target.ihale_id)] || {};
            const logo = t.firma_id ? (firmaLogoMap?.[String(t.firma_id)] || null) : null;
            handleOpenMopChat(target, t.baslik, t.anonim ? 'Anonim Firma' : (firmaMap[String(t.firma_id)] || 'Firma'), t.anonim, logo);
        }
        onChatOpened?.();
    }, [mopChatTrigger, loading, offers]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { onUnreadCountChange?.(unreadMopChatIds.size); }, [unreadMopChatIds, onUnreadCountChange]);

    useEffect(() => { return () => {
        // Enes Doğanay | 11 Mayıs 2026: Unmount cleanup — stale activeViewingTeklifId ref'ini temizle
        // Temizlenmezse başka sayfadaki toast bildirimleri bastırılır (isViewingThisChat yanlış true)
        if (mopChatChannelRef.current) supabase.removeChannel(mopChatChannelRef.current);
        setActiveViewingTeklifId?.(null);
    }; }, []);

    const handleOpenMopChat = useCallback(async (offer, tenderTitle, firmaAdi, anonim, firmaLogo = null) => {
        if (mopChatChannelRef.current) { supabase.removeChannel(mopChatChannelRef.current); mopChatChannelRef.current = null; }
        setActiveMopChat({ offer, tenderTitle, firmaAdi, anonim, firmaLogo });
        setMopChatLoading(true); setMopChatError(false); setMopChatInput(''); setMopChatMessages([]);
        setActiveViewingTeklifId?.(String(offer.id));
        try {
            const messages = await fetchChatMessages(offer.id);
            setMopChatMessages(messages); scrollMopChatToBottom(false);
            const unread = messages.filter(m => m.sender_role === 'company' && !m.okundu_bidder);
            if (unread.length > 0) {
                markMessagesReadByBidder(unread.map(m => m.id));
                setUnreadMopChatIds(prev => { const s = new Set(prev); s.delete(offer.id); return s; });
                setUnreadMopChatCounts(prev => { const n = { ...prev }; delete n[offer.id]; return n; });
            }
            markTeklifNotificationsRead(offer.id).then(() => refreshCounts?.());
        } catch (err) {
            if (err?.name !== 'AbortError') setMopChatError(true);
        } finally { setMopChatLoading(false); }
        const channel = supabase.channel(`tender-chat-${offer.id}`)
            .on('broadcast', { event: 'new-tender-message' }, ({ payload }) => {
                setMopChatMessages(prev => { if (prev.some(m => m.id === payload.id)) return prev; return [...prev, payload]; });
                scrollMopChatToBottom();
                if (payload.sender_role === 'company') markSingleMessageRead(payload.id);
            })
            .subscribe();
        mopChatChannelRef.current = channel;
    }, [scrollMopChatToBottom]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCloseMopChat = useCallback(() => {
        if (mopChatChannelRef.current) { supabase.removeChannel(mopChatChannelRef.current); mopChatChannelRef.current = null; }
        setActiveViewingTeklifId?.(null); setActiveMopChat(null); setMopChatMessages([]); setMopChatInput('');
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSendMopChatMessage = useCallback(async () => {
        if (!mopChatInput.trim() || !activeMopChat) return;
        const tender = tenderMap[String(activeMopChat.offer.ihale_id)];
        if (getTenderTone(tender?.durum) === 'closed') return;
        const senderId = getUserId?.();
        if (!senderId) return;
        const messageText = mopChatInput.trim();
        setMopChatSending(true);
        try {
            const data = await sendChatMessage({ teklif_id: activeMopChat.offer.id, sender_id: senderId, sender_role: 'bidder', mesaj: messageText, okundu_bidder: true });
            setMopChatMessages(prev => [...prev, data]); setMopChatInput(''); setMopChatSending(false); scrollMopChatToBottom();
            // Enes Doğanay | 8 Mayıs 2026: Fire-and-forget broadcast — realtime yayın başarısız olsa da mesaj DB'de kaydedildi
            if (mopChatChannelRef.current) void mopChatChannelRef.current.send({ type: 'broadcast', event: 'new-tender-message', payload: data });
            if (tender?.firma_id) {
                // Enes Doğanay | 8 Mayıs 2026: Fire-and-forget — bildirim gönderimi kritik değil, hata mesaj gönderimini bloklasın
                void fetchFirmaManagerIds(tender.firma_id).then((managers) => {
                    if (!managers?.length) return;
                    const userName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || senderId;
                    const notifRows = managers.filter(m => m.user_id !== senderId).map(m => ({ user_id: m.user_id, type: 'tender_offer_message', title: 'İhale teklifinden mesaj', message: `"${activeMopChat.tenderTitle || 'İhale'}" teklifine ${userName} mesaj gönderdi.`, is_read: false, metadata: { ihale_id: activeMopChat.offer.ihale_id, teklif_id: activeMopChat.offer.id, ihale_baslik: activeMopChat.tenderTitle } }));
                    notifyFirmaManagers(tender.firma_id, notifRows);
                });
            }
        } catch { setMopChatInput(messageText); setMopChatSending(false); }
    }, [mopChatInput, activeMopChat, tenderMap, userProfile, scrollMopChatToBottom, getUserId]);

    return {
        activeMopChat, mopChatMessages, mopChatLoading, mopChatError,
        mopChatInput, setMopChatInput, mopChatSending, mopChatEndRef,
        unreadMopChatIds, setUnreadMopChatIds, unreadMopChatCounts, setUnreadMopChatCounts,
        handleOpenMopChat, handleCloseMopChat, handleSendMopChatMessage,
    };
}
