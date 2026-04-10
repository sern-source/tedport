import { supabase } from './supabaseClient';

const getFunctionsErrorMessage = (error, fallbackMessage) => {
    const contextMessage = error?.context?.msg || error?.message;
    return contextMessage || fallbackMessage;
};

// Enes Doğanay | 6 Nisan 2026: Kurumsal hesap sahibi kullanicinin yonettigi firma id'si tek noktadan okunur
// Enes Doğanay | 10 Nisan 2026: getUser() → getSession() — network çağrısı yerine localStorage okuma, AbortError önlenir
export const getManagedCompanyId = async () => {
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
    } catch (error) {
        const firmaId = await getManagedCompanyId();
        if (!firmaId) {
            return { company: null, firmaId: null, mode: 'database' };
        }

        const { data, error: selectError } = await supabase
            .from('firmalar')
            .select('firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best')
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