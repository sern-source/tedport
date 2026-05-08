// Enes Doğanay | 7 Mayıs 2026: Emoji picker + mesaj girişi + gönder butonu — SharedChatModal sub-component
import React, { useState, useRef, useEffect } from 'react';

// Enes Doğanay | 7 Mayıs 2026: Emoji sabit listesi
const EMOJI_LIST = [
    '😊','😄','😂','🤣','😍','🥰','😎','🤔','😅','🙏',
    '👍','👎','🎉','🔥','✅','❌','⚠️','📌','📎','💬',
    '💡','📞','📧','🕐','🗓️','📋','✏️','🏷️','🔍','💰',
    '🤝','👏','🙌','💪','🚀','⭐','🌟','💎','📦','🏗️',
];

const SharedChatInputBar = ({ input, setInput, sending, isClosed, onSend }) => {
    // Enes Doğanay | 7 Mayıs 2026: Emoji picker açık/kapalı
    const [emojiOpen, setEmojiOpen] = useState(false);
    const emojiRef = useRef(null);

    // Enes Doğanay | 7 Mayıs 2026: Emoji picker dışına tıklanınca kapat
    useEffect(() => {
        if (!emojiOpen) return;
        const handler = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [emojiOpen]);

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sending && input.trim()) onSend();
        }
    };

    if (isClosed) {
        return (
            <div className="scm-closed">
                <span className="material-symbols-outlined">lock</span>
                Bu ihale kapalı — mesaj gönderilemez.
            </div>
        );
    }

    return (
        <div className="scm-input-row">
            <div className="scm-emoji-wrap" ref={emojiRef}>
                <button
                    className={`scm-emoji-trigger${emojiOpen ? ' active' : ''}`}
                    onClick={() => setEmojiOpen(o => !o)}
                    type="button"
                >
                    <span>😊</span>
                </button>
                {emojiOpen && (
                    <div className="scm-emoji-panel">
                        {EMOJI_LIST.map(emoji => (
                            <button
                                key={emoji}
                                className="scm-emoji-btn"
                                onClick={() => { setInput(prev => prev + emoji); setEmojiOpen(false); }}
                                type="button"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <input
                type="text"
                className="scm-input"
                placeholder="Mesajınızı yazın…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={sending}
                maxLength={2000}
            />
            <button
                className="scm-send-btn"
                onClick={onSend}
                disabled={sending || !input.trim()}
            >
                {sending
                    ? <span className="material-symbols-outlined scm-spin">progress_activity</span>
                    : <span className="material-symbols-outlined">send</span>
                }
            </button>
        </div>
    );
};

export default SharedChatInputBar;
