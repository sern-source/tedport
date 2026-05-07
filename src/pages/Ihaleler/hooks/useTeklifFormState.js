// Enes Doğanay | 7 Mayıs 2026: Teklif form saf state — hesaplamalar ve login prompt
import { useState, useEffect, useRef } from 'react';
import { getKalemToplam } from '../IhalelerUtils';

const EMPTY_TEKLIF_FORM = {
    kalemler: [],
    genel_toplam: '',
    para_birimi: 'TRY',
    kdv_dahil: false,
    teslim_suresi_gun: '',
    teslim_aciklamasi: '',
    not: '',
};

// Enes Doğanay | 7 Mayıs 2026: Teklif form saf state ve yardımcı fonksiyonlar
const useTeklifFormState = () => {
    const [teklifTender, setTeklifTender] = useState(null);
    const [teklifForm, setTeklifForm] = useState(EMPTY_TEKLIF_FORM);
    const [teklifDosya, setTeklifDosya] = useState(null);
    const [teklifSaving, setTeklifSaving] = useState(false);
    const [teklifError, setTeklifError] = useState('');
    const [teklifSuccess, setTeklifSuccess] = useState(false);
    const [withdrawConfirm, setWithdrawConfirm] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [draftDeleteConfirm, setDraftDeleteConfirm] = useState(false);
    const [draftDeleting, setDraftDeleting] = useState(false);
    const [currencyModalIdx, setCurrencyModalIdx] = useState(null);
    const [currencySearch, setCurrencySearch] = useState('');
    const [loginPromptTenderId, setLoginPromptTenderId] = useState(null);
    const [loginPromptPos, setLoginPromptPos] = useState(null);

    const teklifDosyaRef = useRef(null);
    const loginPromptRef = useRef(null);

    // Enes Doğanay | 7 Mayıs 2026: Login prompt dışına tıklayınca kapat
    useEffect(() => {
        if (!loginPromptTenderId) return;
        const handler = (e) => {
            if (loginPromptRef.current && !loginPromptRef.current.contains(e.target)) {
                setLoginPromptTenderId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [loginPromptTenderId]);

    // Enes Doğanay | 7 Mayıs 2026: Teklif kalem değeri güncelle
    const updateKalem = (idx, field, value) => {
        setTeklifForm(prev => {
            const kalemler = [...prev.kalemler];
            kalemler[idx] = { ...kalemler[idx], [field]: value };
            return { ...prev, kalemler };
        });
    };

    // Enes Doğanay | 7 Mayıs 2026: Genel toplam hesapla
    const getTeklifGenelToplam = () => {
        if (teklifForm.kalemler.length > 0) return teklifForm.kalemler.reduce((sum, k) => sum + getKalemToplam(k), 0);
        return parseFloat(teklifForm.genel_toplam) || 0;
    };

    // Enes Doğanay | 7 Mayıs 2026: Para birimine göre gruplu toplam
    const getGroupedTotals = () => {
        if (teklifForm.kalemler.length > 0) {
            const groups = {};
            teklifForm.kalemler.forEach(k => { const cur = k.para_birimi || 'TRY'; groups[cur] = (groups[cur] || 0) + getKalemToplam(k); });
            return groups;
        }
        return { [teklifForm.para_birimi]: parseFloat(teklifForm.genel_toplam) || 0 };
    };

    return {
        teklifTender, setTeklifTender,
        teklifForm, setTeklifForm,
        teklifDosya, setTeklifDosya,
        teklifSaving, setTeklifSaving,
        teklifError, setTeklifError,
        teklifSuccess, setTeklifSuccess,
        withdrawConfirm, setWithdrawConfirm,
        withdrawing, setWithdrawing,
        draftDeleteConfirm, setDraftDeleteConfirm,
        draftDeleting, setDraftDeleting,
        currencyModalIdx, setCurrencyModalIdx,
        currencySearch, setCurrencySearch,
        loginPromptTenderId, setLoginPromptTenderId,
        loginPromptPos, setLoginPromptPos,
        teklifDosyaRef, loginPromptRef,
        updateKalem, getTeklifGenelToplam, getGroupedTotals,
    };
};

export default useTeklifFormState;
