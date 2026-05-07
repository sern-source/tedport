// Enes Doğanay | 6 Mayıs 2026: Firmalar sayfası — tüm Supabase sorguları
import { supabase } from '../../../supabaseClient';
import { getManagedCompanyId } from '../../../services/companyManagementApi';
import { expandSearchTerms } from '../../../constants/synonyms';
import { sanitizeSearch, ISTANBUL_AVRUPA, ISTANBUL_ANADOLU } from '../utils/firmaUtils';

const PAGE_SIZE = 10;

/* ── Yardımcı sorgu oluşturucular ──────────────────────────────────────── */
const buildSearchQuery = (query, search) => {
  const trimmed = search?.trim() || '';
  if (trimmed.length < 2) return query;
  const safe = sanitizeSearch(trimmed);
  if (safe.length < 2) return query;
  const orParts = expandSearchTerms(safe).flatMap(term => [
    `firma_adi.ilike."%${term}%"`,
    `description.ilike."%${term}%"`,
    `ana_sektor.ilike."%${term}%"`,
    `urun_kategorileri.ilike."%${term}%"`,
    `arama_etiketleri.ilike."%${term}%"`,
  ]);
  return query.or(orParts.join(','));
};

const buildFilterQuery = (query, filters) => {
  if (filters.cities?.length > 0) {
    const parts = filters.cities.flatMap(city => {
      if (city === 'İstanbul (Avrupa)') return ISTANBUL_AVRUPA.map(d => `il_ilce.ilike."%${sanitizeSearch(d)}%"`);
      if (city === 'İstanbul (Anadolu)') return ISTANBUL_ANADOLU.map(d => `il_ilce.ilike."%${sanitizeSearch(d)}%"`);
      return [`il_ilce.ilike."%${sanitizeSearch(city)}%"`];
    });
    query = query.or(parts.join(','));
  }
  if (filters.sectors?.length > 0)
    query = query.or(filters.sectors.map(s => `ana_sektor.ilike."%${sanitizeSearch(s)}%"`).join(','));
  if (filters.categories?.length > 0)
    query = query.or(filters.categories.map(c => `category_name.ilike."%${sanitizeSearch(c)}%"`).join(','));
  return query;
};

const applySorting = (query, sortMode) => {
  if (sortMode === 'a-z') return query.order('firma_adi', { ascending: true });
  if (sortMode === 'z-a') return query.order('firma_adi', { ascending: false });
  return query
    .order('has_logo', { ascending: false, nullsFirst: false })
    .order('onayli_hesap', { ascending: false, nullsFirst: false })
    .order('best', { ascending: false })
    .order('firmaID', { ascending: true });
};

/* ── Dışa aktarılan servis fonksiyonları ───────────────────────────────── */
export const fetchCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const fetchSidebarData = async () => {
  const [{ data: cityData, error: ce }, { data: catData, error: cae }] = await Promise.all([
    supabase.from('sehirler').select('sehir').order('sehir', { ascending: true }),
    supabase.from('firmalar').select('category_name'),
  ]);
  if (ce) throw new Error(ce.message);
  if (cae) throw new Error(cae.message);
  return { cityData, categoryData: catData };
};

export const fetchFirmalar = async ({ page, search, filters, sortMode }) => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase.from('firmalar').select(
    'firmaID, firma_adi, il_ilce, description, ana_sektor, urun_kategorileri, logo_url, category_name, best, telefon, eposta, web_sitesi, adres, onayli_hesap',
    { count: 'exact' }
  );
  query = buildSearchQuery(query, search);
  query = buildFilterQuery(query, filters);
  query = applySorting(query, sortMode);
  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { data, count };
};

export const fetchFavorites = async (userId) => {
  const { data, error } = await supabase.from('kullanici_favorileri').select('firma_id').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data;
};

export const toggleFavorite = async (userId, firmaId, isFav) => {
  if (isFav) {
    const { error } = await supabase.from('kullanici_favorileri').delete().eq('user_id', userId).eq('firma_id', firmaId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('kullanici_favorileri').insert([{ user_id: userId, firma_id: firmaId }]);
    if (error) throw new Error(error.message);
  }
};

export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return data;
};

export const uploadQuoteFile = async (userId, file) => {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('teklif-ekleri').upload(filePath, file);
  if (error) throw new Error(error.message);
  return { url: filePath, name: file.name };
};

export const fetchSenderFirmaAdi = async (managedId) => {
  const { data, error } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', managedId).single();
  if (error) throw new Error(error.message);
  return data?.firma_adi || '';
};

export const sendQuoteRequest = async ({ supplier, form, file, userId, userProfile }) => {
  let senderFirmaId = null;
  let senderFirmaAdi = '';
  const managedId = await getManagedCompanyId();
  if (managedId) {
    senderFirmaId = managedId;
    senderFirmaAdi = await fetchSenderFirmaAdi(managedId);
  }
  let ekDosyaUrl = null;
  let ekDosyaAdi = null;
  if (file) {
    const uploaded = await uploadQuoteFile(userId, file);
    ekDosyaUrl = uploaded.url;
    ekDosyaAdi = uploaded.name;
  }
  const { error } = await supabase.from('teklif_talepleri').insert([{
    firma_id: String(supplier.id),
    user_id: userId,
    gonderen_firma_id: senderFirmaId,
    ad_soyad: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim(),
    email: userProfile?.email || '',
    telefon: '',
    firma_adi: senderFirmaAdi,
    konu: form.konu.trim(),
    mesaj: form.mesaj.trim(),
    miktar: form.miktar?.trim() || null,
    teslim_tarihi: form.teslim_tarihi || null,
    teslim_yeri: form.teslim_yeri || null,
    ek_dosya_url: ekDosyaUrl,
    ek_dosya_adi: ekDosyaAdi,
  }]);
  if (error) throw new Error(error.message);
};
