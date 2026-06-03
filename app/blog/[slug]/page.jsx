// Enes Doğanay | 3 Haziran 2026: /blog/[slug] route — tekil yazı sayfası + dinamik metadata
import { Suspense } from 'react';
import BlogPostPage from '../../../src/pages/Blog/BlogPostPage';

const BASE_URL = 'https://tedport.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enes Doğanay | 3 Haziran 2026: Supabase'den yazı meta bilgisini çek (SSR metadata için)
async function fetchPostMeta(slug) {
    try {
        const url = `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=seo_title,seo_description,title,summary&limit=1`;
        const res = await fetch(url, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.[0] || null;
    } catch {
        return null;
    }
}

// Enes Doğanay | 3 Haziran 2026: SSR metadata — Google'da doğru başlık/açıklama
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await fetchPostMeta(slug);
    if (!post) return { title: 'Yazı | Tedport' };

    return {
        title: post.seo_title || post.title,
        description: post.seo_description || post.summary,
        openGraph: {
            title: post.seo_title || post.title,
            description: post.seo_description || post.summary,
            url: `${BASE_URL}/blog/${slug}`,
        },
    };
}

export default async function BlogPostRoute({ params }) {
    const { slug } = await params;
    return <Suspense fallback={null}><BlogPostPage slug={slug} /></Suspense>;
}
