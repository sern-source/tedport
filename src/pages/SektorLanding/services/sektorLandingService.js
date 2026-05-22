// Enes Doğanay | 12 Mayıs 2026: Sektör landing sayfası servisi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 12 Mayıs 2026: Belirli sektördeki canlı ihaleleri çek
export const fetchTendersBySektor = async (sektorAdi) => {
    const { data: tenderData, error: tenderError } = await supabase
        .from('firma_ihaleleri')
        .select('*')
        .eq('kategori', sektorAdi)
        .neq('durum', 'draft')
        .order('yayin_tarihi', { ascending: false })
        .limit(50);

    if (tenderError) throw new Error(tenderError.message);

    const firmaIds = [...new Set((tenderData || []).map(t => t.firma_id).filter(Boolean))];
    const { data: firmsData, error: firmsError } = firmaIds.length > 0
        // Enes Doğanay | 23 Mayıs 2026: slug eklendi — firma navigasyonu slug URL kullanacak
        ? await supabase.from('firmalar').select('firmaID, slug, firma_adi, il_ilce').in('firmaID', firmaIds)
        : { data: [], error: null };

    if (firmsError) throw new Error(firmsError.message);

    return (tenderData || [])
        .map(tender => {
            const firm = (firmsData || []).find(f => String(f.firmaID) === String(tender.firma_id)) || {};
            return {
                ...tender,
                firma_adi: firm.firma_adi || tender.firma_adi || 'Firma bilgisi bulunamadı',
                firma_konum: firm.il_ilce || tender.il_ilce || '',
                firma_slug: firm.slug || null,
            };
        })
        .filter(t => !(t.durum === 'kapali' && t.kapali_gorunurluk === 'gizle'));
};
