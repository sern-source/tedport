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

import React, { useEffect, useState } from 'react';
import './FirmaDetay.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';
import { useNavigate, Link, useParams } from 'react-router-dom';

// ===== FİRMA DETAY SAYFASI =====
// Güncelleme: Enes Doğanay | Tarih: 5 Nisan 2026
// - Search bar eklendi (SharedHeader üzerinden firmalar sayfasına yönlendirme)
// - Responsive layout güncellemesi (mobilde tek sütun)
// - Düz ürün listesini hiyerarşik yapıya dönüştürme fonksiyonu

const SupplierProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [firma, setFirma] = useState(null);
    const [loading, setLoading] = useState(true);

    // Enes Doğanay | 5 Nisan 2026: Autocomplete öneri sistemi
    // Search bar'a yazıldıkça Supabase'den firma önerileri çeker ve dropdown liste olarak gösterir.
    // Tıklayınca ilgili firmanın detay sayfasına yönlendirir.
    const [detaySearch, setDetaySearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    // Enes Doğanay | 5 Nisan 2026: Arama sonucu boş geldiğinde "Sonuç bulunamadı" mesajı göstermek için
    const [noResults, setNoResults] = useState(false);

    useEffect(() => {
        if (detaySearch.trim().length < 2) {
            setSuggestions([]);
            setNoResults(false);
            return;
        }
        const timeout = setTimeout(async () => {
            // Enes Doğanay | 5 Nisan 2026: Boşluk korunmalı, sadece tehlikeli karakterler temizlenir
            const safeSearch = detaySearch.replace(/[\\"%#_]/g, '').trim();
            if (safeSearch.length < 2) { setSuggestions([]); setNoResults(false); return; }

            // Enes Doğanay | 6 Nisan 2026: best alanı eklendi, best=true firmalar önce sıralanır
            const { data } = await supabase
                .from('firmalar')
                .select('firmaID, firma_adi, il_ilce, best')
                .or(`firma_adi.ilike."%${safeSearch}%",description.ilike."%${safeSearch}%",ana_sektor.ilike."%${safeSearch}%",urun_kategorileri.ilike."%${safeSearch}%"`)
                .limit(6);

            if (data) {
                // Enes Doğanay | 6 Nisan 2026: best=true önce, sonra relevance sıralaması
                const lowerSearch = safeSearch.toLowerCase();
                const sorted = data.sort((a, b) => {
                    const bestDiff = (b.best ? 1 : 0) - (a.best ? 1 : 0);
                    if (bestDiff !== 0) return bestDiff;
                    const aName = (a.firma_adi || '').toLowerCase();
                    const bName = (b.firma_adi || '').toLowerCase();
                    const scoreA = aName === lowerSearch ? 3 : aName.startsWith(lowerSearch) ? 2 : aName.includes(lowerSearch) ? 1 : 0;
                    const scoreB = bName === lowerSearch ? 3 : bName.startsWith(lowerSearch) ? 2 : bName.includes(lowerSearch) ? 1 : 0;
                    return scoreB - scoreA;
                });
                setSuggestions(sorted.map(f => ({ id: f.firmaID, name: f.firma_adi, location: f.il_ilce })));
                setNoResults(sorted.length === 0);
            } else {
                setSuggestions([]);
                setNoResults(true);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [detaySearch]);

    // Enes Doğanay | 5 Nisan 2026: Öneriye tıklama veya dış tıklama ile dropdown kapat
    const handleSuggestionClick = (item) => {
        if (!item) {
            // Dışına tıklandı, dropdown'u kapat
            setSuggestions([]);
            setNoResults(false);
            return;
        }
        setSuggestions([]);
        setNoResults(false);
        setDetaySearch('');
        navigate(`/firmadetay/${item.id}`);
    };

    // Enter'a basınca firmalar sayfasına yönlendir
    const handleSearchSubmit = (term) => {
        setSuggestions([]);
        setNoResults(false);
        if (term.trim().length >= 2) {
            navigate(`/firmalar?search=${encodeURIComponent(term.trim())}`);
        }
    };

    // Enes Doğanay | 6 Nisan 2026: Eski header state'leri (isDropdownOpen, isMobileMenuOpen, dropdownRef) kaldırıldı — SharedHeader kendi state'ini yönetiyor
    const [userProfile, setUserProfile] = useState(null);

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

    // Firma ve Oturum/Not/Favori verilerini çekme
    useEffect(() => {
        fetchFirma();
        checkUserSessionAndNotes();
    }, [id]);

    const fetchFirma = async () => {
        setLoading(true);
        // Enes Doğanay | 6 Nisan 2026: select('*') yerine sadece kullanılan sütunlar çekilir
        const { data, error } = await supabase
            .from('firmalar')
            .select('firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best')
            .eq('firmaID', id)
            .single();

        if (!error) {
            setFirma(data);
        }
        setLoading(false);
    };

    // Enes Doğanay | 6 Nisan 2026: 4 ardışık DB sorgusu Promise.all ile paralel yapıldı
    const checkUserSessionAndNotes = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            const [profileRes, noteRes, listsRes, favRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single(),
                supabase.from('kisisel_notlar').select('*').eq('user_id', session.user.id).eq('firma_id', id).maybeSingle(),
                supabase.from('kullanici_listeleri').select('*').eq('user_id', session.user.id),
                supabase.from('kullanici_favorileri').select('*').eq('user_id', session.user.id).eq('firma_id', id).maybeSingle()
            ]);

            setUserProfile(profileRes.data || { first_name: 'Profilime', last_name: 'Git' });
            if (noteRes.data) setSavedNote(noteRes.data);
            if (listsRes.data) setMyLists(listsRes.data);
            if (favRes.data) setIsFavorited(true);
        }
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

    // Enes Doğanay | 6 Nisan 2026: Inline style yerine CSS class kullanıldı
    if (loading) return <div className="page-status"><span className="material-symbols-outlined page-status-icon spinning">progress_activity</span>Yükleniyor...</div>;
    if (!firma) return <div className="page-status page-status-error"><span className="material-symbols-outlined page-status-icon">error</span>Firma bulunamadı</div>;

    const adresText = firma.adres || firma.il_ilce;
    const encodedAddress = encodeURIComponent(adresText);
    const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=14&size=600x300&markers=color:red|${encodedAddress}&key=YOUR_GOOGLE_MAPS_API_KEY`.replace(/\s/g, '');
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    return (
        <>
            {/* Enes Doğanay | 5 Nisan 2026: Search bar + autocomplete öneri dropdown + noResults */}
            <SharedHeader
                search={detaySearch}
                setSearch={setDetaySearch}
                showSearchBar={true}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                onSearchSubmit={handleSearchSubmit}
                noResults={noResults}
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
                            <div className="supp-avatar2">{firma.firma_adi?.charAt(0)}</div>

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
                                        <p className="hero-meta">• {firma.category_name} • 📍 {firma.il_ilce}</p>
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
                            <article id="about" className="card card-about">
                                <h2 className="section-heading">
                                    <span className="material-symbols-outlined section-heading-icon">apartment</span>
                                    Şirket Hakkında
                                </h2>
                                <p className="about-text">
                                    {firma.description}
                                </p>
                            </article>

                            <section id="products">
                                <h2 className="section-title">Ürün Kategorileri</h2>
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
                                                    <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}>
                                                        ▼
                                                    </span>
                                                    <span>{kategori.ana_kategori}</span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="accordion-content">
                                                        {kategori.alt_kategoriler && kategori.alt_kategoriler.length > 0 ? (
                                                            <div className="accordion-subcategories">
                                                                {kategori.alt_kategoriler.map((altKat, altIdx) => (
                                                                    <div key={altIdx}>
                                                                        <h4 className="subcategory-title">
                                                                            • {altKat.baslik}
                                                                        </h4>
                                                                        {altKat.urunler && altKat.urunler.length > 0 && (
                                                                            <div className="product-tags-wrap">
                                                                                {/* Enes Doğanay | 5 Nisan 2026: Ürün tag'lerine tıklanınca yeni sekmede açılır, mevcut sayfa korunur */}
                                                                                {altKat.urunler.map((urun, urunIdx) => (
                                                                                    <a key={urunIdx} href={`/firmalar?search=${encodeURIComponent(urun)}`} target="_blank" rel="noopener noreferrer" className="product-tag">
                                                                                        {urun}
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="no-subcategory-text">Alt kategori bulunmuyor</p>
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
                            <section id="tenders" className="tenders-section">
                                <h2 className="section-title">İhalerimiz</h2>
                                <div className="tenders-list">
                                    {[
                                        { id: 1, baslik: 'Hasada Terazi Alımı İhalesi', tarih: 'Sin', durum: 'Canlı', slug: 'canli', aciklama: 'Fabrika kapasitesi için hassas ölçüm cihazları alımı' },
                                        { id: 2, baslik: 'Endüstriyel Tezgah Kiralanması', tarih: '27 May 2026', durum: 'Yaklaşan', slug: 'yaklasan', aciklama: 'Üretim hattı genişletmesi için malzeme işleme tezgahı' },
                                        { id: 3, baslik: 'Forklift Hizmetleri İhalesi', tarih: '5 May 2026', durum: 'Kapalı', slug: 'kapali', aciklama: 'Depo yönetimi ve malzeme taşıyıcı hizmetleri' }
                                    ].map((tender) => (
                                        <div key={tender.id} className="tender-item">
                                            <div className="tender-header">
                                                <div className="tender-info">
                                                    <h3 className="tender-title">{tender.baslik}</h3>
                                                    <p className="tender-desc">{tender.aciklama}</p>
                                                </div>
                                                <div className={`tender-status tender-status-${tender.slug}`}>
                                                    {tender.durum}
                                                </div>
                                            </div>
                                            <div className="tender-date">
                                                <span className="material-symbols-outlined tender-date-icon">calendar_today</span>
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
                                <h3 className="sidebar-heading">İletişime Geç</h3>

                                {/* 📁 HANGİ LİSTEYE EKLENECEK SEÇİMİ */}
                                {userProfile && !isFavorited && myLists.length > 0 && (
                                    <div className="list-selector">
                                        <label className="list-label">
                                            Hangi listeye eklensin?
                                        </label>
                                        <select
                                            value={selectedListId}
                                            onChange={(e) => setSelectedListId(e.target.value)}
                                            className="list-select"
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
                                    className={`btn-favorite ${isFavorited ? 'btn-favorite--active' : ''}`}
                                >
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                    {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                </button>

                                <button className="btn btn-primary btn-full">
                                    Teklif İste
                                </button>

                                {/* TELEFON, KONUM, ADRES, WEB VB. (Öncekiyle aynı) */}
                                {firma.telefon && (
                                    <a href={`tel:${firma.telefon}`} className="contact-link-wrap">
                                        <button className="btn btn-outline btn-full btn-contact">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            {firma.telefon}
                                        </button>
                                    </a>
                                )}
                                {/* ... (Harita ve diğer iletişim bilgileri aynı şekilde devam ediyor) ... */}
                                <hr className="sidebar-divider" />
                                <h4 className="sidebar-subtitle">Konum</h4>
                                <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="map-link">
                                    <div className="map" style={{ backgroundImage: `url(${mapImageUrl})` }}>
                                        <div className="map-label">{firma.il_ilce}</div>
                                    </div>
                                </a>
                                {firma.adres && (
                                    <><hr className="sidebar-divider" /><div className="contact-info-row"><svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg><span>{firma.adres}</span></div></>
                                )}
                                {firma.web_sitesi && (
                                    <><hr className="sidebar-divider" /><a href={firma.web_sitesi.startsWith("http") ? firma.web_sitesi : `https://${firma.web_sitesi}`} target="_blank" rel="noopener noreferrer" className="contact-info-row contact-info-link"><svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" /></svg>{firma.web_sitesi}</a></>
                                )}
                                {firma.eposta && (
                                    <><hr className="sidebar-divider" /><a href={`mailto:${firma.eposta}`} className="contact-info-row contact-info-link"><svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><polyline points="22,6 12,13 2,6" /></svg>{firma.eposta}</a></>
                                )}
                            </div>

                            {/* 📝 KİŞİSEL NOTLAR BÖLÜMÜ */}
                            <div className="card notes-card">
                                <div className="notes-header">
                                    <span className="material-symbols-outlined notes-header-icon">edit_note</span>
                                    <h3 className="notes-title">Kişisel Notlarım</h3>
                                </div>

                                {userProfile ? (
                                    <>
                                        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Bu tedarikçi hakkında not al..." className="note-textarea" />
                                        <div className="note-actions">
                                            <button onClick={() => setNoteText('')} className="note-clear-btn">Temizle</button>
                                            <button onClick={handleSaveNote} disabled={isNoteSaving} className="note-save-btn">{isNoteSaving ? 'Kaydediliyor...' : 'Notu Kaydet'}</button>
                                        </div>
                                        {savedNote && savedNote.not_metni && (
                                            <div className="saved-note">
                                                <p className="saved-note-text">{savedNote.not_metni}</p>
                                                <p className="saved-note-date">Kaydedildi: {new Date(savedNote.updated_at).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="notes-login-prompt">
                                        <span className="material-symbols-outlined notes-lock-icon">lock</span>
                                        <p className="notes-login-text">Bu tedarikçi için özel notlar almak istiyorsanız lütfen giriş yapın.</p>
                                        <button onClick={() => navigate('/login')} className="notes-login-btn">Giriş Yap</button>
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