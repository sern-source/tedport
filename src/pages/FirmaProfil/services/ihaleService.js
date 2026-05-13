// Enes Doğanay | 6 Mayıs 2026: İhale yönetimi Supabase servis katmanı
import { supabase } from '../../../supabaseClient';
export { listMyTenders, updateTender, deleteTender, createTender, completeTender } from '../../../services/ihaleManagementApi';

/* ─── Teklif Sorguları ─── */
export const fetchTenderOffers = async (tenderIds) => {
    if (!tenderIds.length) return [];
    const { data, error } = await supabase
        .from('ihale_teklifleri')
        .select('*')
        .in('ihale_id', tenderIds)
        .neq('durum', 'taslak')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

export const closeExpiredTenders = async (ids) => {
    if (!ids.length) return;
    const { error } = await supabase.from('firma_ihaleleri').update({ durum: 'kapali' }).in('id', ids);
    if (error) throw new Error(error.message);
};

export const updateOfferStatus = async (offerId, status) => {
    const { error } = await supabase.from('ihale_teklifleri').update({ durum: status }).eq('id', offerId);
    if (error) throw new Error(error.message);
};

export const updateOfferNote = async (offerId, note) => {
    const { error } = await supabase.from('ihale_teklifleri').update({ alici_notu: note || null }).eq('id', offerId);
    if (error) throw new Error(error.message);
};

/* ─── Okunmamış Mesaj Sayısı ─── */
export const fetchUnreadChatCounts = async (offerIds) => {
    if (!offerIds.length) return { counts: {}, ids: new Set(), msgIds: new Set() };
    const { data } = await supabase
        .from('ihale_teklif_mesajlari')
        .select('id, teklif_id')
        .in('teklif_id', offerIds)
        .eq('sender_role', 'bidder')
        .eq('okundu_firma', false);
    const counts = {};
    const ids = new Set();
    // Enes Doğanay | 11 Mayıs 2026: msgIds — realtime duplicate guard için başlangıç mesaj ID'leri
    const msgIds = new Set();
    (data || []).forEach(m => {
        counts[m.teklif_id] = (counts[m.teklif_id] || 0) + 1;
        ids.add(m.teklif_id);
        msgIds.add(m.id);
    });
    return { counts, ids, msgIds };
};

export const markChatMessagesRead = async (messageIds) => {
    if (!messageIds.length) return;
    await supabase.from('ihale_teklif_mesajlari').update({ okundu_firma: true }).in('id', messageIds);
};

/* ─── Chat Mesajları ─── */
export const fetchChatMessages = async (teklifId) => {
    const { data, error } = await supabase
        .from('ihale_teklif_mesajlari')
        .select('*')
        .eq('teklif_id', teklifId)
        .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
};

export const sendChatMessage = async (payload) => {
    const { data, error } = await supabase
        .from('ihale_teklif_mesajlari')
        .insert([payload])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const enrichMessagesWithSender = async (messages) => {
    if (!messages.length) return messages;
    const senderIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];
    const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name').in('id', senderIds);
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    const { data: members } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id, role, title, firma_id').in('user_id', senderIds);
    const memberMap = Object.fromEntries((members || []).map(m => [m.user_id, m]));
    const ownerFirmaIds = [...new Set((members || []).filter(m => m.role === 'owner' && m.firma_id).map(m => m.firma_id))];
    const firmaNameMap = {};
    if (ownerFirmaIds.length > 0) {
        const { data: firmalar } = await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', ownerFirmaIds);
        (firmalar || []).forEach(f => { firmaNameMap[f.firmaID] = f.firma_adi; });
    }
    return messages.map(msg => {
        const p = profileMap[msg.sender_id];
        const m = memberMap[msg.sender_id];
        const isOwner = m?.role === 'owner';
        const firmaAdi = isOwner && m?.firma_id ? firmaNameMap[m.firma_id] : null;
        return { ...msg, _senderName: firmaAdi || (p ? [p.first_name, p.last_name].filter(Boolean).join(' ') || null : null), _senderRole: m?.role || null, _senderTitle: m?.title || null, _senderIsFirma: !!firmaAdi };
    });
};

// Enes Doğanay | 7 Mayıs 2026: Teklif gönderenin avatar/logo URL'sini çek
export async function fetchSenderAvatarUrl(offer) {
    if (offer.gonderen_firma_id) {
        const { data } = await supabase.from('firmalar').select('logo_url').eq('firmaID', offer.gonderen_firma_id).maybeSingle();
        return data?.logo_url || null;
    }
    if (offer.user_id) {
        const { data } = await supabase.from('profiles').select('avatar').eq('id', offer.user_id).maybeSingle();
        return data?.avatar || null;
    }
    return null;
}

/* ─── Bildirimler ─── */
export const insertNotification = async (payload) => {
    await supabase.from('bildirimler').insert(payload);
};

export const insertNotificationBulk = async (rows) => {
    if (!rows.length) return;
    await supabase.from('bildirimler').insert(rows);
};

export const markTenderOfferNotificationsRead = async (ihaleId) => {
    await supabase.from('bildirimler')
        .update({ is_read: true })
        .in('type', ['tender_new_offer', 'tender_offer_updated', 'tender_offer_withdrawn'])
        .filter('metadata->>ihale_id', 'eq', String(ihaleId))
        .eq('is_read', false);
};

export const markTenderChatNotificationsRead = async (teklifId) => {
    await supabase.from('bildirimler')
        .update({ is_read: true })
        .eq('type', 'tender_offer_message')
        .filter('metadata->>teklif_id', 'eq', String(teklifId))
        .eq('is_read', false);
};

/* ─── Profil / Firma ─── */
export const fetchContactInfo = async (offer) => {
    const info = {
        name: offer.gonderen_ad_soyad || '',
        initials: (offer.gonderen_ad_soyad || '').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?',
        email: offer.gonderen_email,
        firma: offer.gonderen_firma_adi || null,
        phone: null, firmaPhone: null, firmaEmail: null, avatar: null, companyName: null, location: null,
    };
    if (offer.user_id) {
        const { data: prof } = await supabase.from('profiles').select('phone, avatar, company_name, location').eq('id', offer.user_id).maybeSingle();
        if (prof?.phone) info.phone = prof.phone;
        if (prof?.avatar) info.avatar = prof.avatar;
        if (prof?.company_name) info.companyName = prof.company_name;
        if (prof?.location) info.location = prof.location;
    }
    if (offer.gonderen_firma_id) {
        const { data: firma } = await supabase.from('firmalar').select('telefon, eposta').eq('firmaID', offer.gonderen_firma_id).maybeSingle();
        if (firma?.telefon) info.firmaPhone = firma.telefon;
        if (firma?.eposta) info.firmaEmail = firma.eposta;
    }
    return info;
};

/* ─── E-posta ve Firma Arama ─── */
export const sendOfferStatusEmail = async (offer, status, selectedTenderBaslik, selectedTenderId, redNedeni) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || !offer.gonderen_email) return;
    const { error: fnError } = await supabase.functions.invoke('ihale-management', {
        body: { action: 'send_offer_status_email', to: offer.gonderen_email, status, ihale_baslik: selectedTenderBaslik || '', gonderen_ad: offer.gonderen_ad_soyad || '', red_nedeni: redNedeni || null, ihale_id: selectedTenderId || null },
    });
    if (fnError) throw new Error(fnError.message || 'E-posta gönderilemedi.');
};

