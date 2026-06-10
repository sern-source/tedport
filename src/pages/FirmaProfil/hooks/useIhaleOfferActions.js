// Enes Doğanay | 6 Mayıs 2026: Teklif görüntüleme — filtre/sıralama/karşılaştırma/puanlama/notlar/CSV
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as ihaleService from '../services/ihaleService';
import { calculateOfferScore, getOfferStatus, formatMoney } from '../constants/ihaleConstants';

const useIhaleOfferActions = ({ rawOffers, selectedTender }) => {
    const [sortState, setSortState] = useState({ open: false, value: 'score' });
    const [compareState, setCompareState] = useState({ ids: [], hintDismissed: localStorage.getItem('tom_compare_hint_never') === '1' || sessionStorage.getItem('tom_compare_hint_dismissed') === '1' });
    const [displayState, setDisplayState] = useState({ filter: 'all', expandedId: null, showScorePanel: false, weights: { price: 50, delivery: 50 } });
    const [shortlist, setShortlist] = useState(() => { try { return JSON.parse(localStorage.getItem('tedport_shortlist_offer_ids') || '[]'); } catch { return []; } });
    const [notes, setNotes] = useState({});
    const [showScoringInfo, setShowScoringInfo] = useState(false);
    const [highlightState, setHighlightState] = useState({ offerId: null });

    const sortDropdownRef = useRef(null);
    const highlightRef = useRef(null);
    const notesSaveTimers = useRef({});

    useEffect(() => { localStorage.setItem('tedport_shortlist_offer_ids', JSON.stringify(shortlist)); }, [shortlist]);
    useEffect(() => {
        const all = {};
        rawOffers.forEach(o => { if (o.alici_notu) all[String(o.id)] = o.alici_notu; });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotes(all);
    }, [rawOffers]);

    // Enes Doğanay | 7 Mayıs 2026: İhale değişince karşılaştırma seçimini ve filtreyi temizle
    // Enes Doğanay | 3 Haziran 2026: Kaydedilmiş ağırlıkları localStorage'dan yükle
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompareState(prev => ({ ...prev, ids: [] }));
        let weights = { price: 50, delivery: 50 };
        if (selectedTender?.id) {
            try {
                const saved = localStorage.getItem(`tedport_weights_${selectedTender.id}`);
                if (saved) { const p = JSON.parse(saved); if (typeof p.price === 'number') weights = p; }
            } catch { /* ignore */ }
        }
        setDisplayState(prev => ({ ...prev, filter: 'all', expandedId: null, weights }));
    }, [selectedTender?.id]);

    // Enes Doğanay | 6 Mayıs 2026: Sıralama dropdown dışarı tıklama
    useEffect(() => {
        if (!sortState.open) return;
        const handler = (e) => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortState(p => ({ ...p, open: false })); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [sortState.open]);

    const scoredOffers = useMemo(() => rawOffers.map(o => ({ ...o, _score: calculateOfferScore(o, rawOffers, displayState.weights) })), [rawOffers, displayState.weights]);

    const displayOffers = useMemo(() => {
        const sl = new Set(shortlist.map(String));
        let list = [...scoredOffers];
        if (displayState.filter === 'shortlist') list = list.filter(o => sl.has(String(o.id)));
        else if (displayState.filter !== 'all') list = list.filter(o => String(o.durum || '').toLowerCase() === displayState.filter);
        list.sort((a, b) => {
            switch (sortState.value) {
                case 'score': return b._score.overall - a._score.overall;
                case 'price-asc': return Number(a.toplam_tutar || 0) - Number(b.toplam_tutar || 0);
                case 'price-desc': return Number(b.toplam_tutar || 0) - Number(a.toplam_tutar || 0);
                case 'delivery': return Number(a.teslim_suresi_gun || 999) - Number(b.teslim_suresi_gun || 999);
                case 'date': return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
                default: return 0;
            }
        });
        return list;
    }, [scoredOffers, displayState.filter, sortState.value, shortlist]);

    const compareList = useMemo(() => {
        const s = new Set(compareState.ids.map(String));
        return scoredOffers.filter(o => s.has(String(o.id))).slice(0, 3);
    }, [compareState.ids, scoredOffers]);

    const toggleCompare = useCallback((id) => {
        setCompareState(prev => {
            const k = String(id);
            const ids = prev.ids.map(String);
            if (ids.includes(k)) return { ...prev, ids: prev.ids.filter(i => String(i) !== k) };
            if (ids.length >= 3) return prev;
            return { ...prev, ids: [...prev.ids, id] };
        });
    }, []);

    const toggleShortlist = useCallback((id) => {
        setShortlist(prev => {
            const k = String(id);
            if (prev.map(String).includes(k)) return prev.filter(i => String(i) !== k);
            return [...prev, id];
        });
    }, []);

    const handleNoteChange = useCallback((offerId, value) => {
        setNotes(prev => ({ ...prev, [String(offerId)]: value }));
        if (notesSaveTimers.current[offerId]) clearTimeout(notesSaveTimers.current[offerId]);
        notesSaveTimers.current[offerId] = setTimeout(() => { ihaleService.updateOfferNote(offerId, value || null); }, 800);
    }, []);

    const exportOffersCSV = useCallback(() => {
        if (!selectedTender || displayOffers.length === 0) return;
        const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const row = (...cells) => cells.map(c => q(c)).join(',');
        const lines = [];
        lines.push(row('İHALE TEKLİF RAPORU'), row('İhale Başlığı', selectedTender.baslik || ''), row('Referans No', selectedTender.referans_no || ''), row('Rapor Tarihi', new Date().toLocaleDateString('tr-TR')), row('Toplam Teklif', displayOffers.length), '');
        lines.push(row('Sıra', 'Firma', 'E-posta', 'Tutar', 'Para Birimi', 'KDV', 'Teslim (gün)', 'Durum', 'Genel Puan', 'Tarih'));
        displayOffers.forEach((o, i) => {
            lines.push(row(`#${i + 1}`, o.gonderen_firma_adi || o.gonderen_ad_soyad || '', o.gonderen_email || '', o.toplam_tutar || '', o.para_birimi || 'TRY', o.kdv_dahil === true ? 'Dahil' : o.kdv_dahil === false ? 'Hariç' : '', o.teslim_suresi_gun || '', getOfferStatus(o.durum).label, o._score?.overall ?? '', o.created_at ? new Date(o.created_at).toLocaleDateString('tr-TR') : ''));
        });
        displayOffers.forEach((o, i) => {
            lines.push('', row(`─── Teklif #${i + 1}: ${o.gonderen_firma_adi || o.gonderen_ad_soyad || o.gonderen_email} ───`));
            const kalemler = Array.isArray(o.kalemler) ? o.kalemler : [];
            if (kalemler.length) { lines.push(row('Kalem', 'Miktar', 'Birim Fiyat', 'Toplam')); kalemler.forEach(k => { const c = k.para_birimi || o.para_birimi || 'TRY'; const t = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0); lines.push(row(k.madde || '', k.miktar || '', k.birim_fiyat || '', t ? formatMoney(t, c) : '')); }); }
            if (notes[String(o.id)]) lines.push(row('Alıcı Notu', notes[String(o.id)]));
        });
        const csv = lines.join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teklifler_${(selectedTender.baslik || selectedTender.id).replace(/[^a-z0-9çğıöşüÇĞİÖŞÜ]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [selectedTender, displayOffers, notes]);

    return {
        sortState, setSortState, sortDropdownRef,
        compareState, setCompareState, displayState, setDisplayState,
        shortlist, notes, showScoringInfo, setShowScoringInfo,
        highlightState, setHighlightState, highlightRef,
        scoredOffers, displayOffers, compareList,
        rawOfferCount: rawOffers.length,
        toggleCompare, toggleShortlist, handleNoteChange, exportOffersCSV,
        // Enes Doğanay | 7 Mayıs 2026: Karşılaştırma listesini temizle
        clearCompare: () => setCompareState(prev => ({ ...prev, ids: [] })),
    };
};

export default useIhaleOfferActions;
