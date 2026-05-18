// Enes Doğanay | 7 Mayıs 2026: CompanyManagementPanel koordinatör — form, logo, katalog state + handler'lar
import { useEffect, useMemo, useRef, useState } from 'react';
import { TURKEY_DISTRICTS } from '../constants/turkeyDistricts';
import { uploadLogoToPending, fetchPendingTagRequest, updateManagedCompany } from '../services/companyManagementApi';
import { containsProfanity, PROFANITY_ERROR_MSG } from '../utils/contentModeration';
import { useCatalogEditor } from './useCatalogEditor';
import { useCompanyActionsManagement } from './useCompanyActionsManagement';
import { parseLocation, buildLocation, serializeCatalog, ALL_CITIES } from '../utils/companyPanelUtils';

const EMPTY_FIELDS = {
    firma_adi: '', category_name: '', ana_sektor: '', city: '', district: '',
    web_sitesi: '', telefon: '', eposta: '', logo_url: '',
    latitude: '', longitude: '', adres: '', description: ''
};

export const useCompanyManagement = ({ company, onCompanyUpdated, onSave, onDelete, isNew, isAdmin }) => {
    const parsedLoc = useMemo(() => parseLocation(company?.il_ilce), [company?.il_ilce]);

    const [fields, setFields] = useState(EMPTY_FIELDS);
    const [saveState, setSaveState] = useState({ saving: false, feedback: { type: '', msg: '' }, showSuccess: false });
    // Enes Doğanay | 16 Mayıs 2026: Alan bazlı hata — hangi input'ta sorun var
    const [fieldError, setFieldError] = useState({ key: '', msg: '' });
    const [logoState, setLogoState] = useState({ uploading: false, preview: '', pendingUrl: '', redNotu: '' });
    const originalFieldsRef = useRef(null);
    const originalCatalogRef = useRef(null);
    const { catalog, productDraft, setProductDraft, init: initCatalog, getSerialized, handlers: catalogHandlers } = useCatalogEditor();
    const { tagState, setTagState, deleteState, setDeleteState, handleTagSubmit, handleDelete } = useCompanyActionsManagement({ company, isAdmin, setSaveState, onDelete });

    useEffect(() => {
        if (!company) return;
        const nextFields = {
            firma_adi: company.firma_adi || '', category_name: company.category_name || '',
            // Enes Doğanay | 12 Mayıs 2026: ana_sektor artık state'e yükleniyor
            ana_sektor: company.ana_sektor || '',
            city: parsedLoc.city, district: parsedLoc.district,
            web_sitesi: company.web_sitesi || '', telefon: company.telefon || '',
            eposta: company.eposta || '', logo_url: company.logo_url || '',
            latitude: company.latitude ?? '', longitude: company.longitude ?? '',
            adres: company.adres || '', description: company.description || ''
        };
        setFields(nextFields);
        setLogoState({ uploading: false, preview: company.logo_url || '', pendingUrl: company.pending_logo_url || '', redNotu: company.pending_logo_red_notu || '' });
        setTagState(p => ({ ...p, approvedTags: company.arama_etiketleri || '' }));
        const parsed = initCatalog(company.urun_kategorileri);
        originalFieldsRef.current = JSON.stringify(nextFields);
        originalCatalogRef.current = JSON.stringify(serializeCatalog(parsed));
        if (company.firmaID) {
            fetchPendingTagRequest(company.firmaID).then(req => setTagState(p => ({ ...p, pendingRequest: req })));
        }
    }, [company, parsedLoc.city, parsedLoc.district]);

    const isDirty = useMemo(() => {
        if (isNew) return fields.firma_adi.trim().length > 0;
        if (!originalFieldsRef.current) return false;
        return JSON.stringify(fields) !== originalFieldsRef.current || JSON.stringify(getSerialized()) !== originalCatalogRef.current;
    }, [fields, catalog, isNew]);

    const set = (k, v) => {
        setFields(p => ({ ...p, [k]: v }));
        // Enes Doğanay | 16 Mayıs 2026: Alan değiştiğinde o alana ait hata temizlenir
        setFieldError(fe => fe.key === k ? { key: '', msg: '' } : fe);
    };
    const setCity = (city) => setFields(p => ({ ...p, city, district: (TURKEY_DISTRICTS[city] || []).includes(p.district) ? p.district : '' }));

    // Enes Doğanay | 16 Mayıs 2026: Hata alanına scroll + focus
    const flagField = (key, msg) => {
        setFieldError({ key, msg });
        setTimeout(() => {
            const el = document.querySelector(`[data-field-key="${key}"]`);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus?.(); }
        }, 50);
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !company?.firmaID) return;
        setLogoState(p => ({ ...p, uploading: true }));
        setSaveState(p => ({ ...p, feedback: { type: '', msg: '' } }));
        try {
            const publicUrl = await uploadLogoToPending(company.firmaID, file);
            setLogoState(p => ({ ...p, uploading: false, pendingUrl: publicUrl, redNotu: '' }));
        } catch (err) {
            setLogoState(p => ({ ...p, uploading: false }));
            setSaveState(p => ({ ...p, feedback: { type: 'err', msg: err.message || 'Logo yüklenemedi.' } }));
        }
    };

    const handleSubmit = async () => {
        // Enes Doğanay | 16 Mayıs 2026: Per-field içerik moderasyonu — hangi alan sorunluysa scroll + focus
        if (containsProfanity(fields.firma_adi)) { flagField('firma_adi', PROFANITY_ERROR_MSG); return; }
        if (containsProfanity(fields.category_name)) { flagField('category_name', PROFANITY_ERROR_MSG); return; }
        if (containsProfanity(fields.ana_sektor)) { flagField('ana_sektor', PROFANITY_ERROR_MSG); return; }
        if (containsProfanity(fields.description)) { flagField('description', PROFANITY_ERROR_MSG); return; }
        if (containsProfanity(fields.eposta)) { flagField('eposta', PROFANITY_ERROR_MSG); return; }
        if (containsProfanity(fields.web_sitesi)) { flagField('web_sitesi', PROFANITY_ERROR_MSG); return; }
        if (containsProfanity(fields.adres)) { flagField('adres', PROFANITY_ERROR_MSG); return; }
        for (const cat of catalog) {
            if (containsProfanity(cat.name)) { flagField(`cat-${cat.id}`, PROFANITY_ERROR_MSG); return; }
            for (const sub of cat.subs) {
                if (containsProfanity(sub.name)) { flagField(`sub-${sub.id}`, PROFANITY_ERROR_MSG); return; }
                for (const prod of sub.products) {
                    if (containsProfanity(prod.name)) { flagField(`prod-${sub.id}`, PROFANITY_ERROR_MSG); return; }
                }
            }
        }
        if (fields.telefon && !/^[0-9+()\-\s]+$/.test(fields.telefon)) {
            flagField('telefon', 'Telefon alanı sadece rakam ve +, -, (, ) karakterlerini içerebilir.');
            return;
        }
        if (fields.eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.eposta)) {
            flagField('eposta', 'Geçerli bir e-posta adresi girin.');
            return;
        }
        if (fields.web_sitesi && !/^https?:\/\/.+\..+/.test(fields.web_sitesi)) {
            flagField('web_sitesi', 'Web sitesi "https://" ile başlamalıdır (örn: https://siteniz.com).');
            return;
        }
        setSaveState(p => ({ ...p, saving: true, feedback: { type: '', msg: '' } }));
        try {
            const payload = {
                firma_adi: fields.firma_adi, category_name: fields.category_name,
                // Enes Doğanay | 12 Mayıs 2026: ana_sektor payload'a eklendi
                ana_sektor: fields.ana_sektor || null,
                il_ilce: buildLocation({ city: fields.city, district: fields.district }),
                web_sitesi: fields.web_sitesi, telefon: fields.telefon, eposta: fields.eposta,
                latitude: fields.latitude === '' ? null : Number(fields.latitude),
                longitude: fields.longitude === '' ? null : Number(fields.longitude),
                adres: fields.adres, description: fields.description, urun_kategorileri: getSerialized(),
                // Enes Doğanay | 18 Mayıs 2026: logo_url yalnızca admin onSave yolu için gönderilir.
                // update_my_company Edge Function artık logo_url'yi güncellemiyor — logo pending/onay akışıyla yönetilir.
                ...(onSave ? { logo_url: fields.logo_url || null } : {}),
            };
            const result = onSave ? await onSave(payload) : await updateManagedCompany(payload);
            originalFieldsRef.current = JSON.stringify(fields);
            originalCatalogRef.current = JSON.stringify(getSerialized());
            setSaveState({ saving: false, feedback: { type: '', msg: '' }, showSuccess: true });
            setTimeout(() => setSaveState(p => ({ ...p, showSuccess: false })), 5000);
            if (result?.company && onCompanyUpdated) onCompanyUpdated(result.company);
        } catch (err) {
            setSaveState(p => ({ ...p, saving: false, feedback: { type: 'err', msg: err.message || 'Kaydedilemedi, lutfen tekrar deneyin.' } }));
        }
    };

    return {
        fields, catalog, productDraft, setProductDraft, catalogHandlers,
        saving: saveState.saving, feedback: saveState.feedback, showSaveSuccess: saveState.showSuccess,
        fieldError,
        setShowSaveSuccess: (v) => setSaveState(p => ({ ...p, showSuccess: v })),
        logoUploading: logoState.uploading, logoPreview: logoState.preview,
        pendingLogoUrl: logoState.pendingUrl, logoRedNotu: logoState.redNotu,
        approvedTags: tagState.approvedTags, tagInput: tagState.input,
        setTagInput: (v) => setTagState(p => ({ ...p, input: v })),
        tagSending: tagState.sending, tagFeedback: tagState.feedback,
        pendingTagRequest: tagState.pendingRequest,
        showDeleteConfirm: deleteState.showConfirm,
        setShowDeleteConfirm: (v) => setDeleteState(p => ({ ...p, showConfirm: v })),
        deleting: deleteState.deleting, isDirty, districtOptions: TURKEY_DISTRICTS[fields.city] || [],
        ALL_CITIES, set, setCity, handleLogoUpload, handleSubmit, handleTagSubmit, handleDelete,
    };
};
