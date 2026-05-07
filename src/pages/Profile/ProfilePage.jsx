// Enes Doğanay | 6 Mayıs 2026: ProfilePage — ana kompozisyon bileşeni
import React, { useEffect } from 'react';
import './ProfilePage.css';
import '../../components/CompanyManagementPanel.css';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import { markNotificationRead } from '../../services/authService';
import PageLoader from '../../components/PageLoader';
import MyOffersTab from './components/MyOffersTab';
import { useAuth } from '../../AuthContext';
import { useProfileCore } from './hooks/useProfileCore';
import { useFavorites } from './hooks/useFavorites';
import { useQuotes } from './hooks/useQuotes';
import { useNotifications } from './hooks/useNotifications';
import useProfileContent from './hooks/useProfileContent';
import ProfileToast from './components/ProfileToast';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileInfoTab from './components/ProfileInfoTab';
import FavoritesTab from './components/FavoritesTab';
import QuotesTab from './components/QuotesTab';
import SirketimTab from './components/SirketimTab';
import NotificationsTab from './components/NotificationsTab';
import ProfileModals from './components/ProfileModals';

const NAV_ITEMS = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Firmalar', href: '/firmalar' },
  { label: 'İhaleler', href: '/ihaleler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
];

const ProfilePage = () => {
  const { latestNotification, pendingQuoteCount, setActiveViewingTeklifId, updateNotifPrefsCache, myOffersUnreadCount, setMyOffersUnreadCount, refreshCounts } = useAuth();
  const core = useProfileCore();
  const { user, profile, cities, loading, uploading, pendingEmail, fieldFeedback, setFieldFeedback,
    marketingConsent, marketingConsentSaving, myCompany, myCompanyFirma, pendingInvites,
    sirketimSubPanel, setSirketimSubPanel, mopChatTrigger, setMopChatTrigger,
    prToast, setPrToast, notifPrefs, setNotifPrefs, fileInputRef, sirketimIframeRef, theme,
    searchParams, setSearchParams, navigate, showPrToast,
    handleLogout, handleAvatarUpload, handleUpdateField,
    handleCancelEmailChange, handleResendEmailChange, handleDavetKabul, handleDavetRed, handleToggleMarketing,
  } = core;

  const currentTab = searchParams.get('tab') || 'profile';
  const notifData = useNotifications(user?.id, notifPrefs, setNotifPrefs, updateNotifPrefsCache, showPrToast);
  const quotesData = useQuotes(user?.id, setActiveViewingTeklifId, notifData.notifications, notifData.setNotifications, refreshCounts);
  const favData = useFavorites(user?.id, showPrToast);
  const content = useProfileContent({ notifData, quotesData, navigate, setSearchParams, setMopChatTrigger });

  // Enes Doğanay | 7 Mayıs 2026: Gerçek zamanlı bildirim listeye ekle — _isViewingChat tüm tipler için çalışır
  // quote_reply, quote_message, quote_received, tender_offer_message hepsi bu flag ile yönetilir
  useEffect(() => {
    if (!latestNotification) return;
    if (latestNotification._isViewingChat) {
      // Kullanıcı ilgili chat'teydi — okundu olarak ekle, badge artmasın
      markNotificationRead(latestNotification.id).then(() => refreshCounts()).catch(() => {});
      notifData.setNotifications(prev => prev.some(n => n.id === latestNotification.id) ? prev : [{ ...latestNotification, is_read: true }, ...prev]);
    } else {
      // Chat dışındaydı — okunmamış ekle, header badge güncelle
      notifData.setNotifications(prev => prev.some(n => n.id === latestNotification.id) ? prev : [latestNotification, ...prev]);
      refreshCounts();
    }
  }, [latestNotification]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enes Doğanay | 6 Mayıs 2026: Tab değişince aktif quote sıfırla
  useEffect(() => {
    if (currentTab !== 'quotes') quotesData.setActiveQuoteId(null);
  }, [currentTab]);

  if (loading) return <PageLoader />;

  return (
    <>
      <ProfileToast toast={prToast} onClose={() => setPrToast(null)} />
      <SharedHeader navItems={NAV_ITEMS} />
      <div className="page">
        <div className="layout">
          <ProfileSidebar
            profile={profile} currentTab={currentTab} myCompany={myCompany} pendingInvites={pendingInvites}
            pendingQuoteCount={pendingQuoteCount} myOffersUnreadCount={myOffersUnreadCount}
            unreadNotificationsCount={content.unreadNotificationsCount}
            handleLogout={handleLogout} setSearchParams={setSearchParams}
            myLists={favData.myLists} favorites={favData.favorites}
            selectedListId={favData.selectedListId} setSelectedListId={favData.setSelectedListId}
            isCreatingList={favData.isCreatingList} setIsCreatingList={favData.setIsCreatingList}
            newListName={favData.newListName} setNewListName={favData.setNewListName}
            handleCreateList={favData.handleCreateList} setConfirmDeleteList={favData.setConfirmDeleteList}
          />
          <main className="content">
            {currentTab === 'profile' && (
              <ProfileInfoTab profile={profile} user={user} uploading={uploading} fileInputRef={fileInputRef}
                fieldFeedback={fieldFeedback} setFieldFeedback={setFieldFeedback} pendingEmail={pendingEmail} cities={cities}
                handleAvatarUpload={handleAvatarUpload} handleUpdateField={handleUpdateField}
                handleCancelEmailChange={handleCancelEmailChange} handleResendEmailChange={handleResendEmailChange} />
            )}
            {currentTab === 'favorites' && <FavoritesTab {...favData} navigate={navigate} />}
            {currentTab === 'quotes' && <QuotesTab {...quotesData} unreadQuoteIds={content.unreadQuoteIds} navigate={navigate} />}
            {currentTab === 'my-offers' && (
              <MyOffersTab userId={user?.id} mopChatTrigger={mopChatTrigger} onChatOpened={() => setMopChatTrigger(null)} onUnreadCountChange={setMyOffersUnreadCount} />
            )}
            {currentTab === 'sirketim' && (
              <SirketimTab myCompany={myCompany} myCompanyFirma={myCompanyFirma} pendingInvites={pendingInvites}
                sirketimSubPanel={sirketimSubPanel} setSirketimSubPanel={setSirketimSubPanel}
                sirketimIframeRef={sirketimIframeRef} theme={theme}
                handleDavetKabul={handleDavetKabul} handleDavetRed={handleDavetRed} />
            )}
            {currentTab === 'notifications' && (
              <NotificationsTab {...notifData} {...content} notifPrefs={notifPrefs}
                marketingConsent={marketingConsent} marketingConsentSaving={marketingConsentSaving}
                handleToggleMarketing={handleToggleMarketing} onNotifClick={content.handleNotifClick} navigate={navigate} />
            )}
          </main>
        </div>
      </div>
      <ProfileModals quotesData={quotesData} favData={favData} />
    </>
  );
};

export default ProfilePage;
