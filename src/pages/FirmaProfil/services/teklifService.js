// Enes Doğanay | 6 Mayıs 2026: Teklif yönetimi servisi
import { supabase } from '../../../supabaseClient';
// Enes Doğanay | 12 Haziran 2026: Admin bildirimi
import { notifyAdmin } from '../../../services/adminNotify';
import { ALLOWED_EK_DOSYA_UZANTILARI, ALLOWED_EK_DOSYA_HATA } from '../../../constants/fileUpload';

/* Enes Doğanay | 6 Mayıs 2026: İlk yükleme — gelen + giden teklifler */
export const fetchQuotesInitial = async (companyId) => {
  const fid = String(companyId);
  const [inRes, outRes] = await Promise.all([
    supabase
      .from('teklif_talepleri')
      .select('*')
      .eq('firma_id', fid)
      .order('created_at', { ascending: false }),
    supabase
      .from('teklif_talepleri')
      .select('*')
      .eq('gonderen_firma_id', fid)
      .order('created_at', { ascending: false }),
  ]);

  let outWithFirma = outRes.data || [];
  if (outWithFirma.length > 0) {
    const ids = [...new Set(outWithFirma.map((q) => q.firma_id))];
    const { data: firms } = await supabase
      .from('firmalar')
      .select('firmaID, firma_adi')
      .in('firmaID', ids);
    const map = new Map((firms || []).map((f) => [f.firmaID, f.firma_adi]));
    outWithFirma = outWithFirma.map((q) => ({
      ...q,
      _alici_firma_adi: map.get(q.firma_id) || 'Firma',
    }));
  }

  return { incoming: inRes.data || [], outgoing: outWithFirma };
};

/* Enes Doğanay | 6 Mayıs 2026: Polling — son mesaj sender_role'e göre _displayStatus hesapla */
export const fetchQuotesPoll = async (companyId) => {
  const fid = String(companyId);
  const [inRes, outRes] = await Promise.all([
    supabase
      .from('teklif_talepleri')
      .select('*')
      .eq('firma_id', fid)
      .order('created_at', { ascending: false }),
    supabase
      .from('teklif_talepleri')
      .select('*')
      .eq('gonderen_firma_id', fid)
      .order('created_at', { ascending: false }),
  ]);

  const allIds = [...(inRes.data || []), ...(outRes.data || [])].map((q) => q.id);
  const lastMsgMap = new Map();
  if (allIds.length > 0) {
    const { data: msgs } = await supabase
      .from('teklif_mesajlari')
      .select('teklif_id, sender_role')
      .in('teklif_id', allIds)
      .order('created_at', { ascending: false });
    for (const msg of msgs || []) {
      if (!lastMsgMap.has(msg.teklif_id)) lastMsgMap.set(msg.teklif_id, msg.sender_role);
    }
  }

  const calcDisplayStatus = (q, isIncoming) => {
    if (q.durum === 'rejected' || q.durum === 'closed') return q.durum;
    const lastSender = lastMsgMap.get(q.id);
    if (!lastSender) return q.durum;
    if (isIncoming) return lastSender === 'company' ? 'replied' : 'awaiting_reply';
    return lastSender === 'company' ? 'awaiting_reply' : 'replied';
  };

  const enrichedIn = (inRes.data || []).map((q) => ({
    ...q,
    _displayStatus: calcDisplayStatus(q, true),
  }));

  let enrichedOut = outRes.data || [];
  if (enrichedOut.length > 0) {
    const ids = [...new Set(enrichedOut.map((q) => q.firma_id))];
    const { data: firms } = await supabase
      .from('firmalar')
      .select('firmaID, firma_adi')
      .in('firmaID', ids);
    const map = new Map((firms || []).map((f) => [f.firmaID, f.firma_adi]));
    enrichedOut = enrichedOut.map((q) => ({
      ...q,
      _alici_firma_adi: map.get(q.firma_id) || 'Firma',
      _displayStatus: calcDisplayStatus(q, false),
    }));
  }

  return { incoming: enrichedIn, outgoing: enrichedOut };
};

