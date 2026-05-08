// Enes Doğanay | 6 Mayıs 2026: Chatbot bileşeni — koordinatör
import React from 'react';
import useChatbot from '../hooks/useChatbot';
import ChatbotWindow from './ChatbotWindow';
import './Chatbot.css';

export default function Chatbot() {
    const { isHidden, open, setOpen, quickQuestions, messages, input, setInput, typing, unread, messagesEndRef, inputRef, sendMessage, handleSubmit } = useChatbot();

    if (isHidden) return null;

    return (
        <>
            {open && (
                <ChatbotWindow
                    messages={messages} typing={typing} quickQuestions={quickQuestions}
                    input={input} setInput={setInput} messagesEndRef={messagesEndRef} inputRef={inputRef}
                    sendMessage={sendMessage} handleSubmit={handleSubmit} onClose={() => setOpen(false)}
                />
            )}
            <button className="cb-fab" onClick={() => setOpen(o => !o)}
                aria-label={open ? 'Yardım penceresini kapat' : 'Yardım asistanını aç'}
                aria-expanded={open}>
                {open ? (
                    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
                {!open && unread > 0 && <span className="cb-badge">{unread}</span>}
            </button>
        </>
    );
}
