// Enes Doğanay | 7 Mayıs 2026: İhale form servis — email kontrolü, firma arama, dosya yükleme
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 7 Mayıs 2026: Profil tablosunda e-posta var mı kontrolü
export const checkEmailInDb = async (email) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
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

// Enes Doğanay | 7 Mayıs 2026: Yeni File nesnelerini ihale-ekleri bucket'ına yükle
export const uploadIhaleFiles = async (referansNo, files) => {
    const uploaded = [];
    for (const file of files) {
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
