// Enes Doğanay | 6 Mayıs 2026: Teklif durum modalleri — kabul/red/statü değişikliği + iletişim popup
import { useState, useCallback } from 'react';
import * as ihaleService from '../services/ihaleService';

const useIhaleOfferModals = ({ selectedId, selectedTender, rawOffers, companyId, setOffersByTender }) => {
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [statusDropdownId, setStatusDropdownId] = useState(null);
    const [statusConfirmPopup, setStatusConfirmPopup] = useState(null);
    const [statusSuccessModal, setStatusSuccessModal] = useState(null);
    const [rejectNoteState, setRejectNoteState] = useState({ offerId: null, note: '' });
    const [acceptClosePopup, setAcceptClosePopup] = useState(null);
    // Enes Doğanay | 6 Mayıs 2026: İletişim popup state gruplandı
    const [contactState, setContactState] = useState({ popup: null, loading: false, copiedField: null });

    const SUCCESS_MAP = {
        kabul: { icon: 'check_circle', title: 'Teklif Kabul Edildi', text: 'Teklif başarıyla kabul edildi. Teklif veren kişiye bildirim ve e-posta gönderildi.', color: '#059669' },
        red: { icon: 'cancel', title: 'Teklif Reddedildi', text: 'Teklif reddedildi. Teklif veren kişiye bildirim ve e-posta gönderildi.', color: '#dc2626' },
        gonderildi: { icon: 'hourglass_top', title: 'Değerlendirmeye Alındı', text: 'Teklif tekrar değerlendirmeye alındı.', color: '#2563eb' },
    };

    const updateStatus = useCallback(async (offerId, status, redNedeni) => {
        setStatusUpdating(offerId);
        try {
            await ihaleService.updateOfferStatus(offerId, status);
            setOffersByTender(prev => {
                const k = String(selectedId);
                return { ...prev, [k]: (prev[k] || []).map(o => o.id === offerId ? { ...o, durum: status } : o) };
            });
            const sm = SUCCESS_MAP[status];
            if (sm) setStatusSuccessModal(sm);
            const offer = rawOffers.find(o => o.id === offerId);
            if (offer?.user_id && selectedTender) {
                const statusLabel = status === 'kabul' ? 'kabul edildi' : status === 'red' ? 'reddedildi' : 'değerlendirmeye alındı';
                const message = redNedeni ? `"${selectedTender.baslik}" ihalesine verdiğiniz teklif ${statusLabel}. Red nedeni: ${redNedeni}` : `"${selectedTender.baslik}" ihalesine verdiğiniz teklif ${statusLabel}.`;
                ihaleService.insertNotification({ user_id: offer.user_id, type: 'tender_offer_status', title: `Teklifiniz ${statusLabel}`, message, firma_id: String(companyId), is_read: false, metadata: { ihale_id: selectedTender.id, ihale_baslik: selectedTender.baslik, teklif_id: offerId, durum: status, red_nedeni: redNedeni || null } });
                ihaleService.sendOfferStatusEmail(offer, status, selectedTender.baslik, selectedTender.id, redNedeni).catch(() => {});
            }
        } catch {
            // Hata sessiz — statusUpdating serbest bırakılır
        } finally {
            setStatusUpdating(null);
        }
    }, [selectedId, selectedTender, rawOffers, companyId, setOffersByTender]);

    const handleAcceptOffer = useCallback((offerId) => setAcceptClosePopup(offerId), []);
    const confirmAcceptOffer = useCallback(async (offerId, shouldClose) => { setAcceptClosePopup(null); await updateStatus(offerId, 'kabul'); return shouldClose; }, [updateStatus]);
    const handleRejectOffer = useCallback((offerId) => setRejectNoteState({ offerId, note: '' }), []);
    const confirmRejectOffer = useCallback(async () => { if (!rejectNoteState.offerId) return; await updateStatus(rejectNoteState.offerId, 'red', rejectNoteState.note.trim() || null); setRejectNoteState({ offerId: null, note: '' }); }, [rejectNoteState, updateStatus]);

    const openContact = useCallback(async (offer) => {
        setContactState({ popup: null, loading: true, copiedField: null });
        try {
            const info = await ihaleService.fetchContactInfo(offer);
            setContactState({ popup: info, loading: false, copiedField: null });
        } catch {
            setContactState({ popup: null, loading: false, copiedField: null });
        }
    }, []);

    const openFile = useCallback(async (offer) => {
        if (!offer?.ek_dosya_url) return;
        const signedUrl = await ihaleService.getTeklifFileSignedUrl(offer.ek_dosya_url).catch(() => null);
        if (signedUrl) window.open(signedUrl, '_blank', 'noopener,noreferrer');
    }, []);

    return {
        statusUpdating, statusDropdownId, setStatusDropdownId,
        statusConfirmPopup, setStatusConfirmPopup, statusSuccessModal, setStatusSuccessModal,
        rejectNoteState, setRejectNoteState, acceptClosePopup, setAcceptClosePopup,
        contactState, setContactState,
        updateStatus, handleAcceptOffer, confirmAcceptOffer, handleRejectOffer, confirmRejectOffer,
        openContact, openFile,
    };
};

export default useIhaleOfferModals;