export const checkEmailInDb = async (email) => {
    const { data, error } = await supabase.from('profiles').select('id').eq('email', email.trim().toLowerCase()).maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
};

export const searchFirmalar = async (term) => {
    const { data } = await supabase.from('firmalar').select('firmaID, firma_adi, onayli_hesap').ilike('firma_adi', `%${term}%`).limit(8);
    return data || [];
};

/* ─── Revize Geçmişi ─── */
// Enes Doğanay | 9 Mayıs 2026: Teklife ait önceki revizeleri getir
export const fetchTeklifGecmisi = async (teklifId) => {
    const { data, error } = await supabase
        .from('ihale_teklif_gecmisi')
        .select('*')
        .eq('teklif_id', teklifId)
        .order('revize_no', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

/* ─── Referans No Üretimi ─── */
export const generateRefNo = async (companyId) => {
    if (!companyId) return '';
    const { data: firma } = await supabase.from('firmalar').select('firma_adi, onayli_hesap').eq('firmaID', companyId).maybeSingle();
    if (!firma?.firma_adi) return { refNo: '', isVerified: false };
    const prefix = firma.firma_adi.trim().slice(0, 3).toLocaleUpperCase('tr-TR');
    const year = new Date().getFullYear();
    const { data: existing } = await supabase.from('firma_ihaleleri').select('referans_no').eq('firma_id', companyId);
    const myRefs = (existing || []).map(r => r.referans_no).filter(Boolean);
    const pattern = new RegExp(`^TED-${prefix}\\d*-${year}-(\\d+)$`);
    let maxSeq = 0;
    myRefs.forEach(ref => { const m = ref.match(pattern); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
    const { data: others } = await supabase.from('firma_ihaleleri').select('referans_no').neq('firma_id', companyId).like('referans_no', `TED-${prefix}%-${year}-%`);
    const hasSamePrefix = (others || []).length > 0;
    const suffix = hasSamePrefix ? `${prefix}2` : prefix;
    if (hasSamePrefix) {
        const p2 = new RegExp(`^TED-${suffix}-${year}-(\\d+)$`);
        myRefs.forEach(ref => { const m = ref.match(p2); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
        return { refNo: `TED-${suffix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`, isVerified: firma.onayli_hesap === true };
    }
    return { refNo: `TED-${prefix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`, isVerified: firma.onayli_hesap === true };
};

/* ─── Dosya İşlemleri ─── */
export const uploadIhaleFile = async (path, file) => {
    const { error } = await supabase.storage.from('ihale-ekleri').upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage.from('ihale-ekleri').getPublicUrl(path);
    return { name: file.name, path, size: file.size, url: urlData.publicUrl };
};

export const getIhaleFileSignedUrl = async (path) => {
    const { data } = await supabase.storage.from('ihale-ekleri').createSignedUrl(path, 300);
    return data?.signedUrl || null;
};

export const getTeklifFileSignedUrl = async (rawPath) => {
    let filePath = rawPath;
    if (filePath.startsWith('http')) {
        try {
            const url = new URL(filePath);
            const marker = '/teklif-ekleri/';
            const idx = url.pathname.indexOf(marker);
            if (idx !== -1) filePath = decodeURIComponent(url.pathname.substring(idx + marker.length));
        } catch { /* orijinal path kullan */ }
    }
    const { data } = await supabase.storage.from('teklif-ekleri').createSignedUrl(filePath, 300);
    return data?.signedUrl || null;
};

/* ─── Mesaj Şikayeti ─── */
export const submitMesajSikayet = async (payload) => {
    const { error } = await supabase.from('mesaj_sikayetleri').insert([payload]);
    if (error) throw new Error(error.message);
};

/* ─── Gerçek Zamanlı ─── */
export const getSupabaseChannel = (name) => supabase.channel(name);
export const removeSupabaseChannel = (channel) => supabase.removeChannel(channel);

// Enes Doğanay | 13 Mayıs 2026: Tender offer realtime aboneliği — hook'tan Supabase bağımlılığı kaldırıldı
export const subscribeToTenderOffers = (tenderIds, { onInsert, onUpdate, onDelete }) => {
    const ids = tenderIds.map(String);
    const channel = supabase.channel('tom-offers-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ihale_teklifleri' }, (payload) => {
            const row = payload.new;
            if (row.durum === 'taslak') return;
            if (ids.includes(String(row.ihale_id))) onInsert(row);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ihale_teklifleri' }, (payload) => {
            const row = payload.new;
            if (ids.includes(String(row.ihale_id))) onUpdate(row);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ihale_teklifleri' }, (payload) => {
            const row = payload.old;
            if (row?.ihale_id && ids.includes(String(row.ihale_id))) onDelete(row);
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};
