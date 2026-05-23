// Enes Doğanay | 6 Mayıs 2026: Firmalar sayfası — tüm Supabase sorguları
import { supabase } from '../../../supabaseClient';
import { getManagedCompanyId } from '../../../services/companyManagementApi';
import { expandSearchTerms, levenshtein } from '../../../constants/synonyms';
import { sanitizeSearch, ISTANBUL_AVRUPA, ISTANBUL_ANADOLU, getSektorKeywords } from '../utils/firmaUtils';
import { ALLOWED_EK_DOSYA_UZANTILARI, ALLOWED_EK_DOSYA_HATA } from '../../../constants/fileUpload';

const PAGE_SIZE = 10;

/* ── Yardımcı sorgu oluşturucular ──────────────────────────────────────── */
// Enes Doğanay | 11 Mayıs 2026: searchMode: 'all' | 'firma' | 'urun'
const buildSearchQuery = (query, search, searchMode = 'all') => {
  const trimmed = search?.trim() || '';
  if (trimmed.length < 2) return query;
  const safe = sanitizeSearch(trimmed);
  if (safe.length < 2) return query;
  const terms = expandSearchTerms(safe);
  let orParts;
  if (searchMode === 'firma') {
    orParts = terms.flatMap(term => [
      `firma_adi.ilike."%${term}%"`,
      `description.ilike."%${term}%"`,
      `ana_sektor.ilike."%${term}%"`,
    ]);
  } else if (searchMode === 'urun') {
    orParts = terms.flatMap(term => [
      `urun_kategorileri.ilike."%${term}%"`,
      `arama_etiketleri.ilike."%${term}%"`,
      `description.ilike."%${term}%"`,
      `category_name.ilike."%${term}%"`,
    ]);
  } else {
    orParts = terms.flatMap(term => [
      `firma_adi.ilike."%${term}%"`,
      `description.ilike."%${term}%"`,
      `ana_sektor.ilike."%${term}%"`,
      `urun_kategorileri.ilike."%${term}%"`,
      `arama_etiketleri.ilike."%${term}%"`,
    ]);
  }
  return query.or(orParts.join(','));
};

