// Enes Doğanay | 7 Mayıs 2026: Teklif form supabase işlemleri — service katmanı
import { supabase } from '../../../supabaseClient';
import { ALLOWED_EK_DOSYA_UZANTILARI, ALLOWED_EK_DOSYA_HATA } from '../../../constants/fileUpload';

// Enes Doğanay | 8 Mayıs 2026: Mevcut auth oturumunu döndür — hook'larda doğrudan supabase çağırılmasını engeller
export const getAuthSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// Enes Doğanay | 8 Mayıs 2026: Giriş yapmış kullanıcının tekliflerini ihale_id haritaşı olarak döndür
export const fetchCurrentUserOffersMap = async () => {
    const session = await getAuthSession();
    if (!session?.user) return {};
    const data = await fetchUserOffers(session.user.id);
    const map = {};
    data.forEach(o => { map[String(o.ihale_id)] = o; });
    return map;
};

// Enes Doğanay | 7 Mayıs 2026: Giriş yapmış kullanıcının tüm tekliflerini çek
export const fetchUserOffers = async (userId) => {
    const { data, error } = await supabase
        .from('ihale_teklifleri')
        .select('id, ihale_id, toplam_tutar, para_birimi, kdv_dahil, teslim_suresi_gun, teslim_aciklamasi, not_field, kalemler, ek_dosya_url, ek_dosya_adi, durum, created_at')
        .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return data || [];
};

// Enes Doğanay | 7 Mayıs 2026: Firma iletişim bilgilerini çek
export const fetchFirmaContactInfo = async (tender) => {
    const info = { name: null, firma: tender.firma_adi || null, email: null, phone: null, firmaPhone: null, firmaEmail: null };
    if (!tender.firma_id) return info;
    const { data: firma } = await supabase.from('firmalar').select('firma_adi, telefon, eposta').eq('firmaID', tender.firma_id).maybeSingle();
    if (firma) {
        info.firma = firma.firma_adi || info.firma;
        if (firma.telefon) info.firmaPhone = firma.telefon;
        if (firma.eposta) info.firmaEmail = firma.eposta;
    }
    const { data: mgr } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', tender.firma_id).maybeSingle();
    if (mgr?.user_id) {
        const { data: prof } = await supabase.from('profiles').select('first_name, last_name, phone, email').eq('id', mgr.user_id).maybeSingle();
        if (prof) {
            info.name = [prof.first_name, prof.last_name].filter(Boolean).join(' ') || null;
            if (prof.email) info.email = prof.email;
            if (prof.phone) info.phone = prof.phone;
        }
    }
    return info;
};

// Enes Doğanay | 7 Mayıs 2026: Teklif dosyasını storage'a yükle, path döndür
export const uploadTeklifDosya = async (userId, dosya) => {
    const ext = dosya.name.split('.').pop()?.toLowerCase() || '';
    // Enes Doğanay | 16 Mayıs 2026: Servis katmanı tip doğrulamasyı — accept attr. kolayca atlatılır
    if (!ALLOWED_EK_DOSYA_UZANTILARI.has(ext)) throw new Error(ALLOWED_EK_DOSYA_HATA);
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(path, dosya);
    if (uploadErr) throw new Error('Dosya yüklenemedi: ' + uploadErr.message);
    return { path, name: dosya.name };
};

const DB_ALLOWED = ['TRY', 'USD', 'EUR', 'GBP'];

