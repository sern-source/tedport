// Enes Doğanay | 6 Mayıs 2026: Sidebar favoriler paneli — liste seçim + yeni liste formu
import React from 'react';

/* Enes Doğanay | 6 Mayıs 2026: Favoriler listesi + oluşturma formu */
const SidebarFavorites = ({
  myLists,
  favorites,
  selectedListId,
  setSelectedListId,
  isCreatingList,
  setIsCreatingList,
  newListName,
  setNewListName,
  setConfirmDeleteList,
  handleCreateList,
}) => (
  <div className="sidebar-lists">
    <div className="sidebar-lists__head">
      <span className="sidebar-lists__label">Listelerim</span>
      {!isCreatingList && (
        <button className="sidebar-lists__add-btn" onClick={() => setIsCreatingList(true)} data-tooltip="Yeni liste oluştur">
          <span className="material-symbols-outlined">add</span>
        </button>
      )}
    </div>
    <div className="list-items">
      <div
        className={`list-item ${selectedListId === null ? 'active' : ''}`}
        onClick={() => setSelectedListId(null)}
      >
        <span className="list-item-label">
          <span className="material-symbols-outlined">folder_special</span> Tüm Favoriler
        </span>
        <span className="list-item-count">{favorites.length}</span>
      </div>
      {myLists.map((liste) => {
        const listCount = favorites.filter((f) => f.liste_id === liste.id).length;
        return (
          <div
            key={liste.id}
            className={`list-item ${selectedListId === liste.id ? 'active' : ''}`}
            onClick={() => setSelectedListId(liste.id)}
          >
            <span className="list-item-label">
              <span className="material-symbols-outlined">folder</span> {liste.liste_adi}
            </span>
            <span className="list-item-actions">
              <span className="list-item-count">{listCount}</span>
              <button
                type="button"
                className="list-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count: listCount });
                }}
                data-tooltip="Listeyi sil"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </span>
          </div>
        );
      })}
    </div>
    {isCreatingList && (
      <div className="cl-form">
        <input
          className="cl-form__input"
          type="text"
          autoFocus
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') { setIsCreatingList(false); setNewListName(''); } }}
          placeholder="Liste adı…"
          maxLength={60}
        />
        <div className="cl-form__actions">
          <button className="cl-form__submit" onClick={handleCreateList} data-tooltip="Oluştur">
            <span className="material-symbols-outlined">check</span>
          </button>
          <button className="cl-form__cancel" onClick={() => { setIsCreatingList(false); setNewListName(''); }} data-tooltip="İptal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    )}
  </div>
);

export default SidebarFavorites;
