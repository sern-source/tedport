/**
 * Firmalar.jsx - Companies/Suppliers Listing Page
 * 
 * Mobile Responsive Design & Hamburger Menu Implementation
 * Date: April 4, 2026
 * Author: Enes Doğanay
 * 
 * Features:
 * - Responsive header with hamburger menu for mobile (< 1024px)
 * - Full navigation bar for desktop (>= 1024px)
 * - Advanced company search and filtering
 * - User authentication integration
 * - Sidebar filters (shown at 1024px+, hidden on mobile)
 * - Adaptive company cards layout
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Firmalar.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import CitySelect from './CitySelect'; // Enes Doğanay | 9 Nisan 2026: Aranabilir şehir seçici
import DatePicker from './DatePicker'; // Enes Doğanay | 2 Mayıs 2026: Özel takvim
import { TURKEY_DISTRICTS } from './turkeyDistricts'; // Enes Doğanay | 14 Nisan 2026: İl/ilçe ayrımı için
import { getManagedCompanyId } from './companyManagementApi';
import { useSearchHistory } from './useSearchHistory';
import { expandSearchTerms, suggestCorrection } from './synonyms';


/* ================= SIDEBAR ================= */

/* Enes Doğanay | 13 Nisan 2026: Sabit dizi modül seviyesine taşındı — her render'da yeniden oluşturulması önlendi */
const SEKTORLER = [
  "Makine", "Metal", "Otomasyon", "Elektrik", "Elektronik", "Enerji",
  "Mekanik", "Hırdavat", "İnşaat", "Kimya", "Plastik", "Ambalaj",
  "Lojistik", "Tekstil", "Gıda", "Otomotiv", "Medikal", "Bilişim",
  "Güvenlik", "Hizmet"
];

/* Enes Doğanay | 14 Nisan 2026: İstanbul Avrupa/Anadolu yakası ilçe ayrımı */
const ISTANBUL_AVRUPA = ['Arnavutköy','Avcılar','Bağcılar','Bahçelievler','Bakırköy','Başakşehir','Bayrampaşa','Beşiktaş','Beylikdüzü','Beyoğlu','Büyükçekmece','Çatalca','Esenler','Esenyurt','Eyüpsultan','Fatih','Gaziosmanpaşa','Güngören','Kağıthane','Küçükçekmece','Sarıyer','Silivri','Sultangazi','Şişli','Zeytinburnu'];
const ISTANBUL_ANADOLU = ['Adalar','Ataşehir','Beykoz','Çekmeköy','Kadıköy','Kartal','Maltepe','Pendik','Sancaktepe','Sultanbeyli','Şile','Tuzla','Ümraniye','Üsküdar'];

/* Enes Doğanay | 14 Nisan 2026: il_ilce verisini "İlçe, İl" tutarlı formatına çevirir */
const CITY_SET = new Set(Object.keys(TURKEY_DISTRICTS));
function formatLocation(raw) {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s*[\/,\-]\s*/).filter(Boolean);
  if (parts.length === 1) return trimmed;
  let cityPart = null;
  const districtParts = [];
  for (const p of parts) {
    if (CITY_SET.has(p) && !cityPart) cityPart = p;
    else districtParts.push(p);
  }
  if (!cityPart) return parts.join(', ');
  if (districtParts.length === 0) return cityPart;
  return `${districtParts.join(', ')}, ${cityPart}`;
}

/**
 * Sidebar Component - Advanced Filter System
 * 
 * Author: Enes Doğanay
 * Date: April 5, 2026
 * 
 * Updates:
 * - Filter optimization with limited initial display (5 items per category)
 * - Search functionality for each filter type (Konum, Sektör, Kategori)
 * - "Daha Fazla Göster" (Show More) button opens the full remaining list in one click
 * - Auto-reset filter state when details panel is closed (onToggle handler)
 * - Dynamic search bar in each filter section with real-time filtering
 * 
 * Features:
 * - Initial display of 5 items per filter category
 * - One-click full expansion with "Daha Fazla Göster" button
 * - Category-specific search bars (Şehir ara, Sektör ara, Kategori ara)
 * - Smart state reset on filter collapse (expanded count, search input)
 * - Responsive filter UI with inline search functionality
 */
const Sidebar = ({ activeFilters, onApplyFilters, isOpen }) => {
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);

  // Search state'leri
  const [citiesSearch, setCitiesSearch] = useState('');
  const [sectorsSearch, setSectorsSearch] = useState('');
  const [categoriesSearch, setCategoriesSearch] = useState('');

  // Expanded count state'leri (ilk 5'i göster, sonra tek tikla tamamini ac)
  const [expandedCount, setExpandedCount] = useState({
    cities: 5,
    sectors: 5,
    categories: 5
  });

  const [loading, setLoading] = useState(true);

  // App componentinden gelen aktif filtreleri Sidebar'da göster
  useEffect(() => {
    setSelectedCities(activeFilters.cities || []);
    setSelectedCategories(activeFilters.categories || []);
    setSelectedSectors(activeFilters.sectors || []);
  }, [activeFilters]);

  useEffect(() => {
    fetchFilters();
  }, []);

  // Enes Doğanay | 7 Nisan 2026: Filtre arama fonksiyonlari toLocaleLowerCase ile Türkçe harf duyarsız hale getirildi
  const getFilteredCities = (searchTerm) => {
    return cities.filter(city =>
      city.sehir.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
    );
  };

  const getFilteredSectors = (searchTerm) => {
    return SEKTORLER.filter(sektor =>
      sektor.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
    );
  };

  const getFilteredCategories = (searchTerm) => {
    return categories.filter(cat =>
      cat.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
    );
  };

  /* Enes Doğanay | 5 Nisan 2026: Sadece category_name sütunu çekilip client-side unique yapılıyor.
   * İleride Supabase RPC veya view ile optimize edilebilir. */
  const fetchFilters = async () => {
    setLoading(true);

    const { data: cityData } = await supabase
      .from("sehirler")
      .select("sehir")
      .order("sehir", { ascending: true });

    const { data: categoryData } = await supabase
      .from("firmalar")
      .select("category_name");

    /* Enes Doğanay | 14 Nisan 2026: İstanbul'u Avrupa/Anadolu yakası olarak ikiye ayır, öncelik sırası güncellendi */
    if (cityData) {
      const priorityCities = ['İstanbul (Avrupa)', 'İstanbul (Anadolu)', 'Ankara', 'Kocaeli'];
      const expanded = [];
      cityData.forEach(c => {
        if (c.sehir === 'İstanbul') {
          expanded.push({ sehir: 'İstanbul (Avrupa)' });
          expanded.push({ sehir: 'İstanbul (Anadolu)' });
        } else {
          expanded.push(c);
        }
      });
      const sorted = expanded.sort((a, b) => {
        const ai = priorityCities.indexOf(a.sehir);
        const bi = priorityCities.indexOf(b.sehir);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.sehir.localeCompare(b.sehir, 'tr');
      });
      setCities(sorted);
    }

    if (categoryData) {
      const uniqueCategories = [
        ...new Set(categoryData.map(item => item.category_name))
      ].filter(Boolean);

      setCategories(uniqueCategories.sort());
    }

    setLoading(false);
  };

  /* Enes Doğanay | 5 Nisan 2026: Dead code (isAll) kaldırıldı, updateFilter sadeleştirildi */
  const updateFilter = (type, value) => {
    let newCities = selectedCities;
    let newCategories = selectedCategories;
    let newSectors = selectedSectors;

    if (type === 'cities') {
      newCities = selectedCities.includes(value) ? selectedCities.filter(c => c !== value) : [...selectedCities, value];
      setSelectedCities(newCities);
    }
    else if (type === 'sectors') {
      newSectors = selectedSectors.includes(value) ? selectedSectors.filter(s => s !== value) : [...selectedSectors, value];
      setSelectedSectors(newSectors);
    }
    else if (type === 'categories') {
      newCategories = selectedCategories.includes(value) ? selectedCategories.filter(c => c !== value) : [...selectedCategories, value];
      setSelectedCategories(newCategories);
    }

    // Seçim yapıldığı an üst component'e (App) filtreleri uygulat
    onApplyFilters({
      cities: newCities.length === cities.length ? [] : newCities,
      categories: newCategories.length === categories.length ? [] : newCategories,
      sectors: newSectors.length === SEKTORLER.length ? [] : newSectors
    });
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h3>Filtreler</h3>
        <button
          className="clear-btn"
          onClick={() => {
            setSelectedCities([]);
            setSelectedCategories([]);
            setSelectedSectors([]);
            onApplyFilters({ cities: [], categories: [], sectors: [] });
          }}
        >
          Tümünü temizle
        </button>
      </div>

      <div className="filter-group">
        {/* 🔵 KONUM */}
        <details
          onToggle={(e) => {
            if (!e.target.open) {
              setExpandedCount({ ...expandedCount, cities: 5 });
              setCitiesSearch('');
            }
          }}
        >
          <summary>
            Konum{" "}
            <span className="material-symbols-outlined">expand_more</span>
          </summary>

          <div className="filter-content">
            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <>
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Şehir ara..."
                  value={citiesSearch}
                  onChange={(e) => setCitiesSearch(e.target.value)}
                  className="filter-search-input"
                />

                {/* Filtered Cities List */}
                {getFilteredCities(citiesSearch).slice(0, expandedCount.cities).map(city => (
                  <label key={city.sehir}>
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city.sehir)}
                      onChange={() => updateFilter('cities', city.sehir)}
                    />
                    {city.sehir}
                  </label>
                ))}

                {/* Daha Fazla Göster Butonu */}
                {getFilteredCities(citiesSearch).length > expandedCount.cities && (
                  <button
                    onClick={() => setExpandedCount({
                      ...expandedCount,
                      cities: getFilteredCities(citiesSearch).length
                    })}
                    className="filter-show-more-btn"
                  >
                    Daha fazla göster
                  </button>
                )}
              </>
            )}
          </div>
        </details>

        {/* 🔵 SEKTÖR */}
        <details
          onToggle={(e) => {
            if (!e.target.open) {
              setExpandedCount({ ...expandedCount, sectors: 5 });
              setSectorsSearch('');
            }
          }}
        >
          <summary>
            Sektör{" "}
            <span className="material-symbols-outlined">expand_more</span>
          </summary>
          <div className="filter-content">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Sektör ara..."
              value={sectorsSearch}
              onChange={(e) => setSectorsSearch(e.target.value)}
              className="filter-search-input"
            />

            {/* Filtered Sectors List */}
            {getFilteredSectors(sectorsSearch).slice(0, expandedCount.sectors).map(sektor => (
              <label key={sektor}>
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(sektor)}
                  onChange={() => updateFilter('sectors', sektor)}
                />
                {sektor}
              </label>
            ))}

            {/* Daha Fazla Göster Butonu */}
            {getFilteredSectors(sectorsSearch).length > expandedCount.sectors && (
              <button
                onClick={() => setExpandedCount({
                  ...expandedCount,
                  sectors: getFilteredSectors(sectorsSearch).length
                })}
                className="filter-show-more-btn"
              >
                Daha fazla göster
              </button>
            )}
          </div>
        </details>

        {/* 🟢 KATEGORİ */}
        <details
          onToggle={(e) => {
            if (!e.target.open) {
              setExpandedCount({ ...expandedCount, categories: 5 });
              setCategoriesSearch('');
            }
          }}
        >
          <summary>
            Kategori{" "}
            <span className="material-symbols-outlined">expand_more</span>
          </summary>

          <div className="filter-content">
            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <>
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={categoriesSearch}
                  onChange={(e) => setCategoriesSearch(e.target.value)}
                  className="filter-search-input"
                />

                {/* Filtered Categories List */}
                {getFilteredCategories(categoriesSearch).slice(0, expandedCount.categories).map(category => (
                  <label key={category}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => updateFilter('categories', category)}
                    />
                    {category}
                  </label>
                ))}

                {/* Daha Fazla Göster Butonu */}
                {getFilteredCategories(categoriesSearch).length > expandedCount.categories && (
                  <button
                    onClick={() => setExpandedCount({
                      ...expandedCount,
                      categories: getFilteredCategories(categoriesSearch).length
                    })}
                    className="filter-show-more-btn"
                  >
                    Daha fazla göster
                  </button>
                )}
              </>
            )}
          </div>
        </details>
      </div>
    </aside>
  );
};

