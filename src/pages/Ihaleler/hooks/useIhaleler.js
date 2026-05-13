// Enes Doğanay | 7 Mayıs 2026: Public ihale listesi hook — filtre, sıralama, sayfalama (servis üstü)
// Enes Doğanay | 13 Mayıs 2026: Tüm filtre/sıralama/sayfalama DB seviyesine taşındı
import { useState, useEffect, useCallback, useRef } from 'react';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';
import { getSmartPages } from '../IhalelerUtils';
import { fetchPublicTenders, fetchTenderCounts, PAGE_SIZE } from '../services/ihalelerService';

// Enes Doğanay | 13 Mayıs 2026: "Tümü" görünümünde sayfa içi durum sıralaması (12 öğe, ucuz)
// Enes Doğanay | 13 Mayıs 2026: tamamlandi eklendi — kapali'dan sonra sıralanır
const STATUS_ORDER = { canli: 0, yaklasan: 1, kapali: 2, tamamlandi: 3 };
const sortPageByStatus = (items) =>
    [...items].sort((a, b) => {
        const aO = STATUS_ORDER[getTenderStatusMeta(a).key] ?? 3;
        const bO = STATUS_ORDER[getTenderStatusMeta(b).key] ?? 3;
        return aO - bO;
    });

const useIhaleler = (firmaFilter) => {
    const [tenders, setTenders] = useState([]);
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
                page, firmaFilter, statusFilter, searchTerm: debouncedSearch, sortBy,
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
    }, [page, firmaFilter, statusFilter, debouncedSearch, sortBy]);

    // Enes Doğanay | 13 Mayıs 2026: Header badge sayıları — firmaFilter dışındakilere bağlı değil
    const loadCounts = useCallback(async () => {
        try {
            const counts = await fetchTenderCounts({ firmaFilter });
            setLiveCount(counts.liveCount);
            setUpcomingCount(counts.upcomingCount);
            setClosedCount(counts.closedCount);
        } catch { /* sessiz — badge sayıları kritik değil */ }
    }, [firmaFilter]);

    useEffect(() => {
        const fallbackTimer = setTimeout(() => setLoading(false), 12000);
        loadTenders().finally(() => clearTimeout(fallbackTimer));
        return () => clearTimeout(fallbackTimer);
    }, [loadTenders]);

    useEffect(() => { loadCounts(); }, [loadCounts]);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

    const toggleViewMode = () => {
        const next = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(next);
        try { localStorage.setItem('tedport_ihale_view', next); } catch {}
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const smartPages = getSmartPages(page, totalPages);

    return {
        tenders, loading, tableMissing, selectedFirmaName,
        page, setPage, viewMode, toggleViewMode,
        searchTerm, setSearchTerm, statusFilter, setStatusFilter,
        sortBy, setSortBy, sortDropdownOpen, setSortDropdownOpen, sortDropdownRef,
        // Enes Doğanay | 13 Mayıs 2026: Server pagination — paginatedTenders = tenders (zaten sayfalanmış)
        filteredTenders: tenders,
        paginatedTenders: tenders,
        total, totalPages, smartPages,
        liveCount, upcomingCount, closedCount,
        fetchPublicTenders: loadTenders,
    };
};

export default useIhaleler;
