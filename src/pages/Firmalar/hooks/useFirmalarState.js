// Enes Doğanay | 7 Mayıs 2026: Firmalar sayfası state + URL senkronizasyon + oturum
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchHistory } from '../../../hooks/useSearchHistory';

const readSavedState = () => {
    try { return JSON.parse(sessionStorage.getItem('tedport_firmalar_state') || 'null'); }
    catch { return null; }
};

// Enes Doğanay | 11 Mayıs 2026: ?sector= URL paramı okunup sidebar Sektör filtresi pre-select edilir
export const useFirmalarState = ({ currentUserId }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const savedState = readSavedState();
    const urlSearch = searchParams.get('search') || '';
    const urlSector = searchParams.get('sector') || '';
    const urlPage = Number(searchParams.get('page')) || null;
    const urlSearchMode = searchParams.get('searchMode') || '';

    const [search, setSearch] = useState(urlSearch || savedState?.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(urlSearch || savedState?.search || '');
    // Enes Doğanay | 11 Mayıs 2026: ?sector= varsa sektörü önceden seç — sessionStorage'a öncelik üstünde
    const [filters, setFilters] = useState(() => {
        const base = savedState?.filters || { cities: [], categories: [], sectors: [], onlyVerified: false };
        if (urlSector) return { ...base, sectors: [decodeURIComponent(urlSector)] };
        return base;
    });
    const [page, setPage] = useState(urlPage || 1);
    const [sortMode, setSortMode] = useState(savedState?.sortMode || 'default');
    const validModes = ['firma', 'urun'];
    const [searchMode, setSearchMode] = useState(validModes.includes(urlSearchMode) ? urlSearchMode : 'all');
    const [viewMode, setViewMode] = useState('grid');
    const [toast, setToast] = useState(null);
    // Enes Doğanay | 19 Mayıs 2026: Oturum seed'i — her yeni oturumda random, oturum boyunca sabit
    const [sessionSeed] = useState(() => {
        try {
            const stored = sessionStorage.getItem('tedport_firmalar_seed');
            if (stored) return parseFloat(stored);
            const seed = Math.random();
            sessionStorage.setItem('tedport_firmalar_seed', String(seed));
            return seed;
        } catch {
            return Math.random();
        }
    });
    const { history: searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

    useEffect(() => {
        if (!currentUserId) return;
        try {
            const saved = localStorage.getItem(`tedport_firmalar_view_${currentUserId}`);
            if (saved === 'list' || saved === 'grid') setViewMode(saved);
        } catch {}
    }, [currentUserId]);

    useEffect(() => { const s = searchParams.get('search') || ''; if (s) { setSearch(s); setDebouncedSearch(s); } }, [searchParams]);
    useEffect(() => { setPage(Number(searchParams.get('page')) || 1); }, [searchParams]);
    useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t); }, [search]);
    useEffect(() => {
        if (debouncedSearch.trim().length < 3) return;
        const t = setTimeout(() => addToHistory(debouncedSearch.trim()), 1200);
        return () => clearTimeout(t);
    }, [debouncedSearch, addToHistory]);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSearchParams(p => { const n = new URLSearchParams(p); n.set('page', page); return n; }, { replace: true });
    }, [page, setSearchParams]);
    useEffect(() => {
        try { sessionStorage.setItem('tedport_firmalar_state', JSON.stringify({ search, filters, viewMode, sortMode })); }
        catch {}
    }, [search, filters, page, viewMode, sortMode]);

    const toggleViewMode = () => {
        const next = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(next);
        if (currentUserId) { try { localStorage.setItem(`tedport_firmalar_view_${currentUserId}`, next); } catch {} }
    };

    // Enes Doğanay | 19 Mayıs 2026: Arama/filtre/sort değişince sayfa 1'e reset — mount'ta değil, sadece kullanıcı aksiyon alınca
    const handleSetSearch = (value) => { setSearch(value); setPage(1); };
    const handleSetFilters = (value) => { setFilters(value); setPage(1); };
    const handleSetSortMode = (value) => { setSortMode(value); setPage(1); };

    // Enes Doğanay | 12 Mayıs 2026: verified type → boolean toggle, diğerleri array filtre
    const removeFilterTag = (type, value) => {
        if (type === 'verified') { setFilters(prev => ({ ...prev, onlyVerified: false })); setPage(1); return; }
        setFilters(prev => ({ ...prev, [type]: prev[type].filter(x => x !== value) })); setPage(1);
    };
    // Enes Doğanay | 12 Mayıs 2026: verified tag eklendi
    const activeTags = [
        ...(filters.cities || []).map(c => ({ type: 'cities', value: c })),
        ...(filters.sectors || []).map(s => ({ type: 'sectors', value: s })),
        ...(filters.categories || []).map(c => ({ type: 'categories', value: c })),
        ...(filters.onlyVerified ? [{ type: 'verified', value: 'Onaylı Firma' }] : []),
    ];

    return {
        search, setSearch: handleSetSearch, debouncedSearch, filters, setFilters: handleSetFilters, page, setPage,
        sortMode, setSortMode: handleSetSortMode, searchMode, setSearchMode, viewMode, toggleViewMode,
        searchHistory, addToHistory, removeFromHistory, clearHistory,
        activeTags, removeFilterTag, toast, setToast, sessionSeed,
    };
};
