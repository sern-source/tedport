// Enes Doğanay | 6 Mayıs 2026: Chatbot state, effects ve mesaj mantığı
import { useState, useRef, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { fetchChatbotQA, fetchChatbotQuickQuestions } from '../services/chatbotService';

const FALLBACK_ANSWER =
    'Bu konuda size yardımcı olmaktan memnuniyet duyarım, ancak sorunuzu tam anlayamadım. Daha fazla bilgi için <a href="/iletisim" class="cb-link">İletişim</a> sayfamızdan bize ulaşabilirsiniz.';

const INITIAL_MESSAGE = {
    id: 1, from: 'bot', html: false,
    text: 'Merhaba! 👋 Tedport hakkında sorularınızı yanıtlamaktan memnuniyet duyarım. Size nasıl yardımcı olabilirim?',
};

// Enes Doğanay | 6 Mayıs 2026: Anahtar kelime eşleşme skoru ile en iyi cevabı bul
function findAnswer(text, qaList) {
    const lower = text.toLocaleLowerCase('tr').trim();
    if (!lower || !qaList.length) return FALLBACK_ANSWER;
    let best = null, bestScore = 0;
    for (const qa of qaList) {
        const score = (qa.keywords || []).filter(kw => lower.includes(kw)).length;
        if (score > bestScore) { bestScore = score; best = qa; }
    }
    return bestScore > 0 ? best.answer : FALLBACK_ANSWER;
}

const useChatbot = () => {
    const location = useLocation();
    const [chatSearchParams] = useSearchParams();
    // Enes Doğanay | 8 Mayıs 2026: Mobil ekran takibi (≤768px)
    const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    // Enes Doğanay | 11 Mayıs 2026: Admin her zaman gizli, mobilde ana sayfa ('/') dışında gizli
    const isHomePage = location.pathname === '/';
    const isHidden = location.pathname.startsWith('/admin') || (isMobile && !isHomePage);
    const [open, setOpen] = useState(false);
    const [qaList, setQaList] = useState([]);
    const [quickQuestions, setQuickQuestions] = useState([]);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    // Enes Doğanay | 8 Mayıs 2026: Bot cevap timer ref — rapid gönderimde önceki timeout iptal edilir, unmount'ta cleanup
    const typingTimerRef = useRef(null);

    // Enes Doğanay | 8 Mayıs 2026: Unmount cleanup — pending bot cevabı varsa iptal et
    useEffect(() => {
        return () => {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        };
    }, []);

    // Enes Doğanay | 6 Mayıs 2026: Q&A ve hızlı sorular yükle
    useEffect(() => {
        if (isHidden) return;
        fetchChatbotQA().then(setQaList).catch(() => {});
        fetchChatbotQuickQuestions().then(setQuickQuestions).catch(() => {});
    }, [isHidden]);

    // Enes Doğanay | 6 Mayıs 2026: Mesaj listesi scroll
    useEffect(() => {
        if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing, open]);

    // Enes Doğanay | 6 Mayıs 2026: Pencere açıldığında focus + okunmadıkları sıfırla
    useEffect(() => {
        if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
    }, [open]);

    // Enes Doğanay | 6 Mayıs 2026: Kullanıcı mesajı gönder + bot cevabı simüle et
    const sendMessage = (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: trimmed, html: false }]);
        setInput('');
        setTyping(true);
        // Enes Doğanay | 8 Mayıs 2026: Önceki pending bot cevabını iptal et — rapid gönderimde çifte cevap önlenir
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        const delay = 600 + Math.random() * 600;
        typingTimerRef.current = setTimeout(() => {
            const answer = findAnswer(trimmed, qaList);
            setTyping(false);
            setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: answer, html: true }]);
            if (!open) setUnread(u => u + 1);
            typingTimerRef.current = null;
        }, delay);
    };

    const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

    return { isHidden, open, setOpen, quickQuestions, messages, input, setInput, typing, unread, messagesEndRef, inputRef, sendMessage, handleSubmit };
};

export default useChatbot;
