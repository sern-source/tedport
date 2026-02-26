import React, { useState, useEffect } from 'react';
import './Firmalar.css';
import { supabase } from './supabaseClient';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

/* ================= HEADER ================= */

const Header = ({ search, setSearch }) => (
  <header className="header">
    <div className="header-left">
      <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo-icon">
          <span className="material-symbols-outlined">inventory_2</span>
        </div>
        <h2>Tedport</h2>
      </Link>
      <div className="search-bar">
        <div className="search-icon">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          type="text"
          placeholder="Firma, ürün ya da kategori ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
    <div className="header-right">
      <nav className="nav-links">
        <Link to="/">Anasayfa</Link>
        <Link to="/firmalar">Firmalar</Link>
        <a href="#">Hakkımızda</a>
        <a href="#">İletişim</a>
      </nav>
      <div className="user-actions">
        <button>
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>
    </div>
  </header>
);

/* ================= SIDEBAR ================= */

const Sidebar = ({ activeFilters, onApplyFilters }) => {
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const [selectedSectors, setSelectedSectors] = useState([]);
  const SEKTORLER = [
    "Makine", "Metal", "Otomasyon", "Elektrik", "Elektronik", "Enerji", 
    "Mekanik", "Hırdavat", "İnşaat", "Kimya", "Plastik", "Ambalaj", 
    "Lojistik", "Tekstil", "Gıda", "Otomotiv", "Medikal", "Bilişim", 
    "Güvenlik", "Hizmet"
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCities(activeFilters.cities || []);
    setSelectedCategories(activeFilters.categories || []);
    setSelectedSectors(activeFilters.sectors || []);
  }, [activeFilters]);

  useEffect(() => {
    fetchFilters();
  }, []);

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

  const toggleSelection = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const toggleSelectAll = (list, selected, setSelected, keyName) => {
    if (selected.length === list.length) {
      setSelected([]);
    } else {
      setSelected(
        list.map(item =>
          keyName ? item[keyName] : item
        )
      );
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      cities: selectedCities.length === cities.length ? [] : selectedCities,
      categories: selectedCategories.length === categories.length ? [] : selectedCategories,
      sectors: selectedSectors.length === SEKTORLER.length ? [] : selectedSectors
    });
  };

  return (
    <aside className="sidebar">
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
        <details>
          <summary>
            Konum{" "}
            <span className="material-symbols-outlined">expand_more</span>
          </summary>

          <div className="filter-content">
            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      selectedCities.length === cities.length &&
                      cities.length > 0
                    }
                    onChange={() =>
                      toggleSelectAll(cities, selectedCities, setSelectedCities, "sehir")
                    }
                  />
                  Tümü
                </label>

                {cities.map(city => (
                  <label key={city.sehir}>
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city.sehir)}
                      onChange={() =>
                        toggleSelection(city.sehir, selectedCities, setSelectedCities)
                      }
                    />
                    {city.sehir}
                  </label>
                ))}
              </>
            )}
          </div>
        </details>

        {/* 🔵 SEKTÖR */}
        <details>
          <summary>
            Sektör{" "}
            <span className="material-symbols-outlined">expand_more</span>
          </summary>
          <div className="filter-content">
            <label>
              <input
                type="checkbox"
                checked={
                  selectedSectors.length === SEKTORLER.length &&
                  SEKTORLER.length > 0
                }
                onChange={() =>
                  toggleSelectAll(SEKTORLER, selectedSectors, setSelectedSectors)
                }
              />
              Tümü
            </label>
            {SEKTORLER.map(sektor => (
              <label key={sektor}>
                <input 
                  type="checkbox" 
                  checked={selectedSectors.includes(sektor)}
                  onChange={() => toggleSelection(sektor, selectedSectors, setSelectedSectors)}
                /> 
                {sektor}
              </label>
            ))}
          </div>
        </details>

        {/* 🟢 KATEGORİ */}
        <details>
          <summary>
            Kategori{" "}
            <span className="material-symbols-outlined">expand_more</span>
          </summary>

          <div className="filter-content">
            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      selectedCategories.length === categories.length &&
                      categories.length > 0
                    }
                    onChange={() =>
                      toggleSelectAll(categories, selectedCategories, setSelectedCategories)
                    }
                  />
                  Tümü
                </label>

                {categories.map(category => (
                  <label key={category}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() =>
                        toggleSelection(category, selectedCategories, setSelectedCategories)
                      }
                    />
                    {category}
                  </label>
                ))}
              </>
            )}
          </div>
        </details>
      </div>
      
      <div className="filter-apply">
        <button className="apply-btn2" onClick={handleApplyFilters}>
          Filtreleri Uygula
        </button>
      </div>

    </aside>
  );
};

