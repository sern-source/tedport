// Enes Doğanay | 7 Mayıs 2026: İhale form davet (email + firma) state + handler'lar
import { useState, useRef } from 'react';
import { checkEmailInDb, searchFirmasByName } from '../services/ihaleFormService';

// Enes Doğanay | 7 Mayıs 2026: E-posta ve firma davet yönetimi — form state ve setForm alır
export const useIhaleFormInvites = ({ form, setForm }) => {
    const [emailInput, setEmailInput] = useState('');
    const [emailStatus, setEmailStatus] = useState(null);
    const [firmaSearchTerm, setFirmaSearchTerm] = useState('');
    const [firmaSearchResults, setFirmaSearchResults] = useState([]);
    const [firmaSearching, setFirmaSearching] = useState(false);
    const emailCheckTimeout = useRef(null);
    const firmaSearchTimeout = useRef(null);
    const firmaResultsRef = useRef(null);

    // Enes Doğanay | 7 Mayıs 2026: Email input değişince format kontrol + DB doğrulama (debounced)
    const handleEmailInputChange = (e) => {
        const val = e.target.value;
        setEmailInput(val); setEmailStatus(null);
        if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
        if (!val.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return;
        emailCheckTimeout.current = setTimeout(async () => {
            setEmailStatus('checking');
            try {
                const exists = await checkEmailInDb(val.trim());
                setEmailStatus(exists ? 'valid' : 'not_found');
            } catch { setEmailStatus(null); }
        }, 500);
    };

    const addEmail = () => {
        const email = emailInput.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || emailStatus !== 'valid') return;
        if (form.davet_emailleri.includes(email)) return;
        setForm(p => ({ ...p, davet_emailleri: [...p.davet_emailleri, email] }));
        setEmailInput(''); setEmailStatus(null);
    };

    const removeEmail = (email) => setForm(p => ({ ...p, davet_emailleri: p.davet_emailleri.filter(e => e !== email) }));
    const handleEmailKeyDown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); } };

    // Enes Doğanay | 7 Mayıs 2026: Firma adı değişince arama yap (debounced)
    const handleFirmaSearch = (val) => {
        setFirmaSearchTerm(val);
        if (firmaSearchTimeout.current) clearTimeout(firmaSearchTimeout.current);
        if (!val || val.length < 2) { setFirmaSearchResults([]); return; }
        firmaSearchTimeout.current = setTimeout(async () => {
            setFirmaSearching(true);
            try {
                const data = await searchFirmasByName(val);
                setFirmaSearchResults(data);
                setTimeout(() => firmaResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
            } catch { setFirmaSearchResults([]); }
            finally { setFirmaSearching(false); }
        }, 300);
    };

    const addDavetliFirma = (firma) => {
        if (form.davetli_firmalar.some(f => f.firma_id === firma.firmaID)) return;
        setForm(p => ({ ...p, davetli_firmalar: [...p.davetli_firmalar, { firma_id: firma.firmaID, firma_adi: firma.firma_adi, onayli: firma.onayli_hesap === true }] }));
        setFirmaSearchTerm(''); setFirmaSearchResults([]);
    };

    const removeDavetliFirma = (firmaId) => setForm(p => ({ ...p, davetli_firmalar: p.davetli_firmalar.filter(f => f.firma_id !== firmaId) }));

    const resetInvites = () => { setEmailInput(''); setEmailStatus(null); setFirmaSearchTerm(''); setFirmaSearchResults([]); };

    return {
        emailInput, setEmailInput, emailStatus, setEmailStatus,
        firmaSearchTerm, setFirmaSearchTerm, firmaSearchResults, setFirmaSearchResults,
        firmaSearching, firmaResultsRef,
        handleEmailInputChange, addEmail, removeEmail, handleEmailKeyDown,
        handleFirmaSearch, addDavetliFirma, removeDavetliFirma, resetInvites,
    };
};
