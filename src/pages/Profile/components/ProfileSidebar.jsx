// Enes Doğanay | 6 Mayıs 2026: ProfileSidebar — sidebar nav + listeler paneli
import React from 'react';
import './ProfileSidebar.css';
import './ProfileSidebar.dark.css';

const ProfileSidebar = ({
  profile, currentTab, myLists, favorites, selectedListId, setSelectedListId,
  isCreatingList, setIsCreatingList, newListName, setNewListName,
  setConfirmDeleteList, handleCreateList, handleLogout,
  setSearchParams, pendingQuoteCount, myOffersUnreadCount, pendingInvites,
  myCompany, unreadNotificationsCount,
}) => (
  <aside className="sidebar">
    <div className="sidebar-user-card">
      {profile?.avatar ? (
        <div className="sidebar-avatar" style={{ backgroundImage: `url(${profile.avatar})` }} />
      ) : (
        <div className="sidebar-avatar sidebar-avatar--no-photo">
          <span className="material-symbols-outlined">person</span>
        </div>
      )}
      <div className="sidebar-user-info">
        <div className="sidebar-user-name">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Kullanıcı'}</div>
        <div className="sidebar-user-company">{profile?.company_name || 'Şirket Yok'}</div>
      </div>
    </div>

    <nav className="sidebar-nav">
      <a className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'profile' })}>
        <span className="material-symbols-outlined">person</span> Profil Bilgileri
      </a>
      <a className={`nav-item ${currentTab === 'favorites' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'favorites' })}>
        <span className="material-symbols-outlined">collections_bookmark</span> Favorilerim
      </a>
      <a className={`nav-item ${currentTab === 'quotes' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'quotes' })}>
        <span className="material-symbols-outlined">request_quote</span> Teklif Taleplerim
        {pendingQuoteCount > 0 && <span className="nav-item-badge">{pendingQuoteCount}</span>}
      </a>
      <a className={`nav-item ${currentTab === 'my-offers' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'my-offers' })}>
        <span className="material-symbols-outlined">assignment_turned_in</span> İhale Tekliflerim
        {myOffersUnreadCount > 0 && <span className="nav-item-badge">{myOffersUnreadCount}</span>}
      </a>
      {(myCompany || pendingInvites.length > 0) && (
        <a className={`nav-item ${currentTab === 'sirketim' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'sirketim' })}>
          <span className="material-symbols-outlined">corporate_fare</span> Şirketim
          {pendingInvites.length > 0 && <span className="nav-item-badge">{pendingInvites.length}</span>}
        </a>
      )}
      <a className={`nav-item ${currentTab === 'notifications' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'notifications' })}>
        <span className="material-symbols-outlined">notifications</span> Bildirimler
        {unreadNotificationsCount > 0 && <span className="nav-item-badge">{unreadNotificationsCount}</span>}
      </a>
      <hr className="sidebar-divider" />
      <a className="nav-item logout" onClick={handleLogout}>
        <span className="material-symbols-outlined">logout</span> Çıkış Yap
      </a>
    </nav>

    {currentTab === 'favorites' && (
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
          <div className={`list-item ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
            <span className="list-item-label"><span className="material-symbols-outlined">folder_special</span> Tüm Favoriler</span>
            <span className="list-item-count">{favorites.length}</span>
          </div>
          {myLists.map(liste => {
            const count = favorites.filter(f => f.liste_id === liste.id).length;
            return (
              <div key={liste.id} className={`list-item ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                <span className="list-item-label"><span className="material-symbols-outlined">folder</span> {liste.liste_adi}</span>
                <span className="list-item-actions">
                  <span className="list-item-count">{count}</span>
                  <button type="button" className="list-item-delete" onClick={e => { e.stopPropagation(); setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count }); }} aria-label={`${liste.liste_adi} listesini sil`}>
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
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') { setIsCreatingList(false); setNewListName(''); } }}
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
    )}

  </aside>
);

export default ProfileSidebar;
