import React, { useState, useEffect } from 'react';
import './Firmalar.css';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

/* ================= HEADER ================= */

const Header = ({ search, setSearch }) => (
  <header className="header">
    <div className="header-left">
      <div className="logo-section">
        <div className="logo-icon">
          <span className="material-symbols-outlined">inventory_2</span>
        </div>
        <h2>Tedport</h2>
      </div>
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
        <a href="#">Firmalar</a>
        <a href="#">Ürünler</a>
        <a href="#">Favoriler</a>
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

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <h3>Filtreler</h3>
      <button className="clear-btn">Tümünü temizle</button>
    </div>

    <div className="filter-group">
      <details open>
        <summary>
          Konum <span className="material-symbols-outlined">expand_more</span>
        </summary>
        <div className="filter-content">
          <label><input type="checkbox" defaultChecked /> Tümü</label>
          <label><input type="checkbox" /> İstanbul</label>
          <label><input type="checkbox" /> Diğer</label>
        </div>
      </details>

      <details open>
        <summary>
          Sektör <span className="material-symbols-outlined">expand_more</span>
        </summary>
        <div className="filter-content">
          <label><input type="checkbox" defaultChecked /> Tümü</label>
          <label><input type="checkbox" /> Makine</label>
          <label><input type="checkbox" /> Metal</label>
          <label><input type="checkbox" /> Otomasyon</label>
        </div>
      </details>
    </div>
  </aside>
);

/* ================= CARD ================= */

const SupplierCard = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="supplier-card">
      <div className="card-images">
        <div className="main-image">
          <img
            src={data.images || 'https://via.placeholder.com/300x200'}
            alt={data.name}
          />
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
  const PAGE_SIZE = 5;

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

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

    const { data, error, count } = await query.range(from, to);

    if (!error) {
      setSuppliers(
        data.map(item => ({
          id: item.firmaID,
          name: item.firma_adi,
          isVerified: item.is_verified,
          location: item.il_ilce,
          tags: item.tags || [],
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
            <a href="#">Anasayfa</a>
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
