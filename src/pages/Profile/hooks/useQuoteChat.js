// Enes Doğanay | 7 Mayıs 2026: useQuoteChat — teklif chat realtime + mesaj gönderme
// useQuotes'tan ayrıştırılan chat-specific logic
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { onSupabaseConnectionEvent } from '../../../supabaseRecovery';
import { fetchQuoteMessages, sendQuoteMessageService, markQuoteNotificationsRead, sendQuoteChatMessageWithFile } from '../services/quotesService';
import { containsProfanity, PROFANITY_ERROR_MSG } from '../../../utils/contentModeration';

const useQuoteChat = ({ activeQuoteId, setActiveQuoteId, userId, refreshCounts, setNotifications, setMyQuotes }) => {
    const [quoteChatMessages, setQuoteChatMessages] = useState([]);
    const [quoteChatLoading, setQuoteChatLoading] = useState(false);
    const [quoteChatInput, setQuoteChatInput] = useState('');
    const [quoteChatSending, setQuoteChatSending] = useState(false);
    const quoteChatEndRef = useRef(null);
    const quoteChatChannelRef = useRef(null);
    // Enes Doğanay | 14 Mayıs 2026: Stale fetch guard — openQuoteChat race condition önler
    const latestQuoteIdRef = useRef(null);

    const scrollToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            const el = quoteChatEndRef.current?.parentElement;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);

    // Enes Doğanay | 13 Mayıs 2026: Realtime kanal + circuit breaker — SUBSCRIBED → polling durur
    // Enes Doğanay | 14 Mayıs 2026: cleaned flag — removeChannel tetiklediği CLOSED callback'i orphan interval açmasın
    useEffect(() => {
        if (!activeQuoteId) {
            if (quoteChatChannelRef.current) { supabase.removeChannel(quoteChatChannelRef.current); quoteChatChannelRef.current = null; }
            return;
        }
        let cleaned = false; // Enes Doğanay | 14 Mayıs 2026: cleanup sonrası callback/interval guard
        const addMessage = (msg) => {
            if (!msg?.id || cleaned) return;
            setQuoteChatMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; scrollToBottom(); return [...prev, msg]; });
        };
        let pollInterval = null;
        const startPolling = () => {
            if (pollInterval || cleaned) return;
            pollInterval = setInterval(async () => {
                const data = await fetchQuoteMessages(activeQuoteId).catch(() => null);
                if (cleaned || !data) return; // Enes Doğanay | 14 Mayıs 2026: stale async guard
                setQuoteChatMessages(prev => {
                    if (prev.length === data.length && prev.every((m, i) => m.id === data[i]?.id)) return prev;
                    scrollToBottom();
                    return data;
                });
            }, 10000);
        };
        const stopPolling = () => { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } };
        const channel = supabase.channel(`teklif-chat-${activeQuoteId}`)
            .on('broadcast', { event: 'new-message' }, ({ payload }) => addMessage(payload))
            .subscribe((status) => {
                // Enes Doğanay | 14 Mayıs 2026: cleaned guard — removeChannel tetiklediği CLOSED callback'ini yakalar
                if (cleaned) return;
                if (status === 'SUBSCRIBED') stopPolling();
                else startPolling();
            });
        quoteChatChannelRef.current = channel;
        return () => {
            cleaned = true; // Enes Doğanay | 14 Mayıs 2026: önce flag, sonra removeChannel — sıra önemli
            stopPolling();
            supabase.removeChannel(channel);
            quoteChatChannelRef.current = null;
        };
    }, [activeQuoteId, scrollToBottom]);

    // Enes Doğanay | 7 Mayıs 2026: Bağlantı restore → mesajları yeniden yükle
    useEffect(() => {
        if (!activeQuoteId) return undefined;
        return onSupabaseConnectionEvent(({ status }) => {
            if (status === 'restored') openQuoteChat(activeQuoteId).catch(() => {});
        });
    }, [activeQuoteId]); // eslint-disable-line react-hooks/exhaustive-deps

    const openQuoteChat = useCallback(async (quoteId) => {
        setActiveQuoteId(quoteId);
        latestQuoteIdRef.current = quoteId; // Enes Doğanay | 14 Mayıs 2026: race guard
        setQuoteChatLoading(true);
        setQuoteChatInput('');
        if (userId) {
            markQuoteNotificationsRead(userId, quoteId).then(() => {
                refreshCounts();
                setNotifications(prev => prev.map(n =>
                    (!n.is_read && (n.type === 'quote_reply' || n.type === 'quote_message') && n.metadata?.teklif_id === quoteId)
                        ? { ...n, is_read: true } : n
                ));
            });
        }
        try {
            const data = await fetchQuoteMessages(quoteId);
            // Enes Doğanay | 14 Mayıs 2026: Stale fetch guard — fetch sürerken başka teklif açıldıysa yoksay
            if (latestQuoteIdRef.current !== quoteId) return;
            setQuoteChatMessages(data);
            scrollToBottom(false);
        } catch { setQuoteChatMessages([]); }
        finally {
            // Enes Doğanay | 14 Mayıs 2026: Sadece bu teklif hâlâ aktifse loading kapat
            if (latestQuoteIdRef.current === quoteId) setQuoteChatLoading(false);
        }
    }, [userId, scrollToBottom, refreshCounts, setNotifications, setActiveQuoteId]);

    const sendQuoteChatMessage = useCallback(async () => {
        if (!quoteChatInput.trim() || !activeQuoteId || !userId || quoteChatSending) return;
        const text = quoteChatInput.trim();
        // Enes Doğanay | 16 Mayıs 2026: İçerik moderasyonu
        if (containsProfanity(text)) throw new Error(PROFANITY_ERROR_MSG);
        setQuoteChatSending(true);
        try {
            const data = await sendQuoteMessageService(activeQuoteId, userId, text);
            setQuoteChatMessages(prev => [...prev, data]);
            setQuoteChatInput('');
            quoteChatChannelRef.current?.send({ type: 'broadcast', event: 'new-message', payload: data }).catch(() => {});
            setMyQuotes(prev => prev.map(q => q.id === activeQuoteId ? { ...q, _displayStatus: 'awaiting_reply' } : q));
            scrollToBottom();
        } catch {
            setQuoteChatInput(text);
        } finally {
            setQuoteChatSending(false);
        }
    }, [quoteChatInput, activeQuoteId, userId, quoteChatSending, scrollToBottom, setMyQuotes]);

    // Enes Doğanay | 1 Haziran 2026: Kullanıcı chat'ten dosya + opsiyonel metin gönderebilsin
    const handleSendFileMessage = useCallback(async (file, message) => {
        if (!activeQuoteId || !userId || quoteChatSending) return;
        setQuoteChatSending(true);
        try {
            const data = await sendQuoteChatMessageWithFile({ quoteId: activeQuoteId, userId, file, message });
            setQuoteChatMessages(prev => [...prev, data]);
            quoteChatChannelRef.current?.send({ type: 'broadcast', event: 'new-message', payload: data }).catch(() => {});
            setMyQuotes(prev => prev.map(q => q.id === activeQuoteId ? { ...q, _displayStatus: 'awaiting_reply' } : q));
            scrollToBottom();
        } finally {
            setQuoteChatSending(false);
        }
    }, [activeQuoteId, userId, quoteChatSending, scrollToBottom, setMyQuotes]);

    return {
        quoteChatMessages, quoteChatLoading, quoteChatInput, setQuoteChatInput,
        quoteChatSending, quoteChatEndRef, openQuoteChat, sendQuoteChatMessage,
        handleSendFileMessage,
    };
};

export default useQuoteChat;
