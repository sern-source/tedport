// Enes Doğanay | 23 Mayıs 2026: Firma detay sayfası arama state'i — useFirmaDetay'dan ayrıştırıldı
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSuggestionsService } from '../services/firmaDetayService';

export function useFirmaDetaySearch() {
    const router = useRouter();
    const [detaySearch, setDetaySearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [detaySearchMode, setDetaySearchMode] = useState('all');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (detaySearch.trim().length < 2) { setSuggestions([]); setNoResults(false); return; }
        const timeout = setTimeout(async () => {
            const results = await fetchSuggestionsService(detaySearch);
            setSuggestions(results);
            setNoResults(results.length === 0);
        }, 300);
        return () => clearTimeout(timeout);
    }, [detaySearch]);

    // Enes Doğanay | 23 Mayıs 2026: slug varsa /firmalar/:slug, yoksa /firmadetay/:id
    const handleSuggestionClick = (item) => {
        setSuggestions([]);
        setNoResults(false);
        if (!item) return;
        setDetaySearch('');
        router.push(item.slug ? `/firmalar/${item.slug}` : `/firmadetay/${item.id}`);
    };

    const handleSearchSubmit = (term) => {
        setSuggestions([]);
        setNoResults(false);
        if (term.trim().length < 2) return;
        // Enes Doğanay | 11 Mayıs 2026: searchMode URL param olarak firmalar sayfasına taşınır
        const modeParam = detaySearchMode !== 'all' ? `&searchMode=${detaySearchMode}` : '';
        router.push(`/firmalar?search=${encodeURIComponent(term.trim())}${modeParam}`);
    };

    return {
        detaySearch, setDetaySearch,
        suggestions, noResults,
        detaySearchMode, setDetaySearchMode,
        handleSuggestionClick, handleSearchSubmit,
    };
}
