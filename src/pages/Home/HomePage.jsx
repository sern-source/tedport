// Enes Doğanay | 6 Mayıs 2026: Home sayfası — bileşenleri + hook'ları birleştirir
import React from 'react';
import './HomePage.css';
import SharedHeader from '../../components/SharedHeader';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import { useHomeSearch } from './hooks/useHomeSearch';
import { useHomeSuppliers } from './hooks/useHomeSuppliers';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import CategoriesSection from './components/CategoriesSection';
import SuppliersSection from './components/SuppliersSection';
import CTASection from './components/CTASection';
import AppBanner from './components/AppBanner';

const HomePage = () => {
    const searchProps = useHomeSearch();
    const { topSuppliers, isLoading } = useHomeSuppliers();

    return (
        <div className="supplier-connect-wrapper">
            <SEO
                title="Türkiye'nin B2B Tedarik Platformu"
                description="Tedport ile doğrulanmış üreticiler, toptancılar ve distribütörlerle bağlantı kurun. İhale açın, teklif verin, firmaları keşfedin. Ücretsiz üyelik."
                path="/"
            />
            <SharedHeader />

            <main>
                <HeroSection {...searchProps} />
                <StatsSection />
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
