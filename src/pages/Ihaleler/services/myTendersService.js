// Enes Doğanay | 7 Mayıs 2026: Kendi ihale yönetimi servis — auth durumu + referans no üretimi
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 7 Mayıs 2026: Firma onay durumu + kullanıcı rolü — aynı anda sorgu
export const fetchFirmaAuthStatus = async (firmaId, userId) => {
    const [firmaRes, rolRes] = await Promise.all([
        supabase.from('firmalar').select('onayli_hesap').eq('firmaID', firmaId).maybeSingle(),
        supabase.from('kurumsal_firma_yoneticileri').select('role').eq('firma_id', firmaId).eq('user_id', userId).maybeSingle(),
    ]);
    return {
        isVerified: firmaRes.data?.onayli_hesap === true,
        isOwner: rolRes.data?.role === 'owner',
    };
};

// Enes Doğanay | 7 Mayıs 2026: Otomatik referans no üretimi — TED-FIR-YYYY-0001 formatı
export const generateTenderRefNo = async (firmaId) => {
    if (!firmaId) return '';
    const { data: firma } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', firmaId).maybeSingle();
    if (!firma?.firma_adi) return '';
    const prefix = firma.firma_adi.trim().slice(0, 3).toLocaleUpperCase('tr-TR');
    const year = new Date().getFullYear();
    const { data: existing } = await supabase.from('firma_ihaleleri').select('referans_no').eq('firma_id', firmaId);
    const myRefs = (existing || []).map(r => r.referans_no).filter(Boolean);
    const pattern = new RegExp(`^TED-${prefix}\\d*-${year}-(\\d+)$`);
    let maxSeq = 0;
    myRefs.forEach(ref => { const m = ref.match(pattern); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
    const { data: others } = await supabase.from('firma_ihaleleri').select('referans_no').neq('firma_id', firmaId).like('referans_no', `TED-${prefix}%-${year}-%`);
    const hasSamePrefix = (others || []).length > 0;
    const suffix = hasSamePrefix ? `${prefix}2` : prefix;
    if (hasSamePrefix) {
        const p2 = new RegExp(`^TED-${suffix}-${year}-(\\d+)$`);
        myRefs.forEach(ref => { const m = ref.match(p2); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
        return `TED-${suffix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
    }
    return `TED-${prefix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
};
