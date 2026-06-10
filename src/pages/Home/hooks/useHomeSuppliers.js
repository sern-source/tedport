// Enes Doğanay | 6 Mayıs 2026: Öne çıkan tedarikçileri yükler
import { useState, useEffect } from 'react';
import { fetchTopSuppliers } from '../services/homeService';

export function useHomeSuppliers() {
    const [topSuppliers, setTopSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        fetchTopSuppliers()
            .then(setTopSuppliers)
            .catch((err) => {
                if (err?.name !== 'AbortError') console.error('Tedarikçi yükleme hatası:', err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { topSuppliers, isLoading };
}