// Enes Doğanay | 7 Mayıs 2026: Teklif gönder/güncelle — insert veya update
export const submitTeklif = async ({ session, teklifForm, teklifTender, existingOffer, authManagedCompanyId, managedCompanyName, userProfile, dosyaPath, dosyaAdi, getTeklifGenelToplam, isDraft }) => {
    const toplam = getTeklifGenelToplam();
    const userName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || session.user.email;
    const isUpdate = !!existingOffer;
    const effectiveParaBirimi = teklifForm.kalemler.length > 0 ? (teklifForm.kalemler[0]?.para_birimi || 'TRY') : teklifForm.para_birimi;
    const safeParaBirimi = DB_ALLOWED.includes(effectiveParaBirimi) ? effectiveParaBirimi : 'TRY';

    const payload = {
        kalemler: teklifForm.kalemler.length > 0 ? teklifForm.kalemler : null,
        toplam_tutar: toplam,
        para_birimi: safeParaBirimi,
        kdv_dahil: teklifForm.kdv_dahil,
        teslim_suresi_gun: parseInt(teklifForm.teslim_suresi_gun, 10) || null,
        teslim_aciklamasi: teklifForm.teslim_aciklamasi || null,
        not_field: teklifForm.not || null,
        durum: isDraft ? 'taslak' : 'gonderildi',
        ...(dosyaPath ? { ek_dosya_url: dosyaPath, ek_dosya_adi: dosyaAdi } : {}),
    };

    if (isUpdate) {
        // Enes Doğanay | 9 Mayıs 2026: Revize öncesi mevcut değerleri geçmiş tablosuna kaydet
        if (!isDraft && existingOffer.durum !== 'taslak') {
            const newRevizeNo = (existingOffer.revize_sayisi || 0) + 1;
            await supabase.from('ihale_teklif_gecmisi').insert({
                teklif_id: existingOffer.id,
                revize_no: newRevizeNo,
                kalemler: existingOffer.kalemler || null,
                toplam_tutar: existingOffer.toplam_tutar,
                para_birimi: existingOffer.para_birimi || 'TRY',
                kdv_dahil: existingOffer.kdv_dahil,
                teslim_suresi_gun: existingOffer.teslim_suresi_gun || null,
                teslim_aciklamasi: existingOffer.teslim_aciklamasi || null,
                not_field: existingOffer.not_field || null,
                ek_dosya_url: existingOffer.ek_dosya_url || null,
                ek_dosya_adi: existingOffer.ek_dosya_adi || null,
                olusturulma_tarihi: existingOffer.updated_at || existingOffer.created_at,
            });
            payload.revize_sayisi = newRevizeNo;
        }
        const { data: updatedRows, error: updateErr } = await supabase
            .from('ihale_teklifleri')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', existingOffer.id)
            .select();
        if (updateErr) throw updateErr;
        if (!updatedRows || updatedRows.length === 0) throw new Error('Teklif güncellenemedi. Yetki hatası olabilir.');
        return updatedRows[0];
    }

    const { data: insertedRows, error: insertErr } = await supabase.from('ihale_teklifleri').insert({
        ihale_id: teklifTender.id,
        firma_id: teklifTender.firma_id,
        user_id: session.user.id,
        gonderen_firma_id: authManagedCompanyId || null,
        gonderen_firma_adi: managedCompanyName || null,
        gonderen_ad_soyad: userName,
        gonderen_email: session.user.email,
        ...payload,
        ek_dosya_url: dosyaPath || null,
        ek_dosya_adi: dosyaAdi || null,
    }).select();
    if (insertErr) throw insertErr;
    return insertedRows?.[0] || null;
};

// Enes Doğanay | 7 Mayıs 2026: Firma yöneticilerine bildirim gönder
export const sendTeklifNotification = async ({ teklifTender, session, existingOffer, isDraft, isUpdate }) => {
    if (isDraft || !teklifTender?.firma_id) return;
    const isDraftToSubmit = isUpdate && existingOffer?.durum === 'taslak';
    const { data: managers } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', String(teklifTender.firma_id));
    if (!managers?.length) return;
    const isRealUpdate = isUpdate && !isDraftToSubmit;
    const notifTitle = isRealUpdate ? 'Teklif güncellendi' : 'Yeni teklif geldi!';
    const notifMessage = isRealUpdate
        ? `"${teklifTender.baslik || 'İhale'}" ihalenize gelen bir teklifte güncelleme yapıldı.`
        : `"${teklifTender.baslik || 'İhale'}" ihalenize yeni bir teklif gönderildi.`;
    const notifRows = managers.map(m => ({
        user_id: m.user_id,
        type: isRealUpdate ? 'tender_offer_updated' : 'tender_new_offer',
        title: notifTitle,
        message: notifMessage,
        firma_id: String(teklifTender.firma_id),
        is_read: false,
        metadata: { ihale_id: teklifTender.id, ihale_baslik: teklifTender.baslik, teklif_id: existingOffer?.id || null, teklif_user_id: session.user.id },
    }));
    supabase.from('bildirimler').insert(notifRows).then(() => {});
};

// Enes Doğanay | 7 Mayıs 2026: Taslak teklifi sil
export const deleteDraftTeklif = async (offerId) => {
    const { error } = await supabase.from('ihale_teklifleri').delete().eq('id', offerId);
    if (error) throw new Error(error.message);
};

// Enes Doğanay | 7 Mayıs 2026: Teklifi geri çek + bildirim gönder
export const withdrawTeklif = async ({ offerId, teklifTender, userProfile }) => {
    const { error: delErr } = await supabase.from('ihale_teklifleri').delete().eq('id', offerId);
    if (delErr) throw new Error(delErr.message);
    if (!teklifTender.firma_id) return;
    const { data: managers } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', String(teklifTender.firma_id));
    if (!managers?.length) return;
    const { data: { session } } = await supabase.auth.getSession();
    const userName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || session?.user?.email || '';
    const notifRows = managers.map(m => ({
        user_id: m.user_id,
        type: 'tender_offer_withdrawn',
        title: 'Teklif geri çekildi',
        message: `"${teklifTender.baslik || 'İhale'}" ihalenize verilen bir teklif geri çekildi. (${userName})`,
        firma_id: String(teklifTender.firma_id),
        is_read: false,
        metadata: { ihale_id: teklifTender.id, ihale_baslik: teklifTender.baslik },
    }));
    supabase.from('bildirimler').insert(notifRows).then(() => {});
};
