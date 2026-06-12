// Enes Doğanay | 12 Haziran 2026: İhale aç bilgi banner'ı — kurumsal hesabı olmayan kullanıcılara yönlendirme
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DISMISS_KEY = 'ihale_ac_banner_dismissed';

// Enes Doğanay | 12 Haziran 2026: Kurumsal hesabı olmayan kullanıcılara ihale açma bilgisi
const IhaleAcBanner = ({ authManagedCompanyId, authChecked }) => {
    const router = useRouter();
    const [dismissed, setDismissed] = useState(true); // başta gizli, sessionStorage'a bakacak

    useEffect(() => {
        const val = sessionStorage.getItem(DISMISS_KEY);
        setDismissed(val === '1');
    }, []);

    // Enes Doğanay | 12 Haziran 2026: Auth yüklenene kadar ve kurumsal hesabı varsa banner gösterme
    if (!authChecked || authManagedCompanyId || dismissed) return null;

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, '1');
        setDismissed(true);
    };

    return (
        <div className="ihale-ac-banner">
            {/* Enes Doğanay | 12 Haziran 2026: Sol — ikon + metin */}
            <div className="ihale-ac-banner__left">
                <div className="ihale-ac-banner__icon-wrap">
                    <span className="material-symbols-outlined">domain</span>
                </div>
                <div className="ihale-ac-banner__text">
                    <p className="ihale-ac-banner__title">İhale oluşturmak mı istiyorsunuz?</p>
                    <p className="ihale-ac-banner__desc">
                        Mevcut ihaleleri inceleyebilir ve uygun ihalelere teklif verebilirsiniz. Yeni ihale yayınlamak ve tedarikçilerden teklif toplamak için <strong>doğrulanmış kurumsal şirket hesabı</strong> gereklidir.
                    </p>
                </div>
            </div>
            {/* Enes Doğanay | 12 Haziran 2026: Sağ — CTA + kapat */}
            <div className="ihale-ac-banner__actions">
                <button
                    className="ihale-ac-banner__cta"
                    onClick={() => router.push('/register?type=corporate')}
                >
                    <span className="material-symbols-outlined">add_business</span>
                    Kurumsal Başvuru Yap
                </button>
                <button className="ihale-ac-banner__close" onClick={handleDismiss} aria-label="Kapat">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
};

export default IhaleAcBanner;
