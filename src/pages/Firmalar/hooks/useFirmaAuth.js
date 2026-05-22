// Enes Doğanay | 6 Mayıs 2026: Auth durumu + favori yönetimi hook'u
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentSession, fetchFavorites, toggleFavorite } from '../services/firmaService';

export const useFirmaAuth = () => {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const init = async () => {
      const session = await fetchCurrentSession();
      if (!session?.user) return;
      setCurrentUserId(session.user.id);
      setIsLoggedIn(true);
      try {
        const favs = await fetchFavorites(session.user.id);
        setFavoriteIds(new Set(favs.map(f => f.firma_id)));
      } catch {}
    };
    init();
  }, []);

  const handleToggleFavorite = async (firmaId) => {
    const session = await fetchCurrentSession();
    if (!session?.user) { router.push('/login'); return; }
    const isFav = favoriteIds.has(firmaId);
    try {
      await toggleFavorite(session.user.id, firmaId, isFav);
      setFavoriteIds(prev => {
        const n = new Set(prev);
        isFav ? n.delete(firmaId) : n.add(firmaId);
        return n;
      });
    } catch (err) {
      console.error('Favori güncellenemedi:', err);
    }
  };

  return { currentUserId, isLoggedIn, favoriteIds, handleToggleFavorite };
};
