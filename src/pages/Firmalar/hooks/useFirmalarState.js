// Enes Doğanay | 7 Mayıs 2026: Firmalar sayfası state + URL senkronizasyon + oturum
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchHistory } from '../../../hooks/useSearchHistory';

const readSavedState = () => {
    try { return JSON.parse(sessionStorage.getItem('tedport_firmalar_state') || 'null'); }
    catch { return null; }
};

// Enes Doğanay | 7 Mayıs 2026: Arama, filtre, sayfalama state + URL/sessionStorage senkron
export const useFirmalarState = ({ currentUserId }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const savedState = readSavedState();
    const urlSearch = searchParams.get('search') || '';
    const urlPage = Number(searchParams.get('page')) || null;

    const [search, setSearch] = useState(urlSearch || savedState?.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(urlSearch || savedState?.search || '');
    const [filters, setFilters] = useState(savedState?.filters || { cities: [], categories: [], sectors: [] });
    const [page, setPage] = useState(urlPage || 1);
    const [sortMode, setSortMode] = useState(savedState?.sortMode || 'default');
    const [viewMode, setViewMode] = useState('grid');
    const [toast, setToast] = useState(null);
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
    useEffect(() => { if (page !== 1) setPage(1); }, [debouncedSearch, filters, sortMode]);
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

    const removeFilterTag = (type, value) => setFilters(prev => ({ ...prev, [type]: prev[type].filter(x => x !== value) }));
    const activeTags = [
        ...(filters.cities || []).map(c => ({ type: 'cities', value: c })),
        ...(filters.sectors || []).map(s => ({ type: 'sectors', value: s })),
        ...(filters.categories || []).map(c => ({ type: 'categories', value: c })),
    ];

    return {
        search, setSearch, debouncedSearch, filters, setFilters, page, setPage,
        sortMode, setSortMode, viewMode, toggleViewMode,
        searchHistory, addToHistory, removeFromHistory, clearHistory,
        activeTags, removeFilterTag, toast, setToast,
    };
};
