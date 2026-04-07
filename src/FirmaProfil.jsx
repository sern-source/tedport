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

    // ── İlk yükleme ──
    useEffect(() => {
        const init = async () => {
            const cid = await getManagedCompanyId();
            if (!cid) { navigate('/'); return; }
            setCompanyId(cid);

            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) { navigate('/login'); return; }
            setUserId(userData.user.id);

            const [firmaRes, notifRes] = await Promise.all([
                supabase.from('firmalar').select('*').eq('firmaID', cid).single(),
                supabase.from('bildirimler').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false }).limit(50)
            ]);

            setFirma(firmaRes.data);
            setNotifications(notifRes.data || []);
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

    // ── Çıkış ──
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <div className="page-status">Yükleniyor...</div>;

    const pendingCount = incomingQuotes.filter(q => q.durum === 'pending').length;
    const unreadNotifCount = notifications.filter(n => !n.is_read).length;

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
                            <hr className="sidebar-divider" />
                            <a className="nav-item logout" onClick={handleLogout}>
                                <span className="material-symbols-outlined">logout</span> Çıkış Yap
                            </a>
                        </nav>
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

                    </main>
                </div>
            </div>
        </>
    );
};

export default FirmaProfil;
