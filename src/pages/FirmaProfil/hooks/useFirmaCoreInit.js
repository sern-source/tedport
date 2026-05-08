// Enes Doğanay | 7 Mayıs 2026: Firma profil temel data state — auth, firma, notif, ekip görünürlük
import { useState, useEffect, useCallback } from 'react';
import { getManagedCompanyId } from '../../../services/companyManagementApi';
import { fetchFirmaData, fetchUserRole, fetchNotifPrefs, updateEkipPublicToggle, getAuthSession, signOutService } from '../services/firmaService';

const DEFAULT_NOTIF_PREFS = {
    teklif_talepleri: true, teklif_yanitlari: true, teklif_mesajlari: true,
    hatirlatmalar: true, ihale_teklifleri: true, ihale_durum_degisiklikleri: true,
    ihale_teklif_mesajlari: true, anlik_bildirimler: true,
};

// Enes Doğanay | 7 Mayıs 2026: Auth + firma + notif yükleme, logout, ekip toggle
export const useFirmaCoreInit = ({ navigate }) => {
    const [companyId, setCompanyId] = useState(null);
    const [firma, setFirma] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myRole, setMyRole] = useState(null);
    const [showEkipPublic, setShowEkipPublic] = useState(true);
    const [ekipVisibilitySaving, setEkipVisibilitySaving] = useState(false);
    const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);

    useEffect(() => {
        const fallbackTimer = setTimeout(() => setLoading(false), 12000);
        const init = async () => {
            try {
                const cid = await getManagedCompanyId();
                if (!cid) { navigate('/'); return; }
                setCompanyId(cid);
                const session = await getAuthSession();
                if (!session?.user) { navigate('/login'); return; }
                setUserId(session.user.id);
                const [firmaData, notifPrefsData, roleData] = await Promise.all([
                    fetchFirmaData(cid), fetchNotifPrefs(session.user.id), fetchUserRole(session.user.id, cid),
                ]);
                setFirma(firmaData);
                setShowEkipPublic(firmaData?.show_ekip_public !== false);
                if (notifPrefsData) {
                    setNotifPrefs({
                        teklif_talepleri: notifPrefsData.teklif_talepleri ?? true,
                        teklif_yanitlari: notifPrefsData.teklif_yanitlari ?? true,
                        teklif_mesajlari: notifPrefsData.teklif_mesajlari ?? true,
                        hatirlatmalar: notifPrefsData.hatirlatmalar ?? true,
                        ihale_teklifleri: notifPrefsData.ihale_teklifleri ?? true,
                        ihale_durum_degisiklikleri: notifPrefsData.ihale_durum_degisiklikleri ?? true,
                        ihale_teklif_mesajlari: notifPrefsData.ihale_teklif_mesajlari ?? true,
                        anlik_bildirimler: notifPrefsData.anlik_bildirimler ?? true,
                    });
                }
                if (roleData) setMyRole(roleData);
                setLoading(false);
            } catch (err) {
                if (!err?.message?.includes('abort')) { /* sessiz */ }
                setLoading(false);
            }
        };
        init().finally(() => clearTimeout(fallbackTimer));
        return () => clearTimeout(fallbackTimer);
    }, [navigate]);

    const handleLogout = useCallback(async () => {
        await signOutService();
        navigate('/login');
    }, [navigate]);

    const handleEkipPublicToggle = useCallback(async () => {
        const newValue = !showEkipPublic;
        setEkipVisibilitySaving(true);
        await updateEkipPublicToggle(companyId, newValue);
        setShowEkipPublic(newValue);
        setEkipVisibilitySaving(false);
    }, [showEkipPublic, companyId]);

    return {
        companyId, firma, setFirma, userId, loading, myRole, setMyRole,
        showEkipPublic, setShowEkipPublic, ekipVisibilitySaving, handleEkipPublicToggle,
        notifPrefs, setNotifPrefs, handleLogout,
    };
};
