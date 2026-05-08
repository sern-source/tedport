// Enes Doğanay | 6 Mayıs 2026: MyOffersService — shared servise yönlendirme
import { supabase } from '../../../supabaseClient';
export * from '../../../services/myOffersService';

// Enes Doğanay | 6 Mayıs 2026: Kullanıcı/firma tekliflerini ihale ve firma bilgileriyle çek
export async function fetchMyOffers(userId, companyId) {
    let myOffers;
    if (companyId) {
        const { data } = await supabase
            .from('ihale_teklifleri')
            .select('*')
            .eq('gonderen_firma_id', String(companyId))
            .order('created_at', { ascending: false });
        myOffers = data;
    } else {
        const { data } = await supabase
            .from('ihale_teklifleri')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        myOffers = data;
    }
    if (!myOffers?.length) return { offers: [], tenderMap: {}, firmaMap: {} };

    const ihaleIds = [...new Set(myOffers.map(o => o.ihale_id))];
    const { data: tenders } = await supabase
        .from('firma_ihaleleri')
        .select('id, baslik, aciklama, referans_no, firma_id, durum, son_basvuru_tarihi, teslim_il, teslim_ilce, ihale_tipi, kategori, anonim')
        .in('id', ihaleIds);

    const tenderMap = {};
    (tenders || []).forEach(t => { tenderMap[String(t.id)] = t; });

    const firmaIds = [...new Set((tenders || []).map(t => t.firma_id).filter(Boolean))];
    const { data: firmalar } = firmaIds.length > 0
        ? await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', firmaIds)
        : { data: [] };

    const firmaMap = {};
    (firmalar || []).forEach(f => { firmaMap[String(f.firmaID)] = f.firma_adi; });

    return { offers: myOffers, tenderMap, firmaMap };
}

// Enes Doğanay | 6 Mayıs 2026: Okunmamış teklif mesajı sayılarını çek
export async function fetchUnreadCounts(offerIds) {
    if (!offerIds.length) return { counts: {}, ids: new Set() };
    const { data: unreadMsgs } = await supabase
        .from('ihale_teklif_mesajlari')
        .select('teklif_id')
        .in('teklif_id', offerIds)
        .eq('sender_role', 'company')
        .eq('okundu_bidder', false);

    const counts = {};
    const ids = new Set();
    (unreadMsgs || []).forEach(m => {
        counts[m.teklif_id] = (counts[m.teklif_id] || 0) + 1;
        ids.add(m.teklif_id);
    });
    return { counts, ids };
}

// Enes Doğanay | 6 Mayıs 2026: Teklif chat mesajlarını çek
export async function fetchChatMessages(teklifId) {
    const { data } = await supabase
        .from('ihale_teklif_mesajlari')
        .select('*')
        .eq('teklif_id', teklifId)
        .order('created_at', { ascending: true });
    return data || [];
}

// Enes Doğanay | 6 Mayıs 2026: Mesajları bidder tarafında okundu işaretle
export async function markMessagesReadByBidder(messageIds) {
    if (!messageIds.length) return;
    await supabase
        .from('ihale_teklif_mesajlari')
        .update({ okundu_bidder: true })
        .in('id', messageIds);
}

// Enes Doğanay | 6 Mayıs 2026: Bu teklife ait bildirimleri okundu yap
export async function markTeklifNotificationsRead(teklifId) {
    await supabase
        .from('bildirimler')
        .update({ is_read: true })
        .eq('type', 'tender_offer_message')
        .filter('metadata->>teklif_id', 'eq', String(teklifId))
        .eq('is_read', false);
}

// Enes Doğanay | 6 Mayıs 2026: Chat mesajı gönder
export async function sendChatMessage(payload) {
    const { data, error } = await supabase
        .from('ihale_teklif_mesajlari')
        .insert([payload])
        .select()
        .single();
    if (error) throw error;
    return data;
}

// Enes Doğanay | 6 Mayıs 2026: Teklifi sil
export async function deleteOffer(offerId) {
    const { error } = await supabase
        .from('ihale_teklifleri')
        .delete()
        .eq('id', offerId);
    if (error) throw error;
}

// Enes Doğanay | 6 Mayıs 2026: Firma yöneticilerine bildirim gönder (fire-and-forget)
export function notifyFirmaManagers(firmaId, notifRows) {
    if (!firmaId || !notifRows.length) return;
    supabase.from('bildirimler').insert(notifRows).then(() => {}).catch(() => {});
}

// Enes Doğanay | 6 Mayıs 2026: Firma iletişim bilgilerini çek
export async function fetchFirmaContact(firmaId) {
    const info = { name: null, firma: null, email: null, phone: null, firmaPhone: null, firmaEmail: null };
    if (!firmaId) return info;

    const { data: firma } = await supabase
        .from('firmalar')
        .select('firma_adi, telefon, eposta')
        .eq('firmaID', firmaId)
        .maybeSingle();
    if (firma) {
        info.firma = firma.firma_adi || null;
        if (firma.telefon) info.firmaPhone = firma.telefon;
        if (firma.eposta) info.firmaEmail = firma.eposta;
    }

    const { data: mgr } = await supabase
        .from('kurumsal_firma_yoneticileri')
        .select('user_id')
        .eq('firma_id', firmaId)
        .maybeSingle();
    if (mgr?.user_id) {
        const { data: prof } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone, email')
            .eq('id', mgr.user_id)
            .maybeSingle();
        if (prof) {
            info.name = [prof.first_name, prof.last_name].filter(Boolean).join(' ') || null;
            if (prof.email) info.email = prof.email;
            if (prof.phone) info.phone = prof.phone;
        }
    }
    return info;
}

// Enes Doğanay | 6 Mayıs 2026: Mesaj şikayeti gönder
export async function submitMessageReport({ reporterId, mesajId, mesajIcerik, neden, aciklama }) {
    const { error } = await supabase.from('mesaj_sikayetleri').insert([{
        reporter_id: reporterId,
        mesaj_id: String(mesajId),
        kaynak: 'ihale_teklifi',
        mesaj_icerik: mesajIcerik,
        neden,
        aciklama: aciklama?.trim() || null,
    }]);
    if (error) throw error;
}