const buildFilterQuery = (query, filters) => {
  // Enes Doğanay | 19 Mayıs 2026: Demo firmalar her zaman hariç
  query = query.eq('is_demo', false);
  // Enes Doğanay | 12 Mayıs 2026: Onaylı firma quick-filter
  if (filters.onlyVerified) {
    query = query.eq('onayli_hesap', true);
  }
  if (filters.cities?.length > 0) {
    const parts = filters.cities.flatMap(city => {
      if (city === 'İstanbul (Avrupa)') return ISTANBUL_AVRUPA.map(d => `il_ilce.ilike."%${sanitizeSearch(d)}%"`);
      if (city === 'İstanbul (Anadolu)') return ISTANBUL_ANADOLU.map(d => `il_ilce.ilike."%${sanitizeSearch(d)}%"`);
      return [`il_ilce.ilike."%${sanitizeSearch(city)}%"`];
    });
    query = query.or(parts.join(','));
  }
  if (filters.sectors?.length > 0) {
    // Enes Doğanay | 11 Mayıs 2026: Her sektör → keyword listesi → ana_sektor + urun_kategorileri + arama_etiketleri OR araması
    // Spesifik kategori adları genellikle urun_kategorileri / arama_etiketleri'nde geçer
    const sectorParts = filters.sectors.flatMap(s => {
      const keywords = getSektorKeywords(s);
      return keywords.flatMap(k => [
        `ana_sektor.ilike."%${sanitizeSearch(k)}%"`,
        `urun_kategorileri.ilike."%${sanitizeSearch(k)}%"`,
        `arama_etiketleri.ilike."%${sanitizeSearch(k)}%"`,
      ]);
    });
    query = query.or(sectorParts.join(','));
  }
  // Enes Doğanay | 11 Mayıs 2026: Sektör gibi keyword bazlı OR araması — category_name + urun_kategorileri + arama_etiketleri
  if (filters.categories?.length > 0) {
    const catParts = filters.categories.flatMap(c => {
      const keywords = getSektorKeywords(c);
      return keywords.flatMap(k => [
        `category_name.ilike."%${sanitizeSearch(k)}%"`,
        `urun_kategorileri.ilike."%${sanitizeSearch(k)}%"`,
        `arama_etiketleri.ilike."%${sanitizeSearch(k)}%"`,
      ]);
    });
    query = query.or(catParts.join(','));
  }
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

// Enes Doğanay | 19 Mayıs 2026: Default sort → seeded RPC; a-z/z-a → PostgREST
const fetchFirmalarSeeded = async ({ page, search, filters, searchMode, sessionSeed }) => {
  const offset = (page - 1) * PAGE_SIZE;
  const trimmed = (search || '').trim();
  const safe = trimmed.length >= 2 ? sanitizeSearch(trimmed) : '';
  const searchTerms = safe.length >= 2 ? expandSearchTerms(safe) : [];
  const sectorKeywords = (filters.sectors || []).flatMap(s => getSektorKeywords(s)).map(sanitizeSearch);
  const categoryKeywords = (filters.categories || []).flatMap(c => getSektorKeywords(c)).map(sanitizeSearch);

  const { data, error } = await supabase.rpc('get_firmalar_seeded', {
    p_seed: sessionSeed,
    p_limit: PAGE_SIZE,
    p_offset: offset,
    p_search_terms: searchTerms,
    p_search_mode: searchMode || 'all',
    p_only_verified: filters.onlyVerified || false,
    p_cities: filters.cities || [],
    p_sector_keywords: sectorKeywords,
    p_category_keywords: categoryKeywords,
    p_istanbul_avrupa: ISTANBUL_AVRUPA,
    p_istanbul_anadolu: ISTANBUL_ANADOLU,
    // Enes Doğanay | 23 Mayıs 2026: Tam sektör adları — RPC'de ana_sektor eşleşme önceliği için
    p_sector_names: filters.sectors || [],
  });

  if (error) throw new Error(error.message);
  const count = Number(data?.[0]?.total_count ?? 0);
  const rows = (data || []).map(({ total_count, ...rest }) => rest);
  return { data: rows, count };
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

export const fetchFirmalar = async ({ page, search, filters, sortMode, searchMode = 'all', sessionSeed }) => {
  // Enes Doğanay | 19 Mayıs 2026: Default sort → tier-bazlı seed'li RPC; özel sort → PostgREST
  if (sortMode === 'default' && sessionSeed != null) {
    return fetchFirmalarSeeded({ page, search, filters, searchMode, sessionSeed });
  }
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  // Enes Doğanay | 23 Mayıs 2026: slug eklendi — kart navigasyonu slug URL kullanacak
  let query = supabase.from('firmalar').select(
    'firmaID, slug, firma_adi, il_ilce, description, ana_sektor, urun_kategorileri, logo_url, category_name, best, telefon, eposta, web_sitesi, adres, onayli_hesap, is_demo',
    { count: 'exact' }
  );
  // Enes Doğanay | 11 Mayıs 2026: searchMode'a göre farklı alanlar aranır
  query = buildSearchQuery(query, search, searchMode);
  query = buildFilterQuery(query, filters);
  query = applySorting(query, sortMode);
  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { data, count };
};

// Enes Doğanay | 11 Mayıs 2026: Firma modu 0 sonuç — DB firma adlarında Levenshtein öneri
export const fetchFirmaNameSuggestion = async (query) => {
  const safe = sanitizeSearch(query?.trim() || '');
  if (safe.length < 2) return null;
  const firstChar = safe.charAt(0);
  const { data, error } = await supabase
    .from('firmalar')
    .select('firma_adi')
    .ilike('firma_adi', `${firstChar}%`)
    .limit(150);
  if (error || !data?.length) return null;
  const lower = safe.toLocaleLowerCase('tr');
  const maxDist = Math.max(3, Math.floor(lower.length / 2));
  let best = null;
  let bestDist = Infinity;
  for (const row of data) {
    const name = (row.firma_adi || '').toLocaleLowerCase('tr');
    if (Math.abs(name.length - lower.length) > maxDist + 2) continue;
    const d = levenshtein(lower, name);
    if (d < bestDist && d <= maxDist && d > 0) {
      bestDist = d;
      best = row.firma_adi;
    }
  }
  return best;
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
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  // Enes Doğanay | 16 Mayıs 2026: Servis katmanı tip doğrulamasyı — accept attr. kolayca atlatılır
  if (!ALLOWED_EK_DOSYA_UZANTILARI.has(ext)) throw new Error(ALLOWED_EK_DOSYA_HATA);
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

// Enes Doğanay | 14 Mayıs 2026: gonderen_firma_id kaldırıldı — teklif talebi her zaman bireysel gönderilir, şirket adına değil
export const sendQuoteRequest = async ({ supplier, form, file, userId, userProfile }) => {
  let ekDosyaUrl = null;
  let ekDosyaAdi = null;
  if (file) {
    const uploaded = await uploadQuoteFile(userId, file);
    ekDosyaUrl = uploaded.url;
    ekDosyaAdi = uploaded.name;
  }
  // Enes Doğanay | 23 Mayıs 2026: teklif_id alınıyor — e-postada direkt link için
  const { data: insertedRow, error } = await supabase.from('teklif_talepleri').insert([{
    firma_id: String(supplier.id),
    user_id: userId,
    gonderen_firma_id: null,
    ad_soyad: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim(),
    email: userProfile?.email || '',
    telefon: '',
    firma_adi: '',
    // Enes Doğanay | 14 Mayıs 2026: firma_adi boş — bireysel talep, şirket adı gösterilmez
    konu: form.konu.trim(),
    mesaj: form.mesaj.trim(),
    // Enes Doğanay | 14 Mayıs 2026: Kalemler JSONB alanı — miktar kaldırıldı
    kalemler: form.kalemler?.length ? form.kalemler : null,
    teslim_tarihi: form.teslim_tarihi || null,
    teslim_yeri: form.teslim_yeri || null,
    ek_dosya_url: ekDosyaUrl,
    ek_dosya_adi: ekDosyaAdi,
  }]).select('id').single();
  if (error) throw new Error(error.message);

  // Enes Doğanay | 23 Mayıs 2026: Firma + teklif_yonetimi yetkili ekip üyelerine bildirim maili
  const requesterName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'Bir kullanıcı';
  supabase.functions.invoke('company-management', {
    body: {
      action: 'send_quote_request_email',
      firma_id: String(supplier.id),
      teklif_id: insertedRow?.id ? String(insertedRow.id) : undefined,
      requester_name: requesterName,
      konu: form.konu.trim(),
      mesaj: form.mesaj.trim(),
    },
  }).then(() => {
  }).catch((err) => {
    console.error('[quote-email] invoke hata:', err);
  });
};
