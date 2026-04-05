/**
 * FirmaDetay.jsx - Company Detail/Profile Page
 * 
 * Author: Enes Doğanay
 * Date: April 5, 2026 (Updated with SharedHeader integration)
 * 
 * Features:
 * - Unified SharedHeader integration (removed 180+ lines of old header code)
 * - Mobile responsive design with hamburger menu (< 1024px)
 * - Full navigation bar for desktop (>= 1024px)
 * - Company information display with responsive grid
 * - Product accordion categorization system
 * - Tender/İhale section
 * - Sidebar (hidden on mobile, shown on desktop)
 * - Adaptive content layout for all screen sizes
 * 
 * Updates (April 5, 2026):
 * - Integrated SharedHeader component (consistent with all pages)
 * - Removed duplicate header implementation
 * - Wrapped SharedHeader outside main container to prevent CSS conflicts
 * - Maintained all existing company detail functionality
 * 
 * Previous Updates:
 * - Accordion (açılır/kapalır) ürün kategorileri sistemi eklendi
 * - İhale/Tender bölümü eklendi
 */

import React, { useEffect, useState, useRef } from 'react';
import './FirmaDetay.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';
import { useNavigate, Link, useParams } from 'react-router-dom';

// ===== FİRMA DETAY SAYFASI =====
// Güncelleme: Enes Doğanay | Tarih: 4 Nisan 2026
// - Responsive layout güncellemesi (mobilde tek sütun)
// - Düz ürün listesini hiyerarşik yapıya dönüştürme fonksiyonu

const SupplierProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [firma, setFirma] = useState(null);
    const [loading, setLoading] = useState(true);

    // 👤 Header ve Kullanıcı Durumu State'leri
    const [userProfile, setUserProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 📝 Kişisel Not ve Favori State'leri
    const [noteText, setNoteText] = useState('');
    const [savedNote, setSavedNote] = useState(null);
    const [isNoteSaving, setIsNoteSaving] = useState(false);

    // 💖 Favori ve Liste State'leri
    const [isFavorited, setIsFavorited] = useState(false);
    const [myLists, setMyLists] = useState([]); // Kullanıcının oluşturduğu listeler
    const [selectedListId, setSelectedListId] = useState(""); // Seçilen liste

    // 📂 Accordion State'leri - Açık/Kapalı kategoriler
    // Enes Doğanay | 4 Nisan 2026: Ürün kategorilerini accordion olarak göstermek için state eklendi
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Diziye Çevirme Fonksiyonu
    function degerleriDiziyeCevir(rawData) {
        if (!rawData) return [];
        let data = rawData;
        if (typeof rawData === 'string') {
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                console.error("JSON parse hatası:", e);
                return [];
            }
        }
        if (!Array.isArray(data)) return [];

        const sonuc = [];
        data.forEach((kategori) => {
            if (kategori.ana_kategori) sonuc.push(kategori.ana_kategori);
            if (kategori.alt_kategoriler && Array.isArray(kategori.alt_kategoriler)) {
                kategori.alt_kategoriler.forEach((alt) => {
                    if (alt.baslik) sonuc.push(alt.baslik);
                    if (alt.urunler && Array.isArray(alt.urunler)) {
                        sonuc.push(...alt.urunler);
                    }
                });
            }
        });
        return sonuc;
    }

    // Düz listeyi hiyerarşik yapıya çevir (Gelecekte DB hiyerarşik olduğunda buna gerek kalmayacak)
    // Enes Doğanay | 4 Nisan 2026: DB'de üst kategori olmadığı için düz ürün listesini 
    // "Tüm Ürünler" ana kategorisinde sarmalayan fonksiyon
    function convertFlatToCategorized(rawData) {
        if (!rawData) return [];

        // Düz listeyi al
        const items = degerleriDiziyeCevir(rawData);

        if (items.length === 0) return [];

        // "Tüm Ürünler" ana kategorisinde bir yapı oluştur
        return [
            {
                ana_kategori: "Tüm Ürünler",
                alt_kategoriler: [
                    {
                        baslik: "Ürün Listesi",
                        urunler: items
                    }
                ]
            }
        ];
    }

    // Hiyerarşik Kategori Parse Fonksiyonu (Accordion için)
    // Enes Doğanay | 4 Nisan 2026: Veri yapısını kontrol ederek hiyerarşik mi düz mi olduğunu belirler
    // Hiyerarşik veri varsa direkt kullanır, yoksa convertFlatToCategorized ile dönüştürür
    function parseHiyerarsikKategoriler(rawData) {
        if (!rawData) return [];
        let data = rawData;
        if (typeof rawData === 'string') {
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                console.error("JSON parse hatası:", e);
                return [];
            }
        }
        if (!Array.isArray(data)) return [];

        // Eğer veri zaten hiyerarşik ise direkt döndür
        // Yoksa düz listeyi hiyerarşiye çevir
        if (data.length > 0 && data[0].ana_kategori) {
            return data; // Hiyerarşik yapı var
        } else {
            // Düz liste - hiyerarşiye çevir
            return convertFlatToCategorized(rawData);
        }
    }

    // Accordion Toggle Fonksiyonu
    // Enes Doğanay | 4 Nisan 2026: Kategorileri açıp kapatmak için toggle fonksiyonu
    const toggleCategory = (categoryKey) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryKey)) {
            newExpanded.delete(categoryKey);
        } else {
            newExpanded.add(categoryKey);
        }
        setExpandedCategories(newExpanded);
    };

    // Menü dışı tıklamayı algılama
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Firma ve Oturum/Not/Favori verilerini çekme
    useEffect(() => {
        fetchFirma();
        checkUserSessionAndNotes();
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

    const checkUserSessionAndNotes = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            // Kullanıcı profilini çek
            const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', session.user.id)
                .single();

            setUserProfile(profileData || { first_name: 'Profilime', last_name: 'Git' });

            // Kullanıcının notunu çek
            const { data: noteData } = await supabase
                .from('kisisel_notlar')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('firma_id', id)
                .single();

            if (noteData) setSavedNote(noteData);

            // 📁 Kullanıcının listelerini çek
            const { data: listsData } = await supabase
                .from('kullanici_listeleri')
                .select('*')
                .eq('user_id', session.user.id);

            if (listsData) setMyLists(listsData);

            // 💖 Kullanıcının bu firmayı favorileyip favorilemediğini kontrol et
            const { data: favData } = await supabase
                .from('kullanici_favorileri')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('firma_id', id)
                .single();

            if (favData) {
                setIsFavorited(true);
            }
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUserProfile(null);
        setIsDropdownOpen(false);
        setSavedNote(null);
        setIsFavorited(false);
        setMyLists([]);
        navigate('/');
    };

    // 💖 Favoriye Ekle / Çıkar Fonksiyonu
    const toggleFavorite = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            alert("Lütfen önce giriş yapın.");
            return;
        }

        try {
            if (isFavorited) {
                // Favorilerden çıkar
                const { error } = await supabase
                    .from('kullanici_favorileri')
                    .delete()
                    .eq('user_id', session.user.id)
                    .eq('firma_id', id);

                if (error) throw error;
                setIsFavorited(false);
                setSelectedListId(""); // Seçimi sıfırla
            } else {
                // Seçilen listeye göre veritabanına ekle
                const insertData = { user_id: session.user.id, firma_id: id };
                if (selectedListId) {
                    insertData.liste_id = selectedListId;
                }

                const { error } = await supabase
                    .from('kullanici_favorileri')
                    .insert([insertData]);

                if (error) throw error;
                setIsFavorited(true);
            }
        } catch (error) {
            console.error("Favori işlemi sırasında hata:", error);
            alert("İşlem gerçekleştirilemedi.");
        }
    };

    // 📌 Not Kaydetme Fonksiyonu
    const handleSaveNote = async () => {
        if (!noteText.trim()) return;
        setIsNoteSaving(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return alert("Lütfen önce giriş yapın.");

            const now = new Date().toISOString();
            let response;

            if (savedNote) {
                response = await supabase.from('kisisel_notlar').update({ not_metni: noteText, updated_at: now }).eq('id', savedNote.id).select().single();
            } else {
                response = await supabase.from('kisisel_notlar').insert([{ user_id: session.user.id, firma_id: id, not_metni: noteText, updated_at: now }]).select().single();
            }

            if (response.error) throw response.error;
            setSavedNote(response.data);
            setNoteText('');
        } catch (error) {
            console.error("Not kaydedilemedi:", error);
            alert("Not kaydedilirken bir hata oluştu.");
        } finally {
            setIsNoteSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '40px' }}>Yükleniyor...</div>;
    if (!firma) return <div style={{ padding: '40px' }}>Firma bulunamadı</div>;

    const adresText = firma.adres || firma.il_ilce;
    const encodedAddress = encodeURIComponent(adresText);
    const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=14&size=600x300&markers=color:red|${encodedAddress}&key=YOUR_GOOGLE_MAPS_API_KEY`.replace(/\s/g, '');
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    return (
        <>
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <div className="supplier-page">
                {/* HERO SECTION */}
                <section className="profile-hero">
                    <div className="container">
                        <div className="hero-flex">
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
                                    {firma.description}
                                </p>
                            </article>

                            <section id="products">
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ürün Kategorileri</h2>
                                {/* Enes Doğanay | 4 Nisan 2026: Ürün kategorilerini accordion (açılır/kapalır) şekilde göster */}
                                <div className="accordion">
                                    {parseHiyerarsikKategoriler(firma.urun_kategorileri).map((kategori, idx) => {
                                        const categoryKey = `cat-${idx}`;
                                        const isExpanded = expandedCategories.has(categoryKey);

                                        return (
                                            <div key={idx} className="accordion-item">
                                                <button
                                                    className="accordion-button"
                                                    onClick={() => toggleCategory(categoryKey)}
                                                >
                                                    <span className="accordion-icon" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                        ▼
                                                    </span>
                                                    <span style={{ fontWeight: '600' }}>{kategori.ana_kategori}</span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="accordion-content">
                                                        {kategori.alt_kategoriler && kategori.alt_kategoriler.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                {kategori.alt_kategoriler.map((altKat, altIdx) => (
                                                                    <div key={altIdx}>
                                                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#137fec', fontSize: '0.95rem', fontWeight: '600' }}>
                                                                            • {altKat.baslik}
                                                                        </h4>
                                                                        {altKat.urunler && altKat.urunler.length > 0 && (
                                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: '1rem' }}>
                                                                                {/* Enes Doğanay | 4 Nisan 2026: Ürünlere tıklanınca firmalar sayfasında arama yapmasını sağla */}
                                                                                {altKat.urunler.map((urun, urunIdx) => (
                                                                                    <Link key={urunIdx} to={`/firmalar?search=${encodeURIComponent(urun)}`} style={{ padding: '4px 10px', background: '#eef2ff', color: '#4f46e5', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '500', border: '1px solid #c7d2fe', textDecoration: 'none', display: 'inline-block', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e) => e.target.style.background = '#dbeafe'} onMouseLeave={(e) => e.target.style.background = '#eef2ff'}>
                                                                                        {urun}
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Alt kategori bulunmuyor</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* İHALE/TENDER BÖLÜMÜ */}
                            {/* Enes Doğanay | 4 Nisan 2026: Firmaya ait ihaleler/tenderler göstermek için yeni bölüm */}
                            <section id="tenders" style={{ marginTop: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>İhalerimiz</h2>
                                <div className="tenders-list">
                                    {[
                                        { id: 1, baslik: 'Hasada Terazi Alımı İhalesi', tarih: 'Sin', durum: 'Canlı', aciklama: 'Fabrika kapasitesi için hassas ölçüm cihazları alımı' },
                                        { id: 2, baslik: 'Endüstriyel Tezgah Kiralanması', tarih: '27 May 2026', durum: 'Yaklaşan', aciklama: 'Üretim hattı genişletmesi için malzeme işleme tezgahı' },
                                        { id: 3, baslik: 'Forklift Hizmetleri İhalesi', tarih: '5 May 2026', durum: 'Kapalı', aciklama: 'Depo yönetimi ve malzeme taşıyıcı hizmetleri' }
                                    ].map((tender) => (
                                        <div key={tender.id} className="tender-item">
                                            <div className="tender-header">
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>
                                                        {tender.baslik}
                                                    </h3>
                                                    <p style={{ margin: '0 0 0.75rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                                                        {tender.aciklama}
                                                    </p>
                                                </div>
                                                <div className={`tender-status tender-status-${tender.durum.toLowerCase()}`}>
                                                    {tender.durum}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                                                {tender.tarih}
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

                                {/* 📁 HANGİ LİSTEYE EKLENECEK SEÇİMİ */}
                                {userProfile && !isFavorited && myLists.length > 0 && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                                            Hangi listeye eklensin?
                                        </label>
                                        <select
                                            value={selectedListId}
                                            onChange={(e) => setSelectedListId(e.target.value)}
                                            style={{
                                                width: '100%', padding: '8px', borderRadius: '6px',
                                                border: '1px solid #cbd5e1', color: '#334155',
                                                fontSize: '13px', outline: 'none', background: '#fff'
                                            }}
                                        >
                                            <option value="">Genel Favoriler (Tümü)</option>
                                            {myLists.map(liste => (
                                                <option key={liste.id} value={liste.id}>{liste.liste_adi}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* 💖 FAVORİYE EKLE BUTONU */}
                                <button
                                    onClick={toggleFavorite}
                                    style={{
                                        width: '100%', marginBottom: '10px',
                                        background: isFavorited ? '#fee2e2' : '#f8fafc',
                                        color: isFavorited ? '#ef4444' : '#475569',
                                        border: isFavorited ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                                        borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                    {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                </button>

                                <button className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
                                    Teklif İste
                                </button>

                                {/* TELEFON, KONUM, ADRES, WEB VB. (Öncekiyle aynı) */}
                                {firma.telefon && (
                                    <a href={`tel:${firma.telefon}`} style={{ display: 'block', textDecoration: 'none', width: '100%' }}>
                                        <button className="btn btn-outline" style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            {firma.telefon}
                                        </button>
                                    </a>
                                )}
                                {/* ... (Harita ve diğer iletişim bilgileri aynı şekilde devam ediyor) ... */}
                                <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                                <h4 style={{ fontSize: '0.875rem', marginBottom: '10px' }}>Konum</h4>
                                <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <div className="map" style={{ backgroundImage: `url(${mapImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '150px', borderRadius: '8px', position: 'relative' }}>
                                        <div className="map-label" style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255, 255, 255, 0.9)', padding: '4px 8px', borderRadius: '4px', color: '#333', fontWeight: '500', fontSize: '0.8rem' }}>{firma.il_ilce}</div>
                                    </div>
                                </a>
                                {firma.adres && (
                                    <><hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} /><div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#475569", fontSize: "0.9rem", lineHeight: "1.6" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "3px", minWidth: "24px" }}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg><span>{firma.adres}</span></div></>
                                )}
                                {firma.web_sitesi && (
                                    <><hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} /><a href={firma.web_sitesi.startsWith("http") ? firma.web_sitesi : `https://${firma.web_sitesi}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#475569", lineHeight: "1.7" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "24px" }}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" /></svg>{firma.web_sitesi}</a></>
                                )}
                                {firma.eposta && (
                                    <><hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} /><a href={`mailto:${firma.eposta}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#475569", lineHeight: "1.7" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "24px" }}><path d="M4 4h16v16H4z" /><polyline points="22,6 12,13 2,6" /></svg>{firma.eposta}</a></>
                                )}
                            </div>

                            {/* 📝 KİŞİSEL NOTLAR BÖLÜMÜ */}
                            <div className="card" style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '24px' }}>edit_note</span>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Kişisel Notlarım</h3>
                                </div>

                                {userProfile ? (
                                    <>
                                        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Bu tedarikçi hakkında not al..." style={{ width: '100%', minHeight: '90px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical', fontSize: '14px', outline: 'none', color: '#334155', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginTop: '12px' }}>
                                            <button onClick={() => setNoteText('')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Temizle</button>
                                            <button onClick={handleSaveNote} disabled={isNoteSaving} style={{ background: '#137fec', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '600', cursor: isNoteSaving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: isNoteSaving ? 0.7 : 1 }}>{isNoteSaving ? 'Kaydediliyor...' : 'Notu Kaydet'}</button>
                                        </div>
                                        {savedNote && savedNote.not_metni && (
                                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginTop: '20px', border: '1px solid #f1f5f9' }}>
                                                <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{savedNote.not_metni}</p>
                                                <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>Kaydedildi: {new Date(savedNote.updated_at).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#cbd5e1', fontSize: '32px', marginBottom: '8px' }}>lock</span>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Bu tedarikçi için özel notlar almak istiyorsanız lütfen giriş yapın.</p>
                                        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '8px', border: '1px solid #137fec', background: 'transparent', color: '#137fec', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Giriş Yap</button>
                                    </div>
                                )}
                            </div>

                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
};

export default SupplierProfile;