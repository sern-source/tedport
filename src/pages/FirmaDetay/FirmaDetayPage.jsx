// Enes Doğanay | 6 Mayıs 2026: FirmaDetay sayfa koordinatörü
// Enes Doğanay | 13 Mayıs 2026: SEO bileşeni eklendi — firma başlığı + açıklama + og:image
import React from 'react';
import { useParams } from 'react-router-dom';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import PageLoader from '../../components/PageLoader';
import SEO from '../../components/SEO';
import { useFirmaDetay } from './hooks/useFirmaDetay';
import FirmaDetayHero from './components/FirmaDetayHero';
import FirmaDetayMain from './components/FirmaDetayMain';
import FirmaDetayModals from './components/FirmaDetayModals';
import FdToast from './components/FdToast';
import './FirmaDetayPage.css';

const NAV_ITEMS = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Firmalar', href: '/firmalar' },
    { label: 'İhaleler', href: '/ihaleler' },
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'İletişim', href: '/iletisim' }
];

const FirmaDetayPage = () => {
    const { id } = useParams();
    const fd = useFirmaDetay(id);

    if (fd.loading) return <PageLoader />;
    if (!fd.firma) return (
        <div className="page-status page-status-error">
            <span className="material-symbols-outlined page-status-icon">error</span>
            Firma bulunamadı
        </div>
    );

    return (
        <>
            {/* Enes Doğanay | 13 Mayıs 2026: Dinamik SEO — her firma sayfası benzersiz title/description/og:image */}
            <SEO
                title={fd.firma.firma_adi}
                description={`${fd.firma.firma_adi}${fd.firma.category_name ? ' — ' + fd.firma.category_name : ''}${fd.firma.il_ilce ? ', ' + fd.firma.il_ilce : ''}. Tedport'ta firma profilini inceleyin, teklif talebi gönderin.`}
                path={`/firmadetay/${id}`}
                image={fd.firma.logo_url?.includes('firma-logolari') ? fd.firma.logo_url : undefined}
            />
            <FdToast toast={fd.fdToast} onClose={() => fd.setFdToast(null)} />
            <SharedHeader search={fd.detaySearch} setSearch={fd.setDetaySearch} showSearchBar={true} suggestions={fd.suggestions} onSuggestionClick={fd.handleSuggestionClick} onSearchSubmit={fd.handleSearchSubmit} noResults={fd.noResults} navItems={NAV_ITEMS} searchMode={fd.detaySearchMode} onSearchModeChange={fd.setDetaySearchMode} />
            {/* Enes Doğanay | 13 Mayıs 2026: viewCount — firma sahibine analitik badge */}
            <FirmaDetayHero firma={fd.firma} isVerified={fd.isVerified} isCurrentUserCompanyManager={fd.isCurrentUserCompanyManager} firmaEkip={fd.firmaEkip} onShowEkipModal={() => fd.setShowEkipModal(true)} isLoggedIn={!!fd.userProfile} sertifikalar={fd.sertifikalar} viewCount={fd.viewCount} />
            <FirmaDetayMain fd={fd} firmaId={id} />
            <FirmaDetayModals fd={fd} />
        </>
    );
};

export default FirmaDetayPage;
