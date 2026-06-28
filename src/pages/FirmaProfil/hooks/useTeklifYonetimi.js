// Enes Doğanay | 7 Mayıs 2026: Teklif yönetimi koordinatör — useTeklifChat sub-hook + liste/polling/handlers
import { useState, useEffect, useCallback } from 'react';
import {
    fetchQuotesInitial, fetchQuotesPoll, updateQuoteStatus,
    deleteQuote, submitMesajSikayet, fetchQuoteContact,
} from '../services/teklifService';
import { useTeklifChat } from './useTeklifChat';

export const useTeklifYonetimi = ({ companyId, userId, notifications, setNotifications, setActiveViewingTeklifId, refreshCounts, searchParams, setSearchParams, currentTab, showFpToast }) => {
    const [incomingQuotes, setIncomingQuotes] = useState([]);
    const [outgoingQuotes, setOutgoingQuotes] = useState([]);
    const [quotesLoading, setQuotesLoading] = useState(true);
    const [quotesTab, setQuotesTab] = useState('incoming');
    const [statusFilter, setStatusFilter] = useState('all');
    const [outStatusFilter, setOutStatusFilter] = useState('all');
    const [confirmRejectQuoteId, setConfirmRejectQuoteId] = useState(null);
    const [confirmCloseQuoteId, setConfirmCloseQuoteId] = useState(null);
    const [confirmDeleteQuoteId, setConfirmDeleteQuoteId] = useState(null);
    const [reportModal, setReportModal] = useState(null);
    const [reportSending, setReportSending] = useState(false);
    const [reportNeden, setReportNeden] = useState('spam');
    const [reportAciklama, setReportAciklama] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);
    const [quoteContactPopup, setQuoteContactPopup] = useState(null);
    const [qCopied, setQCopied] = useState(null);

    const chat = useTeklifChat({ incomingQuotes, setIncomingQuotes, setOutgoingQuotes, notifications, setNotifications, refreshCounts, userId, companyId, showFpToast, setActiveViewingTeklifId, currentTab });

    // Enes Doğanay | 7 Mayıs 2026: İlk yükleme
    useEffect(() => {
        if (!companyId) return;
        setQuotesLoading(true);
        fetchQuotesInitial(companyId)
            .then(({ incoming, outgoing }) => { setIncomingQuotes(incoming); setOutgoingQuotes(outgoing); setQuotesLoading(false); })
            .catch(() => setQuotesLoading(false));
    }, [companyId]);

    // Enes Doğanay | 7 Mayıs 2026: URL teklif_id param — toast tıklamasından chat aç
    useEffect(() => {
        const urlTeklifId = searchParams.get('teklif_id');
        if (!urlTeklifId || quotesLoading) return;
        const tid = parseInt(urlTeklifId, 10);
        if (Number.isNaN(tid)) return;
        const target = [...incomingQuotes, ...outgoingQuotes].find(q => q.id === tid);
        if (!target) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('teklif_id'); setSearchParams(newParams, { replace: true });
        setTimeout(() => chat.handleOpenQuoteChat(target), 200);
    }, [searchParams, quotesLoading, incomingQuotes, outgoingQuotes]); // eslint-disable-line react-hooks/exhaustive-deps

    // Enes Doğanay | 7 Mayıs 2026: 5 sn polling — _displayStatus güncelle
    useEffect(() => {
        if (!companyId) return;
        const poll = async () => {
            try {
                const { incoming, outgoing } = await fetchQuotesPoll(companyId);
                setIncomingQuotes(prev => { if (prev.length === incoming.length && prev.every((q, i) => q.id === incoming[i]?.id && q._displayStatus === incoming[i]?._displayStatus)) return prev; return incoming; });
                setOutgoingQuotes(prev => { if (prev.length === outgoing.length && prev.every((q, i) => q.id === outgoing[i]?.id && q._displayStatus === outgoing[i]?._displayStatus)) return prev; return outgoing; });
                chat.setActiveQuoteChat(prev => { if (!prev) return null; const up = [...incoming, ...outgoing].find(q => q.id === prev.id); return (up && up._displayStatus !== prev._displayStatus) ? { ...prev, _displayStatus: up._displayStatus } : prev; });
            } catch (err) { showFpToast?.('error', err.message || 'Teklifler güncellenemedi.'); }
        };
        // Enes Doğanay | 28 Haziran 2026: Realtime zaten aktif — interval 5s yerine 30s fallback olarak yeterli
        const interval = setInterval(poll, 30000);
        return () => clearInterval(interval);
    }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleQuoteStatusChange = useCallback(async (quoteId, newStatus) => {
        try {
            await updateQuoteStatus(quoteId, newStatus);
            const updater = prev => prev.map(q => q.id === quoteId ? { ...q, durum: newStatus, _displayStatus: newStatus } : q);
            setIncomingQuotes(updater); setOutgoingQuotes(updater);
            chat.setActiveQuoteChat(prev => prev?.id === quoteId ? { ...prev, durum: newStatus, _displayStatus: newStatus } : prev);
            setConfirmRejectQuoteId(null); setConfirmCloseQuoteId(null);
        } catch (err) { showFpToast?.('error', err.message || 'Durum güncellenemedi.'); }
    }, [showFpToast, chat]);

    const handleDeleteQuote = useCallback(async (quoteId, isIncoming) => {
        const list = isIncoming ? incomingQuotes : outgoingQuotes;
        const quote = list.find(q => q.id === quoteId);
        try {
            await deleteQuote(quoteId, quote?.ek_dosya_url);
            if (isIncoming) setIncomingQuotes(prev => prev.filter(q => q.id !== quoteId));
            else setOutgoingQuotes(prev => prev.filter(q => q.id !== quoteId));
            if (chat.activeQuoteChat?.id === quoteId) chat.setActiveQuoteChat(null);
            setConfirmDeleteQuoteId(null);
        } catch (err) { showFpToast?.('error', err.message || 'Teklif silinemedi.'); }
    }, [incomingQuotes, outgoingQuotes, chat, showFpToast]);

    const handleOpenQuoteContact = useCallback(async (quote) => {
        try { const info = await fetchQuoteContact(quote); setQuoteContactPopup(info); }
        catch (err) { showFpToast?.('error', err.message || 'İletişim bilgisi alınamadı.'); }
    }, [showFpToast]);

    const handleSubmitReport = useCallback(async () => {
        if (!reportModal || reportSending || !userId) return;
        setReportSending(true);
        try {
            await submitMesajSikayet({ reporterId: userId, mesajId: reportModal.mesajId, kaynak: 'teklif_talebi', mesajIcerik: reportModal.mesajIcerik, neden: reportNeden, aciklama: reportAciklama });
            setReportModal(null); setReportNeden('spam'); setReportAciklama(''); setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3500);
        } catch (err) { showFpToast?.('error', err.message || 'Şikayet gönderilemedi.'); }
        finally { setReportSending(false); }
    }, [reportModal, reportSending, userId, reportNeden, reportAciklama, showFpToast]);

    return {
        incomingQuotes, outgoingQuotes, quotesLoading,
        quotesTab, setQuotesTab, statusFilter, setStatusFilter, outStatusFilter, setOutStatusFilter,
        confirmRejectQuoteId, setConfirmRejectQuoteId, confirmCloseQuoteId, setConfirmCloseQuoteId,
        confirmDeleteQuoteId, setConfirmDeleteQuoteId,
        reportModal, setReportModal, reportSending, reportNeden, setReportNeden,
        reportAciklama, setReportAciklama, reportSuccess,
        quoteContactPopup, setQuoteContactPopup, qCopied, setQCopied,
        handleQuoteStatusChange, handleDeleteQuote, handleOpenQuoteContact, handleSubmitReport,
        ...chat,
    };
};
