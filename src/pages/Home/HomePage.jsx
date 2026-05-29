// Enes Doğanay | 6 Mayıs 2026: Home sayfası — bileşenleri + hook'ları birleştirir
'use client';
import React from 'react';
import './HomePage.css';
import SharedHeader from '../../components/SharedHeader';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import { useHomeSearch } from './hooks/useHomeSearch';
import { useHomeSuppliers } from './hooks/useHomeSuppliers';
import { useHomePlatformStats } from './hooks/useHomePlatformStats';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import HowItWorksSection from './components/HowItWorksSection';
import CategoriesSection from './components/CategoriesSection';
import SuppliersSection from './components/SuppliersSection';
import CTASection from './components/CTASection';
import AppBanner from './components/AppBanner';

const HomePage = () => {
    const searchProps = useHomeSearch();
    const { topSuppliers, isLoading } = useHomeSuppliers();
    // Enes Doğanay | 13 Mayıs 2026: Hero badge için canlı firma sayısı
    const { stats: platformStats } = useHomePlatformStats();

    return (
        <div className="supplier-connect-wrapper">
            {/* Enes Doğanay | 14 Mayıs 2026: SEO başlık ve açıklaması hero konumlandırmasıyla eşleştirildi */}
            <SEO
                title="Türkiye'nin Kurumsal İş Ağı"
                description="Doğru firmaları keşfedin, satınalma süreçlerinizi hızlandırın ve uzun vadeli çözüm ortaklıkları kurun — hepsi tek platformda. Ücretsiz üyelik."
                path="/"
            />
            <SharedHeader />

            <main>
                <HeroSection {...searchProps} firmaCount={platformStats.firmaCount} />
                <StatsSection />
                {/* Enes Doğanay | 12 Mayıs 2026: Nasıl Çalışır — sayfa akışına eklendi */}
                <HowItWorksSection />
                <CategoriesSection />
                <SuppliersSection topSuppliers={topSuppliers} isLoading={isLoading} />
                <CTASection />
                <AppBanner />
            </main>

            <SharedFooter />
        </div>
    );
};

export default HomePage;
