// Enes Doğanay | 12 Mayıs 2026: Sektör landing sayfası hook — veri, yükleme, hata
import { useState, useEffect } from 'react';
import { fetchTendersBySektor } from '../services/sektorLandingService';

const useSektorLanding = (sektorAdi) => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sektorAdi) return;
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError('');
        fetchTendersBySektor(sektorAdi)
            .then(data => { if (!cancelled) setTenders(data); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [sektorAdi]);

    return { tenders, loading, error };
};

export default useSektorLanding;
