// Enes Doğanay | 7 Mayıs 2026: İhale oluşturma koordinatör — state, modal açıcılar, flat adapters
import { useState, useRef, useCallback } from 'react';
import * as ihaleService from '../services/ihaleService';
import { CREATE_EMPTY_FORM } from '../constants/ihaleConstants';
import { useIhaleCreateHandlers } from './useIhaleCreateHandlers';
// Enes Doğanay | 11 Mayıs 2026: Şablon hook entegrasyonu
import useIhaleTemplates from './useIhaleTemplates';

const useIhaleCreate = ({ companyId, reloadTenders }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editTenderId, setEditTenderId] = useState(null);
    const [createForm, setCreateForm] = useState(CREATE_EMPTY_FORM);
    const [stepperState, setStepperState] = useState({ step: 0, error: '', saving: false });
    const [createReqState, setCreateReqState] = useState({ madde: '', aciklama: '', adet: '1', birim: 'Adet' });
    const [emailState, setEmailState] = useState({ input: '', status: null });
    const [firmaState, setFirmaState] = useState({ term: '', results: [], searching: false });
    const [publishState, setPublishState] = useState({ verifiedUser: false, successId: null, linkCopied: false, refNoCopied: false, editSaved: false, draftSaved: false });

    const createFileInputRef = useRef(null);
    const createFirmaResultsRef = useRef(null);
    // Enes Doğanay | 12 Mayıs 2026: Dirty tracking — düzenle modalı açılınca form snapshot al
    const originalFormRef = useRef(null);

    const handlers = useIhaleCreateHandlers({
        companyId, createForm, setCreateForm, emailState, setEmailState,
        firmaState, setFirmaState, createReqState, setCreateReqState,
        setStepperState, createFileInputRef, createFirmaResultsRef,
        editTenderId, setEditTenderId, setShowCreateModal, reloadTenders, setPublishState,
    });

    const resetFormState = useCallback((refNo, isVerified) => {
        setStepperState({ step: 0, error: '', saving: false });
        setCreateReqState({ madde: '', aciklama: '', adet: '1', birim: 'Adet' });
        setEmailState({ input: '', status: null });
        setFirmaState({ term: '', results: [], searching: false });
        setPublishState(p => ({ ...p, verifiedUser: isVerified }));
        return refNo;
    }, []);

    const openCreateModal = useCallback(async () => {
        const result = await ihaleService.generateRefNo(companyId).catch(() => ({ refNo: `TED-${Date.now()}`, isVerified: false }));
        const todayStr = new Date().toISOString().split('T')[0];
        const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        setEditTenderId(null);
        setCreateForm({ ...CREATE_EMPTY_FORM, referans_no: resetFormState(result.refNo, result.isVerified), yayin_tarihi: todayStr, son_basvuru_tarihi: twoWeeks, teslim_suresi: '14' });
        setShowCreateModal(true);
    }, [companyId, resetFormState]);

    const openEditInCreateModal = useCallback(async (tender) => {
        const result = await ihaleService.generateRefNo(companyId).catch(() => ({ refNo: '', isVerified: false }));
        setEditTenderId(tender.id);
        const editForm = { baslik: tender.baslik || '', aciklama: tender.aciklama || '', ihale_tipi: tender.ihale_tipi || 'Açık İhale', kdv_durumu: tender.kdv_durumu || 'haric', yayin_tarihi: tender.yayin_tarihi || '', son_basvuru_tarihi: tender.son_basvuru_tarihi || '', teslim_suresi: tender.teslim_suresi ? String(tender.teslim_suresi) : '', durum: tender.durum || 'canli', referans_no: resetFormState(tender.referans_no || '', result.isVerified), teslim_il: tender.teslim_il || '', teslim_ilce: tender.teslim_ilce || '', gereksinimler: tender.gereksinimler || [], davet_emailleri: tender.davet_emailleri || [], davetli_firmalar: tender.davetli_firmalar || [], ek_dosyalar: Array.isArray(tender.ek_dosyalar) ? tender.ek_dosyalar.filter(f => f && f.name) : [], anonim: tender.anonim === true };
        // Enes Doğanay | 12 Mayıs 2026: Snapshot kaydet
        originalFormRef.current = JSON.parse(JSON.stringify(editForm));
        setCreateForm(editForm);
        setShowCreateModal(true);
    }, [companyId, resetFormState]);

    const openRepeatModal = useCallback(async (tender) => {
        const result = await ihaleService.generateRefNo(companyId).catch(() => ({ refNo: `TED-${Date.now()}`, isVerified: false }));
        const todayStr = new Date().toISOString().split('T')[0];
        const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        setEditTenderId(null);
        setCreateForm({ ...CREATE_EMPTY_FORM, baslik: tender.baslik || '', aciklama: tender.aciklama || '', ihale_tipi: tender.ihale_tipi || 'Açık İhale', kdv_durumu: tender.kdv_durumu || 'haric', yayin_tarihi: todayStr, son_basvuru_tarihi: thirtyDays, teslim_suresi: tender.teslim_suresi ? String(tender.teslim_suresi) : '', teslim_il: tender.teslim_il || '', teslim_ilce: tender.teslim_ilce || '', referans_no: resetFormState(result.refNo, result.isVerified), gereksinimler: tender.gereksinimler || [], davet_emailleri: tender.davet_emailleri || [], davetli_firmalar: tender.davetli_firmalar || [] });
        setShowCreateModal(true);
    }, [companyId, resetFormState]);

    // Enes Doğanay | 11 Mayıs 2026: Şablon hook — fetch, save, delete, modal state
    const templateHook = useIhaleTemplates({ companyId });

    // Enes Doğanay | 11 Mayıs 2026: Şablonu forma uygula → step 0'a dön
    const applyTemplate = useCallback((template) => {
        setCreateForm(prev => ({
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
        setStepperState(p => ({ ...p, step: 0, error: '' }));
    }, []);

    // Enes Doğanay | 7 Mayıs 2026: IhaleFormModal flat adapter'lar
    const showModal = showCreateModal;
    const editingTender = editTenderId ? { id: editTenderId } : null;
    const form = createForm; const setForm = setCreateForm;
    const formSaving = stepperState.saving; const formError = stepperState.error;
    const setFormError = (err) => setStepperState(p => ({ ...p, error: err }));
    const stepperStep = stepperState.step;
    const setStepperStep = (valOrFn) => setStepperState(p => ({ ...p, step: typeof valOrFn === 'function' ? valOrFn(p.step) : valOrFn, error: '' }));
    const yeniGereksinimMadde = createReqState.madde; const setYeniGereksinimMadde = (val) => setCreateReqState(p => ({ ...p, madde: val }));
    const yeniGereksinimAciklama = createReqState.aciklama; const setYeniGereksinimAciklama = (val) => setCreateReqState(p => ({ ...p, aciklama: val }));
    // Enes Doğanay | 9 Mayıs 2026: Adet adapter
    const yeniGereksinimAdet = createReqState.adet; const setYeniGereksinimAdet = (val) => setCreateReqState(p => ({ ...p, adet: val }));
    // Enes Doğanay | 14 Mayıs 2026: Birim adapter
    const yeniGereksinimBirim = createReqState.birim; const setYeniGereksinimBirim = (val) => setCreateReqState(p => ({ ...p, birim: val }));
    const emailInput = emailState.input; const emailStatus = emailState.status;
    const firmaSearchTerm = firmaState.term; const firmaSearchResults = firmaState.results; const firmaSearching = firmaState.searching;
    const fileInputRef = createFileInputRef; const firmaResultsRef = createFirmaResultsRef;
    const isVerifiedUser = publishState.verifiedUser;
    const refNoCopied = publishState.refNoCopied; const setRefNoCopied = (val) => setPublishState(p => ({ ...p, refNoCopied: val }));
    const handleFormSubmit = (_e, forceDurum) => handlers.handleCreateFormSubmit(forceDurum);
    // Enes Doğanay | 12 Mayıs 2026: Dirty tracking — taslak düzenleme ve yeni form her zaman aktif
    // eslint-disable-next-line react-hooks/refs
    const isFormDirty = !editTenderId || !originalFormRef.current || createForm.durum === 'draft'
        ? true
        // eslint-disable-next-line react-hooks/refs
        : JSON.stringify(createForm) !== JSON.stringify(originalFormRef.current);

    return {
        showCreateModal, setShowCreateModal, editTenderId,
        createForm, stepperState, publishState, setPublishState,
        openCreateModal, openEditInCreateModal, openRepeatModal,
        showModal, editingTender, form, setForm,
        formSaving, formError, setFormError, stepperStep, setStepperStep,
        yeniGereksinimMadde, setYeniGereksinimMadde, yeniGereksinimAciklama, setYeniGereksinimAciklama, yeniGereksinimAdet, setYeniGereksinimAdet, yeniGereksinimBirim, setYeniGereksinimBirim,
        emailInput, emailStatus, firmaSearchTerm, firmaSearchResults, firmaSearching,
        fileInputRef, firmaResultsRef, isVerifiedUser, refNoCopied, setRefNoCopied,
        handleFormSubmit,
        isFormDirty,
        templateHook, applyTemplate,
        ...handlers,
    };
};

export default useIhaleCreate;
