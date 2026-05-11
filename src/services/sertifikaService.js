// Enes Doğanay | 12 Mayıs 2026: Sertifika servis katmanı — tüm Supabase operasyonları
import { supabase } from '../supabaseClient';

// Enes Doğanay | 12 Mayıs 2026: Firma detay sayfası için onaylı sertifikaları çek
export async function fetchFirmaSertifikalari(firmaId) {
    const { data, error } = await supabase
        .from('firma_sertifikalari')
        .select('id, sertifika_turu, gecerlilik_tarihi, belge_url')
        .eq('firma_id', firmaId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

// Enes Doğanay | 12 Mayıs 2026: Admin paneli için tüm sertifika taleplerini çek
export async function fetchSertifikaTalepleri() {
    const { data, error } = await supabase
        .from('sertifika_talepleri')
        .select('id, firma_id, firma_adi, sertifika_turu, sertifika_turu_diger, belge_url, durum, admin_notu, gecerlilik_tarihi, created_at')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

// Enes Doğanay | 12 Mayıs 2026: Sertifika talebini onayla + firma_sertifikalari'na upsert et
export async function approveSertifikaTalebi(talepId, gecerlilikTarihi) {
    const { data: talep, error: talepErr } = await supabase
        .from('sertifika_talepleri')
        .update({
            durum: 'onaylandi',
            gecerlilik_tarihi: gecerlilikTarihi || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', talepId)
        .select('firma_id, sertifika_turu, belge_url')
        .single();
    if (talepErr) throw new Error(talepErr.message);

    const { error: sertErr } = await supabase
        .from('firma_sertifikalari')
        .upsert([{
            firma_id: talep.firma_id,
            talep_id: talepId,
            sertifika_turu: talep.sertifika_turu,
            gecerlilik_tarihi: gecerlilikTarihi || null,
            belge_url: talep.belge_url || null,
        }], { onConflict: 'firma_id,sertifika_turu' });
    if (sertErr) throw new Error(sertErr.message);

    return talep;
}

// Enes Doğanay | 12 Mayıs 2026: Sertifika talebini reddet
export async function rejectSertifikaTalebi(talepId, adminNotu) {
    const { error } = await supabase
        .from('sertifika_talepleri')
        .update({
            durum: 'reddedildi',
            admin_notu: adminNotu || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', talepId);
    if (error) throw new Error(error.message);
}

// Enes Doğanay | 12 Mayıs 2026: Firmanın bekleyen sertifika taleplerini getir
export async function fetchFirmaPendingSertifikaTalepleri(firmaId) {
    const { data, error } = await supabase
        .from('sertifika_talepleri')
        .select('id, sertifika_turu, sertifika_turu_diger, durum, admin_notu, created_at')
        .eq('firma_id', firmaId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

// Enes Doğanay | 12 Mayıs 2026: Belge dosyasını storage'a yükle (opsiyonel) — path döner
async function uploadSertifikaBelgesi(firmaId, file) {
    const ext = file.name.split('.').pop();
    const path = `${firmaId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
        .from('sertifika-belgeleri')
        .upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);
    return path;
}

// Enes Doğanay | 12 Mayıs 2026: Firma yeni sertifika talebi gönder
export async function submitSertifikaTalebi({ firmaId, firmaAdi, sertifikaTuru, sertifikaTuruDiger, file }) {
    let belgeUrl = null;
    if (file) belgeUrl = await uploadSertifikaBelgesi(firmaId, file);
    const { error } = await supabase.from('sertifika_talepleri').insert([{
        firma_id: firmaId,
        firma_adi: firmaAdi,
        sertifika_turu: sertifikaTuru,
        sertifika_turu_diger: sertifikaTuruDiger || null,
        belge_url: belgeUrl,
        durum: 'bekliyor',
    }]);
    if (error) throw new Error(error.message);
}
