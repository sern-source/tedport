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
    /* Enes Doğanay | 13 Nisan 2026: İhale teklif bildirimleri için ihale-yönetimi sekmesine yönlendir */
    const tenderOfferTypes = ['tender_new_offer', 'tender_offer_updated', 'tender_offer_withdrawn'];
    const tenderStatusTypes = ['tender_updated', 'tender_closed', 'tender_cancelled'];
    if (tenderOfferTypes.includes(toast.type) && toast.metadata?.ihale_id) {
      const params = new URLSearchParams({ tab: 'ihale-yonetimi', ihale: toast.metadata.ihale_id });
      if (toast.metadata?.teklif_user_id) params.set('teklif_user', toast.metadata.teklif_user_id);
      navigate(`/firma-profil?${params.toString()}`);
    } else if (tenderStatusTypes.includes(toast.type) && toast.metadata?.ihale_id) {
      navigate(`/ihaleler?ihale=${toast.metadata.ihale_id}`);
    } else if (toast.type === 'tender_offer_status') {
      /* Enes Doğanay | 13 Nisan 2026: Teklif durumu toast — İhale Yönetimi > Katıldığım İhaleler */
      if (toast.metadata?.ihale_id) {
        sessionStorage.setItem('mop_highlight_ihale', String(toast.metadata.ihale_id));
      }
      navigate(managedCompanyId ? '/firma-profil?tab=ihale-yonetimi&subtab=katildigim' : '/profile?tab=my-offers');
    } else if (toast.metadata?.teklif_id) {
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
