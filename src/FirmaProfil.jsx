// Enes Doğanay | 7 Nisan 2026: Kurumsal firma profil sayfası — sidebar layout (bireysel Profil tasarımı gibi)
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { getManagedCompanyId } from './companyManagementApi';
import { useAuth } from './AuthContext';
import CompanyManagementPanel from './CompanyManagementPanel';
import TenderOffersManagement from './TenderOffersManagement';
/* Enes Doğanay | 13 Nisan 2026: Verdiğim Teklifler paneli */
import MyOffersPanel from './MyOffersPanel';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './Profile.css';
import './CompanyManagementPanel.css';
// Enes Doğanay | 2 Mayıs 2026: Profil popup kartı stilleri için
import './TenderOffersManagement.css';
import PageLoader from './PageLoader';

// Enes Doğanay | 7 Nisan 2026: Bildirim kartlarında özet zaman metni
const formatRelativeTime = (isoValue) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
    if (Math.abs(diffMinutes) < 1) return 'Az önce';
    if (Math.abs(diffMinutes) < 60) return `${Math.abs(diffMinutes)} dk ${diffMinutes >= 0 ? 'önce' : 'sonra'}`;
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)} sa ${diffHours >= 0 ? 'önce' : 'sonra'}`;
    const diffDays = Math.round(diffHours / 24);
    return `${Math.abs(diffDays)} gün ${diffDays >= 0 ? 'önce' : 'sonra'}`;
};

// Enes Doğanay | 8 Nisan 2026: Favoriler için yardımcı fonksiyonlar (Profile.jsx ile aynı)
const hashColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`;
};
const getLatestNote = (notes, firmaId) => (notes || []).filter(n => n.firma_id === firmaId).sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))[0];
const getAllNotesForFirma = (notes, firmaId) => (notes || []).filter(n => n.firma_id === firmaId).sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));
const parseNotePayload = (raw) => { if (!raw) return { title: '', tag: '', body: '' }; try { const p = JSON.parse(raw); if (p && typeof p === 'object' && 'body' in p) return { title: p.title || '', tag: p.tag || '', body: p.body || '' }; } catch {} return { title: '', tag: '', body: raw }; };
const serializeNotePayload = (title, tag, body) => JSON.stringify({ title: title || '', tag: tag || '', body: body || '' });
const formatReminderLabel = (v) => { if (!v) return ''; const d = new Date(v); return `${d.toLocaleDateString('tr-TR')} • ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`; };

