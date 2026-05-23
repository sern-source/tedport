// Enes Doğanay | 23 Mayıs 2026: Teklif istatistikleri — gelen (firmanın ihalelerine) / giden (firma tarafından gönderilen)
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: ihale_teklifleri üzerinden dönem bazlı teklif sayıları
export const fetchQuoteRequestStats = async (firmaId, since) => {
    const [incomingRes, outgoingRes] = await Promise.all([
        supabase
            .from('ihale_teklifleri')
            .select('id', { count: 'exact', head: true })
            .eq('firma_id', String(firmaId))
            .gte('created_at', since),
        supabase
            .from('ihale_teklifleri')
            .select('id', { count: 'exact', head: true })
            .eq('gonderen_firma_id', String(firmaId))
            .gte('created_at', since),
    ]);
    if (incomingRes.error) throw new Error(incomingRes.error.message);
    if (outgoingRes.error) throw new Error(outgoingRes.error.message);
    return {
        incoming: incomingRes.count ?? 0,
        outgoing: outgoingRes.count ?? 0,
    };
};
