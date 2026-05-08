import { supabase } from '../supabaseClient';

const getFunctionsErrorMessage = (error, fallbackMessage) => {
    const contextMessage = error?.context?.msg || error?.message;
    return contextMessage || fallbackMessage;
};

// Enes Doğanay | 6 Nisan 2026: Kurumsal hesap sahibi kullanicinin yonettigi firma id'si tek noktadan okunur
// Enes Doğanay | 5 Mayıs 2026: try/catch eklendi — getSession() timeout/abort fırlatırsa null döner, sayfayı kilitlemez
export const getManagedCompanyId = async () => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.id) {
            return null;
        }

        const { data, error } = await supabase
            .from('kurumsal_firma_yoneticileri')
            .select('firma_id')
            .eq('user_id', session.user.id)
            .maybeSingle();

        if (error) {
            return null;
        }

        return data?.firma_id || null;
    } catch {
        return null;
    }
};

// Enes Doğanay | 6 Nisan 2026: Firma yonetim ekranlari aktif kullanicinin sahip oldugu firmayi Edge Function uzerinden ceker
export const getManagedCompany = async () => {
    try {
        const { data, error } = await supabase.functions.invoke('company-management', {
            body: { action: 'get_my_company' }
        });

        if (error) {
            throw new Error(getFunctionsErrorMessage(error, 'Yönetilen firma alınamadı.'));
        }

        return { company: data?.company || null, firmaId: data?.firmaId || null, mode: 'edge' };
    } catch {
        const firmaId = await getManagedCompanyId();
        if (!firmaId) {
            return { company: null, firmaId: null, mode: 'database' };
        }

        // Enes Doğanay | 2 Mayıs 2026: pending_logo_url, arama_etiketleri, pending_logo_red_notu alanları eklendi — Onay Merkezi entegrasyonu
        const { data, error: selectError } = await supabase
            .from('firmalar')
            .select('firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best, pending_logo_url, arama_etiketleri, pending_logo_red_notu')
            .eq('firmaID', firmaId)
            .single();

        if (selectError) {
            throw new Error(selectError.message || 'Yönetilen firma alınamadı.');
        }

        return { company: data, firmaId, mode: 'database' };
    }
};

// Enes Doğanay | 6 Nisan 2026: Kurumsal hesap sahibi firma detayini yalnizca yetkili Edge Function uzerinden gunceller
export const updateManagedCompany = async (company) => {
    const { data, error } = await supabase.functions.invoke('company-management', {
        body: {
            action: 'update_my_company',
            company
        }
    });

    if (error) {
        throw new Error(getFunctionsErrorMessage(error, 'Firma bilgileri güncellenemedi.'));
    }

    return { company: data?.company || null, firmaId: data?.firmaId || null };
};

// Enes Doğanay | 6 Mayıs 2026: Bekleyen etiket talebini çek
export const fetchPendingTagRequest = async (firmaId) => {
    const { data } = await supabase
        .from('etiket_talepleri')
        .select('id, etiketler, durum, created_at')
        .eq('firma_id', firmaId)
        .eq('durum', 'bekliyor')
        .order('created_at', { ascending: false })
        .limit(1);
    return data?.[0] || null;
};

// Enes Doğanay | 6 Mayıs 2026: Logo dosyasını storage'a yükle ve pending_logo_url'e kaydet
export const uploadLogoToPending = async (firmaId, file) => {
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) throw new Error('Logo dosyası en fazla 2 MB olabilir.');
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) throw new Error('Yalnızca PNG, JPG, WebP veya SVG yüklenebilir.');

    // Enes Doğanay | 8 Mayıs 2026: Dosya uzantısı sanitize edilir — boş veya özel karakter içerirse storage path güvenliği bozulur
    const rawExt = (file.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!rawExt) throw new Error('Geçersiz dosya uzantısı.');
    const filePath = `logos/pending_${firmaId}_${Date.now()}.${rawExt}`;
    const { error: uploadError } = await supabase.storage
        .from('firma-logolari')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('firma-logolari').getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error('Public URL alınamadı.');

    const { error: dbErr } = await supabase
        .from('firmalar')
        .update({ pending_logo_url: publicUrl, pending_logo_red_notu: null })
        .eq('firmaID', firmaId);
    if (dbErr) throw dbErr;

    return publicUrl;
};

// Enes Doğanay | 6 Mayıs 2026: Etiket talebi gönder (kurumsal kullanıcı) — session service içinde alınır
export const submitTagRequest = async ({ firmaId, firmaAdi, tags }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('etiket_talepleri').insert({
        firma_id: firmaId,
        firma_adi: firmaAdi,
        talep_eden_user: session?.user?.id,
        etiketler: tags,
        durum: 'bekliyor',
    });
    if (error) throw error;
};

// Enes Doğanay | 6 Mayıs 2026: Etiketleri doğrudan güncelle (admin)
export const updateAdminTags = async (firmaId, tags) => {
    const { error } = await supabase
        .from('firmalar')
        .update({ arama_etiketleri: tags })
        .eq('firmaID', firmaId);
    if (error) throw error;
};