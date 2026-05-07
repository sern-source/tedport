// Enes Doğanay | 7 Mayıs 2026: Teklif koordinatör hook — popup, iletişim, teklif mutasyonları
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { fetchUserOffers, fetchFirmaContactInfo } from '../services/teklifFormService';
import useTeklifSubmitActions from './useTeklifSubmitActions';

// Enes Doğanay | 7 Mayıs 2026: Teklif işlem handler'ları + openTeklifPopup
const useTeklifActions = ({ userProfile, authManagedCompanyId, managedCompanyName, formState }) => {
    const {
        setTeklifForm, setTeklifDosya, setTeklifError, setTeklifTender,
        setLoginPromptTenderId, setLoginPromptPos,
        teklifSuccess,
    } = formState;

    const [userOffers, setUserOffers] = useState({});
    const [firmaContactPopup, setFirmaContactPopup] = useState(null);
    const [firmaContactLoading, setFirmaContactLoading] = useState(false);

    // Enes Doğanay | 7 Mayıs 2026: Kullanıcının tekliflerini çek — ihale_id bazlı harita
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user || cancelled) return;
            try {
                const data = await fetchUserOffers(session.user.id);
                if (!cancelled) {
                    const map = {};
                    data.forEach(o => { map[String(o.ihale_id)] = o; });
                    setUserOffers(map);
                }
            } catch { /* sessiz */ }
        };
        load();
        return () => { cancelled = true; };
    }, [teklifSuccess]);

    // Enes Doğanay | 7 Mayıs 2026: Teklif Ver popup aç — login yoksa prompt, varsa formu doldur
    const openTeklifPopup = (tender, e) => {
        if (!userProfile) {
            if (formState.loginPromptTenderId === tender.id) {
                setLoginPromptTenderId(null); setLoginPromptPos(null);
            } else {
                const btn = e?.currentTarget;
                if (btn) {
                    const rect = btn.getBoundingClientRect();
                    const popupW = 210;
                    let left = rect.left + rect.width / 2 - popupW / 2;
                    if (left < 8) left = 8;
                    if (left + popupW > window.innerWidth - 8) left = window.innerWidth - 8 - popupW;
                    const spaceBelow = window.innerHeight - rect.bottom;
                    setLoginPromptPos(spaceBelow > 180 ? { top: rect.bottom + 8, left } : { bottom: window.innerHeight - rect.top + 8, left });
                }
                setLoginPromptTenderId(tender.id);
            }
            return;
        }
        const existing = userOffers[String(tender.id)];
        if (existing) {
            const loadedKalemler = Array.isArray(existing.kalemler) ? existing.kalemler.map(k => ({ ...k, para_birimi: k.para_birimi || existing.para_birimi || 'TRY' })) : [];
            setTeklifForm({ kalemler: loadedKalemler, genel_toplam: existing.toplam_tutar ? String(existing.toplam_tutar) : '', para_birimi: existing.para_birimi || 'TRY', kdv_dahil: existing.kdv_dahil || false, teslim_suresi_gun: existing.teslim_suresi_gun ? String(existing.teslim_suresi_gun) : '', teslim_aciklamasi: existing.teslim_aciklamasi || '', not: existing.not_field || '' });
        } else {
            const gereksinimler = Array.isArray(tender.gereksinimler) ? tender.gereksinimler : [];
            const kalemler = gereksinimler.map(g => ({ gereksinim_id: g.id, madde: g.madde, birim_fiyat: '', miktar: '1', aciklama: '', para_birimi: 'TRY' }));
            setTeklifForm({ kalemler, genel_toplam: '', para_birimi: 'TRY', kdv_dahil: tender.kdv_durumu === 'dahil', teslim_suresi_gun: '', teslim_aciklamasi: '', not: '' });
        }
        setTeklifDosya(null);
        setTeklifError('');
        setTeklifTender(tender);
    };

    // Enes Doğanay | 7 Mayıs 2026: Firma iletişim bilgilerini getir
    const openFirmaContact = async (tender) => {
        setFirmaContactLoading(true);
        try {
            const info = await fetchFirmaContactInfo(tender);
            setFirmaContactPopup(info);
        } catch (e) {
            console.error('Firma iletişim bilgisi alınamadı:', e);
            setFirmaContactPopup({ name: null, firma: tender.firma_adi || null, email: null, phone: null, firmaPhone: null, firmaEmail: null });
        } finally {
            setFirmaContactLoading(false);
        }
    };

    // Enes Doğanay | 7 Mayıs 2026: Submit / silme / geri çekme — ayrı hook
    const submitActions = useTeklifSubmitActions({ formState, userOffers, setUserOffers, authManagedCompanyId, managedCompanyName, userProfile });

    return {
        userOffers, setUserOffers,
        firmaContactPopup, setFirmaContactPopup,
        firmaContactLoading,
        openTeklifPopup,
        openFirmaContact,
        ...submitActions,
    };
};

export default useTeklifActions;