/* Enes Doğanay | 6 Mayıs 2026: Teklif chat mesajlarını getir */
export const fetchChatMessages = async (teklifId) => {
  const { data, error } = await supabase
    .from('teklif_mesajlari')
    .select('*')
    .eq('teklif_id', teklifId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

/* Enes Doğanay | 6 Mayıs 2026: Chat mesajı gönder */
export const sendChatMessage = async ({ teklifId, userId, senderRole, message }) => {
  const { data, error } = await supabase
    .from('teklif_mesajlari')
    .insert([{ teklif_id: teklifId, sender_id: userId, sender_role: senderRole, mesaj: message }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

/* Enes Doğanay | 6 Mayıs 2026: Teklif durumunu güncelle */
export const updateQuoteStatus = async (quoteId, status) => {
  const { error } = await supabase
    .from('teklif_talepleri')
    .update({ durum: status })
    .eq('id', quoteId);
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Teklif sil (varsa ek dosyayı da sil) */
export const deleteQuote = async (quoteId, ekDosyaUrl) => {
  if (ekDosyaUrl) {
    await supabase.storage.from('teklif-ekleri').remove([ekDosyaUrl]);
  }
  const { error } = await supabase.from('teklif_talepleri').delete().eq('id', quoteId);
  if (error) throw new Error(error.message);
};

/* Enes Doğanay | 6 Mayıs 2026: Mesaj şikayeti kaydet */
export const submitMesajSikayet = async ({
  reporterId,
  mesajId,
  kaynak,
  mesajIcerik,
  neden,
  aciklama,
}) => {
  const { error } = await supabase.from('mesaj_sikayetleri').insert([
    {
      reporter_id: reporterId,
      mesaj_id: String(mesajId),
      kaynak,
      mesaj_icerik: mesajIcerik,
      neden,
      aciklama: aciklama?.trim() || null,
    },
  ]);
  if (error) throw new Error(error.message);
  // Enes Doğanay | 12 Haziran 2026: Admin bildirimi — fire-and-forget
  notifyAdmin('complaint', { reporterId, neden, kaynak, mesajIcerik, aciklama });
};

/* Enes Doğanay | 6 Mayıs 2026: Teklif sahibi iletişim bilgilerini getir */
export const fetchQuoteContact = async (quote) => {
  const name = quote.ad_soyad || '';
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  const info = {
    name,
    initials,
    email: quote.email,
    firma: quote.firma_adi || null,
    phone: null,
    avatar: null,
    companyName: null,
    location: null,
  };

  if (quote.user_id) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('phone, avatar, company_name, location')
      .eq('id', quote.user_id)
      .maybeSingle();
    if (prof?.phone) info.phone = prof.phone;
    if (prof?.avatar) info.avatar = prof.avatar;
    if (prof?.company_name) info.companyName = prof.company_name;
    if (prof?.location) info.location = prof.location;
  }

  if (quote.gonderen_firma_id) {
    const { data: firma } = await supabase
      .from('firmalar')
      .select('telefon, eposta')
      .eq('firmaID', quote.gonderen_firma_id)
      .maybeSingle();
    if (firma?.telefon && !info.phone) info.phone = firma.telefon;
  }

  return info;
};

/* Enes Doğanay | 6 Mayıs 2026: Teklif mesajlarına gönderen profil bilgisi ekle */
export const enrichTeklifMessages = async (messages) => {
  if (!messages || messages.length === 0) return messages;
  const senderIds = [...new Set(messages.map((m) => m.sender_id).filter(Boolean))];
  if (senderIds.length === 0) return messages;

  const [profRes, memberRes] = await Promise.all([
    supabase.from('profiles').select('id, first_name, last_name').in('id', senderIds),
    supabase
      .from('kurumsal_firma_yoneticileri')
      .select('user_id, role, title, firma_id')
      .in('user_id', senderIds),
  ]);

  const profileMap = Object.fromEntries((profRes.data || []).map((p) => [p.id, p]));
  const memberMap = Object.fromEntries((memberRes.data || []).map((m) => [m.user_id, m]));

  // Enes Doğanay | 1 Haziran 2026: Tüm üyelerin firma adlarını çek (owner + ekip üyeleri)
  const allMemberFirmaIds = [
    ...new Set(
      (memberRes.data || [])
        .filter((m) => m.firma_id)
        .map((m) => m.firma_id)
    ),
  ];
  const firmaNameMap = {};
  if (allMemberFirmaIds.length > 0) {
    const { data: firmalar } = await supabase
      .from('firmalar')
      .select('firmaID, firma_adi')
      .in('firmaID', allMemberFirmaIds);
    (firmalar || []).forEach((f) => {
      firmaNameMap[f.firmaID] = f.firma_adi;
    });
  }

  return messages.map((msg) => {
    const member = memberMap[msg.sender_id];
    const isOwner = member?.role === 'owner';
    const firmaAdi = member?.firma_id ? firmaNameMap[member.firma_id] : null;
    const prof = profileMap[msg.sender_id];
    const fullName = prof ? [prof.first_name, prof.last_name].filter(Boolean).join(' ') || null : null;
    // Enes Doğanay | 1 Haziran 2026: Owner → firma adı; ekip üyesi → "Ad — Firma Adı"
    let _senderName;
    if (isOwner) {
      _senderName = firmaAdi || fullName || null;
    } else if (fullName && firmaAdi) {
      _senderName = `${fullName} — ${firmaAdi}`;
    } else {
      _senderName = fullName || firmaAdi || null;
    }
    return {
      ...msg,
      _senderName,
      _senderRole: member?.role || null,
      _senderTitle: member?.title || null,
      _senderIsFirma: !!member,
    };
  });
};

/* Enes Doğanay | 6 Mayıs 2026: Teklif eki için imzalı URL oluştur */
export const getAttachmentSignedUrl = async (path) => {
  const { data } = await supabase.storage
    .from('teklif-ekleri')
    .createSignedUrl(path, 300);
  return data?.signedUrl || null;
};

/* Enes Doğanay | 29 Mayıs 2026: Chat mesajı + dosya gönder — yalnızca firma tarafı için */
// Enes Doğanay | 29 Mayıs 2026: message — dosyayla birlikte opsiyonel metin
export const sendChatMessageWithFile = async ({ teklifId, userId, senderRole, companyId, file, message }) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EK_DOSYA_UZANTILARI.has(ext)) throw new Error(ALLOWED_EK_DOSYA_HATA);
  const path = `chat_files/${companyId}/${teklifId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(path, file);
  if (uploadErr) throw new Error('Dosya yüklenemedi: ' + uploadErr.message);
  const { data, error } = await supabase
    .from('teklif_mesajlari')
    .insert([{ teklif_id: teklifId, sender_id: userId, sender_role: senderRole, mesaj: message || '', ek_dosya_url: path, ek_dosya_adi: file.name }])
    .select()
    .single();
  if (error) {
    await supabase.storage.from('teklif-ekleri').remove([path]);
    throw new Error(error.message);
  }
  return data;
};
