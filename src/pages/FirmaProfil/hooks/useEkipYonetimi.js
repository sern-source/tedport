// Enes Doğanay | 6 Mayıs 2026: Ekip yönetimi state + handler'lar
import { useState, useCallback } from 'react';
import {
  fetchEkip,
  sendDavet,
  cancelDavet,
  removeEkipMember,
  updateMemberRole,
  toggleMemberVisibility,
  toggleMemberEmailVisibility,
  updateMemberPermissions,
} from '../services/ekipService';

/* Enes Doğanay | 6 Mayıs 2026: Ekip CRUD state ve handler'ları */
export const useEkipYonetimi = ({ companyId, userId, firmaAdi, showFpToast }) => {
  const [ekip, setEkip] = useState([]);
  const [ekipLoading, setEkipLoading] = useState(false);
  const [bekleyenDavetler, setBekleyenDavetler] = useState([]);
  const [davetEmail, setDavetEmail] = useState('');
  const [davetRole, setDavetRole] = useState('member');
  const [davetTitle, setDavetTitle] = useState('');
  const [davetSending, setDavetSending] = useState(false);
  const [davetError, setDavetError] = useState(null);
  const [davetSuccess, setDavetSuccess] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const handleLoadEkip = useCallback(async () => {
    if (!companyId) return;
    setEkipLoading(true);
    try {
      const { ekip: ekipList, bekleyenDavetler: davetler } = await fetchEkip(companyId);
      setEkip(ekipList);
      setBekleyenDavetler(davetler);
    } catch {
      showFpToast('error', 'Ekip yüklenemedi.');
    } finally {
      setEkipLoading(false);
    }
  }, [companyId, showFpToast]);

  const handleDavetGonder = useCallback(async () => {
    setDavetError(null);
    if (!davetEmail.trim()) {
      setDavetError('E-posta adresi girin.');
      return;
    }
    setDavetSending(true);
    try {
      await sendDavet({ companyId, userId, firmaAdi, email: davetEmail, role: davetRole, title: davetTitle });
      setDavetSuccess(true);
      setDavetEmail('');
      setDavetTitle('');
      setDavetRole('member');
      setTimeout(() => setDavetSuccess(false), 3000);
      handleLoadEkip();
    } catch (e) {
      setDavetError(e.message || 'Davet gönderilemedi.');
    } finally {
      setDavetSending(false);
    }
  }, [davetEmail, davetRole, davetTitle, companyId, userId, firmaAdi, handleLoadEkip]);

  const handleDavetIptal = useCallback(
    async (davetId) => {
      try {
        await cancelDavet(davetId);
        handleLoadEkip();
      } catch (err) {
        showFpToast('error', err.message || 'Davet iptal edilemedi.');
      }
    },
    [handleLoadEkip, showFpToast]
  );

  const handleUyeCikar = useCallback(
    async (targetUserId) => {
      try {
        await removeEkipMember(targetUserId, companyId);
        setConfirmRemoveMember(null);
        handleLoadEkip();
      } catch (err) {
        showFpToast('error', err.message || 'Üye çıkarılamadı.');
      }
    },
    [companyId, handleLoadEkip, showFpToast]
  );

  const handleRolGuncelle = useCallback(
    async (targetUserId, newRole, newTitle) => {
      try {
        await updateMemberRole(targetUserId, companyId, newRole, newTitle);
        setEditingMember(null);
        handleLoadEkip();
      } catch (err) {
        showFpToast('error', err.message || 'Rol güncellenemedi.');
      }
    },
    [companyId, handleLoadEkip, showFpToast]
  );

  const handleVisibilityToggle = useCallback(
    async (targetUserId, currentValue) => {
      const newValue = !currentValue;
      try {
        await toggleMemberVisibility(targetUserId, companyId, newValue);
        setEkip((prev) => prev.map((m) => (m.user_id === targetUserId ? { ...m, is_public: newValue } : m)));
      } catch {
        showFpToast('error', 'Görünürlük güncellenemedi.');
      }
    },
    [companyId, showFpToast]
  );

  // Enes Doğanay | 9 Mayıs 2026: E-posta görünürlük toggle
  const handleEmailVisibilityToggle = useCallback(
    async (targetUserId, currentValue) => {
      const newValue = !currentValue;
      try {
        await toggleMemberEmailVisibility(targetUserId, companyId, newValue);
        setEkip((prev) => prev.map((m) => (m.user_id === targetUserId ? { ...m, show_email: newValue } : m)));
      } catch {
        showFpToast('error', 'E-posta görünürlüğü güncellenemedi.');
      }
    },
    [companyId, showFpToast]
  );

  const handlePermissionsUpdate = useCallback(
    async (targetUserId, key, value) => {
      const member = ekip.find((m) => m.user_id === targetUserId);
      if (!member) return;
      const newPerms = { ...member.page_permissions, [key]: value };
      try {
        await updateMemberPermissions(targetUserId, companyId, newPerms);
        setEkip((prev) =>
          prev.map((m) => (m.user_id === targetUserId ? { ...m, page_permissions: newPerms } : m))
        );
      } catch {
        showFpToast('error', 'İzin güncellenemedi.');
      }
    },
    [ekip, companyId, showFpToast]
  );

  return {
    ekip,
    ekipLoading,
    bekleyenDavetler,
    davetEmail,
    setDavetEmail,
    davetRole,
    setDavetRole,
    davetTitle,
    setDavetTitle,
    davetSending,
    davetError,
    davetSuccess,
    confirmRemoveMember,
    setConfirmRemoveMember,
    editingMember,
    setEditingMember,
    handleLoadEkip,
    handleDavetGonder,
    handleDavetIptal,
    handleUyeCikar,
    handleRolGuncelle,
    handleVisibilityToggle,
    handleEmailVisibilityToggle,
    handlePermissionsUpdate,
  };
};
