// Enes Doğanay | 7 Mayıs 2026: İhale form koordinatör — supabase kaldırıldı, davet sub-hook ayrıldı
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createTender, updateTender } from '../../../services/ihaleManagementApi';
import { uploadIhaleFiles } from '../services/ihaleFormService';
import { EMPTY_FORM, toDateInput } from '../IhalelerUtils';
import { useIhaleFormInvites } from './useIhaleFormInvites';
// Enes Doğanay | 11 Mayıs 2026: Şablon hook entegrasyonu
import useIhaleTemplates from '../../FirmaProfil/hooks/useIhaleTemplates';

const useIhaleForm = ({ managedFirmaId, generateReferansNo, fetchMyTenders, fetchPublicTenders, reloadInvitedTenders, yeniIhaleParam, duzenleParam, searchParams, setSearchParams, myTenders }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingTender, setEditingTender] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [stepperStep, setStepperStep] = useState(0);
    const [yeniGereksinimMadde, setYeniGereksinimMadde] = useState('');
    const [yeniGereksinimAciklama, setYeniGereksinimAciklama] = useState('');
    // Enes Doğanay | 9 Mayıs 2026: Gereksinim adet alanı — default 1
    const [yeniGereksinimAdet, setYeniGereksinimAdet] = useState('1');
    // Enes Doğanay | 14 Mayıs 2026: Gereksinim birim seçimi — default Adet
    const [yeniGereksinimBirim, setYeniGereksinimBirim] = useState('Adet');
    const [ihalePublishSuccess, setIhalePublishSuccess] = useState(null);
    // Enes Doğanay | 12 Mayıs 2026: Güncelleme başarı modalı
    const [ihaleUpdateSuccess, setIhaleUpdateSuccess] = useState(false);
    const [publishedLinkCopied, setPublishedLinkCopied] = useState(false);
    const [refNoCopied, setRefNoCopied] = useState(false);
    const fileInputRef = useRef(null);
    // Enes Doğanay | 12 Mayıs 2026: Dirty tracking — edit modunda orijinal formu saklar
    const originalFormRef = useRef(null);

    const invites = useIhaleFormInvites({ form, setForm });

    // Enes Doğanay | 11 Mayıs 2026: Şablon hook — managedFirmaId ile beslenir
    const templateHook = useIhaleTemplates({ companyId: managedFirmaId });

    // Enes Doğanay | 11 Mayıs 2026: Şablon uygula — form alanlarını doldur, stepper'ı sıfırla
    const applyTemplate = useCallback((template) => {
        setForm(prev => ({
            ...prev,
            baslik: template.baslik || prev.baslik,
            aciklama: template.aciklama || prev.aciklama,
            ihale_tipi: template.ihale_tipi || prev.ihale_tipi,
            kdv_durumu: template.kdv_durumu || prev.kdv_durumu,
            teslim_suresi: template.teslim_suresi || prev.teslim_suresi,
            teslim_il: template.teslim_il || prev.teslim_il,
            teslim_ilce: template.teslim_ilce || prev.teslim_ilce,
            gereksinimler: template.gereksinimler?.length ? template.gereksinimler : prev.gereksinimler,
        }));
        setStepperStep(0);
        setFormError('');
    }, []);

    const openCreate = useCallback(async () => {
        setEditingTender(null);
        const refNo = await generateReferansNo();
        const todayStr = new Date().toISOString().split('T')[0];
        const twoWeeksLater = new Date(); twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
        setForm({ ...EMPTY_FORM, referans_no: refNo, gereksinimler: [], davet_emailleri: [], davetli_firmalar: [], ek_dosyalar: [], yayin_tarihi: todayStr, son_basvuru_tarihi: twoWeeksLater.toISOString().split('T')[0], teslim_suresi: '14' });
        setFormError(''); setStepperStep(0); invites.resetInvites(); setShowModal(true);
    }, [generateReferansNo]);

    const openEdit = useCallback((tender) => {
        setEditingTender(tender);
        let teslimIl = tender.teslim_il || ''; let teslimIlce = tender.teslim_ilce || '';
        if (!teslimIl && tender.il_ilce) { const parts = tender.il_ilce.split('/').map(s => s.trim()); teslimIl = parts[0] || ''; teslimIlce = parts[1] || ''; }
        // Enes Doğanay | 12 Mayıs 2026: Snapshot — dirty tracking için orijinal formu sakla
        const formSnapshot = { baslik: tender.baslik || '', aciklama: tender.aciklama || '', ihale_tipi: tender.ihale_tipi || 'Açık İhale', kdv_durumu: tender.kdv_durumu || 'haric', yayin_tarihi: toDateInput(tender.yayin_tarihi), son_basvuru_tarihi: toDateInput(tender.son_basvuru_tarihi), teslim_suresi: tender.teslim_suresi || '', durum: tender.durum || 'canli', referans_no: tender.referans_no || '', teslim_il: teslimIl, teslim_ilce: teslimIlce, sektor: tender.kategori || '', gereksinimler: tender.gereksinimler || [], davet_emailleri: tender.davet_emailleri || [], davetli_firmalar: tender.davetli_firmalar || [], ek_dosyalar: tender.ek_dosyalar || [], anonim: tender.anonim === true };
        setForm(formSnapshot);
        originalFormRef.current = formSnapshot;
        setFormError(''); setStepperStep(0); invites.resetInvites(); setShowModal(true);
    }, []);

    const handleClone = useCallback(async (tender) => {
        const refNo = await generateReferansNo(); setEditingTender(null);
        let teslimIl = tender.teslim_il || ''; let teslimIlce = tender.teslim_ilce || '';
        if (!teslimIl && tender.il_ilce) { const parts = tender.il_ilce.split('/').map(s => s.trim()); teslimIl = parts[0] || ''; teslimIlce = parts[1] || ''; }
        const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
        const toYMD = (d) => d.toISOString().split('T')[0];
        let sonBasvuruTarihi = '';
        if (tender.yayin_tarihi && tender.son_basvuru_tarihi) {
            const diffDays = Math.round((new Date(tender.son_basvuru_tarihi) - new Date(tender.yayin_tarihi)) / 86400000);
            if (diffDays > 0) { const endDate = new Date(todayDate); endDate.setDate(endDate.getDate() + diffDays); sonBasvuruTarihi = toYMD(endDate); }
        }
        setForm({ baslik: tender.baslik || '', aciklama: tender.aciklama || '', ihale_tipi: tender.ihale_tipi || 'Açık İhale', kdv_durumu: tender.kdv_durumu || 'haric', yayin_tarihi: toYMD(todayDate), son_basvuru_tarihi: sonBasvuruTarihi, teslim_suresi: tender.teslim_suresi || '', durum: 'draft', referans_no: refNo, teslim_il: teslimIl, teslim_ilce: teslimIlce, sektor: tender.kategori || '', gereksinimler: tender.gereksinimler || [], davet_emailleri: tender.davet_emailleri || [], davetli_firmalar: tender.davetli_firmalar || [], ek_dosyalar: [], anonim: false });
        setFormError(''); setStepperStep(0); setShowModal(true);
    }, [generateReferansNo]);

    const addGereksinim = () => {
        if (!yeniGereksinimMadde.trim()) return;
        // Enes Doğanay | 9 Mayıs 2026: Adet alanı eklendi
        // Enes Doğanay | 14 Mayıs 2026: Birim alanı eklendi
        const adet = Math.max(1, parseInt(yeniGereksinimAdet) || 1);
        const birim = yeniGereksinimBirim || 'Adet';
        setForm(p => ({ ...p, gereksinimler: [...p.gereksinimler, { id: Date.now(), madde: yeniGereksinimMadde.trim(), aciklama: yeniGereksinimAciklama.trim(), adet, birim }] }));
        setYeniGereksinimMadde(''); setYeniGereksinimAciklama(''); setYeniGereksinimAdet('1'); setYeniGereksinimBirim('Adet');
    };
    const removeGereksinim = (id) => setForm(p => ({ ...p, gereksinimler: p.gereksinimler.filter(g => g.id !== id) }));
    const handleFileAdd = (e) => {
        const files = Array.from(e.target.files || []); const valid = files.filter(f => f.size <= 10 * 1024 * 1024);
        if (valid.length < files.length) setFormError('10 MB üzeri dosyalar eklenmedi.');
        setForm(p => ({ ...p, ek_dosyalar: [...p.ek_dosyalar, ...valid] }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const removeFile = (idx) => setForm(p => ({ ...p, ek_dosyalar: p.ek_dosyalar.filter((_, i) => i !== idx) }));

    const handleFormSubmit = async (e, forceDurum) => {
        if (e) e.preventDefault();
        setFormSaving(true); setFormError('');
        try {
            // Enes Doğanay | 14 Mayıs 2026: Firma veya kişi (email) yeterli
            if (form.ihale_tipi === 'Davetli İhale' && form.davetli_firmalar.length === 0 && form.davet_emailleri.length === 0) { setFormError('Davetli ihale için en az bir firma veya kişi eklemeniz gerekiyor.'); return; }
            const onaysiz = form.davetli_firmalar.find(f => !f.onayli);
            if (onaysiz) { setFormError(`"${onaysiz.firma_adi}" henüz onaylı bir firma değil.`); return; }
            const existingFiles = form.ek_dosyalar.filter(f => f.path && f.url);
            const newFiles = form.ek_dosyalar.filter(f => f instanceof File);
            const uploadedFiles = [...existingFiles, ...await uploadIhaleFiles(form.referans_no, newFiles)];
            const pendingEmail = invites.emailInput.trim().toLowerCase();
            const finalEmails = (pendingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pendingEmail) && invites.emailStatus === 'valid' && !form.davet_emailleri.includes(pendingEmail))
                ? [...form.davet_emailleri, pendingEmail] : form.davet_emailleri;
            const payload = { ...form, durum: forceDurum || form.durum, il_ilce: [form.teslim_il, form.teslim_ilce].filter(Boolean).join(' / '), ek_dosyalar: uploadedFiles, davet_emailleri: finalEmails };
            // Enes Doğanay | 12 Mayıs 2026: Draft kayıt ve taslak→yayın durumlarına göre farklı başarı mesajı
            if (editingTender) {
                await updateTender(editingTender.id, payload);
                const savedDurum = forceDurum || form.durum;
                if (savedDurum === 'draft') {
                    setIhaleUpdateSuccess('draft');
                } else if (editingTender.durum === 'draft') {
                    setPublishedLinkCopied(false); setIhalePublishSuccess(editingTender.id);
                } else {
                    setIhaleUpdateSuccess('update');
                }
            }
            else {
                const created = await createTender(payload);
                const savedDurum = forceDurum || form.durum;
                // Enes Doğanay | 14 Mayıs 2026: Yeni ihale taslağı için ayrı tip — 'draft-new'
                if (savedDurum === 'draft') {
                    setIhaleUpdateSuccess('draft-new');
                } else if (created?.id) {
                    setPublishedLinkCopied(false); setIhalePublishSuccess(created.id);
                }
            }
            setShowModal(false); await fetchMyTenders(); await fetchPublicTenders();
            // Enes Doğanay | 19 Mayıs 2026: Davetli ihale oluşturulunca/güncellince owned liste de güncellenir
            reloadInvitedTenders?.();
        } catch (err) { setFormError(err.message || 'Kaydedilemedi.'); }
        finally { setFormSaving(false); }
    };

    useEffect(() => {
        if (!yeniIhaleParam || !managedFirmaId) return;
        openCreate(); const params = new URLSearchParams(searchParams); params.delete('yeniIhale'); setSearchParams(params, { replace: true });
    }, [yeniIhaleParam, managedFirmaId]);

    useEffect(() => {
        if (!duzenleParam || myTenders.length === 0) return;
        const target = myTenders.find(t => String(t.id) === String(duzenleParam)); if (!target) return;
        openEdit(target); const params = new URLSearchParams(searchParams); params.delete('duzenle'); setSearchParams(params, { replace: true });
    }, [duzenleParam, myTenders]);

    return {
        showModal, setShowModal, editingTender, setEditingTender,
        form, setForm, formSaving, formError, setFormError,
        stepperStep, setStepperStep,
        yeniGereksinimMadde, setYeniGereksinimMadde,
        yeniGereksinimAciklama, setYeniGereksinimAciklama,
        yeniGereksinimAdet, setYeniGereksinimAdet,
        yeniGereksinimBirim, setYeniGereksinimBirim,
        fileInputRef, ihalePublishSuccess, setIhalePublishSuccess,
        ihaleUpdateSuccess, setIhaleUpdateSuccess,
        // Enes Doğanay | 12 Mayıs 2026: Dirty tracking — edit modunda değişiklik yapıldı mı?
        isFormDirty: !editingTender || !originalFormRef.current ? true : JSON.stringify(form) !== JSON.stringify(originalFormRef.current),
        publishedLinkCopied, setPublishedLinkCopied, refNoCopied, setRefNoCopied,
        openCreate, openEdit, handleClone,
        addGereksinim, removeGereksinim,
        handleFileAdd, removeFile, handleFormSubmit,
        templateHook, applyTemplate,
        ...invites,
    };
};

export default useIhaleForm;
