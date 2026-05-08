// Enes Doğanay | 7 Mayıs 2026: Profil core koordinatör — yükleme, avatar, davet, marketing + email sub-hook
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useTheme } from '../../../hooks/useTheme';
import {
    fetchSession, fetchProfileData, fetchCompanyMembership,
    fetchFirmaById, fetchPendingInvites, saveMarketingConsent,
    uploadAvatar, acceptFirmaDavetiService, rejectFirmaDavetiService,
} from '../services/profileService';
import { fetchNotifPrefsService } from '../services/notificationsService';
import { useProfileEmailHandlers } from './useProfileEmailHandlers';

const DEFAULT_NOTIF_PREFS = {
    teklif_talepleri: true, teklif_yanitlari: true, teklif_mesajlari: true,
    hatirlatmalar: true, ihale_teklifleri: true, ihale_durum_degisiklikleri: true,
    ihale_teklif_mesajlari: true, anlik_bildirimler: true,
};

export const useProfileCore = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { theme } = useTheme();
    const fileInputRef = useRef(null);
    const prToastTimerRef = useRef(null);

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [myCompany, setMyCompany] = useState(null);
    const [myCompanyFirma, setMyCompanyFirma] = useState(null);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [mopChatTrigger, setMopChatTrigger] = useState(null);
    const [prToast, setPrToast] = useState(null);
    const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [marketingConsentSaving, setMarketingConsentSaving] = useState(false);

    const emailHandlers = useProfileEmailHandlers({ user, setUser, setProfile });

    const showPrToast = useCallback((type, message) => {
        if (prToastTimerRef.current) clearTimeout(prToastTimerRef.current);
        setPrToast({ type, message });
        prToastTimerRef.current = setTimeout(() => setPrToast(null), 3800);
    }, []);

    // Enes Doğanay | 7 Mayıs 2026: İlk veri yükleme
    useEffect(() => {
        let cancelled = false;
        const fetchInitial = async () => {
            try {
                const session = await fetchSession();
                if (!session) { if (!cancelled) { setLoading(false); navigate('/login'); } return; }
                const currentUser = session.user;
                const companyData = await fetchCompanyMembership(currentUser.id);
                if (companyData?.firma_id && companyData.role === 'owner') { if (!cancelled) { setLoading(false); navigate('/firma-profil'); } return; }
                if (cancelled) return;
                setUser(currentUser);
                if (currentUser.new_email) emailHandlers.setPendingEmail(currentUser.new_email);
                if (companyData?.firma_id) {
                    setMyCompany({ firma_id: companyData.firma_id, role: companyData.role, title: companyData.title || null, page_permissions: companyData.page_permissions || {} });
                    const firmaRes = await fetchFirmaById(companyData.firma_id);
                    if (firmaRes) setMyCompanyFirma(firmaRes);
                }
                const invites = await fetchPendingInvites(currentUser.id);
                setPendingInvites(invites);
                const { profile: profileData, cities: cityList } = await fetchProfileData(currentUser.id);
                if (profileData) { setProfile(profileData); setMarketingConsent(profileData.marketing_consent ?? false); }
                setCities(cityList);
                const prefsData = await fetchNotifPrefsService(currentUser.id);
                if (prefsData) setNotifPrefs(prev => ({ ...prev, ...Object.fromEntries(Object.keys(DEFAULT_NOTIF_PREFS).map(k => [k, prefsData[k] ?? true])) }));
                if (!cancelled) setLoading(false);
            } catch (err) { if (!cancelled) { console.error('Profile init error:', err); setLoading(false); } }
        };
        fetchInitial();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const chatId = searchParams.get('open_mop_chat');
        if (!chatId) return;
        setMopChatTrigger(chatId);
        setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete('open_mop_chat'); return next; }, { replace: true });
    }, [searchParams]);

    // Enes Doğanay | 7 Mayıs 2026: Şirketim tabına geçildiğinde davetleri yenile
    useEffect(() => {
        if (searchParams.get('tab') !== 'sirketim' || !user) return;
        fetchPendingInvites(user.id).then(invites => setPendingInvites(invites)).catch(() => {});
    }, [searchParams, user]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLogout = useCallback(async () => { await supabase.auth.signOut(); navigate('/'); }, [navigate]);

    const handleAvatarUpload = useCallback(async (event) => {
        const file = event.target.files[0]; if (!file) return;
        setUploading(true);
        try {
            const publicUrl = await uploadAvatar(user.id, file);
            await emailHandlers.handleUpdateField('avatar', publicUrl);
        } catch { showPrToast('error', 'Fotoğraf yüklenirken bir hata oluştu.'); }
        finally { setUploading(false); }
    }, [user, emailHandlers, showPrToast]);

    const handleDavetKabul = useCallback(async (davetId) => {
        try {
            await acceptFirmaDavetiService(davetId);
            const accepted = pendingInvites.find(d => d.id === davetId);
            if (accepted) {
                setMyCompany({ firma_id: accepted.firma_id, role: accepted.role, title: accepted.title || null, page_permissions: accepted.page_permissions || {} });
                const firmaRes = await fetchFirmaById(accepted.firma_id);
                if (firmaRes) setMyCompanyFirma(firmaRes);
            }
            setPendingInvites(prev => prev.filter(d => d.id !== davetId));
        } catch (err) { console.error('Davet kabul hatası:', err); }
    }, [pendingInvites]);

    const handleDavetRed = useCallback(async (davetId) => {
        await rejectFirmaDavetiService(davetId);
        setPendingInvites(prev => prev.filter(d => d.id !== davetId));
    }, []);

    const handleToggleMarketing = useCallback(async () => {
        const newValue = !marketingConsent;
        setMarketingConsent(newValue); setMarketingConsentSaving(true);
        try { await saveMarketingConsent(user.id, newValue); }
        catch { setMarketingConsent(!newValue); }
        finally { setMarketingConsentSaving(false); }
    }, [marketingConsent, user]);

    return {
        user, profile, cities, loading, uploading, myCompany, myCompanyFirma, pendingInvites,
        mopChatTrigger, setMopChatTrigger,
        prToast, setPrToast, showPrToast, notifPrefs, setNotifPrefs,
        marketingConsent, marketingConsentSaving,
        fileInputRef, theme, searchParams, setSearchParams, navigate,
        handleLogout, handleAvatarUpload, handleDavetKabul, handleDavetRed, handleToggleMarketing,
        ...emailHandlers,
    };
};
