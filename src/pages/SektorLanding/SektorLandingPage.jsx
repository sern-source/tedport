// Enes Doğanay | 12 Mayıs 2026: Sektör bazlı ihale landing sayfası — SEO optimizasyonlu
import React from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './SektorLandingPage.css';
import SEO from '../../components/SEO';
import TenderCard from '../Ihaleler/components/TenderCard';
import { SEKTORLER } from '../Firmalar/utils/sektorData';
import { slugToSektor, toSlug, getSektorDescription } from './utils/sektorSlugUtils';
import useSektorLanding from './hooks/useSektorLanding';
import { getTenderStatusMeta } from '../../constants/tenderUtils';

// Enes Doğanay | 12 Mayıs 2026: Sektör ikonları
const SEKTOR_ICONS = {
    'Makine ve Endüstriyel Ekipmanlar': 'precision_manufacturing',
    'Metal ve Metal İşleme Sanayi': 'factory',
    'Endüstriyel Otomasyon Sistemleri': 'smart_toy',
    'Elektrik ve Elektrik Ekipmanları': 'bolt',
    'Elektronik ve Elektronik Üretim': 'developer_board',
    'Enerji ve Güç Sistemleri': 'energy_savings_leaf',
    'Mekanik Sistemler ve Mühendislik': 'settings',
    'Hırdavat ve Teknik Malzemeler': 'build',
    'İnşaat ve Yapı Malzemeleri': 'construction',
    'Kimya ve Endüstriyel Kimyasallar': 'science',
    'Plastik ve Plastik Üretimi': 'recycling',
    'Ambalaj ve Paketleme Sistemleri': 'inventory_2',
    'Lojistik ve Tedarik Zinciri': 'local_shipping',
    'Tekstil ve Tekstil Üretimi': 'checkroom',
    'Gıda ve Gıda Üretim Teknolojileri': 'restaurant',
    'Otomotiv ve Otomotiv Yan Sanayi': 'directions_car',
    'Medikal ve Sağlık Teknolojileri': 'medical_services',
    'Bilişim, Yazılım ve BT Çözümleri': 'computer',
    'Güvenlik Sistemleri ve Teknolojileri': 'security',
    'Endüstriyel ve Kurumsal Hizmetler': 'handyman',
};

const SektorLandingPage = () => {
    const { slug } = useParams();
    const router = useRouter();
    const sektorAdi = slugToSektor(slug);
    const { tenders, loading, error } = useSektorLanding(sektorAdi);

    // Enes Doğanay | 12 Mayıs 2026: Geçersiz sektör slug'ı — 404 yönlendir
    if (!sektorAdi) {
        return (
            <div className="sektor-landing">
                <SEO title="Sektör Bulunamadı" noIndex />
                <div className="sektor-landing__state">
                    <span className="material-symbols-outlined">search_off</span>
                    <h3>Sektör bulunamadı</h3>
                    <p>Aradığınız sektör mevcut değil veya URL hatalı.</p>
                    <Link href="/ihaleler" className="sektor-landing__state-link">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Tüm İhalelere Git
                    </Link>
                </div>
            </div>
        );
    }

    const icon = SEKTOR_ICONS[sektorAdi] || 'domain';
    const description = getSektorDescription(sektorAdi);
    const canonicalPath = `/ihaleler/sektor/${slug}`;

    // Enes Doğanay | 12 Mayıs 2026: Canlı ihale sayısı
    const canliCount = tenders.filter(t => {
        const meta = getTenderStatusMeta(t);
        return meta.key === 'canli' || meta.key === 'yaklasan';
    }).length;

    // Enes Doğanay | 12 Mayıs 2026: Diğer sektörler (bu sayfa hariç)
    const otherSektorler = SEKTORLER.filter(s => s !== sektorAdi);

    return (
        <div className="sektor-landing">
            <SEO
                title={`${sektorAdi} İhaleleri`}
                description={description}
                path={canonicalPath}
            />

            {/* ─── Hero ─── */}
            <div className="sektor-landing__hero">
                <div className="sektor-landing__hero-icon">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h1>{sektorAdi} İhaleleri</h1>
                <p>{description}</p>
                {!loading && (
                    <div className="sektor-landing__hero-stats">
                        <span className="sektor-landing__hero-stat">
                            <span className="material-symbols-outlined">receipt_long</span>
                            {tenders.length} ihale listelendi
                        </span>
                        {canliCount > 0 && (
                            <span className="sektor-landing__hero-stat">
                                <span className="material-symbols-outlined">radio_button_checked</span>
                                {canliCount} aktif ihale
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Breadcrumb ─── */}
            <nav className="sektor-landing__breadcrumb" aria-label="Konum">
                <Link href="/">Anasayfa</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <Link href="/ihaleler">İhaleler</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span>{sektorAdi}</span>
            </nav>

            {/* ─── İçerik ─── */}
            <main className="sektor-landing__body">
                <div className="sektor-landing__toolbar">
                    <span className="sektor-landing__toolbar-title">
                        {loading ? 'Yükleniyor…' : (
                            <><span>{tenders.length}</span> ihale bulundu</>
                        )}
                    </span>
                    <button className="sektor-landing__back-btn" onClick={() => router.push('/ihaleler')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                        Tüm İhaleler
                    </button>
                </div>

                {/* Enes Doğanay | 12 Mayıs 2026: Yükleniyor */}
                {loading && (
                    <div className="sektor-landing__state">
                        <div className="sektor-landing__spinner" />
                        <p>İhaleler yükleniyor…</p>
                    </div>
                )}

                {/* Enes Doğanay | 12 Mayıs 2026: Hata */}
                {!loading && error && (
                    <div className="sektor-landing__state">
                        <span className="material-symbols-outlined">error_outline</span>
                        <h3>Yüklenemedi</h3>
                        <p>{error}</p>
                    </div>
                )}

                {/* Enes Doğanay | 12 Mayıs 2026: Boş durum */}
                {!loading && !error && tenders.length === 0 && (
                    <div className="sektor-landing__state">
                        <span className="material-symbols-outlined">inbox</span>
                        <h3>Henüz ihale yok</h3>
                        <p>Bu sektörde şu an aktif ihale bulunmuyor. Bildirimleri açarak yeni ihalelerden haberdar olabilirsiniz.</p>
                        <Link href="/ihaleler" className="sektor-landing__state-link">
                            <span className="material-symbols-outlined">search</span>
                            Tüm İhale Listesi
                        </Link>
                    </div>
                )}

                {/* Enes Doğanay | 12 Mayıs 2026: İhale kartları */}
                {!loading && !error && tenders.length > 0 && (
                    <div className="sektor-landing__grid">
                        {tenders.map(tender => (
                            <TenderCard
                                key={tender.id}
                                tender={tender}
                                onDetail={() => router.push(`/ihaleler?ihale=${tender.id}`)}
                                onNavigateFirma={() => router.push(`/firmadetay/${tender.firma_id}`)}
                            />
                        ))}
                    </div>
                )}

                {/* Enes Doğanay | 12 Mayıs 2026: Diğer sektörler */}
                <section className="sektor-landing__other">
                    <h2>Diğer Sektörler</h2>
                    <div className="sektor-landing__other-grid">
                        {otherSektorler.map(s => (
                            <Link
                                key={s}
                                to={`/ihaleler/sektor/${toSlug(s)}`}
                                className="sektor-landing__other-chip"
                            >
                                <span className="material-symbols-outlined">{SEKTOR_ICONS[s] || 'domain'}</span>
                                {s}
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SektorLandingPage;
