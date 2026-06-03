// Enes Doğanay | 3 Haziran 2026: Blog listesi hook — yazılar, yükleme, kategori filtresi
import { useState, useEffect } from 'react';
import { fetchBlogList } from '../services/blogService';

export const BLOG_CATEGORIES = ['Tümü', 'İhale Rehberi', 'Satınalma', 'Dijital Dönüşüm', 'Rehber'];

export const useBlogList = () => {
    const [posts, setPosts]         = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError]   = useState(null);
    const [category, setCategory]   = useState('Tümü');

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

    const handleCategoryChange = (cat) => setCategory(cat);

    return { posts, isLoading, hasError, category, handleCategoryChange };
};
