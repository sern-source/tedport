// Enes Doğanay | 6 Nisan 2026: İhale yönetim API client — ihale-management Edge Function ile konuşur
import { supabase } from './supabaseClient';

// Enes Doğanay | 6 Nisan 2026: Supabase FunctionsHttpError'ın gövdesinden gerçek hata mesajı okunur
const extractFnError = async (error, fallback) => {
    try {
        const body = await error?.context?.json?.();
        if (body?.error) return body.error;
    } catch { /* ignore */ }
    return error?.message || fallback;
};

// Enes Doğanay | 6 Nisan 2026: Giriş yapan kurumsal kullanıcının tüm ihalelerini çeker
export const listMyTenders = async () => {
    const { data, error } = await supabase.functions.invoke('ihale-management', {
        body: { action: 'list_my_tenders' }
    });
    if (error) throw new Error(await extractFnError(error, 'İhaleler alınamadı.'));
    return data?.tenders ?? [];
};

// Enes Doğanay | 6 Nisan 2026: Yeni ihale oluşturur; server firm_id'yi JWT'den alır
export const createTender = async (tender) => {
    const { data, error } = await supabase.functions.invoke('ihale-management', {
        body: { action: 'create_tender', tender }
    });
    if (error) throw new Error(await extractFnError(error, 'İhale oluşturulamadı.'));
    return data?.tender;
};

// Enes Doğanay | 6 Nisan 2026: Mevcut ihaleyi günceller; server sahipliği doğrular
export const updateTender = async (id, tender) => {
    const { data, error } = await supabase.functions.invoke('ihale-management', {
        body: { action: 'update_tender', id, tender }
    });
    if (error) throw new Error(await extractFnError(error, 'İhale güncellenemedi.'));
    return data?.tender;
};

// Enes Doğanay | 6 Nisan 2026: İhaleyi siler; server sahipliği doğrular
export const deleteTender = async (id) => {
    const { data, error } = await supabase.functions.invoke('ihale-management', {
        body: { action: 'delete_tender', id }
    });
    if (error) throw new Error(await extractFnError(error, 'İhale silinemedi.'));
    return data?.success ?? false;
};
