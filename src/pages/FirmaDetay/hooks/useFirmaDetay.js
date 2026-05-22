// Enes Doğanay | 7 Mayıs 2026: FirmaDetay koordinatör — veri, arama, teklif, toast + alt hook'lar
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    fetchFirmaById, fetchFirmaBySlug, fetchFirmaTenders, fetchFirmaEkip,
    fetchUserSessionData, sendQuoteRequestService, fetchSuggestionsService,
    trackFirmaView, fetchFirmaViewCount,
} from '../services/firmaDetayService';
// Enes Doğanay | 12 Mayıs 2026: Sertifika servisi — onaylı rozet verileri
import { fetchFirmaSertifikalari } from '../../../services/sertifikaService';
import { isMissingRelationError, parseHiyerarsikKategoriler } from '../utils/firmaDetayUtils';
import { useFirmaDetayNotes } from './useFirmaDetayNotes';
import { useFirmaDetayFavorites } from './useFirmaDetayFavorites';
import { containsProfanity, PROFANITY_ERROR_MSG } from '../../../utils/contentModeration';

const TENDERS_PREVIEW = 3;
// Enes Doğanay | 14 Mayıs 2026: miktar/birim kaldırıldı — kalemler dizisiyle yönetiliyor
const EMPTY_QUOTE_FORM = { konu: '', mesaj: '', kalemler: [], teslim_tarihi: '', teslim_yeri: '' };

