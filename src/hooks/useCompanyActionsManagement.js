// Enes Doğanay | 7 Mayıs 2026: Şirket paneli etiket + silme state ve handler'ları
import { useState } from 'react';
import { updateAdminTags, submitTagRequest } from '../services/companyManagementApi';

// Enes Doğanay | 7 Mayıs 2026: Etiket gönderme ve firma silme — bağımsız state grubu
export const useCompanyActionsManagement = ({ company, isAdmin, setSaveState, onDelete }) => {
    const [tagState, setTagState] = useState({ input: '', sending: false, feedback: { type: '', msg: '' }, pendingRequest: null, approvedTags: '' });
    const [deleteState, setDeleteState] = useState({ showConfirm: false, deleting: false });

    const handleTagSubmit = async () => {
        const tags = tagState.input.trim();
        if (!tags || !company?.firmaID) return;
        setTagState(p => ({ ...p, sending: true, feedback: { type: '', msg: '' } }));
        try {
            if (isAdmin) {
                await updateAdminTags(company.firmaID, tags);
                setTagState(p => ({ ...p, sending: false, input: '', approvedTags: tags, feedback: { type: 'ok', msg: 'Etiketler kaydedildi.' } }));
            } else {
                await submitTagRequest({ firmaId: company.firmaID, firmaAdi: company.firma_adi, tags });
                setTagState(p => ({ ...p, sending: false, input: '', pendingRequest: { etiketler: tags, durum: 'bekliyor', created_at: new Date().toISOString() }, feedback: { type: 'ok', msg: 'Etiket talebiniz alındı. Admin onayından sonra aktif olacaktır.' } }));
            }
        } catch (err) { setTagState(p => ({ ...p, sending: false, feedback: { type: 'err', msg: err.message || 'Kaydedilemedi.' } })); }
    };

    const handleDelete = async () => {
        setDeleteState({ showConfirm: false, deleting: true });
        try {
            await onDelete();
            setDeleteState({ showConfirm: false, deleting: false });
        } catch (err) {
            setSaveState(p => ({ ...p, feedback: { type: 'err', msg: err.message || 'Firma silinemedi.' } }));
            setDeleteState({ showConfirm: false, deleting: false });
        }
    };

    return { tagState, setTagState, deleteState, setDeleteState, handleTagSubmit, handleDelete };
};
