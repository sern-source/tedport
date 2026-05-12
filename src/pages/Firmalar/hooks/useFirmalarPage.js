// Enes Doğanay | 7 Mayıs 2026: Firmalar ana sayfa koordinatör — veri çekme + state + auth + quote
import { useState, useEffect } from 'react';
import { fetchFirmalar, fetchFirmaNameSuggestion } from '../services/firmaService';
import { suggestCorrection } from '../../../constants/synonyms';
import { formatLocation, degerleriDiziyeCevir } from '../utils/firmaUtils';
import { useFirmaAuth } from './useFirmaAuth';
import { useQuoteRequest } from './useQuoteRequest';
import { useFirmalarState } from './useFirmalarState';

// Enes Doğanay | 12 Mayıs 2026: sector eklendi — kart meta-info'da gösterilir
const mapFirmaData = (item) => ({
    id: item.firmaID, name: item.firma_adi, isBest: item.best,
    isVerified: item.onayli_hesap === true, location: formatLocation(item.il_ilce),
    // Enes Doğanay | 12 Mayıs 2026: ana_sektor yoksa category_name'e fall back — panel "Ana Sektör" alanı category_name'i yazar
    sector: item.ana_sektor || item.category_name || '',
    tags: degerleriDiziyeCevir(item.urun_kategorileri), description: item.description,
    images: item.logo_url?.includes('firma-logolari') ? item.logo_url : null,
    telefon: item.telefon || '', eposta: item.eposta || '', web_sitesi: item.web_sitesi || '', adres: item.adres || '',
});

// Enes Doğanay | 7 Mayıs 2026: isVerified birinci öncelik — onaylı+logolu firmalar en üstte
const sortByRelevance = (items, searchTerm) => {
    const lower = searchTerm.toLowerCase();
    return [...items].sort((a, b) => {
        if ((b.isVerified ? 1 : 0) !== (a.isVerified ? 1 : 0)) return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
        if ((b.images ? 1 : 0) !== (a.images ? 1 : 0)) return (b.images ? 1 : 0) - (a.images ? 1 : 0);
        if ((b.isBest ? 1 : 0) !== (a.isBest ? 1 : 0)) return (b.isBest ? 1 : 0) - (a.isBest ? 1 : 0);
        const aName = (a.name || '').toLowerCase(); const bName = (b.name || '').toLowerCase();
        const sc = n => (n === lower ? 3 : n.startsWith(lower) ? 2 : n.includes(lower) ? 1 : 0);
        return sc(bName) - sc(aName);
    });
};

export const useFirmalarPage = () => {
    const auth = useFirmaAuth();
    const state = useFirmalarState({ currentUserId: auth.currentUserId });
    const quote = useQuoteRequest((msg) => state.setToast({ type: 'error', message: msg }));

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [didYouMean, setDidYouMean] = useState(null);
    // Enes Doğanay | 11 Mayıs 2026: Firma modu — DB'deki gerçek firma adı önerisi
    const [firmaSmartSuggestion, setFirmaSmartSuggestion] = useState(null);

    useEffect(() => {
        const fallback = setTimeout(() => setLoading(false), 12000);
        const load = async () => {
            setLoading(true);
            try {
                const { data, count } = await fetchFirmalar({ page: state.page, search: state.debouncedSearch, filters: state.filters, sortMode: state.sortMode, searchMode: state.searchMode });
                let mapped = data.map(mapFirmaData);
                if (state.debouncedSearch.trim().length >= 2 && state.sortMode === 'default') mapped = sortByRelevance(mapped, state.debouncedSearch.trim());
                setSuppliers(mapped); setTotalCount(count);
                const isZeroResults = mapped.length === 0 && state.debouncedSearch.trim().length >= 2;
                setDidYouMean(isZeroResults ? suggestCorrection(state.debouncedSearch.trim()) : null);
                // Enes Doğanay | 11 Mayıs 2026: Firma modunda 0 sonuç — DB firma adı önerisi
                if (isZeroResults && state.searchMode === 'firma') {
                    const suggestion = await fetchFirmaNameSuggestion(state.debouncedSearch.trim());
                    setFirmaSmartSuggestion(suggestion);
                } else {
                    setFirmaSmartSuggestion(null);
                }
            } catch (err) {
                if (!err?.message?.includes('abort')) console.error('Firmalar yüklenemedi:', err);
                setSuppliers([]); setTotalCount(0);
            } finally { setLoading(false); clearTimeout(fallback); }
        };
        load();
        return () => clearTimeout(fallback);
    }, [state.page, state.debouncedSearch, state.filters, state.sortMode, state.searchMode]);

    return {
        ...state, ...auth, quote,
        suppliers, loading, totalCount, totalPages: Math.ceil(totalCount / 10), didYouMean, firmaSmartSuggestion,
    };
};
