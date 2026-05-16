// Enes Doğanay | 7 Mayıs 2026: Public ihale listesi hook — filtre, sıralama, sayfalama (servis üstü)
// Enes Doğanay | 13 Mayıs 2026: Tüm filtre/sıralama/sayfalama DB seviyesine taşındı
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';
import { getSmartPages } from '../IhalelerUtils';
import { fetchPublicTenders, fetchTenderCounts, fetchInvitedTenders, PAGE_SIZE } from '../services/ihalelerService';

// Enes Doğanay | 13 Mayıs 2026: "Tümü" görünümünde sayfa içi durum sıralaması (12 öğe, ucuz)
// Enes Doğanay | 13 Mayıs 2026: tamamlandi eklendi — kapali'dan sonra sıralanır
const STATUS_ORDER = { canli: 0, yaklasan: 1, kapali: 2, tamamlandi: 3 };
const sortPageByStatus = (items) =>
    [...items].sort((a, b) => {
        const aO = STATUS_ORDER[getTenderStatusMeta(a).key] ?? 3;
        const bO = STATUS_ORDER[getTenderStatusMeta(b).key] ?? 3;
        return aO - bO;
    });

const useIhaleler = (firmaFilter, { userEmail, userFirmaId, isDemoUser = false } = {}) => {
    const [tenders, setTenders] = useState([]);
    // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleler — ayrı sorgu, merge edilir
    const [invitedTenders, setInvitedTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableMissing, setTableMissing] = useState(false);
    const [selectedFirmaName, setSelectedFirmaName] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    // Enes Doğanay | 13 Mayıs 2026: 300ms debounce — API çağrısını her tuşa basmada tetiklemez
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    // Enes Doğanay | 13 Mayıs 2026: Badge sayıları — ayrı COUNT sorgusundan gelir
    const [liveCount, setLiveCount] = useState(0);
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [closedCount, setClosedCount] = useState(0);
    const [viewMode, setViewMode] = useState(() => {
        try { return localStorage.getItem('tedport_ihale_view') || 'grid'; } catch { return 'grid'; }
    });

    // Enes Doğanay | 7 Mayıs 2026: Sıralama dropdown dışarı tıklama kapama
    useEffect(() => {
        if (!sortDropdownOpen) return;
        const handler = (e) => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [sortDropdownOpen]);

    // Enes Doğanay | 13 Mayıs 2026: Search debounce
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Enes Doğanay | 13 Mayıs 2026: Filtre/arama değişince sayfa 1'e dön
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, sortBy]);

    const loadTenders = useCallback(async () => {
        setLoading(true);
        try {
            const { tenders: data, tableMissing: missing, total: tot } = await fetchPublicTenders({
                page, firmaFilter, statusFilter, searchTerm: debouncedSearch, sortBy, isDemoUser,
            });
            if (data === null) return;
            // Enes Doğanay | 13 Mayıs 2026: "Tümü" görünümünde sayfa içi durum gruplandırması
            const sorted = (!statusFilter || statusFilter === 'all') ? sortPageByStatus(data) : data;
            setTenders(sorted);
            setTableMissing(!!missing);
            setTotal(tot);
            setSelectedFirmaName(firmaFilter ? data[0]?.firma_adi || '' : '');
        } catch (error) {
            if (error?.name !== 'AbortError') setTenders([]);
        } finally { setLoading(false); }
    }, [page, firmaFilter, statusFilter, debouncedSearch, sortBy, isDemoUser]);

    // Enes Doğanay | 13 Mayıs 2026: Header badge sayıları — firmaFilter dışındakilere bağlı değil
    const loadCounts = useCallback(async () => {
        try {
            const counts = await fetchTenderCounts({ firmaFilter, isDemoUser });
            setLiveCount(counts.liveCount);
            setUpcomingCount(counts.upcomingCount);
            setClosedCount(counts.closedCount);
        } catch { /* sessiz — badge sayıları kritik değil */ }
    }, [firmaFilter, isDemoUser]);

    useEffect(() => {
        const fallbackTimer = setTimeout(() => setLoading(false), 12000);
        loadTenders().finally(() => clearTimeout(fallbackTimer));
        return () => clearTimeout(fallbackTimer);
    }, [loadTenders]);

    useEffect(() => { loadCounts(); }, [loadCounts]);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

    // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleler — kullanıcı değişince yeniden yüklenir
    useEffect(() => {
        if (!userEmail && !userFirmaId) { setInvitedTenders([]); return; }
        fetchInvitedTenders(userEmail, userFirmaId)
            .then(data => setInvitedTenders(data.map(t => ({ ...t, _isInvited: true }))))
            .catch(() => setInvitedTenders([]));
    }, [userEmail, userFirmaId]);

    const toggleViewMode = () => {
        const next = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(next);
        try { localStorage.setItem('tedport_ihale_view', next); } catch {}
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const smartPages = getSmartPages(page, totalPages);

    // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleleri mevcut filtre/arama ile eşleştir (sayfa-1 başına prepend)
    const invitedFiltered = useMemo(() => {
        if (!invitedTenders.length) return [];
        let list = invitedTenders;

        if (statusFilter && statusFilter !== 'all') {
            list = list.filter(t => {
                const meta = getTenderStatusMeta(t);
                if (statusFilter === 'canli') return meta.key === 'canli';
                if (statusFilter === 'kapali') return meta.key === 'kapali';
                if (statusFilter === 'yaklasan') return meta.key === 'yaklasan';
                if (statusFilter === 'acil') {
                    const d = t.son_basvuru_tarihi ? new Date(t.son_basvuru_tarihi) : null;
                    const diff = d ? d - new Date() : -1;
                    return meta.key === 'canli' && diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
                }
                return t.durum === statusFilter;
            });
        }
        if (debouncedSearch && debouncedSearch.trim().length >= 2) {
            const q = debouncedSearch.toLowerCase();
            list = list.filter(t =>
                (t.baslik || '').toLowerCase().includes(q) ||
                (t.firma_adi || '').toLowerCase().includes(q) ||
                (t.referans_no || '').toLowerCase().includes(q)
            );
        }
        // Kendi ihalesi zaten public listede var — duplicate'i önle
        const publicIds = new Set(tenders.map(t => t.id));
        return list.filter(t => !publicIds.has(t.id));
    }, [invitedTenders, tenders, statusFilter, debouncedSearch]);

    // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleler sadece sayfa 1'de öne eklenir
    const mergedTenders = useMemo(
        () => page === 1 ? [...invitedFiltered, ...tenders] : tenders,
        [page, invitedFiltered, tenders]
    );

    return {
        tenders, loading, tableMissing, selectedFirmaName,
        page, setPage, viewMode, toggleViewMode,
        searchTerm, setSearchTerm, statusFilter, setStatusFilter,
        sortBy, setSortBy, sortDropdownOpen, setSortDropdownOpen, sortDropdownRef,
        // Enes Doğanay | 13 Mayıs 2026: Server pagination — paginatedTenders = tenders (zaten sayfalanmış)
        filteredTenders: mergedTenders,
        paginatedTenders: mergedTenders,
        total, totalPages, smartPages,
        liveCount, upcomingCount, closedCount,
        fetchPublicTenders: loadTenders,
    };
};

export default useIhaleler;
