// Enes Doğanay | 11 Mayıs 2026: İhale şablonları hook — liste, kaydet, sil, modal state
import { useState, useEffect, useCallback } from 'react';
import * as ihaleTemplateService from '../services/ihaleTemplateService';

// Enes Doğanay | 11 Mayıs 2026: Şablon alanları — tarih/dosya/davet hariç
const TEMPLATE_FIELDS = ['baslik', 'aciklama', 'ihale_tipi', 'kdv_durumu', 'teslim_suresi', 'teslim_il', 'teslim_ilce', 'gereksinimler'];

const useIhaleTemplates = ({ companyId }) => {
    // Enes Doğanay | 11 Mayıs 2026: Liste + yükleme state
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Enes Doğanay | 11 Mayıs 2026: Modal state — 'select' | 'save'
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('select');

    // Enes Doğanay | 11 Mayıs 2026: Kaydetme state
    const [saveName, setSaveName] = useState('');
    const [saving, setSaving] = useState(false);

    // Enes Doğanay | 11 Mayıs 2026: Silme onay state
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Enes Doğanay | 11 Mayıs 2026: Kaydetme başarı state
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Enes Doğanay | 12 Mayıs 2026: Üstüne yazma onay state — aynı isimli şablon varsa
    const [overwriteConfirmId, setOverwriteConfirmId] = useState(null);

    const fetchTemplates = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const data = await ihaleTemplateService.fetchTemplates(companyId);
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    // Enes Doğanay | 11 Mayıs 2026: Şablon seçim modalını aç
    const openSelectModal = useCallback(() => {
        setModalMode('select');
        setError('');
        setDeleteConfirmId(null);
        setShowModal(true);
    }, []);

    // Enes Doğanay | 11 Mayıs 2026: Şablon kaydetme modalını aç
    const openSaveModal = useCallback(() => {
        setModalMode('save');
        setSaveName('');
        setError('');
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setDeleteConfirmId(null);
        setError('');
        setSaveSuccess(false);
    }, []);

    // Enes Doğanay | 11 Mayıs 2026: Mevcut formu şablon olarak kaydet
    const handleSaveTemplate = useCallback(async (form) => {
        if (!saveName.trim()) { setError('Şablon adı boş olamaz.'); return; }
        // Enes Doğanay | 12 Mayıs 2026: Aynı isimde şablon varsa onay iste
        const duplicate = templates.find(t => t.sablon_adi.trim().toLowerCase() === saveName.trim().toLowerCase());
        if (duplicate && overwriteConfirmId !== duplicate.id) {
            setOverwriteConfirmId(duplicate.id);
            return;
        }
        setSaving(true);
        setError('');
        setOverwriteConfirmId(null);
        try {
            const sablon = { sablon_adi: saveName.trim() };
            TEMPLATE_FIELDS.forEach(f => { sablon[f] = form[f] ?? (f === 'gereksinimler' ? [] : ''); });
            // Enes Doğanay | 12 Mayıs 2026: Üstüne yazma — eskiyi sil, yenisini kaydet
            if (overwriteConfirmId) {
                await ihaleTemplateService.deleteTemplate(overwriteConfirmId);
                setTemplates(prev => prev.filter(t => t.id !== overwriteConfirmId));
            }
            const saved = await ihaleTemplateService.saveTemplate(companyId, sablon);
            setTemplates(prev => [saved, ...prev.filter(t => t.id !== overwriteConfirmId)]);
            setSaveSuccess(true);
            // Enes Doğanay | 11 Mayıs 2026: Başarı mesajı 1.5s sonra modal'ı kapat
            setTimeout(() => { setShowModal(false); setSaveSuccess(false); }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [companyId, saveName, templates, overwriteConfirmId]);

    // Enes Doğanay | 11 Mayıs 2026: Şablonu sil
    const handleDeleteTemplate = useCallback(async (id) => {
        try {
            await ihaleTemplateService.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
            setDeleteConfirmId(null);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    return {
        templates,
        loading,
        error,
        showModal,
        modalMode,
        saveName,
        setSaveName,
        saving,
        saveSuccess,
        deleteConfirmId,
        setDeleteConfirmId,
        overwriteConfirmId,
        setOverwriteConfirmId,
        openSelectModal,
        openSaveModal,
        closeModal,
        handleSaveTemplate,
        handleDeleteTemplate,
    };
};

export default useIhaleTemplates;
