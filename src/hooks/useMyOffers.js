// Enes Doğanay | 7 Mayıs 2026: useMyOffers koordinatör — liste, filtre, silme, rapor + useMopChat
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../AuthContext';
import { fetchMyOffers, fetchUnreadCounts, fetchFirmaContact, submitMessageReport } from '../services/myOffersService';
import { useMopChat } from './useMopChat';

// Enes Doğanay | 7 Mayıs 2026: Teklif durum sabitleri
const STATUS_MAP = {
    gonderildi: { label: 'Değerlendiriliyor', tone: 'review',   icon: 'hourglass_top' },
    kabul:      { label: 'Kabul Edildi',      tone: 'accepted', icon: 'check_circle' },
    red:        { label: 'Reddedildi',        tone: 'rejected', icon: 'cancel' },
    taslak:     { label: 'Taslak',            tone: 'draft',    icon: 'edit_note' },
};
export const getStatus = (v) => STATUS_MAP[String(v || '').toLowerCase()] || STATUS_MAP.gonderildi;

const TENDER_STATUS_MAP = {
    canli: { label: 'Aktif', tone: 'active' }, active: { label: 'Aktif', tone: 'active' },
    kapali: { label: 'Kapandı', tone: 'closed' }, closed: { label: 'Kapandı', tone: 'closed' },
    iptal: { label: 'İptal', tone: 'cancelled' }, cancelled: { label: 'İptal', tone: 'cancelled' },
    taslak: { label: 'Taslak', tone: 'draft' }, draft: { label: 'Taslak', tone: 'draft' },
};
export const getTenderStatus = (v) => TENDER_STATUS_MAP[String(v || '').toLowerCase()] || { label: 'Bilinmiyor', tone: 'unknown' };

const MOP_PAGE_SIZE = 10;

