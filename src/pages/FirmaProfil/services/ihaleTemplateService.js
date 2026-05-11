// Enes Doğanay | 11 Mayıs 2026: İhale şablonları servis katmanı
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 11 Mayıs 2026: Firmaya ait tüm şablonları getir
export const fetchTemplates = async (firmaId) => {
    const { data, error } = await supabase
        .from('ihale_sablonlari')
        .select('*')
        .eq('firma_id', firmaId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

// Enes Doğanay | 11 Mayıs 2026: Yeni şablon kaydet
export const saveTemplate = async (firmaId, sablon) => {
    const { data, error } = await supabase
        .from('ihale_sablonlari')
        .insert([{ firma_id: firmaId, ...sablon }])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

// Enes Doğanay | 11 Mayıs 2026: Şablonu sil
export const deleteTemplate = async (templateId) => {
    const { error } = await supabase
        .from('ihale_sablonlari')
        .delete()
        .eq('id', templateId);
    if (error) throw new Error(error.message);
};
