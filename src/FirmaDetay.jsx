import React, { useEffect, useState } from 'react';
import './FirmaDetay.css';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

const SupplierProfile = () => {

    const { id } = useParams();

    const [firma, setFirma] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    <div className="brand">
                        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="#137fec"></path>
                        </svg>
                        Tedport
                    </div>

                </div>
                <div className="header-right">
                    <nav className="header-nav">
                        <a href="/firmalar">Firmalar</a>
                        <a href="#">Ürünler</a>
                        <a href="#">Favoriler</a>
                    </nav>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDBfXFoWq-Oedkexbt-QB3UeNKtEv8MFpmn5ejU5Kr8gTRLnvldCxkdPYippL03z_Be-vUEWM8cahhT9OWWSk3CladKdZL4kNeduBp71pvYnWnIRA8TqabZW-pRD9ECHh0KFaVK7joq1YVYAkWZJtnWYAO7SnhgXhfkosRW5d4v_mYCrQk7K-hGRSm93oo7QM9PSY0B3BuLhqJ5xFZvSWQ4IAcrNLi0J45kN-sMC6Cdf1RDM3YlukZSS9_i12OwxL5XJFlaNhxiGgIm) center/cover' }}></div>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="profile-hero">
                <div className="container">
                    <div className="hero-flex">
                        <div className="logo-box" style={{ backgroundImage: `url(${firma.logo_url || 'https://via.placeholder.com/200'})` }}></div>
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
                                <div className="btn-group">
                                    <button className="btn btn-outline">Takip Et</button>
                                    <button className="btn btn-primary">Teklif İste</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* MAIN CONTENT */}
            <main className="container">
                <div className="content-grid">
                    {/* LEFT COLUMN */}
                    <div className="main-info">
                        <article id="about" className="card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                <span className="material-symbols-outlined" style={{ color: '#137fec' }}>apartment</span>
                                Şirket Hakkında
                            </h2>
                            <p style={{ lineHeight: '1.7', color: '#475569' }}>
                                1995'ten beri hassas çelik bileşenlerin önde gelen üreticisiyiz. Küresel pazarlar için CNC işleme, endüstriyel bağlantı elemanları ve hidrolik valfler konusunda uzmanlaşıyoruz. Tesisimiz ISO 9001:2015 sertifikalı olup otomotiv, havacılık ve inşaat sektörlerindeki müşterilere hizmet vermekteyiz.
                            </p>
                        </article>

                        <section id="products">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ürün Kategorileri</h2>
                            <div className="product-list">
                                {[
                                    { name: "Hassas CNC Dişliler", price: "$2.50 - $5.00", img: "2" },
                                    { name: "Bağlantı Elemanları", price: "$0.05 - $0.20", img: "3" },
                                    { name: "Kontrol Valfleri", price: "$45.00 - $60.00", img: "4" }
                                ].map((item, i) => (
                                    <div key={i} className="product-item">
                                        <div className="product-thumb" style={{ backgroundImage: `url(http://googleusercontent.com/profile/picture/${item.img})` }}></div>
                                        <div className="product-details">
                                            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{item.name}</h3>
                                            <p style={{ color: '#137fec', fontWeight: '700', marginTop: '8px' }}>{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <aside className="sticky-sidebar">
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>İletişime Geç</h3>
                            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>Mesaj Gönder</button>
                            <button className="btn btn-outline" style={{ width: '100%' }}>Telefon Numarası</button>

                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />


                            <h4 style={{ fontSize: '0.875rem' }}>Konum</h4>
                            <div className="map" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB3t8xzyyOJ5cwSIJTSkWtFdJTGG9zCjTDZcNLJpSMl7TFCQZugghnkhFTItJsNAb4qT-_y-LQ5JNLwaRcGJlyC_pONeAm8ClZLHw0fNX_ej4kqITm5P_0BEZwJA9rlSy-CVRtLQwBZ_8X-Uc52hyFn9vVOfd-6DhDtiHNYco2T_v04U1lQO1UwVLEOGplGUw60oVCBU0hjh_OfBR0TnBLIsCrbdMW61pUbbUcB920-XWkAWA5n2MUskI64i5rXc362iHIgcfsdQWMY)' }}>
                                <div className="map-label">{firma.il_ilce}</div>
                            </div>

                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                            <p style={{ lineHeight: '1.7', color: '#475569', }}>
                                •  {firma.web_sitesi}
                            </p>
                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                            <p style={{ lineHeight: '1.7', color: '#475569', }}>
                                •  {firma.eposta}
                            </p>
                            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default SupplierProfile;