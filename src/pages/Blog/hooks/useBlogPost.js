// Enes Doğanay | 3 Haziran 2026: Tekil blog yazısı hook — içerik + ilgili yazılar
import { useState, useEffect } from 'react';
import { fetchBlogPost, fetchRelatedPosts } from '../services/blogService';

export const useBlogPost = (slug) => {
    const [post, setPost]           = useState(null);
    const [related, setRelated]     = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError]   = useState(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            setHasError(null);
            try {
                const data = await fetchBlogPost(slug);
                if (cancelled) return;
                setPost(data);
                const rel = await fetchRelatedPosts(slug, data.category);
                if (!cancelled) setRelated(rel);
            } catch (err) {
                if (!cancelled) setHasError(err.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [slug]);

    return { post, related, isLoading, hasError };
};
