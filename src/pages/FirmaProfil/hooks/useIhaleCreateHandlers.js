// Enes Doğanay | 7 Mayıs 2026: İhale oluşturma form handler'ları — gereksinim, email, firma, dosya, submit
import * as ihaleService from '../services/ihaleService';

// Enes Doğanay | 7 Mayıs 2026: Tüm form alan handler'ları ve submit — state dışarıdan gelir
export const useIhaleCreateHandlers = ({
    createForm, setCreateForm, emailState, setEmailState,
    setFirmaState, createReqState, setCreateReqState,
    setStepperState, createFileInputRef, createFirmaResultsRef,
    editTenderId, setEditTenderId, setShowCreateModal, reloadTenders, setPublishState,
}) => {
    const handleEmailInputChange = (e) => {
        const val = e.target.value;
        setEmailState({ input: val, status: null });
        const trimmed = val.trim().toLowerCase();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
        setEmailState({ input: val, status: 'checking' });
        setTimeout(async () => {
            try {
                const exists = await ihaleService.checkEmailInDb(trimmed);
                setEmailState({ input: val, status: exists ? 'valid' : 'not_found' });
            } catch { setEmailState({ input: val, status: null }); }
        }, 500);
    };

    const handleFirmaSearch = (val) => {
        setFirmaState(p => ({ ...p, term: val }));
        if (val.length < 2) { setFirmaState(p => ({ ...p, results: [] })); return; }
        setFirmaState(p => ({ ...p, searching: true }));
        setTimeout(async () => {
            const results = await ihaleService.searchFirmalar(val).catch(() => []);
            setFirmaState(p => ({ ...p, results, searching: false }));
            setTimeout(() => createFirmaResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
        }, 300);
    };

    const handleCreateFormSubmit = async (forceDurum) => {
        setStepperState(p => ({ ...p, saving: true, error: '' }));
        try {
            const pendingEmail = emailState.input.trim().toLowerCase();
            const finalEmails = (pendingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pendingEmail) && emailState.status === 'valid' && !createForm.davet_emailleri.includes(pendingEmail))
                ? [...createForm.davet_emailleri, pendingEmail] : createForm.davet_emailleri;
            // Enes Doğanay | 14 Mayıs 2026: Firma veya kişi (email) yeterli
            if (createForm.ihale_tipi === 'Davetli İhale' && createForm.davetli_firmalar.length === 0 && createForm.davet_emailleri.length === 0) { setStepperState(p => ({ ...p, saving: false, error: 'Davetli ihale için en az bir firma veya kişi eklemeniz gerekiyor.' })); return; }
            const onaysiz = createForm.davetli_firmalar.find(f => !f.onayli);
            if (onaysiz) { setStepperState(p => ({ ...p, saving: false, error: `"${onaysiz.firma_adi}" henüz onaylı bir firma değil.` })); return; }
            const uploadedFiles = [];
            for (const file of createForm.ek_dosyalar.filter(f => f instanceof File)) {
                const filePath = `${createForm.referans_no || 'temp'}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                uploadedFiles.push(await ihaleService.uploadIhaleFile(filePath, file));
            }
            const existingFiles = createForm.ek_dosyalar.filter(f => !(f instanceof File));
            const payload = { ...createForm, durum: forceDurum || createForm.durum, il_ilce: [createForm.teslim_il, createForm.teslim_ilce].filter(Boolean).join(' / '), ek_dosyalar: editTenderId ? [...existingFiles, ...uploadedFiles] : uploadedFiles, davet_emailleri: finalEmails };
            if (editTenderId) {
                // Enes Doğanay | 12 Mayıs 2026: setEditTenderId(null) öncesinde id'yi sakla
                const currentEditId = editTenderId;
                await ihaleService.updateTender(currentEditId, payload);
                setEditTenderId(null); setShowCreateModal(false); await reloadTenders();
                // Enes Doğanay | 12 Mayıs 2026: Taslak kayıt, taslak→yayın ve normal güncelleme ayrı mesajlar
                const savedDurum = forceDurum || createForm.durum;
                if (savedDurum === 'draft') {
                    setPublishState(p => ({ ...p, draftSaved: true }));
                } else if (createForm.durum === 'draft') {
                    setPublishState(p => ({ ...p, successId: currentEditId, linkCopied: false }));
                } else {
                    setPublishState(p => ({ ...p, editSaved: true }));
                }
            } else {
                const created = await ihaleService.createTender(payload);
                setShowCreateModal(false); await reloadTenders();
                if ((forceDurum || createForm.durum) !== 'draft' && created?.id) setPublishState(p => ({ ...p, successId: created.id, linkCopied: false }));
            }
        } catch (err) { setStepperState(p => ({ ...p, saving: false, error: err.message || 'Kaydedilemedi.' })); }
        finally { setStepperState(p => ({ ...p, saving: false })); }
    };

    const addGereksinim = () => {
        if (!createReqState.madde.trim()) return;
        // Enes Doğanay | 9 Mayıs 2026: Adet alanı eklendi
        // Enes Doğanay | 14 Mayıs 2026: Birim alanı eklendi
        const adet = Math.max(1, parseInt(createReqState.adet) || 1);
        const birim = createReqState.birim || 'Adet';
        setCreateForm(p => ({ ...p, gereksinimler: [...p.gereksinimler, { id: Date.now(), madde: createReqState.madde.trim(), aciklama: createReqState.aciklama.trim(), adet, birim }] }));
        setCreateReqState({ madde: '', aciklama: '', adet: '1', birim: 'Adet' });
    };
    const removeGereksinim = (id) => setCreateForm(p => ({ ...p, gereksinimler: p.gereksinimler.filter(g => g.id !== id) }));

    const addEmail = () => {
        const em = emailState.input.trim().toLowerCase();
        if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || emailState.status !== 'valid' || createForm.davet_emailleri.includes(em)) return;
        setCreateForm(p => ({ ...p, davet_emailleri: [...p.davet_emailleri, em] }));
        setEmailState({ input: '', status: null });
    };
    const removeEmail = (em) => setCreateForm(p => ({ ...p, davet_emailleri: p.davet_emailleri.filter(e => e !== em) }));
    const handleEmailKeyDown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); } };

    const addDavetliFirma = (firma) => {
        if (createForm.davetli_firmalar.some(f => f.firma_id === firma.firmaID)) return;
        setCreateForm(p => ({ ...p, davetli_firmalar: [...p.davetli_firmalar, { firma_id: firma.firmaID, firma_adi: firma.firma_adi, onayli: firma.onayli_hesap === true }] }));
        setFirmaState({ term: '', results: [], searching: false });
    };
    const removeDavetliFirma = (firmaId) => setCreateForm(p => ({ ...p, davetli_firmalar: p.davetli_firmalar.filter(f => f.firma_id !== firmaId) }));

    const handleFileAdd = (e) => {
        const valid = Array.from(e.target.files || []).filter(f => f.size <= 10 * 1024 * 1024);
        if (valid.length < (e.target.files?.length || 0)) setStepperState(p => ({ ...p, error: '10 MB üzeri dosyalar eklenmedi.' }));
        setCreateForm(p => ({ ...p, ek_dosyalar: [...p.ek_dosyalar, ...valid] }));
        if (createFileInputRef.current) createFileInputRef.current.value = '';
    };
    const removeFile = (idx) => setCreateForm(p => ({ ...p, ek_dosyalar: p.ek_dosyalar.filter((_, i) => i !== idx) }));

    return {
        handleCreateFormSubmit, handleEmailInputChange, handleFirmaSearch,
        addGereksinim, removeGereksinim, addEmail, removeEmail, handleEmailKeyDown,
        addDavetliFirma, removeDavetliFirma, handleFileAdd, removeFile,
    };
};
