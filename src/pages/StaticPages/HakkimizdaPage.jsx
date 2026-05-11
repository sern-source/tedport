// Enes Doğanay | 11 Mayıs 2026: Alt bileşenlere bölündü (150 satır kuralı)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HakkimizdaPage.css';
import './HakkimizdaPage.sections.css';
import './HakkimizdaPage.dark.css';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import AboutHero from './components/AboutHero';
import AboutStats from './components/AboutStats';
import AboutValues from './components/AboutValues';
import AboutFeatures from './components/AboutFeatures';
import AboutTimeline from './components/AboutTimeline';
import AboutCTA from './components/AboutCTA';

const NAV_ITEMS = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Firmalar', href: '/firmalar' },
    { label: 'İhaleler', href: '/ihaleler' },
    { label: 'İletişim', href: '/iletisim' },
];

const About = () => {
    const navigate = useNavigate();

    return (
        <>
            <SEO title="Hakkımızda" description="Tedport hakkında bilgi edinin. Türkiye'nin B2B tedarik portalı hikayesi ve misyonu." path="/hakkimizda" />
            <SharedHeader navItems={NAV_ITEMS} />

            <div className="about-page-wrapper">
                <main className="about-main">
                    <AboutHero onContact={() => navigate('/iletisim')} />
                    <AboutStats />
                    <AboutValues />
                    <AboutFeatures />
                    <AboutTimeline />
                    <AboutCTA
                        onRegister={() => navigate('/register')}
                        onFirmalar={() => navigate('/firmalar')}
                    />
                </main>

                <SharedFooter />
            </div>
        </>
    );
};

export default About;
