// Enes Doğanay | 6 Mayıs 2026: FirmaDetay Supabase servis katmanı
import { supabase } from '../../../supabaseClient';

export async function fetchFirmaById(id) {
    const { data, error } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best, onayli_hesap, show_ekip_public')
        .eq('firmaID', id)
        .single();
    if (error) throw error;
    return data;
}

export async function fetchFirmaTenders(id) {
    const { data, error } = await supabase
        .from('firma_ihaleleri')
        .select('*')
        .eq('firma_id', String(id))
        .neq('durum', 'draft')
        .order('yayin_tarihi', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function fetchFirmaEkip(id) {
    const { data } = await supabase
        .from('firma_ekip_public')
        .select('*')
        .eq('firma_id', id)
        .neq('role', 'owner')
        .order('role');
    return data || [];
}

export async function fetchUserSessionData(firmaId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const [profileRes, noteRes, listsRes, favRes, remindersRes, ownedFirmaId] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email').eq('id', session.user.id).single(),
        supabase.from('kisisel_notlar').select('*').eq('user_id', session.user.id).eq('firma_id', firmaId).order('updated_at', { ascending: false }),
        supabase.from('kullanici_listeleri').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
        supabase.from('kullanici_favorileri').select('*').eq('user_id', session.user.id).eq('firma_id', firmaId).maybeSingle(),
        supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', session.user.id).eq('firma_id', String(firmaId)).neq('status', 'cancelled').order('reminder_at', { ascending: true }),
        // Enes Doğanay | 12 Mayıs 2026: Sadece owner rolü — manager/editor butonu görmez
        supabase.from('kurumsal_firma_yoneticileri').select('firma_id').eq('user_id', session.user.id).eq('role', 'owner').maybeSingle().then(r => r.data?.firma_id || null),
    ]);

    return {
        userId: session.user.id,
        userEmail: session.user.email,
        profile: profileRes.data || { first_name: 'Profilime', last_name: 'Git' },
        notes: noteRes.data || [],
        lists: listsRes.data || [],
        favorite: favRes.data || null,
        reminders: remindersRes.data || [],
        remindersError: remindersRes.error,
        managedCompanyId: ownedFirmaId || null
    };
}

export async function toggleFavoriteService(userId, firmaId, isFavorited, selectedListId) {
    if (isFavorited) {
        const { error } = await supabase.from('kullanici_favorileri').delete().eq('user_id', userId).eq('firma_id', firmaId);
        if (error) throw error;
    } else {
        const insertData = { user_id: userId, firma_id: firmaId };
        if (selectedListId) insertData.liste_id = selectedListId;
        const { error } = await supabase.from('kullanici_favorileri').insert([insertData]);
        if (error) throw error;
    }
}

