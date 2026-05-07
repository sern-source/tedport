// Enes Doğanay | 6 Mayıs 2026: Chatbot popup penceresi — mesajlar, hızlı sorular, form
import React from 'react';

const ChatbotWindow = ({ messages, typing, quickQuestions, input, setInput, messagesEndRef, inputRef, sendMessage, handleSubmit, onClose }) => (
    <div className="cb-window" role="dialog" aria-label="Yardım Asistanı">
        <div className="cb-header">
            <div className="cb-header-info">
                <div className="cb-avatar">
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                        <path d="M9 9h.01M15 9h.01M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                </div>
                <div>
                    <span className="cb-header-name">Tedport Asistan</span>
                    <span className="cb-header-status"><span className="cb-status-dot" />Çevrimiçi</span>
                </div>
            </div>
            <button className="cb-close" onClick={onClose} aria-label="Kapat">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </div>
        <div className="cb-messages">
            {messages.map(msg => msg.from === 'bot' ? (
                <div key={msg.id} className="cb-row cb-row--bot">
                    <div className="cb-bubble cb-bubble--bot">
                        {msg.html ? <span dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
                    </div>
                </div>
            ) : (
                <div key={msg.id} className="cb-row cb-row--user">
                    <div className="cb-bubble cb-bubble--user">{msg.text}</div>
                </div>
            ))}
            {typing && (
                <div className="cb-row cb-row--bot">
                    <div className="cb-bubble cb-bubble--bot cb-typing"><span /><span /><span /></div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <div className="cb-quick">
            {quickQuestions.map(q => (
                <button key={q} className="cb-quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
        </div>
        <form className="cb-form" onSubmit={handleSubmit}>
            <input ref={inputRef} className="cb-input" value={input} onChange={e => setInput(e.target.value)}
                placeholder="Bir soru sorun..." autoComplete="off" maxLength={300} />
            <button className="cb-send" type="submit" aria-label="Gönder" disabled={!input.trim()}>
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </form>
    </div>
);

export default ChatbotWindow;
