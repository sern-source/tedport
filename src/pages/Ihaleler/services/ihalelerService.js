// Enes Doğanay | 7 Mayıs 2026: Public ihale listesi servisi — Supabase sorguları
import { supabase } from '../../../supabaseClient';

const isMissingRelationError = (error) =>
    error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

// Enes Doğanay | 7 Mayıs 2026: Public ihale listesini çek, firma bilgileriyle zenginleştir
export const fetchPublicTenders = async (firmaFilter) => {
    const tenderQuery = supabase
        .from('firma_ihaleleri')
        .select('*')
        .neq('durum', 'draft')
        .order('is_featured', { ascending: false })
        .order('yayin_tarihi', { ascending: false });

    if (firmaFilter) tenderQuery.eq('firma_id', firmaFilter);

    const { data: tenderData, error: tenderError } = await tenderQuery;

    if (tenderError) {
        if (tenderError.name === 'AbortError') return { tenders: null, tableMissing: false };
        if (isMissingRelationError(tenderError)) return { tenders: [], tableMissing: true };
        throw tenderError;
    }

    const firmaIds = [...new Set((tenderData || []).map(t => t.firma_id).filter(Boolean))];
    const { data: firmsData, error: firmsError } = firmaIds.length > 0
        ? await supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds)
        : { data: [], error: null };

    if (firmsError) throw firmsError;

    const tenders = (tenderData || [])
        .map(tender => {
            const firm = (firmsData || []).find(f => String(f.firmaID) === String(tender.firma_id)) || {};
            return {
                ...tender,
                firma_adi: firm.firma_adi || tender.firma_adi || 'Firma bilgisi bulunamadı',
                firma_kategori: firm.category_name || '',
                firma_konum: firm.il_ilce || tender.il_ilce || 'Konum belirtilmedi',
            };
        })
        .filter(t => !(t.durum === 'kapali' && t.kapali_gorunurluk === 'gizle'));

    return { tenders, tableMissing: false };
};
