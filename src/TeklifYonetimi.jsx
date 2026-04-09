// Enes Doğanay | 7 Nisan 2026: Kurumsal firma teklif yönetimi sayfası — gelen + giden + chat
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { getManagedCompanyId } from './companyManagementApi';
import { useAuth } from './AuthContext';
import './CompanyManagementPanel.css';

const TeklifYonetimi = () => {
    const navigate = useNavigate();
    const [companyId, setCompanyId] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(true);

    // Enes Doğanay | 7 Nisan 2026: Teklif talepleri state'leri — gelen + giden + chat
    const [incomingQuotes, setIncomingQuotes] = useState([]);
    const [outgoingQuotes, setOutgoingQuotes] = useState([]);
    const [quotesLoading, setQuotesLoading] = useState(true);
    const [quotesTab, setQuotesTab] = useState('incoming');
    // Enes Doğanay | 10 Nisan 2026: Durum filtreleme state'i
    const [statusFilter, setStatusFilter] = useState('all');
    // Enes Doğanay | 9 Nisan 2026: Giden teklifler için ayrı filtre
    const [outStatusFilter, setOutStatusFilter] = useState('all');
    const [activeQuoteChat, setActiveQuoteChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef(null);
    /* Enes Doğanay | 9 Nisan 2026: Sadece mesaj container'ını aşağı kaydır, sayfayı değil */
    const scrollChatToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            const container = chatEndRef.current?.parentElement;
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);
    // Enes Doğanay | 9 Nisan 2026: Teklif silme onay state'i
    const [confirmDeleteQuoteId, setConfirmDeleteQuoteId] = useState(null);
    // Enes Doğanay | 9 Nisan 2026: Reddetme onay state'i
    const [confirmRejectQuoteId, setConfirmRejectQuoteId] = useState(null);
    // Enes Doğanay | 9 Nisan 2026: Sonlandırma onay state'i
    const [confirmCloseQuoteId, setConfirmCloseQuoteId] = useState(null);
    // Enes Doğanay | 9 Nisan 2026: Okunmamış teklif bildirim id'lerini tut — yeni mesaj göstergesi için
    const [unreadQuoteIds, setUnreadQuoteIds] = useState(new Set());

    // Enes Doğanay | 7 Nisan 2026: Firma bilgisini kontrol et
    useEffect(() => {
        const init = async () => {
            const cid = await getManagedCompanyId();
            if (!cid) { navigate('/'); return; }
            setCompanyId(cid);
            const { data } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', cid).single();
            setCompanyName(data?.firma_adi || 'Firma');
            setLoading(false);
        };
        init();
    }, [navigate]);

    // Enes Doğanay | 9 Nisan 2026: Okunmamış teklif bildirimlerini çek — yeni mesaj göstergesi
    useEffect(() => {
        const fetchUnreadNotifs = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            const { data } = await supabase.from('bildirimler')
                .select('metadata')
                .eq('user_id', session.user.id)
                .eq('is_read', false)
                .in('type', ['quote_reply', 'quote_message', 'quote_received']);
            if (data) {
                setUnreadQuoteIds(new Set(data.filter(n => n.metadata?.teklif_id).map(n => n.metadata.teklif_id)));
            }
        };
        fetchUnreadNotifs();
        const interval = setInterval(fetchUnreadNotifs, 10000);
        return () => clearInterval(interval);
    }, []);

    // Enes Doğanay | 7 Nisan 2026: Firmanın gelen ve giden teklif taleplerini çek
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
                            _displayStatus = 'awaiting_reply'; // Biz (firma) giden teklifte yazdık → Yanıt Bekleniyor
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

    // Enes Doğanay | 9 Nisan 2026: Broadcast + Polling fallback
    // Broadcast anlık iletim sağlar; polling 3 sn'de bir DB'den yeni mesajları kontrol eder.
    // RLS veya Realtime sorunlarından tamamen bağımsız, %100 garanti çalışır.
    const chatChannelRef = useRef(null);
    useEffect(() => {
        if (!activeQuoteChat) {
            if (chatChannelRef.current) { supabase.removeChannel(chatChannelRef.current); chatChannelRef.current = null; }
            return;
        }
        const teklifId = activeQuoteChat.id;
        const addMessage = (msg) => {
            if (!msg) return;
            setChatMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            scrollChatToBottom();
        };
        // Broadcast kanal — RLS'den bağımsız anlık iletim
        const bcChannel = supabase
            .channel(`teklif-chat-bc-${teklifId}`, { config: { broadcast: { ack: true } } })
            .on('broadcast', { event: 'new-message' }, ({ payload }) => {
                addMessage(payload);
            })
            .subscribe();
        chatChannelRef.current = bcChannel;
        // Enes Doğanay | 9 Nisan 2026: Polling — her 3 saniyede DB'den tüm mesajları çek ve state'i güncelle
        // Append değil full-replace: RLS/Realtime sorunlarından bağımsız, kesin çalışır
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

    /* Enes Doğanay | 9 Nisan 2026: Kullanıcı teklif chat'indeyken gelen bildirimi anında okundu yap */
    const { latestNotification, refreshCounts, setActiveViewingTeklifId } = useAuth();

    /* Enes Doğanay | 9 Nisan 2026: AuthContext'e aktif görüntülenen teklif id'sini bildir — toast bastırma için */
    useEffect(() => {
        setActiveViewingTeklifId(activeQuoteChat?.id || null);
        return () => setActiveViewingTeklifId(null);
    }, [activeQuoteChat?.id]);

    useEffect(() => {
        if (!latestNotification || !activeQuoteChat) return;
        const isQuoteNotif = (latestNotification.type === 'quote_reply' || latestNotification.type === 'quote_message' || latestNotification.type === 'quote_received');
        const notifTeklifId = latestNotification.metadata?.teklif_id;
        if (isQuoteNotif && notifTeklifId && activeQuoteChat.id === notifTeklifId) {
            supabase.from('bildirimler').update({ is_read: true }).eq('id', latestNotification.id).then(() => refreshCounts());
        }
    }, [latestNotification]);

    // Enes Doğanay | 7 Nisan 2026: Teklif durumunu güncelle
    const handleQuoteStatusChange = async (quoteId, newStatus) => {
        const { error } = await supabase.from('teklif_talepleri').update({ durum: newStatus }).eq('id', quoteId);
        if (!error) {
            setIncomingQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, durum: newStatus } : q));
            if (activeQuoteChat?.id === quoteId) setActiveQuoteChat(prev => prev ? { ...prev, durum: newStatus } : null);
            /* Enes Doğanay | 9 Nisan 2026: Reddetme onayını temizle */
            if (newStatus === 'rejected') setConfirmRejectQuoteId(null);
        }
    };

    // Enes Doğanay | 9 Nisan 2026: Teklif chatini aç — sadece gelen teklifte pending→read
    const openCompanyQuoteChat = async (quote) => {
        setActiveQuoteChat(quote);
        setChatLoading(true);
        setChatInput('');

        /* Enes Doğanay | 9 Nisan 2026: Teklif açıldığında ilgili okunmamış bildirimleri okundu yap */
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: unreadNotifs } = await supabase.from('bildirimler')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('is_read', false)
                .in('type', ['quote_reply', 'quote_message', 'quote_received'])
                .contains('metadata', { teklif_id: quote.id });
            if (unreadNotifs && unreadNotifs.length > 0) {
                const ids = unreadNotifs.map(n => n.id);
                supabase.from('bildirimler').update({ is_read: true }).in('id', ids).then(() => refreshCounts());
                setUnreadQuoteIds(prev => {
                    const next = new Set(prev);
                    next.delete(quote.id);
                    return next;
                });
            }
        }

        const { data } = await supabase.from('teklif_mesajlari').select('*').eq('teklif_id', quote.id).order('created_at', { ascending: true });
        setChatMessages(data || []);
        setChatLoading(false);
        const isIncoming = incomingQuotes.some(q => q.id === quote.id);
        if (isIncoming && quote.durum === 'pending') handleQuoteStatusChange(quote.id, 'read');
        scrollChatToBottom(false);
    };

    // Enes Doğanay | 7 Nisan 2026: Firma tarafından chat mesajı gönder
    const sendCompanyChatMessage = async () => {
        if (!chatInput.trim() || !activeQuoteChat) return;
        setChatSending(true);
        const { data: userData } = await supabase.auth.getUser();
        const senderId = userData?.user?.id;
        if (!senderId) { setChatSending(false); return; }

        const isIncoming = incomingQuotes.some(q => q.id === activeQuoteChat.id);
        const senderRole = isIncoming ? 'company' : 'user';

        const { data, error } = await supabase.from('teklif_mesajlari')
            .insert([{ teklif_id: activeQuoteChat.id, sender_id: senderId, sender_role: senderRole, mesaj: chatInput.trim() }])
            .select().single();

        if (!error && data) {
            setChatMessages(prev => [...prev, data]);
            setChatInput('');
            // Enes Doğanay | 9 Nisan 2026: Broadcast ile karşı tarafa mesajı anlık ilet (await ile güvenilir gönderim)
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

    if (loading) return <div className="teklif-page-loading">Yükleniyor...</div>;

    const pendingCount = incomingQuotes.filter(q => q.durum === 'pending').length;

    return (
        <div className="teklif-page">
            {/* Enes Doğanay | 7 Nisan 2026: Sayfa başlık alanı */}
            <div className="teklif-page-header">
                <div>
                    <h1>Teklif Yönetimi</h1>
                    <p>{companyName} — Gelen ve gönderdiğiniz teklif taleplerini yönetin.</p>
                    {/* Enes Doğanay | 9 Nisan 2026: Badge başlık altına taşındı */}
                    {pendingCount > 0 && <span className="cmp-quotes-badge" style={{ fontSize: '0.85rem', padding: '4px 12px', marginTop: '8px', display: 'inline-block' }}>{pendingCount} yeni teklif</span>}
                </div>
            </div>

            {/* Enes Doğanay | 7 Nisan 2026: Chat açıksa chat view, değilse liste */}
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
                                    <p className="quote-chat-firma">{isIncoming ? q.ad_soyad : (q._alici_firma_adi || 'Firma')}{q.firma_adi ? ` • ${q.firma_adi}` : ''}</p>
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
                            {/* Enes Doğanay | 11 Nisan 2026: Ek dosya tasarımı yenilendi */}
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
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendCompanyChatMessage(); } }}
                                    disabled={chatSending}
                                />
                                <button onClick={sendCompanyChatMessage} disabled={chatSending || !chatInput.trim()}>
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
                    {/* Enes Doğanay | 7 Nisan 2026: Gelen / Giden tab switcher */}
                    <div className="cmp-quotes-tabs">
                        <button className={`cmp-quotes-tab ${quotesTab === 'incoming' ? 'active' : ''}`} onClick={() => setQuotesTab('incoming')}>
                            <span className="material-symbols-outlined">inbox</span> Gelen Teklifler
                            {pendingCount > 0 && <span className="cmp-quotes-badge">{pendingCount}</span>}
                        </button>
                        <button className={`cmp-quotes-tab ${quotesTab === 'outgoing' ? 'active' : ''}`} onClick={() => setQuotesTab('outgoing')}>
                            <span className="material-symbols-outlined">outbox</span> Gönderilen Teklifler
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
                                {(statusFilter === 'all' ? incomingQuotes : incomingQuotes.filter(q => (q._displayStatus || q.durum) === statusFilter)).map((q) => {
                                    const stMap = { pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', awaiting_reply: 'Yanıt Bekleniyor', rejected: 'Reddedildi', closed: 'Sonlandırıldı' };
                                    return (
                                        <article key={q.id} className={`cmp-quote-card${unreadQuoteIds.has(q.id) ? ' cmp-quote-card--new' : ''}`} onClick={() => openCompanyQuoteChat(q)} style={{ cursor: 'pointer' }}>
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
                                                    {/* Enes Doğanay | 9 Nisan 2026: Teklif silme */}
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
                                        <article key={q.id} className={`cmp-quote-card${unreadQuoteIds.has(q.id) ? ' cmp-quote-card--new' : ''}`} onClick={() => openCompanyQuoteChat(q)} style={{ cursor: 'pointer' }}>
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
    );
};

export default TeklifYonetimi;
