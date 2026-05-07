// Enes Doğanay | 7 Mayıs 2026: Teklif talepleri hook — liste, filtre, sil, şikayet (chat → useQuoteChat)
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    fetchAndEnrichQuotes, deleteQuoteService, submitMessageReportService,
} from '../services/quotesService';
import useQuoteChat from './useQuoteChat';

const STATUS_PRIORITY = { replied: 1, awaiting_reply: 1, read: 1, pending: 2, rejected: 3, closed: 3 };

export const useQuotes = (userId, setActiveViewingTeklifId, notifications, setNotifications, refreshCounts) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [myQuotes, setMyQuotes] = useState([]);
    const [myQuotesLoading, setMyQuotesLoading] = useState(true);
    const [activeQuoteId, setActiveQuoteId] = useState(null);
    const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');
    const [quoteCurrentPage, setQuoteCurrentPage] = useState(1);
    const [confirmDeleteQuoteId, setConfirmDeleteQuoteId] = useState(null);
    const [reportModal, setReportModal] = useState(null);
    const [reportSending, setReportSending] = useState(false);
    const [reportNeden, setReportNeden] = useState('spam');
    const [reportAciklama, setReportAciklama] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);

    // Enes Doğanay | 7 Mayıs 2026: Chat logic ayrı hook'a taşındı
    const chatData = useQuoteChat({ activeQuoteId, setActiveQuoteId, userId, refreshCounts, setNotifications, setMyQuotes });

    const loadQuotes = useCallback(async () => {
        if (!userId) return;
        // Enes Doğanay | 7 Mayıs 2026: try/catch zorunlu — AbortError veya ağ hatası session'u
        // bozmaması için sessizce geçilir (realtime zaten canlı mesajı yakalar)
        try {
            const enriched = await fetchAndEnrichQuotes(userId);
            setMyQuotes(prev => {
                if (prev.length === enriched.length && prev.every((q, i) => q.id === enriched[i]?.id && q._displayStatus === enriched[i]?._displayStatus)) return prev;
                return enriched;
            });
        } catch (err) {
            if (err?.name !== 'AbortError' && !err?.message?.includes('abort')) console.warn('[useQuotes] loadQuotes hatası:', err);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        loadQuotes().then(() => setMyQuotesLoading(false)).catch(() => setMyQuotesLoading(false));
        // Enes Doğanay | 7 Mayıs 2026: 30sn — realtime anlık günceller, polling sadece fallback
        const interval = setInterval(loadQuotes, 30000);
        return () => clearInterval(interval);
    }, [userId, loadQuotes]);

    // Enes Doğanay | 7 Mayıs 2026: URL param → chat aç
    useEffect(() => {
        const urlTeklifId = searchParams.get('teklif_id');
        if (!urlTeklifId || myQuotesLoading) return;
        const tid = parseInt(urlTeklifId, 10);
        if (isNaN(tid)) return;
        const next = new URLSearchParams(searchParams);
        next.delete('teklif_id');
        setSearchParams(next, { replace: true });
        setTimeout(() => chatData.openQuoteChat(tid), 200);
    }, [searchParams.get('teklif_id'), myQuotesLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setActiveViewingTeklifId(activeQuoteId || null);
        return () => setActiveViewingTeklifId(null);
    }, [activeQuoteId, setActiveViewingTeklifId]);

    const handleDeleteQuote = useCallback(async (quoteId) => {
        const quote = myQuotes.find(q => q.id === quoteId);
        await deleteQuoteService(quoteId, quote?.ek_dosya_url);
        setMyQuotes(prev => prev.filter(q => q.id !== quoteId));
        if (activeQuoteId === quoteId) setActiveQuoteId(null);
        setConfirmDeleteQuoteId(null);
    }, [myQuotes, activeQuoteId]);

    const submitReport = useCallback(async () => {
        if (!reportModal || reportSending || !userId) return;
        setReportSending(true);
        try {
            await submitMessageReportService({ userId, mesajId: reportModal.mesajId, mesajIcerik: reportModal.mesajIcerik, neden: reportNeden, aciklama: reportAciklama });
            setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3500);
        } finally { setReportSending(false); setReportModal(null); setReportNeden('spam'); setReportAciklama(''); }
    }, [reportModal, reportSending, userId, reportNeden, reportAciklama]);

    const getFilteredSortedQuotes = useCallback((unreadQuoteIds) => {
        const filtered = quoteStatusFilter === 'all' ? myQuotes : myQuotes.filter(q => (q._displayStatus || q.durum) === quoteStatusFilter);
        return filtered.slice().sort((a, b) => {
            const aU = unreadQuoteIds.has(a.id) ? 0 : 1; const bU = unreadQuoteIds.has(b.id) ? 0 : 1;
            if (aU !== bU) return aU - bU;
            const aP = STATUS_PRIORITY[a._displayStatus || a.durum] ?? 2; const bP = STATUS_PRIORITY[b._displayStatus || b.durum] ?? 2;
            if (aP !== bP) return aP - bP;
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [myQuotes, quoteStatusFilter]);

    return {
        myQuotes, myQuotesLoading, activeQuoteId, setActiveQuoteId, quoteStatusFilter, setQuoteStatusFilter,
        quoteCurrentPage, setQuoteCurrentPage, confirmDeleteQuoteId, setConfirmDeleteQuoteId,
        reportModal, setReportModal, reportSending, reportNeden, setReportNeden, reportAciklama, setReportAciklama, reportSuccess,
        handleDeleteQuote, submitReport, getFilteredSortedQuotes,
        ...chatData,
    };
};
