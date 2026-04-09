{/* Enes Doğanay | 8 Nisan 2026: AuthContext'ten toast verilerini alıp ToastNotification bileşenini render eden wrapper */}
{/* Enes Doğanay | 9 Nisan 2026: Toast tıklandığında ilgili sayfaya yönlendirme + okundu işaretleme */}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import ToastNotification from './ToastNotification';

const ToastWrapper = () => {
  const { toasts, dismissToast, managedCompanyId, refreshCounts } = useAuth();
  const navigate = useNavigate();

  const handleClickToast = async (toast) => {
    // Enes Doğanay | 9 Nisan 2026: Toast bildirimi okundu olarak işaretle
    if (toast.id) {
      await supabase.from('bildirimler').update({ is_read: true }).eq('id', toast.id);
      refreshCounts();
    }
    if (toast.metadata?.teklif_id) {
      // Enes Doğanay | 9 Nisan 2026: Teklif bildirimi — teklif_id ile direkt ilgili chat'e yönlendir
      const teklifId = toast.metadata.teklif_id;
      if (managedCompanyId) {
        navigate(`/firma-profil?tab=teklifler&teklif_id=${teklifId}`);
      } else {
        navigate(`/profile?tab=quotes&teklif_id=${teklifId}`);
      }
    } else if (toast.firma_id) {
      navigate(`/firmadetay/${toast.firma_id}`);
    }
  };

  return <ToastNotification toasts={toasts} onDismiss={dismissToast} onClickToast={handleClickToast} />;
};

export default ToastWrapper;
