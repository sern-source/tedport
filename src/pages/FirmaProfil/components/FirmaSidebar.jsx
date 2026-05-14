// Enes Doğanay | 6 Mayıs 2026: Firma profil sidebar — kurumsal navigasyon + favoriler bölümü
import React from 'react';
import '../../../pages/Profile/components/ProfileSidebar.css';
import '../../../pages/Profile/components/ProfileSidebar.dark.css';
import SidebarFavorites from './SidebarFavorites';

/* Enes Doğanay | 6 Mayıs 2026: Kurumsal sidebar — logo, nav, favoriler listesi */
const FirmaSidebar = ({
  firma,
  currentTab,
  setTab,
  myRole,
  myPagePermissions,
  unreadNotifCount,
  ihaleYonetimiUnreadCount,
  incomingQuotes,
  unreadQuoteIds,
  setActiveQuoteChat,
  handleLogout,
  favData,
}) => {
  const {
    myLists, favorites, selectedListId, setSelectedListId,
    isCreatingList, setIsCreatingList, newListName, setNewListName,
    setConfirmDeleteList, handleCreateList,
  } = favData;
  const pendingCount = new Set([
    ...incomingQuotes.filter((q) => q.durum === 'pending').map((q) => q.id),
    ...[...unreadQuoteIds],
  ]).size;

  return (
    <aside className="sidebar">
      <div className="sidebar-user-card">
        {/* Enes Doğanay | 6 Mayıs 2026: Firma logosu — sadece firma-logolari bucket'inden */}
        {firma?.logo_url?.includes('firma-logolari') ? (
          <div
            className="sidebar-avatar"
            style={{ backgroundImage: `url(${firma.logo_url})` }}
          />
        ) : (
          <div className="sidebar-avatar sidebar-avatar--placeholder">
            {firma?.firma_adi?.charAt(0) || 'F'}
          </div>
        )}
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{firma?.firma_adi || 'Firma'}</div>
          <div className="sidebar-user-company">
            {firma?.category_name || 'Sektör belirtilmemiş'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Enes Doğanay | 14 Mayıs 2026: page_permissions kapıları — tüm sekmelere uygulandı */}
        {(myRole === 'owner' || myRole === 'admin' || myPagePermissions?.firma_paneli) && (
          <button
            type="button"
            className={`nav-item ${currentTab === 'panel' ? 'active' : ''}`}
            onClick={() => setTab({ tab: 'panel' })}
          >
            <span className="material-symbols-outlined">storefront</span> Firma Paneli
          </button>
        )}
        <button
          type="button"
          className={`nav-item ${currentTab === 'favoriler' ? 'active' : ''}`}
          onClick={() => setTab({ tab: 'favoriler' })}
        >
          <span className="material-symbols-outlined">collections_bookmark</span> Favorilerim
        </button>
        {(myRole === 'owner' || myRole === 'admin' || myPagePermissions?.teklif_yonetimi) && (
          <button
            type="button"
            className={`nav-item ${currentTab === 'teklifler' ? 'active' : ''}`}
            onClick={() => {
              setTab({ tab: 'teklifler' });
              if (setActiveQuoteChat) setActiveQuoteChat(null);
            }}
          >
            <span className="material-symbols-outlined">request_quote</span> Teklif Yönetimi
            {/* Enes Doğanay | 6 Mayıs 2026: Bekleyen + okunmamış teklif badge */}
            {pendingCount > 0 && <span className="nav-item-badge">{pendingCount}</span>}
          </button>
        )}
        {(myRole === 'owner' || myRole === 'admin' || myPagePermissions?.ihale_yonetimi) && (
          <button
            type="button"
            className={`nav-item ${currentTab === 'ihale-yonetimi' ? 'active' : ''}`}
            onClick={() => {
              if (setActiveQuoteChat) setActiveQuoteChat(null);
              setTab({ tab: 'ihale-yonetimi' });
            }}
          >
            <span className="material-symbols-outlined">gavel</span> İhale Yönetimi
            {ihaleYonetimiUnreadCount > 0 && (
              <span className="nav-item-badge">{ihaleYonetimiUnreadCount}</span>
            )}
          </button>
        )}
        {(myRole === 'owner' || myRole === 'admin' || myPagePermissions?.ekip_yonetimi) && (
          <button
            type="button"
            className={`nav-item ${currentTab === 'ekip' ? 'active' : ''}`}
            onClick={() => setTab({ tab: 'ekip' })}
          >
            <span className="material-symbols-outlined">group</span> Ekip Yönetimi
          </button>
        )}
        {/* Enes Doğanay | 14 Mayıs 2026: Analitik — owner/admin veya izinli üye */}
        {(myRole === 'owner' || myRole === 'admin' || myPagePermissions?.analitik) && (
          <button
            type="button"
            className={`nav-item ${currentTab === 'analitik' ? 'active' : ''}`}
            onClick={() => setTab({ tab: 'analitik' })}
          >
            <span className="material-symbols-outlined">bar_chart</span> Analitik
          </button>
        )}
        <button
          type="button"
          className={`nav-item ${currentTab === 'bildirimler' ? 'active' : ''}`}
          onClick={() => setTab({ tab: 'bildirimler' })}
        >
          <span className="material-symbols-outlined">notifications</span> Bildirimler
          {unreadNotifCount > 0 && (
            <span className="nav-item-badge">{unreadNotifCount}</span>
          )}
        </button>
        <hr className="sidebar-divider" />
        <button type="button" className="nav-item logout" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span> Çıkış Yap
        </button>
      </nav>

      {/* Enes Doğanay | 6 Mayıs 2026: Favoriler sekmesinde listeler + istatistik */}
      {currentTab === 'favoriler' && (
        <SidebarFavorites
          myLists={myLists}
          favorites={favorites}
          selectedListId={selectedListId}
          setSelectedListId={setSelectedListId}
          isCreatingList={isCreatingList}
          setIsCreatingList={setIsCreatingList}
          newListName={newListName}
          setNewListName={setNewListName}
          setConfirmDeleteList={setConfirmDeleteList}
          handleCreateList={handleCreateList}
        />
      )}
    </aside>
  );
};

export default FirmaSidebar;
