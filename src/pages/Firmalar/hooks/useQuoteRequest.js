// Enes Doğanay | 6 Mayıs 2026: Teklif talebi modal state + gönderim mantığı
import { useState, useEffect } from 'react';
import { sendQuoteRequest, fetchUserProfile, fetchCurrentSession } from '../services/firmaService';

// Enes Doğanay | 14 Mayıs 2026: miktar/birim kaldırıldı — kalemler dizisiyle yönetiliyor
const EMPTY_FORM = { konu: '', mesaj: '', kalemler: [], teslim_tarihi: '', teslim_yeri: '' };

export const useQuoteRequest = (onError) => {
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [quoteForm, setQuoteForm] = useState(EMPTY_FORM);
  const [quoteFile, setQuoteFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!activeSupplier) return;
    fetchCurrentSession().then(session => {
      if (!session?.user) return;
      setUserId(session.user.id);
      fetchUserProfile(session.user.id)
        .then(setUserProfile)
        .catch(() => fetchCurrentSession().then(s => setUserProfile({ email: s?.user?.email })));
    });
  }, [activeSupplier]);

  const openModal = (supplier) => {
    setActiveSupplier(supplier);
    setQuoteForm(EMPTY_FORM);
    setQuoteFile(null);
    setSent(false);
  };

  const closeModal = () => {
    setActiveSupplier(null);
    setQuoteForm(EMPTY_FORM);
    setQuoteFile(null);
    setSent(false);
  };

  const setField = (key, val) => setQuoteForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!quoteForm.konu.trim() || !quoteForm.mesaj.trim() || !activeSupplier || !userId) return;
    setSending(true);
    try {
      await sendQuoteRequest({ supplier: activeSupplier, form: quoteForm, file: quoteFile, userId, userProfile });
      setSent(true);
      setTimeout(closeModal, 2000);
    } catch (err) {
      onError(err.message || 'Teklif talebi gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  return {
    activeSupplier, quoteForm, quoteFile, setQuoteFile,
    sending, sent, userProfile,
    openModal, closeModal, setField, handleSubmit,
  };
};
