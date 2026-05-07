// Enes Doğanay | 7 Mayıs 2026: FirmaDetay koordinatör — veri, arama, teklif, toast + alt hook'lar
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchFirmaById, fetchFirmaTenders, fetchFirmaEkip,
    fetchUserSessionData, sendQuoteRequestService, fetchSuggestionsService,
} from '../services/firmaDetayService';
import { isMissingRelationError, parseHiyerarsikKategoriler } from '../utils/firmaDetayUtils';
import { useFirmaDetayNotes } from './useFirmaDetayNotes';
import { useFirmaDetayFavorites } from './useFirmaDetayFavorites';

const TENDERS_PREVIEW = 3;
const EMPTY_QUOTE_FORM = { konu: '', mesaj: '', miktar: '', teslim_tarihi: '', teslim_yeri: '' };

export function useFirmaDetay(id) {
    const navigate = useNavigate();
    const [firma, setFirma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firmaEkip, setFirmaEkip] = useState([]);
    const [isVerified, setIsVerified] = useState(false);
    const [tenders, setTenders] = useState([]);
    const [tendersLoading, setTendersLoading] = useState(true);
    const [isTendersTableMissing, setIsTendersTableMissing] = useState(false);
    const [showAllTenders, setShowAllTenders] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [managedCompanyId, setManagedCompanyId] = useState(null);
    const [showEkipModal, setShowEkipModal] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [fdToast, setFdToast] = useState(null);
    const [detaySearch, setDetaySearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteForm, setQuoteFormState] = useState(EMPTY_QUOTE_FORM);
    const [quoteSending, setQuoteSending] = useState(false);
    const [quoteSent, setQuoteSent] = useState(false);
    const [quoteFile, setQuoteFile] = useState(null);

    const sessionUserIdRef = useRef(null);
    const sessionUserEmailRef = useRef(null);
    const fdToastTimerRef = useRef(null);

    const showFdToast = (type, message) => {
        if (fdToastTimerRef.current) clearTimeout(fdToastTimerRef.current);
        setFdToast({ type, message });
        fdToastTimerRef.current = setTimeout(() => setFdToast(null), 3800);
    };

    const notes = useFirmaDetayNotes({ userId: sessionUserIdRef.current, userEmail: sessionUserEmailRef.current, firmaId: id, showFdToast });
    const favorites = useFirmaDetayFavorites({ userId: sessionUserIdRef.current, firmaId: id, showFdToast });

    const fetchFirma = async () => {
        setLoading(true); setTendersLoading(true);
        try {
            const [firmaData, tendersData] = await Promise.all([
                fetchFirmaById(id).catch(() => null),
                fetchFirmaTenders(id).catch(err => ({ __error: err })),
            ]);
            if (firmaData) { setFirma(firmaData); setIsVerified(firmaData?.onayli_hesap === true); fetchFirmaEkip(id).then(notes.setSavedNotes && (ekip => setFirmaEkip(ekip))); }
            if (Array.isArray(tendersData)) { setTenders(tendersData); setIsTendersTableMissing(false); }
            else if (tendersData?.__error) { if (isMissingRelationError(tendersData.__error)) setIsTendersTableMissing(true); setTenders([]); }
        } finally { setLoading(false); setTendersLoading(false); }
    };

    const checkUserSessionAndNotes = async () => {
        const sessionData = await fetchUserSessionData(id);
        if (!sessionData) { setUserProfile(null); setManagedCompanyId(null); return; }
        sessionUserIdRef.current = sessionData.userId;
        sessionUserEmailRef.current = sessionData.userEmail;
        setUserProfile(sessionData.profile);
        setManagedCompanyId(sessionData.managedCompanyId);
        notes.setSavedNotes(sessionData.notes);
        favorites.setMyLists(sessionData.lists);
        if (sessionData.remindersError && !isMissingRelationError(sessionData.remindersError)) console.error('Hatırlatıcılar alınamadı:', sessionData.remindersError);
        notes.setNoteReminders(sessionData.reminders || []);
        if (sessionData.favorite) { favorites.setIsFavorited(true); favorites.setSelectedListId(sessionData.favorite.liste_id || ''); }
    };

    useEffect(() => { fetchFirma(); checkUserSessionAndNotes(); }, [id]);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') setShowEkipModal(false); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (detaySearch.trim().length < 2) { setSuggestions([]); setNoResults(false); return; }
        const timeout = setTimeout(async () => {
            const results = await fetchSuggestionsService(detaySearch);
            setSuggestions(results); setNoResults(results.length === 0);
        }, 300);
        return () => clearTimeout(timeout);
    }, [detaySearch]);

    const handleSuggestionClick = (item) => { setSuggestions([]); setNoResults(false); if (!item) return; setDetaySearch(''); navigate(`/firmadetay/${item.id}`); };
    const handleSearchSubmit = (term) => { setSuggestions([]); setNoResults(false); if (term.trim().length >= 2) navigate(`/firmalar?search=${encodeURIComponent(term.trim())}`); };
    const toggleCategory = (categoryKey) => { const next = new Set(expandedCategories); if (next.has(categoryKey)) next.delete(categoryKey); else next.add(categoryKey); setExpandedCategories(next); };
    const setQuoteField = (field, value) => setQuoteFormState(prev => ({ ...prev, [field]: value }));

    const handleSendQuoteRequest = async () => {
        if (!quoteForm.konu.trim() || !quoteForm.mesaj.trim()) return;
        if (!sessionUserIdRef.current) { showFdToast('info', 'Lütfen önce giriş yapın.'); return; }
        setQuoteSending(true);
        try {
            await sendQuoteRequestService({ firmaId: id, userId: sessionUserIdRef.current, userProfile, managedCompanyId, quoteForm, quoteFile });
            setQuoteSent(true);
            setTimeout(() => { setShowQuoteModal(false); setQuoteSent(false); setQuoteFormState(EMPTY_QUOTE_FORM); setQuoteFile(null); }, 2000);
        } catch { showFdToast('error', 'Teklif talebi gönderilemedi.'); }
        finally { setQuoteSending(false); }
    };

    const adresText = firma?.adres || firma?.il_ilce || '';
    const encodedAddress = encodeURIComponent(adresText);
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const isCurrentUserCompanyManager = Boolean(userProfile && managedCompanyId && String(managedCompanyId) === String(id));

    return {
        firma, loading, firmaEkip, isVerified, isCurrentUserCompanyManager,
        userProfile, managedCompanyId,
        tenders, tendersLoading, isTendersTableMissing, showAllTenders, setShowAllTenders, TENDERS_PREVIEW,
        expandedCategories, toggleCategory, parseHiyerarsikKategoriler,
        detaySearch, setDetaySearch, suggestions, noResults,
        handleSuggestionClick, handleSearchSubmit,
        showQuoteModal, setShowQuoteModal, quoteForm, setQuoteField,
        quoteSending, quoteSent, quoteFile, setQuoteFile, handleSendQuoteRequest,
        showEkipModal, setShowEkipModal,
        fdToast, setFdToast, showFdToast,
        adresText, encodedAddress, googleMapsLink,
        ...notes,
        ...favorites,
    };
}
