// Enes Doğanay | 11 Mayıs 2026: Alt bileşenlere bölündü (150 satır kuralı)
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
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
import AboutProblem from './components/AboutProblem';
import AboutFeatures from './components/AboutFeatures';
import AboutTimeline from './components/AboutTimeline';
import AboutCTA from './components/AboutCTA';

const About = () => {
    const router = useRouter();

    return (
        <>
            <SEO title="Hakkımızda" description="Türkiye'nin B2B çözüm ortaklığı platformu Tedport hakkında bilgi edinin. Misyonumuz, vizyonumuz ve platformun sunduğu avantajlar." path="/hakkimizda" />
            <SharedHeader />

            <div className="about-page-wrapper">
                <main className="about-main">
                    <AboutHero onContact={() => router.push('/iletisim')} />
                    <AboutStats />
                    <AboutProblem />
                    <AboutValues />
                    <AboutFeatures />
                    <AboutTimeline />
                    <AboutCTA
                        onRegister={() => router.push('/register')}
                        onFirmalar={() => router.push('/firmalar')}
                    />
                </main>

                <SharedFooter />
            </div>
        </>
    );
};

export default About;
