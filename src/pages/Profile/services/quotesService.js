// Enes Doğanay | 6 Mayıs 2026: Teklif talepleri Supabase servisleri
import { supabase } from '../../../supabaseClient';
// Enes Doğanay | 12 Haziran 2026: Admin bildirimi
import { notifyAdmin } from '../../../services/adminNotify';
import { runSupabaseQueryWithTimeout } from '../../../supabaseRecovery';
// Enes Doğanay | 1 Haziran 2026: Dosya yükleme sabitleri
import { ALLOWED_EK_DOSYA_UZANTILARI, ALLOWED_EK_DOSYA_HATA } from '../../../constants/fileUpload';

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
  // Enes Doğanay | 12 Haziran 2026: Admin bildirimi — fire-and-forget
  notifyAdmin('complaint', { reporterId: reportData.reporter_id, neden: reportData.neden, kaynak: reportData.kaynak, mesajIcerik: reportData.mesaj_icerik, aciklama: reportData.aciklama });
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
    // Enes Doğanay | 25 Mayıs 2026: slug eklendi — QuoteChatView firma navigasyonu slug URL kullanacak
    supabase.from('firmalar').select('firmaID, firma_adi, slug').in('firmaID', firmaIds),
    supabase.from('teklif_mesajlari').select('teklif_id, sender_role').in('teklif_id', quoteIds).order('created_at', { ascending: false }),
  ]);
  const firmMap = new Map((firmsRes.data || []).map(f => [f.firmaID, f.firma_adi]));
  const firmSlugMap = new Map((firmsRes.data || []).map(f => [f.firmaID, f.slug || null]));
  const lastMsgMap = new Map();
  for (const msg of (lastMsgsRes.data || [])) { if (!lastMsgMap.has(msg.teklif_id)) lastMsgMap.set(msg.teklif_id, msg.sender_role); }
  return data.map(q => {
    const lastSender = lastMsgMap.get(q.id);
    let _displayStatus = q.durum;
    if (q.durum !== 'rejected' && q.durum !== 'closed' && lastSender) _displayStatus = lastSender === 'company' ? 'replied' : 'awaiting_reply';
    return { ...q, _firma_adi: firmMap.get(q.firma_id) || 'Firma', _firma_slug: firmSlugMap.get(q.firma_id) || null, _displayStatus };
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

// Enes Doğanay | 1 Haziran 2026: Kullanıcı chat'ten dosya + opsiyonel metin gönderebilsin
export const sendQuoteChatMessageWithFile = async ({ quoteId, userId, file, message }) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EK_DOSYA_UZANTILARI.has(ext)) throw new Error(ALLOWED_EK_DOSYA_HATA);
  const path = `chat_files/${userId}/${quoteId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(path, file);
  if (uploadErr) throw new Error('Dosya yüklenemedi: ' + uploadErr.message);
  const { data, error } = await supabase
    .from('teklif_mesajlari')
    .insert([{ teklif_id: quoteId, sender_id: userId, sender_role: 'user', mesaj: message || '', ek_dosya_url: path, ek_dosya_adi: file.name }])
    .select()
    .single();
  if (error) {
    await supabase.storage.from('teklif-ekleri').remove([path]);
    throw new Error(error.message);
  }
  return data;
};
