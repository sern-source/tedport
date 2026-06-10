// Enes Doğanay | 7 Mayıs 2026: Mesaj listesi + scroll yönetimi — SharedChatModal sub-component
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Enes Doğanay | 8 Mayıs 2026: Module seviyesi formatçı — her render’da yeni Intl nesnesi üretmez
const msgTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

const formatMsgTime = (created_at) => msgTimeFormatter.format(new Date(created_at));

const SharedChatMessageList = ({ messages, loading, error, endRef, title, onReport, onOpenAttachment }) => {
    // Enes Doğanay | 7 Mayıs 2026: Scroll-to-bottom butonu görünürlüğü
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesRef = useRef(null);

    const handleScroll = useCallback(() => {
        const el = messagesRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBtn(distFromBottom > 80);
    }, []);

    // Enes Doğanay | 7 Mayıs 2026: İlk yüklemede en alta git
    useEffect(() => {
        if (loading) return;
        const el = messagesRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [loading]);

    // Enes Doğanay | 7 Mayıs 2026: Yeni mesajda alttaysak kaydır
    useEffect(() => {
        if (loading) return;
        const el = messagesRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distFromBottom < 120) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

    const scrollToBottom = () => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    };

    return (
        <>
            <div className="scm-messages" ref={messagesRef} onScroll={handleScroll}>
                {loading && (
                    <div className="scm-state">
                        <div className="scm-spinner" />
                        <p>Mesajlar yükleniyor…</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="scm-state scm-state--error">
                        <span className="material-symbols-outlined">wifi_off</span>
                        <p>Mesajlar yüklenemedi.</p>
                    </div>
                )}
                {!loading && !error && messages.length === 0 && (
                    <div className="scm-state">
                        <span className="scm-state__emoji">💬</span>
                        <p>Henüz mesaj yok.<br /><span>İlk mesajı siz gönderin!</span></p>
                    </div>
                )}
                {!loading && !error && messages.map((msg) => {
                    // Enes Doğanay | 8 Mayıs 2026: Module seviyesi formatter kullanılır — her mesaj render’ında new Date() + toLocaleString tekrarı önlendi
                    const timeStr = formatMsgTime(msg.created_at);
                    return (
                        <div key={msg.id} className={`scm-bubble ${msg._isMine ? 'mine' : 'theirs'}`}>
                            <div className="scm-bubble__meta">
                                <strong>{msg._senderLabel || (msg._isMine ? 'Siz' : title)}</strong>
                                <span>{timeStr}</span>
                            </div>
                            {/* Enes Doğanay | 29 Mayıs 2026: Metin ve ek dosya ayrı ayrı göster — her ikisi de olabilir */}
                            {msg.mesaj ? <p className="scm-bubble__text">{msg.mesaj}</p> : null}
                            {msg.ek_dosya_url && msg.ek_dosya_adi ? (
                                <div
                                    className="scm-bubble__attachment"
                                    onClick={() => onOpenAttachment?.(msg.ek_dosya_url)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && onOpenAttachment?.(msg.ek_dosya_url)}
                                >
                                    <span className="material-symbols-outlined scm-bubble__attachment-icon">description</span>
                                    <div className="scm-bubble__attachment-info">
                                        <span className="scm-bubble__attachment-name">{msg.ek_dosya_adi}</span>
                                        <span className="scm-bubble__attachment-hint">Görüntülemek için tıklayın</span>
                                    </div>
                                    <span className="material-symbols-outlined scm-bubble__attachment-open">open_in_new</span>
                                </div>
                            ) : null}
                            {!msg._isMine && onReport && (
                                <button
                                    className="scm-report-btn"                                    aria-label="Mesajı Şikayet et"                                    data-tooltip="Mesajı şikayet et"
                                    onClick={() => onReport(msg.id)}
                                >
                                    <span className="material-symbols-outlined">flag</span>
                                </button>
                            )}
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
            {showScrollBtn && (
                <button className="scm-scroll-btn" onClick={scrollToBottom} aria-label="En alta git" data-tooltip="En alta git">
                    <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
            )}
        </>
    );
};

export default SharedChatMessageList;