/* ================= CARD ================= */

/* Enes Doğanay | 11 Nisan 2026: isLoggedIn prop eklendi — inline auth gating için */
const SupplierCard = ({ data, onSearchTag, isFavorited, onToggleFavorite, isLoggedIn }) => {
  const navigate = useNavigate();
  // Enes Doğanay | 7 Nisan 2026: İletişime Geç popup state'i
  const [showContact, setShowContact] = useState(false);
  // Enes Doğanay | 13 Nisan 2026: Dışarı tıklayınca dropdown kapansın (transform stacking context fix)
  const contactRef = useRef(null);
  useEffect(() => {
    if (!showContact) return;
    const handler = (e) => { if (contactRef.current && !contactRef.current.contains(e.target)) setShowContact(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showContact]);

  // Enes Doğanay | 8 Nisan 2026: Teklif iste popup state'leri (Firmalar sayfasından doğrudan)
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ konu: '', mesaj: '', miktar: '', teslim_tarihi: '', teslim_yeri: '' });
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  // Enes Doğanay | 9 Nisan 2026: Ek dosya yükleme state'leri
  const [quoteFile, setQuoteFile] = useState(null);
  // Enes Doğanay | 4 Mayıs 2026: Local toast — alert() yerine
  const [flToast, setFlToast] = useState(null);
  const flToastTimerRef = useRef(null);
  const showFlToast = (type, message) => {
    if (flToastTimerRef.current) clearTimeout(flToastTimerRef.current);
    setFlToast({ type, message });
    flToastTimerRef.current = setTimeout(() => setFlToast(null), 3800);
  };

  // Enes Doğanay | 8 Nisan 2026: Modal açıldığında kullanıcı profili çek
  useEffect(() => {
    if (!showQuoteModal) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', session.user.id).single();
      setUserProfile(profile || { email: session.user.email });
    })();
  }, [showQuoteModal]);

  // Enes Doğanay | 8 Nisan 2026: Teklif talebi gönderme (bireysel + kurumsal)
  const handleSendQuoteRequest = async () => {
    if (!quoteForm.konu.trim() || !quoteForm.mesaj.trim()) return;
    setQuoteSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      let senderFirmaId = null;
      let senderFirmaAdi = '';
      const managedId = await getManagedCompanyId();
      if (managedId) {
        senderFirmaId = managedId;
        const { data: senderFirma } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', managedId).single();
        senderFirmaAdi = senderFirma?.firma_adi || '';
      }

      // Enes Doğanay | 9 Nisan 2026: Ek dosya varsa Supabase Storage'a yükle
      let ekDosyaUrl = null;
      let ekDosyaAdi = null;
      if (quoteFile) {
        const ext = quoteFile.name.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(filePath, quoteFile);
        if (!uploadErr) {
          ekDosyaUrl = filePath;
          ekDosyaAdi = quoteFile.name;
        } else {
          // Enes Doğanay | 9 Nisan 2026: Upload hatası kullanıcıya gösterilir
          console.error('Dosya yükleme hatası:', uploadErr);
          showFlToast('error', 'Dosya yüklenemedi: ' + (uploadErr.message || 'Bilinmeyen hata'));
          return;
        }
      }

      const { error } = await supabase.from('teklif_talepleri').insert([{
        firma_id: String(data.id),
        user_id: session.user.id,
        gonderen_firma_id: senderFirmaId,
        ad_soyad: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim(),
        email: userProfile?.email || session.user.email,
        telefon: '',
        firma_adi: senderFirmaAdi,
        konu: quoteForm.konu.trim(),
        mesaj: quoteForm.mesaj.trim(),
        miktar: quoteForm.miktar.trim() || null,
        teslim_tarihi: quoteForm.teslim_tarihi || null,
        teslim_yeri: quoteForm.teslim_yeri || null, // Enes Doğanay | 9 Nisan 2026: Teslim Yeri eklendi
        ek_dosya_url: ekDosyaUrl,
        ek_dosya_adi: ekDosyaAdi
      }]);
      if (error) throw error;

      setQuoteSent(true);
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteSent(false);
        setQuoteForm({ konu: '', mesaj: '', miktar: '', teslim_tarihi: '', teslim_yeri: '' });
        setQuoteFile(null);
      }, 2000);
    } catch (error) {
      console.error('Teklif talebi gönderilemedi:', error);
      showFlToast('error', 'Teklif talebi gönderilemedi.');
    } finally {
      setQuoteSending(false);
    }
  };

  return (
    <>
    {/* Enes Doğanay | 4 Mayıs 2026: SupplierCard local toast */}
    {flToast && (
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 18px', borderRadius: '12px', maxWidth: '380px', width: 'max-content',
        boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
        background: flToast.type === 'error' ? '#fef2f2' : flToast.type === 'warning' ? '#fffbeb' : '#eff6ff',
        border: `1.5px solid ${flToast.type === 'error' ? '#fca5a5' : flToast.type === 'warning' ? '#fcd34d' : '#bfdbfe'}`,
        color: flToast.type === 'error' ? '#991b1b' : flToast.type === 'warning' ? '#92400e' : '#1e40af',
        fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
        animation: 'flToastIn 0.22s ease'
      }}>
        <style>{`@keyframes flToastIn { from { opacity:0; transform:translate(-50%,10px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
        <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>
          {flToast.type === 'error' ? 'error' : flToast.type === 'warning' ? 'warning' : 'info'}
        </span>
        {flToast.message}
        <button onClick={() => setFlToast(null)} style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.55, lineHeight: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
        </button>
      </div>
    )}
    <div className="supplier-card">
      {/* Enes Doğanay | 8 Nisan 2026: Kart sağ üst köşesinde favori toggle butonu */}
      {/* Enes Doğanay | 11 Nisan 2026: Giriş yapılmamışsa buton deaktif */}
      <button
        className={`card-fav-btn ${isFavorited ? 'card-fav-btn--active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(data.id); }}
        title={!isLoggedIn ? 'Favorilere eklemek için giriş yapın' : isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        type="button"
        disabled={!isLoggedIn}
      >
        <span className="material-symbols-outlined">
          {isFavorited ? 'bookmark_added' : 'bookmark_add'}
        </span>
      </button>
      {/* Enes Doğanay | 6 Nisan 2026: logo_url varsa gerçek logo gösterilir, yoksa baş harf avatar */}
      {/* Enes Doğanay | 13 Nisan 2026: <a> ile sarmalandı — orta tuş yeni sekmede açar */}
      <a href={`/firmadetay/${data.id}`} className="card-images" onClick={(e) => { e.preventDefault(); navigate(`/firmadetay/${data.id}`); }} style={{ cursor: 'pointer' }}>
        <div className="main-image">
          {/* Enes Doğanay | 28 Nisan 2026: Logosu olmayan firmalarda baş harf yerine default logo gösteriliyor */}
          {data.images ? (
            <img
              src={data.images}
              alt={data.name}
              style={{ width: '100%', height: '90%', objectFit: 'contain', borderRadius: '8px', background: '#fff' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
          ) : (
            <img
              src="/tedport_default_company_logo.png"
              alt="Default Logo"
              style={{ width: '100%', height: '90%', objectFit: 'contain', borderRadius: '8px', background: '#fff' }}
            />
          )}
        </div>
      </a>

      <div className="card-content">
        {/* Enes Doğanay | 13 Nisan 2026: <a> ile sarmalandı — orta tuş yeni sekmede açar */}
        <h3 className="supplier-name"><a href={`/firmadetay/${data.id}`} onClick={(e) => { e.preventDefault(); navigate(`/firmadetay/${data.id}`); }} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
          {data.name}
          {/* Enes Doğanay | 11 Nisan 2026: Verified = 'Onaylı Firma' yazısı eklendi */}
          {data.isVerified && (
            <span className="verified-badge-inline">
              <span className="material-symbols-outlined verified-icon">verified</span>
              <span className="verified-text">Onaylı Firma</span>
            </span>
          )}
          {/* Enes Doğanay | 17 Nisan 2026: Onaysız firmalar için otomatik profil etiketi */}
          {!data.isVerified && (
            <span className="platform-badge-inline">
              <span className="material-symbols-outlined platform-badge-icon">public</span>
              <span className="platform-badge-text">Otomatik Profil</span>
            </span>
          )}
        </a></h3>

        <div className="meta-info">📍 {data.location}</div>

        <div className="tags">
          {(data.tags || []).map((tag, i) => (
            <span
              key={i}
              className="tag"
              style={{ cursor: 'pointer' }}
              onClick={() => onSearchTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="description">{data.description}</p>

        <div className="card-footer">
          <div className="actions">
            {/* Enes Doğanay | 7 Nisan 2026: İletişime Geç — butona yapışık minimal dropdown */}
            <div className="contact-dropdown-wrap" ref={contactRef}>
              <button className="btn-outline" onClick={() => setShowContact(!showContact)}>İletişime Geç</button>
              {showContact && (
                <div className="contact-dropdown">
                    {/* Enes Doğanay | 11 Nisan 2026: Giriş yapmayan kullanıcıya inline login prompt */}
                    {!isLoggedIn ? (
                      <div className="contact-gated-panel">
                        <span className="material-symbols-outlined contact-gated-lock">lock</span>
                        <p className="contact-gated-text">Teklif istemek ve iletişim bilgilerini görmek için giriş yapın.</p>
                        <button onClick={() => navigate('/login')} className="contact-gated-btn">Giriş Yap</button>
                      </div>
                    ) : (
                      <>
                        {data.isVerified && (
                          <button className="contact-dropdown-item contact-dropdown-teklif" onClick={() => { setShowContact(false); setShowQuoteModal(true); }}>
                            <span className="material-symbols-outlined">request_quote</span>Teklif İste
                          </button>
                        )}
                        {data.telefon && (
                          <a href={`tel:${data.telefon}`} className="contact-dropdown-item">
                            <span className="material-symbols-outlined">call</span>{data.telefon}
                          </a>
                        )}
                        {data.eposta && (
                          <a href={`mailto:${data.eposta}`} className="contact-dropdown-item">
                            <span className="material-symbols-outlined">mail</span>{data.eposta}
                          </a>
                        )}
                        {data.web_sitesi && (
                          <a href={data.web_sitesi.startsWith('http') ? data.web_sitesi : `https://${data.web_sitesi}`} target="_blank" rel="noopener noreferrer" className="contact-dropdown-item">
                            <span className="material-symbols-outlined">language</span>{data.web_sitesi.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        {(data.adres || data.location) && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.adres || data.location)}`} target="_blank" rel="noopener noreferrer" className="contact-dropdown-item">
                            <span className="material-symbols-outlined">location_on</span>{data.location || data.adres}
                          </a>
                        )}
                        {!data.telefon && !data.eposta && !data.web_sitesi && !data.adres && !data.isVerified && (
                          <span className="contact-dropdown-empty">İletişim bilgisi yok</span>
                        )}
                      </>
                    )}
                  </div>
              )}
            </div>
            {/* Enes Doğanay | 8 Nisan 2026: Profili Görüntüle butonu geçici olarak kaldırıldı */}
          </div>
        </div>
      </div>
    </div>

      {/* Enes Doğanay | 9 Nisan 2026: Teklif İste popup modal — dışarı tıklama kapatmaz, dosya eki + iyileştirilmiş etiketler */}
      {showQuoteModal && (
        <div className="quote-modal-overlay">
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            {quoteSent ? (
              <div className="quote-modal-success">
                <span className="material-symbols-outlined quote-success-icon">check_circle</span>
                <h3>Teklif Talebiniz Gönderildi!</h3>
                <p>Firma en kısa sürede talebinizi inceleyecektir.</p>
              </div>
            ) : (
              <>
                <div className="quote-modal-header">
                  <div>
                    {/* Enes Doğanay | 9 Nisan 2026: Teklif İste → Teklif Talebi */}
                    <h3>Teklif Talebi</h3>
                    <p className="quote-modal-subtitle">{data.name}</p>
                  </div>
                  <button className="quote-modal-close" onClick={() => { setShowQuoteModal(false); setQuoteFile(null); }} type="button">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="quote-modal-body">
                  {/* Enes Doğanay | 9 Nisan 2026: Label güncellemeleri + Teslim Yeri eklendi */}
                  <div className="quote-form-group">
                    <label>Talep Başlığı *</label>
                    <input
                      type="text"
                      placeholder="Ör: Paslanmaz Çelik Boru Fiyat Talebi"
                      value={quoteForm.konu}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, konu: e.target.value }))}
                      maxLength={200}
                    />
                  </div>

                  <div className="quote-form-row">
                    <div className="quote-form-group">
                      <label>Miktar</label>
                      {/* Enes Doğanay | 15 Nisan 2026: Miktar alanı sayısal, max 99999 */}
                      <input
                        type="number"
                        placeholder="Ör: 500"
                        value={quoteForm.miktar}
                        onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 99999)) setQuoteForm(prev => ({ ...prev, miktar: v })); }}
                        min={1}
                        max={99999}
                      />
                    </div>
                    <div className="quote-form-group">
                      <label>Talep Edilen Teslim Tarihi</label>
                      <DatePicker
                        value={quoteForm.teslim_tarihi}
                        onChange={(val) => setQuoteForm(prev => ({ ...prev, teslim_tarihi: val }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="quote-form-group">
                    <label>Teslim Yeri</label>
                    <CitySelect
                      value={quoteForm.teslim_yeri}
                      onChange={(city) => setQuoteForm(prev => ({ ...prev, teslim_yeri: city }))}
                    />
                  </div>

                  <div className="quote-form-group">
                    <label>Talep Detayları *</label>
                    <textarea
                      placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi vb.)"
                      value={quoteForm.mesaj}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, mesaj: e.target.value }))}
                      rows={4}
                      maxLength={2000}
                    />
                  </div>

                  {/* Enes Doğanay | 9 Nisan 2026: Opsiyonel ek dosya yükleme alanı */}
                  <div className="quote-form-group">
                    <label>Ek Dosya <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: '#9ca3af' }}>(Opsiyonel — teknik şartname, çizim vb.)</span></label>
                    <div className="quote-file-upload">
                      <label className="quote-file-btn" htmlFor={`quote-file-${data.id}`}>
                        <span className="material-symbols-outlined">attach_file</span>
                        {quoteFile ? quoteFile.name : 'Dosya Seç'}
                      </label>
                      <input
                        id={`quote-file-${data.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f && f.size <= 10 * 1024 * 1024) setQuoteFile(f);
                          else if (f) showFlToast('warning', 'Dosya boyutu en fazla 10 MB olabilir.');
                        }}
                      />
                      {quoteFile && (
                        <button type="button" className="quote-file-remove" onClick={() => setQuoteFile(null)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="quote-form-info">
                    <span className="material-symbols-outlined">info</span>
                    <span>İletişim bilgileriniz ({userProfile?.email}) taleple birlikte paylaşılacaktır.</span>
                  </div>
                </div>

                <div className="quote-modal-footer">
                  <button className="btn btn-outline quote-btn-cancel" onClick={() => { setShowQuoteModal(false); setQuoteFile(null); }} type="button">
                    İptal
                  </button>
                  <button
                    className="btn btn-primary quote-btn-send"
                    onClick={handleSendQuoteRequest}
                    disabled={quoteSending || !quoteForm.konu.trim() || !quoteForm.mesaj.trim()}
                    type="button"
                  >
                    {/* Enes Doğanay | 9 Nisan 2026: Teklif Talebi Gönder → Teklif İste */}
                    {quoteSending ? 'Gönderiliyor...' : 'Teklif İste'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ================= SMART PAGINATION ================= */

const getSmartPages = (current, total) => {
  const delta = 2;
  const pages = [];
  let last = null;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      if (last && i - last > 1) pages.push('...');
      pages.push(i);
      last = i;
    }
  }
  return pages;
};

/* ================= YARDIMCI FONKSİYONLAR ================= */

// Enes Doğanay | 13 Nisan 2026: Pure utility — modül seviyesine taşındı, her render'da yeniden oluşturulması önlendi
const sanitizeSearch = (input) => {
  return input.replace(/[\\"\%#_]/g, '').trim();
};

// Enes Doğanay | 13 Nisan 2026: Pure utility — modül seviyesine taşındı
function degerleriDiziyeCevir(rawData) {
  if (!rawData) return [];
  let data = rawData;
  if (typeof rawData === 'string') {
    try { data = JSON.parse(rawData); }
    catch (e) { return []; }
  }
  if (!Array.isArray(data)) return [];

  const sonuc = [];
  data.forEach((kategori) => {
    if (kategori.ana_kategori) sonuc.push(kategori.ana_kategori);
  });
  return sonuc;
}

/* ================= APP ================= */

function App() {
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const { history: searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const urlSearchTerm = searchParams.get('search') || '';
  const urlPage = Number(searchParams.get('page')) || null;

  // Enes Doğanay | 7 Nisan 2026: sessionStorage'dan önceki arama/filtre/sayfa durumunu oku (geri tuşunda korunsun)
  const savedState = (() => {
    try {
      const raw = sessionStorage.getItem('tedport_firmalar_state');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Enes Doğanay | 28 Nisan 2026: Sayfa numarasını sadece URL'den oku, sessionStorage'dan asla alma
  const [page, setPage] = useState(urlPage || 1);
  const [totalCount, setTotalCount] = useState(0);
  const [didYouMean, setDidYouMean] = useState(null); // Enes Doğanay | 2 Mayıs 2026: "Bunu mu demek istediniz?" önerisi — 0 sonuçta gösterilir

  /* Enes Doğanay | 5 Nisan 2026: Mobilde filtre paneli aç/kapat state */
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(urlSearchTerm || savedState?.search || '');
  // Enes Doğanay | 5 Nisan 2026: Debounce için ayrı debouncedSearch state'i eklendi
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchTerm || savedState?.search || '');
  const [filters, setFilters] = useState(savedState?.filters || { cities: [], categories: [], sectors: [] });

  // Enes Doğanay | 9 Nisan 2026: Görünüm modu kullanıcıya özel — giriş yapılmamışsa daima grid, giriş yapılmışsa user-key ile localStorage'dan okunur
  const [viewMode, setViewMode] = useState('grid');
  // Enes Doğanay | 14 Nisan 2026: Sıralama modu state'i
  const [sortMode, setSortMode] = useState(savedState?.sortMode || 'default');
  // Enes Doğanay | 1 Mayıs 2026: Sıralama dropdown — dışarı tıklayınca kapanan custom select
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handler = (e) => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortDropdownOpen]);
  const [currentUserId, setCurrentUserId] = useState(null);
  // Enes Doğanay | 8 Nisan 2026: Liste görünümü - iletişim dropdown hangi satırda açık
  const [openContactId, setOpenContactId] = useState(null);
  // Enes Doğanay | 13 Nisan 2026: Liste görünümü dışarı tıklama ile dropdown kapatma
  const listContactRef = useRef(null);
  useEffect(() => {
    if (!openContactId) return;
    const handler = (e) => { if (listContactRef.current && !listContactRef.current.contains(e.target)) setOpenContactId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openContactId]);
  // Enes Doğanay | 8 Nisan 2026: Liste görünümü - teklif iste modal state
  const [listQuoteSupplier, setListQuoteSupplier] = useState(null);
  const [listQuoteForm, setListQuoteForm] = useState({ konu: '', mesaj: '', miktar: '', teslim_tarihi: '', teslim_yeri: '' });
  const [listQuoteSending, setListQuoteSending] = useState(false);
  const [listQuoteSent, setListQuoteSent] = useState(false);
  const [listUserProfile, setListUserProfile] = useState(null);
  // Enes Doğanay | 9 Nisan 2026: Liste görünümü ek dosya state'i
  const [listQuoteFile, setListQuoteFile] = useState(null);
  // Enes Doğanay | 4 Mayıs 2026: Local toast — alert() yerine (App scope)
  const [flToast, setFlToast] = useState(null);
  const flToastTimerRef = useRef(null);
  const showFlToast = (type, message) => {
    if (flToastTimerRef.current) clearTimeout(flToastTimerRef.current);
    setFlToast({ type, message });
    flToastTimerRef.current = setTimeout(() => setFlToast(null), 3800);
  };

  // Enes Doğanay | 8 Nisan 2026: Kullanıcının favori firma ID'leri — kart üzerinde kalp toggle için
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  // Enes Doğanay | 11 Nisan 2026: Giriş durumu — alert yerine inline UX için
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Enes Doğanay | 9 Nisan 2026: Giriş yapılmamışsa daima grid görünümü
        setCurrentUserId(null);
        setViewMode('grid');
        return;
      }
      setIsLoggedIn(true);
      setCurrentUserId(session.user.id);
      // Enes Doğanay | 9 Nisan 2026: Kullanıcıya özel görünüm tercihini oku
      try {
        const userView = localStorage.getItem(`tedport_firmalar_view_${session.user.id}`);
        if (userView === 'list' || userView === 'grid') setViewMode(userView);
      } catch {}
      const { data } = await supabase.from('kullanici_favorileri').select('firma_id').eq('user_id', session.user.id);
      if (data) setFavoriteIds(new Set(data.map(f => f.firma_id)));
    })();
  }, []);

  /* Enes Doğanay | 11 Nisan 2026: Giriş yapmamış kullanıcıyı login sayfasına yönlendir, alert kaldırıldı */
  const handleCardFavoriteToggle = async (firmaId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { navigate('/login'); return; }
    const isFav = favoriteIds.has(firmaId);
    if (isFav) {
      await supabase.from('kullanici_favorileri').delete().eq('user_id', session.user.id).eq('firma_id', firmaId);
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(firmaId); return n; });
    } else {
      await supabase.from('kullanici_favorileri').insert([{ user_id: session.user.id, firma_id: firmaId }]);
      setFavoriteIds(prev => new Set(prev).add(firmaId));
    }
  };

  useEffect(() => {
    if (!listQuoteSupplier) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', session.user.id).single();
      setListUserProfile(profile || { email: session.user.email });
    })();
  }, [listQuoteSupplier]);

  const handleListQuoteRequest = async () => {
    if (!listQuoteForm.konu.trim() || !listQuoteForm.mesaj.trim() || !listQuoteSupplier) return;
    setListQuoteSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      let senderFirmaId = null;
      let senderFirmaAdi = '';
      const managedId = await getManagedCompanyId();
      if (managedId) {
        senderFirmaId = managedId;
        const { data: senderFirma } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', managedId).single();
        senderFirmaAdi = senderFirma?.firma_adi || '';
      }
      // Enes Doğanay | 9 Nisan 2026: Ek dosya varsa Supabase Storage'a yükle
      let ekDosyaUrl = null;
      let ekDosyaAdi = null;
      if (listQuoteFile) {
        const ext = listQuoteFile.name.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(filePath, listQuoteFile);
        if (!uploadErr) {
          ekDosyaUrl = filePath;
          ekDosyaAdi = listQuoteFile.name;
        } else {
          // Enes Doğanay | 9 Nisan 2026: Upload hatası kullanıcıya gösterilir
          console.error('Dosya yükleme hatası:', uploadErr);
          showFlToast('error', 'Dosya yüklenemedi: ' + (uploadErr.message || 'Bilinmeyen hata'));
          return;
        }
      }
      const { error } = await supabase.from('teklif_talepleri').insert([{
        firma_id: String(listQuoteSupplier.id),
        user_id: session.user.id,
        gonderen_firma_id: senderFirmaId,
        ad_soyad: `${listUserProfile?.first_name || ''} ${listUserProfile?.last_name || ''}`.trim(),
        email: listUserProfile?.email || session.user.email,
        telefon: '',
        firma_adi: senderFirmaAdi,
        konu: listQuoteForm.konu.trim(),
        mesaj: listQuoteForm.mesaj.trim(),
        miktar: listQuoteForm.miktar.trim() || null,
        teslim_tarihi: listQuoteForm.teslim_tarihi || null,
        teslim_yeri: listQuoteForm.teslim_yeri || null, // Enes Doğanay | 9 Nisan 2026: Teslim Yeri eklendi
        ek_dosya_url: ekDosyaUrl,
        ek_dosya_adi: ekDosyaAdi
      }]);
      if (error) throw error;
      setListQuoteSent(true);
      setTimeout(() => {
        setListQuoteSupplier(null);
        setListQuoteSent(false);
        setListQuoteForm({ konu: '', mesaj: '', miktar: '', teslim_tarihi: '', teslim_yeri: '' });
        setListQuoteFile(null);
      }, 2000);
    } catch (error) {
      console.error('Teklif talebi gönderilemedi:', error);
      showFlToast('error', 'Teklif talebi gönderilemedi.');
    } finally {
      setListQuoteSending(false);
    }
  };

  // Enes Doğanay | 9 Nisan 2026: Görünüm toggle — sadece giriş yapmış kullanıcılar için kalıcı, anonim için geçici
  const toggleViewMode = () => {
    const next = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(next);
    if (currentUserId) {
      try { localStorage.setItem(`tedport_firmalar_view_${currentUserId}`, next); } catch {}
    }
  };

  // Enes Doğanay | 7 Nisan 2026: Arama, filtre ve sayfa değiştiğinde sessionStorage'a kaydet
  useEffect(() => {
    try {
      sessionStorage.setItem('tedport_firmalar_state', JSON.stringify({
        search: search,
        filters: filters,
        viewMode: viewMode,
        sortMode: sortMode
      }));
    } catch {}
  }, [search, filters, page, viewMode, sortMode]);

  // Enes Doğanay | 5 Nisan 2026: ilike özel karakterlerini escape eden yardımcı fonksiyon
  // Enes Doğanay | 13 Nisan 2026: Modül seviyesine taşındı (yukarıda tanımlı)

  // Enes Doğanay | 5 Nisan 2026: URL'deki search parametresi değiştiğinde state'i senkronize et
  useEffect(() => {
    const newSearch = searchParams.get('search') || '';
    if (newSearch) {
      setSearch(newSearch);
      setDebouncedSearch(newSearch);
    }
  }, [searchParams]);

  // Enes Doğanay | 5 Nisan 2026: 300ms debounce - hızlı yazımda gereksiz API çağrılarını önler
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Arama geçmişine kaydet (en az 3 karakter, 1.5s yerleştikten sonra)
  useEffect(() => {
    if (debouncedSearch.trim().length < 3) return;
    const timer = setTimeout(() => { addToHistory(debouncedSearch.trim()); }, 1200);
    return () => clearTimeout(timer);
  }, [debouncedSearch, addToHistory]);

  useEffect(() => {
    fetchSuppliers();
  }, [page, debouncedSearch, filters, sortMode]);


  const fetchSuppliers = async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    /* Enes Doğanay | 6 Nisan 2026: Sadece kullanılan sütunlar çekiliyor (performans) */
    let query = supabase
      .from('firmalar')
      .select('firmaID, firma_adi, il_ilce, description, ana_sektor, urun_kategorileri, logo_url, category_name, best, telefon, eposta, web_sitesi, adres, onayli_hesap', { count: 'exact' });

    // Enes Doğanay | 5 Nisan 2026: Minimum 2 karakter kontrolü - çok geniş sorguları engeller
    const trimmedSearch = debouncedSearch?.trim() || '';
    if (trimmedSearch.length >= 2) {
      const safeSearch = sanitizeSearch(trimmedSearch);
      if (safeSearch.length >= 2) {
        const expandedTerms = expandSearchTerms(safeSearch);
        const orParts = expandedTerms.flatMap(term => [
          `firma_adi.ilike."%${term}%"`,
          `description.ilike."%${term}%"`,
          `ana_sektor.ilike."%${term}%"`,
          `urun_kategorileri.ilike."%${term}%"`,
          `arama_etiketleri.ilike."%${term}%"`,
        ]);
        query = query.or(orParts.join(','));
      }
    }

    // --- FİLTRELER (LIKE KULLANILARAK) ---
    /* Enes Doğanay | 14 Nisan 2026: İstanbul Avrupa/Anadolu filtresi — ilçe bazlı sorgu */
    if (filters.cities && filters.cities.length > 0) {
      const cityQueryParts = [];
      filters.cities.forEach(city => {
        if (city === 'İstanbul (Avrupa)') {
          ISTANBUL_AVRUPA.forEach(d => cityQueryParts.push(`il_ilce.ilike."%${sanitizeSearch(d)}%"`));
        } else if (city === 'İstanbul (Anadolu)') {
          ISTANBUL_ANADOLU.forEach(d => cityQueryParts.push(`il_ilce.ilike."%${sanitizeSearch(d)}%"`));
        } else {
          cityQueryParts.push(`il_ilce.ilike."%${sanitizeSearch(city)}%"`);
        }
      });
      query = query.or(cityQueryParts.join(','));
    }

    if (filters.sectors && filters.sectors.length > 0) {
      const sectorQuery = filters.sectors
        .map(sector => `ana_sektor.ilike."%${sanitizeSearch(sector)}%"`)
        .join(',');
      query = query.or(sectorQuery);
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoryQuery = filters.categories
        .map(cat => `category_name.ilike."%${sanitizeSearch(cat)}%"`)
        .join(',');
      query = query.or(categoryQuery);
    }

    /* Enes Doğanay | 14 Nisan 2026: Sıralama modu desteği — kullanıcı seçimine göre */
    if (sortMode === 'a-z') {
      query = query.order('firma_adi', { ascending: true });
    } else if (sortMode === 'z-a') {
      query = query.order('firma_adi', { ascending: false });
    } else {
      query = query
        .order('has_logo', { ascending: false, nullsFirst: false })
        .order('onayli_hesap', { ascending: false, nullsFirst: false })
        .order('best', { ascending: false })
        .order('firmaID', { ascending: true });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      // Enes Doğanay | 10 Nisan 2026: AbortError'da loading state'i düzgün kapat, sayfayı kilitlemesin
      if (error.message?.includes('abort')) { setLoading(false); return; }
      console.error("SUPABASE SORGUSU HATASI:", error);
    }

    if (!error && data) {
      let mappedSuppliers = data.map(item => ({
        id: item.firmaID,
        name: item.firma_adi,
        isBest: item.best,
        /* Enes Doğanay | 8 Nisan 2026: onayli_hesap doğrudan firmalar tablosundan okunuyor */
        isVerified: item.onayli_hesap === true,
        /* Enes Doğanay | 14 Nisan 2026: İlçe, İl formatı — tutarlı konum gösterimi */
        location: formatLocation(item.il_ilce),
        tags: (degerleriDiziyeCevir(item.urun_kategorileri) || []),
        description: item.description,
        /* Enes Doğanay | 8 Nisan 2026: Sadece firma-logolari bucket'ından yüklenen logoyu kabul et, eski sahte avatarları ele */
        images: item.logo_url?.includes('firma-logolari') ? item.logo_url : null,
        telefon: item.telefon || '',
        eposta: item.eposta || '',
        web_sitesi: item.web_sitesi || '',
        adres: item.adres || ''
      }));

      /* Enes Doğanay | 14 Nisan 2026: Kullanıcı sıralama seçtiyse arama relevance sıralamasını atla */
      if (trimmedSearch.length >= 2 && sortMode === 'default') {
        const lowerSearch = trimmedSearch.toLowerCase();
        mappedSuppliers.sort((a, b) => {
          const logoA = a.images ? 1 : 0;
          const logoB = b.images ? 1 : 0;
          if (logoB !== logoA) return logoB - logoA;

          const verifiedA = a.isVerified ? 1 : 0;
          const verifiedB = b.isVerified ? 1 : 0;
          if (verifiedB !== verifiedA) return verifiedB - verifiedA;

          const bestA = a.isBest ? 1 : 0;
          const bestB = b.isBest ? 1 : 0;
          if (bestB !== bestA) return bestB - bestA;

          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          const scoreA = aName === lowerSearch ? 3 : aName.startsWith(lowerSearch) ? 2 : aName.includes(lowerSearch) ? 1 : 0;
          const scoreB = bName === lowerSearch ? 3 : bName.startsWith(lowerSearch) ? 2 : bName.includes(lowerSearch) ? 1 : 0;
          return scoreB - scoreA;
        });
      }

      setSuppliers(mappedSuppliers);
      setTotalCount(count);
      // 0 sonuç + aktif arama varsa yazım önerisi hesapla
      if (mappedSuppliers.length === 0 && debouncedSearch?.trim().length >= 2) {
        setDidYouMean(suggestCorrection(debouncedSearch.trim()));
      } else {
        setDidYouMean(null);
      }
    } else if (error) {
      setSuppliers([]);
      setTotalCount(0);
      setDidYouMean(null);
    }

    setLoading(false);
  };

  // Enes Doğanay | 28 Nisan 2026: Arama/filtre/sıralama değişirse ve sayfa 1 değilse, sadece page'i 1 yap (URL güncellemesi page effect'inde)
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearch, filters, sortMode]);

  /* Enes Doğanay | 5 Nisan 2026: Sayfa değiştiğinde scroll en üste gider */
  // Enes Doğanay | 28 Nisan 2026: Sayfa değişince hem scroll, hem URL güncelle
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchParams(params => {
      const newParams = new URLSearchParams(params);
      newParams.set('page', page);
      return newParams;
    }, { replace: true });
  }, [page, setSearchParams]);
  // Enes Doğanay | 28 Nisan 2026: URL'deki page parametresi değişirse state'i güncelle (örn. geri tuşu)
  useEffect(() => {
    const urlPageNow = Number(searchParams.get('page')) || 1;
    setPage(urlPageNow);
  }, [searchParams]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const smartPages = getSmartPages(page, totalPages);

  // Aktif filtreleri tek bir dizide topluyoruz (Tag olarak göstermek için)
  const activeTags = [
    ...(filters.cities || []).map(c => ({ type: 'cities', value: c })),
    ...(filters.sectors || []).map(s => ({ type: 'sectors', value: s })),
    ...(filters.categories || []).map(c => ({ type: 'categories', value: c }))
  ];

  // Çarpıya tıklandığında ilgili filtreyi kaldırır
  const removeFilterTag = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  return (
    /* Enes Doğanay | 5 Nisan 2026: Font <link> etiketleri kaldırıldı, SharedHeader.css'de zaten yüklü */
    <div className="app">
      {/* Enes Doğanay | 4 Mayıs 2026: Local toast — alert() yerine */}
      {flToast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px', borderRadius: '12px', maxWidth: '380px', width: 'max-content',
          boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
          background: flToast.type === 'error' ? '#fef2f2' : flToast.type === 'warning' ? '#fffbeb' : '#eff6ff',
          border: `1.5px solid ${flToast.type === 'error' ? '#fca5a5' : flToast.type === 'warning' ? '#fcd34d' : '#bfdbfe'}`,
          color: flToast.type === 'error' ? '#991b1b' : flToast.type === 'warning' ? '#92400e' : '#1e40af',
          fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
          animation: 'flToastIn 0.22s ease'
        }}>
          <style>{`@keyframes flToastIn { from { opacity:0; transform:translate(-50%,10px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
          <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>
            {flToast.type === 'error' ? 'error' : flToast.type === 'warning' ? 'warning' : 'info'}
          </span>
          {flToast.message}
          <button onClick={() => setFlToast(null)} style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.55, lineHeight: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )}
      <SharedHeader
        search={search}
        setSearch={setSearch}
        showSearchBar={true}
        searchHistory={searchHistory}
        onHistorySelect={(term) => { setSearch(term); setDebouncedSearch(term); }}
        onHistoryRemove={removeFromHistory}
        onHistoryClear={clearHistory}
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'İhaleler', href: '/ihaleler' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      <main className="layout-container">

        {/* Enes Doğanay | 5 Nisan 2026: Mobil filtre toggle butonu */}
        <button
          className="sidebar-mobile-toggle"
          onClick={() => setFiltersOpen(prev => !prev)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{filtersOpen ? 'close' : 'tune'}</span>
          {filtersOpen ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
        </button>

        <div className="firmalar-grid">
          <Sidebar
            activeFilters={filters}
            onApplyFilters={(newFilters) => setFilters(newFilters)}
            isOpen={filtersOpen}
          />

          <div className="results-list">

            {/* ETİKETLER (TAGS) ALANI */}
            {activeTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b', marginRight: '4px' }}>Uygulanan Filtreler:</span>

                {/* Enes Doğanay | 14 Temmuz 2025: filtre etiketleri türe göre renklenir — konum=mavi, sektör=yeşil, kategori=turuncu */}
                {activeTags.map(tag => (
                  <span
                    key={`${tag.type}-${tag.value}`}
                    className={`filter-chip filter-chip--${tag.type}`}
                  >
                    {tag.value}
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', cursor: 'pointer', marginLeft: '2px' }}
                      onClick={() => removeFilterTag(tag.type, tag.value)}
                    >
                      close
                    </span>
                  </span>
                ))}

                <button
                  onClick={() => setFilters({ cities: [], categories: [], sectors: [] })}
                  style={{
                    background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', marginLeft: '8px', textDecoration: 'underline'
                  }}
                >
                  Tümünü Temizle
                </button>
              </div>
            )}

            {/* Enes Doğanay | 14 Nisan 2026: Sıralama seçici + Sonuç sayısı + Grid/Liste toggle */}
            {!loading && suppliers.length > 0 && (
              <div className="firmalar-toolbar-row">
                {(debouncedSearch?.trim().length >= 2 || activeTags.length > 0) && (
                  <p className="firmalar-result-count">
                    <span>{totalCount}</span> firma listeleniyor
                  </p>
                )}
                {/* Enes Doğanay | 15 Nisan 2026: Üst mini pagination — ortada, sayfa değiştirmek için alta kaydırmaya gerek kalmaz */}
                {totalPages > 1 && (
                  <div className="mini-pagination">
                    <button
                      className="mini-page-btn"
                      disabled={page === 1}
                      onClick={() => setPage(1)}
                      title="İlk sayfa"
                    >
                      <span className="material-symbols-outlined">first_page</span>
                    </button>
                    <button
                      className="mini-page-btn"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      title="Önceki sayfa"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="mini-page-info">
                      <span className="mini-page-current">{page}</span> / {totalPages}
                    </span>
                    <button
                      className="mini-page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      title="Sonraki sayfa"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <button
                      className="mini-page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage(totalPages)}
                      title="Son sayfa"
                    >
                      <span className="material-symbols-outlined">last_page</span>
                    </button>
                  </div>
                )}

                <div className="firmalar-toolbar-actions">
                  <div className="firmalar-sort-wrap" ref={sortDropdownRef}>
                    <button
                      type="button"
                      className="firmalar-sort-trigger"
                      onClick={() => setSortDropdownOpen(o => !o)}
                    >
                      <span className="material-symbols-outlined firmalar-sort-icon">sort</span>
                      <span className="firmalar-sort-label">
                        {sortMode === 'default' ? 'Akıllı Sıralama' : sortMode === 'a-z' ? "A'dan Z'ye" : "Z'den A'ya"}
                      </span>
                      <span className={`material-symbols-outlined firmalar-sort-chevron${sortDropdownOpen ? ' open' : ''}`}>expand_more</span>
                    </button>
                    {sortDropdownOpen && (
                      <div className="firmalar-sort-menu">
                        {[{ value: 'default', label: 'Akıllı Sıralama', icon: 'auto_awesome' }, { value: 'a-z', label: "A'dan Z'ye", icon: 'arrow_downward' }, { value: 'z-a', label: "Z'den A'ya", icon: 'arrow_upward' }].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`firmalar-sort-option${sortMode === opt.value ? ' active' : ''}`}
                            onClick={() => { setSortMode(opt.value); setSortDropdownOpen(false); }}
                          >
                            <span className="material-symbols-outlined">{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="firmalar-view-toggle"
                    onClick={toggleViewMode}
                    title={viewMode === 'grid' ? 'Liste görünümüne geç' : 'Kart görünümüne geç'}
                  >
                    <span className="material-symbols-outlined">{viewMode === 'grid' ? 'view_list' : 'grid_view'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Enes Doğanay | 5 Nisan 2026: Skeleton loading - yüklenirken kart iskeletleri gösterilir */}
            {loading && (
              <div className="skeleton-list">
                {[1, 2, 3].map(i => (
                  <div key={`skeleton-${i}`} className="skeleton-card">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line skeleton-line-title"></div>
                      <div className="skeleton-line skeleton-line-meta"></div>
                      <div className="skeleton-line skeleton-line-desc"></div>
                      <div className="skeleton-line skeleton-line-desc-short"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enes Doğanay | 5 Nisan 2026: Boş sonuç mesajı ikon ve temizle butonu ile iyileştirildi */}
            {!loading && suppliers.length === 0 && (
              <div className="empty-results">
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1' }}>search_off</span>
                <p>Arama veya filtre kriterlerinize uygun firma bulunamadı.</p>
                {didYouMean && (
                  <div
                    className="did-you-mean"
                    onClick={() => { setSearch(didYouMean); setDidYouMean(null); }}
                  >
                    <span className="material-symbols-outlined">spellcheck</span>
                    Bunu mu demek istediniz? <strong>{didYouMean}</strong>
                  </div>
                )}
                <button
                  className="btn-primary"
                  style={{ marginTop: '8px', padding: '8px 20px' }}
                  onClick={() => {
                    setSearch('');
                    setFilters({ cities: [], categories: [], sectors: [] });
                  }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}

            {!loading && suppliers.length > 0 && viewMode === 'list' ? (
              /* Enes Doğanay | 8 Nisan 2026: Liste görünümü */
              <section className="firmalar-list-view">
                <div className="firmalar-list-header">
                  <span className="firmalar-list-col firmalar-list-col--logo"></span>
                  <span className="firmalar-list-col firmalar-list-col--name">Firma Adı</span>
                  <span className="firmalar-list-col firmalar-list-col--sector">Sektör</span>
                  <span className="firmalar-list-col firmalar-list-col--location">Konum</span>
                  <span className="firmalar-list-col firmalar-list-col--action"></span>
                </div>
                {suppliers.map(supplier => (
                  <div key={supplier.id} className="firmalar-list-row">
                    <a href={`/firmadetay/${supplier.id}`} className="firmalar-list-col firmalar-list-col--logo" onClick={(e) => { e.preventDefault(); navigate(`/firmadetay/${supplier.id}`); }} style={{ cursor: 'pointer' }}>
                      {supplier.images ? (
                        <img src={supplier.images} alt="" className="firmalar-list-avatar-img" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                      ) : null}
                      {/* Enes Doğanay | 28 Nisan 2026: Küçük liste görünümünde logosu olmayanlarda baş harf yerine default logo */}
                      {!supplier.images && (
                        <img
                          src="/tedport_default_company_logo.png"
                          alt="Default Logo"
                          className="firmalar-list-avatar-img"
                          style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, background: '#fff', border: '1px solid #e5e7eb' }}
                        />
                      )}
                    </a>
                    <a href={`/firmadetay/${supplier.id}`} className="firmalar-list-col firmalar-list-col--name" onClick={(e) => { e.preventDefault(); navigate(`/firmadetay/${supplier.id}`); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <span className="firmalar-list-name-text">{supplier.name}</span>
                      {/* Enes Doğanay | 11 Nisan 2026: Liste görünümünde de 'Onaylı Firma' yazısı eklendi */}
                      {supplier.isVerified && <span className="verified-badge-inline"><span className="material-symbols-outlined verified-icon" style={{ fontSize: '14px' }}>verified</span> <span className="verified-text">Onaylı Firma</span></span>}
                      {/* Enes Doğanay | 17 Nisan 2026: Liste görünümünde otomatik profil etiketi */}
                      {!supplier.isVerified && <span className="platform-badge-inline"><span className="material-symbols-outlined platform-badge-icon" style={{ fontSize: '13px' }}>public</span> <span className="platform-badge-text">Otomatik Profil</span></span>}
                    </a>
                    <span className="firmalar-list-col firmalar-list-col--sector" onClick={() => navigate(`/firmadetay/${supplier.id}`)} style={{ cursor: 'pointer' }}>{(supplier.tags || []).slice(0, 2).join(', ') || '—'}</span>
                    <span className="firmalar-list-col firmalar-list-col--location" onClick={() => navigate(`/firmadetay/${supplier.id}`)} style={{ cursor: 'pointer' }}>{supplier.location || '—'}</span>
                    {/* Enes Doğanay | 8 Nisan 2026: Liste görünümü - iletişime geç (kart ile birebir aynı, küçük boyut) */}
                    <span className="firmalar-list-col firmalar-list-col--action" onClick={e => e.stopPropagation()}>
                      {/* Enes Doğanay | 11 Nisan 2026: Liste görünümüne favori butonu eklendi */}
                      {/* Enes Doğanay | 11 Nisan 2026: Giriş yapılmamışsa buton deaktif */}
                      <button
                        className={`list-fav-btn ${favoriteIds.has(supplier.id) ? 'list-fav-btn--active' : ''}`}
                        onClick={() => handleCardFavoriteToggle(supplier.id)}
                        title={!isLoggedIn ? 'Favorilere eklemek için giriş yapın' : favoriteIds.has(supplier.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        type="button"
                        disabled={!isLoggedIn}
                      >
                        <span className="material-symbols-outlined">
                          {favoriteIds.has(supplier.id) ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                      </button>
                      <div className="contact-dropdown-wrap" ref={openContactId === supplier.id ? listContactRef : undefined}>
                        <button className="btn-outline firmalar-list-contact-btn" onClick={() => setOpenContactId(openContactId === supplier.id ? null : supplier.id)}>İletişime Geç</button>
                        {openContactId === supplier.id && (
                            <div className="contact-dropdown firmalar-list-contact-dropdown">
                              {/* Enes Doğanay | 11 Nisan 2026: Liste görünümünde de inline login prompt */}
                              {!isLoggedIn ? (
                                <div className="contact-gated-panel">
                                  <span className="material-symbols-outlined contact-gated-lock">lock</span>
                                  <p className="contact-gated-text">Teklif istemek ve iletişim bilgilerini görmek için giriş yapın.</p>
                                  <button onClick={() => navigate('/login')} className="contact-gated-btn">Giriş Yap</button>
                                </div>
                              ) : (
                                <>
                                  {supplier.isVerified && (
                                    <button className="contact-dropdown-item contact-dropdown-teklif" onClick={() => { setOpenContactId(null); setListQuoteSupplier(supplier); }}>
                                      <span className="material-symbols-outlined">request_quote</span>Teklif İste
                                    </button>
                                  )}
                                  {supplier.telefon && (
                                    <a href={`tel:${supplier.telefon}`} className="contact-dropdown-item">
                                      <span className="material-symbols-outlined">call</span>{supplier.telefon}
                                    </a>
                                  )}
                                  {supplier.eposta && (
                                    <a href={`mailto:${supplier.eposta}`} className="contact-dropdown-item">
                                      <span className="material-symbols-outlined">mail</span>{supplier.eposta}
                                    </a>
                                  )}
                                  {supplier.web_sitesi && (
                                    <a href={supplier.web_sitesi.startsWith('http') ? supplier.web_sitesi : `https://${supplier.web_sitesi}`} target="_blank" rel="noopener noreferrer" className="contact-dropdown-item">
                                      <span className="material-symbols-outlined">language</span>{supplier.web_sitesi.replace(/^https?:\/\//, '')}
                                    </a>
                                  )}
                                  {(supplier.adres || supplier.location) && (
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.adres || supplier.location)}`} target="_blank" rel="noopener noreferrer" className="contact-dropdown-item">
                                      <span className="material-symbols-outlined">location_on</span>{supplier.location || supplier.adres}
                                    </a>
                                  )}
                                  {!supplier.telefon && !supplier.eposta && !supplier.web_sitesi && !supplier.adres && !supplier.isVerified && (
                                    <span className="contact-dropdown-empty">İletişim bilgisi yok</span>
                                  )}
                                </>
                              )}
                            </div>
                        )}
                      </div>
                    </span>
                  </div>
                ))}
              </section>
            ) : (
              <>
                {!loading &&
                  suppliers.map(supplier => (
                    <SupplierCard
                      key={supplier.id}
                      data={supplier}
                      onSearchTag={setSearch}
                      isFavorited={favoriteIds.has(supplier.id)}
                      onToggleFavorite={handleCardFavoriteToggle}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
              </>
            )}

            {/* Enes Doğanay | 1 Mayıs 2026: Alt pagination — İlk/Son sayfa butonları eklendi */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn nav"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  title="İlk sayfa"
                >
                  <span className="material-symbols-outlined">first_page</span>
                </button>
                <button
                  className="page-btn nav"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {/* Enes Doğanay | 5 Nisan 2026: key çakışması düzeltildi, ellipsis ve sayfa numarası ayrı prefix ile */}
                {smartPages.map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="page-btn dots">...</span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="page-btn nav"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button
                  className="page-btn nav"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  title="Son sayfa"
                >
                  <span className="material-symbols-outlined">last_page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Enes Doğanay | 9 Nisan 2026: Liste görünümü - Teklif İste modal — dışarı tıklama kapatmaz, dosya eki + iyileştirilmiş etiketler */}
      {listQuoteSupplier && (
        <div className="quote-modal-overlay">
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            {listQuoteSent ? (
              <div className="quote-modal-success">
                <span className="material-symbols-outlined quote-success-icon">check_circle</span>
                <h3>Teklif Talebiniz Gönderildi!</h3>
                <p>Firma en kısa sürede talebinizi inceleyecektir.</p>
              </div>
            ) : (
              <>
                <div className="quote-modal-header">
                  <div>
                    {/* Enes Doğanay | 9 Nisan 2026: Teklif İste → Teklif Talebi */}
                    <h3>Teklif Talebi</h3>
                    <p className="quote-modal-subtitle">{listQuoteSupplier.name}</p>
                  </div>
                  <button className="quote-modal-close" onClick={() => { setListQuoteSupplier(null); setListQuoteFile(null); }} type="button">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="quote-modal-body">
                  {/* Enes Doğanay | 9 Nisan 2026: Label güncellemeleri + Teslim Yeri eklendi */}
                  <div className="quote-form-group">
                    <label>Talep Başlığı *</label>
                    <input type="text" placeholder="Ör: Paslanmaz Çelik Boru Fiyat Talebi" value={listQuoteForm.konu} onChange={(e) => setListQuoteForm(prev => ({ ...prev, konu: e.target.value }))} maxLength={200} />
                  </div>
                  <div className="quote-form-row">
                    <div className="quote-form-group">
                      <label>Miktar</label>
                      {/* Enes Doğanay | 15 Nisan 2026: Miktar alanı sayısal, max 99999 */}
                      <input type="number" placeholder="Ör: 500" value={listQuoteForm.miktar} onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 99999)) setListQuoteForm(prev => ({ ...prev, miktar: v })); }} min={1} max={99999} />
                    </div>
                    <div className="quote-form-group">
                      <label>Talep Edilen Teslim Tarihi</label>
                      <DatePicker value={listQuoteForm.teslim_tarihi} onChange={(val) => setListQuoteForm(prev => ({ ...prev, teslim_tarihi: val }))} min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className="quote-form-group">
                    <label>Teslim Yeri</label>
                    <CitySelect
                      value={listQuoteForm.teslim_yeri}
                      onChange={(city) => setListQuoteForm(prev => ({ ...prev, teslim_yeri: city }))}
                    />
                  </div>
                  <div className="quote-form-group">
                    <label>Talep Detayları *</label>
                    <textarea placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi vb.)" value={listQuoteForm.mesaj} onChange={(e) => setListQuoteForm(prev => ({ ...prev, mesaj: e.target.value }))} rows={4} maxLength={2000} />
                  </div>
                  {/* Enes Doğanay | 9 Nisan 2026: Opsiyonel ek dosya yükleme alanı */}
                  <div className="quote-form-group">
                    <label>Ek Dosya <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: '#9ca3af' }}>(Opsiyonel — teknik şartname, çizim vb.)</span></label>
                    <div className="quote-file-upload">
                      <label className="quote-file-btn" htmlFor="list-quote-file">
                        <span className="material-symbols-outlined">attach_file</span>
                        {listQuoteFile ? listQuoteFile.name : 'Dosya Seç'}
                      </label>
                      <input id="list-quote-file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 10 * 1024 * 1024) setListQuoteFile(f); else if (f) showFlToast('warning', 'Dosya boyutu en fazla 10 MB olabilir.'); }} />
                      {listQuoteFile && (
                        <button type="button" className="quote-file-remove" onClick={() => setListQuoteFile(null)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="quote-form-info">
                    <span className="material-symbols-outlined">info</span>
                    <span>İletişim bilgileriniz ({listUserProfile?.email}) taleple birlikte paylaşılacaktır.</span>
                  </div>
                </div>
                <div className="quote-modal-footer">
                  <button className="btn btn-outline quote-btn-cancel" onClick={() => { setListQuoteSupplier(null); setListQuoteFile(null); }} type="button">İptal</button>
                  <button className="btn btn-primary quote-btn-send" onClick={handleListQuoteRequest} disabled={listQuoteSending || !listQuoteForm.konu.trim() || !listQuoteForm.mesaj.trim()} type="button">
                    {/* Enes Doğanay | 9 Nisan 2026: Teklif Talebi Gönder → Teklif İste */}
                    {listQuoteSending ? 'Gönderiliyor...' : 'Teklif İste'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;