// Enes Doğanay | 23 Mayıs 2026: slug parametresi — /firmalar/:slug URL dönüşümü
// Enes Doğanay | 23 Mayıs 2026: initialFirma — SSR Server Component'ten gelen firma verisi, client fetch'ini atlar
export function useFirmaDetay(slug, initialFirma = null) {
    const router = useRouter();
    // Enes Doğanay | 23 Mayıs 2026: firmaID slug'dan çözümlenir veya SSR'dan gelir
    const firmaIdRef = useRef(initialFirma?.firmaID || null);
    // Enes Doğanay | 23 Mayıs 2026: SSR'dan initialFirma geldi mi — fetchFirma'da slug fetch'ini atla
    const hasInitialFirmaRef = useRef(!!initialFirma);
    const [firma, setFirma] = useState(initialFirma || null);
    const [loading, setLoading] = useState(!initialFirma);
    const [firmaEkip, setFirmaEkip] = useState([]);
    const [isVerified, setIsVerified] = useState(initialFirma?.onayli_hesap === true);
    // Enes Doğanay | 17 Mayıs 2026: Demo firmalar badge almaz ama Teklif İste açık kalır
    const [isDemo, setIsDemo] = useState(initialFirma?.is_demo === true);
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
    // Enes Doğanay | 11 Mayıs 2026: Gelişmiş arama modu — firmalar sayfasına yönlendirmede kullanılır
    const [detaySearchMode, setDetaySearchMode] = useState('all');
    // Enes Doğanay | 12 Mayıs 2026: Onaylı sertifika rozet listesi
    const [sertifikalar, setSertifikalar] = useState([]);
    // Enes Doğanay | 13 Mayıs 2026: Firma sahibine gösterilen aylık görüntüleme sayısı
    const [viewCount, setViewCount] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteForm, setQuoteFormState] = useState(EMPTY_QUOTE_FORM);
    const [quoteSending, setQuoteSending] = useState(false);
    const [quoteSent, setQuoteSent] = useState(false);
    const [quoteFile, setQuoteFile] = useState(null);
    // Enes Doğanay | 16 Mayıs 2026: Teklif talebi popup'u alan bazlı hata mesajları
    const [fdQuoteFieldError, setFdQuoteFieldError] = useState({ key: '', msg: '' });

    const sessionUserIdRef = useRef(null);
    const sessionUserEmailRef = useRef(null);
    const fdToastTimerRef = useRef(null);

    const showFdToast = (type, message) => {
        if (fdToastTimerRef.current) clearTimeout(fdToastTimerRef.current);
        setFdToast({ type, message });
        fdToastTimerRef.current = setTimeout(() => setFdToast(null), 3800);
    };

    // Enes Doğanay | 8 Mayıs 2026: fdToast timer cleanup — memory leak önleme
    useEffect(() => {
        return () => { if (fdToastTimerRef.current) clearTimeout(fdToastTimerRef.current); };
    }, []);

    const notes = useFirmaDetayNotes({ userId: sessionUserIdRef.current, userEmail: sessionUserEmailRef.current, firmaId: firmaIdRef.current, showFdToast });
    const favorites = useFirmaDetayFavorites({ userId: sessionUserIdRef.current, firmaId: firmaIdRef.current, showFdToast });

    const fetchFirma = async () => {
        // Enes Doğanay | 23 Mayıs 2026: SSR'dan initialFirma geldiyse firma fetch atlanır — tenders/sertifika/ekip hâlâ çekilir
        if (!hasInitialFirmaRef.current) setLoading(true);
        setTendersLoading(true);
        try {
            let id;
            if (hasInitialFirmaRef.current) {
                id = firmaIdRef.current;
            } else {
                const firmaData = await fetchFirmaBySlug(slug).catch(() => null);
                if (!firmaData) { setLoading(false); setTendersLoading(false); return; }
                id = firmaData.firmaID;
                firmaIdRef.current = id;
                setFirma(firmaData);
                setIsVerified(firmaData?.onayli_hesap === true);
                setIsDemo(firmaData?.is_demo === true);
            }
            const [tendersData, sertData] = await Promise.all([
                fetchFirmaTenders(id).catch(err => ({ __error: err })),
                fetchFirmaSertifikalari(id).catch(() => []),
            ]);
            fetchFirmaEkip(id).then(notes.setSavedNotes && (ekip => setFirmaEkip(ekip)));
            if (Array.isArray(tendersData)) { setTenders(tendersData); setIsTendersTableMissing(false); }
            else if (tendersData?.__error) { if (isMissingRelationError(tendersData.__error)) setIsTendersTableMissing(true); setTenders([]); }
            setSertifikalar(Array.isArray(sertData) ? sertData : []);
        } finally {
            if (!hasInitialFirmaRef.current) setLoading(false);
            setTendersLoading(false);
        }
    };

    const checkUserSessionAndNotes = async () => {
        const id = firmaIdRef.current;
        if (!id) return;
        const sessionData = await fetchUserSessionData(id);
        if (!sessionData) { setUserProfile(null); setManagedCompanyId(null); trackFirmaView(id, null); return; }
        sessionUserIdRef.current = sessionData.userId;
        sessionUserEmailRef.current = sessionData.userEmail;
        setUserProfile(sessionData.profile);
        const companyId = sessionData.managedCompanyId;
        setManagedCompanyId(companyId);
        // Enes Doğanay | 13 Mayıs 2026: Görüntüleme kaydı ve analitik
        const isOwner = companyId && String(companyId) === String(id);
        if (!isOwner) {
            trackFirmaView(id, sessionData.userId || null);
        } else {
            fetchFirmaViewCount(id).then(cnt => setViewCount(cnt)).catch(() => {});
        }
        notes.setSavedNotes(sessionData.notes);
        favorites.setMyLists(sessionData.lists);
        if (sessionData.remindersError && !isMissingRelationError(sessionData.remindersError)) { /* sessiz — hatırlatıcı yüklenemedi, kritik değil */ }
        notes.setNoteReminders(sessionData.reminders || []);
        if (sessionData.favorite) { favorites.setIsFavorited(true); favorites.setSelectedListId(sessionData.favorite.liste_id || ''); }
    };

    useEffect(() => { fetchFirma().then(() => checkUserSessionAndNotes()); }, [slug]);

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

    // Enes Doğanay | 23 Mayıs 2026: Öneri tıklaması — slug varsa /firmalar/:slug, yoksa /firmadetay/:id
    const handleSuggestionClick = (item) => { setSuggestions([]); setNoResults(false); if (!item) return; setDetaySearch(''); router.push(item.slug ? `/firmalar/${item.slug}` : `/firmadetay/${item.id}`); };
    const handleSearchSubmit = (term) => {
        setSuggestions([]); setNoResults(false);
        if (term.trim().length < 2) return;
        // Enes Doğanay | 11 Mayıs 2026: searchMode URL param olarak firmalar sayfasına taşınır
        const modeParam = detaySearchMode !== 'all' ? `&searchMode=${detaySearchMode}` : '';
        router.push(`/firmalar?search=${encodeURIComponent(term.trim())}${modeParam}`);
    };
    const toggleCategory = (categoryKey) => { const next = new Set(expandedCategories); if (next.has(categoryKey)) next.delete(categoryKey); else next.add(categoryKey); setExpandedCategories(next); };
    const setQuoteField = (field, value) => {
        setQuoteFormState(prev => ({ ...prev, [field]: value }));
        // Enes Doğanay | 16 Mayıs 2026: Alan değişince hata mesajını temizle
        setFdQuoteFieldError(fe => fe.key === field ? { key: '', msg: '' } : fe);
    };

    // Enes Doğanay | 16 Mayıs 2026: pendingKalem — kullanıcı + basmadan submit ederse otomatik eklenir
    const handleSendQuoteRequest = async (pendingKalem = null) => {
        if (!quoteForm.konu.trim() || !quoteForm.mesaj.trim()) return;
        if (!sessionUserIdRef.current) { showFdToast('info', 'Lütfen önce giriş yapın.'); return; }
        const finalForm = pendingKalem
            ? { ...quoteForm, kalemler: [...(quoteForm.kalemler || []), pendingKalem] }
            : quoteForm;
        // Enes Doğanay | 16 Mayıs 2026: İçerik moderasyonu — başlık, mesaj ve tüm talep kalemleri
        if (containsProfanity(finalForm.konu)) { setFdQuoteFieldError({ key: 'konu', msg: PROFANITY_ERROR_MSG }); return; }
        if (containsProfanity(finalForm.mesaj)) { setFdQuoteFieldError({ key: 'mesaj', msg: PROFANITY_ERROR_MSG }); return; }
        if ((finalForm.kalemler || []).some(k => containsProfanity(k.madde) || containsProfanity(k.aciklama))) {
            setFdQuoteFieldError({ key: 'kalemler', msg: PROFANITY_ERROR_MSG }); return;
        }
        setQuoteSending(true);
        try {
            // Enes Doğanay | 14 Mayıs 2026: managedCompanyId geçirilmiyor — teklif talebi her zaman bireysel
            await sendQuoteRequestService({ firmaId: id, userId: sessionUserIdRef.current, userProfile, quoteForm: finalForm, quoteFile });
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
        firma, loading, firmaEkip, isVerified, isDemo, isCurrentUserCompanyManager,
        userProfile, managedCompanyId,
        tenders, tendersLoading, isTendersTableMissing, showAllTenders, setShowAllTenders, TENDERS_PREVIEW,
        expandedCategories, toggleCategory, parseHiyerarsikKategoriler,
        detaySearch, setDetaySearch, suggestions, noResults,
        detaySearchMode, setDetaySearchMode,
        handleSuggestionClick, handleSearchSubmit,
        sertifikalar,
        viewCount,
        showQuoteModal, setShowQuoteModal, quoteForm, setQuoteField,
        quoteSending, quoteSent, quoteFile, setQuoteFile, handleSendQuoteRequest,
        fdQuoteFieldError, setFdQuoteFieldError,
        showEkipModal, setShowEkipModal,
        fdToast, setFdToast, showFdToast,
        adresText, encodedAddress, googleMapsLink,
        ...notes,
        ...favorites,
    };
}
