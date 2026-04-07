// Enes Doğanay | 7 Nisan 2026: Kurumsal firma profil sayfası — sidebar layout (bireysel Profil tasarımı gibi)
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { getManagedCompanyId } from './companyManagementApi';
import CompanyManagementPanel from './CompanyManagementPanel';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './Profile.css';
import './CompanyManagementPanel.css';
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

    const [companyId, setCompanyId] = useState(null);
    const [firma, setFirma] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Enes Doğanay | 7 Nisan 2026: Teklif state'leri
    const [incomingQuotes, setIncomingQuotes] = useState([]);
    const [outgoingQuotes, setOutgoingQuotes] = useState([]);
    const [quotesLoading, setQuotesLoading] = useState(true);
    const [quotesTab, setQuotesTab] = useState('incoming');
    const [activeQuoteChat, setActiveQuoteChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef(null);

    // Enes Doğanay | 7 Nisan 2026: Bildirim state'leri
    const [notifications, setNotifications] = useState([]);

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

    // ── İlk yükleme ──
    useEffect(() => {
        const init = async () => {
            const cid = await getManagedCompanyId();
            if (!cid) { navigate('/'); return; }
            setCompanyId(cid);

            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) { navigate('/login'); return; }
            setUserId(userData.user.id);

            const [firmaRes, notifRes, listsRes, favsRes, remindersRes] = await Promise.all([
                supabase.from('firmalar').select('*').eq('firmaID', cid).single(),
                supabase.from('bildirimler').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false }).limit(50),
                // Enes Doğanay | 8 Nisan 2026: Favoriler için listeler ve kayıtlar çekilir
                supabase.from('kullanici_listeleri').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: true }),
                supabase.from('kullanici_favorileri').select('*').eq('user_id', userData.user.id),
                supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userData.user.id).in('status', ['pending', 'sent']).order('reminder_at', { ascending: true })
            ]);

            setFirma(firmaRes.data);
            setNotifications(notifRes.data || []);
            if (listsRes.data) setMyLists(listsRes.data);

            // Enes Doğanay | 8 Nisan 2026: Favori firma detaylarını birleştir
            if (favsRes.data && favsRes.data.length > 0) {
                const firmaIds = favsRes.data.map(f => f.firma_id);
                const reminderMap = new Map((remindersRes.data || []).map(r => [String(r.note_id), r]));
                const [firmsData, notesData] = await Promise.all([
                    supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds),
                    supabase.from('kisisel_notlar').select('*').eq('user_id', userData.user.id).in('firma_id', firmaIds)
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
        });
    }, [companyId]);

    // ── Teklif durum güncelle ──
    const handleQuoteStatusChange = async (quoteId, newStatus) => {
        const { error } = await supabase.from('teklif_talepleri').update({ durum: newStatus }).eq('id', quoteId);
        if (!error) {
            setIncomingQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, durum: newStatus } : q));
            if (activeQuoteChat?.id === quoteId) setActiveQuoteChat(prev => prev ? { ...prev, durum: newStatus } : null);
        }
    };

    // ── Teklif chatini aç ──
    const openQuoteChat = async (quote) => {
        setActiveQuoteChat(quote);
        setChatLoading(true);
        setChatInput('');
        const { data } = await supabase.from('teklif_mesajlari').select('*').eq('teklif_id', quote.id).order('created_at', { ascending: true });
        setChatMessages(data || []);
        setChatLoading(false);
        if (quote.durum === 'pending') handleQuoteStatusChange(quote.id, 'read');
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
            setChatMessages(prev => [...prev, data]);
            setChatInput('');
            if (isIncoming && (activeQuoteChat.durum === 'pending' || activeQuoteChat.durum === 'read')) {
                handleQuoteStatusChange(activeQuoteChat.id, 'replied');
            }
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
        setChatSending(false);
    };

    // ── Bildirim okundu yap ──
    const handleMarkNotificationRead = async (notificationId) => {
        await supabase.from('bildirimler').update({ is_read: true }).eq('id', notificationId);
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    };

    const handleMarkAllNotificationsRead = async () => {
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;
        const ids = unread.map(n => n.id);
        await supabase.from('bildirimler').update({ is_read: true }).in('id', ids);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    // Enes Doğanay | 7 Nisan 2026: Bildirimden teklif chatine yönlendir
    const navigateToQuoteFromNotification = (notification) => {
        const teklifId = notification.metadata?.teklif_id;
        if (!teklifId) return;
        setSearchParams({ tab: 'teklifler' });
        const quote = [...incomingQuotes, ...outgoingQuotes].find(q => q.id === teklifId);
        if (quote) {
            openQuoteChat(quote);
        }
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
    };

    // Enes Doğanay | 8 Nisan 2026: Favoriler CRUD fonksiyonları (bireysel profildeki yapının kopyası)
    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        const { data, error } = await supabase.from('kullanici_listeleri').insert([{ user_id: userId, liste_adi: newListName }]).select().single();
        if (!error && data) { setMyLists([...myLists, data]); setNewListName(''); setIsCreatingList(false); }
        else alert('Liste oluşturulamadı.');
    };
    const handleDeleteList = async (listId) => {
        try {
            await supabase.from('kullanici_favorileri').update({ liste_id: null }).eq('user_id', userId).eq('liste_id', listId);
            await supabase.from('kullanici_listeleri').delete().eq('id', listId).eq('user_id', userId);
            setMyLists(prev => prev.filter(l => l.id !== listId));
            setFavorites(prev => prev.map(f => f.liste_id === listId ? { ...f, liste_id: null } : f));
            setSelectedListId(cur => cur === listId ? null : cur);
            setConfirmDeleteList(null);
        } catch { alert('Liste silinirken bir hata oluştu.'); }
    };
    const handleRemoveFavorite = async (favoriteId) => {
        const { error } = await supabase.from('kullanici_favorileri').delete().eq('id', favoriteId);
        if (!error) { setFavorites(favorites.filter(fav => fav.id !== favoriteId)); setConfirmDelete(null); }
        else alert('Silme işlemi başarısız oldu.');
    };
    const handleAssignList = async (favoriteId, listId) => {
        const { error } = await supabase.from('kullanici_favorileri').update({ liste_id: listId }).eq('id', favoriteId);
        if (!error) { setFavorites(prev => prev.map(f => f.id === favoriteId ? { ...f, liste_id: listId } : f)); setAssigningListId(null); }
        else alert('Liste güncellenemedi.');
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
        } catch { alert('Not kaydedilirken bir hata oluştu.'); }
        finally { setIsSavingNote(false); }
    };
    const handleDeleteSavedNote = async (favoriteId, noteId) => {
        try {
            await supabase.from('kisisel_notlar').delete().eq('id', noteId);
            const target = favorites.find(f => f.id === favoriteId);
            updateFavoriteNotesState(favoriteId, (target?.notes || []).filter(n => n.id !== noteId));
            if (editingSavedNoteId === noteId) resetInlineNoteEditor();
            setPendingDeleteNoteId(null);
        } catch { alert('Not silinirken bir hata oluştu.'); }
    };

    // ── Çıkış ──
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <PageLoader />;

    const pendingCount = incomingQuotes.filter(q => q.durum === 'pending').length;
    const unreadNotifCount = notifications.filter(n => !n.is_read).length;

    // Enes Doğanay | 8 Nisan 2026: Favori filtreleme + sıralama
    const displayedFavorites = (() => {
        let result = selectedListId ? favorites.filter(fav => fav.liste_id === selectedListId) : [...favorites];
        if (favSearch.trim()) {
            const q = favSearch.toLocaleLowerCase('tr-TR');
            result = result.filter(fav => fav.name.toLocaleLowerCase('tr-TR').includes(q) || fav.category.toLocaleLowerCase('tr-TR').includes(q) || fav.location.toLocaleLowerCase('tr-TR').includes(q));
        }
        switch (favSort) {
            case 'alpha': return [...result].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            case 'alpha-desc': return [...result].sort((a, b) => b.name.localeCompare(a.name, 'tr'));
            case 'oldest': return [...result].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
            case 'newest': default: return [...result].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        }
    })();

    return (
        <>
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <div className="page">
                <div className="layout">

                    {/* ── SIDEBAR ── */}
                    <aside className="sidebar">
                        <div className="sidebar-user-card">
                            {/* Enes Doğanay | 7 Nisan 2026: Firma logosu yuvarlak, bireysel profil avatar gibi */}
                            {firma?.logo_url ? (
                                <div className="sidebar-avatar" style={{ backgroundImage: `url(${firma.logo_url})` }} />
                            ) : (
                                <div className="sidebar-avatar sidebar-avatar--placeholder">
                                    {firma?.firma_adi?.charAt(0) || 'F'}
                                </div>
                            )}
                            <div>
                                <div className="sidebar-user-name">{firma?.firma_adi || 'Firma'}</div>
                                <div className="sidebar-user-company">{firma?.category_name || 'Sektör belirtilmemiş'}</div>
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            <a className={`nav-item ${currentTab === 'panel' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'panel' })}>
                                <span className="material-symbols-outlined">storefront</span> Firma Paneli
                            </a>
                            <a className={`nav-item ${currentTab === 'teklifler' ? 'active' : ''}`} onClick={() => { setSearchParams({ tab: 'teklifler' }); setActiveQuoteChat(null); }}>
                                <span className="material-symbols-outlined">request_quote</span> Teklifler
                                {pendingCount > 0 && <span className="nav-item-badge">{pendingCount}</span>}
                            </a>
                            <a className={`nav-item ${currentTab === 'bildirimler' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'bildirimler' })}>
                                <span className="material-symbols-outlined">notifications</span> Bildirimler
                                {unreadNotifCount > 0 && <span className="nav-item-badge">{unreadNotifCount}</span>}
                            </a>
                            {/* Enes Doğanay | 8 Nisan 2026: Kurumsal kullanıcıya da favoriler sekmesi eklendi */}
                            <a className={`nav-item ${currentTab === 'favoriler' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'favoriler' })}>
                                <span className="material-symbols-outlined">collections_bookmark</span> Favorilerim
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

                        <div className="sidebar-stats">
                            <div className="sidebar-stats-label">Kayıtlı Tedarikçi</div>
                            <div className="sidebar-stats-value">{favorites.length}</div>
                        </div>
                    </aside>

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
                                    const st = { pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', rejected: 'Reddedildi', closed: 'Kapatıldı' }[q.durum] || 'Yeni';
                                    return (
                                        <div className="cmp-quote-chat-view">
                                            <button className="quote-chat-back" onClick={() => setActiveQuoteChat(null)}>
                                                <span className="material-symbols-outlined">arrow_back</span> Teklif Listesine Dön
                                            </button>

                                            <div className="quote-chat-header-card">
                                                <div className="quote-chat-header-top">
                                                    <div>
                                                        <h2>{q.konu}</h2>
                                                        <p className="quote-chat-firma">{isIncoming ? q.ad_soyad : (q._alici_firma_adi || 'Firma')}{q.firma_adi ? ` • ${q.firma_adi}` : ''}</p>
                                                    </div>
                                                    <span className={`cmp-quote-status cmp-quote-status--${q.durum}`}>{st}</span>
                                                </div>
                                                <div className="quote-chat-meta">
                                                    {isIncoming && <span className="my-quote-tag"><span className="material-symbols-outlined">mail</span>{q.email}</span>}
                                                    {q.miktar && <span className="my-quote-tag"><span className="material-symbols-outlined">inventory_2</span>{q.miktar}</span>}
                                                    {q.teslim_tarihi && <span className="my-quote-tag"><span className="material-symbols-outlined">calendar_month</span>{new Date(q.teslim_tarihi).toLocaleDateString('tr-TR')}</span>}
                                                </div>
                                                <div className="quote-chat-initial-msg">
                                                    <small>{isIncoming ? 'Gelen talep mesajı' : 'Gönderdiğiniz mesaj'}</small>
                                                    <p>{q.mesaj}</p>
                                                </div>
                                                {isIncoming && (
                                                    <div className="cmp-quote-actions" style={{ marginTop: '12px' }}>
                                                        {q.durum !== 'rejected' && q.durum !== 'closed' && (
                                                            <button className="cmp-btn cmp-btn--sm cmp-btn--rejected" onClick={() => handleQuoteStatusChange(q.id, 'rejected')}>
                                                                <span className="material-symbols-outlined">close</span> Reddet
                                                            </button>
                                                        )}
                                                        {q.durum !== 'closed' && q.durum !== 'rejected' && (
                                                            <button className="cmp-btn cmp-btn--sm cmp-btn--closed" onClick={() => handleQuoteStatusChange(q.id, 'closed')}>
                                                                <span className="material-symbols-outlined">archive</span> Kapat
                                                            </button>
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
                                                                <strong>{m.sender_role === 'company' ? (isIncoming ? 'Siz (Firma)' : 'Firma') : (isIncoming ? q.ad_soyad : 'Siz')}</strong>
                                                                <span>{new Date(m.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p>{m.mesaj}</p>
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
                                            </div>
                                            {pendingCount > 0 && <span className="cmp-quotes-badge" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{pendingCount} yeni teklif</span>}
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
                                                <div className="cmp-quotes-list">
                                                    {incomingQuotes.map((q) => {
                                                        const stMap = { pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', rejected: 'Reddedildi', closed: 'Kapatıldı' };
                                                        return (
                                                            <article key={q.id} className="cmp-quote-card" onClick={() => openQuoteChat(q)} style={{ cursor: 'pointer' }}>
                                                                <div className="cmp-quote-top">
                                                                    <div className="cmp-quote-top-left">
                                                                        <span className={`cmp-quote-status cmp-quote-status--${q.durum}`}>{stMap[q.durum] || 'Yeni'}</span>
                                                                        <strong className="cmp-quote-subject">{q.konu}</strong>
                                                                    </div>
                                                                    <div className="cmp-quote-top-right">
                                                                        <span className="cmp-quote-sender">{q.ad_soyad}{q.firma_adi ? ` • ${q.firma_adi}` : ''}</span>
                                                                        <span className="cmp-quote-date">{new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        ) : (
                                            outgoingQuotes.length === 0 ? (
                                                <div className="cmp-quotes-empty-state">
                                                    <span className="material-symbols-outlined">outbox</span>
                                                    <p>Henüz teklif talebi göndermediniz.</p>
                                                </div>
                                            ) : (
                                                <div className="cmp-quotes-list">
                                                    {outgoingQuotes.map((q) => {
                                                        const stMap = { pending: 'Beklemede', read: 'Okundu', replied: 'Yanıtlandı', rejected: 'Reddedildi', closed: 'Kapatıldı' };
                                                        return (
                                                            <article key={q.id} className="cmp-quote-card" onClick={() => openQuoteChat(q)} style={{ cursor: 'pointer' }}>
                                                                <div className="cmp-quote-top">
                                                                    <div className="cmp-quote-top-left">
                                                                        <span className={`cmp-quote-status cmp-quote-status--${q.durum}`}>{stMap[q.durum] || 'Beklemede'}</span>
                                                                        <strong className="cmp-quote-subject">{q.konu}</strong>
                                                                    </div>
                                                                    <div className="cmp-quote-top-right">
                                                                        <span className="cmp-quote-sender">{q._alici_firma_adi}</span>
                                                                        <span className="cmp-quote-date">{new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Enes Doğanay | 7 Nisan 2026: Tab → Bildirimler (kurumsal kullanıcı bildirimleri) */}
                        {currentTab === 'bildirimler' && (
                            <div className="firma-profil-section">
                                <div className="notifications-hero">
                                    <div>
                                        <h1>Bildirimler</h1>
                                        <p>Teklif bildirimleri ve sistem olaylarını buradan takip edebilirsiniz.</p>
                                    </div>
                                    <button className="notifications-mark-all" onClick={handleMarkAllNotificationsRead} disabled={unreadNotifCount === 0}>
                                        Tümünü Okundu Yap
                                    </button>
                                </div>

                                <div className="notifications-stats-grid">
                                    <div className="notification-stat-card notification-stat-card-unread">
                                        <span className="material-symbols-outlined">mark_email_unread</span>
                                        <strong>{unreadNotifCount}</strong>
                                        <span>Okunmamış Bildirim</span>
                                    </div>
                                    <div className="notification-stat-card notification-stat-card-reminders">
                                        <span className="material-symbols-outlined">request_quote</span>
                                        <strong>{pendingCount}</strong>
                                        <span>Bekleyen Teklif</span>
                                    </div>
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="notifications-empty-state" style={{ marginTop: '24px' }}>
                                        <span className="material-symbols-outlined">notifications_none</span>
                                        <p>Henüz bildirim oluşmadı.</p>
                                    </div>
                                ) : (
                                    <div className="notifications-feed-list" style={{ marginTop: '20px' }}>
                                        {notifications.map((notification) => (
                                            <article key={notification.id} className={`notification-feed-card ${notification.is_read ? '' : 'unread'}`}>
                                                <div className="notification-feed-top">
                                                    <div>
                                                        <span className="notification-feed-type">
                                                            {notification.type === 'quote_received' ? 'Teklif Talebi'
                                                                : notification.type === 'quote_reply' ? 'Teklif Yanıtı'
                                                                : notification.type === 'quote_message' ? 'Teklif Mesajı'
                                                                : notification.type === 'reminder' ? 'Hatırlatma'
                                                                : 'Bildirim'}
                                                        </span>
                                                        <h4>{notification.title}</h4>
                                                    </div>
                                                    <span className="notification-feed-time">{formatRelativeTime(notification.created_at)}</span>
                                                </div>
                                                <p>{notification.message}</p>
                                                <div className="notification-feed-actions">
                                                    {!notification.is_read && (
                                                        <button type="button" className="notification-read-btn" onClick={() => handleMarkNotificationRead(notification.id)}>
                                                            Okundu Yap
                                                        </button>
                                                    )}
                                                    {notification.metadata?.teklif_id && (
                                                        <button type="button" className="notification-open-btn" onClick={() => navigateToQuoteFromNotification(notification)}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>chat</span> Teklifi Aç
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Enes Doğanay | 8 Nisan 2026: Tab → Favoriler (bireysel profildeki yapının kurumsal kopyası) */}
                        {currentTab === 'favoriler' && (
                            <div className="favorites-section">
                                <div className="favorites-header">
                                    <div>
                                        <h1>{selectedListId === null ? 'Tüm Favoriler' : myLists.find(l => l.id === selectedListId)?.liste_adi}</h1>
                                        <p>{displayedFavorites.length} tedarikçi{favSearch.trim() ? ` · "${favSearch}" araması` : ''}</p>
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
                                    <div className="fav-sort-wrapper">
                                        <span className="material-symbols-outlined">swap_vert</span>
                                        <select className="fav-sort-select" value={favSort} onChange={e => setFavSort(e.target.value)}>
                                            <option value="newest">Son Eklenen</option>
                                            <option value="oldest">İlk Eklenen</option>
                                            <option value="alpha">A → Z</option>
                                            <option value="alpha-desc">Z → A</option>
                                        </select>
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

                                                <div className="fav-avatar" style={{ background: fav.color }}>
                                                    {fav.name.substring(0, 2).toUpperCase()}
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
        </>
    );
};

export default FirmaProfil;
