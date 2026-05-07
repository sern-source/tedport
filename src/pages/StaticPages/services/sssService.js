// Enes Doğanay | 6 Mayıs 2026: SSS (FAQ) Supabase servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: Aktif FAQ sorularını çeker
export const fetchFAQ = async () => {
  const { data, error } = await supabase
    .from('chatbot_qa')
    .select('id, question, answer, category')
    .eq('is_active', true)
    .not('question', 'is', null);
  if (error) throw new Error(error.message);
  return data || [];
};