export function useMyOffers({ userId, companyId, mopChatTrigger, onChatOpened, onUnreadCountChange }) {
    const { getUserId, userProfile, setActiveViewingTeklifId, refreshCounts } = useAuth() || {};

    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [tenderMap, setTenderMap] = useState({});
    const [firmaMap, setFirmaMap] = useState({});
    // Enes Doğanay | 7 Mayıs 2026: Firma logo URL haritası — chat avatarsı için
    const [firmaLogoMap, setFirmaLogoMap] = useState({});
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const [highlightId, setHighlightId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [firmaContactPopup, setFirmaContactPopup] = useState(null);
    const [firmaContactLoading, setFirmaContactLoading] = useState(false);
    const [reportModal, setReportModal] = useState(null);
    const [reportSending, setReportSending] = useState(false);
    const [reportNeden, setReportNeden] = useState('spam');
    const [reportAciklama, setReportAciklama] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);
    const [mopToast, setMopToast] = useState(null);
    const highlightRef = useRef(null);
    const mopToastTimerRef = useRef(null);

    // Enes Doğanay | 8 Mayıs 2026: Unmount cleanup — pending toast timer'ı iptal et
    useEffect(() => {
        return () => {
            if (mopToastTimerRef.current) clearTimeout(mopToastTimerRef.current);
        };
    }, []);

    const showMopToast = useCallback((type, message) => {
        if (mopToastTimerRef.current) clearTimeout(mopToastTimerRef.current);
        setMopToast({ type, message });
        mopToastTimerRef.current = setTimeout(() => setMopToast(null), 3800);
    }, []);

    const chat = useMopChat({ offers, tenderMap, firmaMap, firmaLogoMap, userProfile, getUserId, setActiveViewingTeklifId, refreshCounts, loading, mopChatTrigger, onChatOpened, onUnreadCountChange });

    // Enes Doğanay | 7 Mayıs 2026: Veri yükleme
    useEffect(() => {
        if (!userId && !companyId) return;
        const load = async () => {
            setLoading(true);
            try {
                const { offers: myOffers, tenderMap: tMap, firmaMap: fMap, firmaLogoMap: fLogoMap } = await fetchMyOffers(userId, companyId);
                setOffers(myOffers); setTenderMap(tMap); setFirmaMap(fMap); setFirmaLogoMap(fLogoMap || {});
                if (myOffers.length > 0) {
                    const { counts, ids } = await fetchUnreadCounts(myOffers.map(o => o.id));
                    chat.setUnreadMopChatCounts(counts); chat.setUnreadMopChatIds(ids);
                }
            } catch { setOffers([]); }
            finally { setLoading(false); }
        };
        load();
    }, [userId, companyId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Enes Doğanay | 7 Mayıs 2026: sessionStorage highlight — ihale bildirimine tıklanınca
    useEffect(() => {
        if (loading || offers.length === 0) return;
        const hlIhale = sessionStorage.getItem('mop_highlight_ihale');
        if (!hlIhale) return;
        sessionStorage.removeItem('mop_highlight_ihale');
        const target = offers.find(o => String(o.ihale_id) === String(hlIhale));
        if (target) { setExpandedId(target.id); setHighlightId(target.id); setTimeout(() => setHighlightId(null), 4000); }
    }, [loading, offers]);

    useEffect(() => {
        if (highlightId && highlightRef.current) setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }, [highlightId]);

    const filtered = useMemo(() => {
        let list = [...offers];
        if (filter !== 'all') list = list.filter(o => String(o.durum || '').toLowerCase() === filter);
        if (search.trim()) {
            const q = search.trim().toLocaleLowerCase('tr-TR');
            list = list.filter(o => { const t = tenderMap[String(o.ihale_id)]; return (t?.baslik || '').toLocaleLowerCase('tr-TR').includes(q) || (t?.referans_no || '').toLocaleLowerCase('tr-TR').includes(q) || (firmaMap[String(t?.firma_id)] || '').toLocaleLowerCase('tr-TR').includes(q); });
        }
        list.sort((a, b) => { const aU = chat.unreadMopChatIds.has(a.id) ? 0 : 1; const bU = chat.unreadMopChatIds.has(b.id) ? 0 : 1; if (aU !== bU) return aU - bU; return new Date(b.created_at) - new Date(a.created_at); });
        return list;
    }, [offers, filter, search, tenderMap, firmaMap, chat.unreadMopChatIds]);

    const kpis = useMemo(() => ({ total: offers.length, review: offers.filter(o => getStatus(o.durum).tone === 'review').length, accepted: offers.filter(o => getStatus(o.durum).tone === 'accepted').length, rejected: offers.filter(o => getStatus(o.durum).tone === 'rejected').length }), [offers]);

    const pageCount = Math.ceil(filtered.length / MOP_PAGE_SIZE);
    const pagedOffers = filtered.slice((currentPage - 1) * MOP_PAGE_SIZE, currentPage * MOP_PAGE_SIZE);

    const handleDeleteOffer = useCallback(async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const { deleteOffer } = await import('../services/myOffersService');
            await deleteOffer(deleteConfirm.id);
            setOffers(prev => prev.filter(o => o.id !== deleteConfirm.id));
            if (expandedId === deleteConfirm.id) setExpandedId(null);
            setDeleteConfirm(null);
        } catch { showMopToast('error', 'Teklif silinirken bir hata oluştu.'); }
        finally { setDeleting(false); }
    }, [deleteConfirm, expandedId, showMopToast]);

    const handleOpenFirmaContact = useCallback(async (firmaId, firmaAdi) => {
        setFirmaContactLoading(true);
        try {
            const info = await fetchFirmaContact(firmaId);
            if (!info.firma && firmaAdi) info.firma = firmaAdi;
            setFirmaContactPopup(info);
        } catch { setFirmaContactPopup({ name: null, firma: firmaAdi || null, email: null, phone: null, firmaPhone: null, firmaEmail: null }); }
        finally { setFirmaContactLoading(false); }
    }, []);

    const handleSubmitReport = useCallback(async () => {
        if (!reportModal || reportSending) return;
        setReportSending(true);
        try {
            const reporterId = getUserId?.();
            if (!reporterId) return;
            await submitMessageReport({ reporterId, mesajId: reportModal.mesajId, mesajIcerik: reportModal.mesajIcerik, neden: reportNeden, aciklama: reportAciklama });
            setReportModal(null); setReportNeden('spam'); setReportAciklama(''); setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3500);
        } catch { /* sessiz */ }
        finally { setReportSending(false); }
    }, [reportModal, reportSending, reportNeden, reportAciklama, getUserId]);

    return {
        loading, offers, tenderMap, firmaMap, firmaLogoMap,
        filter, setFilter, search, setSearch,
        currentPage, setCurrentPage, pageCount, pagedOffers, MOP_PAGE_SIZE,
        expandedId, setExpandedId, highlightId, highlightRef,
        deleteConfirm, setDeleteConfirm, deleting, handleDeleteOffer,
        firmaContactPopup, setFirmaContactPopup, firmaContactLoading, handleOpenFirmaContact,
        reportModal, setReportModal, reportSending, reportNeden, setReportNeden,
        reportAciklama, setReportAciklama, reportSuccess, handleSubmitReport,
        mopToast, setMopToast, filtered, kpis,
        getStatus, getTenderStatus,
        ...chat,
    };
}
