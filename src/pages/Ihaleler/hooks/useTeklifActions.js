// Enes Doğanay | 7 Mayıs 2026: Teklif koordinatör hook — popup, iletişim, teklif mutasyonları
import { useEffect, useState, useMemo } from 'react';
import { fetchFirmaContactInfo, fetchCurrentUserOffersMap } from '../services/teklifFormService';
import useTeklifSubmitActions from './useTeklifSubmitActions';

// Enes Doğanay | 7 Mayıs 2026: Teklif işlem handler'ları + openTeklifPopup
const useTeklifActions = ({ userProfile, authManagedCompanyId, managedCompanyName, formState }) => {
    const {
        setTeklifForm, setTeklifDosya, setTeklifError, setTeklifTender,
        setLoginPromptTenderId, setLoginPromptPos,
        teklifSuccess, setOriginalTeklifForm,
    } = formState;

    const [userOffers, setUserOffers] = useState({});
    const [firmaContactPopup, setFirmaContactPopup] = useState(null);
    const [firmaContactLoading, setFirmaContactLoading] = useState(false);

    // Enes Doğanay | 8 Mayıs 2026: Kullanıcının tekliflerini çek — servis fonksiyonu ile (auth servis katmanında)
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const map = await fetchCurrentUserOffersMap();
                if (!cancelled) setUserOffers(map);
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
        // Enes Doğanay | 23 Mayıs 2026: ihale_aciklama — kalem lookup için gereksinimler
        const gereksinimler = Array.isArray(tender.gereksinimler) ? tender.gereksinimler : [];
        if (existing) {
            // Enes Doğanay | 14 Mayıs 2026: Numeric alanlar string'e normalize edilir — dirty karşılaştırması için tip tutarlılığı
            const loadedKalemler = Array.isArray(existing.kalemler) ? existing.kalemler.map(k => ({
                ...k,
                // Enes Doğanay | 23 Mayıs 2026: Mevcut teklifte ihale açıklaması gereksinimler'den eşleştir
                ihale_aciklama: gereksinimler.find(g => g.id === k.gereksinim_id)?.aciklama || '',
                birim_fiyat: k.birim_fiyat !== undefined && k.birim_fiyat !== null ? String(k.birim_fiyat) : '',
                miktar: k.miktar !== undefined && k.miktar !== null ? String(k.miktar) : '1',
                para_birimi: k.para_birimi || existing.para_birimi || 'TRY',
            })) : [];
            const formData = { kalemler: loadedKalemler, genel_toplam: existing.toplam_tutar ? String(existing.toplam_tutar) : '', para_birimi: existing.para_birimi || 'TRY', kdv_dahil: existing.kdv_dahil || false, teslim_suresi_gun: existing.teslim_suresi_gun ? String(existing.teslim_suresi_gun) : '', teslim_aciklamasi: existing.teslim_aciklamasi || '', not: existing.not_field || '' };
            setTeklifForm(formData);
            setOriginalTeklifForm(formData);
        } else {
            const gereksinimler = Array.isArray(tender.gereksinimler) ? tender.gereksinimler : [];
            // Enes Doğanay | 14 Mayıs 2026: Birim de ihaledeki gereksinim verisinden gelir
            const kalemler = gereksinimler.map(g => ({ gereksinim_id: g.id, madde: g.madde, birim: g.birim || '', birim_fiyat: '', miktar: String(g.adet || 1), aciklama: '', para_birimi: 'TRY', ihale_aciklama: g.aciklama || '' }));
            setTeklifForm({ kalemler, genel_toplam: '', para_birimi: 'TRY', kdv_dahil: tender.kdv_durumu === 'dahil', teslim_suresi_gun: '', teslim_aciklamasi: '', not: '' });
            setOriginalTeklifForm(null);
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
        } catch {
            setFirmaContactPopup({ name: null, firma: tender.firma_adi || null, email: null, phone: null, firmaPhone: null, firmaEmail: null });
        } finally {
            setFirmaContactLoading(false);
        }
    };

    // Enes Doğanay | 7 Mayıs 2026: Submit / silme / geri çekme — ayrı hook
    const submitActions = useTeklifSubmitActions({ formState, userOffers, setUserOffers, authManagedCompanyId, managedCompanyName, userProfile });

    // Enes Doğanay | 14 Mayıs 2026: Dirty tracking — JSON karşılaştırması, geri alınca buton tekrar deaktif olur
    // formData oluşturulurken numeric alanlar string'e normalize edildi, bu yüzden tip uyuşmazlığı olmaz
    const isTeklifDirty = useMemo(() => {
        if (!formState.originalTeklifForm) return true;
        if (formState.teklifForm === formState.originalTeklifForm) return false;
        const formChanged = JSON.stringify(formState.teklifForm) !== JSON.stringify(formState.originalTeklifForm);
        return formChanged || formState.teklifDosya !== null;
    }, [formState.teklifForm, formState.originalTeklifForm, formState.teklifDosya]);

    return {
        userOffers, setUserOffers,
        firmaContactPopup, setFirmaContactPopup,
        firmaContactLoading,
        openTeklifPopup,
        openFirmaContact,
        isTeklifDirty,
        ...submitActions,
    };
};

export default useTeklifActions;
