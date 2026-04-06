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
    const [noteTitle, setNoteTitle] = useState('');
    const [noteText, setNoteText] = useState('');
    const [savedNotes, setSavedNotes] = useState([]);
    const [isNoteSaving, setIsNoteSaving] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);

    // 💖 Favori ve Liste State'leri
    const [isFavorited, setIsFavorited] = useState(false);
    const [myLists, setMyLists] = useState([]); // Kullanıcının oluşturduğu listeler
    const [selectedListId, setSelectedListId] = useState(""); // Seçilen liste
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isListCreating, setIsListCreating] = useState(false);

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

    // Enes Doğanay | 6 Nisan 2026: Notlar baslik/etiket govdesiyle JSON veya eski duz metin olarak okunabilir
    const parseNotePayload = (rawNoteText) => {
        if (!rawNoteText) {
            return { title: '', tag: '', body: '' };
        }

        try {
            const parsed = JSON.parse(rawNoteText);
            if (parsed && typeof parsed === 'object' && 'body' in parsed) {
                return {
                    title: parsed.title || '',
                    tag: parsed.tag || '',
                    body: parsed.body || ''
                };
            }
        } catch (error) {
            // Eski düz metin notlar için sessizce fallback yapılır.
        }

        return { title: '', tag: '', body: rawNoteText };
    };

    // Enes Doğanay | 6 Nisan 2026: Not verisi tek kolon icinde geriye uyumlu sekilde saklanir
    const serializeNotePayload = (title, body) => {
        return JSON.stringify({
            title: title.trim(),
            tag: '',
            body: body.trim()
        });
    };

    // Enes Doğanay | 6 Nisan 2026: Notlar bugun/dun/daha eski olarak gruplanir
    const getNoteGroupLabel = (dateValue) => {
        const noteDate = new Date(dateValue);
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(todayStart.getDate() - 1);
        const noteStart = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());

        if (noteStart.getTime() === todayStart.getTime()) return 'Bugün';
        if (noteStart.getTime() === yesterdayStart.getTime()) return 'Dün';
        return 'Daha Eski';
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
                supabase.from('kisisel_notlar').select('*').eq('user_id', session.user.id).eq('firma_id', id).order('updated_at', { ascending: false }),
                supabase.from('kullanici_listeleri').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
                supabase.from('kullanici_favorileri').select('*').eq('user_id', session.user.id).eq('firma_id', id).maybeSingle()
            ]);

            setUserProfile(profileRes.data || { first_name: 'Profilime', last_name: 'Git' });
            if (noteRes.data) setSavedNotes(noteRes.data);
            if (listsRes.data) setMyLists(listsRes.data);
            if (favRes.data) {
                setIsFavorited(true);
                setSelectedListId(favRes.data.liste_id || '');
            }
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

    // Enes Doğanay | 6 Nisan 2026: Firma detay sayfasından yeni favori listesi oluşturma
    const handleCreateList = async () => {
        const trimmedListName = newListName.trim();
        if (!trimmedListName) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            alert('Lütfen önce giriş yapın.');
            return;
        }

        const isDuplicate = myLists.some((liste) => (liste.liste_adi || '').trim().toLocaleLowerCase('tr-TR') === trimmedListName.toLocaleLowerCase('tr-TR'));
        if (isDuplicate) {
            alert('Bu isimde bir listeniz zaten var.');
            return;
        }

        setIsListCreating(true);

        try {
            const { data, error } = await supabase
                .from('kullanici_listeleri')
                .insert([{ user_id: session.user.id, liste_adi: trimmedListName }])
                .select()
                .single();

            if (error) throw error;

            setMyLists((prev) => [...prev, data]);
            setSelectedListId(data.id);
            setNewListName('');
            setIsCreatingList(false);
        } catch (error) {
            console.error('Liste oluşturulamadı:', error);
            alert('Liste oluşturulamadı.');
        } finally {
            setIsListCreating(false);
        }
    };

    // Enes Doğanay | 6 Nisan 2026: Yeni liste alaninda Enter ile olustur, Escape ile kapat
    const handleListInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (!isListCreating && newListName.trim()) {
                handleCreateList();
            }
        }

        if (event.key === 'Escape' && !isListCreating) {
            setIsCreatingList(false);
            setNewListName('');
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
            const notePayload = serializeNotePayload(noteTitle, noteText);
            let response;

            if (editingNoteId) {
                response = await supabase
                    .from('kisisel_notlar')
                    .update({ not_metni: notePayload, updated_at: now })
                    .eq('id', editingNoteId)
                    .select()
                    .single();
            } else {
                response = await supabase
                    .from('kisisel_notlar')
                    .insert([{
                        user_id: session.user.id,
                        firma_id: id,
                        not_metni: notePayload,
                        updated_at: now
                    }])
                    .select()
                    .single();
            }

            if (response.error) throw response.error;
            if (editingNoteId) {
                setSavedNotes((prev) => prev.map((savedNote) => savedNote.id === editingNoteId ? response.data : savedNote));
            } else {
                setSavedNotes((prev) => [response.data, ...prev]);
            }
            setNoteTitle('');
            setNoteText('');
            setEditingNoteId(null);
            setPendingDeleteNoteId(null);
        } catch (error) {
            console.error("Not kaydedilemedi:", error);
            alert("Not kaydedilirken bir hata oluştu.");
        } finally {
            setIsNoteSaving(false);
        }
    };

    // Enes Doğanay | 6 Nisan 2026: Not kartindan duzenleme akisi ana form alanina tasinir
    const handleEditNote = (savedNote) => {
        const parsedNote = parseNotePayload(savedNote.not_metni);
        setEditingNoteId(savedNote.id);
        setPendingDeleteNoteId(null);
        setNoteTitle(parsedNote.title);
        setNoteText(parsedNote.body);
    };

    // Enes Doğanay | 6 Nisan 2026: Duzenleme iptal edilince form temizlenir
    const handleCancelNoteEditing = () => {
        setEditingNoteId(null);
        setNoteTitle('');
        setNoteText('');
    };

    // Enes Doğanay | 6 Nisan 2026: Kullanicinin ekledigi notlari kart ici onayla silebilmesi icin aksiyon eklendi
    const handleDeleteNote = async (noteId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { error } = await supabase
            .from('kisisel_notlar')
            .delete()
            .eq('id', noteId)
            .eq('user_id', session.user.id);

        if (error) {
            alert('Not silinemedi.');
            return;
        }

        setSavedNotes((prev) => prev.filter((savedNote) => savedNote.id !== noteId));
        if (editingNoteId === noteId) {
            handleCancelNoteEditing();
        }
        setPendingDeleteNoteId(null);
    };

    // Enes Doğanay | 6 Nisan 2026: Inline style yerine CSS class kullanıldı
    if (loading) return <div className="page-status"><span className="material-symbols-outlined page-status-icon spinning">progress_activity</span>Yükleniyor...</div>;
    if (!firma) return <div className="page-status page-status-error"><span className="material-symbols-outlined page-status-icon">error</span>Firma bulunamadı</div>;

    const adresText = firma.adres || firma.il_ilce;
    const encodedAddress = encodeURIComponent(adresText);
    const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=14&size=600x300&markers=color:red|${encodedAddress}&key=YOUR_GOOGLE_MAPS_API_KEY`.replace(/\s/g, '');
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    // Enes Doğanay | 6 Nisan 2026: Favorinin kayitli oldugu liste adini aktif durumda gostermek icin hesaplanir
    const activeFavoriteListName = selectedListId
        ? myLists.find((liste) => String(liste.id) === String(selectedListId))?.liste_adi || 'Özel Liste'
        : 'Genel Favoriler';
    const groupedSavedNotes = savedNotes.reduce((groups, savedNote) => {
        const groupLabel = getNoteGroupLabel(savedNote.updated_at || savedNote.created_at);
        if (!groups[groupLabel]) {
            groups[groupLabel] = [];
        }

        groups[groupLabel].push(savedNote);
        return groups;
    }, {});
    const orderedNoteGroups = ['Bugün', 'Dün', 'Daha Eski'].filter((groupLabel) => groupedSavedNotes[groupLabel]?.length);

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
                            <div className="card sidebar-card sidebar-card-favorites">
                                {/* Enes Doğanay | 6 Nisan 2026: Favori ve liste akışı iletişim kartından ayrılarak ayrı bağlama taşındı */}
                                <h3 className="sidebar-heading">Listelere Ekle</h3>

                                {userProfile ? (
                                    <>
                                        {!isFavorited && (
                                            <div className="list-selector-card">
                                                {/* Enes Doğanay | 6 Nisan 2026: Liste secme ve yeni liste olusturma ayni blokta toplandi */}
                                                <div className="list-selector-header">
                                                    <label className="list-label">
                                                        Hangi listeye eklensin?
                                                    </label>
                                                    {!isCreatingList && (
                                                        <button
                                                            type="button"
                                                            className="create-list-inline-trigger"
                                                            onClick={() => setIsCreatingList(true)}
                                                        >
                                                            <span className="material-symbols-outlined">add</span>
                                                            Yeni Liste
                                                        </button>
                                                    )}
                                                </div>

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

                                                <p className="list-helper-text">
                                                    Yeni oluşturulan liste otomatik olarak seçilir.
                                                </p>

                                                {isCreatingList && (
                                                    <div className="create-list-inline create-list-inline-form">
                                                        <input
                                                            type="text"
                                                            value={newListName}
                                                            onChange={(e) => setNewListName(e.target.value)}
                                                            onKeyDown={handleListInputKeyDown}
                                                            placeholder="Yeni liste adı"
                                                            className="create-list-inline-input"
                                                            maxLength={60}
                                                            autoFocus
                                                        />
                                                        <div className="create-list-inline-actions">
                                                            <button
                                                                type="button"
                                                                className="create-list-inline-submit"
                                                                onClick={handleCreateList}
                                                                disabled={isListCreating || !newListName.trim()}
                                                            >
                                                                {isListCreating ? 'Oluşturuluyor...' : 'Liste Oluştur'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="create-list-inline-cancel"
                                                                onClick={() => {
                                                                    setIsCreatingList(false);
                                                                    setNewListName('');
                                                                }}
                                                                disabled={isListCreating}
                                                            >
                                                                Vazgeç
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Enes Doğanay | 6 Nisan 2026: Favori butonu sadeleştirildi, kalp kaldırıldı ve tek satırlı kurumsal CTA yapısı korundu */}
                                        <button
                                            onClick={toggleFavorite}
                                            className={`btn-favorite ${isFavorited ? 'btn-favorite--active' : ''}`}
                                        >
                                            <span className="material-symbols-outlined btn-favorite-icon">
                                                {isFavorited ? 'bookmark_remove' : 'playlist_add'}
                                            </span>
                                            <span>
                                                {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                            </span>
                                        </button>

                                        {isFavorited && (
                                            <p className="favorite-list-status">
                                                Bu firma şu anda <strong>{activeFavoriteListName}</strong> listesinde kayıtlı.
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="notes-login-prompt">
                                        {/* Enes Doğanay | 6 Nisan 2026: Giriş yapmayan kullanıcı için favori kartında da not kartıyla aynı boş durum gösterilir */}
                                        <span className="material-symbols-outlined notes-lock-icon">lock</span>
                                        <p className="notes-login-text">Bu firmayı listelerinize eklemek için lütfen giriş yapın.</p>
                                        <button onClick={() => navigate('/login')} className="notes-login-btn">Giriş Yap</button>
                                    </div>
                                )}
                            </div>

                            <div className="card sidebar-card sidebar-card-contact">
                                {/* Enes Doğanay | 6 Nisan 2026: Teklif ve firma iletişim bilgileri ayrı iletişim kartında toplandı */}
                                <h3 className="sidebar-heading">İletişime Geç</h3>

                                {/* Enes Doğanay | 6 Nisan 2026: Teklif iste ana CTA olarak güçlendirildi */}
                                <button className="btn btn-primary btn-full btn-request-quote" disabled={!userProfile}>
                                    {!userProfile && <span className="material-symbols-outlined btn-request-quote-icon">lock</span>}
                                    Teklif İste
                                </button>

                                {/* TELEFON, KONUM, ADRES, WEB VB. (Öncekiyle aynı) */}
                                {userProfile && firma.telefon && (
                                    <a href={`tel:${firma.telefon}`} className="contact-link-wrap">
                                        <button className="btn btn-outline btn-full btn-contact">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            {firma.telefon}
                                        </button>
                                    </a>
                                )}

                                {!userProfile && (
                                    <div className="contact-gated-panel">
                                        <p className="contact-gated-text">Teklif istemek ve telefon bilgisini görmek için giriş yapın.</p>
                                        <button onClick={() => navigate('/login')} className="notes-login-btn contact-login-btn">Giriş Yap</button>
                                    </div>
                                )}
                                {/* Enes Doğanay | 6 Nisan 2026: Konum ve firma bilgileri tek bir panel altında toparlandı */}
                                <div className="contact-details-panel">
                                    <div className="contact-details-header">
                                        <h4 className="sidebar-subtitle">Konum</h4>
                                        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="contact-map-action">Haritada Aç</a>
                                    </div>

                                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="map-link">
                                        <div className="map" style={{ backgroundImage: `url(${mapImageUrl})` }}>
                                            <div className="map-label">{firma.il_ilce}</div>
                                        </div>
                                    </a>

                                    {(firma.adres || firma.web_sitesi || firma.eposta) && (
                                        <div className="contact-info-stack">
                                            {firma.adres && (
                                                <div className="contact-info-row">
                                                    <svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                    <span>{firma.adres}</span>
                                                </div>
                                            )}
                                            {firma.web_sitesi && (
                                                <a href={firma.web_sitesi.startsWith("http") ? firma.web_sitesi : `https://${firma.web_sitesi}`} target="_blank" rel="noopener noreferrer" className="contact-info-row contact-info-link">
                                                    <svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" /></svg>
                                                    {firma.web_sitesi}
                                                </a>
                                            )}
                                            {firma.eposta && (
                                                <a href={`mailto:${firma.eposta}`} className="contact-info-row contact-info-link">
                                                    <svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                    {firma.eposta}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 📝 KİŞİSEL NOTLAR BÖLÜMÜ */}
                            <div className="card notes-card">
                                <div className="notes-header">
                                    <span className="material-symbols-outlined notes-header-icon">edit_note</span>
                                    <h3 className="notes-title">Kişisel Notlarım</h3>
                                    {userProfile && savedNotes.length > 0 && <span className="notes-count-badge">{savedNotes.length}</span>}
                                </div>

                                {userProfile ? (
                                    <>
                                        {/* Enes Doğanay | 6 Nisan 2026: Coklu not deneyimi icin baslik ve etiket alanlari eklendi */}
                                        <div className="note-meta-row">
                                            <input
                                                type="text"
                                                value={noteTitle}
                                                onChange={(event) => setNoteTitle(event.target.value)}
                                                placeholder="Kısa başlık"
                                                className="note-meta-input"
                                                maxLength={50}
                                            />
                                        </div>
                                        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Bu tedarikçi hakkında not al..." className="note-textarea" />
                                        <div className="note-actions">
                                            {editingNoteId ? (
                                                <button onClick={handleCancelNoteEditing} className="note-clear-btn">Vazgeç</button>
                                            ) : (
                                                <button onClick={() => { setNoteTitle(''); setNoteText(''); }} className="note-clear-btn">Temizle</button>
                                            )}
                                            <button onClick={handleSaveNote} disabled={isNoteSaving} className="note-save-btn">{isNoteSaving ? 'Kaydediliyor...' : editingNoteId ? 'Notu Güncelle' : 'Notu Kaydet'}</button>
                                        </div>
                                        {savedNotes.length > 0 ? (
                                            <div className="notes-feed">
                                                {orderedNoteGroups.map((groupLabel) => (
                                                    <section key={groupLabel} className="notes-group">
                                                        <div className="notes-group-header">
                                                            <h4 className="notes-group-title">{groupLabel}</h4>
                                                            <span className="notes-group-line" />
                                                        </div>

                                                        <div className="notes-group-list">
                                                            {groupedSavedNotes[groupLabel].map((savedNote) => {
                                                                const parsedNote = parseNotePayload(savedNote.not_metni);
                                                                const isPendingDelete = pendingDeleteNoteId === savedNote.id;
                                                                return (
                                                                    <article key={savedNote.id} className="saved-note">
                                                                        <div className="saved-note-top">
                                                                            <div className="saved-note-meta">
                                                                                <p className="saved-note-date">
                                                                                    {new Date(savedNote.updated_at || savedNote.created_at).toLocaleDateString('tr-TR')} • {new Date(savedNote.updated_at || savedNote.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                                                </p>
                                                                            </div>
                                                                            {isPendingDelete ? (
                                                                                <div className="saved-note-delete-confirm">
                                                                                    <span className="saved-note-delete-text">Silinsin mi?</span>
                                                                                    <button type="button" className="saved-note-delete-cancel" onClick={() => setPendingDeleteNoteId(null)} aria-label="Silmeyi iptal et" title="Vazgeç">
                                                                                        <span className="material-symbols-outlined saved-note-action-icon">close</span>
                                                                                    </button>
                                                                                    <button type="button" className="saved-note-delete-approve" onClick={() => handleDeleteNote(savedNote.id)} aria-label="Notu sil" title="Sil">
                                                                                        <span className="material-symbols-outlined saved-note-action-icon">delete</span>
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="saved-note-actions">
                                                                                    {/* Enes Doğanay | 6 Nisan 2026: Not karti aksiyonlari ikonlu ve daha minimal hale getirildi */}
                                                                                    <button type="button" className="saved-note-edit" onClick={() => handleEditNote(savedNote)} aria-label="Notu düzenle" title="Düzenle">
                                                                                        <span className="material-symbols-outlined saved-note-action-icon">edit</span>
                                                                                    </button>
                                                                                    <button type="button" className="saved-note-delete" onClick={() => setPendingDeleteNoteId(savedNote.id)} aria-label="Notu sil" title="Sil">
                                                                                        <span className="material-symbols-outlined saved-note-action-icon">delete</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {parsedNote.title && <h5 className="saved-note-title">{parsedNote.title}</h5>}
                                                                        <p className="saved-note-text">{parsedNote.body}</p>
                                                                    </article>
                                                                );
                                                            })}
                                                        </div>
                                                    </section>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="notes-empty-state">
                                                Henüz not eklenmedi. İlk notunu ekleyerek bu tedarikçiyle ilgili gözlemlerini kaydedebilirsin.
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