// Enes Doğanay | 6 Mayıs 2026: İhale düzenleme/silme/kapatma aksiyonları
import { useState, useCallback } from 'react';
import * as ihaleService from '../services/ihaleService';
import { toDateInput } from '../constants/ihaleConstants';

const useIhaleTenderActions = ({ tenders, setTenders, setOffersByTender, offersByTender, selectedId, setSelectedId, companyId }) => {
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editReqState, setEditReqState] = useState({ madde: '', aciklama: '' });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [closeState, setCloseState] = useState({ tenderId: null, confirmId: null, visibilityPopupId: null });
    const [successState, setSuccessState] = useState({ editSaved: false, copiedLink: false });

    const notifyOfferSubmitters = useCallback(async (tender, type, title, message) => {
        const offers = offersByTender[String(tender.id)] || [];
        const uniqueUsers = [...new Set(offers.map(o => o.user_id).filter(Boolean))];
        if (!uniqueUsers.length) return;
        const rows = uniqueUsers.map(uid => ({ user_id: uid, type, title, message, firma_id: String(companyId), is_read: false, metadata: { ihale_id: tender.id, ihale_baslik: tender.baslik } }));
        await ihaleService.insertNotificationBulk(rows);
    }, [offersByTender, companyId]);

    const openEditModal = useCallback((tender) => {
        let teslimIl = tender.teslim_il || '';
        let teslimIlce = tender.teslim_ilce || '';
        if (!teslimIl && tender.il_ilce) { const parts = tender.il_ilce.split('/').map(s => s.trim()); teslimIl = parts[0] || ''; teslimIlce = parts[1] || ''; }
        setEditForm({ id: tender.id, baslik: tender.baslik || '', aciklama: tender.aciklama || '', ihale_tipi: tender.ihale_tipi || 'Açık İhale', kdv_durumu: tender.kdv_durumu || 'haric', yayin_tarihi: toDateInput(tender.yayin_tarihi), son_basvuru_tarihi: toDateInput(tender.son_basvuru_tarihi), teslim_suresi: tender.teslim_suresi || '', durum: tender.durum || 'canli', referans_no: tender.referans_no || '', teslim_il: teslimIl, teslim_ilce: teslimIlce, gereksinimler: tender.gereksinimler || [] });
        setEditError('');
        setEditReqState({ madde: '', aciklama: '' });
        setEditModal(true);
    }, []);

    const handleEditSave = useCallback(async () => {
        if (!editForm) return;
        if (!editForm.baslik.trim()) { setEditError('İhale başlığı zorunludur.'); return; }
        setEditSaving(true);
        setEditError('');
        try {
            const payload = { baslik: editForm.baslik, aciklama: editForm.aciklama, ihale_tipi: editForm.ihale_tipi, kdv_durumu: editForm.kdv_durumu, yayin_tarihi: editForm.yayin_tarihi, son_basvuru_tarihi: editForm.son_basvuru_tarihi, teslim_suresi: editForm.teslim_suresi, durum: editForm.durum, referans_no: editForm.referans_no, teslim_il: editForm.teslim_il, teslim_ilce: editForm.teslim_ilce, il_ilce: [editForm.teslim_il, editForm.teslim_ilce].filter(Boolean).join(' / '), gereksinimler: editForm.gereksinimler };
            await ihaleService.updateTender(editForm.id, payload);
            setTenders(prev => prev.map(t => t.id === editForm.id ? { ...t, ...payload } : t));
            setEditModal(false);
            const tender = tenders.find(t => t.id === editForm.id);
            if (tender) await notifyOfferSubmitters(tender, 'tender_updated', 'İhale bilgileri güncellendi', `"${editForm.baslik}" ihalesinin bilgileri güncellendi.`);
            setSuccessState(p => ({ ...p, editSaved: true }));
        } catch (err) {
            setEditError(err.message || 'Güncelleme başarısız.');
        } finally {
            setEditSaving(false);
        }
    }, [editForm, tenders, setTenders, notifyOfferSubmitters]);

    const addEditReq = useCallback(() => {
        if (!editReqState.madde.trim()) return;
        setEditForm(p => ({ ...p, gereksinimler: [...p.gereksinimler, { id: Date.now(), madde: editReqState.madde.trim(), aciklama: editReqState.aciklama.trim() }] }));
        setEditReqState({ madde: '', aciklama: '' });
    }, [editReqState]);

    const removeEditReq = useCallback((id) => setEditForm(p => ({ ...p, gereksinimler: p.gereksinimler.filter(g => g.id !== id) })), []);

    const handleDeleteTender = useCallback(async (id) => {
        try {
            const tender = tenders.find(t => t.id === id);
            await ihaleService.deleteTender(id);
            setDeleteConfirmId(null);
            if (tender) await notifyOfferSubmitters(tender, 'tender_cancelled', 'İhale iptal edildi', `"${tender.baslik}" ihalesi iptal edildi/silindi.`);
            setTenders(prev => prev.filter(t => t.id !== id));
            setOffersByTender(prev => { const n = { ...prev }; delete n[String(id)]; return n; });
            if (String(selectedId) === String(id)) setSelectedId(tenders.find(t => t.id !== id)?.id || null);
        } catch (err) {
            throw new Error(err.message || 'İhale silinemedi.');
        }
    }, [tenders, selectedId, setTenders, setOffersByTender, setSelectedId, notifyOfferSubmitters]);

    const handleCloseTender = useCallback(async (id, gorunurluk) => {
        setCloseState(p => ({ ...p, tenderId: id }));
        try {
            const tender = tenders.find(t => t.id === id);
            if (!tender) throw new Error('İhale bulunamadı.');
            await ihaleService.updateTender(id, { ...tender, durum: 'kapali', kapali_gorunurluk: gorunurluk || 'gizle', il_ilce: [tender.teslim_il, tender.teslim_ilce].filter(Boolean).join(' / ') });
            setTenders(prev => prev.map(t => t.id === id ? { ...t, durum: 'kapali', kapali_gorunurluk: gorunurluk || 'gizle' } : t));
            setCloseState({ tenderId: null, confirmId: null, visibilityPopupId: null });
            if (tender) await notifyOfferSubmitters(tender, 'tender_closed', 'İhale kapandı', `"${tender.baslik}" ihalesi kapanmıştır.`);
        } catch (err) {
            setCloseState(p => ({ ...p, tenderId: null }));
            throw new Error(err.message || 'İhale kapatılamadı.');
        }
    }, [tenders, setTenders, notifyOfferSubmitters]);

    return {
        editModal, setEditModal, editForm, setEditForm, editError, editSaving,
        editReqState, setEditReqState, deleteConfirmId, setDeleteConfirmId,
        closeState, setCloseState, successState, setSuccessState,
        openEditModal, handleEditSave, addEditReq, removeEditReq,
        handleDeleteTender, handleCloseTender,
    };
};

export default useIhaleTenderActions;