/* ================= CARD ================= */

const SupplierCard = ({ data, onSearchTag }) => {
  const navigate = useNavigate();

  return (
    <div className="supplier-card">
      <div className="card-images">
        <div className="main-image">
          <div className='supp-avatar2' style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', height: '90%' }}>
            {data.name?.charAt(0)}
          </div>
        </div>
      </div>

      <div className="card-content">
        <h3 className="supplier-name">
          {data.name}
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
              #{tag}
            </span>
          ))}
        </div>

        <p className="description">{data.description}</p>

        <div className="card-footer">
          <div className="actions">
            <button className="btn-outline">İletişime Geç</button>
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

  const [search, setSearch] = useState(urlSearchTerm);
  const [filters, setFilters] = useState({ cities: [], categories: [], sectors: [] });

  useEffect(() => {
    fetchSuppliers();
  }, [page, search, filters]);

  const fetchSuppliers = async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('firmalar')
      .select('*', { count: 'exact' });

    // --- ARAMA ---
    if (search?.trim()) {
      const safeSearch = search.replace(/["#%]/g, '').trim();
      query = query.or(
        `firma_adi.ilike."%${safeSearch}%",description.ilike."%${safeSearch}%",ana_sektor.ilike."%${safeSearch}%",urun_kategorileri.ilike."%${safeSearch}%"`
      );
    }

    // --- FİLTRELER (LIKE KULLANILARAK) ---
    if (filters.cities && filters.cities.length > 0) {
      const cityQuery = filters.cities
        .map(city => `il_ilce.ilike."%${city.replace(/["%]/g, '')}%"`)
        .join(',');
      query = query.or(cityQuery);
    }
    
    if (filters.sectors && filters.sectors.length > 0) {
      const sectorQuery = filters.sectors
        .map(sector => `ana_sektor.ilike."%${sector.replace(/["%]/g, '')}%"`)
        .join(',');
      query = query.or(sectorQuery);
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoryQuery = filters.categories
        .map(cat => `category_name.ilike."%${cat.replace(/["%]/g, '')}%"`)
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
      setSuppliers(
        data.map(item => ({
          id: item.firmaID,
          name: item.firma_adi,
          isVerified: item.is_verified,
          location: item.il_ilce,
          tags: (degerleriDiziyeCevir(item.urun_kategorileri) || []),
          description: item.description,
          images: item.logo_url
        }))
      );
      setTotalCount(count);
    } else if (error) {
      setSuppliers([]);
      setTotalCount(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

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
    <div className="app">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <Header search={search} setSearch={setSearch} />

      <main className="layout-container">
        <div className="breadcrumb-row">
          <div className="breadcrumb">
            <Link to="/">Anasayfa</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <span>Firmalar</span>
          </div>
        </div>

        <div className="content-grid">
          <Sidebar 
            activeFilters={filters} 
            onApplyFilters={(newFilters) => setFilters(newFilters)} 
          />

          <div className="results-list">
            
            {/* ETİKETLER (TAGS) ALANI */}
            {activeTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b', marginRight: '4px' }}>Uygulanan Filtreler:</span>
                
                {activeTags.map(tag => (
                  <span
                    key={`${tag.type}-${tag.value}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#e0e7ff',
                      color: '#4f46e5',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: '1px solid #c7d2fe'
                    }}
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

            {loading && <p>Yükleniyor...</p>}

            {!loading && suppliers.length === 0 && (
              <p>Arama veya filtre kriterlerinize uygun firma bulunamadı.</p>
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

                {smartPages.map((p, i) =>
                  p === '...' ? (
                    <span key={i} className="page-btn dots">...</span>
                  ) : (
                    <button
                      key={p}
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