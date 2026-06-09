// Enes Doğanay | 12 Mayıs 2026: Sertifika yükleme bölümü hook — firma paneli
import { useEffect, useRef, useState } from 'react';
import {
    fetchFirmaSertifikalari,
    fetchFirmaPendingSertifikaTalepleri,
    submitSertifikaTalebi,
    deleteFirmaSertifikasi,
} from '../services/sertifikaService';

const EMPTY_FORM = { selectedTur: '', digerTur: '', file: null };

export const useCertificateSection = ({ companyId, firmaAdi }) => {
    const [approved, setApproved] = useState([]);
    const [talepleri, setTalepleri] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [turDropOpen, setTurDropOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', msg: '' });
    // Enes Doğanay | 9 Haziran 2026: Sertifika silme — inline onay için bekleyen id
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    // Enes Doğanay | 9 Haziran 2026: Silme hatası — form feedback'inden bağımsız gösterilir
    const [deleteError, setDeleteError] = useState('');
    const turDropRef = useRef(null);

    // Enes Doğanay | 12 Mayıs 2026: Dışarı tıkla dropdown kapansın
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (turDropRef.current && !turDropRef.current.contains(e.target)) {
                setTurDropOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Enes Doğanay | 12 Mayıs 2026: Firma değişince sertifika verilerini çek
    useEffect(() => {
        if (!companyId) return;
        setLoading(true);
        Promise.all([
            fetchFirmaSertifikalari(companyId).catch(() => []),
            fetchFirmaPendingSertifikaTalepleri(companyId).catch(() => []),
        ]).then(([approvedData, talep]) => {
            setApproved(approvedData);
            // Enes Doğanay | 9 Haziran 2026: Onaylananlar badge'de gösteriliyor — listede gereksiz
            setTalepleri(talep.filter(t => t.durum !== 'onaylandi'));
        }).finally(() => setLoading(false));
    }, [companyId]);

    // Enes Doğanay | 12 Mayıs 2026: Dropdown seçimi
    const handleTurSelect = (value) => {
        setForm(p => ({ ...p, selectedTur: value, digerTur: '' }));
        setTurDropOpen(false);
    };

    // Enes Doğanay | 12 Mayıs 2026: Dosya seçimi
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setForm(p => ({ ...p, file }));
    };

    // Enes Doğanay | 9 Haziran 2026: Onaylı sertifikayı kaldır
    const handleDeleteSertifika = async (sertifikaId) => {
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteFirmaSertifikasi(sertifikaId);
            setApproved(prev => prev.filter(s => s.id !== sertifikaId));
            setConfirmDeleteId(null);
        } catch (err) {
            setDeleteError(err.message);
            setConfirmDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    // Enes Doğanay | 12 Mayıs 2026: Sertifika talebi gönder
    const handleCertSubmit = async () => {
        if (!form.selectedTur) return;
        if (!form.file) { setFeedback({ type: 'err', msg: 'Lütfen sertifika belgesini yükleyin.' }); return; }
        setSending(true);
        setFeedback({ type: '', msg: '' });
        try {
            await submitSertifikaTalebi({
                firmaId: companyId,
                firmaAdi,
                sertifikaTuru: form.selectedTur,
                sertifikaTuruDiger: form.selectedTur === 'Diger' ? form.digerTur : null,
                file: form.file,
            });
            setForm(EMPTY_FORM);
            setFeedback({ type: 'ok', msg: 'Talebiniz alındı. Admin onayından sonra profilinizde görünecektir.' });
            const updated = await fetchFirmaPendingSertifikaTalepleri(companyId).catch(() => []);
            setTalepleri(updated.filter(t => t.durum !== 'onaylandi'));
        } catch (err) {
            setFeedback({ type: 'err', msg: err.message });
        } finally {
            setSending(false);
        }
    };

    return {
        approved,
        talepleri,
        loading,
        form,
        setForm,
        turDropOpen,
        setTurDropOpen,
        turDropRef,
        sending,
        feedback,
        confirmDeleteId,
        setConfirmDeleteId,
        deleting,
        deleteError,
        handleTurSelect,
        handleFileChange,
        handleCertSubmit,
        handleDeleteSertifika,
    };
};
