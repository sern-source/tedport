// Enes Doğanay | 6 Mayıs 2026: FavoritesTab — favoriler bölümü (toolbar + grid + mobil panel)
import React from 'react';
import FavCard from './FavCard';
import './FavoritesTab.css';

const SORT_OPTS = [
  { key: 'newest', label: 'Yeni', icon: 'schedule' },
  { key: 'oldest', label: 'Eski', icon: 'history' },
  { key: 'alpha', label: 'A-Z', icon: 'sort_by_alpha' },
  { key: 'alpha-desc', label: 'Z-A', icon: 'sort_by_alpha' },
];

const FavoritesTab = ({ favorites, myLists, selectedListId, setSelectedListId, isCreatingList, setIsCreatingList, newListName, setNewListName, setConfirmDeleteList, handleCreateList, favSearch, setFavSearch, favSort, setFavSort, navigate, ...cardProps }) => {
  let displayed = selectedListId ? favorites.filter(f => f.liste_id === selectedListId) : [...favorites];
  if (favSearch.trim()) {
    const q = favSearch.toLowerCase();
    displayed = displayed.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.location.toLowerCase().includes(q));
  }
  if (favSort === 'alpha') displayed.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  else if (favSort === 'alpha-desc') displayed.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
  else if (favSort === 'oldest') displayed.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  else displayed.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  const listName = selectedListId === null ? 'Tüm Favoriler' : myLists.find(l => l.id === selectedListId)?.liste_adi;

  // Enes Doğanay | 7 Mayıs 2026: Hero için KPI hesapla
  const totalCount = favorites.length;
  const listCount = myLists.length;
  const shownCount = displayed.length;

  return (
    <div className="favorites-section">
      {/* Enes Doğanay | 7 Mayıs 2026: Hero banner — İhale Tekliflerim ile aynı sistematik */}
      <div className="fav-hero">
        <div className="fav-hero__inner">
          <div className="fav-hero__title">
            <span className="material-symbols-outlined">bookmark</span>
            <div>
              <h2>Favorilerim</h2>
              <p>Kaydettiğiniz tedarikçileri listeleyin ve yönetin.</p>
            </div>
          </div>
          <div className="fav-kpis">
            <div className="fav-kpi">
              <span className="fav-kpi__value">{totalCount}</span>
              <span className="fav-kpi__label">Firma</span>
            </div>
            <div className="fav-kpi fav-kpi--lists">
              <span className="fav-kpi__value">{listCount}</span>
              <span className="fav-kpi__label">Liste</span>
            </div>
            <div className="fav-kpi fav-kpi--shown">
              <span className="fav-kpi__value">{shownCount}</span>
              <span className="fav-kpi__label">Gösterilen</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-fav-panel">
        <div className="mobile-fav-stats">
          <span className="material-symbols-outlined">bookmark</span>
          <span className="mobile-fav-stats-value">{favorites.length}</span>
          <span className="mobile-fav-stats-label">Kayıtlı Tedarikçi</span>
        </div>
        <div className="mobile-fav-lists">
          <div className={`mobile-fav-chip ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
            Tümü <span className="chip-count">{favorites.length}</span>
          </div>
          {myLists.map(liste => {
            const count = favorites.filter(f => f.liste_id === liste.id).length;
            return (
              <div key={liste.id} className={`mobile-fav-chip ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                <span className="mobile-fav-chip-label">{liste.liste_adi}</span>
                <span className="chip-count">{count}</span>
                <button type="button" className="mobile-fav-chip-delete" onClick={e => { e.stopPropagation(); setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count }); }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            );
          })}
          <div className="mobile-fav-chip add-chip" onClick={() => setIsCreatingList(true)}>
            <span className="material-symbols-outlined">add</span> Yeni Liste
          </div>
        </div>
        {isCreatingList && (
          <div className="mobile-create-list">
            <input type="text" autoFocus value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Liste adı yazın..." />
            <button className="btn-add" onClick={handleCreateList}><span className="material-symbols-outlined">add</span><span>Ekle</span></button>
            <button className="btn-cancel" onClick={() => { setIsCreatingList(false); setNewListName(''); }}><span className="material-symbols-outlined">close</span></button>
          </div>
        )}
      </div>

      <div className="favorites-toolbar">
        <div className="fav-search-wrapper">
          <span className="material-symbols-outlined">search</span>
          <input type="text" className="fav-search-input" placeholder="Firma, kategori veya konum ara..." value={favSearch} onChange={e => setFavSearch(e.target.value)} />
          {favSearch && <button className="fav-search-clear" onClick={() => setFavSearch('')}><span className="material-symbols-outlined">close</span></button>}
        </div>
        <div className="fav-sort-group">
          {SORT_OPTS.map(s => (
            <button key={s.key} className={`fav-sort-btn${favSort === s.key ? ' active' : ''}`} onClick={() => setFavSort(s.key)}>
              <span className="material-symbols-outlined">{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="favorites-empty">
          <span className="material-symbols-outlined">{favSearch.trim() ? 'search_off' : 'bookmark_border'}</span>
          <p>{favSearch.trim() ? `"${favSearch}" için sonuç bulunamadı.` : 'Bu listede henüz favori firma bulunmuyor.'}</p>
          <button onClick={() => favSearch.trim() ? setFavSearch('') : navigate('/firmalar')}>
            {favSearch.trim() ? 'Aramayı Temizle' : 'Firmaları Keşfet'}
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {displayed.map(fav => <FavCard key={fav.id} fav={fav} myLists={myLists} navigate={navigate} {...cardProps} />)}
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;
