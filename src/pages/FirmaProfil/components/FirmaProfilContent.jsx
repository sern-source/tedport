// Enes Doğanay | 6 Mayıs 2026: Firma profil sekme içerik alanı — panel, teklifler, ihaleler, bildirimler, ekip, favoriler
import React from 'react';
import CompanyManagementPanel from '../../../components/CompanyManagementPanel';
import TeklifYonetimiTab from './TeklifYonetimiTab';
import IhaleYonetimiTab from './IhaleYonetimiTab';
import NotificationsTab from '../../Profile/components/NotificationsTab';
import EkipYonetimiTab from './EkipYonetimiTab';
import FavoritesTab from '../../Profile/components/FavoritesTab';
import { FIRMA_NOTIF_PREFS_LIST } from '../constants/firmaProfilConstants';

const FirmaProfilContent = ({ firma, setFirma, currentTab, companyId, searchParams, setTab, setIhaleYonetimiUnreadCount, myRole, teklifData, notifData, notifPrefs, ekipData, userId, favData, content, navigate, showEkipPublic, ekipVisibilitySaving, handleEkipPublicToggle }) => (
    <main className="content">
        {currentTab === 'panel' && firma && <CompanyManagementPanel company={firma} onCompanyUpdated={setFirma} />}
        {currentTab === 'teklifler' && <TeklifYonetimiTab {...teklifData} {...content} />}
        <div style={{ display: currentTab === 'ihale-yonetimi' ? 'block' : 'none' }}>
            <IhaleYonetimiTab companyId={companyId} searchParams={searchParams} setTab={setTab} setIhaleYonetimiUnreadCount={setIhaleYonetimiUnreadCount} />
        </div>
        {currentTab === 'bildirimler' && (
            <NotificationsTab {...notifData} {...content} notifPrefs={notifPrefs} unreadNotificationsCount={content.unreadNotifCount} marketingConsent={null} marketingConsentSaving={false} handleToggleMarketing={null} onNotifClick={content.handleNotifClick} navigate={navigate} notifPrefsList={FIRMA_NOTIF_PREFS_LIST} />
        )}
        {currentTab === 'ekip' && (myRole === 'owner' || myRole === 'admin') && (
            <EkipYonetimiTab {...ekipData} userId={userId} showEkipPublic={showEkipPublic} ekipVisibilitySaving={ekipVisibilitySaving} handleEkipPublicToggle={handleEkipPublicToggle} />
        )}
        {currentTab === 'favoriler' && <FavoritesTab {...favData} navigate={navigate} />}
    </main>
);

export default FirmaProfilContent;
