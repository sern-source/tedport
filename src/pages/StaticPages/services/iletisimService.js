// Enes Doğanay | 6 Mayıs 2026: İletişim formu Supabase servisi
// Enes Doğanay | 12 Mayıs 2026: company alanı eklendi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: İletişim formunu iletisim tablosuna ekler
export const submitContactForm = async ({ name, company, email, subject, message }) => {
  const { error } = await supabase
    .from('iletisim')
    .insert([{ name, company: company || null, email, subject, message }]);
  if (error) throw new Error(error.message);
};
