// Enes Doğanay | 6 Mayıs 2026: MyOffersService — ihale teklifleri Supabase sorguları (shared)
import { supabase } from '../supabaseClient';

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
    // Enes Doğanay | 25 Mayıs 2026: slug eklendi — MyOfferCard firma navigasyonu slug URL kullanacak
    const { data: firmalar } = firmaIds.length > 0
        ? await supabase.from('firmalar').select('firmaID, firma_adi, logo_url, slug').in('firmaID', firmaIds)
        : { data: [] };

    // Enes Doğanay | 7 Mayıs 2026: firma adı + logo map ayrı tutulır, firmaMap string uyumlu kalır
    const firmaMap = {};
    const firmaLogoMap = {};
    const firmaSlugMap = {};
    (firmalar || []).forEach(f => {
        firmaMap[String(f.firmaID)] = f.firma_adi;
        if (f.logo_url) firmaLogoMap[String(f.firmaID)] = f.logo_url;
        firmaSlugMap[String(f.firmaID)] = f.slug || null;
    });
    // Enes Doğanay | 25 Mayıs 2026: tenderMap'e firma_slug ekle — firma kart navigasyonu için
    Object.keys(tenderMap).forEach(id => {
        const t = tenderMap[id];
        tenderMap[id] = { ...t, firma_slug: firmaSlugMap[String(t.firma_id)] || null };
    });

    return { offers: myOffers, tenderMap, firmaMap, firmaLogoMap };
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
// Enes Doğanay | 8 Mayıs 2026: void operatörü — intentional fire-and-forget, hata yutulur değil görmezden gelinir (bildirim kritik değil)
export function notifyFirmaManagers(firmaId, notifRows) {
    if (!firmaId || !notifRows.length) return;
    void supabase.from('bildirimler').insert(notifRows);
}

// Enes Doğanay | 6 Mayıs 2026: Firma iletişim bilgilerini çek
// Enes Doğanay | 8 Mayıs 2026: firma + manager sorguları paralel — ikisi de sadece firmaId'ye bağımlı, 1 round-trip kazanıldı
export async function fetchFirmaContact(firmaId) {
    const info = { name: null, firma: null, email: null, phone: null, firmaPhone: null, firmaEmail: null };
    if (!firmaId) return info;

    const [{ data: firma }, { data: mgr }] = await Promise.all([
        supabase.from('firmalar').select('firma_adi, telefon, eposta').eq('firmaID', firmaId).maybeSingle(),
        supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', firmaId).maybeSingle(),
    ]);

    if (firma) {
        info.firma = firma.firma_adi || null;
        if (firma.telefon) info.firmaPhone = firma.telefon;
        if (firma.eposta) info.firmaEmail = firma.eposta;
    }

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

// Enes Doğanay | 6 Mayıs 2026: Teklif ek dosyası için imzalı URL oluştur
export async function createSignedTeklifUrl(rawUrl) {
    let filePath = rawUrl;
    if (filePath.startsWith('http')) {
        try {
            const url = new URL(filePath);
            const marker = '/teklif-ekleri/';
            const idx = url.pathname.indexOf(marker);
            if (idx !== -1) filePath = decodeURIComponent(url.pathname.substring(idx + marker.length));
        } catch { /* */ }
    }
    const { data, error } = await supabase.storage.from('teklif-ekleri').createSignedUrl(filePath, 300);
    if (error) throw new Error(error.message);
    return data.signedUrl;
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

// Enes Doğanay | 7 Mayıs 2026: Tek mesajı bidder için okundu işaretle
export async function markSingleMessageRead(messageId) {
    await supabase.from('ihale_teklif_mesajlari').update({ okundu_bidder: true }).eq('id', messageId);
}

// Enes Doğanay | 7 Mayıs 2026: Firma yöneticilerinin user_id'lerini çek
export async function fetchFirmaManagerIds(firmaId) {
    const { data } = await supabase
        .from('kurumsal_firma_yoneticileri')
        .select('user_id')
        .eq('firma_id', String(firmaId));
    return data || [];
}
