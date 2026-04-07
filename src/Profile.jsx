import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";
import SharedHeader from "./SharedHeader";
import "./SharedHeader.css";
import { supabase } from "./supabaseClient";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getManagedCompanyId } from './companyManagementApi';
import PageLoader from './PageLoader';

// Enes Doğanay | 6 Nisan 2026: Deterministik renk üretimi (firma_id hash)
const hashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 50%)`;
};

// Enes Doğanay | 6 Nisan 2026: Aynı firma için birden fazla not varsa en güncel olanı seç
const getLatestNote = (notes, firmaId) => {
  return (notes || [])
    .filter((note) => note.firma_id === firmaId)
    .sort((firstNote, secondNote) => (secondNote.updated_at || secondNote.created_at || '').localeCompare(firstNote.updated_at || firstNote.created_at || ''))[0];
};

// Enes Doğanay | 6 Nisan 2026: Favori kartinda tum notlari gosterebilmek icin sirali not listesi uretilir
const getAllNotesForFirma = (notes, firmaId) => {
  return (notes || [])
    .filter((note) => note.firma_id === firmaId)
    .sort((firstNote, secondNote) => (secondNote.updated_at || secondNote.created_at || '').localeCompare(firstNote.updated_at || firstNote.created_at || ''));
};

// Enes Doğanay | 6 Nisan 2026: Yapilandirilmis not govdesi Profile ekraninda da okunur
const parseNotePayload = (rawNoteText) => {
  if (!rawNoteText) {
    return { title: '', tag: '', body: '' };
  }

  try {
    const parsed = JSON.parse(rawNoteText);
    if (parsed && typeof parsed === 'object' && 'body' in parsed) {
      return {
        title: parsed.title || '',
        tag: parsed.tag || '',
        body: parsed.body || ''
      };
    }
  } catch (error) {
    // Eski notlar duz metin olarak tutuldugu icin sessizce fallback yapilir.
  }

  return { title: '', tag: '', body: rawNoteText };
};

// Enes Doğanay | 6 Nisan 2026: Profile uzerinden govde guncellenirken mevcut baslik ve etiket korunur
const serializeNotePayload = (title, tag, body) => {
  return JSON.stringify({
    title: title || '',
    tag: tag || '',
    body: body || ''
  });
};

// Enes Doğanay | 6 Nisan 2026: Yeni tablo kurulumu eksikse profil ekrani kirilmasin diye iliski hatasi yumusatilir
const isMissingRelationError = (error) => error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

// Enes Doğanay | 6 Nisan 2026: Hatirlatici ve bildirim zamanlari ayni formatta gosterilir
const formatReminderLabel = (isoValue) => {
  if (!isoValue) return '';

  const date = new Date(isoValue);
  return `${date.toLocaleDateString('tr-TR')} • ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

