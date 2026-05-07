// Enes Doğanay | 7 Mayıs 2026: Favoriler, listeler ve notlar state + handlers (servis üstü)
import { useState, useEffect, useCallback } from 'react';
import {
    fetchListsAndFavs, enrichFavorites, fetchUserReminders,
    createListService, deleteListService, removeFavoriteService, assignFavToListService,
    saveInlineNote, deleteNoteService,
} from '../services/favoritesService';

export const useFavorites = (userId, showPrToast) => {
    const [myLists, setMyLists] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [favSearch, setFavSearch] = useState('');
    const [favSort, setFavSort] = useState('newest');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [assigningListId, setAssigningListId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmDeleteList, setConfirmDeleteList] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingSavedNoteId, setEditingSavedNoteId] = useState(null);
    const [tempNoteTitle, setTempNoteTitle] = useState('');
    const [tempNoteText, setTempNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [expandedNoteIds, setExpandedNoteIds] = useState([]);
    const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
    const [saveFeedbackFavoriteId, setSaveFeedbackFavoriteId] = useState(null);

    const fetchFavsAndLists = useCallback(async (uid) => {
        const [{ lists, favs }, reminders] = await Promise.all([
            fetchListsAndFavs(uid),
            fetchUserReminders(uid),
        ]);
        setMyLists(lists);
        const enriched = await enrichFavorites(uid, favs, reminders);
        setFavorites(enriched);
    }, []);

    useEffect(() => {
        if (!userId) return;
        fetchFavsAndLists(userId);
    }, [userId, fetchFavsAndLists]);

    const updateFavoriteNotesState = useCallback((favoriteId, nextNotes) => {
        const sorted = [...nextNotes].sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));
        setFavorites(prev => prev.map(fav => fav.id !== favoriteId ? fav : { ...fav, note: sorted[0]?.body || '', notes: sorted }));
    }, []);

    const resetInlineNoteEditor = useCallback(() => {
        setEditingNoteId(null); setEditingSavedNoteId(null); setTempNoteTitle(''); setTempNoteText('');
    }, []);

    const handleStartEditingSavedNote = useCallback((favoriteId, savedNote) => {
        setEditingNoteId(favoriteId); setEditingSavedNoteId(savedNote.id);
        setTempNoteTitle(savedNote.title || ''); setTempNoteText(savedNote.body || '');
        setPendingDeleteNoteId(null);
    }, []);

    const handleInlineNoteSave = useCallback(async (firmaId, favId) => {
        setIsSavingNote(true);
        try {
            const newTitle = tempNoteTitle.trim(); const newText = tempNoteText.trim();
            const targetFav = favorites.find(f => f.id === favId);
            const titleToUse = editingSavedNoteId ? (newTitle || targetFav?.notes?.find(n => n.id === editingSavedNoteId)?.title || '') : newTitle;
            if (!editingSavedNoteId && !newText) return;
            const saved = await saveInlineNote(userId, firmaId, editingSavedNoteId || null, titleToUse, newText);
            const prevNotes = targetFav?.notes || [];
            const nextNotes = editingSavedNoteId
                ? prevNotes.map(n => n.id === editingSavedNoteId ? { ...n, ...saved } : n)
                : [saved, ...prevNotes];
            updateFavoriteNotesState(favId, nextNotes);
            resetInlineNoteEditor();
            setSaveFeedbackFavoriteId(favId);
            setTimeout(() => setSaveFeedbackFavoriteId(cur => cur === favId ? null : cur), 1800);
        } catch { showPrToast('error', 'Not kaydedilirken bir hata oluştu.'); }
        finally { setIsSavingNote(false); }
    }, [editingSavedNoteId, tempNoteTitle, tempNoteText, favorites, userId, updateFavoriteNotesState, resetInlineNoteEditor, showPrToast]);

    const handleDeleteSavedNote = useCallback(async (favoriteId, noteId) => {
        try {
            await deleteNoteService(noteId);
            const targetFav = favorites.find(f => f.id === favoriteId);
            updateFavoriteNotesState(favoriteId, (targetFav?.notes || []).filter(n => n.id !== noteId));
            if (editingSavedNoteId === noteId) resetInlineNoteEditor();
            setPendingDeleteNoteId(null);
        } catch { showPrToast('error', 'Not silinirken bir hata oluştu.'); }
    }, [favorites, editingSavedNoteId, updateFavoriteNotesState, resetInlineNoteEditor, showPrToast]);

    const handleCreateList = useCallback(async () => {
        if (!newListName.trim()) return;
        try {
            const data = await createListService(userId, newListName);
            setMyLists(prev => [...prev, data]); setNewListName(''); setIsCreatingList(false);
        } catch { showPrToast('error', 'Liste oluşturulamadı.'); }
    }, [newListName, userId, showPrToast]);

    const handleDeleteList = useCallback(async (listId) => {
        try {
            await deleteListService(userId, listId);
            setMyLists(prev => prev.filter(l => l.id !== listId));
            setFavorites(prev => prev.map(f => f.liste_id === listId ? { ...f, liste_id: null } : f));
            setSelectedListId(cur => cur === listId ? null : cur);
            setConfirmDeleteList(null);
        } catch { showPrToast('error', 'Liste silinirken bir hata oluştu.'); }
    }, [userId, showPrToast]);

    const handleRemoveFavorite = useCallback(async (favoriteId) => {
        try {
            await removeFavoriteService(favoriteId);
            setFavorites(prev => prev.filter(f => f.id !== favoriteId)); setConfirmDelete(null);
        } catch { showPrToast('error', 'Silme işlemi başarısız oldu.'); }
    }, [showPrToast]);

    const handleAssignList = useCallback(async (favoriteId, listId) => {
        try {
            await assignFavToListService(favoriteId, listId);
            setFavorites(prev => prev.map(f => f.id === favoriteId ? { ...f, liste_id: listId } : f));
            setAssigningListId(null);
        } catch { showPrToast('error', 'Liste güncellenemedi.'); }
    }, [showPrToast]);

    return {
        myLists, favorites, selectedListId, setSelectedListId, isCreatingList, setIsCreatingList,
        newListName, setNewListName, favSearch, setFavSearch, favSort, setFavSort,
        openMenuId, setOpenMenuId, assigningListId, setAssigningListId,
        confirmDelete, setConfirmDelete, confirmDeleteList, setConfirmDeleteList,
        editingNoteId, setEditingNoteId, editingSavedNoteId, tempNoteTitle, setTempNoteTitle,
        tempNoteText, setTempNoteText, isSavingNote, expandedNoteIds, setExpandedNoteIds,
        pendingDeleteNoteId, setPendingDeleteNoteId, saveFeedbackFavoriteId,
        fetchFavsAndLists, handleStartEditingSavedNote, handleInlineNoteSave,
        handleDeleteSavedNote, handleCreateList, handleDeleteList, handleRemoveFavorite, handleAssignList,
    };
};
