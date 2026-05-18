// Enes Doğanay | 7 Mayıs 2026: SharedChatModal — tüm chat overlay'leri için ortak bileşen
// Hem ihale sahibi (firma) hem teklif veren (kullanıcı) tarafında kullanılır.
import React, { useState, useEffect } from 'react';
import './SharedChatModal.css';
import './SharedChatModal.dark.css';
import SharedChatMessageList from './SharedChatMessageList';
import SharedChatInputBar from './SharedChatInputBar';

const SharedChatModal = ({
    title,
    subtitle,
    avatarUrl,
    avatarFallback,
    tenderTag,
    messages = [],
    loading,
    error,
    input,
    setInput,
    sending,
    endRef,
    isClosed,
    closedMessage,
    onClose,
    onSend,
    onReport,
    extraActions,
    // Enes Doğanay | 7 Mayıs 2026: inline mod — overlay olmadan satır içi render
    inline = false,
    hideHeader = false,
}) => {
    // Enes Doğanay | 7 Mayıs 2026: Avatar yüklenemezse fallback'e geç
    const [avatarErr, setAvatarErr] = useState(false);
    const showImg = avatarUrl && !avatarErr;
    const initial = avatarFallback || (title ? title.charAt(0).toUpperCase() : '?');

    // Enes Doğanay | 7 Mayıs 2026: Chat açıkken arka plan scroll kilit — popup modda
    useEffect(() => {
        if (inline) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [inline]);

    // Enes Doğanay | 7 Mayıs 2026: ESC tuşu ile kapat — popup modda
    useEffect(() => {
        if (inline) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, inline]);

    return (
        // Enes Doğanay | 7 Mayıs 2026: inline=false → overlay popup; inline=true → direkt render
        <div
            className={inline ? 'scm-inline' : 'scm-overlay'}
            role={inline ? undefined : 'dialog'}
            aria-modal={inline ? undefined : true}
            aria-labelledby={inline ? undefined : 'scm-title'}
        >
            <div className={`scm-modal${inline ? ' scm-modal--inline' : ''}`} onClick={e => e.stopPropagation()}>

                {/* ── HEADER ── */}
                {!hideHeader && (
                <div className="scm-header">
                    <div className="scm-avatar scm-avatar--online">
                        {showImg
                            ? <img src={avatarUrl} alt={title} onError={() => setAvatarErr(true)} />
                            : <span className="scm-avatar__initial">{initial}</span>
                        }
                    </div>
                    <div className="scm-header__info">
                        <strong className="scm-header__name" id="scm-title">{title}</strong>
                        {subtitle && <span className="scm-header__sub">{subtitle}</span>}
                        {tenderTag && (
                            <span className="scm-header__tag">
                                <span className="material-symbols-outlined">gavel</span>
                                {tenderTag}
                            </span>
                        )}
                    </div>
                    <div className="scm-header__actions">
                        {extraActions}
                        <button className="scm-btn-icon scm-btn-icon--close" onClick={onClose} aria-label="Chat’ı kapat" type="button">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>
                )}

                {/* ── MESAJLAR + SCROLL BUTONU ── */}
                <SharedChatMessageList
                    messages={messages}
                    loading={loading}
                    error={error}
                    endRef={endRef}
                    title={title}
                    onReport={onReport}
                />

                {/* ── FOOTER ── */}
                <SharedChatInputBar
                    input={input}
                    setInput={setInput}
                    sending={sending}
                    isClosed={isClosed}
                    closedMessage={closedMessage}
                    onSend={onSend}
                />
            </div>
        </div>
    );
};

export default SharedChatModal;
