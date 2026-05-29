// Enes Doğanay | 7 Mayıs 2026: Emoji picker + mesaj girişi + gönder butonu — SharedChatModal sub-component
import React, { useState, useRef, useEffect } from 'react';
import { ALLOWED_EK_DOSYA_ACCEPT } from '../constants/fileUpload';

// Enes Doğanay | 7 Mayıs 2026: Emoji sabit listesi
const EMOJI_LIST = [

    '😊','😄','😂','🤣','😍','🥰','😎','🤔','😅','🙏',
    '👍','👎','🎉','🔥','✅','❌','⚠️','📌','📎','💬',
    '💡','📞','📧','🕐','🗓️','📋','✏️','🏷️','🔍','💰',
    '🤝','👏','🙌','💪','🚀','⭐','🌟','💎','📦','🏗️',
];

// Enes Doğanay | 18 Mayıs 2026: closedMessage prop — bağlama göre farklı kapanış mesajı
// Enes Doğanay | 29 Mayıs 2026: onAttachFile prop — opsiyonel, yalnızca firma teklif chat'inde tanımlı
const SharedChatInputBar = ({ input, setInput, sending, isClosed, onSend, closedMessage, onAttachFile }) => {
    // Enes Doğanay | 7 Mayıs 2026: Emoji picker açık/kapalı
    const [emojiOpen, setEmojiOpen] = useState(false);
    // Enes Doğanay | 16 Mayıs 2026: Gönderim hatası — profanity veya ağ hatası
    const [sendError, setSendError] = useState('');
    // Enes Doğanay | 29 Mayıs 2026: Seçilen ama henüz gönderilmemiş dosya — önizleme için
    const [pendingFile, setPendingFile] = useState(null);
    const emojiRef = useRef(null);
    // Enes Doğanay | 29 Mayıs 2026: Gizli file input ref — sadece onAttachFile varsa kullanılır
    const fileInputRef = useRef(null);

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
            if (!sending && (input.trim() || pendingFile)) handleSend();
        }
    };

    // Enes Doğanay | 16 Mayıs 2026: onSend() promise'ini yakala — hook throw ederse hata göster, 4s sonra temizle
    const handleSendWithCheck = () => {
        Promise.resolve(onSend()).catch(err => {
            const msg = err?.message || 'Mesaj gönderilemedi.';
            setSendError(msg);
            setTimeout(() => setSendError(''), 4000);
        });
    };

    // Enes Doğanay | 29 Mayıs 2026: Dosya varsa onu gönder (varsa metni de birlikte ilet), yoksa sadece text gönder
    const handleSend = () => {
        if (pendingFile) {
            const file = pendingFile;
            const text = input.trim();
            setPendingFile(null);
            if (text) setInput('');
            onAttachFile(file, text || null);
        } else if (input.trim()) {
            handleSendWithCheck();
        }
    };

    if (isClosed) {
        return (
            <div className="scm-closed">
                <span className="material-symbols-outlined">lock</span>
                {closedMessage || 'Bu ihale kapalı — mesaj gönderilemez.'}
            </div>
        );
    }

    return (
        <div className="scm-input-wrap">
            {/* Enes Doğanay | 29 Mayıs 2026: Seçilen dosya önizlemesi — gönder'e basınca iletilir */}
            {pendingFile && (
                <div className="scm-pending-file">
                    <span className="material-symbols-outlined scm-pending-file__icon">description</span>
                    <span className="scm-pending-file__name">{pendingFile.name}</span>
                    <button
                        className="scm-pending-file__remove"
                        onClick={() => setPendingFile(null)}
                        type="button"
                        aria-label="Dosyayı kaldır"
                        disabled={sending}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}
            <div className="scm-input-row">
            <div className="scm-emoji-wrap" ref={emojiRef}>
                <button
                    className={`scm-emoji-trigger${emojiOpen ? ' active' : ''}`}
                    onClick={() => setEmojiOpen(o => !o)}
                    type="button"
                    aria-label="Emoji seç"
                    aria-expanded={emojiOpen}
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
            {/* Enes Doğanay | 29 Mayıs 2026: Dosya ekleme butonu — yalnızca onAttachFile prop varsa gösterilir */}
            {onAttachFile && (
                <div className="scm-attach-wrap">
                    <button
                        className={`scm-attach-btn${pendingFile ? ' active' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                        type="button"
                        aria-label="Dosya ekle"
                        title="Dosya ekle"
                    >
                        <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_EK_DOSYA_ACCEPT}
                        style={{ display: 'none' }}
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) { e.target.value = ''; setPendingFile(f); }
                        }}
                    />
                </div>
            )}
            <input
                type="text"
                className="scm-input"
                placeholder={pendingFile ? 'İsteğe bağlı mesaj ekleyin…' : 'Mesajınızı yazın…'}
                aria-label="Mesaj yaz"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={sending}
                maxLength={2000}
            />
            <button
                className="scm-send-btn"
                onClick={handleSend}
                disabled={sending || (!input.trim() && !pendingFile)}
            >
                {sending
                    ? <span className="material-symbols-outlined scm-spin">progress_activity</span>
                    : <span className="material-symbols-outlined">send</span>
                }
            </button>
        </div>
        {/* Enes Doğanay | 16 Mayıs 2026: Profanity / gönderim hata mesajı */}
        {sendError && (
            <div className="scm-send-error">
                <span className="material-symbols-outlined">error</span>
                {sendError}
            </div>
        )}
        </div>
    );
};

export default SharedChatInputBar;