const FirmaProfil = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'panel';
    // Enes Doğanay | 4 Mayıs 2026: iframe embed modu — sidebar ve header gizlenir
    const isEmbedded = searchParams.get('embedded') === '1';

    // Enes Doğanay | 4 Mayıs 2026: embedded param'ı setSearchParams çağrılarında korur
    const setTab = (params) => {
        if (isEmbedded) setSearchParams({ ...params, embedded: '1' });
        else setSearchParams(params);
    };

    // Enes Doğanay | 4 Mayıs 2026: embedded modda html/body yatay scroll engellenir
    useEffect(() => {
        if (isEmbedded) {
            document.documentElement.style.overflowX = 'hidden';
            document.body.style.overflowX = 'hidden';
        }
        return () => {
            document.documentElement.style.overflowX = '';
            document.body.style.overflowX = '';
        };
    }, [isEmbedded]);

    // Enes Doğanay | 4 Mayıs 2026: embedded modda dark mode — üst sayfanın localStorage değişimini dinle
    useEffect(() => {
        if (!isEmbedded) return;
        const applyTheme = () => {
            const theme = localStorage.getItem('tedport-theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
        };
        // Enes Doğanay | 4 Mayıs 2026: postMessage ile anlık tema senkronizasyonu
        const onMessage = (e) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === 'tedport-theme') {
                document.documentElement.setAttribute('data-theme', e.data.theme);
            }
        };
        applyTheme();
        window.addEventListener('storage', applyTheme);
        window.addEventListener('message', onMessage);
        return () => {
            window.removeEventListener('storage', applyTheme);
            window.removeEventListener('message', onMessage);
        };
    }, [isEmbedded]);

    const [companyId, setCompanyId] = useState(null);
    const [firma, setFirma] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    // Enes Doğanay | 4 Mayıs 2026: Bildirim listesi görüntü limiti
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const FP_NOTIF_LIMIT = 3;

    // Enes Doğanay | 4 Mayıs 2026: Local toast — alert() yerine
    const [fpToast, setFpToast] = useState(null);
    const fpToastTimerRef = useRef(null);
    const showFpToast = (type, message) => {
        if (fpToastTimerRef.current) clearTimeout(fpToastTimerRef.current);
        setFpToast({ type, message });
        fpToastTimerRef.current = setTimeout(() => setFpToast(null), 3800);
    };

    // Enes Doğanay | 7 Nisan 2026: Teklif state'leri
    const [incomingQuotes, setIncomingQuotes] = useState([]);
    const [outgoingQuotes, setOutgoingQuotes] = useState([]);
    const [quotesLoading, setQuotesLoading] = useState(true);
    const [quotesTab, setQuotesTab] = useState('incoming');
    // Enes Doğanay | 10 Nisan 2026: Durum filtreleme state'i
    const [statusFilter, setStatusFilter] = useState('all');
    // Enes Doğanay | 9 Nisan 2026: Giden teklifler için ayrı filtre
    const [outStatusFilter, setOutStatusFilter] = useState('all');
    // Enes Doğanay | 9 Nisan 2026: Reddetme onay state'i
    const [confirmRejectQuoteId, setConfirmRejectQuoteId] = useState(null);
    // Enes Doğanay | 9 Nisan 2026: Sonlandırma onay state'i
    const [confirmCloseQuoteId, setConfirmCloseQuoteId] = useState(null);
    const [activeQuoteChat, setActiveQuoteChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef(null);
    // Enes Doğanay | 2 Mayıs 2026: Mesaj Şikayet state
    const [reportModal, setReportModal] = useState(null); // { mesajId, mesajIcerik }
    const [reportSending, setReportSending] = useState(false);
    const [reportNeden, setReportNeden] = useState('spam');
    const [reportAciklama, setReportAciklama] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);
    // Enes Doğanay | 2 Mayıs 2026: Teklif sahibi profil popup state
    const [quoteContactPopup, setQuoteContactPopup] = useState(null);
    const [qCopied, setQCopied] = useState(null);
    /* Enes Doğanay | 9 Nisan 2026: Sadece mesaj container'ını aşağı kaydır, sayfayı değil */
    const scrollChatToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            const container = chatEndRef.current?.parentElement;
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);
    // Enes Doğanay | 9 Nisan 2026: Teklif silme onay state'i
    const [confirmDeleteQuoteId, setConfirmDeleteQuoteId] = useState(null);

    // Enes Doğanay | 7 Nisan 2026: Bildirim state'leri
    const [notifications, setNotifications] = useState([]);
    // Enes Doğanay | 9 Nisan 2026: Hatırlatma state'i
    const [upcomingReminders, setUpcomingReminders] = useState([]);
    // Enes Doğanay | 10 Nisan 2026: Hatırlatıcı silme onay state'i
    const [confirmDeleteReminder, setConfirmDeleteReminder] = useState(null);

    /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihleri state'i (kurumsal) */
    /* Enes Doğanay | 2 Mayıs 2026: ihale_teklif_mesajlari tercihi eklendi */
    const [notifPrefs, setNotifPrefs] = useState({
      teklif_talepleri: true,
      teklif_yanitlari: true,
      teklif_mesajlari: true,
      hatirlatmalar: true,
      ihale_teklifleri: true,
      ihale_durum_degisiklikleri: true,
      ihale_teklif_mesajlari: true,
      anlik_bildirimler: true
    });
    const [notifPrefsOpen, setNotifPrefsOpen] = useState(false);
    const [notifPrefSaved, setNotifPrefSaved] = useState(false);

    // Enes Doğanay | 8 Nisan 2026: Favoriler state'leri (bireysel profildeki yapının kurumsal kopyası)
    const [myLists, setMyLists] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [favSearch, setFavSearch] = useState('');
    const [favSort, setFavSort] = useState('newest');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [assigningListId, setAssigningListId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmDeleteList, setConfirmDeleteList] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingSavedNoteId, setEditingSavedNoteId] = useState(null);
    const [tempNoteTitle, setTempNoteTitle] = useState('');
    const [tempNoteText, setTempNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [expandedNoteIds, setExpandedNoteIds] = useState([]);
    const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
    const [saveFeedbackFavoriteId, setSaveFeedbackFavoriteId] = useState(null);

    // Enes Doğanay | 4 Mayıs 2026: Ekip yönetimi state'leri
    const [ekip, setEkip] = useState([]);            // { user_id, role, title, first_name, last_name }
    const [ekipLoading, setEkipLoading] = useState(false);
    // Enes Doğanay | 4 Mayıs 2026: null başlangıç — 'owner' default flash'ı önler
    const [myRole, setMyRole] = useState(null);   // mevcut kullanıcının rolü
    const [davetEmail, setDavetEmail] = useState('');
    const [davetRole, setDavetRole] = useState('member');
    const [davetTitle, setDavetTitle] = useState('');
    const [davetSending, setDavetSending] = useState(false);
    const [davetError, setDavetError] = useState(null);
    const [davetSuccess, setDavetSuccess] = useState(false);
    const [bekleyenDavetler, setBekleyenDavetler] = useState([]);
    const [confirmRemoveMember, setConfirmRemoveMember] = useState(null); // { user_id, name }
    const [editingMember, setEditingMember] = useState(null); // { user_id, title, role }
    // Enes Doğanay | 4 Mayıs 2026: Sayfa bazlı yetki düzenlemesi — hangi üye hangi sayfayı görebilir
    const [editingPermissions, setEditingPermissions] = useState(null); // { user_id } | null
    // Enes Doğanay | 4 Mayıs 2026: Firma geneli ekip görünürlüğü — detay sayfasında göster/gizle
    const [showEkipPublic, setShowEkipPublic] = useState(true);
    const [ekipVisibilitySaving, setEkipVisibilitySaving] = useState(false);

    // ── İlk yükleme ──
    useEffect(() => {
        const init = async () => {
            const cid = await getManagedCompanyId();
            if (!cid) { navigate('/'); return; }
            setCompanyId(cid);

            // Enes Doğanay | 10 Nisan 2026: getUser() → getSession() — AuthContext ile yarış önlenir (AbortError)
            const { data: { session: userSession } } = await supabase.auth.getSession();
            if (!userSession?.user) { navigate('/login'); return; }
            setUserId(userSession.user.id);

            const [firmaRes, notifRes, listsRes, favsRes, remindersRes, notifPrefsRes] = await Promise.all([
                supabase.from('firmalar').select('*').eq('firmaID', cid).single(),
                supabase.from('bildirimler').select('*').eq('user_id', userSession.user.id).order('created_at', { ascending: false }).limit(50),
                // Enes Doğanay | 8 Nisan 2026: Favoriler için listeler ve kayıtlar çekilir
                supabase.from('kullanici_listeleri').select('*').eq('user_id', userSession.user.id).order('created_at', { ascending: true }),
                supabase.from('kullanici_favorileri').select('*').eq('user_id', userSession.user.id),
                supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userSession.user.id).in('status', ['pending', 'sent']).order('reminder_at', { ascending: true }),
                /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihlerini çek */
                supabase.from('bildirim_tercihleri').select('*').eq('user_id', userSession.user.id).maybeSingle()
            ]);

            setFirma(firmaRes.data);
            // Enes Doğanay | 4 Mayıs 2026: Firma geneli ekip görünürlüğünü state'e ata
            setShowEkipPublic(firmaRes.data?.show_ekip_public !== false);
            setNotifications(notifRes.data || []);
            setUpcomingReminders((remindersRes.data || []).filter(r => r.status === 'pending'));
            if (listsRes.data) setMyLists(listsRes.data);

            /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihlerini state'e ata */
            if (notifPrefsRes.data) {
              setNotifPrefs({
                teklif_talepleri: notifPrefsRes.data.teklif_talepleri ?? true,
                teklif_yanitlari: notifPrefsRes.data.teklif_yanitlari ?? true,
                teklif_mesajlari: notifPrefsRes.data.teklif_mesajlari ?? true,
                hatirlatmalar: notifPrefsRes.data.hatirlatmalar ?? true,
                ihale_teklifleri: notifPrefsRes.data.ihale_teklifleri ?? true,
                ihale_durum_degisiklikleri: notifPrefsRes.data.ihale_durum_degisiklikleri ?? true,
                // Enes Doğanay | 2 Mayıs 2026: ihale_teklif_mesajlari tercihi eklendi
                ihale_teklif_mesajlari: notifPrefsRes.data.ihale_teklif_mesajlari ?? true,
                anlik_bildirimler: notifPrefsRes.data.anlik_bildirimler ?? true
              });
            }

            // Enes Doğanay | 8 Nisan 2026: Favori firma detaylarını birleştir
            if (favsRes.data && favsRes.data.length > 0) {
                const firmaIds = favsRes.data.map(f => f.firma_id);
                const reminderMap = new Map((remindersRes.data || []).map(r => [String(r.note_id), r]));
                const [firmsData, notesData] = await Promise.all([
                    supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce, logo_url').in('firmaID', firmaIds),
                    supabase.from('kisisel_notlar').select('*').eq('user_id', userSession.user.id).in('firma_id', firmaIds)
                ]);
                setFavorites(favsRes.data.map(fav => {
                    const firm = firmsData.data?.find(f => f.firmaID === fav.firma_id) || {};
                    const allNotes = getAllNotesForFirma(notesData.data, fav.firma_id);
                    const note = getLatestNote(notesData.data, fav.firma_id);
                    const parsedNote = parseNotePayload(note?.not_metni || '');
                    return {
                        id: fav.id, firma_id: fav.firma_id, liste_id: fav.liste_id, created_at: fav.created_at,
                        name: firm.firma_adi || 'Bilinmeyen Firma', category: firm.category_name || 'Kategori Yok',
                        location: firm.il_ilce || 'Konum Yok', note: parsedNote.body,
                        logo_url: firm.logo_url?.includes('firma-logolari') ? firm.logo_url : null,
                        notes: allNotes.map(n => {
                            const p = parseNotePayload(n.not_metni);
                            return { id: n.id, title: p.title, body: p.body, created_at: n.created_at, updated_at: n.updated_at, reminder: reminderMap.get(String(n.id)) || null };
                        }),
                        color: hashColor(fav.firma_id)
                    };
                }));
            } else {
                setFavorites([]);
            }
            setLoading(false);

            // Enes Doğanay | 4 Mayıs 2026: Kullanıcının firmadaki rolünü çek
            const { data: roleRow } = await supabase
                .from('kurumsal_firma_yoneticileri')
                .select('role')
                .eq('user_id', userSession.user.id)
                .eq('firma_id', cid)
                .maybeSingle();
            if (roleRow?.role) setMyRole(roleRow.role);
        };
        init();
    }, [navigate]);

    // ── Teklifleri çek ──
    useEffect(() => {
        if (!companyId) return;
        setQuotesLoading(true);
        const fid = String(companyId);
        Promise.all([
            supabase.from('teklif_talepleri').select('*').eq('firma_id', fid).order('created_at', { ascending: false }),
            supabase.from('teklif_talepleri').select('*').eq('gonderen_firma_id', fid).order('created_at', { ascending: false })
        ]).then(async ([inRes, outRes]) => {
            setIncomingQuotes(inRes.data || []);
            const outRaw = outRes.data || [];
            if (outRaw.length > 0) {
                const ids = [...new Set(outRaw.map(q => q.firma_id))];
                const { data: firms } = await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', ids);
                const map = new Map((firms || []).map(f => [f.firmaID, f.firma_adi]));
                setOutgoingQuotes(outRaw.map(q => ({ ...q, _alici_firma_adi: map.get(q.firma_id) || 'Firma' })));
            } else {
                setOutgoingQuotes([]);
            }
            setQuotesLoading(false);

            // Enes Doğanay | 9 Nisan 2026: URL'deki teklif_id parametresiyle direkt chat aç (toast tıklaması)
            const urlTeklifId = searchParams.get('teklif_id');
            if (urlTeklifId) {
                const tid = parseInt(urlTeklifId, 10);
                const allQuotes = [...(inRes.data || []), ...(outRes.data || [])];
                const targetQuote = allQuotes.find(q => q.id === tid);
                if (targetQuote) {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('teklif_id');
                    setSearchParams(newParams, { replace: true });
                    setTimeout(() => openQuoteChat(targetQuote), 200);
                }
            }
        });
    }, [companyId]);

    // Enes Doğanay | 9 Nisan 2026: Polling — 5 sn'de bir teklif listesini DB'den taze çek
    // Enes Doğanay | 9 Nisan 2026: Son mesajın sender_role'üne göre _displayStatus hesapla
    useEffect(() => {
        if (!companyId) return;
        const fid = String(companyId);
        const fetchQuotes = async () => {
            const [inRes, outRes] = await Promise.all([
                supabase.from('teklif_talepleri').select('*').eq('firma_id', fid).order('created_at', { ascending: false }),
                supabase.from('teklif_talepleri').select('*').eq('gonderen_firma_id', fid).order('created_at', { ascending: false })
            ]);
            // Tüm teklif id'lerini topla ve son mesajları tek sorguda çek
            const allQuotes = [...(inRes.data || []), ...(outRes.data || [])];
            const allIds = allQuotes.map(q => q.id);
            let lastMsgMap = new Map();
            if (allIds.length > 0) {
                const { data: msgs } = await supabase.from('teklif_mesajlari').select('teklif_id, sender_role').in('teklif_id', allIds).order('created_at', { ascending: false });
                for (const msg of (msgs || [])) {
                    if (!lastMsgMap.has(msg.teklif_id)) lastMsgMap.set(msg.teklif_id, msg.sender_role);
                }
            }
            if (inRes.data) {
                const enrichedIn = inRes.data.map(q => {
                    const lastSender = lastMsgMap.get(q.id);
                    let _displayStatus;
                    if (!lastSender) {
                        _displayStatus = q.durum; // pending/read
                    } else if (lastSender === 'company') {
                        _displayStatus = 'replied'; // Biz (firma) cevap attık → Yanıtlandı
                    } else {
                        _displayStatus = 'awaiting_reply'; // Müşteri yazmış → Yanıt Bekleniyor
                    }
                    if (q.durum === 'rejected' || q.durum === 'closed') _displayStatus = q.durum;
                    return { ...q, _displayStatus };
                });
                setIncomingQuotes(prev => {
                    if (prev.length === enrichedIn.length && prev.every((q, i) => q.id === enrichedIn[i]?.id && q._displayStatus === enrichedIn[i]?._displayStatus)) return prev;
                    return enrichedIn;
                });
                setActiveQuoteChat(prev => {
                    if (!prev) return null;
                    const updated = enrichedIn.find(q => q.id === prev.id);
                    if (updated && updated._displayStatus !== prev._displayStatus) return { ...prev, _displayStatus: updated._displayStatus };
                    return prev;
                });
            }
            if (outRes.data) {
                const outRaw = outRes.data;
                if (outRaw.length > 0) {
                    const ids = [...new Set(outRaw.map(q => q.firma_id))];
                    const { data: firms } = await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', ids);
                    const map = new Map((firms || []).map(f => [f.firmaID, f.firma_adi]));
                    const enrichedOut = outRaw.map(q => {
                        const lastSender = lastMsgMap.get(q.id);
                        let _displayStatus;
                        if (!lastSender) {
                            _displayStatus = q.durum;
                        } else if (lastSender === 'company') {
                            _displayStatus = 'awaiting_reply'; // Biz giden teklifte yazdık → Yanıt Bekleniyor
                        } else {
                            _displayStatus = 'replied'; // Karşı taraf yazdı → Yanıt Geldi
                        }
                        if (q.durum === 'rejected' || q.durum === 'closed') _displayStatus = q.durum;
                        return { ...q, _alici_firma_adi: map.get(q.firma_id) || 'Firma', _displayStatus };
                    });
                    setOutgoingQuotes(prev => {
                        if (prev.length === enrichedOut.length && prev.every((q, i) => q.id === enrichedOut[i]?.id && q._displayStatus === enrichedOut[i]?._displayStatus)) return prev;
                        return enrichedOut;
                    });
                    setActiveQuoteChat(prev => {
                        if (!prev) return null;
                        const updated = enrichedOut.find(q => q.id === prev.id);
                        if (updated && updated._displayStatus !== prev._displayStatus) return { ...prev, _displayStatus: updated._displayStatus };
                        return prev;
                    });
                } else {
                    setOutgoingQuotes(prev => prev.length === 0 ? prev : []);
                }
            }
        };
        fetchQuotes();
        const pollInterval = setInterval(fetchQuotes, 5000);
        return () => clearInterval(pollInterval);
    }, [companyId]);

    // Enes Doğanay | 9 Nisan 2026: Hatırlatma polling — 15s'de bir güncelle
    useEffect(() => {
        if (!userId) return;
        const pollReminders = async () => {
            const { data } = await supabase
                .from('kullanici_hatirlaticilari')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['pending', 'sent'])
                .order('reminder_at', { ascending: true });
            if (data) setUpcomingReminders(data.filter(r => r.status === 'pending'));
        };
        const interval = setInterval(pollReminders, 15000);
        return () => clearInterval(interval);
    }, [userId]);

    // Enes Doğanay | 4 Mayıs 2026: bildirimler UPDATE'lerini realtime dinle — TOM/MOP'tan okundu yapılanlar Bildirimler sekmesine anında yansısın
    useEffect(() => {
        if (!userId) return;
        const channel = supabase
            .channel(`fp-notif-updates-${userId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'bildirimler', filter: `user_id=eq.${userId}` },
                (payload) => {
                    setNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n));
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // ── Teklif durum güncelle ──
    const handleQuoteStatusChange = async (quoteId, newStatus) => {
        const { error } = await supabase.from('teklif_talepleri').update({ durum: newStatus }).eq('id', quoteId);
        if (!error) {
            setIncomingQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, durum: newStatus } : q));
            if (activeQuoteChat?.id === quoteId) setActiveQuoteChat(prev => prev ? { ...prev, durum: newStatus } : null);
            // Enes Doğanay | 8 Nisan 2026: Sağ üst menüdeki teklif badge'ini güncelle
            refreshCounts();
            /* Enes Doğanay | 9 Nisan 2026: Reddetme onayını temizle */
            if (newStatus === 'rejected') setConfirmRejectQuoteId(null);
        }
    };

    // Enes Doğanay | 9 Nisan 2026: Teklif chatini aç — sadece gelen teklifte pending→read
    const openQuoteChat = async (quote) => {
        setActiveQuoteChat(quote);
        setChatLoading(true);
        setChatInput('');

        /* Enes Doğanay | 9 Nisan 2026: Teklif açıldığında ilgili okunmamış bildirimleri okundu yap */
        const relatedUnread = notifications.filter(n => !n.is_read && (n.type === 'quote_reply' || n.type === 'quote_message' || n.type === 'quote_received') && n.metadata?.teklif_id === quote.id);
        if (relatedUnread.length > 0) {
            const ids = relatedUnread.map(n => n.id);
            supabase.from('bildirimler').update({ is_read: true }).in('id', ids).then(() => refreshCounts());
            setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
        }

        const { data } = await supabase.from('teklif_mesajlari').select('*').eq('teklif_id', quote.id).order('created_at', { ascending: true });
        // Enes Doğanay | 4 Mayıs 2026: Gönderen bilgilerini ekle (ekip üyeleri için)
        const enriched = await enrichTeklifMessages(data || []);
        setChatMessages(enriched);
        setChatLoading(false);
        const isIncoming = incomingQuotes.some(q => q.id === quote.id);
        if (isIncoming && quote.durum === 'pending') handleQuoteStatusChange(quote.id, 'read');
        scrollChatToBottom(false);
    };

    /* Enes Doğanay | 2 Mayıs 2026: Gelen teklif sahibinin profilini popup olarak aç */
    const openQuoteContact = async (quote) => {
        const name = quote.ad_soyad || '';
        const initials = name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
        const info = { name, initials, email: quote.email, firma: quote.firma_adi || null, phone: null, avatar: null, companyName: null, location: null };
        if (quote.user_id) {
            const { data: prof } = await supabase.from('profiles').select('phone, avatar, company_name, location').eq('id', quote.user_id).maybeSingle();
            if (prof?.phone) info.phone = prof.phone;
            if (prof?.avatar) info.avatar = prof.avatar;
            if (prof?.company_name) info.companyName = prof.company_name;
            if (prof?.location) info.location = prof.location;
        }
        if (quote.gonderen_firma_id) {
            const { data: firma } = await supabase.from('firmalar').select('telefon, eposta').eq('firmaID', quote.gonderen_firma_id).maybeSingle();
            if (firma?.telefon && !info.phone) info.phone = firma.telefon;
        }
        setQuoteContactPopup(info);
    };

    // Enes Doğanay | 9 Nisan 2026: Broadcast + Polling fallback — kurumsal chat anlık mesajlaşma
    const chatChannelRef = useRef(null);
    useEffect(() => {
        if (!activeQuoteChat) {
            if (chatChannelRef.current) { supabase.removeChannel(chatChannelRef.current); chatChannelRef.current = null; }
            return;
        }
        const teklifId = activeQuoteChat.id;
        // Broadcast kanal — RLS'den bağımsız anlık iletim
        const bcChannel = supabase
            .channel(`teklif-chat-bc-${teklifId}`, { config: { broadcast: { ack: true } } })
            .on('broadcast', { event: 'new-message' }, ({ payload }) => {
                if (!payload) return;
                setChatMessages(prev => {
                    if (prev.some(m => m.id === payload.id)) return prev;
                    scrollChatToBottom();
                    return [...prev, payload];
                });
            })
            .subscribe();
        chatChannelRef.current = bcChannel;
        // Polling — her 3 saniyede DB'den tüm mesajları çek (full-replace)
        const pollInterval = setInterval(async () => {
            const { data, error } = await supabase
                .from('teklif_mesajlari')
                .select('*')
                .eq('teklif_id', teklifId)
                .order('created_at', { ascending: true });
            if (error) { console.error('[Polling] teklif_mesajlari hata:', error); return; }
            if (data) {
                setChatMessages(prev => {
                    if (prev.length === data.length && prev.every((m, i) => m.id === data[i]?.id)) return prev;
                    scrollChatToBottom();
                    return data;
                });
            }
        }, 3000);
        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(bcChannel);
            chatChannelRef.current = null;
        };
    }, [activeQuoteChat?.id]);

    /* Enes Doğanay | 9 Nisan 2026: AuthContext'e aktif görüntülenen teklif id'sini bildir — toast bastırma için */
    useEffect(() => {
        setActiveViewingTeklifId(activeQuoteChat?.id || null);
        return () => setActiveViewingTeklifId(null);
    }, [activeQuoteChat?.id]);

    /* Enes Doğanay | 17 Nisan 2026: Teklifler tabından çıkınca activeQuoteChat temizle — aksi halde
       activeViewingTeklifId set kalır ve AuthContext yeni mesajı "kullanıcı chat'te" sanarak toast bastırır */
    useEffect(() => {
        if (currentTab !== 'teklifler') {
            setActiveQuoteChat(null);
        }
    }, [currentTab]);

    // Enes Doğanay | 2 Mayıs 2026: Mesaj şikayet gönder
    const submitReport = async () => {
        if (!reportModal || reportSending) return;
        setReportSending(true);
        const { data: authData } = await supabase.auth.getUser();
        const reporterId = authData?.user?.id;
        if (!reporterId) { setReportSending(false); return; }
        const { error } = await supabase.from('mesaj_sikayetleri').insert([{
            reporter_id: reporterId,
            mesaj_id: String(reportModal.mesajId),
            kaynak: 'teklif_talebi',
            mesaj_icerik: reportModal.mesajIcerik,
            neden: reportNeden,
            aciklama: reportAciklama.trim() || null,
        }]);
        setReportSending(false);
        setReportModal(null);
        setReportNeden('spam');
        setReportAciklama('');
        if (!error) {
            setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3500);
        }
    };

    // ── Chat mesajı gönder ──
    const sendChatMessage = async () => {
        if (!chatInput.trim() || !activeQuoteChat) return;
        setChatSending(true);
        const isIncoming = incomingQuotes.some(q => q.id === activeQuoteChat.id);
        const senderRole = isIncoming ? 'company' : 'user';
        const { data, error } = await supabase.from('teklif_mesajlari')
            .insert([{ teklif_id: activeQuoteChat.id, sender_id: userId, sender_role: senderRole, mesaj: chatInput.trim() }])
            .select().single();
        if (!error && data) {
            // Enes Doğanay | 4 Mayıs 2026: Gönderilen mesajı enrichment ile ekle — 'Firma' fallbackı önle
            const [enriched] = await enrichTeklifMessages([data]);
            setChatMessages(prev => [...prev, enriched || data]);
            setChatInput('');
            // Enes Doğanay | 9 Nisan 2026: Broadcast ile karşı tarafa mesajı anlık ilet
            if (chatChannelRef.current) {
                await chatChannelRef.current.send({ type: 'broadcast', event: 'new-message', payload: data });
            }
            // Enes Doğanay | 9 Nisan 2026: Anlık UI güncellemesi — son mesajı biz attık
            if (isIncoming) {
                // Gelen teklifte biz (firma) cevap attık → Yanıtlandı
                setIncomingQuotes(prev => prev.map(q => q.id === activeQuoteChat.id ? { ...q, _displayStatus: 'replied' } : q));
                setActiveQuoteChat(prev => prev ? { ...prev, _displayStatus: 'replied' } : null);
            } else {
                // Giden teklifte biz yazdık → Yanıt Bekleniyor
                setOutgoingQuotes(prev => prev.map(q => q.id === activeQuoteChat.id ? { ...q, _displayStatus: 'awaiting_reply' } : q));
                setActiveQuoteChat(prev => prev ? { ...prev, _displayStatus: 'awaiting_reply' } : null);
            }
            scrollChatToBottom();
        }
        setChatSending(false);
    };

    // Enes Doğanay | 9 Nisan 2026: Teklif talebini sil (ek dosya + DB kaydı)
    const handleDeleteQuote = async (quoteId, isIncoming) => {
        const list = isIncoming ? incomingQuotes : outgoingQuotes;
        const quote = list.find(q => q.id === quoteId);
        if (quote?.ek_dosya_url) {
            await supabase.storage.from('teklif-ekleri').remove([quote.ek_dosya_url]);
        }
        const { error } = await supabase.from('teklif_talepleri').delete().eq('id', quoteId);
        if (!error) {
            if (isIncoming) setIncomingQuotes(prev => prev.filter(q => q.id !== quoteId));
            else setOutgoingQuotes(prev => prev.filter(q => q.id !== quoteId));
            if (activeQuoteChat?.id === quoteId) setActiveQuoteChat(null);
        }
        setConfirmDeleteQuoteId(null);
    };

    // Enes Doğanay | 8 Nisan 2026: Sağ üst menü badge'lerini güncellemek için AuthContext refreshCounts
    const { refreshCounts, latestNotification, setActiveViewingTeklifId, updateNotifPrefsCache, ihaleYonetimiUnreadCount, setIhaleYonetimiUnreadCount } = useAuth();

    // Enes Doğanay | 9 Nisan 2026: AuthContext'ten gelen yeni bildirimi listeye ekle
    // Enes Doğanay | 9 Nisan 2026: Kullanıcı zaten ilgili teklifin chat'indeyse bildirimi anında okundu yap
    useEffect(() => {
        if (!latestNotification) return;
        const isQuoteNotif = (latestNotification.type === 'quote_reply' || latestNotification.type === 'quote_message');
        const notifTeklifId = latestNotification.metadata?.teklif_id;

        if (isQuoteNotif && notifTeklifId && activeQuoteChat?.id === notifTeklifId) {
            supabase.from('bildirimler').update({ is_read: true }).eq('id', latestNotification.id).then(() => refreshCounts());
            setNotifications(prev => {
                if (prev.some(n => n.id === latestNotification.id)) return prev;
                return [{ ...latestNotification, is_read: true }, ...prev];
            });
        } else {
            setNotifications(prev => {
                if (prev.some(n => n.id === latestNotification.id)) return prev;
                return [latestNotification, ...prev];
            });
        }
    }, [latestNotification]);

    // ── Bildirim okundu yap ──
    const handleMarkNotificationRead = async (notificationId) => {
        await supabase.from('bildirimler').update({ is_read: true }).eq('id', notificationId);
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        refreshCounts();
    };

    const handleMarkAllNotificationsRead = async () => {
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;
        const ids = unread.map(n => n.id);
        await supabase.from('bildirimler').update({ is_read: true }).in('id', ids);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        refreshCounts();
    };

    // Enes Doğanay | 9 Nisan 2026: Tekil bildirim silme
    const handleDeleteNotification = async (notificationId) => {
        const { error } = await supabase.from('bildirimler').delete().eq('id', notificationId).eq('user_id', userId);
        if (error) {
            console.error('[Bildirim Sil] Hata:', error);
            showFpToast('error', 'Bildirim silinemedi.');
            return;
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        refreshCounts();
    };

    /* Enes Doğanay | 10 Nisan 2026: Hatırlatıcı + bağlı notu silme (onay sonrası) */
    const handleDeleteReminder = async (reminder) => {
        const { error: reminderError } = await supabase
            .from('kullanici_hatirlaticilari')
            .delete()
            .eq('id', reminder.id)
            .eq('user_id', userId);
        if (reminderError) {
            console.error('[Hatırlatıcı Sil] Hata:', reminderError);
            showFpToast('error', 'Hatırlatıcı silinemedi.');
            return;
        }
        if (reminder.note_id) {
            const { error: noteError } = await supabase
                .from('kisisel_notlar')
                .delete()
                .eq('id', reminder.note_id)
                .eq('user_id', userId);
            if (noteError) {
                console.error('[Not Sil] Hata:', noteError);
            }
        }
        setUpcomingReminders(prev => prev.filter(r => r.id !== reminder.id));
        setConfirmDeleteReminder(null);
    };

    // Enes Doğanay | 9 Nisan 2026: Tüm bildirimleri toplu sil
    const handleDeleteAllNotifications = async () => {
        if (notifications.length === 0) return;
        const { error } = await supabase.from('bildirimler').delete().eq('user_id', userId);
        if (error) {
            console.error('[Bildirim Toplu Sil] Hata:', error);
            showFpToast('error', 'Bildirimler silinemedi.');
            return;
        }
        setNotifications([]);
        refreshCounts();
    };

    // Enes Doğanay | 7 Nisan 2026: Bildirimden teklif chatine yönlendir
    const navigateToQuoteFromNotification = (notification) => {
        const teklifId = notification.metadata?.teklif_id;
        if (!teklifId) return;
        setTab({ tab: 'teklifler' });
        if (quote) {
            openQuoteChat(quote);
        }
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
    };

    /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihini toggle et (kurumsal) */
    const handleToggleNotifPref = async (key) => {
      const newValue = !notifPrefs[key];
      const updatedPrefs = { ...notifPrefs, [key]: newValue };
      setNotifPrefs(updatedPrefs);

      try {
        const payload = {
          user_id: userId,
          teklif_talepleri: updatedPrefs.teklif_talepleri,
          teklif_yanitlari: updatedPrefs.teklif_yanitlari,
          teklif_mesajlari: updatedPrefs.teklif_mesajlari,
          hatirlatmalar: updatedPrefs.hatirlatmalar,
          ihale_teklifleri: updatedPrefs.ihale_teklifleri,
          ihale_durum_degisiklikleri: updatedPrefs.ihale_durum_degisiklikleri,
          // Enes Doğanay | 2 Mayıs 2026: ihale_teklif_mesajlari tercihi eklendi
          ihale_teklif_mesajlari: updatedPrefs.ihale_teklif_mesajlari,
          anlik_bildirimler: updatedPrefs.anlik_bildirimler,
          updated_at: new Date().toISOString()
        };

        const { error: upsertErr } = await supabase
          .from('bildirim_tercihleri')
          .upsert(payload, { onConflict: 'user_id' });

        if (upsertErr) {
          console.error('[Bildirim Tercihleri] Upsert hata:', upsertErr);
          showFpToast('error', 'Bildirim tercihi kaydedilemedi: ' + upsertErr.message);
          setNotifPrefs(prev => ({ ...prev, [key]: !newValue }));
          return;
        }

        updateNotifPrefsCache(updatedPrefs);
        setNotifPrefSaved(true);
        setTimeout(() => setNotifPrefSaved(false), 1500);
      } catch (err) {
        console.error('[Bildirim Tercihleri] Beklenmeyen hata:', err);
        setNotifPrefs(prev => ({ ...prev, [key]: !newValue }));
      }
    };

    // Enes Doğanay | 8 Nisan 2026: Favoriler CRUD fonksiyonları (bireysel profildeki yapının kopyası)
    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        const { data, error } = await supabase.from('kullanici_listeleri').insert([{ user_id: userId, liste_adi: newListName }]).select().single();
        if (!error && data) { setMyLists([...myLists, data]); setNewListName(''); setIsCreatingList(false); }
        else showFpToast('error', 'Liste oluşturulamadı.');
    };
    const handleDeleteList = async (listId) => {
        try {
            await supabase.from('kullanici_favorileri').update({ liste_id: null }).eq('user_id', userId).eq('liste_id', listId);
            await supabase.from('kullanici_listeleri').delete().eq('id', listId).eq('user_id', userId);
            setMyLists(prev => prev.filter(l => l.id !== listId));
            setFavorites(prev => prev.map(f => f.liste_id === listId ? { ...f, liste_id: null } : f));
            setSelectedListId(cur => cur === listId ? null : cur);
            setConfirmDeleteList(null);
        } catch { showFpToast('error', 'Liste silinirken bir hata oluştu.'); }
    };
    const handleRemoveFavorite = async (favoriteId) => {
        const { error } = await supabase.from('kullanici_favorileri').delete().eq('id', favoriteId);
        if (!error) { setFavorites(favorites.filter(fav => fav.id !== favoriteId)); setConfirmDelete(null); }
        else showFpToast('error', 'Silme işlemi başarısız oldu.');
    };
    const handleAssignList = async (favoriteId, listId) => {
        const { error } = await supabase.from('kullanici_favorileri').update({ liste_id: listId }).eq('id', favoriteId);
        if (!error) { setFavorites(prev => prev.map(f => f.id === favoriteId ? { ...f, liste_id: listId } : f)); setAssigningListId(null); }
        else showFpToast('error', 'Liste güncellenemedi.');
    };
    const updateFavoriteNotesState = (favoriteId, nextNotes) => {
        const ordered = [...nextNotes].sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));
        setFavorites(prev => prev.map(f => f.id !== favoriteId ? f : { ...f, note: ordered[0]?.body || '', notes: ordered }));
    };
    const handleStartEditingSavedNote = (favoriteId, savedNote) => {
        setEditingNoteId(favoriteId); setEditingSavedNoteId(savedNote.id); setTempNoteTitle(savedNote.title || ''); setTempNoteText(savedNote.body || ''); setPendingDeleteNoteId(null);
    };
    const resetInlineNoteEditor = () => { setEditingNoteId(null); setEditingSavedNoteId(null); setTempNoteTitle(''); setTempNoteText(''); };
    const handleInlineNoteSave = async (firmaId, favId) => {
        setIsSavingNote(true);
        try {
            const now = new Date().toISOString();
            let nextNotes = [];
            if (editingSavedNoteId) {
                const target = favorites.find(f => f.id === favId);
                const saved = target?.notes?.find(n => n.id === editingSavedNoteId);
                await supabase.from('kisisel_notlar').update({ not_metni: serializeNotePayload(tempNoteTitle.trim() || saved?.title || '', '', tempNoteText.trim()), updated_at: now }).eq('id', editingSavedNoteId);
                nextNotes = (target?.notes || []).map(n => n.id === editingSavedNoteId ? { ...n, title: tempNoteTitle.trim(), body: tempNoteText.trim(), updated_at: now } : n);
            } else if (tempNoteText.trim()) {
                const { data: inserted } = await supabase.from('kisisel_notlar').insert([{ user_id: userId, firma_id: firmaId, not_metni: serializeNotePayload(tempNoteTitle.trim(), '', tempNoteText.trim()), updated_at: now }]).select().single();
                const target = favorites.find(f => f.id === favId);
                nextNotes = [{ id: inserted?.id || `${firmaId}-${now}`, title: tempNoteTitle.trim(), body: tempNoteText.trim(), updated_at: now, created_at: now }, ...(target?.notes || [])];
            }
            updateFavoriteNotesState(favId, nextNotes);
            resetInlineNoteEditor();
            setSaveFeedbackFavoriteId(favId);
            setTimeout(() => setSaveFeedbackFavoriteId(cur => cur === favId ? null : cur), 1800);
        } catch { showFpToast('error', 'Not kaydedilirken bir hata oluştu.'); }
        finally { setIsSavingNote(false); }
    };
    const handleDeleteSavedNote = async (favoriteId, noteId) => {
        try {
            await supabase.from('kisisel_notlar').delete().eq('id', noteId);
            const target = favorites.find(f => f.id === favoriteId);
            updateFavoriteNotesState(favoriteId, (target?.notes || []).filter(n => n.id !== noteId));
            if (editingSavedNoteId === noteId) resetInlineNoteEditor();
            setPendingDeleteNoteId(null);
        } catch { showFpToast('error', 'Not silinirken bir hata oluştu.'); }
    };

    // Enes Doğanay | 4 Mayıs 2026: Ekip görünürlüğü bireysel toggle
    const handleVisibilityToggle = async (targetUserId, currentValue) => {
        const newValue = !currentValue;
        const { error } = await supabase.from('kurumsal_firma_yoneticileri')
            .update({ is_public: newValue })
            .eq('user_id', targetUserId)
            .eq('firma_id', String(companyId));
        if (error) {
            console.error('Görünürlük güncellenemedi:', error);
            return;
        }
        setEkip(prev => prev.map(m => m.user_id === targetUserId ? { ...m, is_public: newValue } : m));
    };

    // Enes Doğanay | 4 Mayıs 2026: Firma geneli ekip toggle — firmalar.show_ekip_public güncelle
    const handleEkipPublicToggle = async () => {
        const newValue = !showEkipPublic;
        setEkipVisibilitySaving(true);
        const { error } = await supabase.from('firmalar')
            .update({ show_ekip_public: newValue })
            .eq('firmaID', String(companyId));
        if (error) {
            console.error('Ekip görünürlüğü kaydedilemedi:', error);
        } else {
            setShowEkipPublic(newValue);
        }
        setEkipVisibilitySaving(false);
    };

    // Enes Doğanay | 4 Mayıs 2026: Üye sayfa izinleri güncelleme
    const handlePermissionsUpdate = async (targetUserId, key, value) => {
        const member = ekip.find(m => m.user_id === targetUserId);
        if (!member) return;
        const newPerms = { ...member.page_permissions, [key]: value };
        const { error } = await supabase.from('kurumsal_firma_yoneticileri')
            .update({ page_permissions: newPerms })
            .eq('user_id', targetUserId)
            .eq('firma_id', String(companyId));
        if (error) { console.error('İzin güncellenemedi:', error); return; }
        setEkip(prev => prev.map(m => m.user_id === targetUserId ? { ...m, page_permissions: newPerms } : m));
    };

    useEffect(() => {
        if (currentTab !== 'ekip' || !companyId) return;
        loadEkip();
    }, [currentTab, companyId]);

    const loadEkip = async () => {
        setEkipLoading(true);
        const [ekipRes, davetRes] = await Promise.all([
            supabase.from('firma_ekip_public')
                .select('role, title, joined_at, first_name, last_name')
                .eq('firma_id', String(companyId)),
            supabase.from('firma_davetleri')
                .select('id, invited_email, role, title, status, created_at, expires_at')
                .eq('firma_id', String(companyId))
                .eq('status', 'pending')
        ]);
        // user_id bilgisi için ayrıca çek
        const { data: rawEkip } = await supabase
            .from('kurumsal_firma_yoneticileri')
            .select('user_id, role, title, created_at, is_public, page_permissions')
            .eq('firma_id', String(companyId));
        const DEFAULT_PERMS = { firma_paneli: false, teklif_yonetimi: true, ihale_yonetimi: true, ekip_yonetimi: false };
        if (rawEkip) {
            const userIds = rawEkip.map(r => r.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', userIds);
            const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
            setEkip(rawEkip.map(r => ({
                ...r,
                first_name: profileMap[r.user_id]?.first_name || '',
                last_name: profileMap[r.user_id]?.last_name || '',
                is_public: r.is_public !== false,
                // Enes Doğanay | 4 Mayıs 2026: page_permissions — yoksa varsayılan
                page_permissions: r.page_permissions || DEFAULT_PERMS,
            })));
        }
        setBekleyenDavetler(davetRes.data || []);
        setEkipLoading(false);
    };

    const handleDavetGonder = async () => {
        setDavetError(null);
        if (!davetEmail.trim()) { setDavetError('E-posta adresi girin.'); return; }
        setDavetSending(true);
        try {
            // Kullanıcı Tedport'ta kayıtlı mı?
            const { data: profRes } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', davetEmail.trim().toLowerCase())
                .maybeSingle();
            if (!profRes) {
                setDavetError('Bu e-posta adresiyle kayıtlı bir Tedport hesabı bulunamadı. Çalışanınızdan önce Tedport\'a kayıt olmasını isteyin.');
                setDavetSending(false);
                return;
            }
            // Zaten firmaya bağlı mı?
            const { data: existingMember } = await supabase
                .from('kurumsal_firma_yoneticileri')
                .select('firma_id')
                .eq('user_id', profRes.id)
                .maybeSingle();
            if (existingMember) {
                setDavetError('Bu kullanıcı zaten bir firmaya bağlı.');
                setDavetSending(false);
                return;
            }
            // Enes Doğanay | 4 Mayıs 2026: Varsayılan page_permissions role göre belirlenir
            const defaultPerms = davetRole === 'admin'
                ? { firma_paneli: true,  teklif_yonetimi: true, ihale_yonetimi: true, ekip_yonetimi: false }
                : { firma_paneli: false, teklif_yonetimi: true, ihale_yonetimi: true, ekip_yonetimi: false };
            // Davet oluştur
            const { error } = await supabase.from('firma_davetleri').insert({
                firma_id: String(companyId),
                invited_email: davetEmail.trim().toLowerCase(),
                invited_user_id: profRes.id,
                invited_by: userId,
                role: davetRole,
                title: davetTitle.trim() || null,
                page_permissions: defaultPerms,
            });
            if (error) throw error;
            // Kullanıcıya bildirim gönder
            await supabase.from('bildirimler').insert({
                user_id: profRes.id,
                type: 'firma_daveti',
                title: `${firma?.firma_adi || 'Bir firma'} sizi ekibine davet etti`,
                message: `${firma?.firma_adi || 'Firma'} tarafından ${davetRole === 'admin' ? 'Yönetici' : 'Üye'} olarak davet edildiniz. Profilinizden daveti kabul edebilirsiniz.`,
                metadata: { firma_id: String(companyId), davet_id: null },
                is_read: false,
            });
            setDavetSuccess(true);
            setDavetEmail('');
            setDavetTitle('');
            setDavetRole('member');
            setTimeout(() => setDavetSuccess(false), 3000);
            loadEkip();
        } catch (e) {
            setDavetError('Davet gönderilemedi: ' + (e.message || 'Bilinmeyen hata'));
        } finally {
            setDavetSending(false);
        }
    };

    const handleDavetIptal = async (davetId) => {
        await supabase.from('firma_davetleri').update({ status: 'cancelled' }).eq('id', davetId);
        loadEkip();
    };

    const handleUyeCikar = async (targetUserId) => {
        await supabase.from('kurumsal_firma_yoneticileri').delete()
            .eq('user_id', targetUserId).eq('firma_id', String(companyId));
        setConfirmRemoveMember(null);
        loadEkip();
    };

    const handleRolGuncelle = async (targetUserId, newRole, newTitle) => {
        await supabase.from('kurumsal_firma_yoneticileri')
            .update({ role: newRole, title: newTitle || null })
            .eq('user_id', targetUserId).eq('firma_id', String(companyId));
        setEditingMember(null);
        loadEkip();
    };

    // Enes Doğanay | 4 Mayıs 2026: Teklif mesajlarına gönderen profil bilgisi ekle
    const enrichTeklifMessages = async (messages) => {
        if (!messages || messages.length === 0) return messages;
        const senderIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];
        if (senderIds.length === 0) return messages;
        const [profRes, memberRes] = await Promise.all([
            supabase.from('profiles').select('id, first_name, last_name').in('id', senderIds),
            supabase.from('kurumsal_firma_yoneticileri').select('user_id, role, title, firma_id').in('user_id', senderIds),
        ]);
        const profileMap = Object.fromEntries((profRes.data || []).map(p => [p.id, p]));
        const memberMap = Object.fromEntries((memberRes.data || []).map(m => [m.user_id, m]));
        // Enes Doğanay | 4 Mayıs 2026: Owner sender'lar için firma adını çek
        const ownerFirmaIds = [...new Set((memberRes.data || []).filter(m => m.role === 'owner' && m.firma_id).map(m => m.firma_id))];
        const firmaNameMap = {};
        if (ownerFirmaIds.length > 0) {
            const { data: firmalar } = await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', ownerFirmaIds);
            (firmalar || []).forEach(f => { firmaNameMap[f.firmaID] = f.firma_adi; });
        }
        return messages.map(msg => {
            const member = memberMap[msg.sender_id];
            const isOwner = member?.role === 'owner';
            const firmaAdi = isOwner && member?.firma_id ? firmaNameMap[member.firma_id] : null;
            return {
                ...msg,
                _senderName: firmaAdi || (profileMap[msg.sender_id] ? [profileMap[msg.sender_id].first_name, profileMap[msg.sender_id].last_name].filter(Boolean).join(' ') || null : null),
                _senderRole: member?.role || null,
                _senderTitle: member?.title || null,
                _senderIsFirma: !!firmaAdi,
            };
        });
    };

    // ── Çıkış ──
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <PageLoader />;

    const pendingCount = incomingQuotes.filter(q => q.durum === 'pending').length;

    /* Enes Doğanay | 17 Nisan 2026: Bildirim tercihine göre filtreleme — kapalı tipteki bildirimler görünmez */
    // Enes Doğanay | 2 Mayıs 2026: tender_offer_message tercihi eklendi
    const notifTypeToPrefKey = {
      quote_received: 'teklif_talepleri',
      quote_reply: 'teklif_yanitlari',
      quote_message: 'teklif_mesajlari',
      reminder: 'hatirlatmalar',
      tender_new_offer: 'ihale_teklifleri',
      tender_offer_updated: 'ihale_teklifleri',
      tender_offer_withdrawn: 'ihale_teklifleri',
      tender_offer_status: 'ihale_durum_degisiklikleri',
      tender_updated: 'ihale_durum_degisiklikleri',
      tender_closed: 'ihale_durum_degisiklikleri',
      tender_cancelled: 'ihale_durum_degisiklikleri',
      tender_offer_message: 'ihale_teklif_mesajlari'
    };
    const filteredNotifications = notifications.filter(n => {
      const prefKey = notifTypeToPrefKey[n.type];
      if (prefKey && notifPrefs[prefKey] === false) return false;
      return true;
    });
    const fpVisibleNotifications = showAllNotifications ? filteredNotifications : filteredNotifications.slice(0, FP_NOTIF_LIMIT);
    const fpHasMoreNotifications = filteredNotifications.length > FP_NOTIF_LIMIT;
    const unreadNotifCount = filteredNotifications.filter(n => !n.is_read).length;

    /* Enes Doğanay | 9 Nisan 2026: Okunmamış teklif bildirimlerinin teklif_id'lerini topla — kart üzerinde yeni mesaj göstergesi için */
    const unreadQuoteIds = new Set(
        notifications
            .filter(n => !n.is_read && (n.type === 'quote_reply' || n.type === 'quote_message' || n.type === 'quote_received') && n.metadata?.teklif_id)
            .map(n => n.metadata.teklif_id)
    );

    // Enes Doğanay | 22 Mayıs 2026: Akıllı sıralama — okunmamış mesajlar önce, sonra bekleyen, sonra yanıt bekleniyor, sonra tarih
    const QUOTE_STATUS_SORT = { pending: 0, awaiting_reply: 1, read: 2, replied: 3, closed: 4, rejected: 5 };
    const sortedIncomingQuotes = [...incomingQuotes].sort((a, b) => {
        const aU = unreadQuoteIds.has(a.id) ? 0 : 1;
        const bU = unreadQuoteIds.has(b.id) ? 0 : 1;
        if (aU !== bU) return aU - bU;
        const aOrd = QUOTE_STATUS_SORT[a._displayStatus || a.durum] ?? 2;
        const bOrd = QUOTE_STATUS_SORT[b._displayStatus || b.durum] ?? 2;
        if (aOrd !== bOrd) return aOrd - bOrd;
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    });

    // Enes Doğanay | 8 Nisan 2026: Favori filtreleme + sıralama
    let displayedFavorites = selectedListId ? favorites.filter(fav => fav.liste_id === selectedListId) : [...favorites];
    if (favSearch.trim()) {
        const q = favSearch.toLocaleLowerCase('tr-TR');
        displayedFavorites = displayedFavorites.filter(fav => fav.name.toLocaleLowerCase('tr-TR').includes(q) || fav.category.toLocaleLowerCase('tr-TR').includes(q) || fav.location.toLocaleLowerCase('tr-TR').includes(q));
    }
    if (favSort === 'alpha') displayedFavorites.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    else if (favSort === 'alpha-desc') displayedFavorites.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
    else if (favSort === 'oldest') displayedFavorites.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    else displayedFavorites.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    return (
        <>
            {/* Enes Doğanay | 4 Mayıs 2026: Local toast — alert() yerine */}
            {fpToast && (
                <div style={{
                    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 18px', borderRadius: '12px', maxWidth: '380px', width: 'max-content',
                    boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
                    background: fpToast.type === 'error' ? '#fef2f2' : fpToast.type === 'warning' ? '#fffbeb' : '#eff6ff',
                    border: `1.5px solid ${fpToast.type === 'error' ? '#fca5a5' : fpToast.type === 'warning' ? '#fcd34d' : '#bfdbfe'}`,
                    color: fpToast.type === 'error' ? '#991b1b' : fpToast.type === 'warning' ? '#92400e' : '#1e40af',
                    fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
                    animation: 'fpToastIn 0.22s ease'
                }}>
                    <style>{`@keyframes fpToastIn { from { opacity:0; transform:translate(-50%,10px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
                    <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>
                        {fpToast.type === 'error' ? 'error' : fpToast.type === 'warning' ? 'warning' : 'info'}
                    </span>
                    {fpToast.message}
                    <button onClick={() => setFpToast(null)} style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.55, lineHeight: 1 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    </button>
                </div>
            )}
            {!isEmbedded && <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />}

            <div className="page">
                <div className={`layout${isEmbedded ? ' layout--embedded' : ''}`}>

                    {/* ── SIDEBAR ── */}
                    {!isEmbedded && <aside className="sidebar">
                        <div className="sidebar-user-card">
                            {/* Enes Doğanay | 8 Nisan 2026: Sadece firma-logolari bucket'inden yüklenen logolar kullanılır */}
                            {firma?.logo_url?.includes('firma-logolari') ? (
                                <div className="sidebar-avatar" style={{ backgroundImage: `url(${firma.logo_url})` }} />
                            ) : (
                                <div className="sidebar-avatar sidebar-avatar--placeholder">
                                    {firma?.firma_adi?.charAt(0) || 'F'}
                                </div>
                            )}
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{firma?.firma_adi || 'Firma'}</div>
                                <div className="sidebar-user-company">{firma?.category_name || 'Sektör belirtilmemiş'}</div>
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            <a className={`nav-item ${currentTab === 'panel' ? 'active' : ''}`} onClick={() => setTab({ tab: 'panel' })}>
                                <span className="material-symbols-outlined">storefront</span> Firma Paneli
                            </a>
                            {/* Enes Doğanay | 9 Nisan 2026: Sıralama değiştirildi — Favorilerim öne alındı */}
                            <a className={`nav-item ${currentTab === 'favoriler' ? 'active' : ''}`} onClick={() => setTab({ tab: 'favoriler' })}>
                                <span className="material-symbols-outlined">collections_bookmark</span> Favorilerim
                            </a>
                            <a className={`nav-item ${currentTab === 'teklifler' ? 'active' : ''}`} onClick={() => { setTab({ tab: 'teklifler' }); setActiveQuoteChat(null); }}>
                                <span className="material-symbols-outlined">request_quote</span> Teklif Yönetimi
                                {/* Enes Doğanay | 22 Mayıs 2026: Hem yeni teklif hem okunmamış mesaj içeren teklifler badge'e dahil */}
                                {new Set([...incomingQuotes.filter(q => q.durum === 'pending').map(q => q.id), ...[...unreadQuoteIds]]).size > 0 && (
                                    <span className="nav-item-badge">{new Set([...incomingQuotes.filter(q => q.durum === 'pending').map(q => q.id), ...[...unreadQuoteIds]]).size}</span>
                                )}
                            </a>
                            {/* Enes Doğanay | 13 Nisan 2026: İhale Yönetimi — İhalelerim + Katıldığım İhaleler birleştirildi */}
                            {/* Enes Doğanay | 22 Mayıs 2026: setActiveQuoteChat(null) eklendi — tab geçişinde polling hatası önlenir */}
                            <a className={`nav-item ${currentTab === 'ihale-yonetimi' ? 'active' : ''}`} onClick={() => { setActiveQuoteChat(null); setTab({ tab: 'ihale-yonetimi' }); }}>
                                <span className="material-symbols-outlined">gavel</span> İhale Yönetimi
                                {ihaleYonetimiUnreadCount > 0 && <span className="nav-item-badge">{ihaleYonetimiUnreadCount}</span>}
                            </a>
                            {/* Enes Doğanay | 4 Mayıs 2026: Ekip Yönetimi sekmesi — owner ve admin görür */}
                            {(myRole === 'owner' || myRole === 'admin') && (
                                <a className={`nav-item ${currentTab === 'ekip' ? 'active' : ''}`} onClick={() => setTab({ tab: 'ekip' })}>
                                    <span className="material-symbols-outlined">group</span> Ekip Yönetimi
                                </a>
                            )}
                            <a className={`nav-item ${currentTab === 'bildirimler' ? 'active' : ''}`} onClick={() => setTab({ tab: 'bildirimler' })}>
                                <span className="material-symbols-outlined">notifications</span> Bildirimler
                                {unreadNotifCount > 0 && <span className="nav-item-badge">{unreadNotifCount}</span>}
                            </a>
                            <hr className="sidebar-divider" />
                            <a className="nav-item logout" onClick={handleLogout}>
                                <span className="material-symbols-outlined">logout</span> Çıkış Yap
                            </a>
                        </nav>

                        {/* Enes Doğanay | 8 Nisan 2026: Favoriler sekmesinde sidebar listeleri + istatistik */}
                        {currentTab === 'favoriler' && (
                            <div className="sidebar-lists">
                                <h4>LİSTELERİM</h4>
                                <div className="list-items">
                                    <div className={`list-item ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
                                        <span className="list-item-label"><span className="material-symbols-outlined">folder_special</span> Tüm Favoriler</span>
                                        <span className="list-item-count">{favorites.length}</span>
                                    </div>
                                    {myLists.map(liste => {
                                        const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                                        return (
                                            <div key={liste.id} className={`list-item ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                                                <span className="list-item-label"><span className="material-symbols-outlined">folder</span> {liste.liste_adi}</span>
                                                <span className="list-item-actions">
                                                    <span className="list-item-count">{listCount}</span>
                                                    <button type="button" className="list-item-delete" onClick={(e) => { e.stopPropagation(); setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count: listCount }); }} title="Listeyi sil">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {isCreatingList ? (
                                    <div className="create-list-form">
                                        <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste Adı" />
                                        <div className="create-list-form-actions">
                                            <button className="btn-add" onClick={handleCreateList}><span className="material-symbols-outlined">add</span><span>Ekle</span></button>
                                            <button className="btn-cancel" onClick={() => { setIsCreatingList(false); setNewListName(''); }} title="Vazgeç"><span className="material-symbols-outlined">close</span></button>
                                        </div>
                                    </div>
                                ) : (
                                    <button className="create-list-btn" onClick={() => setIsCreatingList(true)}>
                                        <span className="material-symbols-outlined">add_circle</span> YENİ LİSTE OLUŞTUR
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Enes Doğanay | 9 Nisan 2026: Kayıtlı Tedarikçi sadece favoriler sekmesinde göster */}
                        {currentTab === 'favoriler' && (
                        <div className="sidebar-stats">
                            <div className="sidebar-stats-label">Kayıtlı Tedarikçi</div>
                            <div className="sidebar-stats-value">{favorites.length}</div>
                        </div>
                        )}
                    </aside>}

                    {/* ── CONTENT ── */}
                    <main className="content">

                        {/* Enes Doğanay | 7 Nisan 2026: Tab → Firma Paneli (düzenleme formu) */}
                        {currentTab === 'panel' && firma && (
                            <CompanyManagementPanel
                                company={firma}
                                onCompanyUpdated={(updatedCompany) => setFirma(updatedCompany)}
                            />
                        )}

                        {/* Enes Doğanay | 7 Nisan 2026: Tab → Teklifler (gelen + giden + chat) */}
                        {currentTab === 'teklifler' && (
                            <div className="firma-profil-section">
                                {activeQuoteChat ? (() => {
                                    const q = activeQuoteChat;
                                    const isIncoming = incomingQuotes.some(iq => iq.id === q.id);
                                    // Enes Doğanay | 9 Nisan 2026: Chat başlığı — son mesaja göre _displayStatus
                                    const displayDurum = q._displayStatus || q.durum;
                                    const stMap = isIncoming
                                        ? { pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı' }
                                        : { pending: 'Beklemede', read: 'Firma Görüntüledi', replied: 'Yanıt Geldi', awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı' };
                                    const st = stMap[displayDurum] || 'Yeni';
                                    return (
                                        <div className="cmp-quote-chat-view">
                                            <button className="quote-chat-back" onClick={() => setActiveQuoteChat(null)}>
                                                <span className="material-symbols-outlined">arrow_back</span> Teklif Listesine Dön
                                            </button>

                                            <div className="quote-chat-header-card">
                                                <div className="quote-chat-header-top">
                                                    <div>
                                                        <h2>{q.konu}</h2>
                                                        {/* Enes Doğanay | 2 Mayıs 2026: Gönderen adına tıklayınca profil popup */}
                                                        <p className="quote-chat-firma">
                                                            {isIncoming
                                                                ? <button className="quote-chat-sender-btn" onClick={() => openQuoteContact(q)} title="Profili Görüntüle">
                                                                    {q.ad_soyad}
                                                                  </button>
                                                                : (q._alici_firma_adi || 'Firma')
                                                            }
                                                            {q.firma_adi ? ` • ${q.firma_adi}` : ''}
                                                        </p>
                                                    </div>
                                                    <span className={`cmp-quote-status cmp-quote-status--${displayDurum}`}>{st}</span>
                                                </div>
                                                <div className="quote-chat-meta">
                                                    {/* Enes Doğanay | 9 Nisan 2026: İkon yerine metin etiketleri + teslim_yeri */}
                                                    {isIncoming && <span className="my-quote-tag"><strong>E-posta:</strong> {q.email}</span>}
                                                    {q.miktar && <span className="my-quote-tag"><strong>Miktar:</strong> {q.miktar}</span>}
                                                    {q.teslim_tarihi && <span className="my-quote-tag"><strong>Talep Edilen Teslim Tarihi:</strong> {new Date(q.teslim_tarihi).toLocaleDateString('tr-TR')}</span>}
                                                    {q.teslim_yeri && <span className="my-quote-tag"><strong>Teslim Yeri:</strong> {q.teslim_yeri}</span>}
                                                </div>
                                                {/* Enes Doğanay | 9 Nisan 2026: Ek dosya görüntüleme — gelen teklifte de görünsün */}
                                                {q.ek_dosya_url && q.ek_dosya_adi && (
                                                    <div className="quote-chat-attachment" onClick={async () => {
                                                        const { data } = await supabase.storage.from('teklif-ekleri').createSignedUrl(q.ek_dosya_url, 300);
                                                        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                                    }}>
                                                        <div className="quote-chat-attachment-icon"><span className="material-symbols-outlined">description</span></div>
                                                        <div className="quote-chat-attachment-info">
                                                            <span className="quote-chat-attachment-name">{q.ek_dosya_adi}</span>
                                                            <span className="quote-chat-attachment-hint">Eki görüntülemek için tıklayın</span>
                                                        </div>
                                                        <span className="quote-chat-attachment-open"><span className="material-symbols-outlined">open_in_new</span></span>
                                                    </div>
                                                )}
                                                <div className="quote-chat-initial-msg">
                                                    {/* Enes Doğanay | 9 Nisan 2026: Gelen talep mesajı → Talep detayları */}
                                                    <small>Talep detayları</small>
                                                    <p>{q.mesaj}</p>
                                                </div>
                                                {isIncoming && (
                                                    <div className="cmp-quote-actions" style={{ marginTop: '12px' }}>
                                                        {q.durum !== 'rejected' && q.durum !== 'closed' && (
                                                            confirmRejectQuoteId === q.id ? (
                                                                <div className="cmp-quote-delete-confirm" style={{ display: 'inline-flex' }}>
                                                                    <span>Reddetmek istediğinize emin misiniz?</span>
                                                                    <button className="cmp-quote-delete-btn cmp-quote-delete-btn--yes" onClick={() => handleQuoteStatusChange(q.id, 'rejected')}>Evet</button>
                                                                    <button className="cmp-quote-delete-btn cmp-quote-delete-btn--no" onClick={() => setConfirmRejectQuoteId(null)}>Hayır</button>
                                                                </div>
                                                            ) : (
                                                                <button className="cmp-btn cmp-btn--sm cmp-btn--rejected" onClick={() => setConfirmRejectQuoteId(q.id)}>
                                                                    <span className="material-symbols-outlined">close</span> Reddet
                                                                </button>
                                                            )
                                                        )}
                                                        {q.durum !== 'closed' && q.durum !== 'rejected' && !confirmRejectQuoteId && (
                                                            confirmCloseQuoteId === q.id ? (
                                                                <div className="cmp-quote-delete-confirm" style={{ display: 'inline-flex' }}>
                                                                    <span>Sonlandırmak istediğinize emin misiniz?</span>
                                                                    <button className="cmp-quote-delete-btn cmp-quote-delete-btn--yes" onClick={() => { handleQuoteStatusChange(q.id, 'closed'); setConfirmCloseQuoteId(null); }}>Evet</button>
                                                                    <button className="cmp-quote-delete-btn cmp-quote-delete-btn--no" onClick={() => setConfirmCloseQuoteId(null)}>Hayır</button>
                                                                </div>
                                                            ) : (
                                                                <button className="cmp-btn cmp-btn--sm cmp-btn--closed" onClick={() => setConfirmCloseQuoteId(q.id)}>
                                                                    <span className="material-symbols-outlined">archive</span> Görüşmeyi Sonlandır
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="quote-chat-messages">
                                                {chatLoading ? (
                                                    <div className="quote-chat-loading">Mesajlar yükleniyor...</div>
                                                ) : chatMessages.length === 0 ? (
                                                    <div className="quote-chat-empty">
                                                        <span className="material-symbols-outlined">chat_bubble_outline</span>
                                                        <p>{isIncoming ? 'Henüz yanıt verilmedi. Aşağıdan mesaj göndererek iletişime geçin.' : 'Henüz yanıt gelmedi.'}</p>
                                                    </div>
                                                ) : (
                                                    chatMessages.map((m) => (
                                                        <div key={m.id} className={`quote-chat-bubble ${m.sender_role === 'company' ? (isIncoming ? 'mine' : 'theirs') : (isIncoming ? 'theirs' : 'mine')}`}>
                                                            <div className="quote-chat-bubble-header">
                                                                {m.sender_role === 'company' && isIncoming ? (
                                                                    <strong>
                                                                        {m._senderName || 'Firma'}
                                                                        {m._senderRole && m._senderRole !== 'owner' && (
                                                                            <span className="tom-chat-role-chip tom-chat-role-chip--company">
                                                                                {m._senderRole === 'admin' ? 'Yönetici' : 'Üye'}
                                                                            </span>
                                                                        )}
                                                                    </strong>
                                                                ) : (
                                                                    <strong>{m.sender_role === 'company' ? (isIncoming ? 'Siz (Firma)' : 'Firma') : (isIncoming ? q.ad_soyad : 'Siz')}</strong>
                                                                )}
                                                                <span>{new Date(m.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p>{m.mesaj}</p>
                                                            {/* Enes Doğanay | 2 Mayıs 2026: Şikayet butonu — karşı taraf mesajı */}
                                                            {(m.sender_role === 'company') !== isIncoming && (
                                                                <button className="msg-report-btn" title="Mesajı Şikayet et" onClick={() => { setReportModal({ mesajId: m.id, mesajIcerik: m.mesaj }); setReportNeden('spam'); setReportAciklama(''); }}>
                                                                    <span className="material-symbols-outlined">flag</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                                <div ref={chatEndRef} />
                                            </div>

                                            {q.durum !== 'closed' && q.durum !== 'rejected' && (
                                                <div className="quote-chat-input-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Mesajınızı yazın..."
                                                        value={chatInput}
                                                        onChange={(e) => setChatInput(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                                                        disabled={chatSending}
                                                    />
                                                    <button onClick={sendChatMessage} disabled={chatSending || !chatInput.trim()}>
                                                        <span className="material-symbols-outlined">{chatSending ? 'progress_activity' : 'send'}</span>
                                                    </button>
                                                </div>
                                            )}
                                            {(q.durum === 'closed' || q.durum === 'rejected') && (
                                                <div className="quote-chat-closed-banner">
                                                    <span className="material-symbols-outlined">info</span>
                                                    Bu teklif {q.durum === 'closed' ? 'kapatılmıştır' : 'reddedilmiştir'}. Mesaj gönderemezsiniz.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })() : (
                                    <>
                                        <div className="quotes-hero">
                                            <div>
                                                <h1>Teklif Yönetimi</h1>
                                                <p>Gelen ve gönderdiğiniz teklif taleplerini yönetin.</p>
                                                {/* Enes Doğanay | 9 Nisan 2026: Badge başlık altına taşındı */}
                                                {pendingCount > 0 && <span className="cmp-quotes-badge" style={{ fontSize: '0.85rem', padding: '4px 12px', marginTop: '8px', display: 'inline-block' }}>{pendingCount} yeni teklif</span>}
                                            </div>
                                        </div>

                                        {/* Enes Doğanay | 7 Nisan 2026: Gelen / Giden tab switcher */}
                                        <div className="cmp-quotes-tabs" style={{ marginBottom: '16px' }}>
                                            {/* Enes Doğanay | 7 Nisan 2026: Tab etiketleri daha anlaşılır hale getirildi */}
                                            <button className={`cmp-quotes-tab ${quotesTab === 'incoming' ? 'active' : ''}`} onClick={() => setQuotesTab('incoming')}>
                                                <span className="material-symbols-outlined">inbox</span> Gelen Teklif Talepleri
                                                {pendingCount > 0 && <span className="cmp-quotes-badge">{pendingCount}</span>}
                                            </button>
                                            <button className={`cmp-quotes-tab ${quotesTab === 'outgoing' ? 'active' : ''}`} onClick={() => setQuotesTab('outgoing')}>
                                                <span className="material-symbols-outlined">outbox</span> İstenen Teklif Talepleri
                                            </button>
                                        </div>

                                        {quotesLoading ? (
                                            <p className="cmp-quotes-empty">Yükleniyor...</p>
                                        ) : quotesTab === 'incoming' ? (
                                            incomingQuotes.length === 0 ? (
                                                <div className="cmp-quotes-empty-state">
                                                    <span className="material-symbols-outlined">inbox</span>
                                                    <p>Henüz teklif talebi gelmedi.</p>
                                                </div>
                                            ) : (
                                                <>
                                                {/* Enes Doğanay | 10 Nisan 2026: Durum filtre butonları */}
                                                <div className="cmp-quotes-status-filter">
                                                    {[{ key: 'all', label: 'Tümü' }, { key: 'pending', label: 'Yeni' }, { key: 'read', label: 'Okundu' }, { key: 'replied', label: 'Yanıtlandı' }, { key: 'awaiting_reply', label: 'Yanıt Bekleniyor' }, { key: 'rejected', label: 'Reddedildi' }, { key: 'closed', label: 'Sonlandırıldı' }].map(f => (
                                                        <button key={f.key} className={`cmp-quotes-status-filter-btn${statusFilter === f.key ? ' active' : ''}`} onClick={() => setStatusFilter(f.key)}>
                                                            {f.label}
                                                            {f.key !== 'all' && <span>({incomingQuotes.filter(q => (q._displayStatus || q.durum) === f.key).length})</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="cmp-quotes-list">
                                                    {(statusFilter === 'all' ? sortedIncomingQuotes : sortedIncomingQuotes.filter(q => (q._displayStatus || q.durum) === statusFilter)).map((q) => {
                                                        const stMap = { pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı' };
                                                        return (
                                                            <article key={q.id} className={`cmp-quote-card${unreadQuoteIds.has(q.id) ? ' cmp-quote-card--new' : ''}`} onClick={() => openQuoteChat(q)} style={{ cursor: 'pointer' }}>
                                                                <div className="cmp-quote-top">
                                                                    <div className="cmp-quote-top-left">
                                                                        <span className={`cmp-quote-status cmp-quote-status--${q._displayStatus || q.durum}`}>{stMap[q._displayStatus || q.durum] || 'Yeni'}</span>
                                                                        {/* Enes Doğanay | 9 Nisan 2026: Okunmamış bildirimi olan tekliflerde "Yeni Mesaj" göstergesi */}
                                                                        {unreadQuoteIds.has(q.id) && <span className="cmp-quote-new-badge">Yeni Mesaj</span>}
                                                                        <strong className="cmp-quote-subject">{q.konu}</strong>
                                                                    </div>
                                                                    <div className="cmp-quote-top-right">
                                                                        <div className="cmp-quote-sender-info">
                                                                            <span className="cmp-quote-sender">{q.ad_soyad}{q.firma_adi ? ` • ${q.firma_adi}` : ''}</span>
                                                                            <span className="cmp-quote-date">{new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                                                        </div>
                                                                        {/* Enes Doğanay | 11 Nisan 2026: Silme butonu satır içine taşındı */}
                                                                        <button className="cmp-quote-delete-trigger" onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuoteId(q.id); }} title="Teklifi Sil">
                                                                            <span className="material-symbols-outlined">delete</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {/* Enes Doğanay | 9 Nisan 2026: İlk mesaj ön izlemesi */}
                                                                <p className="cmp-quote-preview">{q.mesaj}</p>
                                                                {confirmDeleteQuoteId === q.id && (
                                                                    <div className="cmp-quote-delete-confirm" onClick={(e) => e.stopPropagation()}>
                                                                        <span>Silmek istediğinize emin misiniz?</span>
                                                                        <button className="cmp-quote-delete-btn cmp-quote-delete-btn--yes" onClick={(e) => { e.stopPropagation(); handleDeleteQuote(q.id, true); }}>Evet</button>
                                                                        <button className="cmp-quote-delete-btn cmp-quote-delete-btn--no" onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuoteId(null); }}>Hayır</button>
                                                                    </div>
                                                                )}
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                                </>
                                            )
                                        ) : (
                                            outgoingQuotes.length === 0 ? (
                                                <div className="cmp-quotes-empty-state">
                                                    <span className="material-symbols-outlined">outbox</span>
                                                    <p>Henüz teklif talebi göndermediniz.</p>
                                                </div>
                                            ) : (
                                                <>
                                                {/* Enes Doğanay | 9 Nisan 2026: Giden teklifler durum filtresi */}
                                                <div className="cmp-quotes-status-filter">
                                                    {[{ key: 'all', label: 'Tümü' }, { key: 'pending', label: 'Beklemede' }, { key: 'read', label: 'Firma Görüntüledi' }, { key: 'replied', label: 'Yanıt Geldi' }, { key: 'awaiting_reply', label: 'Yanıt Bekleniyor' }, { key: 'rejected', label: 'Reddedildi' }, { key: 'closed', label: 'Sonlandırıldı' }].map(f => (
                                                        <button key={f.key} className={`cmp-quotes-status-filter-btn${outStatusFilter === f.key ? ' active' : ''}`} onClick={() => setOutStatusFilter(f.key)}>
                                                            {f.label}
                                                            {f.key !== 'all' && <span>({outgoingQuotes.filter(q => (q._displayStatus || q.durum) === f.key).length})</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="cmp-quotes-list">
                                                    {(outStatusFilter === 'all' ? outgoingQuotes : outgoingQuotes.filter(q => (q._displayStatus || q.durum) === outStatusFilter)).map((q) => {
                                                        const stMap = { pending: 'Beklemede', read: 'Firma Görüntüledi', replied: 'Yanıt Geldi', awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı' };
                                                        return (
                                                            <article key={q.id} className={`cmp-quote-card${unreadQuoteIds.has(q.id) ? ' cmp-quote-card--new' : ''}`} onClick={() => openQuoteChat(q)} style={{ cursor: 'pointer' }}>
                                                                <div className="cmp-quote-top">
                                                                    <div className="cmp-quote-top-left">
                                                                        <span className={`cmp-quote-status cmp-quote-status--${q._displayStatus || q.durum}`}>{stMap[q._displayStatus || q.durum] || 'Beklemede'}</span>
                                                                        {/* Enes Doğanay | 9 Nisan 2026: Giden tekliflerde de "Yeni Mesaj" göstergesi */}
                                                                        {unreadQuoteIds.has(q.id) && <span className="cmp-quote-new-badge">Yeni Mesaj</span>}
                                                                        <strong className="cmp-quote-subject">{q.konu}</strong>
                                                                    </div>
                                                                    <div className="cmp-quote-top-right">
                                                                        <div className="cmp-quote-sender-info">
                                                                            <span className="cmp-quote-sender">{q._alici_firma_adi}</span>
                                                                            <span className="cmp-quote-date">{new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                                                        </div>
                                                                        {/* Enes Doğanay | 11 Nisan 2026: Giden teklif silme butonu satır içine taşındı */}
                                                                        <button className="cmp-quote-delete-trigger" onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuoteId(q.id); }} title="Teklifi Sil">
                                                                            <span className="material-symbols-outlined">delete</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {/* Enes Doğanay | 9 Nisan 2026: Giden teklif ön izlemesi */}
                                                                <p className="cmp-quote-preview">{q.mesaj}</p>
                                                                {confirmDeleteQuoteId === q.id && (
                                                                    <div className="cmp-quote-delete-confirm" onClick={(e) => e.stopPropagation()}>
                                                                        <span>Silmek istediğinize emin misiniz?</span>
                                                                        <button className="cmp-quote-delete-btn cmp-quote-delete-btn--yes" onClick={(e) => { e.stopPropagation(); handleDeleteQuote(q.id, false); }}>Evet</button>
                                                                        <button className="cmp-quote-delete-btn cmp-quote-delete-btn--no" onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuoteId(null); }}>Hayır</button>
                                                                    </div>
                                                                )}
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                                </>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Enes Doğanay | 22 Mayıs 2026: İhale Yönetimi — display:none ile kalıcı mount.
                            Conditional render yerine CSS hide/show kullanılır; tab geçişlerinde
                            TenderOffersManagement/MyOffersPanel unmount olmaz, Edge Function yeniden çağrılmaz. */}
                        <div style={{ display: currentTab === 'ihale-yonetimi' ? 'block' : 'none' }}>
                            <div className="firma-profil-section">
                                <div className="cmp-quotes-tabs" style={{ marginBottom: '16px' }}>
                                    <button className={`cmp-quotes-tab ${(searchParams.get('subtab') || 'ihalelerim') === 'ihalelerim' ? 'active' : ''}`} onClick={() => setTab({ tab: 'ihale-yonetimi', subtab: 'ihalelerim' })}>
                                        <span className="material-symbols-outlined">gavel</span> İhalelerim
                                    </button>
                                    <button className={`cmp-quotes-tab ${searchParams.get('subtab') === 'katildigim' ? 'active' : ''}`} onClick={() => setTab({ tab: 'ihale-yonetimi', subtab: 'katildigim' })}>
                                        <span className="material-symbols-outlined">assignment_turned_in</span> Katıldığım İhaleler
                                    </button>
                                </div>
                                {companyId && (
                                    <>
                                        <div style={{ display: (searchParams.get('subtab') || 'ihalelerim') === 'ihalelerim' ? 'block' : 'none' }}>
                                            <TenderOffersManagement companyId={companyId} onUnreadCountChange={setIhaleYonetimiUnreadCount} />
                                        </div>
                                        <div style={{ display: searchParams.get('subtab') === 'katildigim' ? 'block' : 'none' }}>
                                            <MyOffersPanel companyId={companyId} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Enes Doğanay | 7 Nisan 2026: Tab → Bildirimler (kurumsal kullanıcı bildirimleri) */}
                        {currentTab === 'bildirimler' && (() => {
                            /* Enes Doğanay | 9 Nisan 2026: Bireysel ile birebir aynı format — hatırlatma paneli dahil */
                            const futureUpcomingReminders = upcomingReminders.filter(r => new Date(r.reminder_at).getTime() > Date.now());
                            const overduePendingReminders = upcomingReminders.filter(r => new Date(r.reminder_at).getTime() <= Date.now());
                            return (
                            <div className="firma-profil-section notifications-section">
                                <div className="notifications-hero">
                                    <div>
                                        <h1>Bildirim Merkezi</h1>
                                        <p>Teklif yanıtları, mesajlar ve hatırlatmalarınız burada.</p>
                                    </div>
                                    {/* Enes Doğanay | 10 Nisan 2026: Bildirim toplu aksiyon butonları */}
                                    <div className="notifications-hero-actions">
                                        <button className="notifications-mark-all" onClick={handleMarkAllNotificationsRead} disabled={unreadNotifCount === 0}>
                                            <span className="material-symbols-outlined">done_all</span>
                                            Okundu
                                        </button>
                                        <button className="notifications-delete-all" onClick={handleDeleteAllNotifications} disabled={notifications.length === 0}>
                                            <span className="material-symbols-outlined">delete_sweep</span>
                                            Temizle
                                        </button>
                                    </div>
                                </div>

                                <div className="notifications-stats-grid">
                                    <div className="notification-stat-card notification-stat-card-unread">
                                        <span className="material-symbols-outlined">mark_email_unread</span>
                                        <strong>{unreadNotifCount}</strong>
                                        <span>Okunmamış</span>
                                    </div>
                                    <div className="notification-stat-card notification-stat-card-reminders">
                                        <span className="material-symbols-outlined">alarm</span>
                                        <strong>{futureUpcomingReminders.length}</strong>
                                        <span>Hatırlatma</span>
                                    </div>
                                </div>

                                {/* Enes Doğanay | 17 Nisan 2026: Bildirim Tercihleri — açılır/kapanır panel (kurumsal) */}
                                <div className="notif-prefs-panel">
                                  <button className="notif-prefs-toggle" onClick={() => setNotifPrefsOpen(p => !p)}>
                                    <div className="notif-prefs-toggle-left">
                                      <span className="material-symbols-outlined">tune</span>
                                      <strong>Bildirim Tercihleri</strong>
                                      {notifPrefSaved && (
                                        <span className="notif-pref-saved-badge">
                                          <span className="material-symbols-outlined">check_circle</span>
                                          Kaydedildi
                                        </span>
                                      )}
                                    </div>
                                    <span className={`material-symbols-outlined notif-prefs-chevron ${notifPrefsOpen ? 'open' : ''}`}>expand_more</span>
                                  </button>

                                  {notifPrefsOpen && (
                                    <div className="notif-prefs-list">
                                      {[
                                        { key: 'teklif_talepleri', icon: 'request_quote', label: 'Teklif Talepleri', desc: 'Yeni teklif talebi geldiğinde bildirim al' },
                                        { key: 'teklif_yanitlari', icon: 'reply', label: 'Teklif Yanıtları', desc: 'Teklif taleplerinize yanıt geldiğinde bildirim al' },
                                        { key: 'teklif_mesajlari', icon: 'chat', label: 'Teklif Mesajları', desc: 'Teklif sohbetlerinde yeni mesaj geldiğinde bildirim al' },
                                        { key: 'hatirlatmalar', icon: 'alarm', label: 'Hatırlatmalar', desc: 'Zamanlanmış hatırlatmalarınız geldiğinde bildirim al' },
                                        { key: 'ihale_teklifleri', icon: 'gavel', label: 'İhale Teklifleri', desc: 'İhalelerinize yeni teklif geldiğinde bildirim al' },
                                        { key: 'ihale_durum_degisiklikleri', icon: 'swap_horiz', label: 'İhale Durum Değişiklikleri', desc: 'İhale tekliflerinizin durumu değiştiğinde bildirim al' },
                                        // Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajları tercihi eklendi
                                        { key: 'ihale_teklif_mesajlari', icon: 'forum', label: 'İhale Teklif Mesajları', desc: 'İhale teklifleriniz üzerinden gelen mesajlarda bildirim al' },
                                        { key: 'anlik_bildirimler', icon: 'notifications_active', label: 'Anlık Bildirimler (Pop-up)', desc: 'Ekranda anlık bildirim pop-up\'ları gösterilsin' }
                                      ].map(item => (
                                        <div key={item.key} className="notif-pref-row">
                                          <div className="notif-pref-info">
                                            <span className="material-symbols-outlined notif-pref-icon">{item.icon}</span>
                                            <div>
                                              <strong>{item.label}</strong>
                                              <p>{item.desc}</p>
                                            </div>
                                          </div>
                                          <button
                                            className={`notif-pref-switch ${notifPrefs[item.key] ? 'active' : ''}`}
                                            onClick={() => handleToggleNotifPref(item.key)}
                                            aria-label={`${item.label} ${notifPrefs[item.key] ? 'açık' : 'kapalı'}`}
                                          >
                                            <span className="notif-pref-switch-knob" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="notifications-grid">
                                    {/* SOL: SON BİLDİRİMLER */}
                                    <section className="notifications-panel notifications-panel-feed">
                                        <div className="notifications-panel-header">
                                            <div>
                                                <h3>Son Bildirimler</h3>
                                                <p>Teklif güncellemeleri ve mesajlarınız</p>
                                            </div>
                                        </div>

                                        {/* Enes Doğanay | 17 Nisan 2026: filteredNotifications — tercih kapalı tipler gizlenir */}
                                        {filteredNotifications.length === 0 ? (
                                            <div className="notifications-empty-state">
                                                <span className="material-symbols-outlined">notifications_none</span>
                                                <p>Henüz bildiriminiz yok. Firmaya teklif geldiğinde veya mesaj aldığınızda burada görünecek.</p>
                                            </div>
                                        ) : (
                                            <div className="notifications-feed-list">
                                                {fpVisibleNotifications.map((notification) => (
                                                    <article
                                                        key={notification.id}
                                                        className={`notification-feed-card ${notification.is_read ? '' : 'unread'} ${(notification.metadata?.teklif_id || notification.metadata?.ihale_id) ? 'clickable' : ''}`}
                                                        onClick={() => {
                                                            /* Enes Doğanay | 13 Nisan 2026: İhale teklif bildirimlerinde ilgili sekmeye yönlendir */
                                                            if (notification.type === 'tender_new_offer' || notification.type === 'tender_offer_updated' || notification.type === 'tender_offer_withdrawn') {
                                                                /* Enes Doğanay | 13 Nisan 2026: İhaleye ve teklif kartına odaklan */
                                                                const params = { tab: 'ihale-yonetimi' };
                                                                if (notification.metadata?.ihale_id) params.ihale = notification.metadata.ihale_id;
                                                                if (notification.metadata?.teklif_user_id) params.teklif_user = notification.metadata.teklif_user_id;
                                                                setTab(params);
                                                                if (!notification.is_read) handleMarkNotificationRead(notification.id);
                                                            } else if (notification.type === 'tender_offer_status') {
                                                                /* Enes Doğanay | 13 Nisan 2026: Teklif durumu bildirimi — İhale Yönetimi > Katıldığım İhaleler */
                                                                if (notification.metadata?.ihale_id) {
                                                                    sessionStorage.setItem('mop_highlight_ihale', String(notification.metadata.ihale_id));
                                                                }
                                                                setTab({ tab: 'ihale-yonetimi', subtab: 'katildigim' });
                                                                if (!notification.is_read) handleMarkNotificationRead(notification.id);
                                                            } else if (notification.type === 'tender_updated' || notification.type === 'tender_closed' || notification.type === 'tender_cancelled') {
                                                                /* Enes Doğanay | 13 Nisan 2026: İhale durumu değişiklik bildirimleri — ilgili ihaleye navigate */
                                                                if (!notification.is_read) handleMarkNotificationRead(notification.id);
                                                                if (notification.metadata?.ihale_id) {
                                                                    navigate(`/ihaleler?ihale=${notification.metadata.ihale_id}`);
                                                                }
                                                            } else if (notification.type === 'tender_offer_message') {
                                                                /* Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajı — TOM chat aç */
                                                                if (!notification.is_read) handleMarkNotificationRead(notification.id);
                                                                if (notification.metadata?.teklif_id) {
                                                                    sessionStorage.setItem('tom_open_teklif_chat', String(notification.metadata.teklif_id));
                                                                }
                                                                setTab({ tab: 'ihale-yonetimi' });
                                                            } else if (notification.metadata?.teklif_id) {
                                                                navigateToQuoteFromNotification(notification);
                                                            }
                                                        }}
                                                        style={{ cursor: (notification.metadata?.teklif_id || notification.metadata?.ihale_id) ? 'pointer' : 'default' }}
                                                    >
                                                        <div className="notification-feed-top">
                                                            <div>
                                                                <span className="notification-feed-type">
                                                                    {notification.type === 'quote_received' ? '📩 Yeni Teklif'
                                                                        : notification.type === 'quote_reply' ? '💬 Yanıt Geldi'
                                                                        : notification.type === 'quote_message' ? '✉️ Yeni Mesaj'
                                                                        : notification.type === 'reminder' ? '⏰ Hatırlatma'
                                                                        : notification.type === 'tender_new_offer' ? '📋 Yeni İhale Teklifi'
                                                                        : notification.type === 'tender_offer_updated' ? '✏️ Teklif Güncellendi'
                                                                        : notification.type === 'tender_offer_status' ? '📊 Teklif Durumu'
                                                                        : notification.type === 'tender_updated' ? '📝 İhale Güncellendi'
                                                                        : notification.type === 'tender_closed' ? '🔒 İhale Kapandı'
                                                                        : notification.type === 'tender_cancelled' ? '❌ İhale İptal'
                                                                        : notification.type === 'tender_offer_withdrawn' ? '↩️ Teklif Geri Çekildi'
                                                                        : notification.type === 'tender_offer_message' ? '💬 İhale Teklif Mesajı'
                                                                        : '🔔 Bildirim'}
                                                                </span>
                                                                <h4>{notification.title}</h4>
                                                            </div>
                                                            <span className="notification-feed-time">{formatRelativeTime(notification.created_at)}</span>
                                                        </div>
                                                        <p>{notification.message}</p>
                                                        <div className="notification-feed-actions">
                                                            {!notification.is_read && (
                                                                <button type="button" className="notification-read-btn" onClick={(e) => { e.stopPropagation(); handleMarkNotificationRead(notification.id); }}>
                                                                    Okundu Yap
                                                                </button>
                                                            )}
                                                            <button type="button" className="notification-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.id); }}>
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </article>
                                                ))}
                                                {/* Enes Doğanay | 4 Mayıs 2026: Tümünü Göster / Gizle */}
                                                {fpHasMoreNotifications && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAllNotifications(v => !v)}
                                                        style={{
                                                            display: 'block', width: '100%', marginTop: '8px',
                                                            padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                                                            background: 'transparent', cursor: 'pointer', fontSize: '0.85rem',
                                                            fontWeight: 600, color: '#4f73f8', fontFamily: 'inherit'
                                                        }}
                                                    >
                                                        {showAllNotifications
                                                            ? 'Daha Az Göster'
                                                            : `Tümünü Göster (${filteredNotifications.length - FP_NOTIF_LIMIT} daha)`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </section>

                                    {/* SAĞ: YAKLAŞAN HATIRLATMALAR */}
                                    <section className="notifications-panel notifications-panel-reminders">
                                        <div className="notifications-panel-header">
                                            <div>
                                                <h3>Yaklaşan Hatırlatmalar</h3>
                                                <p>Planladığınız hatırlatmalar e-postanıza gönderilecek.</p>
                                            </div>
                                        </div>

                                        {futureUpcomingReminders.length === 0 ? (
                                            <div className="notifications-empty-state">
                                                <span className="material-symbols-outlined">alarm_off</span>
                                                <p>Aktif hatırlatmanız yok. Firma notlarından hatırlatma oluşturabilirsiniz.</p>
                                            </div>
                                        ) : (
                                            <div className="upcoming-reminders-list">
                                                {futureUpcomingReminders.map((reminder) => (
                                                    <article key={reminder.id} className="upcoming-reminder-card">
                                                        <div className="upcoming-reminder-top">
                                                            <span className="upcoming-reminder-time">{formatReminderLabel(reminder.reminder_at)}</span>
                                                            <span className="upcoming-reminder-badge">Planlandı</span>
                                                        </div>
                                                        <h4>{reminder.note_title || 'Başlıksız Not'}</h4>
                                                        <p>{reminder.note_body || 'Not içeriği belirtilmemiş.'}</p>
                                                        <div className="upcoming-reminder-actions">
                                                            <button type="button" className="upcoming-reminder-link" onClick={() => navigate(`/firmadetay/${reminder.firma_id}`)}>
                                                                <span className="material-symbols-outlined">open_in_new</span>
                                                                <span>Firmaya Git</span>
                                                            </button>
                                                            {/* Enes Doğanay | 10 Nisan 2026: Tekil hatırlatıcı silme — inline onay */}
                                                            {confirmDeleteReminder?.id === reminder.id ? (
                                                                <span className="reminder-inline-confirm">
                                                                    <span className="reminder-inline-confirm-label">Silinsin mi?</span>
                                                                    <button type="button" className="reminder-inline-confirm-cancel" onClick={() => setConfirmDeleteReminder(null)}>
                                                                        <span className="material-symbols-outlined">close</span>
                                                                    </button>
                                                                    <button type="button" className="reminder-inline-confirm-yes" onClick={() => handleDeleteReminder(reminder)}>
                                                                        <span className="material-symbols-outlined">delete</span>
                                                                    </button>
                                                                </span>
                                                            ) : (
                                                                <button type="button" className="reminder-delete-btn" onClick={() => setConfirmDeleteReminder(reminder)}>
                                                                    <span className="material-symbols-outlined">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        )}

                                        {overduePendingReminders.length > 0 && (
                                            <div className="overdue-reminders-block">
                                                <div className="notifications-panel-subheader">
                                                    <h4>Mail Gönderilecek Hatırlatmalar</h4>
                                                    <p>Bu hatırlatmalarınızın zamanı geldi, e-postanıza iletilmek üzere.</p>
                                                </div>
                                                <div className="upcoming-reminders-list">
                                                    {overduePendingReminders.map((reminder) => (
                                                        <article key={reminder.id} className="upcoming-reminder-card overdue">
                                                            <div className="upcoming-reminder-top">
                                                                <span className="upcoming-reminder-time overdue">{formatReminderLabel(reminder.reminder_at)}</span>
                                                                <span className="upcoming-reminder-badge overdue">Gönderiliyor</span>
                                                            </div>
                                                            <h4>{reminder.note_title || 'Başlıksız Not'}</h4>
                                                            <p>{reminder.note_body || 'Not içeriği belirtilmemiş.'}</p>
                                                            <div className="upcoming-reminder-actions">
                                                                <button type="button" className="upcoming-reminder-link" onClick={() => navigate(`/firmadetay/${reminder.firma_id}`)}>
                                                                    <span className="material-symbols-outlined">open_in_new</span>
                                                                    <span>Firmaya Git</span>
                                                                </button>
                                                                {/* Enes Doğanay | 10 Nisan 2026: Tekil hatırlatıcı silme — inline onay */}
                                                                {confirmDeleteReminder?.id === reminder.id ? (
                                                                    <span className="reminder-inline-confirm">
                                                                        <span className="reminder-inline-confirm-label">Silinsin mi?</span>
                                                                        <button type="button" className="reminder-inline-confirm-cancel" onClick={() => setConfirmDeleteReminder(null)}>
                                                                            <span className="material-symbols-outlined">close</span>
                                                                        </button>
                                                                        <button type="button" className="reminder-inline-confirm-yes" onClick={() => handleDeleteReminder(reminder)}>
                                                                            <span className="material-symbols-outlined">delete</span>
                                                                        </button>
                                                                    </span>
                                                                ) : (
                                                                    <button type="button" className="reminder-delete-btn" onClick={() => setConfirmDeleteReminder(reminder)}>
                                                                        <span className="material-symbols-outlined">delete</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </article>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                            );
                        })()}

                        {/* Enes Doğanay | 4 Mayıs 2026: Tab → Ekip Yönetimi */}
                        {currentTab === 'ekip' && (myRole === 'owner' || myRole === 'admin') && (
                            <div className="ekip-panel">
                                <div className="ekip-panel__header">
                                    <h2><span className="material-symbols-outlined">group</span> Ekip Yönetimi</h2>
                                    <p>Firmanıza çalışan ekleyebilir, rollerini ve unvanlarını yönetebilirsiniz.</p>
                                </div>

                                {/* Enes Doğanay | 4 Mayıs 2026: Firma geneli ekip gösterim toggle */}
                                <div className="ekip-global-visibility-card">
                                    <div className="ekip-global-visibility-info">
                                        <span className="material-symbols-outlined">visibility</span>
                                        <div>
                                            <strong>Ekibimizi Firma Detay Sayfasında Göster</strong>
                                            <p>Kapatırsanız "Ekibi İncele" butonu ve ekip bölümü ziyaretçilere gösterilmez.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`ekip-global-toggle${showEkipPublic ? ' ekip-global-toggle--on' : ''}`}
                                        onClick={handleEkipPublicToggle}
                                        disabled={ekipVisibilitySaving}
                                        aria-label="Ekip görünürlüğünü değiştir"
                                    >
                                        <span className="ekip-global-toggle-knob" />
                                    </button>
                                </div>
                                <div className="ekip-invite-card">
                                    <h3><span className="material-symbols-outlined">person_add</span> Yeni Üye Davet Et</h3>
                                    <div className="ekip-invite-form">
                                        <div className="ekip-invite-row">
                                            <input
                                                type="email"
                                                className="ekip-input"
                                                placeholder="E-posta adresi"
                                                value={davetEmail}
                                                onChange={e => setDavetEmail(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="ekip-input ekip-input--title"
                                                placeholder="Unvan (opsiyonel)"
                                                value={davetTitle}
                                                onChange={e => setDavetTitle(e.target.value)}
                                            />
                                            <select className="ekip-select" value={davetRole} onChange={e => setDavetRole(e.target.value)}>
                                                <option value="admin">Yönetici (Admin)</option>
                                                <option value="member">Üye (Member)</option>
                                            </select>
                                            <button
                                                className="ekip-invite-btn"
                                                onClick={handleDavetGonder}
                                                disabled={davetSending}
                                            >
                                                {davetSending ? 'Gönderiliyor…' : 'Davet Gönder'}
                                            </button>
                                        </div>
                                        {davetError && <p className="ekip-msg ekip-msg--error"><span className="material-symbols-outlined">error</span>{davetError}</p>}
                                        {davetSuccess && <p className="ekip-msg ekip-msg--success"><span className="material-symbols-outlined">check_circle</span>Davet başarıyla gönderildi!</p>}
                                    </div>
                                    {/* Enes Doğanay | 4 Mayıs 2026: Rol ipucu kaldırıldı — erişim page_permissions ile yönetiliyor */}
                                </div>

                                {/* Bekleyen davetler */}
                                {bekleyenDavetler.length > 0 && (
                                    <div className="ekip-section">
                                        <h3 className="ekip-section__title"><span className="material-symbols-outlined">schedule</span> Bekleyen Davetler</h3>
                                        <div className="ekip-list">
                                            {bekleyenDavetler.map(d => (
                                                <div key={d.id} className="ekip-card ekip-card--pending">
                                                    <div className="ekip-card__info">
                                                        <span className="material-symbols-outlined ekip-card__avatar-icon">mail</span>
                                                        <div>
                                                            <strong>{d.invited_email}</strong>
                                                            <span className="ekip-card__meta">
                                                                <span className={`ekip-role-badge ekip-role-badge--${d.role}`}>{d.role === 'admin' ? 'Yönetici' : 'Üye'}</span>
                                                                {d.title && <span className="ekip-card__title-tag">{d.title}</span>}
                                                                · Davet {new Date(d.expires_at) < new Date() ? 'süresi doldu' : `${Math.ceil((new Date(d.expires_at) - Date.now()) / 86400000)} gün geçerli`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button className="ekip-remove-btn" onClick={() => handleDavetIptal(d.id)} title="Daveti iptal et">
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mevcut ekip */}
                                <div className="ekip-section">
                                    <h3 className="ekip-section__title"><span className="material-symbols-outlined">people</span> Ekip Üyeleri</h3>
                                    {ekipLoading ? (
                                        <div className="ekip-loading">Yükleniyor…</div>
                                    ) : (
                                        <div className="ekip-list">
                                            {ekip.map(m => {
                                                const isMe = m.user_id === userId;
                                                const isOwner = m.role === 'owner';
                                                const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ') || 'İsimsiz';
                                                const initials = ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase() || '?';
                                                return (
                                                    <div key={m.user_id} className={`ekip-card${isMe ? ' ekip-card--me' : ''}${!m.is_public ? ' ekip-card--hidden' : ''}`}>
                                                        <div className="ekip-card__info">
                                                            <div className="ekip-card__avatar">{initials}</div>
                                                            <div>
                                                                <strong>{fullName}{isMe && <span className="ekip-me-chip">Siz</span>}</strong>
                                                                <span className="ekip-card__meta">
                                                                    <span className={`ekip-role-badge ekip-role-badge--${m.role}`}>
                                                                        {m.role === 'owner' ? 'Sahip' : m.role === 'admin' ? 'Yönetici' : 'Üye'}
                                                                    </span>
                                                                    {m.title && <span className="ekip-card__title-tag">{m.title}</span>}
                                                                    {/* Enes Doğanay | 4 Mayıs 2026: Gizli üye etiketi */}
                                                                    {!m.is_public && <span className="ekip-hidden-chip">Gizli</span>}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {!isOwner && (
                                                            <div className="ekip-card__actions">
                                                                {/* Enes Doğanay | 4 Mayıs 2026: Görünürlük toggle — detay sayfasında göster/gizle */}
                                                                <button
                                                                    className={`ekip-visibility-btn${m.is_public ? '' : ' ekip-visibility-btn--hidden'}`}
                                                                    onClick={() => handleVisibilityToggle(m.user_id, m.is_public)}
                                                                    title={m.is_public ? 'Detay sayfasında görünür — gizlemek için tıkla' : 'Detay sayfasında gizli — göstermek için tıkla'}
                                                                >
                                                                    <span className="material-symbols-outlined">{m.is_public ? 'visibility' : 'visibility_off'}</span>
                                                                </button>
                                                                {editingMember?.user_id === m.user_id ? (
                                                                    <div className="ekip-edit-inline">
                                                                        <input className="ekip-input ekip-input--sm" value={editingMember.title} onChange={e => setEditingMember(p => ({ ...p, title: e.target.value }))} placeholder="Unvan" />
                                                                        <select className="ekip-select ekip-select--sm" value={editingMember.role} onChange={e => setEditingMember(p => ({ ...p, role: e.target.value }))}>
                                                                            <option value="admin">Yönetici</option>
                                                                            <option value="member">Üye</option>
                                                                        </select>
                                                                        <button className="ekip-save-btn" onClick={() => handleRolGuncelle(m.user_id, editingMember.role, editingMember.title)}>
                                                                            <span className="material-symbols-outlined">check</span>
                                                                        </button>
                                                                        <button className="ekip-cancel-btn" onClick={() => setEditingMember(null)}>
                                                                            <span className="material-symbols-outlined">close</span>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <button className="ekip-edit-btn" onClick={() => setEditingMember({ user_id: m.user_id, role: m.role, title: m.title || '' })} title="Düzenle">
                                                                            <span className="material-symbols-outlined">edit</span>
                                                                        </button>
                                                                        {confirmRemoveMember?.user_id === m.user_id ? (
                                                                            <span className="ekip-confirm-remove">
                                                                                <span>Çıkarılsın mı?</span>
                                                                                <button className="ekip-confirm-yes" onClick={() => handleUyeCikar(m.user_id)}>Evet</button>
                                                                                <button className="ekip-confirm-no" onClick={() => setConfirmRemoveMember(null)}>Hayır</button>
                                                                            </span>
                                                                        ) : (
                                                                            <button className="ekip-remove-btn" onClick={() => setConfirmRemoveMember({ user_id: m.user_id, name: fullName })} title="Ekipten çıkar">
                                                                                <span className="material-symbols-outlined">person_remove</span>
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Enes Doğanay | 4 Mayıs 2026: Sayfa bazlı yetki matrisi */}
                                                        {!isOwner && (
                                                            <div className="ekip-permissions">
                                                                <div className="ekip-permissions-label">
                                                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                                                    Erişebileceği Sayfalar
                                                                </div>
                                                                <div className="ekip-permissions-grid">
                                                                    {[
                                                                        { key: 'firma_paneli',    icon: 'storefront',     label: 'Firma Paneli' },
                                                                        { key: 'teklif_yonetimi', icon: 'request_quote',  label: 'Teklif Yönetimi' },
                                                                        { key: 'ihale_yonetimi',  icon: 'gavel',          label: 'İhale Yönetimi' },
                                                                        { key: 'ekip_yonetimi',   icon: 'group',          label: 'Ekip Yönetimi' },
                                                                    ].map(({ key, icon, label }) => (
                                                                        <label key={key} className={`ekip-perm-item${m.page_permissions?.[key] ? ' ekip-perm-item--on' : ''}`}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!m.page_permissions?.[key]}
                                                                                onChange={e => handlePermissionsUpdate(m.user_id, key, e.target.checked)}
                                                                            />
                                                                            <span className="material-symbols-outlined">{icon}</span>
                                                                            {label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Enes Doğanay | 8 Nisan 2026: Tab → Favoriler (bireysel profildeki yapının kurumsal kopyası) */}
                        {currentTab === 'favoriler' && (
                            <div className="favorites-section">
                                <div className="favorites-header">
                                    <div>
                                        <h1>{selectedListId === null ? 'Tüm Favoriler' : myLists.find(l => l.id === selectedListId)?.liste_adi}</h1>
                                    </div>
                                </div>

                                {/* Mobilde listeler + istatistik */}
                                <div className="mobile-fav-panel">
                                    <div className="mobile-fav-stats">
                                        <span className="material-symbols-outlined">bookmark</span>
                                        <span className="mobile-fav-stats-value">{favorites.length}</span>
                                        <span className="mobile-fav-stats-label">Kayıtlı Tedarikçi</span>
                                    </div>
                                    <div className="mobile-fav-lists">
                                        <div className={`mobile-fav-chip ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
                                            Tümü <span className="chip-count">{favorites.length}</span>
                                        </div>
                                        {myLists.map(liste => {
                                            const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                                            return (
                                                <div key={liste.id} className={`mobile-fav-chip ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                                                    <span className="mobile-fav-chip-label">{liste.liste_adi}</span>
                                                    <span className="chip-count">{listCount}</span>
                                                    <button type="button" className="mobile-fav-chip-delete" onClick={(e) => { e.stopPropagation(); setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count: listCount }); }} title="Listeyi sil">
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        <div className="mobile-fav-chip add-chip" onClick={() => setIsCreatingList(true)}>
                                            <span className="material-symbols-outlined">add</span> Yeni Liste
                                        </div>
                                    </div>
                                    {isCreatingList && (
                                        <div className="mobile-create-list">
                                            <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste adı yazın..." />
                                            <button className="btn-add" onClick={handleCreateList}><span className="material-symbols-outlined">add</span><span>Ekle</span></button>
                                            <button className="btn-cancel" onClick={() => { setIsCreatingList(false); setNewListName(''); }}><span className="material-symbols-outlined">close</span></button>
                                        </div>
                                    )}
                                </div>

                                {/* Enes Doğanay | 9 Nisan 2026: Modern toolbar — arama + sıralama butonları */}
                                <div className="favorites-toolbar">
                                    <div className="fav-search-wrapper">
                                        <span className="material-symbols-outlined">search</span>
                                        <input type="text" className="fav-search-input" placeholder="Firma, kategori veya konum ara..." value={favSearch} onChange={e => setFavSearch(e.target.value)} />
                                        {favSearch && (
                                            <button className="fav-search-clear" onClick={() => setFavSearch('')}>
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="fav-sort-group">
                                        {[{ key: 'newest', label: 'Yeni', icon: 'schedule' }, { key: 'oldest', label: 'Eski', icon: 'history' }, { key: 'alpha', label: 'A-Z', icon: 'sort_by_alpha' }, { key: 'alpha-desc', label: 'Z-A', icon: 'sort_by_alpha' }].map(s => (
                                            <button key={s.key} className={`fav-sort-btn${favSort === s.key ? ' active' : ''}`} onClick={() => setFavSort(s.key)}>
                                                <span className="material-symbols-outlined">{s.icon}</span>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {displayedFavorites.length === 0 ? (
                                    <div className="favorites-empty">
                                        <span className="material-symbols-outlined">{favSearch.trim() ? 'search_off' : 'bookmark_border'}</span>
                                        <p>{favSearch.trim() ? `"${favSearch}" için sonuç bulunamadı.` : 'Bu listede henüz favori firma bulunmuyor.'}</p>
                                        <button onClick={() => favSearch.trim() ? setFavSearch('') : navigate('/firmalar')}>
                                            {favSearch.trim() ? 'Aramayı Temizle' : 'Firmaları Keşfet'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="favorites-grid">
                                        {displayedFavorites.map((fav) => (
                                            <div key={fav.id} className="fav-card">
                                                <div className="fav-menu-wrapper">
                                                    <button className="fav-menu-btn" onClick={() => setOpenMenuId(openMenuId === fav.id ? null : fav.id)}>
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                    {openMenuId === fav.id && (
                                                        <>
                                                            <div className="fav-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                                                            <div className="fav-menu-dropdown">
                                                                <button onClick={() => { setAssigningListId(fav.id); setOpenMenuId(null); }}>
                                                                    <span className="material-symbols-outlined">drive_file_move</span> Listeye Taşı
                                                                </button>
                                                                <button className="danger" onClick={() => { setConfirmDelete({ id: fav.id, name: fav.name }); setOpenMenuId(null); }}>
                                                                    <span className="material-symbols-outlined">delete_outline</span> Favorilerden Çıkar
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {assigningListId === fav.id && (
                                                    <div className="fav-list-assign">
                                                        <div className="fav-list-assign-header">
                                                            <span>Listeye Taşı</span>
                                                            <button onClick={() => setAssigningListId(null)}><span className="material-symbols-outlined">close</span></button>
                                                        </div>
                                                        <div className="fav-list-assign-options">
                                                            <button className={!fav.liste_id ? 'active' : ''} onClick={() => handleAssignList(fav.id, null)}>
                                                                <span className="material-symbols-outlined">folder_special</span> Genel (Listesiz)
                                                            </button>
                                                            {myLists.map(list => (
                                                                <button key={list.id} className={fav.liste_id === list.id ? 'active' : ''} onClick={() => handleAssignList(fav.id, list.id)}>
                                                                    <span className="material-symbols-outlined">folder</span> {list.liste_adi}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Enes Doğanay | 2 Mayıs 2026: logo varsa gerçek logo, yoksa default logo */}
                                                <div className="fav-avatar" style={fav.logo_url ? { background: '#ffffff' } : { background: fav.color }}>
                                                    {fav.logo_url ? (
                                                        <img src={fav.logo_url} alt={fav.name} className="fav-avatar-logo" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                                                    ) : null}
                                                    <img src="/tedport_default_company_logo.png" alt="Logo" className="fav-avatar-logo" style={{ display: fav.logo_url ? 'none' : 'block' }} />
                                                </div>

                                                <div className="fav-body">
                                                    <h3 className="fav-name">
                                                        <span className="fav-name-text" title={fav.name}>{fav.name}</span>
                                                    </h3>
                                                    <div className="fav-meta">
                                                        <span className="material-symbols-outlined">category</span>
                                                        <span className="fav-meta-text">{fav.category}</span>
                                                    </div>
                                                    <div className="fav-meta">
                                                        <span className="material-symbols-outlined">location_on</span>
                                                        <span className="fav-meta-text">{fav.location}</span>
                                                    </div>
                                                    {fav.liste_id && (
                                                        <div className="fav-meta fav-meta-list">
                                                            <span className="material-symbols-outlined">folder</span>
                                                            <span className="fav-meta-text">{myLists.find(l => l.id === fav.liste_id)?.liste_adi || 'Liste'}</span>
                                                        </div>
                                                    )}

                                                    {editingNoteId === fav.id ? (
                                                        <div className="note-editing">
                                                            <div className="note-header">
                                                                <span className="material-symbols-outlined">edit_note</span>
                                                                <span className="note-header-label">{editingSavedNoteId ? 'NOTU DÜZENLE' : 'YENİ NOT EKLE'}</span>
                                                            </div>
                                                            <div className="note-meta-row">
                                                                <input type="text" className="note-meta-input" value={tempNoteTitle} onChange={(e) => setTempNoteTitle(e.target.value)} placeholder="Kısa başlık" maxLength={50} />
                                                            </div>
                                                            <textarea className="note-textarea" value={tempNoteText} onChange={(e) => setTempNoteText(e.target.value)} placeholder="Bu firma hakkında notunuz..." autoFocus />
                                                            <div className="note-actions">
                                                                <button className="note-btn-cancel" onClick={resetInlineNoteEditor}>İptal</button>
                                                                <button className="note-btn-save" onClick={() => handleInlineNoteSave(fav.firma_id, fav.id)} disabled={isSavingNote}>{isSavingNote ? '...' : 'Kaydet'}</button>
                                                            </div>
                                                        </div>
                                                    ) : fav.notes && fav.notes.length > 0 ? (
                                                        <div className="note-display">
                                                            <div className="note-header">
                                                                <span className="note-header-label">
                                                                    <span className="material-symbols-outlined">edit_note</span> NOTLARIM
                                                                </span>
                                                                <div className="note-display-actions">
                                                                    <span className="note-count-chip">{fav.notes.length}</span>
                                                                    <button className="note-edit-link" onClick={() => { setEditingNoteId(fav.id); setEditingSavedNoteId(null); setTempNoteTitle(''); setTempNoteText(''); setPendingDeleteNoteId(null); }}>Yeni Not</button>
                                                                </div>
                                                            </div>
                                                            {saveFeedbackFavoriteId === fav.id && (
                                                                <div className="note-save-feedback">
                                                                    <span className="material-symbols-outlined">check_circle</span> Not kaydedildi
                                                                </div>
                                                            )}
                                                            <div className="note-stack">
                                                                {(expandedNoteIds.includes(fav.id) ? fav.notes : fav.notes.slice(0, 1)).map((savedNote) => (
                                                                    <article key={savedNote.id} className="note-stack-item">
                                                                        <div className="note-stack-meta">
                                                                            <div className="note-stack-meta-main">
                                                                                <span className="note-stack-date">
                                                                                    {new Date(savedNote.updated_at || savedNote.created_at).toLocaleDateString('tr-TR')} • {new Date(savedNote.updated_at || savedNote.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                                {savedNote.reminder && (
                                                                                    <span className={`note-stack-reminder ${savedNote.reminder.status === 'sent' ? 'sent' : ''}`}>
                                                                                        <span className="material-symbols-outlined">notifications</span>
                                                                                        <span>{savedNote.reminder.status === 'sent' ? 'Mail gönderildi' : formatReminderLabel(savedNote.reminder.reminder_at)}</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {pendingDeleteNoteId === savedNote.id ? (
                                                                                <div className="note-stack-delete-confirm">
                                                                                    <span className="note-stack-delete-text">Silinsin mi?</span>
                                                                                    <button type="button" className="note-stack-action note-stack-action-cancel" onClick={() => setPendingDeleteNoteId(null)} title="Vazgeç"><span className="material-symbols-outlined">close</span></button>
                                                                                    <button type="button" className="note-stack-action note-stack-action-delete" onClick={() => handleDeleteSavedNote(fav.id, savedNote.id)} title="Sil"><span className="material-symbols-outlined">delete</span></button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="note-stack-actions">
                                                                                    <button type="button" className="note-stack-action note-stack-action-edit" onClick={() => handleStartEditingSavedNote(fav.id, savedNote)} title="Düzenle"><span className="material-symbols-outlined">edit</span></button>
                                                                                    <button type="button" className="note-stack-action note-stack-action-delete" onClick={() => setPendingDeleteNoteId(savedNote.id)} title="Sil"><span className="material-symbols-outlined">delete</span></button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {savedNote.title && <h4 className="note-stack-title">{savedNote.title}</h4>}
                                                                        <p>{savedNote.body}</p>
                                                                    </article>
                                                                ))}
                                                            </div>
                                                            {fav.notes.length > 1 && (
                                                                <button type="button" className="note-stack-toggle" onClick={() => setExpandedNoteIds(prev => prev.includes(fav.id) ? prev.filter(id => id !== fav.id) : [...prev, fav.id])}>
                                                                    <span className="material-symbols-outlined">{expandedNoteIds.includes(fav.id) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                                                                    {expandedNoteIds.includes(fav.id) ? 'Özet Görünüme Dön' : `${fav.notes.length - 1} Not Daha Gör`}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button type="button" className="note-add-trigger" onClick={() => { setEditingNoteId(fav.id); setEditingSavedNoteId(null); setTempNoteTitle(''); setTempNoteText(''); setPendingDeleteNoteId(null); }}>
                                                            <span className="material-symbols-outlined">add_circle</span> İlk Notu Ekle
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="fav-actions">
                                                    <button className="fav-btn-primary" onClick={() => navigate(`/firmadetay/${fav.firma_id}`)}>
                                                        <span className="material-symbols-outlined">visibility</span> Profili Gör
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Favori silme onay dialog'u */}
                                {confirmDelete && (
                                    <div className="fav-confirm-overlay">
                                        <div className="fav-confirm-card">
                                            <p><strong>{confirmDelete.name}</strong> favorilerden çıkarılsın mı?</p>
                                            <div className="fav-confirm-actions">
                                                <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Vazgeç</button>
                                                <button className="btn-danger" onClick={() => handleRemoveFavorite(confirmDelete.id)}>Çıkar</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Liste silme onay dialog'u */}
                                {confirmDeleteList && (
                                    <div className="fav-confirm-overlay">
                                        <div className="fav-confirm-card">
                                            <p><strong>{confirmDeleteList.name}</strong> listesi silinsin mi?{confirmDeleteList.count > 0 ? ` (${confirmDeleteList.count} favori listesiz kalacak)` : ''}</p>
                                            <div className="fav-confirm-actions">
                                                <button className="btn-cancel" onClick={() => setConfirmDeleteList(null)}>Vazgeç</button>
                                                <button className="btn-danger" onClick={() => handleDeleteList(confirmDeleteList.id)}>Sil</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </main>
                </div>
            </div>

            {/* Enes Doğanay | 2 Mayıs 2026: Teklif talebi gönderen profil popup */}
            {/* Enes Doğanay | 2 Mayıs 2026: Şikayet başarı toast */}
            {reportSuccess && (
                <div className="msg-report-toast">
                    <span className="material-symbols-outlined">check_circle</span>
                    Şikayetiniz alındı. İncelenecektir.
                </div>
            )}
            {/* Enes Doğanay | 2 Mayıs 2026: Mesaj şikayet modal */}
            {reportModal && (
                <div className="msg-report-overlay" onClick={() => !reportSending && setReportModal(null)}>
                    <div className="msg-report-modal" onClick={e => e.stopPropagation()}>
                        <div className="msg-report-modal__header">
                            <span className="material-symbols-outlined">flag</span>
                            <h3>Mesajı Şikayet Et</h3>
                            <button className="msg-report-close" onClick={() => setReportModal(null)} disabled={reportSending}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="msg-report-modal__body">
                            <div className="msg-report-preview">{reportModal.mesajIcerik}</div>
                            <p className="msg-report-label">Şikayet nedeni</p>
                            <div className="msg-report-reasons">
                                {[{value:'spam',label:'Spam / İstenmeyen Mesaj'},{value:'hakaret',label:'Hakaret / İltihap'},{value:'tehdit',label:'Tehdit / Taciz'},{value:'yaniltici',label:'Yanıltıcı / Sahte Teklif'},{value:'diger',label:'Diğer'}].map(r => (
                                    <label key={r.value} className={`msg-report-reason${reportNeden === r.value ? ' selected' : ''}`}>
                                        <input type="radio" name="report-neden" value={r.value} checked={reportNeden === r.value} onChange={() => setReportNeden(r.value)} />
                                        {r.label}
                                    </label>
                                ))}
                            </div>
                            <p className="msg-report-label">Ek açıklama <span>(isteğe bağlı)</span></p>
                            <textarea className="msg-report-textarea" value={reportAciklama} onChange={e => setReportAciklama(e.target.value)} placeholder="Şikayet detayı..." maxLength={500} rows={3} />
                        </div>
                        <div className="msg-report-modal__footer">
                            <button className="msg-report-cancel" onClick={() => setReportModal(null)} disabled={reportSending}>İptal</button>
                            <button className="msg-report-submit" onClick={submitReport} disabled={reportSending}>
                                {reportSending ? <span className="material-symbols-outlined">progress_activity</span> : 'Şikayet Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {quoteContactPopup && (
                <div className="tom-contact-overlay" onClick={() => { setQuoteContactPopup(null); setQCopied(null); }}>
                    <div className="tom-contact-card" onClick={e => e.stopPropagation()}>
                        <div className="tom-contact-card__banner" />
                        <button className="tom-contact-card__close" onClick={() => { setQuoteContactPopup(null); setQCopied(null); }}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="tom-contact-card__avatar">
                            {quoteContactPopup.avatar
                                ? <img src={quoteContactPopup.avatar} alt="" className="tom-contact-card__avatar-img" />
                                : <span className="tom-contact-card__initials">{quoteContactPopup.initials || '?'}</span>
                            }
                        </div>
                        <div className="tom-contact-card__identity">
                            <h3>{quoteContactPopup.name || 'İsimsiz'}</h3>
                            {(quoteContactPopup.companyName || quoteContactPopup.firma)
                                ? <p className="tom-contact-card__firma">
                                    <span className="material-symbols-outlined">business</span>
                                    {quoteContactPopup.companyName || quoteContactPopup.firma}
                                  </p>
                                : <p className="tom-contact-card__firma">Bireysel Tedarikçi</p>
                            }
                            <span className="tom-contact-card__badge">
                                <span className="material-symbols-outlined">verified</span>
                                Kayıtlı Üye
                            </span>
                        </div>
                        <div className="tom-contact-card__rows">
                            {quoteContactPopup.email && (
                                <div className="tom-contact-row tom-contact-row--email">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div className="tom-contact-row__body">
                                        <small>E-posta</small>
                                        <span>{quoteContactPopup.email}</span>
                                    </div>
                                    <div className="tom-contact-row__actions">
                                        <a href={`mailto:${quoteContactPopup.email}`} className="tom-contact-icon-btn" title="Mail gönder">
                                            <span className="material-symbols-outlined">send</span>
                                        </a>
                                        <button className="tom-contact-icon-btn" title="Kopyala" onClick={() => { navigator.clipboard.writeText(quoteContactPopup.email); setQCopied('email'); setTimeout(() => setQCopied(null), 2000); }}>
                                            <span className="material-symbols-outlined">{qCopied === 'email' ? 'check' : 'content_copy'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {quoteContactPopup.phone && (
                                <a href={`tel:${quoteContactPopup.phone}`} className="tom-contact-row">
                                    <span className="material-symbols-outlined">phone</span>
                                    <div className="tom-contact-row__body">
                                        <small>Telefon</small>
                                        <span>{quoteContactPopup.phone}</span>
                                    </div>
                                </a>
                            )}
                            {quoteContactPopup.location && (
                                <div className="tom-contact-row">
                                    <span className="material-symbols-outlined">location_on</span>
                                    <div className="tom-contact-row__body">
                                        <small>Konum</small>
                                        <span>{quoteContactPopup.location}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!quoteContactPopup.email && !quoteContactPopup.phone && (
                            <p className="tom-contact-card__empty">İletişim bilgisi bulunamadı.</p>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};

export default FirmaProfil;
