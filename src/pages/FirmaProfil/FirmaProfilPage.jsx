// Enes Doğanay | 6 Mayıs 2026: FirmaProfilPage — kurumsal profil ana kompozisyon bileşeni
import React, { useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import PageLoader from '../../components/PageLoader';
import ProfileToast from '../Profile/components/ProfileToast';
import '../Profile/ProfilePage.css';
import { useNotifications } from '../Profile/hooks/useNotifications';
import { useFavorites } from '../Profile/hooks/useFavorites';
import { useFirmaCore } from './hooks/useFirmaCore';
import { useTeklifYonetimi } from './hooks/useTeklifYonetimi';
import { useEkipYonetimi } from './hooks/useEkipYonetimi';
import { useFirmaContent } from './hooks/useFirmaContent';
import { NAV_ITEMS } from './constants/firmaProfilConstants';
import { markNotificationRead } from './services/firmaService';
import FirmaSidebar from './components/FirmaSidebar';
import FirmaProfilContent from './components/FirmaProfilContent';
import ProfileModals from '../Profile/components/ProfileModals';
import './FirmaProfilPage.css';
// Enes Doğanay | 7 Mayıs 2026: Favori ve liste sil modalları için boş quotesData stub
const EMPTY_QUOTES_DATA = { reportModal: null, setReportModal: () => {}, reportNeden: '', setReportNeden: () => {}, reportAciklama: '', setReportAciklama: () => {}, reportSending: false, submitReport: () => {}, reportSuccess: false };

const FirmaProfilPage = () => {
  const { latestNotification, setActiveViewingTeklifId, updateNotifPrefsCache, ihaleYonetimiUnreadCount, setIhaleYonetimiUnreadCount, refreshCounts } = useAuth();
  const { companyId, firma, setFirma, userId, loading, myRole, showEkipPublic, ekipVisibilitySaving, handleEkipPublicToggle, isEmbedded, currentTab, setTab, searchParams, setSearchParams, navigate, fpToast, showFpToast, notifPrefs, setNotifPrefs, handleLogout } = useFirmaCore();

  const notifData = useNotifications(userId, notifPrefs, setNotifPrefs, updateNotifPrefsCache, showFpToast);
  const favData = useFavorites(userId, showFpToast);
  const teklifData = useTeklifYonetimi({ companyId, userId, notifications: notifData.notifications, setNotifications: notifData.setNotifications, setActiveViewingTeklifId, refreshCounts, setTab, searchParams, setSearchParams, currentTab, showFpToast });
  const ekipData = useEkipYonetimi({ companyId, userId, firmaAdi: firma?.firma_adi, showFpToast });
  const content = useFirmaContent({ notifications: notifData.notifications, upcomingReminders: notifData.upcomingReminders, showAllNotifications: notifData.showAllNotifications, getFilteredNotifications: notifData.getFilteredNotifications, incomingQuotes: teklifData.incomingQuotes, outgoingQuotes: teklifData.outgoingQuotes, setTab, navigate, handleMarkNotificationRead: notifData.handleMarkNotificationRead, handleOpenQuoteChat: teklifData.handleOpenQuoteChat });

  // Enes Doğanay | 7 Mayıs 2026: Gerçek zamanlı bildirim listeye ekle — _isViewingChat tüm tipler için çalışır
  // quote_reply, quote_message, quote_received, tender_offer_message hepsi bu flag ile yönetilir
  useEffect(() => {
    if (!latestNotification) return;
    if (latestNotification._isViewingChat) {
      // Firma ilgili chat'teydi — okundu olarak ekle, badge artmasın
      markNotificationRead(latestNotification.id).then(() => refreshCounts()).catch(() => {});
      notifData.setNotifications(prev => prev.some(n => n.id === latestNotification.id) ? prev : [{ ...latestNotification, is_read: true }, ...prev]);
    } else {
      // Chat dışındaydı — okunmamış ekle, header badge güncelle
      notifData.setNotifications(prev => prev.some(n => n.id === latestNotification.id) ? prev : [latestNotification, ...prev]);
      refreshCounts();
    }
  }, [latestNotification]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enes Doğanay | 6 Mayıs 2026: Ekip sekmesine girildiğinde ekibi yükle
  useEffect(() => {
    if (currentTab === 'ekip' && companyId) ekipData.handleLoadEkip();
  }, [currentTab, companyId]);

  // Enes Doğanay | 7 Mayıs 2026: Tab geçişinde activeViewingTeklifId sıfırla — stale ref toast bastırmaşını önle
  useEffect(() => {
    if (currentTab !== 'ihale-yonetimi') setActiveViewingTeklifId(null);
  }, [currentTab]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoader />;

  return (
    <>
      {fpToast && <ProfileToast type={fpToast.type} message={fpToast.message} />}
      {/* Enes Doğanay | 7 Mayıs 2026: Favori sil + liste sil confirm modalları */}
      <ProfileModals quotesData={EMPTY_QUOTES_DATA} favData={favData} />
      {!isEmbedded && <SharedHeader navItems={NAV_ITEMS} isLoggedIn onLogout={handleLogout} currentPage="firma-profil" />}
      <div className="page">
        <div className={`layout${isEmbedded ? ' layout--embedded' : ''}`}>
          {!isEmbedded && <FirmaSidebar firma={firma} currentTab={currentTab} setTab={setTab} myRole={myRole} unreadNotifCount={content.unreadNotifCount} ihaleYonetimiUnreadCount={ihaleYonetimiUnreadCount} incomingQuotes={teklifData.incomingQuotes} unreadQuoteIds={content.unreadQuoteIds} setActiveQuoteChat={teklifData.setActiveQuoteChat} handleLogout={handleLogout} favData={favData} />}
          <FirmaProfilContent firma={firma} setFirma={setFirma} currentTab={currentTab} companyId={companyId} searchParams={searchParams} setTab={setTab} setIhaleYonetimiUnreadCount={setIhaleYonetimiUnreadCount} myRole={myRole} teklifData={teklifData} notifData={notifData} notifPrefs={notifPrefs} ekipData={ekipData} userId={userId} favData={favData} content={content} navigate={navigate} showEkipPublic={showEkipPublic} ekipVisibilitySaving={ekipVisibilitySaving} handleEkipPublicToggle={handleEkipPublicToggle} />
        </div>
      </div>
    </>
  );
};

export default FirmaProfilPage;
