// Enes Doğanay | 6 Mayıs 2026: İletişim formu Supabase servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: İletişim formunu iletisim tablosuna ekler
export const submitContactForm = async ({ name, email, subject, message }) => {
  const { error } = await supabase
    .from('iletisim')
    .insert([{ name, email, subject, message }]);
  if (error) throw new Error(error.message);
};
