// Enes Doğanay | 6 Mayıs 2026: İletişim formu Supabase servisi
// Enes Doğanay | 12 Mayıs 2026: company alanı eklendi
// Enes Doğanay | 14 Mayıs 2026: phone alanı eklendi
import { supabase } from '../../../supabaseClient';
import { notifyAdmin } from '../../../services/adminNotify';

// Enes Doğanay | 6 Mayıs 2026: İletişim formunu iletisim tablosuna ekler
export const submitContactForm = async ({ name, company, email, phone, subject, message }) => {
  const { error } = await supabase
    .from('iletisim')
    .insert([{ name, company: company || null, email, phone: phone || null, subject, message }]);
  if (error) throw new Error(error.message);
  // Enes Doğanay | 12 Haziran 2026: Admin bildirimi — fire-and-forget
  notifyAdmin('contact', { name, company, email, phone, subject, message });
};
