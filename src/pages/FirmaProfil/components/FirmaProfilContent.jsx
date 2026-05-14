// Enes Doğanay | 6 Mayıs 2026: Firma profil sekme içerik alanı — panel, teklifler, ihaleler, bildirimler, ekip, favoriler, analitik
import React from 'react';
import CompanyManagementPanel from '../../../components/CompanyManagementPanel';
import TeklifYonetimiTab from './TeklifYonetimiTab';
import IhaleYonetimiTab from './IhaleYonetimiTab';
import NotificationsTab from '../../Profile/components/NotificationsTab';
import EkipYonetimiTab from './EkipYonetimiTab';
import FavoritesTab from '../../Profile/components/FavoritesTab';
import FirmaDashboardTab from './FirmaDashboardTab';
import { FIRMA_NOTIF_PREFS_LIST } from '../constants/firmaProfilConstants';

// Enes Doğanay | 14 Mayıs 2026: myPagePermissions eklendi — analitik izin desteği
const FirmaProfilContent = ({ firma, setFirma, currentTab, companyId, searchParams, setTab, setIhaleYonetimiUnreadCount, myRole, myPagePermissions, teklifData, notifData, notifPrefs, ekipData, userId, favData, content, navigate, showEkipPublic, ekipVisibilitySaving, handleEkipPublicToggle, dashboardData }) => (
    <main className="content">
        {/* Enes Doğanay | 14 Mayıs 2026: page_permissions içerik kapıları */}
        {currentTab === 'panel' && firma && (myRole === 'owner' || myRole === 'admin' || myPagePermissions?.firma_paneli) && (
            <CompanyManagementPanel company={firma} onCompanyUpdated={setFirma} />
        )}
        {currentTab === 'teklifler' && (myRole === 'owner' || myRole === 'admin' || myPagePermissions?.teklif_yonetimi) && (
            <TeklifYonetimiTab {...teklifData} {...content} />
        )}
        {(myRole === 'owner' || myRole === 'admin' || myPagePermissions?.ihale_yonetimi) && (
            <div style={{ display: currentTab === 'ihale-yonetimi' ? 'block' : 'none' }}>
                <IhaleYonetimiTab companyId={companyId} searchParams={searchParams} setTab={setTab} setIhaleYonetimiUnreadCount={setIhaleYonetimiUnreadCount} />
            </div>
        )}
        {currentTab === 'bildirimler' && (
            <NotificationsTab {...notifData} {...content} notifPrefs={notifPrefs} unreadNotificationsCount={content.unreadNotifCount} marketingConsent={null} marketingConsentSaving={false} handleToggleMarketing={null} onNotifClick={content.handleNotifClick} navigate={navigate} notifPrefsList={FIRMA_NOTIF_PREFS_LIST} />
        )}
        {currentTab === 'ekip' && (myRole === 'owner' || myRole === 'admin' || myPagePermissions?.ekip_yonetimi) && (
            <EkipYonetimiTab {...ekipData} userId={userId} showEkipPublic={showEkipPublic} ekipVisibilitySaving={ekipVisibilitySaving} handleEkipPublicToggle={handleEkipPublicToggle} />
        )}
        {currentTab === 'favoriler' && <FavoritesTab {...favData} navigate={navigate} />}
        {/* Enes Doğanay | 14 Mayıs 2026: Analitik — owner/admin veya izinli üye */}
        {currentTab === 'analitik' && (myRole === 'owner' || myRole === 'admin' || myPagePermissions?.analitik) && (
            <FirmaDashboardTab {...dashboardData} />
        )}
    </main>
);

export default FirmaProfilContent;
