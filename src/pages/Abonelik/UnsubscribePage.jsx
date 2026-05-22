// Enes Doğanay | 13 Mayıs 2026: E-posta abonelik iptal sayfası — token tabanlı
// KVKK / GDPR gereği: e-postadaki link ile login gerekmeden iptal
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { unsubscribeByToken } from '../../services/alertService';
import './UnsubscribePage.css';

const UnsubscribePage = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    // Enes Doğanay | 13 Mayıs 2026: 'loading' | 'success' | 'already' | 'error' | 'invalid'
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!token) { setStatus('invalid'); return; }
        // Enes Doğanay | 15 Mayıs 2026: result.already → 'already'; catch → teknik hata, hep 'error'
        unsubscribeByToken(token)
            .then((result) => {
                if (result?.already) {
                    setStatus('already');
                } else {
                    setStatus('success');
                }
            })
            .catch(() => setStatus('error'));
    }, [token]);

    return (
        <div className="unsub-page">
            <div className="unsub-card">
                {/* Enes Doğanay | 15 Mayıs 2026: picture+prefers-color-scheme OS'u denetler, data-theme değil — iki img CSS toggle */}
                <img src="/tedport-logo_no-background.png" alt="Tedport" className="unsub-logo unsub-logo--light" />
                <img src="/tedport-logo_no-background-dark.png" alt="" aria-hidden="true" className="unsub-logo unsub-logo--dark" />

                {status === 'loading' && (
                    <>
                        <span className="material-symbols-outlined unsub-icon unsub-icon--spin">progress_activity</span>
                        <h2>Abonelik iptal ediliyor...</h2>
                        <p>Lütfen bekleyin.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <span className="material-symbols-outlined unsub-icon unsub-icon--success">check_circle</span>
                        <h2>Abonelik İptal Edildi</h2>
                        <p>Yeni ihale e-posta uyarıları artık gönderilmeyecek.</p>
                        <p className="unsub-hint">
                            Tekrar abone olmak için{' '}
                            <Link href="/ihaleler">ihaleler sayfasına</Link> gidin.
                        </p>
                    </>
                )}

                {status === 'already' && (
                    <>
                        <span className="material-symbols-outlined unsub-icon unsub-icon--success">check_circle</span>
                        <h2>Zaten İptal Edilmiş</h2>
                        <p>Bu abonelik daha önce iptal edilmiş.</p>
                        <p className="unsub-hint">
                            <Link href="/ihaleler">İhaleler sayfasına</Link> dönebilirsiniz.
                        </p>
                    </>
                )}

                {(status === 'error' || status === 'invalid') && (
                    <>
                        <span className="material-symbols-outlined unsub-icon unsub-icon--error">error</span>
                        <h2>Geçersiz Bağlantı</h2>
                        <p>Bu iptal bağlantısı geçerli değil veya süresi dolmuş olabilir.</p>
                        <Link href="/" className="unsub-home-btn">Ana Sayfaya Dön</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default UnsubscribePage;
