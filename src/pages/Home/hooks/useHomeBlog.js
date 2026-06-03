// Enes Doğanay | 3 Haziran 2026: Ana sayfa için son 3 blog yazısını yükler
import { useState, useEffect } from 'react';
import { fetchBlogList } from '../../Blog/services/blogService';

export function useHomeBlog() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetchBlogList()
            .then((all) => setPosts(all.slice(0, 3)))
            .catch(() => setPosts([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { posts, isLoading };
}
