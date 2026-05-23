// Enes Doğanay | 6 Mayıs 2026: FirmaDetay hero bölümü + claim banner
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Enes Doğanay | 12 Mayıs 2026: Sertifika badge renk meta
import { SERTIFIKA_META } from '../../../constants/sertifikaConstants';
import './FirmaDetayHero.css';

const FirmaDetayHero = ({
    firma,
    isVerified,
    // Enes Doğanay | 17 Mayıs 2026: Demo firmalar badge almaz
    isDemo,
    isCurrentUserCompanyManager,
    firmaEkip,
    onShowEkipModal,
    isLoggedIn,
    // Enes Doğanay | 12 Mayıs 2026: Admin onaylı sertifika listesi
    sertifikalar,
    // Enes Doğanay | 13 Mayıs 2026: Aylık profil görüntüleme sayısı (sadece firma sahibi görür)
    viewCount,
}) => {
    const router = useRouter();
    // Enes Doğanay | 23 Mayıs 2026: Firma logo yükleme hatası — default logo'ya fallback
    const [logoError, setLogoError] = useState(false);

    const handleClaimProfile = () => {
        const params = new URLSearchParams({
            type: 'corporate',
            firmaId: firma.firmaID?.toString() || '',
            firmaAdi: firma.firma_adi || '',
            ilIlce: firma.il_ilce || '',
            telefon: firma.telefon || '',
            adres: firma.adres || '',
            webSitesi: firma.web_sitesi || '',
            eposta: firma.eposta || ''
        });
        router.push(`/register?${params.toString()}`);
    };

    return (
        <>
            <section className="profile-hero">
                <div className="container">
                    <div className="hero-flex">
                    {/* Enes Doğanay | 23 Mayıs 2026: next/image priority — LCP görseli, WebP otomatik */}
                        <div className="supp-avatar2">
                            <Image
                                src={!logoError && firma.logo_url?.includes('firma-logolari') ? firma.logo_url : '/tedport_default_company_logo.png'}
                                alt={firma.firma_adi}
                                fill
                                priority
                                sizes="(max-width: 768px) 80px, 100px"
                                style={{ objectFit: 'contain', padding: '6px' }}
                                onError={() => setLogoError(true)}
                            />
                        </div>

                        <div className="info-content">
                            <div className="title-row">
                                <div>
                                    <h1 className="company-name">
                                        {firma.firma_adi}
                                        {isVerified && !isDemo && (
                                            <span className="verified-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                                                Onaylı Firma
                                            </span>
                                        )}
                                        {/* Enes Doğanay | 19 Mayıs 2026: Otomatik Profil → Firma Onayı Bekleniyor (schedule ikonu) */}
                                        {!isVerified && !isDemo && (
                                            <span className="platform-profile-badge">
                                                Firma Onayı Bekleniyor
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                            </span>
                                        )}
                                    </h1>
                                    <p className="hero-meta">• {firma.category_name} • 📍 {firma.il_ilce}</p>
                                    {/* Enes Doğanay | 12 Mayıs 2026: Onaylı sertifika rozet satırı */}
                                    {sertifikalar && sertifikalar.length > 0 && (
                                        <div className="cert-badges">
                                            {sertifikalar.map(s => {
                                                const label = s.sertifika_turu === 'Diger'
                                                    ? (s.sertifika_turu_diger || 'Sertifika')
                                                    : s.sertifika_turu;
                                                const meta = SERTIFIKA_META[s.sertifika_turu] || SERTIFIKA_META['Diger'];
                                                return (
                                                    <span
                                                        key={s.id}
                                                        className="cert-badge"
                                                        style={{ '--cb-color': meta.color, '--cb-bg': meta.bg, '--cb-border': meta.border }}
                                                        data-tooltip={meta.desc}
                                                    >
                                                        <span className="material-symbols-outlined cert-badge-icon">workspace_premium</span>
                                                        {label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {isCurrentUserCompanyManager && (
                                        <button
                                            className="firma-edit-hero-btn"
                                            onClick={() => router.push('/firma-profil?tab=panel')}
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                            Firma Bilgilerini Düzenle
                                        </button>
                                    )}
                                    {/* Enes Doğanay | 13 Mayıs 2026: Profil analitik badge — sadece firma sahibi görür */}
                                    {isCurrentUserCompanyManager && viewCount !== null && (
                                        <span className="firma-view-count-badge">
                                            <span className="material-symbols-outlined">visibility</span>
                                            Bu ay <strong>{viewCount}</strong> kişi profilinizi görüntüledi
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {firma.show_ekip_public !== false && firmaEkip.length > 0 && isLoggedIn && (
                            <div className="hero-ekip-preview">
                                <div className="hero-ekip-stack">
                                    {firmaEkip.slice(0, 3).map((uye, i) => (
                                        <div key={uye.user_id} className="hero-ekip-avatar-wrap" style={{ zIndex: 10 - i }}>
                                            {uye.avatar_url ? (
                                                <img src={uye.avatar_url} alt={uye.full_name || ''} className="hero-ekip-avatar-img" />
                                            ) : (
                                                <span className="hero-ekip-avatar-initials">
                                                    {(uye.full_name || '?').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {firmaEkip.length > 3 && (
                                        <div className="hero-ekip-more">+{firmaEkip.length - 3}</div>
                                    )}
                                </div>
                                <button type="button" className="hero-ekip-btn" onClick={onShowEkipModal}>
                                    Ekibi İncele
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {!isVerified && (
                <div className="claim-profile-banner">
                    <div className="container">
                        <div className="claim-profile-content">
                            <div className="claim-profile-info">
                                <div className="claim-profile-icon-wrap">
                                    <span className="material-symbols-outlined">domain_verification</span>
                                </div>
                                <div className="claim-profile-text">
                                    <strong>Bu profil platform tarafından oluşturuldu</strong>
                                    <p>Bu firma henüz Tedport'ta kurumsal hesabını aktifleştirmedi. Firma yetkilisiyseniz profilinizi sahiplenin, bilgilerinizi güncelleyin ve teklif almaya başlayın.</p>
                                </div>
                            </div>
                            <button className="claim-profile-btn" onClick={handleClaimProfile}>
                                <span className="material-symbols-outlined">verified_user</span>
                                Firma Profilinizi Sahiplenin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FirmaDetayHero;
