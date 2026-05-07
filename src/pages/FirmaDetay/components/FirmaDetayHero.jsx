// Enes Doğanay | 6 Mayıs 2026: FirmaDetay hero bölümü + claim banner
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FirmaDetayHero.css';

const FirmaDetayHero = ({
    firma,
    isVerified,
    isCurrentUserCompanyManager,
    firmaEkip,
    onShowEkipModal
}) => {
    const navigate = useNavigate();

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
        navigate(`/register?${params.toString()}`);
    };

    return (
        <>
            <section className="profile-hero">
                <div className="container">
                    <div className="hero-flex">
                        {firma.logo_url?.includes('firma-logolari') ? (
                            <img
                                src={firma.logo_url}
                                alt={firma.firma_adi}
                                className="supp-avatar2"
                                style={{ objectFit: 'contain', background: '#fff', padding: '6px' }}
                                onError={e => {
                                    e.currentTarget.outerHTML = `<img class='supp-avatar2' src='/tedport_default_company_logo.png' alt='Default Logo' style='object-fit:contain;background:#fff;padding:6px;' />`;
                                }}
                            />
                        ) : (
                            <img
                                src="/tedport_default_company_logo.png"
                                alt="Default Logo"
                                className="supp-avatar2"
                                style={{ objectFit: 'contain', background: '#fff', padding: '6px' }}
                            />
                        )}

                        <div className="info-content">
                            <div className="title-row">
                                <div>
                                    <h1 className="company-name">
                                        {firma.firma_adi}
                                        {isVerified && (
                                            <span className="verified-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                                                Onaylı Firma
                                            </span>
                                        )}
                                        {!isVerified && (
                                            <span className="platform-profile-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>public</span>
                                                Otomatik Profil
                                            </span>
                                        )}
                                    </h1>
                                    <p className="hero-meta">• {firma.category_name} • 📍 {firma.il_ilce}</p>
                                    {isCurrentUserCompanyManager && (
                                        <button
                                            className="firma-edit-hero-btn"
                                            onClick={() => navigate('/firma-profil?tab=panel')}
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                            Firma Bilgilerini Düzenle
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {firma.show_ekip_public !== false && firmaEkip.length > 0 && (
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
