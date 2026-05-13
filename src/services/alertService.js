// Enes Doğanay | 13 Mayıs 2026: İhale uyarı aboneliği servis katmanı
import { supabase } from '../supabaseClient';

// Enes Doğanay | 13 Mayıs 2026: Kullanıcının mevcut aboneliğini kontrol et
export async function checkAlertSubscription(userId, kategori = null) {
    let query = supabase
        .from('ihale_uyarilari')
        .select('id, aktif')
        .eq('user_id', userId)
        .eq('aktif', true);

    query = kategori ? query.eq('kategori', kategori) : query.is('kategori', null);

    const { data } = await query.maybeSingle();
    return data || null;
}

// Enes Doğanay | 13 Mayıs 2026: Yeni ihale uyarısı aboneliği — email session'dan alınır
// upsert onConflict COALESCE index'i tutmuyor → manual check+insert/update
export async function subscribeToAlerts(userId, kategori = null) {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email;
    if (!email) throw new Error('Kullanıcı email adresi bulunamadı.');

    // Mevcut satırı bul (aktif veya pasif — her ikisi de eşleşir)
    let findQ = supabase
        .from('ihale_uyarilari')
        .select('id')
        .eq('user_id', userId);
    findQ = kategori ? findQ.eq('kategori', kategori) : findQ.is('kategori', null);
    const { data: existing } = await findQ.maybeSingle();

    if (existing) {
        // Enes Doğanay | 15 Mayıs 2026: Yeniden aktifleştir — token da yenilenir (re-unsubscribe için)
        const newToken = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : null;
        const updateData = { aktif: true, email };
        if (newToken) updateData.unsubscribe_token = newToken;
        const { error } = await supabase
            .from('ihale_uyarilari')
            .update(updateData)
            .eq('id', existing.id);
        if (error) throw new Error(error.message);
        return existing;
    }

    // Yeni kayıt
    const { data, error } = await supabase
        .from('ihale_uyarilari')
        .insert({ user_id: userId, email, kategori, aktif: true })
        .select('id')
        .single();
    if (error) throw new Error(error.message);
    return data;
}

// Enes Doğanay | 13 Mayıs 2026: Aboneliği iptal et
export async function unsubscribeFromAlerts(subscriptionId) {
    const { error } = await supabase
        .from('ihale_uyarilari')
        .update({ aktif: false })
        .eq('id', subscriptionId);

    if (error) throw new Error(error.message);
}

// Enes Doğanay | 13 Mayıs 2026: Kullanıcının tüm aktif aboneliklerini getir
export async function getUserAlerts(userId) {
    const { data, error } = await supabase
        .from('ihale_uyarilari')
        .select('id, kategori, aktif, created_at')
        .eq('user_id', userId)
        .eq('aktif', true)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

// Enes Doğanay | 13 Mayıs 2026: E-posta token ile abonelik iptali — KVKK/GDPR gereği
// Edge Function (supabaseAdmin) kullanılır → RLS'ye takılmaz, login gerekmez
export async function unsubscribeByToken(token) {
    if (!token) throw new Error('Geçersiz token.');
    const { data, error } = await supabase.functions.invoke('ihale-management', {
        body: { action: 'unsubscribe_by_token', token },
    });
    if (error) throw new Error(error.message || 'Abonelik iptal edilemedi.');
    // Enes Doğanay | 15 Mayıs 2026: throw değil return — sayfa kendi state'ini belirlesin
    if (data?.already) return { already: true };
    if (!data?.success) throw new Error('Beklenmedik bir hata oluştu.');
    return { success: true };
}
