// Enes Doğanay | 6 Mayıs 2026: Favoriler ve listeler Supabase servisleri
import { supabase } from '../../../supabaseClient';
import { getAllNotesForFirma, getLatestNote, parseNotePayload, serializeNotePayload, hashColor } from '../utils/profileUtils';

export const fetchListsAndFavs = async (userId) => {
  const [listsRes, favsRes] = await Promise.all([
    supabase.from('kullanici_listeleri').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('kullanici_favorileri').select('*').eq('user_id', userId),
  ]);
  return { lists: listsRes.data || [], favs: favsRes.data || [] };
};

export const enrichFavorites = async (userId, favs, reminders) => {
  if (!favs.length) return [];
  const firmaIds = favs.map((f) => f.firma_id);
  const reminderMap = new Map((reminders || []).map((r) => [String(r.note_id), r]));
  const [firmsRes, notesRes] = await Promise.all([
    supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce, logo_url').in('firmaID', firmaIds),
    supabase.from('kisisel_notlar').select('*').eq('user_id', userId).in('firma_id', firmaIds),
  ]);
  return favs.map((fav) => {
    const firm = firmsRes.data?.find((f) => f.firmaID === fav.firma_id) || {};
    const allNotes = getAllNotesForFirma(notesRes.data, fav.firma_id);
    const note = getLatestNote(notesRes.data, fav.firma_id);
    const parsed = parseNotePayload(note?.not_metni || '');
    return {
      id: fav.id,
      firma_id: fav.firma_id,
      liste_id: fav.liste_id,
      created_at: fav.created_at,
      name: firm.firma_adi || 'Bilinmeyen Firma',
      category: firm.category_name || 'Kategori Yok',
      location: firm.il_ilce || 'Konum Yok',
      logo_url: firm.logo_url?.includes('firma-logolari') ? firm.logo_url : null,
      note: parsed.body,
      notes: allNotes.map((n) => {
        const p = parseNotePayload(n.not_metni || '');
        return {
          id: n.id,
          title: p.title,
          body: p.body,
          updated_at: n.updated_at,
          created_at: n.created_at,
          reminder: reminderMap.get(String(n.id)) || null,
        };
      }),
      color: hashColor(fav.firma_id),
    };
  });
};

export const createListService = async (userId, name) => {
  const { data, error } = await supabase
    .from('kullanici_listeleri')
    .insert([{ user_id: userId, liste_adi: name }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteListService = async (userId, listId) => {
  await supabase.from('kullanici_favorileri').update({ liste_id: null }).eq('user_id', userId).eq('liste_id', listId);
  const { error } = await supabase.from('kullanici_listeleri').delete().eq('id', listId).eq('user_id', userId);
  if (error) throw new Error(error.message);
};

export const removeFavoriteService = async (favId) => {
  const { error } = await supabase.from('kullanici_favorileri').delete().eq('id', favId);
  if (error) throw new Error(error.message);
};

export const assignFavToListService = async (favId, listId) => {
  const { error } = await supabase.from('kullanici_favorileri').update({ liste_id: listId }).eq('id', favId);
  if (error) throw new Error(error.message);
};

export const saveInlineNote = async (userId, firmaId, noteId, title, body) => {
  const now = new Date().toISOString();
  const payload = serializeNotePayload(title, '', body);
  if (noteId) {
    await supabase.from('kisisel_notlar').update({ not_metni: payload, updated_at: now }).eq('id', noteId);
    return { id: noteId, title, body, updated_at: now };
  }
  const { data } = await supabase
    .from('kisisel_notlar')
    .insert([{ user_id: userId, firma_id: firmaId, not_metni: payload, updated_at: now }])
    .select()
    .single();
  return { id: data?.id || `${firmaId}-${now}`, title, body, updated_at: data?.updated_at || now, created_at: data?.created_at || now };
};

export const deleteNoteService = async (noteId) => {
  const { error } = await supabase.from('kisisel_notlar').delete().eq('id', noteId);
  if (error) throw new Error(error.message);
};

// Enes Doğanay | 7 Mayıs 2026: Kullanıcı hatırlatıcılarını çek
export const fetchUserReminders = async (userId) => {
  const { data } = await supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userId).in('status', ['pending', 'sent']);
  return data || [];
};
