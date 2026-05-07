// Enes Doğanay | 6 Mayıs 2026: Teklif talepleri Supabase servisleri
import { supabase } from '../../../supabaseClient';
import { runSupabaseQueryWithTimeout } from '../../../supabaseRecovery';

export const fetchQuotes = async (userId) => {
  const { data, error } = await supabase
    .from('teklif_talepleri')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error && !error.message?.includes('relation')) throw new Error(error.message);
  return data || [];
};

export const fetchQuoteMessages = async (quoteId) => {
  const { data, error } = await supabase
    .from('teklif_mesajlari')
    .select('*')
    .eq('teklif_id', quoteId)
    .order('created_at', { ascending: true });
  if (error && !error.message?.includes('relation')) throw new Error(error.message);
  return data || [];
};

// Enes Doğanay | 7 Mayıs 2026: Timeout ile wrap — ağ sorunu olunca spinner sonsuza dönmesin
export const sendQuoteMessageService = async (quoteId, userId, text) => {
  const result = await runSupabaseQueryWithTimeout(
    supabase
      .from('teklif_mesajlari')
      .insert([{ teklif_id: quoteId, sender_id: userId, sender_role: 'user', mesaj: text }])
      .select()
      .single(),
    'sendQuoteMessage',
    8000,
  );
  if (result.error) throw new Error(result.error.message);
  return result.data;
};

export const deleteQuoteService = async (quoteId, ekDosyaUrl) => {
  if (ekDosyaUrl) {
    const path = decodeURIComponent(ekDosyaUrl.split('/storage/v1/object/public/teklif-ekleri/').pop());
    await supabase.storage.from('teklif-ekleri').remove([path]);
  }
  const { error } = await supabase.from('teklif_talepleri').delete().eq('id', quoteId);
  if (error) throw new Error(error.message);
};

export const submitMessageReportService = async (reportData) => {
  const { error } = await supabase.from('mesaj_sikayetleri').insert([reportData]);
  if (error) throw new Error(error.message);
};

export const markQuoteAsViewed = async (quoteId, viewedByUserId) => {
  await supabase
    .from('teklif_talepleri')
    .update({ user_last_viewed: new Date().toISOString() })
    .eq('id', quoteId)
    .eq('user_id', viewedByUserId);
};

// Enes Doğanay | 7 Mayıs 2026: Teklif taleplerini firma adı + displayStatus ile zenginleştir
export const fetchAndEnrichQuotes = async (userId) => {
  const { data } = await supabase.from('teklif_talepleri').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (!data?.length) return [];
  const firmaIds = [...new Set(data.map(q => q.firma_id))];
  const quoteIds = data.map(q => q.id);
  const [firmsRes, lastMsgsRes] = await Promise.all([
    supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', firmaIds),
    supabase.from('teklif_mesajlari').select('teklif_id, sender_role').in('teklif_id', quoteIds).order('created_at', { ascending: false }),
  ]);
  const firmMap = new Map((firmsRes.data || []).map(f => [f.firmaID, f.firma_adi]));
  const lastMsgMap = new Map();
  for (const msg of (lastMsgsRes.data || [])) { if (!lastMsgMap.has(msg.teklif_id)) lastMsgMap.set(msg.teklif_id, msg.sender_role); }
  return data.map(q => {
    const lastSender = lastMsgMap.get(q.id);
    let _displayStatus = q.durum;
    if (q.durum !== 'rejected' && q.durum !== 'closed' && lastSender) _displayStatus = lastSender === 'company' ? 'replied' : 'awaiting_reply';
    return { ...q, _firma_adi: firmMap.get(q.firma_id) || 'Firma', _displayStatus };
  });
};

// Enes Doğanay | 7 Mayıs 2026: Teklif bildirimlerini okundu işaretle
export const markQuoteNotificationsRead = async (userId, quoteId) => {
  await supabase.from('bildirimler').update({ is_read: true }).eq('user_id', userId)
    .in('type', ['quote_reply', 'quote_message'])
    .filter('metadata->>teklif_id', 'eq', String(quoteId)).eq('is_read', false);
};

// Enes Doğanay | 7 Mayıs 2026: Teklif eki için geçici imzalı URL üretir
export const getQuoteAttachmentSignedUrl = async (path) => {
  if (!path) return null;
  const { data } = await supabase.storage.from('teklif-ekleri').createSignedUrl(path, 300);
  return data?.signedUrl || null;
};
