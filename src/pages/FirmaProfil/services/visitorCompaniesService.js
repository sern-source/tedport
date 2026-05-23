// Enes Doğanay | 23 Mayıs 2026: Profil ziyaretçi şirketleri — hangi şirketler baktı
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 23 Mayıs 2026: Viewer ID → şirket adı haritası oluşturur
const buildProfileMap = async (viewerIds) => {
    if (!viewerIds.length) return {};
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, company_name, first_name, last_name')
        .in('id', viewerIds);
    const map = {};
    for (const p of profiles || []) {
        map[p.id] = p.company_name ||
            [p.first_name, p.last_name].filter(Boolean).join(' ') ||
            'Bireysel Kullanıcı';
    }
    return map;
};

// Enes Doğanay | 23 Mayıs 2026: firmaID'ye ziyaret yapan şirketleri sayar, top 10 döner
export const fetchVisitorCompanies = async (firmaId, since) => {
    const { data: views, error } = await supabase
        .from('firma_goruntulemeler')
        .select('viewer_id')
        .eq('firma_id', String(firmaId))
        .gte('created_at', since)
        .not('viewer_id', 'is', null);
    if (error) throw new Error(error.message);
    if (!views?.length) return [];

    const viewerIds = [...new Set(views.map(v => v.viewer_id))];
    const profileMap = await buildProfileMap(viewerIds);

    const counts = {};
    for (const v of views) {
        const name = profileMap[v.viewer_id] || 'Bilinmiyor';
        counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
};
