// Enes Doğanay | 7 Mayıs 2026: Kurumsal kayıt firma arama/seçim sub-hook
import { useState, useRef, useEffect } from 'react';
import { TURKEY_DISTRICTS } from '../../../constants/turkeyDistricts';
import { searchFirmas } from '../services/registerService';

const parseIlIlce = (ilIlceLine) => {
    if (!ilIlceLine) return { il: '', ilce: '' };
    const sep = ilIlceLine.includes(',') ? ',' : '/';
    const parts = ilIlceLine.split(sep).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
        if (TURKEY_DISTRICTS[parts[0]]) return { il: parts[0], ilce: parts[1] };
        if (TURKEY_DISTRICTS[parts[1]]) return { il: parts[1], ilce: parts[0] };
        return { il: parts[0], ilce: parts[1] };
    }
    if (parts.length === 1 && TURKEY_DISTRICTS[parts[0]]) return { il: parts[0], ilce: '' };
    return { il: '', ilce: '' };
};

export const useCorporateFirmaSearch = ({ setCorporateForm, setField }) => {
    const [firmaSuggestions, setFirmaSuggestions] = useState([]);
    const [showFirmaSuggestions, setShowFirmaSuggestions] = useState(false);
    const firmaSearchRef = useRef(null);
    const firmaDebounceRef = useRef(null);

    useEffect(() => {
        const onClickOutside = (e) => { if (firmaSearchRef.current && !firmaSearchRef.current.contains(e.target)) setShowFirmaSuggestions(false); };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const handleFirmaSearch = (value) => {
        setField('listedCompanyName', value);
        setCorporateForm(prev => ({ ...prev, selectedFirmaId: null }));
        if (firmaDebounceRef.current) clearTimeout(firmaDebounceRef.current);
        if (value.trim().length < 2) { setFirmaSuggestions([]); setShowFirmaSuggestions(false); return; }
        firmaDebounceRef.current = setTimeout(async () => {
            try {
                const results = await searchFirmas(value);
                if (results.length > 0) { setFirmaSuggestions(results); setShowFirmaSuggestions(true); }
                else { setFirmaSuggestions([]); setShowFirmaSuggestions(false); }
            } catch { setFirmaSuggestions([]); setShowFirmaSuggestions(false); }
        }, 300);
    };

    const handleFirmaSelect = (firma) => {
        const { il, ilce } = parseIlIlce(firma.il_ilce || '');
        setCorporateForm(prev => ({
            ...prev, listedCompanyName: firma.firma_adi, selectedFirmaId: firma.firmaID,
            ...(il ? { companyIl: il } : {}), ...(ilce ? { companyIlce: ilce } : {}),
            ...(firma.adres ? { companyOpenAddress: firma.adres } : {}),
            ...(firma.telefon ? { companyPhone: firma.telefon } : {}),
        }));
        setShowFirmaSuggestions(false); setFirmaSuggestions([]);
    };

    return { firmaSuggestions, showFirmaSuggestions, setShowFirmaSuggestions, firmaSearchRef, handleFirmaSearch, handleFirmaSelect };
};

export { parseIlIlce };
