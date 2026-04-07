// Enes Doğanay | 7 Nisan 2026: Kurumsal firma teklif yönetimi sayfası — gelen + giden + chat
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { getManagedCompanyId } from './companyManagementApi';
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
    const [activeQuoteChat, setActiveQuoteChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef(null);

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

    // Enes Doğanay | 7 Nisan 2026: Teklif durumunu güncelle
    const handleQuoteStatusChange = async (quoteId, newStatus) => {
        const { error } = await supabase.from('teklif_talepleri').update({ durum: newStatus }).eq('id', quoteId);
        if (!error) {
            setIncomingQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, durum: newStatus } : q));
            if (activeQuoteChat?.id === quoteId) setActiveQuoteChat(prev => prev ? { ...prev, durum: newStatus } : null);
        }
    };

    // Enes Doğanay | 7 Nisan 2026: Teklif chatini aç
    const openCompanyQuoteChat = async (quote) => {
        setActiveQuoteChat(quote);
        setChatLoading(true);
        setChatInput('');
        const { data } = await supabase.from('teklif_mesajlari').select('*').eq('teklif_id', quote.id).order('created_at', { ascending: true });
        setChatMessages(data || []);
        setChatLoading(false);
        if (quote.durum === 'pending') handleQuoteStatusChange(quote.id, 'read');
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
            if (isIncoming && (activeQuoteChat.durum === 'pending' || activeQuoteChat.durum === 'read')) {
                handleQuoteStatusChange(activeQuoteChat.id, 'replied');
            }
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
        setChatSending(false);
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
                </div>
                {pendingCount > 0 && <span className="cmp-quotes-badge" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{pendingCount} yeni teklif</span>}
            </div>

            {/* Enes Doğanay | 7 Nisan 2026: Chat açıksa chat view, değilse liste */}
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
                            <div className="cmp-quotes-list">
                                {incomingQuotes.map((q) => {
                                    const stMap = { pending: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', rejected: 'Reddedildi', closed: 'Kapatıldı' };
                                    return (
                                        <article key={q.id} className="cmp-quote-card" onClick={() => openCompanyQuoteChat(q)} style={{ cursor: 'pointer' }}>
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
                                        <article key={q.id} className="cmp-quote-card" onClick={() => openCompanyQuoteChat(q)} style={{ cursor: 'pointer' }}>
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
    );
};

export default TeklifYonetimi;
