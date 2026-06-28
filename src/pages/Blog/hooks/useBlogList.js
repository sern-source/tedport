// Enes Doğanay | 3 Haziran 2026: Blog listesi hook — yazılar, yükleme, kategori filtresi
// Enes Doğanay | 24 Haziran 2026: Client-side pagination eklendi — 6 makale/sayfa
import { useState, useEffect, useMemo } from 'react';
import { fetchBlogList } from '../services/blogService';

// Enes Doğanay | 28 Haziran 2026: Rehber kaldırıldı → Mevzuat + Sektör Rehberi eklendi
export const BLOG_CATEGORIES = ['Tümü', 'İhale Rehberi', 'Satınalma', 'Mevzuat', 'Dijital Dönüşüm', 'Sektör Rehberi'];

const POSTS_PER_PAGE = 6;

export const useBlogList = () => {
    const [posts, setPosts]         = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError]   = useState(null);
    const [category, setCategory]   = useState('Tümü');
    const [page, setPage]           = useState(1);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setHasError(null);
            try {
                const data = await fetchBlogList({ category });
                if (!cancelled) setPosts(data);
            } catch (err) {
                if (!cancelled) setHasError(err.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [category]);

    // Enes Doğanay | 24 Haziran 2026: Sayfa sayısı ve mevcut sayfa slice'ı
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE)),
        [posts]
    );

    const paginatedPosts = useMemo(
        () => posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE),
        [posts, page]
    );

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setPage(1);
    };

    const handlePageChange = (newPage) => setPage(newPage);

    return { paginatedPosts, totalPages, page, isLoading, hasError, category, handleCategoryChange, handlePageChange };
};
