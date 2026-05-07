// Enes Doğanay | 6 Mayıs 2026: Chatbot Supabase sorguları
import { supabase } from '../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: Aktif Q&A listesi çek
export async function fetchChatbotQA() {
    const { data, error } = await supabase
        .from('chatbot_qa')
        .select('keywords, answer')
        .eq('is_active', true);
    if (error) throw new Error(error.message);
    return data || [];
}

// Enes Doğanay | 6 Mayıs 2026: Hızlı soru listesi çek
export async function fetchChatbotQuickQuestions() {
    const { data, error } = await supabase
        .from('chatbot_quick_questions')
        .select('question')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(r => r.question);
}
