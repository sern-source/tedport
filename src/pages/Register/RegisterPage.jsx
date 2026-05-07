// Enes Doğanay | 6 Mayıs 2026: Register sayfası — ince shell, tüm mantık hook/service/component'te
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SharedHeader from '../../components/SharedHeader';
import SEO from '../../components/SEO';
import RegistrationTabs from './components/RegistrationTabs';
import IndividualForm from './components/IndividualForm';
import CorporateForm from './components/CorporateForm';
import CorporateSuccess from './components/CorporateSuccess';
import MarketingModal from './components/MarketingModal';
import useIndividualRegister from './hooks/useIndividualRegister';
import useCorporateRegister from './hooks/useCorporateRegister';
import './RegisterPage.css';

const RegisterPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [registrationType, setRegistrationType] = useState(
        searchParams.get('type') === 'corporate' ? 'corporate' : 'individual'
    );
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [showMarketingModal, setShowMarketingModal] = useState(false);
    const [showMarketingTooltip, setShowMarketingTooltip] = useState(false);

    useEffect(() => {
        setRegistrationType(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');
    }, [searchParams]);

    // Enes Doğanay | 6 Mayıs 2026: Sekme değişince marketing modal/tooltip sıfırla
    useEffect(() => {
        setShowMarketingModal(false);
        setShowMarketingTooltip(false);
    }, [registrationType]);

    // Enes Doğanay | 6 Mayıs 2026: ESC ile marketing modalını kapat + body scroll kilidi
    useEffect(() => {
        if (!showMarketingModal) return;
        const onKeyDown = (e) => { if (e.key === 'Escape') setShowMarketingModal(false); };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [showMarketingModal]);

    const showMessage = (type, message) => {
        setNotification({ show: true, type, message });
        window.setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
    };

    const handleTabChange = (nextType) => {
        setRegistrationType(nextType);
        setNotification({ show: false, type: '', message: '' });
        setSearchParams(nextType === 'corporate' ? { type: 'corporate' } : {});
    };

    const individual = useIndividualRegister({ kvkkAccepted, marketingConsent, onMessage: showMessage });
    const corporate = useCorporateRegister({ kvkkAccepted, marketingConsent, onMessage: showMessage });

    const sharedProps = {
        kvkkAccepted, onKvkkChange: setKvkkAccepted,
        marketingConsent, onMarketingChange: setMarketingConsent,
        showMarketingTooltip,
        onToggleMarketingTooltip: () => setShowMarketingTooltip(t => !t),
        onOpenMarketingModal: () => { setShowMarketingTooltip(false); setShowMarketingModal(true); },
    };

    return (
        <div className="page-container">
            <SEO title="Kayıt Ol" description="Tedport'a ücretsiz kayıt olun. Tedarikçi ağına katılın." path="/register" noIndex />
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' },
                ]}
            />

            <main className="main-content">
                <div className={`registration-card${registrationType === 'corporate' ? ' registration-card-corporate' : ''}`}>
                    {notification.show && (
                        <div className={`register-notification${notification.type === 'success' ? ' register-notification--success' : ' register-notification--error'}`}>
                            <span className="material-symbols-outlined register-notification-icon">
                                {notification.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            <span>{notification.message}</span>
                        </div>
                    )}

                    <RegistrationTabs activeTab={registrationType} onChange={handleTabChange} />

                    {registrationType === 'corporate' ? (
                        <>
                            {/* Enes Doğanay | 6 Mayıs 2026: Kurumsal başvuru intro paneli */}
                            <section className="corporate-intro-panel">
                                <div className="corporate-intro-icon">
                                    <span className="material-symbols-outlined">apartment</span>
                                </div>
                                <div className="corporate-intro-copy">
                                    <h1>Kurumsal Hesap Talebi</h1>
                                    <p>Tedport'ta listelenmesini istediğiniz firma adına başvuru bırakın. Talebiniz incelenir, firma doğrulanırsa hesabınız bizim tarafımızdan açılır ve şifre belirleme bağlantısı size mail olarak gönderilir.</p>
                                </div>
                            </section>

                            {corporate.submittedApplication ? (
                                <CorporateSuccess
                                    application={corporate.submittedApplication}
                                    onNewApplication={corporate.resetSubmission}
                                />
                            ) : (
                                <CorporateForm corporate={corporate} {...sharedProps} />
                            )}
                        </>
                    ) : (
                        <IndividualForm individual={individual} {...sharedProps} />
                    )}

                    <div className="card-footer">
                        <div className="footerText">
                            Zaten bir hesabınız var mı?{' '}
                            <Link to={registrationType === 'corporate' ? '/login?type=corporate' : '/login'} className="text-link footer-login-link">
                                Giriş Yap
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {showMarketingModal && (
                <MarketingModal
                    onClose={() => setShowMarketingModal(false)}
                    onAccept={() => { setMarketingConsent(true); setShowMarketingModal(false); }}
                />
            )}

            <footer className="page-footer">
                <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
            </footer>
        </div>
    );
};

export default RegisterPage;
