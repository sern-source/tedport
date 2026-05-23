// Enes Doğanay | 6 Mayıs 2026: Kişisel notlar sidebar kartı — koordinatör
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import NotesComposer from './NotesComposer';
import NotesFeed from './NotesFeed';
import './NotesCard.css';
import './NotesCard.feed.css';
import './NotesCard.responsive.css';
import './NotesCard.dark.css';

const NotesCard = ({
    firmaId, firmaSlug, userProfile, sessionChecked,
    noteTitle, setNoteTitle, noteText, setNoteText,
    savedNotes, isNoteSaving, editingNoteId,
    pendingDeleteNoteId, setPendingDeleteNoteId,
    isNotesOpen, setIsNotesOpen,
    getReminderForNote, formatReminderLabel,
    reminderEnabled, setReminderEnabled, reminderDate, setReminderDate,
    reminderTime, setReminderTime, reminderError,
    handleSaveNote, handleEditNote, handleCancelNoteEditing, handleDeleteNote,
    groupedSavedNotes, orderedNoteGroups
}) => {
    const router = useRouter();

    const handleReminderToggle = () => {
        setReminderEnabled((prev) => {
            const next = !prev;
            if (!next) { setReminderDate(''); setReminderTime(''); }
            return next;
        });
    };

    return (
        <div className={`card notes-card${isNotesOpen ? ' notes-card--open' : ''}`}>
            <button type="button" className="notes-header notes-header--toggle" onClick={() => setIsNotesOpen(v => !v)} aria-expanded={isNotesOpen}>
                <span className="material-symbols-outlined notes-header-icon">edit_note</span>
                <div className="notes-header-copy">
                    <h3 className="notes-title">Kişisel Notlarım</h3>
                    <p className="notes-subtitle">Toplantı, teklif, termin ve takip detaylarını burada saklayın.</p>
                </div>
                <div className="notes-header-right">
                    {userProfile && savedNotes.length > 0 && <span className="notes-count-badge">{savedNotes.length}</span>}
                    <span className="material-symbols-outlined notes-chevron">{isNotesOpen ? 'expand_less' : 'expand_more'}</span>
                </div>
            </button>

            {isNotesOpen && (!sessionChecked ? null : userProfile ? (
                <>
                    <NotesComposer noteTitle={noteTitle} setNoteTitle={setNoteTitle} noteText={noteText} setNoteText={setNoteText} editingNoteId={editingNoteId} reminderEnabled={reminderEnabled} reminderDate={reminderDate} setReminderDate={setReminderDate} reminderTime={reminderTime} setReminderTime={setReminderTime} reminderError={reminderError} handleReminderToggle={handleReminderToggle} handleSaveNote={handleSaveNote} handleCancelNoteEditing={handleCancelNoteEditing} isNoteSaving={isNoteSaving} formatReminderLabel={formatReminderLabel} />
                    <NotesFeed savedNotes={savedNotes} orderedNoteGroups={orderedNoteGroups} groupedSavedNotes={groupedSavedNotes} pendingDeleteNoteId={pendingDeleteNoteId} setPendingDeleteNoteId={setPendingDeleteNoteId} getReminderForNote={getReminderForNote} formatReminderLabel={formatReminderLabel} handleEditNote={handleEditNote} handleDeleteNote={handleDeleteNote} />
                </>
            ) : (
                <div className="notes-login-prompt">
                    <span className="material-symbols-outlined notes-lock-icon">lock</span>
                    <p className="notes-login-text">Bu tedarikçi için özel notlar almak istiyorsanız lütfen giriş yapın.</p>
                    {/* Enes Doğanay | 25 Mayıs 2026: slug URL öncelikli login redirect */}
                    <button onClick={() => router.push(`/login?redirect=${firmaSlug ? `/firmalar/${firmaSlug}` : `/firmadetay/${firmaId}`}`)} className="notes-login-btn">Giriş Yap</button>
                </div>
            ))}
        </div>
    );
};

export default NotesCard;
