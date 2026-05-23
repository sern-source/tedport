// Enes Doğanay | 6 Mayıs 2026: Firma detay ana içerik — hakkında, ürünler, ihaleler, sidebar
import React from 'react';
import { parseHiyerarsikKategoriler } from '../utils/firmaDetayUtils';
import ProductAccordion from './ProductAccordion';
import TendersSection from './TendersSection';
import FavoritesCard from './FavoritesCard';
import ContactCard from './ContactCard';
import NotesCard from './NotesCard';

const FirmaDetayMain = ({ fd, firmaId }) => (
    <div className="supplier-page">
        <main className="container">
            <div className="content-grid">
                <div className="main-info">
                    <article id="about" className="card card-about">
                        <h2 className="section-heading">
                            <span className="material-symbols-outlined section-heading-icon">apartment</span>
                            Şirket Hakkında
                        </h2>
                        <p className="about-text">{fd.firma.description}</p>
                    </article>
                    <ProductAccordion kategoriler={parseHiyerarsikKategoriler(fd.firma.urun_kategorileri)} expandedCategories={fd.expandedCategories} onToggle={fd.toggleCategory} />
                    {/* Enes Doğanay | 25 Mayıs 2026: firmaSlug eklendi — login redirect slug URL kullanacak */}
                    <TendersSection tenders={fd.tenders} tendersLoading={fd.tendersLoading} isTendersTableMissing={fd.isTendersTableMissing} showAllTenders={fd.showAllTenders} onToggleAll={() => fd.setShowAllTenders(v => !v)} userProfile={fd.userProfile} sessionChecked={fd.sessionChecked} firmaId={firmaId} firmaSlug={fd.firma?.slug} />
                </div>
                <aside className="sticky-sidebar">
                    <FavoritesCard firmaId={firmaId} firmaSlug={fd.firma?.slug} userProfile={fd.userProfile} sessionChecked={fd.sessionChecked} isFavorited={fd.isFavorited} myLists={fd.myLists} selectedListId={fd.selectedListId} setSelectedListId={fd.setSelectedListId} isCreatingList={fd.isCreatingList} setIsCreatingList={fd.setIsCreatingList} newListName={fd.newListName} setNewListName={fd.setNewListName} isListCreating={fd.isListCreating} listDropdownOpen={fd.listDropdownOpen} setListDropdownOpen={fd.setListDropdownOpen} listDropdownRef={fd.listDropdownRef} toggleFavorite={fd.toggleFavorite} handleCreateList={fd.handleCreateList} handleListInputKeyDown={fd.handleListInputKeyDown} activeFavoriteListName={fd.activeFavoriteListName} />
                    <ContactCard firma={fd.firma} userProfile={fd.userProfile} sessionChecked={fd.sessionChecked} isVerified={fd.isVerified} onQuoteRequest={() => fd.setShowQuoteModal(true)} googleMapsLink={fd.googleMapsLink} encodedAddress={fd.encodedAddress} adresText={fd.adresText} firmaId={firmaId} firmaSlug={fd.firma?.slug} />
                    <NotesCard firmaId={firmaId} firmaSlug={fd.firma?.slug} userProfile={fd.userProfile} sessionChecked={fd.sessionChecked} noteTitle={fd.noteTitle} setNoteTitle={fd.setNoteTitle} noteText={fd.noteText} setNoteText={fd.setNoteText} savedNotes={fd.savedNotes} isNoteSaving={fd.isNoteSaving} editingNoteId={fd.editingNoteId} pendingDeleteNoteId={fd.pendingDeleteNoteId} setPendingDeleteNoteId={fd.setPendingDeleteNoteId} isNotesOpen={fd.isNotesOpen} setIsNotesOpen={fd.setIsNotesOpen} noteReminders={fd.noteReminders} getReminderForNote={fd.getReminderForNote} formatReminderLabel={fd.formatReminderLabel} reminderEnabled={fd.reminderEnabled} setReminderEnabled={fd.setReminderEnabled} reminderDate={fd.reminderDate} setReminderDate={fd.setReminderDate} reminderTime={fd.reminderTime} setReminderTime={fd.setReminderTime} reminderError={fd.reminderError} handleSaveNote={fd.handleSaveNote} handleEditNote={fd.handleEditNote} handleCancelNoteEditing={fd.handleCancelNoteEditing} handleDeleteNote={fd.handleDeleteNote} groupedSavedNotes={fd.groupedSavedNotes} orderedNoteGroups={fd.orderedNoteGroups} />
                </aside>
            </div>
        </main>
    </div>
);

export default FirmaDetayMain;