// Enes Doğanay | 6 Nisan 2026: Bildirim kartlarinda ozet zaman metni kullanilir
const formatRelativeNotificationTime = (isoValue) => {
  if (!isoValue) return '';

  const date = new Date(isoValue);
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);

  if (Math.abs(diffMinutes) < 1) return 'Az önce';
  if (Math.abs(diffMinutes) < 60) return `${Math.abs(diffMinutes)} dk ${diffMinutes >= 0 ? 'önce' : 'sonra'}`;

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)} sa ${diffHours >= 0 ? 'önce' : 'sonra'}`;

  const diffDays = Math.round(diffHours / 24);
  return `${Math.abs(diffDays)} gün ${diffDays >= 0 ? 'önce' : 'sonra'}`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const mountedRef = useRef(false);
  const fileInputRef = useRef(null);

  const [myLists, setMyLists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  // Enes Doğanay | 6 Nisan 2026: Profilde hangi not kaydinin duzenlendigi ayrica takip edilir
  const [editingSavedNoteId, setEditingSavedNoteId] = useState(null);
  // Enes Doğanay | 6 Nisan 2026: Profilde not basligi da firma detayla uyumlu sekilde duzenlenebilir
  const [tempNoteTitle, setTempNoteTitle] = useState("");
  const [tempNoteText, setTempNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  // Enes Doğanay | 6 Nisan 2026: Profilde notlar varsayilan olarak kompakt kalir, istenirse genisletilir
  const [expandedNoteIds, setExpandedNoteIds] = useState([]);
  // Enes Doğanay | 6 Nisan 2026: Profil not kartlarinda satir ici silme onayi tutulur
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
  // Enes Doğanay | 6 Nisan 2026: Profilde kaydetme sonrasi kisa sureli basari geri bildirimi gosterilir
  const [saveFeedbackFavoriteId, setSaveFeedbackFavoriteId] = useState(null);

  // Enes Doğanay | 6 Nisan 2026: Favori arama, sıralama, menü ve liste atama
  const [favSearch, setFavSearch] = useState("");
  const [favSort, setFavSort] = useState("newest");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [assigningListId, setAssigningListId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  // Enes Doğanay | 6 Nisan 2026: Favori listesi silme onayi ve hedef liste bilgisi tutulur
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);
  // Enes Doğanay | 6 Nisan 2026: Profilde bildirim merkezi ve yaklasan hatirlaticilar tutulur
  const [notifications, setNotifications] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  // Enes Doğanay | 7 Nisan 2026: Kullanıcının gönderdiği teklif talepleri
  const [myQuotes, setMyQuotes] = useState([]);
  const [myQuotesLoading, setMyQuotesLoading] = useState(true);
  // Enes Doğanay | 7 Nisan 2026: Teklif chat state'leri
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [quoteChatMessages, setQuoteChatMessages] = useState([]);
  const [quoteChatLoading, setQuoteChatLoading] = useState(false);
  const [quoteChatInput, setQuoteChatInput] = useState('');
  const [quoteChatSending, setQuoteChatSending] = useState(false);
  const quoteChatEndRef = useRef(null);

  // Enes Doğanay | 6 Nisan 2026: select('*') → spesifik sütunlar, console.log temizlendi, is_verified/premium kaldırıldı
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
          navigate("/login");
          return;
        }

        const managedCompanyId = await getManagedCompanyId();
        if (managedCompanyId) {
          navigate('/firma-profil');
          return;
        }

        setUser(userData.user);

        const [profileResult, cityResult, listsResult, favsResult, notificationsResult, remindersResult, quotesResult] = await Promise.all([
          supabase.from("profiles").select("id, first_name, last_name, company_name, phone, location, avatar, email").eq("id", userData.user.id).single(),
          supabase.from("sehirler").select("sehir").order("sehir", { ascending: true }),
          supabase.from('kullanici_listeleri').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: true }),
          supabase.from('kullanici_favorileri').select('*').eq('user_id', userData.user.id),
          supabase.from('bildirimler').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false }).limit(30),
          supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userData.user.id).in('status', ['pending', 'sent']).order('reminder_at', { ascending: true }),
          supabase.from('teklif_talepleri').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false })
        ]);

        const { data: profileData } = profileResult;
        if (profileData) setProfile(profileData);

        const { data: cityData } = cityResult;
        if (cityData) setCities(cityData.map((c) => c.sehir));

        if (listsResult.data) setMyLists(listsResult.data);
        if (notificationsResult.error && !isMissingRelationError(notificationsResult.error)) {
          console.error('Bildirimler alınamadı:', notificationsResult.error);
        }
        if (remindersResult.error && !isMissingRelationError(remindersResult.error)) {
          console.error('Hatırlatıcılar alınamadı:', remindersResult.error);
        }
        setNotifications(notificationsResult.data || []);
        setUpcomingReminders((remindersResult.data || []).filter((reminder) => reminder.status === 'pending'));
        // Enes Doğanay | 7 Nisan 2026: Teklif talepleri yüklendi — firma adları ile zenginleştir
        const rawQuotes = quotesResult.data || [];
        if (rawQuotes.length > 0) {
          const quoteFirmaIds = [...new Set(rawQuotes.map(q => q.firma_id))];
          const { data: quoteFirms } = await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', quoteFirmaIds);
          const firmMap = new Map((quoteFirms || []).map(f => [f.firmaID, f.firma_adi]));
          setMyQuotes(rawQuotes.map(q => ({ ...q, _firma_adi: firmMap.get(q.firma_id) || 'Firma' })));
        } else {
          setMyQuotes([]);
        }
        setMyQuotesLoading(false);

        setLoading(false);

        if (favsResult.data && favsResult.data.length > 0) {
          const firmaIds = favsResult.data.map(f => f.firma_id);
          const reminderMap = new Map((remindersResult.data || []).map((reminder) => [String(reminder.note_id), reminder]));

          const [firmsData, notesData] = await Promise.all([
            supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds),
            supabase.from('kisisel_notlar').select('*').eq('user_id', userData.user.id).in('firma_id', firmaIds)
          ]);

          const mergedFavorites = favsResult.data.map(fav => {
            const firm = firmsData.data?.find(f => f.firmaID === fav.firma_id) || {};
            const allNotes = getAllNotesForFirma(notesData.data, fav.firma_id);
            const note = getLatestNote(notesData.data, fav.firma_id);
            const parsedNote = parseNotePayload(note?.not_metni || '');

            return {
              id: fav.id,
              firma_id: fav.firma_id,
              liste_id: fav.liste_id,
              created_at: fav.created_at,
              name: firm.firma_adi || "Bilinmeyen Firma",
              category: firm.category_name || "Kategori Yok",
              location: firm.il_ilce || "Konum Yok",
              note: parsedNote.body,
              notes: allNotes.map((savedNote) => {
                const parsedSavedNote = parseNotePayload(savedNote.not_metni || '');
                return {
                  id: savedNote.id,
                  title: parsedSavedNote.title,
                  body: parsedSavedNote.body,
                  updated_at: savedNote.updated_at,
                  created_at: savedNote.created_at,
                  reminder: reminderMap.get(String(savedNote.id)) || null
                };
              }),
              color: hashColor(fav.firma_id)
            };
          });

          setFavorites(mergedFavorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("fetchData hata:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enes Doğanay | 6 Nisan 2026: Promise.all paralel sorgular
  const fetchListsAndFavorites = async (userId) => {
    const [listsResult, favsResult, remindersResult, notificationsResult] = await Promise.all([
      supabase.from('kullanici_listeleri').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('kullanici_favorileri').select('*').eq('user_id', userId),
      supabase.from('kullanici_hatirlaticilari').select('*').eq('user_id', userId).in('status', ['pending', 'sent']).order('reminder_at', { ascending: true }),
      supabase.from('bildirimler').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30)
    ]);

    if (listsResult.data) setMyLists(listsResult.data);
    if (!remindersResult.error || isMissingRelationError(remindersResult.error)) {
      setUpcomingReminders((remindersResult.data || []).filter((reminder) => reminder.status === 'pending'));
    }
    if (!notificationsResult.error || isMissingRelationError(notificationsResult.error)) {
      setNotifications(notificationsResult.data || []);
    }

    if (favsResult.data && favsResult.data.length > 0) {
      const firmaIds = favsResult.data.map(f => f.firma_id);
      const reminderMap = new Map((remindersResult.data || []).map((reminder) => [String(reminder.note_id), reminder]));

      const [firmsData, notesData] = await Promise.all([
        supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds),
        supabase.from('kisisel_notlar').select('*').eq('user_id', userId).in('firma_id', firmaIds)
      ]);

      const mergedFavorites = favsResult.data.map(fav => {
        const firm = firmsData.data?.find(f => f.firmaID === fav.firma_id) || {};
        const allNotes = getAllNotesForFirma(notesData.data, fav.firma_id);
        const note = getLatestNote(notesData.data, fav.firma_id);
        const parsedNote = parseNotePayload(note?.not_metni || '');

        return {
          id: fav.id,
          firma_id: fav.firma_id,
          liste_id: fav.liste_id,
          created_at: fav.created_at,
          name: firm.firma_adi || "Bilinmeyen Firma",
          category: firm.category_name || "Kategori Yok",
          location: firm.il_ilce || "Konum Yok",
          note: parsedNote.body,
          notes: allNotes.map((savedNote) => {
            const parsedSavedNote = parseNotePayload(savedNote.not_metni || '');
            return {
              id: savedNote.id,
              title: parsedSavedNote.title,
              body: parsedSavedNote.body,
              updated_at: savedNote.updated_at,
              created_at: savedNote.created_at,
              reminder: reminderMap.get(String(savedNote.id)) || null
            };
          }),
          color: hashColor(fav.firma_id)
        };
      });

      setFavorites(mergedFavorites);
    } else {
      setFavorites([]);
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Profilde tekil bildirimler okunduya alinabilir
  const handleMarkNotificationRead = async (notificationId) => {
    const { error } = await supabase.from('bildirimler').update({ is_read: true }).eq('id', notificationId).eq('user_id', user.id);
    if (error && !isMissingRelationError(error)) {
      alert('Bildirim güncellenemedi.');
      return;
    }

    setNotifications((prev) => prev.map((notification) => notification.id === notificationId ? { ...notification, is_read: true } : notification));
  };

  // Enes Doğanay | 6 Nisan 2026: Bildirim merkezi icin tum bildirimler tek tikla okundu yapilabilir
  const handleMarkAllNotificationsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.is_read);
    if (unreadNotifications.length === 0) return;

    const unreadNotificationIds = unreadNotifications.map((notification) => notification.id);
    const { error } = await supabase.from('bildirimler').update({ is_read: true }).eq('user_id', user.id).in('id', unreadNotificationIds);
    if (error && !isMissingRelationError(error)) {
      alert('Bildirimler güncellenemedi.');
      return;
    }

    setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
  };

  // Enes Doğanay | 7 Nisan 2026: Teklif chatini aç — mesajları çek
  const openQuoteChat = async (quoteId) => {
    setActiveQuoteId(quoteId);
    setQuoteChatLoading(true);
    setQuoteChatInput('');

    const { data, error } = await supabase.from('teklif_mesajlari')
      .select('*')
      .eq('teklif_id', quoteId)
      .order('created_at', { ascending: true });

    if (!error) setQuoteChatMessages(data || []);
    setQuoteChatLoading(false);
    setTimeout(() => quoteChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Enes Doğanay | 7 Nisan 2026: Teklif chatine mesaj gönder (kullanıcı tarafı)
  const sendQuoteChatMessage = async () => {
    if (!quoteChatInput.trim() || !activeQuoteId || !user) return;
    setQuoteChatSending(true);

    const { data, error } = await supabase.from('teklif_mesajlari')
      .insert([{ teklif_id: activeQuoteId, sender_id: user.id, sender_role: 'user', mesaj: quoteChatInput.trim() }])
      .select()
      .single();

    if (!error && data) {
      setQuoteChatMessages(prev => [...prev, data]);
      setQuoteChatInput('');
      // Enes Doğanay | 7 Nisan 2026: İlk mesaj gönderildiğinde teklif durumunu replied yap
      const currentQuote = myQuotes.find(q => q.id === activeQuoteId);
      if (currentQuote && currentQuote.durum === 'pending') {
        // durum değişikliği gönderen tarafta yapılmaz, sadece firma tarafı yapar
      }
      setTimeout(() => quoteChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    setQuoteChatSending(false);
  };

  // Enes Doğanay | 7 Nisan 2026: Bildirimden teklif chatine yönlendir
  const navigateToQuoteChat = (notification) => {
    const teklifId = notification.metadata?.teklif_id;
    if (!teklifId) return;
    handleMarkNotificationRead(notification.id);
    setSearchParams({ tab: 'quotes' });
    openQuoteChat(teklifId);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const { data, error } = await supabase.from('kullanici_listeleri').insert([{ user_id: user.id, liste_adi: newListName }]).select().single();
    if (!error && data) {
      setMyLists([...myLists, data]);
      setNewListName("");
      setIsCreatingList(false);
    } else {
      alert("Liste oluşturulamadı.");
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Silinen listedeki favoriler korunur ve listesiz duruma alinip liste kaydi kaldirilir
  const handleDeleteList = async (listId) => {
    try {
      const { error: favoritesUpdateError } = await supabase
        .from('kullanici_favorileri')
        .update({ liste_id: null })
        .eq('user_id', user.id)
        .eq('liste_id', listId);

      if (favoritesUpdateError) {
        throw favoritesUpdateError;
      }

      const { error: listDeleteError } = await supabase
        .from('kullanici_listeleri')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (listDeleteError) {
        throw listDeleteError;
      }

      setMyLists((prev) => prev.filter((liste) => liste.id !== listId));
      setFavorites((prev) => prev.map((favorite) => favorite.liste_id === listId ? { ...favorite, liste_id: null } : favorite));
      setSelectedListId((currentListId) => currentListId === listId ? null : currentListId);
      setConfirmDeleteList(null);
    } catch (error) {
      alert('Liste silinirken bir hata oluştu.');
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    const { error } = await supabase.from('kullanici_favorileri').delete().eq('id', favoriteId);
    if (!error) {
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      setConfirmDelete(null);
    } else {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Favoriyi listeye atama
  const handleAssignList = async (favoriteId, listId) => {
    const { error } = await supabase.from('kullanici_favorileri').update({ liste_id: listId }).eq('id', favoriteId);
    if (!error) {
      setFavorites(prev => prev.map(f => f.id === favoriteId ? { ...f, liste_id: listId } : f));
      setAssigningListId(null);
    } else {
      alert("Liste güncellenemedi.");
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Profilde not listesi guncellenirken en guncel not uste alinip kart ozetine de yansitilir
  const updateFavoriteNotesState = (favoriteId, nextNotes) => {
    const orderedNotes = [...nextNotes].sort((firstNote, secondNote) => (secondNote.updated_at || secondNote.created_at || '').localeCompare(firstNote.updated_at || firstNote.created_at || ''));

    setFavorites((prev) => prev.map((favorite) => {
      if (favorite.id !== favoriteId) return favorite;

      return {
        ...favorite,
        note: orderedNotes[0]?.body || '',
        notes: orderedNotes
      };
    }));
  };

  // Enes Doğanay | 6 Nisan 2026: Profilde secilen not karti duzenleme moduna alinir
  const handleStartEditingSavedNote = (favoriteId, savedNote) => {
    setEditingNoteId(favoriteId);
    setEditingSavedNoteId(savedNote.id);
    setTempNoteTitle(savedNote.title || '');
    setTempNoteText(savedNote.body || '');
    setPendingDeleteNoteId(null);
  };

  // Enes Doğanay | 6 Nisan 2026: Profilde not duzenleme durumu tek noktadan sifirlanir
  const resetInlineNoteEditor = () => {
    setEditingNoteId(null);
    setEditingSavedNoteId(null);
    setTempNoteTitle('');
    setTempNoteText('');
  };

  // 📝 INLINE NOT KAYDETME İŞLEMİ
  const handleInlineNoteSave = async (firmaId, favId) => {
    setIsSavingNote(true);
    try {
      const now = new Date().toISOString();

      let newNoteTitle = tempNoteTitle.trim();
      let newNoteText = tempNoteText.trim();
      let nextNotes = [];

      if (editingSavedNoteId) {
        const targetFavorite = favorites.find((favorite) => favorite.id === favId);
        const targetSavedNote = targetFavorite?.notes?.find((savedNote) => savedNote.id === editingSavedNoteId);
        const nextNotePayload = serializeNotePayload(newNoteTitle || targetSavedNote?.title || '', '', newNoteText);

        await supabase.from('kisisel_notlar').update({ not_metni: nextNotePayload, updated_at: now }).eq('id', editingSavedNoteId);

        nextNotes = (targetFavorite?.notes || []).map((savedNote) => savedNote.id === editingSavedNoteId ? {
          ...savedNote,
          title: newNoteTitle,
          body: newNoteText,
          updated_at: now
        } : savedNote);
      } else if (newNoteText) {
        const { data: insertedNote } = await supabase.from('kisisel_notlar').insert([{ user_id: user.id, firma_id: firmaId, not_metni: serializeNotePayload(newNoteTitle, '', newNoteText), updated_at: now }]).select().single();
        const insertedSavedNote = {
          id: insertedNote?.id || `${firmaId}-${now}`,
          title: newNoteTitle,
          body: newNoteText,
          updated_at: insertedNote?.updated_at || now,
          created_at: insertedNote?.created_at || now
        };

        const targetFavorite = favorites.find((favorite) => favorite.id === favId);
        nextNotes = [insertedSavedNote, ...(targetFavorite?.notes || [])];
      }

      updateFavoriteNotesState(favId, nextNotes);
      resetInlineNoteEditor();
      setSaveFeedbackFavoriteId(favId);
      setTimeout(() => setSaveFeedbackFavoriteId((currentId) => currentId === favId ? null : currentId), 1800);
    } catch (error) {
      alert("Not kaydedilirken bir hata oluştu.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Profilde tekil not silme aksiyonu eklendi
  const handleDeleteSavedNote = async (favoriteId, noteId) => {
    try {
      const { error } = await supabase.from('kisisel_notlar').delete().eq('id', noteId);
      if (error) throw error;

      const targetFavorite = favorites.find((favorite) => favorite.id === favoriteId);
      const nextNotes = (targetFavorite?.notes || []).filter((savedNote) => savedNote.id !== noteId);
      updateFavoriteNotesState(favoriteId, nextNotes);

      if (editingSavedNoteId === noteId) {
        resetInlineNoteEditor();
      }

      setPendingDeleteNoteId(null);
    } catch (error) {
      alert('Not silinirken bir hata oluştu.');
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      await handleUpdateField("avatar", publicUrl);
    } catch (error) {
      alert("Fotoğraf yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateField = async (field, newValue, isEmail = false) => {
    try {
      if (isEmail) {
        const { error: authError } = await supabase.auth.updateUser({ email: newValue });
        if (authError) throw authError;
        const { error: profileError } = await supabase.from("profiles").update({ email: newValue }).eq("id", user.id);
        if (profileError) throw profileError;
        setUser({ ...user, email: newValue });
        alert("E-posta adresi güncellendi. Yeni adresinize onay maili gitmiş olabilir, lütfen kontrol edin.");
      } else {
        const { error } = await supabase.from("profiles").update({ [field]: newValue }).eq("id", user.id);
        if (error) throw error;
      }
      setProfile((prev) => ({ ...prev, [field]: newValue }));
    } catch (error) {
      alert("Güncellenirken bir hata oluştu: " + error.message);
    }
  };

  if (loading) return <PageLoader />;

  // Enes Doğanay | 6 Nisan 2026: Arama + sıralama ile filtreleme
  const displayedFavorites = (() => {
    let result = selectedListId ? favorites.filter(fav => fav.liste_id === selectedListId) : [...favorites];
    if (favSearch.trim()) {
      const q = favSearch.toLowerCase();
      result = result.filter(fav =>
        fav.name.toLowerCase().includes(q) ||
        fav.category.toLowerCase().includes(q) ||
        fav.location.toLowerCase().includes(q)
      );
    }
    switch (favSort) {
      case 'alpha': return [...result].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      case 'alpha-desc': return [...result].sort((a, b) => b.name.localeCompare(a.name, 'tr'));
      case 'oldest': return [...result].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      case 'newest': default: return [...result].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
  })();
  const unreadNotificationsCount = notifications.filter((notification) => !notification.is_read).length;
  // Enes Doğanay | 6 Nisan 2026: Zamani gecen ancak henuz server tarafinda islenmemis hatirlaticilar yaklasan olarak gosterilmez
  const futureUpcomingReminders = upcomingReminders.filter((reminder) => new Date(reminder.reminder_at).getTime() > Date.now());
  const overduePendingReminders = upcomingReminders.filter((reminder) => new Date(reminder.reminder_at).getTime() <= Date.now());

  return (
    <>
      <SharedHeader
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Firmalar', href: '/firmalar' },
          { label: 'İhaleler', href: '/ihaleler' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      <div className="page">
        <div className="layout">

          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-user-card">
              <div className="sidebar-avatar" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/150"})` }} />
              <div>
                <div className="sidebar-user-name">{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Kullanıcı"}</div>
                <div className="sidebar-user-company">{profile?.company_name || "Şirket Yok"}</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <a className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'profile' })}>
                <span className="material-symbols-outlined">person</span> Profil Bilgileri
              </a>
              <a className={`nav-item ${currentTab === 'favorites' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'favorites' })}>
                <span className="material-symbols-outlined">collections_bookmark</span> Favorilerim
              </a>
              {/* Enes Doğanay | 7 Nisan 2026: Teklif Taleplerim sekmesi */}
              <a className={`nav-item ${currentTab === 'quotes' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'quotes' })}>
                <span className="material-symbols-outlined">request_quote</span> Teklif Taleplerim
              </a>
              <a className={`nav-item ${currentTab === 'notifications' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'notifications' })}>
                <span className="material-symbols-outlined">notifications</span> Bildirimler
                {unreadNotificationsCount > 0 && <span className="nav-item-badge">{unreadNotificationsCount}</span>}
              </a>
              <hr className="sidebar-divider" />
              <a className="nav-item logout" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span> Çıkış Yap
              </a>
            </nav>

            {currentTab === 'favorites' && (
              <div className="sidebar-lists">
                <h4>LİSTELERİM</h4>

                <div className="list-items">
                  <div className={`list-item ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
                    <span className="list-item-label"><span className="material-symbols-outlined">folder_special</span> Tüm Favoriler</span>
                    <span className="list-item-count">{favorites.length}</span>
                  </div>

                  {myLists.map(liste => {
                    const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                    return (
                      <div key={liste.id} className={`list-item ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                        <span className="list-item-label"><span className="material-symbols-outlined">folder</span> {liste.liste_adi}</span>
                        {/* Enes Doğanay | 6 Nisan 2026: Profil favori listelerine satir ici silme aksiyonu eklendi */}
                        <span className="list-item-actions">
                          <span className="list-item-count">{listCount}</span>
                          <button
                            type="button"
                            className="list-item-delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count: listCount });
                            }}
                            aria-label={`${liste.liste_adi} listesini sil`}
                            title="Listeyi sil"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isCreatingList ? (
                  <div className="create-list-form">
                    {/* Enes Doğanay | 6 Nisan 2026: Dar sidebar genisliginde tasmayi engellemek icin input ve aksiyonlar ayrildi */}
                    <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste Adı" />
                    <div className="create-list-form-actions">
                      <button className="btn-add" onClick={handleCreateList}>
                        <span className="material-symbols-outlined">add</span>
                        <span>Ekle</span>
                      </button>
                      <button className="btn-cancel" onClick={() => { setIsCreatingList(false); setNewListName(''); }} aria-label="Liste oluşturmayı iptal et" title="Vazgeç">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="create-list-btn" onClick={() => setIsCreatingList(true)}>
                    <span className="material-symbols-outlined">add_circle</span> YENİ LİSTE OLUŞTUR
                  </button>
                )}
              </div>
            )}

            <div className="sidebar-stats">
              <div className="sidebar-stats-label">Kayıtlı Tedarikçi</div>
              <div className="sidebar-stats-value">{favorites.length}</div>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="content">

            {currentTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <div className="card-header-inner">
                    <div>
                      <h1>Profil Bilgileri</h1>
                      <p>Kişisel ve kurumsal bilgilerinizi buradan yönetebilirsiniz.</p>
                    </div>
                    <span className="status">Hesabınız Onaylı</span>
                  </div>
                </div>

                <div className="profile-section">
                  <div className="avatar-large" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/300"})` }} />
                  <div style={{ width: '100%' }}>
                    <h3 className="profile-name">{`${profile?.first_name || ""}${profile?.last_name ? " " + profile.last_name : ""}`.trim() || "İsimsiz Kullanıcı"}</h3>
                    <p className="profile-company">{profile?.company_name || "Şirket yok"}</p>
                    <div className="profile-buttons">
                      <button className="secondary-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? "Yükleniyor..." : "Fotoğrafı Değiştir"}
                      </button>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="sr-only" />
                    </div>
                  </div>
                </div>

                <div className="profile-fields">
                  <ProfileField label="Ad" value={profile?.first_name || ""} dbField="first_name" onSave={handleUpdateField} />
                  <ProfileField label="Soyad" value={profile?.last_name || ""} dbField="last_name" onSave={handleUpdateField} />
                  <ProfileField label="Şirket Adı" value={profile?.company_name || ""} dbField="company_name" onSave={handleUpdateField} />
                  <ProfileField label="E-posta Adresi" value={user?.email || ""} dbField="email" isEmail={true} extra="Doğrulanmış" onSave={handleUpdateField} editable={false} />
                  <ProfileField label="Telefon Numarası" value={profile?.phone || "-"} dbField="phone" onSave={handleUpdateField} />
                  <ProfileField label="Konum" value={profile?.location || "-"} dbField="location" onSave={handleUpdateField} isLocation={true} cities={cities} />
                </div>
              </div>
            )}

            {currentTab === 'favorites' && (
              <div className="favorites-section">
                <div className="favorites-header">
                  <div>
                    <h1>{selectedListId === null ? "Tüm Favoriler" : myLists.find(l => l.id === selectedListId)?.liste_adi}</h1>
                    <p>{displayedFavorites.length} tedarikçi{favSearch.trim() ? ` · "${favSearch}" araması` : ''}</p>
                  </div>
                </div>

                {/* Enes Doğanay | 6 Nisan 2026: Mobilde listeler + istatistik (sidebar gizli olduğu için) */}
                <div className="mobile-fav-panel">
                  <div className="mobile-fav-stats">
                    <span className="material-symbols-outlined">bookmark</span>
                    <span className="mobile-fav-stats-value">{favorites.length}</span>
                    <span className="mobile-fav-stats-label">Kayıtlı Tedarikçi</span>
                  </div>

                  <div className="mobile-fav-lists">
                    <div className={`mobile-fav-chip ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
                      Tümü <span className="chip-count">{favorites.length}</span>
                    </div>
                    {myLists.map(liste => {
                      const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                      return (
                        <div key={liste.id} className={`mobile-fav-chip ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                          <span className="mobile-fav-chip-label">{liste.liste_adi}</span>
                          <span className="chip-count">{listCount}</span>
                          {/* Enes Doğanay | 6 Nisan 2026: Mobil listelerde de silme butonu eklendi */}
                          <button
                            type="button"
                            className="mobile-fav-chip-delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              setConfirmDeleteList({ id: liste.id, name: liste.liste_adi, count: listCount });
                            }}
                            aria-label={`${liste.liste_adi} listesini sil`}
                            title="Listeyi sil"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      );
                    })}
                    <div className="mobile-fav-chip add-chip" onClick={() => setIsCreatingList(true)}>
                      <span className="material-symbols-outlined">add</span> Yeni Liste
                    </div>
                  </div>

                  {isCreatingList && (
                    <div className="mobile-create-list">
                      <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste adı yazın..." />
                      <button className="btn-add" onClick={handleCreateList}>
                        <span className="material-symbols-outlined">add</span>
                        <span>Ekle</span>
                      </button>
                      <button className="btn-cancel" onClick={() => { setIsCreatingList(false); setNewListName(''); }}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="favorites-toolbar">
                  <div className="fav-search-wrapper">
                    <span className="material-symbols-outlined">search</span>
                    <input
                      type="text"
                      className="fav-search-input"
                      placeholder="Firma, kategori veya konum ara..."
                      value={favSearch}
                      onChange={e => setFavSearch(e.target.value)}
                    />
                    {favSearch && (
                      <button className="fav-search-clear" onClick={() => setFavSearch("")}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    )}
                  </div>
                  <div className="fav-sort-wrapper">
                    <span className="material-symbols-outlined">swap_vert</span>
                    <select className="fav-sort-select" value={favSort} onChange={e => setFavSort(e.target.value)}>
                      <option value="newest">Son Eklenen</option>
                      <option value="oldest">İlk Eklenen</option>
                      <option value="alpha">A → Z</option>
                      <option value="alpha-desc">Z → A</option>
                    </select>
                  </div>
                </div>

                {displayedFavorites.length === 0 ? (
                  <div className="favorites-empty">
                    <span className="material-symbols-outlined">{favSearch.trim() ? 'search_off' : 'bookmark_border'}</span>
                    <p>{favSearch.trim() ? `"${favSearch}" için sonuç bulunamadı.` : 'Bu listede henüz favori firma bulunmuyor.'}</p>
                    <button onClick={() => favSearch.trim() ? setFavSearch("") : navigate('/firmalar')}>
                      {favSearch.trim() ? 'Aramayı Temizle' : 'Firmaları Keşfet'}
                    </button>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {displayedFavorites.map((fav) => (
                      <div key={fav.id} className="fav-card">

                        <div className="fav-menu-wrapper">
                          <button className="fav-menu-btn" onClick={() => setOpenMenuId(openMenuId === fav.id ? null : fav.id)}>
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {openMenuId === fav.id && (
                            <>
                              <div className="fav-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                              <div className="fav-menu-dropdown">
                                <button onClick={() => { setAssigningListId(fav.id); setOpenMenuId(null); }}>
                                  <span className="material-symbols-outlined">drive_file_move</span> Listeye Taşı
                                </button>
                                <button className="danger" onClick={() => { setConfirmDelete({ id: fav.id, name: fav.name }); setOpenMenuId(null); }}>
                                  <span className="material-symbols-outlined">delete_outline</span> Favorilerden Çıkar
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {assigningListId === fav.id && (
                          <div className="fav-list-assign">
                            <div className="fav-list-assign-header">
                              <span>Listeye Taşı</span>
                              <button onClick={() => setAssigningListId(null)}>
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                            <div className="fav-list-assign-options">
                              <button className={!fav.liste_id ? 'active' : ''} onClick={() => handleAssignList(fav.id, null)}>
                                <span className="material-symbols-outlined">folder_special</span> Genel (Listesiz)
                              </button>
                              {myLists.map(list => (
                                <button key={list.id} className={fav.liste_id === list.id ? 'active' : ''} onClick={() => handleAssignList(fav.id, list.id)}>
                                  <span className="material-symbols-outlined">folder</span> {list.liste_adi}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="fav-avatar" style={{ background: fav.color }}>
                          {fav.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="fav-body">
                          <h3 className="fav-name">
                            <span className="fav-name-text" title={fav.name}>{fav.name}</span>
                          </h3>
                          <div className="fav-meta">
                            <span className="material-symbols-outlined">category</span>
                            <span className="fav-meta-text">{fav.category}</span>
                          </div>
                          <div className="fav-meta">
                            <span className="material-symbols-outlined">location_on</span>
                            <span className="fav-meta-text">{fav.location}</span>
                          </div>
                          {fav.liste_id && (
                            <div className="fav-meta fav-meta-list">
                              <span className="material-symbols-outlined">folder</span>
                              <span className="fav-meta-text">{myLists.find(l => l.id === fav.liste_id)?.liste_adi || 'Liste'}</span>
                            </div>
                          )}

                          {editingNoteId === fav.id ? (
                            <div className="note-editing">
                              <div className="note-header">
                                <span className="material-symbols-outlined">edit_note</span>
                                <span className="note-header-label">{editingSavedNoteId ? 'NOTU DÜZENLE' : 'YENİ NOT EKLE'}</span>
                              </div>
                              {/* Enes Doğanay | 6 Nisan 2026: Profilde not basligi alani da firma detayla eslendi */}
                              <div className="note-meta-row">
                                <input
                                  type="text"
                                  className="note-meta-input"
                                  value={tempNoteTitle}
                                  onChange={(e) => setTempNoteTitle(e.target.value)}
                                  placeholder="Kısa başlık"
                                  maxLength={50}
                                />
                              </div>
                              <textarea
                                className="note-textarea"
                                value={tempNoteText}
                                onChange={(e) => setTempNoteText(e.target.value)}
                                placeholder="Bu firma hakkında notunuz..."
                                autoFocus
                              />
                              <div className="note-actions">
                                <button className="note-btn-cancel" onClick={resetInlineNoteEditor}>İptal</button>
                                <button className="note-btn-save" onClick={() => handleInlineNoteSave(fav.firma_id, fav.id)} disabled={isSavingNote}>
                                  {isSavingNote ? '...' : 'Kaydet'}
                                </button>
                              </div>
                            </div>
                          ) : fav.notes && fav.notes.length > 0 ? (
                            <div className="note-display">
                              <div className="note-header">
                                <span className="note-header-label">
                                  <span className="material-symbols-outlined">edit_note</span> NOTLARIM
                                </span>
                                <div className="note-display-actions">
                                  <span className="note-count-chip">{fav.notes.length}</span>
                                  <button className="note-edit-link" onClick={() => {
                                    setEditingNoteId(fav.id);
                                    setEditingSavedNoteId(null);
                                    setTempNoteTitle('');
                                    setTempNoteText('');
                                    setPendingDeleteNoteId(null);
                                  }}>Yeni Not</button>
                                </div>
                              </div>
                              {saveFeedbackFavoriteId === fav.id && (
                                <div className="note-save-feedback">
                                  <span className="material-symbols-outlined">check_circle</span>
                                  Not kaydedildi
                                </div>
                              )}
                              <div className="note-stack">
                                {(expandedNoteIds.includes(fav.id) ? fav.notes : fav.notes.slice(0, 1)).map((savedNote) => (
                                  <article key={savedNote.id} className="note-stack-item">
                                    <div className="note-stack-meta">
                                      <div className="note-stack-meta-main">
                                        <span className="note-stack-date">
                                          {new Date(savedNote.updated_at || savedNote.created_at).toLocaleDateString('tr-TR')} • {new Date(savedNote.updated_at || savedNote.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {savedNote.reminder && (
                                          <span className={`note-stack-reminder ${savedNote.reminder.status === 'sent' ? 'sent' : ''}`}>
                                            <span className="material-symbols-outlined">notifications</span>
                                            <span>{savedNote.reminder.status === 'sent' ? 'Mail gönderildi' : formatReminderLabel(savedNote.reminder.reminder_at)}</span>
                                          </span>
                                        )}
                                      </div>
                                      {pendingDeleteNoteId === savedNote.id ? (
                                        <div className="note-stack-delete-confirm">
                                          <span className="note-stack-delete-text">Silinsin mi?</span>
                                          <button type="button" className="note-stack-action note-stack-action-cancel" onClick={() => setPendingDeleteNoteId(null)} aria-label="Silmeyi iptal et" title="Vazgeç">
                                            <span className="material-symbols-outlined">close</span>
                                          </button>
                                          <button type="button" className="note-stack-action note-stack-action-delete" onClick={() => handleDeleteSavedNote(fav.id, savedNote.id)} aria-label="Notu sil" title="Sil">
                                            <span className="material-symbols-outlined">delete</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="note-stack-actions">
                                          <button type="button" className="note-stack-action note-stack-action-edit" onClick={() => handleStartEditingSavedNote(fav.id, savedNote)} aria-label="Notu düzenle" title="Düzenle">
                                            <span className="material-symbols-outlined">edit</span>
                                          </button>
                                          <button type="button" className="note-stack-action note-stack-action-delete" onClick={() => setPendingDeleteNoteId(savedNote.id)} aria-label="Notu sil" title="Sil">
                                            <span className="material-symbols-outlined">delete</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {savedNote.title && <h4 className="note-stack-title">{savedNote.title}</h4>}
                                    <p>{savedNote.body}</p>
                                  </article>
                                ))}
                              </div>
                              {fav.notes.length > 1 && (
                                <button
                                  type="button"
                                  className="note-stack-toggle"
                                  onClick={() => setExpandedNoteIds((prev) => prev.includes(fav.id) ? prev.filter((id) => id !== fav.id) : [...prev, fav.id])}
                                >
                                  <span className="material-symbols-outlined">{expandedNoteIds.includes(fav.id) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                                  {expandedNoteIds.includes(fav.id) ? 'Özet Görünüme Dön' : `${fav.notes.length - 1} Not Daha Gör`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <button type="button" className="note-add-trigger" onClick={() => {
                              setEditingNoteId(fav.id);
                              setEditingSavedNoteId(null);
                              setTempNoteTitle('');
                              setTempNoteText('');
                              setPendingDeleteNoteId(null);
                            }}>
                              <span className="material-symbols-outlined">add_circle</span>
                              İlk Notu Ekle
                            </button>
                          )}
                        </div>

                        <div className="fav-actions">
                          <button className="fav-btn-primary" onClick={() => navigate(`/firmadetay/${fav.firma_id}`)}>
                            <span className="material-symbols-outlined">visibility</span> Profili Gör
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enes Doğanay | 7 Nisan 2026: Teklif Taleplerim sekmesi — chat destekli */}
            {currentTab === 'quotes' && (
              <div className="quotes-section">
                {activeQuoteId ? (() => {
                  const activeQuote = myQuotes.find(q => q.id === activeQuoteId);
                  if (!activeQuote) return null;
                  const st = { pending: 'Beklemede', read: 'Okundu', replied: 'Yanıtlandı', rejected: 'Reddedildi', closed: 'Kapatıldı' }[activeQuote.durum] || 'Beklemede';
                  return (
                    <div className="quote-chat-view">
                      <button className="quote-chat-back" onClick={() => setActiveQuoteId(null)}>
                        <span className="material-symbols-outlined">arrow_back</span> Teklif Listesine Dön
                      </button>

                      <div className="quote-chat-header-card">
                        <div className="quote-chat-header-top">
                          <div>
                            <h2>{activeQuote.konu}</h2>
                            <p className="quote-chat-firma">{activeQuote._firma_adi}</p>
                          </div>
                          <span className={`my-quote-status my-quote-status--${activeQuote.durum}`}>{st}</span>
                        </div>
                        <div className="quote-chat-meta">
                          {activeQuote.miktar && <span className="my-quote-tag"><span className="material-symbols-outlined">inventory_2</span>{activeQuote.miktar}</span>}
                          {activeQuote.teslim_tarihi && <span className="my-quote-tag"><span className="material-symbols-outlined">calendar_month</span>{new Date(activeQuote.teslim_tarihi).toLocaleDateString('tr-TR')}</span>}
                          <span className="my-quote-tag"><span className="material-symbols-outlined">schedule</span>{new Date(activeQuote.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="quote-chat-initial-msg">
                          <small>İlk mesajınız</small>
                          <p>{activeQuote.mesaj}</p>
                        </div>
                      </div>

                      <div className="quote-chat-messages">
                        {quoteChatLoading ? (
                          <div className="quote-chat-loading">Mesajlar yükleniyor...</div>
                        ) : quoteChatMessages.length === 0 ? (
                          <div className="quote-chat-empty">
                            <span className="material-symbols-outlined">chat_bubble_outline</span>
                            <p>Henüz mesaj yok. Firmadan yanıt geldiğinde burada görünecek.</p>
                          </div>
                        ) : (
                          quoteChatMessages.map((m) => (
                            <div key={m.id} className={`quote-chat-bubble ${m.sender_role === 'user' ? 'mine' : 'theirs'}`}>
                              <div className="quote-chat-bubble-header">
                                <strong>{m.sender_role === 'user' ? 'Siz' : activeQuote._firma_adi}</strong>
                                <span>{new Date(m.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p>{m.mesaj}</p>
                            </div>
                          ))
                        )}
                        <div ref={quoteChatEndRef} />
                      </div>

                      {activeQuote.durum !== 'closed' && activeQuote.durum !== 'rejected' && (
                        <div className="quote-chat-input-row">
                          <input
                            type="text"
                            placeholder="Mesajınızı yazın..."
                            value={quoteChatInput}
                            onChange={(e) => setQuoteChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuoteChatMessage(); } }}
                            disabled={quoteChatSending}
                          />
                          <button onClick={sendQuoteChatMessage} disabled={quoteChatSending || !quoteChatInput.trim()}>
                            <span className="material-symbols-outlined">{quoteChatSending ? 'progress_activity' : 'send'}</span>
                          </button>
                        </div>
                      )}
                      {(activeQuote.durum === 'closed' || activeQuote.durum === 'rejected') && (
                        <div className="quote-chat-closed-banner">
                          <span className="material-symbols-outlined">info</span>
                          Bu teklif talebi {activeQuote.durum === 'closed' ? 'kapatılmıştır' : 'reddedilmiştir'}. Mesaj gönderemezsiniz.
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <>
                    <div className="quotes-hero">
                      <div>
                        <h1>Teklif Taleplerim</h1>
                        <p>Firmalara gönderdiğiniz teklif taleplerini buradan takip edebilirsiniz.</p>
                      </div>
                    </div>

                    {myQuotesLoading ? (
                      <div className="quotes-loading">Yükleniyor...</div>
                    ) : myQuotes.length === 0 ? (
                      <div className="quotes-empty-state">
                        <span className="material-symbols-outlined">request_quote</span>
                        <h3>Henüz teklif talebi göndermediniz</h3>
                        <p>Firma detay sayfalarında "Teklif İste" butonunu kullanarak firmalardan teklif isteyebilirsiniz.</p>
                      </div>
                    ) : (
                      <div className="quotes-list">
                        {myQuotes.map((q) => {
                          const statusMap = {
                            pending: { label: 'Beklemede', cls: 'pending', icon: 'schedule' },
                            read: { label: 'Okundu', cls: 'read', icon: 'visibility' },
                            replied: { label: 'Yanıtlandı', cls: 'replied', icon: 'reply' },
                            rejected: { label: 'Reddedildi', cls: 'rejected', icon: 'close' },
                            closed: { label: 'Kapatıldı', cls: 'closed', icon: 'archive' }
                          };
                          const st = statusMap[q.durum] || statusMap.pending;

                          return (
                            <article key={q.id} className="my-quote-card" onClick={() => openQuoteChat(q.id)} style={{ cursor: 'pointer' }}>
                              <div className="my-quote-top">
                                <div className="my-quote-top-left">
                                  <span className={`my-quote-status my-quote-status--${st.cls}`}>
                                    <span className="material-symbols-outlined">{st.icon}</span>
                                    {st.label}
                                  </span>
                                  <strong className="my-quote-subject">{q.konu}</strong>
                                </div>
                                <span className="my-quote-date">{new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <p className="my-quote-message">{q.mesaj}</p>
                              <div className="my-quote-footer">
                                <span className="my-quote-tag"><span className="material-symbols-outlined">business</span>{q._firma_adi}</span>
                                {q.miktar && <span className="my-quote-tag"><span className="material-symbols-outlined">inventory_2</span>{q.miktar}</span>}

                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {currentTab === 'notifications' && (
              <div className="notifications-section">
                <div className="notifications-hero">
                  <div>
                    <h1>Bildirimler</h1>
                    <p>Zamanlanan hatırlatmaları ve gönderilmiş bildirimleri buradan takip edebilirsiniz.</p>
                  </div>
                  <button className="notifications-mark-all" onClick={handleMarkAllNotificationsRead} disabled={unreadNotificationsCount === 0}>
                    Tümünü Okundu Yap
                  </button>
                </div>

                <div className="notifications-stats-grid">
                  <div className="notification-stat-card notification-stat-card-unread">
                    <span className="material-symbols-outlined">mark_email_unread</span>
                    <strong>{unreadNotificationsCount}</strong>
                    <span>Okunmamış Bildirim</span>
                  </div>
                  <div className="notification-stat-card notification-stat-card-reminders">
                    <span className="material-symbols-outlined">alarm</span>
                    <strong>{futureUpcomingReminders.length}</strong>
                    <span>Yaklaşan Hatırlatma</span>
                  </div>
                </div>

                <div className="notifications-grid">
                  <section className="notifications-panel notifications-panel-reminders">
                    <div className="notifications-panel-header">
                      <div>
                        <h3>Yaklaşan Hatırlatmalar</h3>
                        <p>Profil mail adresinize gönderilecek planlı hatırlatmalar.</p>
                      </div>
                    </div>

                    {futureUpcomingReminders.length === 0 ? (
                      <div className="notifications-empty-state">
                        <span className="material-symbols-outlined">alarm_off</span>
                        <p>Planlanmış hatırlatma yok.</p>
                      </div>
                    ) : (
                      <div className="upcoming-reminders-list">
                        {futureUpcomingReminders.map((reminder) => (
                          <article key={reminder.id} className="upcoming-reminder-card">
                            <div className="upcoming-reminder-top">
                              <span className="upcoming-reminder-time">{formatReminderLabel(reminder.reminder_at)}</span>
                              <span className="upcoming-reminder-badge">Planlandı</span>
                            </div>
                            <h4>{reminder.note_title || 'Başlıksız Not'}</h4>
                            <p>{reminder.note_body || 'Hatırlatıcı not içeriği burada görünecek.'}</p>
                            <button type="button" className="upcoming-reminder-link" onClick={() => navigate(`/firmadetay/${reminder.firma_id}`)}>
                              <span className="material-symbols-outlined">open_in_new</span>
                              <span>Notun Olduğu Firmaya Git</span>
                            </button>
                          </article>
                        ))}
                      </div>
                    )}

                    {overduePendingReminders.length > 0 && (
                      <div className="overdue-reminders-block">
                        <div className="notifications-panel-subheader">
                          <h4>İşlenmeyi Bekleyen Hatırlatmalar</h4>
                          <p>Bu kayıtların zamanı geçti. Arka plan mail servisi kurulmadıysa burada beklemesi normaldir.</p>
                        </div>
                        <div className="upcoming-reminders-list">
                          {overduePendingReminders.map((reminder) => (
                            <article key={reminder.id} className="upcoming-reminder-card overdue">
                              <div className="upcoming-reminder-top">
                                <span className="upcoming-reminder-time overdue">{formatReminderLabel(reminder.reminder_at)}</span>
                                <span className="upcoming-reminder-badge overdue">İşlenmedi</span>
                              </div>
                              <h4>{reminder.note_title || 'Başlıksız Not'}</h4>
                              <p>{reminder.note_body || 'Hatırlatıcı not içeriği burada görünecek.'}</p>
                              <button type="button" className="upcoming-reminder-link" onClick={() => navigate(`/firmadetay/${reminder.firma_id}`)}>
                                <span className="material-symbols-outlined">open_in_new</span>
                                <span>Notun Olduğu Firmaya Git</span>
                              </button>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="notifications-panel notifications-panel-feed">
                    <div className="notifications-panel-header">
                      <div>
                        <h3>Bildirim Akışı</h3>
                        <p>Gönderilen hatırlatmalar ve sistem olayları burada listelenir.</p>
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="notifications-empty-state">
                        <span className="material-symbols-outlined">notifications_none</span>
                        <p>Henüz bildirim oluşmadı.</p>
                      </div>
                    ) : (
                      <div className="notifications-feed-list">
                        {notifications.map((notification) => (
                          <article key={notification.id} className={`notification-feed-card ${notification.is_read ? '' : 'unread'}`}>
                            <div className="notification-feed-top">
                              <div>
                                <span className="notification-feed-type">{notification.type === 'reminder' ? 'Hatırlatma Maili' : notification.type === 'quote_received' ? 'Teklif Talebi' : notification.type === 'quote_reply' ? 'Teklif Yanıtı' : notification.type === 'quote_message' ? 'Teklif Mesajı' : 'Bildirim'}</span>
                                <h4>{notification.title}</h4>
                              </div>
                              <span className="notification-feed-time">{formatRelativeNotificationTime(notification.created_at)}</span>
                            </div>
                            <p>{notification.message}</p>
                            <div className="notification-feed-actions">
                              {!notification.is_read && (
                                <button type="button" className="notification-read-btn" onClick={() => handleMarkNotificationRead(notification.id)}>
                                  Okundu Yap
                                </button>
                              )}
                              {/* Enes Doğanay | 7 Nisan 2026: Teklif bildirimlerinde chat'e yönlendir */}
                              {notification.metadata?.teklif_id && (
                                <button type="button" className="notification-open-btn" onClick={() => navigateToQuoteChat(notification)}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>chat</span> Teklifi Aç
                                </button>
                              )}
                              {notification.firma_id && !notification.metadata?.teklif_id && (
                                <button type="button" className="notification-open-btn" onClick={() => navigate(`/firmadetay/${notification.firma_id}`)}>
                                  Firmayı Aç
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Enes Doğanay | 6 Nisan 2026: Custom onay modal */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <span className="material-symbols-outlined">bookmark_remove</span>
            </div>
            <h3>Favorilerden Çıkar</h3>
            <p><strong>{confirmDelete.name}</strong> firmasını favorilerinizden çıkarmak istediğinize emin misiniz?</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Vazgeç</button>
              <button className="confirm-delete" onClick={() => handleRemoveFavorite(confirmDelete.id)}>Evet, Çıkar</button>
            </div>
          </div>
        </div>
      )}

      {/* Enes Doğanay | 6 Nisan 2026: Favori listesi silme onayi ayrica gosterilir */}
      {confirmDeleteList && (
        <div className="confirm-overlay" onClick={() => setConfirmDeleteList(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon danger">
              <span className="material-symbols-outlined">folder_delete</span>
            </div>
            <h3>Listeyi Sil</h3>
            <p>
              <strong>{confirmDeleteList.name}</strong> listesi silinecek. İçindeki {confirmDeleteList.count} favori firma korunacak ve <strong>Tüm Favoriler</strong> alanında kalacak.
            </p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDeleteList(null)}>Vazgeç</button>
              <button className="confirm-delete" onClick={() => handleDeleteList(confirmDeleteList.id)}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProfileField = ({ label, value, extra, dbField, isEmail, isLocation, cities = [], onSave, editable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { setTempValue(value || ""); }, [value]);

  // Enes Doğanay | 6 Nisan 2026: filteredCities tanımlandı (ReferenceError düzeltmesi)
  const filteredCities = cities.filter(c => c.toLowerCase().includes(tempValue.toLowerCase()));

  const handleSaveClick = async () => {
    if (tempValue !== value) { await onSave(dbField, tempValue, isEmail); }
    setIsEditing(false); setShowSuggestions(false);
  };
  const handleCancelClick = () => { setTempValue(value || ""); setIsEditing(false); setShowSuggestions(false); };
  const handleCitySelect = (city) => { setTempValue(city); setShowSuggestions(false); };

  return (
    <div className="field">
      <div className="field-content">
        <label>{label}</label>
        {isEditing ? (
          <>
            <div className="field-edit-row">
              <input className="field-input" type="text" value={tempValue} onChange={(e) => { setTempValue(e.target.value); if (isLocation) setShowSuggestions(true); }} onFocus={() => { if (isLocation) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} autoFocus />
              <button className="field-btn-save" onClick={handleSaveClick}>Kaydet</button>
              <button className="field-btn-cancel" onClick={handleCancelClick}>İptal</button>
            </div>
            {isLocation && showSuggestions && filteredCities.length > 0 && (
              <div className="field-suggestions">
                {filteredCities.map((city) => (<div key={city} className="field-suggestion-item" onMouseDown={(e) => e.preventDefault()} onClick={() => handleCitySelect(city)}>{city}</div>))}
              </div>
            )}
          </>
        ) : (
          <div className="field-value-display">
            <p>{value}</p>
            {extra && <span className="field-extra-badge">{extra}</span>}
          </div>
        )}
      </div>
      {editable && !isEditing && (
        <button className="field-edit-btn" onClick={() => setIsEditing(true)}>Düzenle</button>
      )}
    </div>
  );
};

export default ProfilePage;