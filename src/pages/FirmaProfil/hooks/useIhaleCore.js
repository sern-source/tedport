// Enes Doğanay | 6 Mayıs 2026: İhale çekirdek state — yükleme, ihaleler, teklifler, filtreler, realtime
// Enes Doğanay | 13 Mayıs 2026: supabase doğrudan import kaldırıldı — subscribeToTenderOffers servise taşındı
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as ihaleService from '../services/ihaleService';
import { getTenderStatus, TOM_PAGE_SIZE } from '../constants/ihaleConstants';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';

const useIhaleCore = ({ companyId, refreshCounts }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tenders, setTenders] = useState([]);
    const [offersByTender, setOffersByTender] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [tenderSearch, setTenderSearch] = useState('');
    const [tenderFilter, setTenderFilter] = useState('all');
    const [tenderPage, setTenderPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    // Enes Doğanay | 6 Mayıs 2026: companyId yoksa yüklemeyi kapat
    useEffect(() => {
        if (!companyId) { setLoading(false); return; }
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                let rows = await ihaleService.listMyTenders();
                const ids = rows.map(t => t.id);
                const allOffers = await ihaleService.fetchTenderOffers(ids);
                const grouped = allOffers.reduce((a, o) => {
                    const k = String(o.ihale_id);
                    if (!a[k]) a[k] = [];
                    a[k].push(o);
                    return a;
                }, {});
                const now = new Date();
                const expiredIds = rows.filter(t => ['canli', 'active'].includes(String(t.durum).toLowerCase()) && t.son_basvuru_tarihi && new Date(t.son_basvuru_tarihi) < now).map(t => t.id);
                if (expiredIds.length) {
                    await ihaleService.closeExpiredTenders(expiredIds);
                    rows = rows.map(t => expiredIds.includes(t.id) ? { ...t, durum: 'kapali' } : t);
                }
                setTenders(rows);
                setOffersByTender(grouped);
            } catch {
                setError('Veriler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [companyId]);

    const reloadTenders = useCallback(async () => {
        const rows = await ihaleService.listMyTenders();
        setTenders(rows);
    }, []);

    // Enes Doğanay | 13 Mayıs 2026: Realtime — tenders array değişince kanal yeniden açılmasın
    // tenderIdKey: sıralı ID string — sadece yeni ihale eklenince/silinince değişir, data güncellemesinde değişmez
    const tenderIdKey = [...tenders].map(t => t.id).sort().join(',');
    useEffect(() => {
        if (!companyId || !tenderIdKey) return;
        const ids = tenderIdKey.split(',');
        return ihaleService.subscribeToTenderOffers(ids, {
            onInsert: (row) => setOffersByTender(prev => { const k = String(row.ihale_id); return { ...prev, [k]: [row, ...(prev[k] || [])] }; }),
            onUpdate: (row) => setOffersByTender(prev => { const k = String(row.ihale_id); return { ...prev, [k]: (prev[k] || []).map(o => String(o.id) === String(row.id) ? row : o) }; }),
            onDelete: (row) => setOffersByTender(prev => { const k = String(row.ihale_id); return { ...prev, [k]: (prev[k] || []).filter(o => String(o.id) !== String(row.id)) }; }),
        });
    }, [companyId, tenderIdKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Enes Doğanay | 22 Mayıs 2026: İhale seçilince bildirimlerini okundu yap
    useEffect(() => {
        if (!selectedId) return;
        ihaleService.markTenderOfferNotificationsRead(selectedId).then(() => refreshCounts?.());
    }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Enes Doğanay | 6 Mayıs 2026: Filtreli + sıralı ihale listesi
    const STATUS_ORDER = { active: 0, canli: 0, draft: 1, taslak: 1, closed: 2, kapali: 2, completed: 2, cancelled: 3, iptal: 3 };
    const filteredTenders = useMemo(() => {
        let list = [...tenders];
        if (tenderSearch) {
            const q = tenderSearch.toLowerCase();
            list = list.filter(t => (t.baslik || '').toLowerCase().includes(q) || (t.referans_no || '').toLowerCase().includes(q) || (t.aciklama || '').toLowerCase().includes(q));
        }
        // Enes Doğanay | 12 Mayıs 2026: Tüm filtreler için tarih temelli getTenderStatusMeta kullan
        if (tenderFilter !== 'all') list = list.filter(t => {
            const metaKey = getTenderStatusMeta(t).key;
            if (tenderFilter === 'active') return metaKey === 'canli';
            if (tenderFilter === 'yaklasan') return metaKey === 'yaklasan';
            if (tenderFilter === 'closed') return metaKey === 'kapali';
            if (tenderFilter === 'draft') return metaKey === 'draft';
            // Enes Doğanay | 13 Mayıs 2026: Tamamlandı filtresi — durum direkt eşleşir
            if (tenderFilter === 'tamamlandi') return t.durum === 'tamamlandi' || t.durum === 'completed';
            return getTenderStatus(t.durum).tone === tenderFilter;
        });
        list.sort((a, b) => {
            const aOrd = STATUS_ORDER[String(a.durum || '').toLowerCase()] ?? 2;
            const bOrd = STATUS_ORDER[String(b.durum || '').toLowerCase()] ?? 2;
            if (aOrd !== bOrd) return aOrd - bOrd;
            if (aOrd === 0 && a.son_basvuru_tarihi && b.son_basvuru_tarihi) return new Date(a.son_basvuru_tarihi) - new Date(b.son_basvuru_tarihi);
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
        return list;
    }, [tenders, tenderSearch, tenderFilter]);

    const selectedTender = useMemo(() => tenders.find(t => String(t.id) === String(selectedId)) || null, [tenders, selectedId]);

    // Enes Doğanay | 7 Mayıs 2026: Varsayılan seçim — filtrelere göre sıralı listenin ilk elemanı
    useEffect(() => {
        if (filteredTenders.length === 0) return;
        setSelectedId(prev => {
            if (prev && filteredTenders.some(t => String(t.id) === String(prev))) return prev;
            return filteredTenders[0].id;
        });
    }, [filteredTenders]); // eslint-disable-line react-hooks/exhaustive-deps

    const rawOffers = useMemo(() => offersByTender[String(selectedId)] || [], [offersByTender, selectedId]);
    const totalOffers = useMemo(() => Object.values(offersByTender).flat().length, [offersByTender]);
    const activeTenders = useMemo(() => tenders.filter(t => getTenderStatus(t.durum).tone === 'active').length, [tenders]);

    return {
        loading, error, setError, tenders, setTenders, offersByTender, setOffersByTender,
        selectedId, setSelectedId, tenderSearch, setTenderSearch, tenderFilter, setTenderFilter,
        tenderPage, setTenderPage, filteredTenders, selectedTender, rawOffers,
        totalOffers, activeTenders, reloadTenders, searchParams, setSearchParams,
    };
};

export default useIhaleCore;
