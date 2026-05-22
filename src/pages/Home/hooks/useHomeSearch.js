// Enes Doğanay | 6 Mayıs 2026: Hero arama — öneriler, geçmiş, yazım düzeltme
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchHistory } from '../../../hooks/useSearchHistory';
import { suggestCorrection } from '../../../constants/synonyms';
import { fetchHeroSuggestions } from '../services/homeService';

export function useHomeSearch() {
    const router = useRouter();
    const { history: searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

    const [searchTerm, setSearchTerm] = useState('');
    const [heroSuggestions, setHeroSuggestions] = useState([]);
    const [heroNoResults, setHeroNoResults] = useState(false);
    const [heroDidYouMean, setHeroDidYouMean] = useState(null);
    const [heroHistoryVisible, setHeroHistoryVisible] = useState(false);

    const heroSearchRef = useRef(null);

    // Enes Doğanay | 6 Mayıs 2026: Debounced öneri yükleme
    const loadSuggestions = useCallback(async (term) => {
        const trimmed = term?.trim() || '';
        if (trimmed.length < 2) {
            setHeroSuggestions([]);
            setHeroNoResults(false);
            return;
        }
        try {
            const results = await fetchHeroSuggestions(trimmed);
            if (results.length > 0) {
                setHeroSuggestions(results);
                setHeroNoResults(false);
                setHeroDidYouMean(null);
            } else {
                setHeroSuggestions([]);
                setHeroNoResults(true);
                setHeroDidYouMean(suggestCorrection(trimmed));
            }
        } catch (err) {
            if (err?.name !== 'AbortError') console.error('Hero öneri hatası:', err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => loadSuggestions(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm, loadSuggestions]);

    // Enes Doğanay | 6 Mayıs 2026: Dışarı tıkla kapat
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (heroSearchRef.current && !heroSearchRef.current.contains(e.target)) {
                setHeroSuggestions([]);
                setHeroNoResults(false);
                setHeroHistoryVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = useCallback(() => {
        const trimmed = searchTerm.trim();
        if (trimmed) {
            addToHistory(trimmed);
            router.push(`/firmalar?search=${encodeURIComponent(trimmed)}`);
        } else {
            router.push('/firmalar');
        }
        setHeroHistoryVisible(false);
    }, [searchTerm, addToHistory, router]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setHeroSuggestions([]);
        setHeroNoResults(false);
    }, []);

    const handleCloseSuggestions = useCallback(() => {
        setHeroSuggestions([]);
        setHeroNoResults(false);
        setHeroHistoryVisible(false);
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        heroSuggestions,
        heroNoResults,
        heroDidYouMean,
        setHeroDidYouMean,
        heroHistoryVisible,
        setHeroHistoryVisible,
        heroSearchRef,
        searchHistory,
        removeFromHistory,
        clearHistory,
        handleSearch,
        handleClearSearch,
        handleCloseSuggestions,
    };
}
