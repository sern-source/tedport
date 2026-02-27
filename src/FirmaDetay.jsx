import React, { useEffect, useState } from 'react';
import './FirmaDetay.css';
import { supabase } from './supabaseClient';
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';

const SupplierProfile = () => {

    const { id } = useParams();

    const [firma, setFirma] = useState(null);
    const [loading, setLoading] = useState(true);

    function degerleriDiziyeCevir(rawData) {
        // 1. Veri hiç yoksa (null veya undefined) hata vermeden boş dizi dön
        if (!rawData) return [];

        let data = rawData;

        // 2. Veritabanından JSON string'i (metin) olarak geldiyse onu gerçek diziye çevir
        if (typeof rawData === 'string') {
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                console.error("JSON parse hatası:", e);
                return []; // Bozuk bir JSON varsa uygulamayı çökertme
            }
        }

        // 3. Parse işleminden sonra bile dizi değilse, boş dizi dön
        if (!Array.isArray(data)) {
            return [];
        }

        const sonuc = [];

        data.forEach((kategori) => {
            // Ana kategoriyi ekle (varsa)
            if (kategori.ana_kategori) sonuc.push(kategori.ana_kategori);

            // Alt kategorilerde dön (varsa ve diziyse)
            if (kategori.alt_kategoriler && Array.isArray(kategori.alt_kategoriler)) {
                kategori.alt_kategoriler.forEach((alt) => {
                    // Alt kategori başlığını ekle
                    if (alt.baslik) sonuc.push(alt.baslik);

                    // Ürünleri diziye dağıtarak ekle (varsa ve diziyse)
                    if (alt.urunler && Array.isArray(alt.urunler)) {
                        sonuc.push(...alt.urunler);
                    }
                });
            }
        });

        return sonuc;
    }

    useEffect(() => {
        fetchFirma();
    }, [id]);

    const fetchFirma = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('firmalar')
            .select('*')
            .eq('firmaID', id)
            .single();

        if (!error) {
            setFirma(data);
        }

        setLoading(false);
    };

    if (loading) {
        return <div style={{ padding: '40px' }}>Yükleniyor...</div>;
    }

    if (!firma) {
        return <div style={{ padding: '40px' }}>Firma bulunamadı</div>;
    }

    const adresText = firma.adres || firma.il_ilce;
    const encodedAddress = encodeURIComponent(adresText);

    const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap
        ?center=${encodedAddress}
        &zoom=14
        &size=600x300
        &markers=color:red|${encodedAddress}
        &key=YOUR_GOOGLE_MAPS_API_KEY`.replace(/\s/g, '');

    return (
        <div className="supplier-page">
            {/* HEADER */}
            <header className="header">

                <div className="header-left">
                    <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="brand">
                            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="#137fec"></path>
                            </svg>
                            Tedport
                        </div>
                    </Link>
                </div>
                <div className="header-right">
                    <nav className="header-nav">
                        <a href="/">Anasayfa</a>
                        <a href="/firmalar">Firmalar</a>
                        <a href="/hakkimizda">Hakkımızda</a>
                        <a href="/iletisim">İletişim</a>
                    </nav>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined">person</span>
                    </div>
                </div>
            </header >

            {/* HERO SECTION */}
            < section className="profile-hero" >
                <div className="container">
                    <div className="hero-flex">
                        {/*<div className="logo-box" style={{ backgroundImage: `url(${firma.logo_url || 'https://via.placeholder.com/200'})` }}></div>*/}
                        <div className='supp-avatar2' style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', height: '100%', padding: '10px' }}>{firma.firma_adi?.charAt(0)}</div>

                        <div className="info-content">
                            <div className="title-row">
                                <div>
                                    <h1 className="company-name">
                                        {firma.firma_adi}
                                        <span className="verified-badge">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                                            Doğrulanmış
                                        </span>
                                    </h1>
                                    <p style={{ color: '#64748b', margin: '0.5rem 0' }}>• {firma.category_name} • {firma.il_ilce}</p>

                                </div>
                                {/*<div className="btn-group">
                                    <button className="btn btn-outline">Takip Et</button>
                                    <button className="btn btn-primary">Teklif İste</button>
                                </div>*/}
                            </div>
                        </div>
                    </div>
                </div>
            </section >



            {/* MAIN CONTENT */}
            < main className="container" >
                <div className="content-grid">
                    {/* LEFT COLUMN */}
                    <div className="main-info">
                        <article id="about" className="card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                <span className="material-symbols-outlined" style={{ color: '#137fec' }}>apartment</span>
                                Şirket Hakkında
                            </h2>
                            <p style={{ lineHeight: '1.7', color: '#475569' }}>
                                {firma.description}
                            </p>
                        </article>

                        <section id="products">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                                Ürün Kategorileri
                            </h2>

                            <div className="product-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {(degerleriDiziyeCevir(firma.urun_kategorileri) || []).map((item, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#eef2ff',
                                            color: '#4f46e5',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            border: '1px solid #c7d2fe'
                                        }}
                                    >
                                        #{item}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <aside className="sticky-sidebar">
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>İletişime Geç</h3>

                            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
                                Teklif İste
                            </button>


                            <button className="btn btn-outline" style={{ width: '100%' }}>
                                Telefon Numarası
                            </button>

                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                            <h4 style={{ fontSize: '0.875rem' }}>Konum</h4>

                            <div
                                className="map"
                                style={{
                                    backgroundImage:
                                        'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB3t8xzyyOJ5cwSIJTSkWtFdJTGG9zCjTDZcNLJpSMl7TFCQZugghnkhFTItJsNAb4qT-_y-LQ5JNLwaRcGJlyC_pONeAm8ClZLHw0fNX_ej4kqITm5P_0BEZwJA9rlSy-CVRtLQwBZ_8X-Uc52hyFn9vVOfd-6DhDtiHNYco2T_v04U1lQO1UwVLEOGplGUw60oVCBU0hjh_OfBR0TnBLIsCrbdMW61pUbbUcB920-XWkAWA5n2MUskI64i5rXc362iHIgcfsdQWMY)'
                                }}
                            >
                                <div className="map-label">{firma.il_ilce}</div>
                            </div>

                            

                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                            {/* ADRES */}
                            {firma.adres && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "8px",
                                        marginTop: "20px",
                                        color: "#475569",
                                        fontSize: "0.9rem",
                                        lineHeight: "1.6"
                                    }}
                                >
                                    {/* Location Icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="45"
                                        height="45"
                                        fill="none"
                                        stroke="#137fec"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ marginTop: "3px" }}
                                    >
                                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>

                                    <span>{firma.adres}</span>
                                </div>
                            )}

                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                            {/* WEB SİTESİ */}
                            {firma.web_sitesi && (
                                <>
                                    <a
                                        href={
                                            firma.web_sitesi.startsWith("http")
                                                ? firma.web_sitesi
                                                : `https://${firma.web_sitesi}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            textDecoration: "none",
                                            color: "#475569",
                                            lineHeight: "1.7"
                                        }}
                                    >
                                        {/* Internet Icon */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="25"
                                            fill="none"
                                            stroke="#137fec"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
                                        </svg>

                                        {firma.web_sitesi}
                                    </a>

                                    <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                                </>
                            )}

                            {/* E-POSTA */}
                            {firma.eposta && (
                                <>
                                    <a
                                        href={`mailto:${firma.eposta}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            textDecoration: "none",
                                            color: "#475569",
                                            lineHeight: "1.7"
                                        }}
                                    >
                                        {/* Mail Icon */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="25"
                                            fill="none"
                                            stroke="#137fec"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M4 4h16v16H4z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>

                                        {firma.eposta}
                                    </a>

                                    <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </main >
        </div >
    );
};

export default SupplierProfile;