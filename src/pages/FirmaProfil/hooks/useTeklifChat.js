// Enes Doğanay | 7 Mayıs 2026: Teklif chat state + realtime + handler'lar
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { containsProfanity, PROFANITY_ERROR_MSG } from '../../../utils/contentModeration';
import {
    fetchChatMessages, sendChatMessage as sendChatMessageService,
    enrichTeklifMessages,
} from '../services/teklifService';
import { markNotificationsRead, markTeklifFirmaNotificationsRead } from '../services/firmaService';

// Enes Doğanay | 7 Mayıs 2026: Chat state + realtime — list state dışarıdan gelir
export const useTeklifChat = ({
    incomingQuotes, setIncomingQuotes, setOutgoingQuotes,
    notifications, setNotifications, refreshCounts,
    userId, companyId, showFpToast, setActiveViewingTeklifId, currentTab,
}) => {
    const [activeQuoteChat, setActiveQuoteChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef(null);
    const chatChannelRef = useRef(null);
    // Enes Doğanay | 14 Mayıs 2026: Stale fetch guard — handleOpenQuoteChat race condition önler
    const latestChatIdRef = useRef(null);

    const scrollChatToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            const container = chatEndRef.current?.parentElement;
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);

    // Enes Doğanay | 7 Mayıs 2026: Sekme değişince aktif chat'i temizle
    useEffect(() => { if (currentTab !== 'teklifler') setActiveQuoteChat(null); }, [currentTab]);

    // Enes Doğanay | 7 Mayıs 2026: activeViewingTeklifId AuthContext'e bildir
    useEffect(() => {
        setActiveViewingTeklifId?.(activeQuoteChat?.id || null);
        return () => { setActiveViewingTeklifId?.(null); };
    }, [activeQuoteChat?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Enes Doğanay | 13 Mayıs 2026: Chat realtime + circuit breaker — realtime aktifken polling durur
    // Enes Doğanay | 14 Mayıs 2026: cleaned flag — removeChannel sonrası subscribe callback'i orphan interval açmasın
    useEffect(() => {
        if (!activeQuoteChat) {
            if (chatChannelRef.current) { supabase.removeChannel(chatChannelRef.current); chatChannelRef.current = null; }
            return;
        }
        const teklifId = activeQuoteChat.id;
        let cleaned = false; // Enes Doğanay | 14 Mayıs 2026: cleanup sonrası callback/interval guard
        const addMessage = (msg) => { if (!msg?.id || cleaned) return; setChatMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; scrollChatToBottom(); return [...prev, msg]; }); };
        let pollInterval = null;
        const startPolling = () => {
            if (pollInterval || cleaned) return;
            pollInterval = setInterval(async () => {
                try {
                    const data = await fetchChatMessages(teklifId);
                    if (cleaned || !data) return; // Enes Doğanay | 14 Mayıs 2026: stale async guard
                    setChatMessages(prev => { if (prev.length === data.length && prev.every((m, i) => m.id === data[i]?.id)) return prev; scrollChatToBottom(); return data; });
                } catch { /* sessiz */ }
            }, 10000);
        };
        const stopPolling = () => { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } };
        const channel = supabase.channel(`teklif-chat-${teklifId}`)
            .on('broadcast', { event: 'new-message' }, ({ payload }) => addMessage(payload))
            .subscribe((status) => {
                // Enes Doğanay | 13 Mayıs 2026: SUBSCRIBED → polling kapalı; kanal yokken polling açık
                // Enes Doğanay | 14 Mayıs 2026: cleaned guard — removeChannel tetiklediği CLOSED callback'ini yakalar
                if (cleaned) return;
                if (status === 'SUBSCRIBED') stopPolling();
                else startPolling();
            });
        chatChannelRef.current = channel;
        return () => {
            cleaned = true; // Enes Doğanay | 14 Mayıs 2026: önce flag, sonra removeChannel — sıra önemli
            stopPolling();
            if (chatChannelRef.current) { supabase.removeChannel(chatChannelRef.current); chatChannelRef.current = null; }
        };
    }, [activeQuoteChat?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOpenQuoteChat = useCallback(async (quote) => {
        setActiveQuoteChat(quote); setChatLoading(true); setChatInput('');
        latestChatIdRef.current = quote.id; // Enes Doğanay | 14 Mayıs 2026: race guard — fetch dönmeden önce başka teklif açılırsa iptal
        // Enes Doğanay | 14 Mayıs 2026: isIncoming erken hesapla — hem bildirim hem durum mantığında kullanılır
        const isIncoming = incomingQuotes.some(q => q.id === quote.id);
        // Enes Doğanay | 14 Mayıs 2026: Gelen teklif → tüm firma üyelerinin bildirimini okundu yap (firma-level)
        if (isIncoming && companyId) {
            try { await markTeklifFirmaNotificationsRead(quote.id, companyId); } catch { /* sessiz */ }
        } else {
            const relatedUnread = (notifications || []).filter(n => !n.is_read && ['quote_reply', 'quote_message', 'quote_received'].includes(n.type) && String(n.metadata?.teklif_id) === String(quote.id));
            if (relatedUnread.length > 0) {
                const ids = relatedUnread.map(n => n.id);
                try { await markNotificationsRead(ids); } catch { /* sessiz */ }
            }
        }
        // Enes Doğanay | 14 Mayıs 2026: Yerel state optimistic güncelle — badge anında kalkar
        setNotifications(prev => prev.map(n =>
            ['quote_reply', 'quote_message', 'quote_received'].includes(n.type) &&
            String(n.metadata?.teklif_id) === String(quote.id)
                ? { ...n, is_read: true }
                : n
        ));
        refreshCounts();
        try {
            const data = await fetchChatMessages(quote.id);
            // Enes Doğanay | 14 Mayıs 2026: Stale fetch guard — fetch sürerken başka teklif açıldıysa yoksay
            if (latestChatIdRef.current !== quote.id) return;
            let enriched; try { enriched = await enrichTeklifMessages(data); } catch { enriched = data; }
            if (latestChatIdRef.current !== quote.id) return; // enrich sonrası ikinci kontrol
            setChatMessages(enriched);
            if (isIncoming && quote.durum === 'pending') {
                const { updateQuoteStatus } = await import('../services/teklifService');
                await updateQuoteStatus(quote.id, 'read').catch(() => {});
                setIncomingQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, durum: 'read', _displayStatus: 'read' } : q));
            }
            scrollChatToBottom(false);
        } catch (err) { showFpToast?.('error', err.message || 'Mesajlar yüklenemedi.'); }
        finally {
            // Enes Doğanay | 14 Mayıs 2026: Sadece bu teklif hâlâ aktifse loading kapat
            if (latestChatIdRef.current === quote.id) setChatLoading(false);
        }
    }, [notifications, setNotifications, refreshCounts, incomingQuotes, scrollChatToBottom, showFpToast, setIncomingQuotes, companyId]);

    const handleSendChatMessage = useCallback(async () => {
        if (!chatInput.trim() || !activeQuoteChat || chatSending) return;
        // Enes Doğanay | 16 Mayıs 2026: İçerik moderasyonu
        if (containsProfanity(chatInput)) throw new Error(PROFANITY_ERROR_MSG);
        setChatSending(true);
        const isIncoming = incomingQuotes.some(q => q.id === activeQuoteChat.id);
        const senderRole = isIncoming ? 'company' : 'user';
        try {
            const data = await sendChatMessageService({ teklifId: activeQuoteChat.id, userId, senderRole, message: chatInput.trim() });
            setChatMessages(prev => [...prev, data]); setChatInput('');
            chatChannelRef.current?.send({ type: 'broadcast', event: 'new-message', payload: data }).catch(() => {});
            enrichTeklifMessages([data]).then(([e]) => { if (e) setChatMessages(prev => prev.map(m => m.id === e.id ? e : m)); }).catch(() => {});
            const newStatus = isIncoming ? 'replied' : 'awaiting_reply';
            const updater = prev => prev.map(q => q.id === activeQuoteChat.id ? { ...q, _displayStatus: newStatus } : q);
            if (isIncoming) setIncomingQuotes(updater); else setOutgoingQuotes(updater);
            setActiveQuoteChat(prev => prev ? { ...prev, _displayStatus: newStatus } : null);
            scrollChatToBottom();
        } finally { setChatSending(false); }
    }, [chatInput, activeQuoteChat, chatSending, userId, incomingQuotes, scrollChatToBottom, setIncomingQuotes, setOutgoingQuotes]);

    return {
        activeQuoteChat, setActiveQuoteChat, chatMessages, setChatMessages,
        chatLoading, chatInput, setChatInput, chatSending, chatEndRef,
        handleOpenQuoteChat, handleSendChatMessage,
    };
};
