// Enes Doğanay | 7 Mayıs 2026: FirmaDetay favori ve liste state + handler'lar
import { useState, useEffect, useRef } from 'react';
import { toggleFavoriteService, createListService } from '../services/firmaDetayService';

// Enes Doğanay | 7 Mayıs 2026: Favori kaydet/kaldır ve liste yönetimi
export const useFirmaDetayFavorites = ({ userId, firmaId, showFdToast }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [myLists, setMyLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isListCreating, setIsListCreating] = useState(false);
    const [listDropdownOpen, setListDropdownOpen] = useState(false);
    const listDropdownRef = useRef(null);

    // Enes Doğanay | 7 Mayıs 2026: Liste dropdown dışarı tıklanınca kapansın
    useEffect(() => {
        if (!listDropdownOpen) return;
        const handleOutside = (e) => {
            if (listDropdownRef.current && !listDropdownRef.current.contains(e.target)) setListDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [listDropdownOpen]);

    const toggleFavorite = async () => {
        if (!userId) { showFdToast('info', 'Lütfen önce giriş yapın.'); return; }
        try {
            await toggleFavoriteService(userId, firmaId, isFavorited, selectedListId);
            if (isFavorited) { setIsFavorited(false); setSelectedListId(''); }
            else setIsFavorited(true);
        } catch { showFdToast('error', 'İşlem gerçekleştirilemedi.'); }
    };

    const handleCreateList = async () => {
        const trimmedName = newListName.trim();
        if (!trimmedName || !userId) return;
        const isDuplicate = myLists.some(l => (l.liste_adi || '').trim().toLocaleLowerCase('tr-TR') === trimmedName.toLocaleLowerCase('tr-TR'));
        if (isDuplicate) { showFdToast('warning', 'Bu isimde bir listeniz zaten var.'); return; }
        setIsListCreating(true);
        try {
            const data = await createListService(userId, trimmedName);
            setMyLists(prev => [...prev, data]);
            setSelectedListId(data.id);
            setNewListName(''); setIsCreatingList(false);
        } catch { showFdToast('error', 'Liste oluşturulamadı.'); }
        finally { setIsListCreating(false); }
    };

    const handleListInputKeyDown = (event) => {
        if (event.key === 'Enter') { event.preventDefault(); if (!isListCreating && newListName.trim()) handleCreateList(); }
        if (event.key === 'Escape' && !isListCreating) { setIsCreatingList(false); setNewListName(''); }
    };

    const activeFavoriteListName = selectedListId
        ? myLists.find(l => String(l.id) === String(selectedListId))?.liste_adi || 'Özel Liste'
        : 'Genel Favoriler';

    return {
        isFavorited, setIsFavorited,
        myLists, setMyLists,
        selectedListId, setSelectedListId,
        isCreatingList, setIsCreatingList,
        newListName, setNewListName,
        isListCreating, listDropdownOpen, setListDropdownOpen, listDropdownRef,
        toggleFavorite, handleCreateList, handleListInputKeyDown,
        activeFavoriteListName,
    };
};
