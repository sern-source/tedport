// Enes Doğanay | 6 Mayıs 2026: Favoriler & listeler sidebar kartı
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './FavoritesCard.css';

const FavoritesCard = ({
    firmaId, userProfile,
    isFavorited, myLists, selectedListId, setSelectedListId,
    isCreatingList, setIsCreatingList, newListName, setNewListName,
    isListCreating, listDropdownOpen, setListDropdownOpen, listDropdownRef,
    toggleFavorite, handleCreateList, handleListInputKeyDown,
    activeFavoriteListName
}) => {
    const router = useRouter();

    return (
        <div className="card sidebar-card sidebar-card-favorites">
            <h3 className="sidebar-heading">Listelere Ekle</h3>

            {userProfile ? (
                <>
                    {!isFavorited && (
                        <div className="list-selector-card">
                            <div className="list-dropdown-wrap" ref={listDropdownRef}>
                                <button
                                    type="button"
                                    className={`list-dropdown-trigger${listDropdownOpen ? ' open' : ''}`}
                                    onClick={() => setListDropdownOpen(o => !o)}
                                >
                                    <span className="material-symbols-outlined">bookmarks</span>
                                    <span className="list-dropdown-label">
                                        {selectedListId
                                            ? myLists.find(l => String(l.id) === String(selectedListId))?.liste_adi || 'Liste'
                                            : 'Genel Favoriler (Tümü)'}
                                    </span>
                                    <span className={`material-symbols-outlined list-dropdown-chevron${listDropdownOpen ? ' open' : ''}`}>expand_more</span>
                                </button>
                                {listDropdownOpen && (
                                    <div className="list-dropdown-menu">
                                        <button
                                            type="button"
                                            className={`list-dropdown-option${!selectedListId ? ' active' : ''}`}
                                            onClick={() => { setSelectedListId(''); setListDropdownOpen(false); }}
                                        >
                                            <span className="material-symbols-outlined">folder_special</span>
                                            Genel Favoriler (Tümü)
                                            {!selectedListId && <span className="material-symbols-outlined list-dropdown-check">check</span>}
                                        </button>
                                        {myLists.map(liste => (
                                            <button
                                                key={liste.id}
                                                type="button"
                                                className={`list-dropdown-option${String(selectedListId) === String(liste.id) ? ' active' : ''}`}
                                                onClick={() => { setSelectedListId(liste.id); setListDropdownOpen(false); }}
                                            >
                                                <span className="material-symbols-outlined">folder</span>
                                                {liste.liste_adi}
                                                {String(selectedListId) === String(liste.id) && <span className="material-symbols-outlined list-dropdown-check">check</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!isCreatingList ? (
                                <button type="button" className="list-new-link" onClick={() => setIsCreatingList(true)}>
                                    <span className="material-symbols-outlined">add</span>Yeni liste oluştur
                                </button>
                            ) : (
                                <div className="create-list-inline create-list-inline-form">
                                    <input
                                        type="text"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                        onKeyDown={handleListInputKeyDown}
                                        placeholder="Liste adı"
                                        className="create-list-inline-input"
                                        maxLength={60}
                                        autoFocus
                                    />
                                    <div className="create-list-inline-actions">
                                        <button
                                            type="button"
                                            className="create-list-inline-submit"
                                            onClick={handleCreateList}
                                            disabled={isListCreating || !newListName.trim()}
                                        >
                                            {isListCreating ? 'Oluşturuluyor...' : 'Oluştur'}
                                        </button>
                                        <button
                                            type="button"
                                            className="create-list-inline-cancel"
                                            onClick={() => { setIsCreatingList(false); setNewListName(''); }}
                                            disabled={isListCreating}
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={toggleFavorite}
                        className={`btn-favorite ${isFavorited ? 'btn-favorite--active' : ''}`}
                    >
                        <span className="material-symbols-outlined btn-favorite-icon">
                            {isFavorited ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                        <span>{isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                    </button>

                    {isFavorited && (
                        <p className="favorite-list-status">
                            Bu firma şu anda <strong>{activeFavoriteListName}</strong> listesinde kayıtlı.
                        </p>
                    )}
                </>
            ) : (
                <div className="notes-login-prompt">
                    <span className="material-symbols-outlined notes-lock-icon">lock</span>
                    <p className="notes-login-text">Bu firmayı listelerinize eklemek için lütfen giriş yapın.</p>
                    <button onClick={() => router.push(`/login?redirect=/firmadetay/${firmaId}`)} className="notes-login-btn">Giriş Yap</button>
                </div>
            )}
        </div>
    );
};

export default FavoritesCard;
