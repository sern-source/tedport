// Enes Doğanay | 7 Mayıs 2026: Teklif mutasyon hook'u — gönder, taslak sil, geri çek
// useTeklifActions'tan ayrıştırılan submit/delete/withdraw logic
import {
    uploadTeklifDosya, submitTeklif, sendTeklifNotification,
    deleteDraftTeklif, withdrawTeklif, getAuthSession,
} from '../services/teklifFormService';
import { containsProfanity, PROFANITY_ERROR_MSG } from '../../../utils/contentModeration';

const useTeklifSubmitActions = ({ formState, userOffers, setUserOffers, authManagedCompanyId, managedCompanyName, userProfile }) => {
    const {
        teklifTender, setTeklifTender,
        teklifForm, teklifDosya,
        setTeklifSaving, setTeklifError, setTeklifSuccess,
        setWithdrawing, setWithdrawConfirm,
        setDraftDeleting, setDraftDeleteConfirm,
        getTeklifGenelToplam,
    } = formState;

    // Enes Doğanay | 8 Mayıs 2026: Teklif gönder / taslak kaydet
    const handleTeklifSubmit = async (isDraft = false) => {
        setTeklifSaving(true);
        setTeklifError('');
        try {
            // Enes Doğanay | 8 Mayıs 2026: auth servis katmanından alınır
            const session = await getAuthSession();
            if (!session?.user) { setTeklifError('Teklif vermek için giriş yapmanız gerekiyor.'); return; }
            if (!isDraft) {
                if (teklifForm.kalemler.length > 0) {
                    const emptyKalem = teklifForm.kalemler.find(k => !k.birim_fiyat || parseFloat(k.birim_fiyat) <= 0);
                    if (emptyKalem) { setTeklifError('Tüm kalemlerin birim fiyatı girilmelidir.'); return; }
                } else if (!teklifForm.genel_toplam || parseFloat(teklifForm.genel_toplam) <= 0) {
                    setTeklifError('Teklif tutarı girilmelidir.'); return;
                }
                if (!teklifForm.teslim_suresi_gun) { setTeklifError('Tahmini teslim süresini belirtin.'); return; }
            }
            // Enes Doğanay | 16 Mayıs 2026: İçerik moderasyonu — kalem açıklamaları, not ve teslim açıklaması
            const profaneKalem = teklifForm.kalemler.find(k => k.aciklama && containsProfanity(k.aciklama));
            if (profaneKalem) { setTeklifError(PROFANITY_ERROR_MSG); return; }
            if (teklifForm.not && containsProfanity(teklifForm.not)) { setTeklifError(PROFANITY_ERROR_MSG); return; }
            if (teklifForm.teslim_aciklamasi && containsProfanity(teklifForm.teslim_aciklamasi)) { setTeklifError(PROFANITY_ERROR_MSG); return; }
            let dosyaPath = null, dosyaAdi = null;
            if (teklifDosya) {
                const result = await uploadTeklifDosya(session.user.id, teklifDosya);
                dosyaPath = result.path; dosyaAdi = result.name;
            }
            const existingOffer = userOffers[String(teklifTender.id)];
            const isUpdate = !!existingOffer;
            const savedOffer = await submitTeklif({ session, teklifForm, teklifTender, existingOffer, authManagedCompanyId, managedCompanyName, userProfile, dosyaPath, dosyaAdi, getTeklifGenelToplam, isDraft });
            if (savedOffer) setUserOffers(prev => ({ ...prev, [String(teklifTender.id)]: savedOffer }));
            await sendTeklifNotification({ teklifTender, session, existingOffer, isDraft, isUpdate });
            setTeklifTender(null);
            if (isDraft) {
                setTeklifSuccess('draft');
            } else {
                const isDraftToSubmit = isUpdate && existingOffer?.durum === 'taslak';
                setTeklifSuccess(isDraftToSubmit ? true : (isUpdate ? 'update' : true));
            }
            setTimeout(() => setTeklifSuccess(false), 4500);
        } catch (err) {
            setTeklifError(err.message || 'Teklif gönderilemedi.');
        } finally {
            setTeklifSaving(false);
        }
    };

    // Enes Doğanay | 7 Mayıs 2026: Taslağı sil
    const handleDeleteDraft = async () => {
        if (!teklifTender) return;
        const existing = userOffers[String(teklifTender.id)];
        if (!existing || existing.durum !== 'taslak') return;
        setDraftDeleting(true);
        try {
            await deleteDraftTeklif(existing.id);
            setUserOffers(prev => { const next = { ...prev }; delete next[String(teklifTender.id)]; return next; });
            setTeklifTender(null);
            setDraftDeleteConfirm(false);
            setTeklifSuccess('draft_deleted');
            setTimeout(() => setTeklifSuccess(false), 4500);
        } catch (err) {
            setTeklifError(err.message || 'Taslak silinemedi.');
        } finally {
            setDraftDeleting(false);
        }
    };

    // Enes Doğanay | 7 Mayıs 2026: Teklifi geri çek
    const handleWithdrawOffer = async () => {
        if (!teklifTender) return;
        const existing = userOffers[String(teklifTender.id)];
        if (!existing) return;
        setWithdrawing(true);
        try {
            await withdrawTeklif({ offerId: existing.id, teklifTender, userProfile });
            setUserOffers(prev => { const next = { ...prev }; delete next[String(teklifTender.id)]; return next; });
            setTeklifTender(null);
            setWithdrawConfirm(false);
            setTeklifSuccess('withdrawn');
            setTimeout(() => setTeklifSuccess(false), 4500);
        } catch (err) {
            setTeklifError(err.message || 'Teklif geri çekilemedi.');
        } finally {
            setWithdrawing(false);
        }
    };

    return { handleTeklifSubmit, handleDeleteDraft, handleWithdrawOffer };
};

export default useTeklifSubmitActions;
