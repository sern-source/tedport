// Enes Doğanay | 6 Mayıs 2026: Register servis fonksiyonları — tüm Supabase çağrıları burada
import { supabase } from '../../../supabaseClient';

// Enes Doğanay | 6 Mayıs 2026: E-posta müsaitlik kontrolü — auth.users + kurumsal_basvurular
export const checkEmailAvailability = async (email) => {
    const { data, error } = await supabase.rpc('check_email_availability', { p_email: email });
    if (error) return null;
    return data;
};

// Enes Doğanay | 6 Mayıs 2026: Firma adı ile arama — autocomplete için
export const searchFirmas = async (query) => {
    const { data, error } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, il_ilce, logo_url, adres, telefon, onayli_hesap')
        .ilike('firma_adi', `%${query.trim()}%`)
        .limit(8);
    if (error) throw new Error(error.message);
    return (data || []).map(f => ({ ...f, isManaged: f.onayli_hesap === true }));
};

// Enes Doğanay | 6 Mayıs 2026: Bireysel kayıt — auth.signUp
export const signUpUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data;
};

// Enes Doğanay | 6 Mayıs 2026: Profil fotoğrafı yükleme — avatars bucket
export const uploadAvatar = async (userId, file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
};

// Enes Doğanay | 6 Mayıs 2026: Profil kaydı oluşturma
export const insertProfile = async (profileData) => {
    const { error } = await supabase.from('profiles').insert([profileData]);
    if (error) throw new Error(error.message);
};

// Enes Doğanay | 6 Mayıs 2026: KVKK + pazarlama rızası kaydı — fire-and-forget
export const logConsentRecord = async (userId, { kvkkAccepted, marketingConsent }) => {
    try {
        let ip = null;
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const d = await res.json();
            ip = d.ip;
        } catch {}
        await supabase.from('consent_logs').insert([{
            user_id: userId,
            kvkk_accepted: kvkkAccepted,
            marketing_accepted: marketingConsent,
            consent_text_version: '1.0',
            signup_method: 'individual',
            ip_address: ip,
            user_agent: navigator.userAgent,
        }]);
    } catch {}
};

// Enes Doğanay | 6 Mayıs 2026: Yetkilendirme belgesi yükleme — tax-documents bucket
export const uploadAuthorizationDoc = async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `yetkilendirme-belgesi-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('tax-documents').upload(fileName, file);
    if (error) throw new Error('Yetkilendirme belgesi yüklenemedi: ' + error.message);
    return fileName;
};

// Enes Doğanay | 6 Mayıs 2026: OAuth (Google / LinkedIn) girişi
export const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) throw new Error(error.message);
};
