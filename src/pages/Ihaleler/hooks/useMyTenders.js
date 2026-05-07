// Enes Doğanay | 7 Mayıs 2026: Kurumsal ihale yönetimi hook — CRUD, kapat, toast
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { getManagedCompanyId } from '../../../services/companyManagementApi';
import { listMyTenders, updateTender, deleteTender } from '../../../services/ihaleManagementApi';
import { fetchFirmaAuthStatus, generateTenderRefNo } from '../services/myTendersService';

const useMyTenders = ({ fetchPublicTenders }) => {
    const [managedFirmaId, setManagedFirmaId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isVerifiedUser, setIsVerifiedUser] = useState(false);
    const [myTenders, setMyTenders] = useState([]);
    const [myTendersLoading, setMyTendersLoading] = useState(false);
    const [myTendersExpanded, setMyTendersExpanded] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [closeConfirmId, setCloseConfirmId] = useState(null);
    const [closeVisibilityPopup, setCloseVisibilityPopup] = useState(null);
    const [closingTenderId, setClosingTenderId] = useState(null);
    const [ihToast, setIhToast] = useState(null);
    const ihToastTimerRef = useRef(null);

    const showIhToast = (type, message) => {
        if (ihToastTimerRef.current) clearTimeout(ihToastTimerRef.current);
        setIhToast({ type, message });
        ihToastTimerRef.current = setTimeout(() => setIhToast(null), 3800);
    };

    useEffect(() => {
        getManagedCompanyId().then(async (id) => {
            setManagedFirmaId(id || null);
            if (!id) return;
            // Enes Doğanay | 7 Mayıs 2026: auth.getSession kabul edilebilir hook içinde
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            if (!userId) return;
            const { isVerified, isOwner: ownerFlag } = await fetchFirmaAuthStatus(id, userId);
            setIsVerifiedUser(isVerified);
            setIsOwner(ownerFlag);
        }).catch(() => {});
    }, []);

    const fetchMyTenders = useCallback(async () => {
        if (!managedFirmaId) return;
        setMyTendersLoading(true);
        try { setMyTenders(await listMyTenders()); }
        catch { setMyTenders([]); }
        finally { setMyTendersLoading(false); }
    }, [managedFirmaId]);

    useEffect(() => { fetchMyTenders(); }, [fetchMyTenders]);

    const generateReferansNo = useCallback(async () => {
        return managedFirmaId ? generateTenderRefNo(managedFirmaId).catch(() => '') : '';
    }, [managedFirmaId]);

    const handleDelete = async (id) => {
        try {
            await deleteTender(id);
            setDeleteConfirmId(null);
            await fetchMyTenders();
            await fetchPublicTenders();
        } catch (err) { showIhToast('error', err.message || 'Silinemedi.'); }
    };

    const handleCloseTender = async (id, gorunurluk) => {
        setClosingTenderId(id);
        try {
            const tender = myTenders.find(t => t.id === id);
            if (!tender) throw new Error('İhale bulunamadı.');
            await updateTender(id, {
                baslik: tender.baslik, aciklama: tender.aciklama || '', ihale_tipi: tender.ihale_tipi || 'Açık İhale',
                kdv_durumu: tender.kdv_durumu || 'haric', yayin_tarihi: tender.yayin_tarihi || '',
                son_basvuru_tarihi: tender.son_basvuru_tarihi || '', teslim_suresi: tender.teslim_suresi || '',
                teslim_il: tender.teslim_il || '', teslim_ilce: tender.teslim_ilce || '',
                referans_no: tender.referans_no || '', gereksinimler: tender.gereksinimler || null,
                davet_emailleri: tender.davet_emailleri || null, davetli_firmalar: tender.davetli_firmalar || null,
                ek_dosyalar: tender.ek_dosyalar || null, durum: 'kapali', kapali_gorunurluk: gorunurluk || 'gizle',
            });
            setCloseConfirmId(null); setCloseVisibilityPopup(null);
            await fetchMyTenders(); await fetchPublicTenders();
        } catch (err) { showIhToast('error', err.message || 'İhale kapatılamadı.'); }
        finally { setClosingTenderId(null); }
    };

    return {
        managedFirmaId, isOwner, isVerifiedUser,
        myTenders, myTendersLoading, myTendersExpanded, setMyTendersExpanded,
        deleteConfirmId, setDeleteConfirmId, closeConfirmId, setCloseConfirmId,
        closeVisibilityPopup, setCloseVisibilityPopup, closingTenderId,
        ihToast, setIhToast, showIhToast,
        fetchMyTenders, generateReferansNo, handleDelete, handleCloseTender,
    };
};

export default useMyTenders;
