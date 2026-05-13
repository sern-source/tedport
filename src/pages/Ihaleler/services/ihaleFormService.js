// Enes Doğanay | 7 Mayıs 2026: İhale form servis — email kontrolü, firma arama, dosya yükleme
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 8 Mayıs 2026: check_email_availability RPC — JSONB döner: {available:false} = kayıtlı, {available:true} = yok
export const checkEmailInDb = async (email) => {
    const { data, error } = await supabase.rpc('check_email_availability', { p_email: email.trim().toLowerCase() });
    if (error) return false;
    return data?.available === false;
};

// Enes Doğanay | 7 Mayıs 2026: Firma adına göre firmalar tablosunu ara
export const searchFirmasByName = async (term) => {
    const { data, error } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, onayli_hesap')
        .ilike('firma_adi', `%${term}%`)
        .limit(8);
    if (error) throw new Error(error.message);
    return data || [];
};

// Enes Doğanay | 13 Mayıs 2026: İzin verilen MIME tipleri whitelist — güvenlik sınır denetimi
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
]);

// Enes Doğanay | 7 Mayıs 2026: Yeni File nesnelerini ihale-ekleri bucket'ına yükle
// Enes Doğanay | 13 Mayıs 2026: MIME type whitelist kontrolü eklendi
export const uploadIhaleFiles = async (referansNo, files) => {
    const uploaded = [];
    for (const file of files) {
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            throw new Error(`"${file.name}" dosya türü desteklenmiyor. İzin verilenler: PDF, resim, Word, Excel.`);
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${referansNo || 'temp'}/${Date.now()}_${safeName}`;
        const { error } = await supabase.storage
            .from('ihale-ekleri')
            .upload(filePath, file, { upsert: false });
        if (error) throw new Error(`"${file.name}" yüklenemedi: ${error.message}`);
        const { data: urlData } = supabase.storage
            .from('ihale-ekleri')
            .getPublicUrl(filePath);
        uploaded.push({ name: file.name, path: filePath, size: file.size, url: urlData.publicUrl });
    }
    return uploaded;
};
