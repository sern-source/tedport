// Enes Doğanay | 7 Mayıs 2026: Public ihale listesi hook — filtre, sıralama, sayfalama (servis üstü)
import { useState, useEffect, useCallback, useRef } from 'react';
import { getTenderStatusMeta } from '../../../constants/tenderUtils';
import { TENDERS_PAGE_SIZE, getSmartPages } from '../IhalelerUtils';
import { fetchPublicTenders } from '../services/ihalelerService';

const STATUS_ORDER = { canli: 0, yaklasan: 1, kapali: 2 };

const useIhaleler = (firmaFilter) => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableMissing, setTableMissing] = useState(false);
    const [selectedFirmaName, setSelectedFirmaName] = useState('');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
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

    const loadTenders = useCallback(async () => {
        setLoading(true);
        try {
            const { tenders: data, tableMissing: missing } = await fetchPublicTenders(firmaFilter);
            if (data === null) return;
            setTenders(data);
            setTableMissing(!!missing);
            setSelectedFirmaName(firmaFilter ? data[0]?.firma_adi || '' : '');
        } catch (error) {
            if (error?.name !== 'AbortError') setTenders([]);
        } finally { setLoading(false); }
    }, [firmaFilter]);

    useEffect(() => {
        const fallbackTimer = setTimeout(() => setLoading(false), 12000);
        loadTenders().finally(() => clearTimeout(fallbackTimer));
        return () => clearTimeout(fallbackTimer);
    }, [loadTenders]);

    useEffect(() => { setPage(1); }, [searchTerm, statusFilter, sortBy]);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

    const toggleViewMode = () => {
        const next = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(next);
        try { localStorage.setItem('tedport_ihale_view', next); } catch {}
    };

    const filteredTenders = tenders
        .filter(tender => {
            const statusMeta = getTenderStatusMeta(tender);
            const q = searchTerm.trim().toLocaleLowerCase('tr-TR');
            const matchesQuery = !q || [tender.baslik, tender.aciklama, tender.kategori, tender.ihale_tipi, tender.firma_adi, tender.firma_konum, tender.referans_no]
                .some(v => (v || '').toLocaleLowerCase('tr-TR').includes(q));
            // Enes Doğanay | 12 Mayıs 2026: 'acil' filtresi — canlı + 3 günden az kalan
            let matchesStatus;
            if (statusFilter === 'acil') {
                const now = new Date();
                const deadline = tender.son_basvuru_tarihi ? new Date(tender.son_basvuru_tarihi) : null;
                matchesStatus = statusMeta.key === 'canli' && deadline && (deadline - now) < 3 * 24 * 60 * 60 * 1000 && (deadline - now) > 0;
            } else {
                matchesStatus = statusFilter === 'all' || statusMeta.key === statusFilter;
            }
            return matchesQuery && matchesStatus;
        })
        .sort((a, b) => {
            if (statusFilter === 'all') {
                const aO = STATUS_ORDER[getTenderStatusMeta(a).key] ?? 3;
                const bO = STATUS_ORDER[getTenderStatusMeta(b).key] ?? 3;
                if (aO !== bO) return aO - bO;
            }
            if (sortBy === 'newest') return (b.yayin_tarihi || '').localeCompare(a.yayin_tarihi || '');
            if (sortBy === 'title') return (a.baslik || '').localeCompare(b.baslik || '', 'tr');
            return (a.son_basvuru_tarihi || '').localeCompare(b.son_basvuru_tarihi || '');
        });

    const liveCount = tenders.filter(t => getTenderStatusMeta(t).key === 'canli').length;
    const upcomingCount = tenders.filter(t => getTenderStatusMeta(t).key === 'yaklasan').length;
    const closedCount = tenders.filter(t => getTenderStatusMeta(t).key === 'kapali').length;
    const totalPages = Math.ceil(filteredTenders.length / TENDERS_PAGE_SIZE);
    const smartPages = getSmartPages(page, totalPages);
    const paginatedTenders = filteredTenders.slice((page - 1) * TENDERS_PAGE_SIZE, page * TENDERS_PAGE_SIZE);

    return {
        tenders, loading, tableMissing, selectedFirmaName,
        page, setPage, viewMode, toggleViewMode,
        searchTerm, setSearchTerm, statusFilter, setStatusFilter,
        sortBy, setSortBy, sortDropdownOpen, setSortDropdownOpen, sortDropdownRef,
        filteredTenders, paginatedTenders, totalPages, smartPages,
        liveCount, upcomingCount, closedCount, fetchPublicTenders: loadTenders,
    };
};

export default useIhaleler;
