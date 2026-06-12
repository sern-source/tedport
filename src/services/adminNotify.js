// Enes Doğanay | 12 Haziran 2026: Admin bildirim yardımcısı — Supabase Edge Function, fire-and-forget, hata ana akışı kesmez
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const notifyAdmin = (type, data) => {
  if (!SUPABASE_URL) return;
  try {
    fetch(`${SUPABASE_URL}/functions/v1/admin-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ type, data }),
    }).catch((err) => console.warn('admin-notify fetch failed:', err));
  } catch (err) {
    console.warn('admin-notify error:', err);
  }
};
