import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Chatbot.css';

const FALLBACK_ANSWER =
  'Bu konuda size yardımcı olmaktan memnuniyet duyarım, ancak sorunuzu tam anlayamadım. Daha fazla bilgi için <a href="/iletisim" class="cb-link">İletişim</a> sayfamızdan bize ulaşabilirsiniz.';

function findAnswer(text, qaList) {
  const lower = text.toLocaleLowerCase('tr').trim();
  if (!lower || !qaList.length) return FALLBACK_ANSWER;
  let best = null;
  let bestScore = 0;
  for (const qa of qaList) {
    const score = (qa.keywords || []).filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = qa;
    }
  }
  return bestScore > 0 ? best.answer : FALLBACK_ANSWER;
}

/* ─── Bileşen ──────────────────────────────────────────────────── */
export default function Chatbot() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: 'Merhaba! 👋 Tedport hakkında sorularınızı yanıtlamaktan memnuniyet duyarım. Size nasıl yardımcı olabilirim?',
      html: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Admin sayfalarında gösterme
  const hidden = location.pathname.startsWith('/admin');

  // Supabase'den Q&A ve hızlı soruları çek
  useEffect(() => {
    if (hidden) return;
    supabase
      .from('chatbot_qa')
      .select('keywords, answer')
      .eq('is_active', true)
      .then(({ data }) => { if (data) setQaList(data); });

    supabase
      .from('chatbot_quick_questions')
      .select('question')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => { if (data) setQuickQuestions(data.map((r) => r.question)); });
  }, [hidden]);

  // Scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, open]);

  // Focus on open
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Tüm hook'lar çağrıldıktan sonra erken çıkış
  if (hidden) return null;

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: 'user', text: trimmed, html: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const answer = findAnswer(trimmed, qaList);
      setTyping(false);
      const botMsg = { id: Date.now() + 1, from: 'bot', text: answer, html: true };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((u) => u + 1);
    }, delay);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Chat Penceresi */}
      {open && (
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
                <span className="cb-header-status">
                  <span className="cb-status-dot" />
                  Çevrimiçi
                </span>
              </div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)} aria-label="Kapat">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="cb-messages">
            {messages.map((msg) =>
              msg.from === 'bot' ? (
                <div key={msg.id} className="cb-row cb-row--bot">
                  <div className="cb-bubble cb-bubble--bot">
                    {msg.html ? (
                      <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="cb-row cb-row--user">
                  <div className="cb-bubble cb-bubble--user">{msg.text}</div>
                </div>
              )
            )}

            {typing && (
              <div className="cb-row cb-row--bot">
                <div className="cb-bubble cb-bubble--bot cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Hızlı sorular */}
          <div className="cb-quick">
            {quickQuestions.map((q) => (
              <button key={q} className="cb-quick-btn" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          <form className="cb-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="cb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru sorun..."
              autoComplete="off"
              maxLength={300}
            />
            <button className="cb-send" type="submit" aria-label="Gönder" disabled={!input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Buton */}
      <button
        className="cb-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Yardım penceresini kapat' : 'Yardım asistanını aç'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="cb-badge">{unread}</span>
        )}
      </button>
    </>
  );
}
