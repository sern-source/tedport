// Enes Doğanay | 3 Haziran 2026: Blog servisi — Supabase sorgular
import { supabase } from '../../../supabaseClient';

const SELECT_LIST = 'id, slug, title, summary, category, reading_time, cover_color, published_at';
const SELECT_ALL  = '*';

// Enes Doğanay | 3 Haziran 2026: Tüm yayınlanmış yazıları getir (opsiyonel kategori filtresi)
export const fetchBlogList = async ({ category } = {}) => {
    let query = supabase
        .from('blog_posts')
        .select(SELECT_LIST)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    if (category && category !== 'Tümü') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
};

// Enes Doğanay | 3 Haziran 2026: Slug ile tekil yazıyı getir
// Enes Doğanay | 28 Haziran 2026: .single() → .maybeSingle() — bulunamayan slug için PGRST116 yerine null döner
export const fetchBlogPost = async (slug) => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select(SELECT_ALL)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Yazı bulunamadı');
    return data;
};

// Enes Doğanay | 3 Haziran 2026: İlgili yazılar — aynı kategori, farklı slug
export const fetchRelatedPosts = async (slug, category) => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select(SELECT_LIST)
        .eq('is_published', true)
        .eq('category', category)
        .neq('slug', slug)
        .limit(3);

    if (error) throw new Error(error.message);
    return data || [];
};

// Enes Doğanay | 3 Haziran 2026: Sitemap için tüm slug'ları getir
export const fetchBlogSlugs = async () => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('slug, published_at')
        .eq('is_published', true);

    if (error) return [];
    return data || [];
};