export async function createListService(userId, listeName) {
    const { data, error } = await supabase
        .from('kullanici_listeleri')
        .insert([{ user_id: userId, liste_adi: listeName }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function saveNoteService({ userId, firmaId, notePayload, editingNoteId, now }) {
    if (editingNoteId) {
        const { data, error } = await supabase
            .from('kisisel_notlar')
            .update({ not_metni: notePayload, updated_at: now })
            .eq('id', editingNoteId)
            .select().single();
        if (error) throw error;
        return data;
    }
    const { data, error } = await supabase
        .from('kisisel_notlar')
        .insert([{ user_id: userId, firma_id: firmaId, not_metni: notePayload, updated_at: now }])
        .select().single();
    if (error) throw error;
    return data;
}

export async function saveReminderService({ userId, firmaId, noteId, noteTitle, noteBody, reminderEmail, reminderAt, now, existingReminder }) {
    const payload = {
        user_id: userId,
        firma_id: String(firmaId),
        note_id: String(noteId),
        note_title: noteTitle,
        note_body: noteBody,
        reminder_at: reminderAt,
        reminder_email: reminderEmail,
        status: 'pending',
        sent_at: null,
        failed_at: null,
        email_error: null,
        updated_at: now
    };
    if (existingReminder?.status === 'pending') {
        const { data, error } = await supabase.from('kullanici_hatirlaticilari').update(payload).eq('id', existingReminder.id).select().single();
        if (error) throw error;
        return data;
    }
    const { data, error } = await supabase.from('kullanici_hatirlaticilari').insert([payload]).select().single();
    if (error) throw error;
    return data;
}

export async function cancelReminderService(reminderId, now) {
    const { data, error } = await supabase
        .from('kullanici_hatirlaticilari')
        .update({ status: 'cancelled', updated_at: now })
        .eq('id', reminderId)
        .select().single();
    if (error) throw error;
    return data;
}

export async function deleteNoteService(userId, noteId, now) {
    const { error } = await supabase.from('kisisel_notlar').delete().eq('id', noteId).eq('user_id', userId);
    if (error) throw error;
    await supabase
        .from('kullanici_hatirlaticilari')
        .update({ status: 'cancelled', updated_at: now })
        .eq('user_id', userId)
        .eq('note_id', String(noteId))
        .eq('status', 'pending');
}

export async function uploadQuoteFileService(userId, file) {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('teklif-ekleri').upload(filePath, file);
    if (error) throw error;
    return { url: filePath, name: file.name };
}

export async function sendQuoteRequestService({ firmaId, userId, userProfile, managedCompanyId, quoteForm, quoteFile }) {
    let senderFirmaId = null;
    let senderFirmaAdi = '';
    if (managedCompanyId) {
        senderFirmaId = managedCompanyId;
        const { data: senderFirma } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', managedCompanyId).single();
        senderFirmaAdi = senderFirma?.firma_adi || '';
    }

    let ekDosyaUrl = null;
    let ekDosyaAdi = null;
    if (quoteFile) {
        const result = await uploadQuoteFileService(userId, quoteFile);
        ekDosyaUrl = result.url;
        ekDosyaAdi = result.name;
    }

    const { error } = await supabase.from('teklif_talepleri').insert([{
        firma_id: String(firmaId),
        user_id: userId,
        gonderen_firma_id: senderFirmaId,
        ad_soyad: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim(),
        email: userProfile?.email || '',
        telefon: '',
        firma_adi: senderFirmaAdi,
        konu: quoteForm.konu.trim(),
        mesaj: quoteForm.mesaj.trim(),
        miktar: quoteForm.miktar.trim() || null,
        teslim_tarihi: quoteForm.teslim_tarihi || null,
        teslim_yeri: quoteForm.teslim_yeri || null,
        ek_dosya_url: ekDosyaUrl,
        ek_dosya_adi: ekDosyaAdi
    }]);
    if (error) throw error;
}

export async function fetchSuggestionsService(search) {
    const safeSearch = search.replace(/[\\"%#_]/g, '').trim();
    if (safeSearch.length < 2) return [];
    const { data } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, il_ilce, best')
        .or(`firma_adi.ilike."%${safeSearch}%",description.ilike."%${safeSearch}%",ana_sektor.ilike."%${safeSearch}%",urun_kategorileri.ilike."%${safeSearch}%"`)
        .limit(6);
    if (!data) return [];
    const lower = safeSearch.toLowerCase();
    return data
        .sort((a, b) => {
            const bestDiff = (b.best ? 1 : 0) - (a.best ? 1 : 0);
            if (bestDiff !== 0) return bestDiff;
            const aName = (a.firma_adi || '').toLowerCase();
            const bName = (b.firma_adi || '').toLowerCase();
            const scoreA = aName === lower ? 3 : aName.startsWith(lower) ? 2 : aName.includes(lower) ? 1 : 0;
            const scoreB = bName === lower ? 3 : bName.startsWith(lower) ? 2 : bName.includes(lower) ? 1 : 0;
            return scoreB - scoreA;
        })
        .map(f => ({ id: f.firmaID, name: f.firma_adi, location: f.il_ilce }));
}
