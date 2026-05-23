// Enes Doğanay | 23 Mayıs 2026: Teklif talebi formu state'i — useFirmaDetay'dan ayrıştırıldı
import { useState } from 'react';

const EMPTY_QUOTE_FORM = { konu: '', mesaj: '', kalemler: [], teslim_tarihi: '', teslim_yeri: '' };

export function useQuoteFormState() {
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteForm, setQuoteFormInternal] = useState(EMPTY_QUOTE_FORM);
    const [quoteSending, setQuoteSending] = useState(false);
    const [quoteSent, setQuoteSent] = useState(false);
    const [quoteFile, setQuoteFile] = useState(null);
    const [fdQuoteFieldError, setFdQuoteFieldError] = useState({ key: '', msg: '' });

    const setQuoteField = (field, value) => {
        setQuoteFormInternal(prev => ({ ...prev, [field]: value }));
        setFdQuoteFieldError(fe => fe.key === field ? { key: '', msg: '' } : fe);
    };

    const resetQuoteForm = () => {
        setQuoteFormInternal(EMPTY_QUOTE_FORM);
        setQuoteFile(null);
        setFdQuoteFieldError({ key: '', msg: '' });
    };

    return {
        showQuoteModal, setShowQuoteModal,
        quoteForm, setQuoteField,
        quoteSending, setQuoteSending,
        quoteSent, setQuoteSent,
        quoteFile, setQuoteFile,
        fdQuoteFieldError, setFdQuoteFieldError,
        resetQuoteForm,
    };
}
