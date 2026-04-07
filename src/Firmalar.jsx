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
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getManagedCompanyId } from './companyManagementApi';


/* ================= SIDEBAR ================= */

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

  const SEKTORLER = [
    "Makine", "Metal", "Otomasyon", "Elektrik", "Elektronik", "Enerji",
    "Mekanik", "Hırdavat", "İnşaat", "Kimya", "Plastik", "Ambalaj",
    "Lojistik", "Tekstil", "Gıda", "Otomotiv", "Medikal", "Bilişim",
    "Güvenlik", "Hizmet"
  ];

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

  // Filter fonksiyonları - search'e göre listeler
  const getFilteredCities = (searchTerm) => {
    return cities.filter(city =>
      city.sehir.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredSectors = (searchTerm) => {
    return SEKTORLER.filter(sektor =>
      sektor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredCategories = (searchTerm) => {
    return categories.filter(cat =>
      cat.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (cityData) setCities(cityData);

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

const SupplierCard = ({ data, onSearchTag }) => {
  const navigate = useNavigate();
  // Enes Doğanay | 7 Nisan 2026: İletişime Geç popup state'i
  const [showContact, setShowContact] = useState(false);

  // Enes Doğanay | 8 Nisan 2026: Teklif iste popup state'leri (Firmalar sayfasından doğrudan)
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ konu: '', mesaj: '', miktar: '', teslim_tarihi: '' });
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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
      if (!session?.user) { alert('Lütfen önce giriş yapın.'); return; }

      let senderFirmaId = null;
      let senderFirmaAdi = '';
      const managedId = await getManagedCompanyId();
      if (managedId) {
        senderFirmaId = managedId;
        const { data: senderFirma } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', managedId).single();
        senderFirmaAdi = senderFirma?.firma_adi || '';
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
        teslim_tarihi: quoteForm.teslim_tarihi || null
      }]);
      if (error) throw error;

      setQuoteSent(true);
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteSent(false);
        setQuoteForm({ konu: '', mesaj: '', miktar: '', teslim_tarihi: '' });
      }, 2000);
    } catch (error) {
      console.error('Teklif talebi gönderilemedi:', error);
      alert('Teklif talebi gönderilemedi: ' + (error?.message || JSON.stringify(error)));
    } finally {
      setQuoteSending(false);
    }
  };

  return (
    <>
    <div className="supplier-card">
      {/* Enes Doğanay | 6 Nisan 2026: logo_url varsa gerçek logo gösterilir, yoksa baş harf avatar */}
      <div className="card-images">
        <div className="main-image">
          {data.images ? (
            <img
              src={data.images}
              alt={data.name}
              style={{ width: '100%', height: '90%', objectFit: 'contain', borderRadius: '8px', background: '#fff' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className='supp-avatar2'
            style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', height: '90%', display: data.images ? 'none' : 'flex' }}
          >
            {data.name?.charAt(0)}
          </div>
        </div>
      </div>

      <div className="card-content">
        {/* Enes Doğanay | 14 Temmuz 2025: firma adına tıklayınca profil sayfasına yönlendirir */}
        <h3 className="supplier-name" onClick={() => navigate(`/firmadetay/${data.id}`)} style={{ cursor: 'pointer' }}>
          {data.name}
          {/* Enes Doğanay | 7 Nisan 2026: Verified = kurumsal yöneticisi olan firmalar */}
          {data.isVerified && (
            <span className="material-symbols-outlined verified-icon">
              verified
            </span>
          )}
        </h3>

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
            <div className="contact-dropdown-wrap">
              <button className="btn-outline" onClick={() => setShowContact(!showContact)}>İletişime Geç</button>
              {showContact && (
                <>
                  <div className="contact-dropdown-backdrop" onClick={() => setShowContact(false)} />
                  <div className="contact-dropdown">
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
                  </div>
                </>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate(`/firmadetay/${data.id}`)}
            >
              Profili Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Enes Doğanay | 8 Nisan 2026: Teklif İste popup modal — Firmalar sayfasından doğrudan */}
      {showQuoteModal && (
        <div className="quote-modal-overlay" onClick={() => { if (!quoteSending) { setShowQuoteModal(false); setQuoteSent(false); } }}>
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
                    <h3>Teklif İste</h3>
                    <p className="quote-modal-subtitle">{data.name}</p>
                  </div>
                  <button className="quote-modal-close" onClick={() => setShowQuoteModal(false)} type="button">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="quote-modal-body">
                  <div className="quote-form-group">
                    <label>Konu *</label>
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
                      <label>Miktar / Adet</label>
                      <input
                        type="text"
                        placeholder="Ör: 500 metre, 100 adet"
                        value={quoteForm.miktar}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, miktar: e.target.value }))}
                        maxLength={100}
                      />
                    </div>
                    <div className="quote-form-group">
                      <label>Termin Tarihi</label>
                      <input
                        type="date"
                        value={quoteForm.teslim_tarihi}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, teslim_tarihi: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="quote-form-group">
                    <label>Mesajınız *</label>
                    <textarea
                      placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi, teslimat adresi vb.)"
                      value={quoteForm.mesaj}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, mesaj: e.target.value }))}
                      rows={4}
                      maxLength={2000}
                    />
                  </div>

                  <div className="quote-form-info">
                    <span className="material-symbols-outlined">info</span>
                    <span>İletişim bilgileriniz ({userProfile?.email}) taleple birlikte paylaşılacaktır.</span>
                  </div>
                </div>

                <div className="quote-modal-footer">
                  <button className="btn btn-outline quote-btn-cancel" onClick={() => setShowQuoteModal(false)} type="button">
                    İptal
                  </button>
                  <button
                    className="btn btn-primary quote-btn-send"
                    onClick={handleSendQuoteRequest}
                    disabled={quoteSending || !quoteForm.konu.trim() || !quoteForm.mesaj.trim()}
                    type="button"
                  >
                    {quoteSending ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
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

/* ================= APP ================= */

function App() {
  const PAGE_SIZE = 10;

  const [searchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /* Enes Doğanay | 5 Nisan 2026: Mobilde filtre paneli aç/kapat state */
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(urlSearchTerm);
  // Enes Doğanay | 5 Nisan 2026: Debounce için ayrı debouncedSearch state'i eklendi
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchTerm);
  const [filters, setFilters] = useState({ cities: [], categories: [], sectors: [] });

  // Enes Doğanay | 5 Nisan 2026: ilike özel karakterlerini escape eden yardımcı fonksiyon
  // _ (tek karakter wildcard) ve \\ (escape karakteri) de temizlenir
  const sanitizeSearch = (input) => {
    return input.replace(/[\\"%#_]/g, '').trim();
  };

  // Enes Doğanay | 5 Nisan 2026: URL'deki search parametresi değiştiğinde state'i senkronize et
  useEffect(() => {
    const newSearch = searchParams.get('search') || '';
    setSearch(newSearch);
    setDebouncedSearch(newSearch);
  }, [searchParams]);

  // Enes Doğanay | 5 Nisan 2026: 300ms debounce - hızlı yazımda gereksiz API çağrılarını önler
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [page, debouncedSearch, filters]);


  const fetchSuppliers = async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    /* Enes Doğanay | 6 Nisan 2026: Sadece kullanılan sütunlar çekiliyor (performans) */
    let query = supabase
      .from('firmalar')
      .select('firmaID, firma_adi, il_ilce, description, ana_sektor, urun_kategorileri, logo_url, category_name, best, telefon, eposta, web_sitesi, adres', { count: 'exact' });

    // Enes Doğanay | 5 Nisan 2026: Minimum 2 karakter kontrolü - çok geniş sorguları engeller
    const trimmedSearch = debouncedSearch?.trim() || '';
    if (trimmedSearch.length >= 2) {
      const safeSearch = sanitizeSearch(trimmedSearch);
      if (safeSearch.length >= 2) {
        query = query.or(
          `firma_adi.ilike."%${safeSearch}%",description.ilike."%${safeSearch}%",ana_sektor.ilike."%${safeSearch}%",urun_kategorileri.ilike."%${safeSearch}%"`
        );
      }
    }

    // --- FİLTRELER (LIKE KULLANILARAK) ---
    if (filters.cities && filters.cities.length > 0) {
      const cityQuery = filters.cities
        .map(city => `il_ilce.ilike."%${sanitizeSearch(city)}%"`)
        .join(',');
      query = query.or(cityQuery);
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

    query = query.order('best', { ascending: false });

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("SUPABASE SORGUSU HATASI:", error);
    }

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

    if (!error && data) {
      /* Enes Doğanay | 7 Nisan 2026: Verified = kurumsal yöneticisi olan firmalar */
      const firmaIds = data.map(item => String(item.firmaID));
      const { data: managersData } = await supabase
        .from('kurumsal_firma_yoneticileri')
        .select('firma_id')
        .in('firma_id', firmaIds);
      const verifiedSet = new Set((managersData || []).map(m => String(m.firma_id)));

      let mappedSuppliers = data.map(item => ({
        id: item.firmaID,
        name: item.firma_adi,
        /* Enes Doğanay | 7 Nisan 2026: Verified artık kurumsal yöneticiye göre belirleniyor */
        isBest: item.best,
        isVerified: verifiedSet.has(String(item.firmaID)),
        location: item.il_ilce,
        tags: (degerleriDiziyeCevir(item.urun_kategorileri) || []),
        description: item.description,
        images: item.logo_url,
        telefon: item.telefon || '',
        eposta: item.eposta || '',
        web_sitesi: item.web_sitesi || '',
        adres: item.adres || ''
      }));

      /* Enes Doğanay | 6 Nisan 2026: Sıralama önceliği: 1) best=true her zaman önce 2) Arama varsa alaka puanı
       * Aynı best değerindeki firmalar arasında relevance skoru geçerli.
       * best=true + yüksek relevance > best=true + düşük relevance > best=false + yüksek relevance */
      if (trimmedSearch.length >= 2) {
        const lowerSearch = trimmedSearch.toLowerCase();
        mappedSuppliers.sort((a, b) => {
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
    } else if (error) {
      setSuppliers([]);
      setTotalCount(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  /* Enes Doğanay | 5 Nisan 2026: Sayfa değiştiğinde scroll en üste gider */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

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
      <SharedHeader
        search={search}
        setSearch={setSearch}
        showSearchBar={true}
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'İhaleler', href: '/ihaleler' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      <main className="layout-container">
        <div className="breadcrumb-row">
          <div className="breadcrumb">
            <Link to="/">Anasayfa</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <span>Firmalar</span>
          </div>
        </div>

        {/* Enes Doğanay | 5 Nisan 2026: Mobil filtre toggle butonu */}
        <button
          className="sidebar-mobile-toggle"
          onClick={() => setFiltersOpen(prev => !prev)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{filtersOpen ? 'close' : 'tune'}</span>
          {filtersOpen ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
        </button>

        <div className="content-grid">
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

            {/* Enes Doğanay | 5 Nisan 2026:
             * Filtre veya arama aktif olduğunda listelenen firma sayısını gösterir.
             * Hiçbir filtre/arama yokken gizli kalır, sonuç varken "X firma listeleniyor" yazar.
             */}
            {!loading && (debouncedSearch?.trim().length >= 2 || activeTags.length > 0) && suppliers.length > 0 && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                <span style={{ color: '#137fec', fontWeight: '700' }}>{totalCount}</span> firma listeleniyor
              </p>
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

            {!loading &&
              suppliers.map(supplier => (
                <SupplierCard
                  key={supplier.id}
                  data={supplier}
                  onSearchTag={setSearch}
                />
              ))}

            {totalPages > 1 && (
              <div className="pagination">
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;