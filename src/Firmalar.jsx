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
        <a href="/">Anasayfa</a>
        <a href="/firmalar">Firmalar</a>
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



const Sidebar = () => {
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setLoading(true);

    // Şehirleri çek
    const { data: cityData } = await supabase
      .from("sehirler")
      .select("sehir")
      .order("sehir", { ascending: true });

    // Kategorileri çek (firmalar tablosundan)
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filtreler</h3>
        <button
          className="clear-btn"
          onClick={() => {
            setSelectedCities([]);
            setSelectedCategories([]);
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
            <span className="material-symbols-outlined">
              expand_more
            </span>
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
                      toggleSelectAll(
                        cities,
                        selectedCities,
                        setSelectedCities,
                        "sehir"
                      )
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
                        toggleSelection(
                          city.sehir,
                          selectedCities,
                          setSelectedCities
                        )
                      }
                    />
                    {city.sehir}
                  </label>
                ))}
              </>
            )}
          </div>
        </details>

        <details>
          <summary>
            Sektör{" "}
            <span className="material-symbols-outlined">
              expand_more
            </span>
          </summary>
          <div className="filter-content">
            <label><input type="checkbox" /> Makine</label>
            <label><input type="checkbox" /> Metal</label>
            <label><input type="checkbox" /> Otomasyon</label>
            <label><input type="checkbox" /> Elektrik</label>
            <label><input type="checkbox" /> Elektronik</label>
            <label><input type="checkbox" /> Enerji</label>
            <label><input type="checkbox" /> Mekanik</label>
            <label><input type="checkbox" /> Hırdavat</label>
            <label><input type="checkbox" /> İnşaat</label>
            <label><input type="checkbox" /> Kimya</label>
            <label><input type="checkbox" /> Plastik</label>
            <label><input type="checkbox" /> Ambalaj</label>
            <label><input type="checkbox" /> Lojistik</label>
            <label><input type="checkbox" /> Tekstil</label>
            <label><input type="checkbox" /> Gıda</label>
            <label><input type="checkbox" /> Otomotiv</label>
            <label><input type="checkbox" /> Medikal</label>
            <label><input type="checkbox" /> Bilişim</label>
            <label><input type="checkbox" /> Güvenlik</label>
            <label><input type="checkbox" /> Hizmet</label>
          </div>
        </details>


        {/* 🟢 KATEGORİ */}
        <details>
          <summary>
            Kategori{" "}
            <span className="material-symbols-outlined">
              expand_more
            </span>
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
                      toggleSelectAll(
                        categories,
                        selectedCategories,
                        setSelectedCategories
                      )
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
                        toggleSelection(
                          category,
                          selectedCategories,
                          setSelectedCategories
                        )
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
        <button
          className="apply-btn2"
          onClick={() =>
            onApplyFilters({
              cities: selectedCities,
              categories: selectedCategories
            })
          }
        >
          Filtreleri Uygula
        </button>
      </div>

    </aside>
  );
};

/* ================= CARD ================= */

const SupplierCard = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="supplier-card">

      <div className="card-images">
        <div className="main-image">
          <div className='supp-avatar2' style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', height: '90%' }}>{data.name?.charAt(0)}</div>
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
            <span key={i} className="tag">#{tag}</span>
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

  useEffect(() => {
    fetchSuppliers();
  }, [page, search]);

  const fetchSuppliers = async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('firmalar')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(
        `firma_adi.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    query = query.order('best', { ascending: false });

    const { data, error, count } = await query.range(from, to);

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
            if (alt.baslik) //sonuc.push(alt.baslik);

            // Ürünleri diziye dağıtarak ekle (varsa ve diziyse)
            if (alt.urunler && Array.isArray(alt.urunler)) {
              //sonuc.push(...alt.urunler);
            }
          });
        }
      });

      return sonuc;
    }

    if (!error) {
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
    }

    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const smartPages = getSmartPages(page, totalPages);

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
            <a href="/">Anasayfa</a>
            <span className="material-symbols-outlined">chevron_right</span>
            <span>Firmalar</span>
          </div>
        </div>

        <div className="content-grid">
          <Sidebar />

          <div className="results-list">
            {loading && <p>Yükleniyor...</p>}

            {!loading &&
              suppliers.map(supplier => (
                <SupplierCard key={supplier.id} data={supplier} />
              ))}

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

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
