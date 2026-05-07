// Enes Doğanay | 6 Mayıs 2026: Kaydedilmiş notlar listesi — gruplu görünüm
import React from 'react';
import { parseNotePayload } from '../utils/firmaDetayUtils';

const NotesFeed = ({ savedNotes, orderedNoteGroups, groupedSavedNotes, pendingDeleteNoteId, setPendingDeleteNoteId, getReminderForNote, formatReminderLabel, handleEditNote, handleDeleteNote }) => {
    if (!savedNotes.length) return (
        <div className="notes-empty-state">
            <span className="material-symbols-outlined notes-empty-icon">note_stack</span>
            Henüz not eklenmedi. İlk notunu ekleyerek bu tedarikçiyle ilgili gözlemlerini kaydedebilirsin.
        </div>
    );
    return (
        <div className="notes-feed">
            {orderedNoteGroups.map((groupLabel) => (
                <section key={groupLabel} className="notes-group">
                    <div className="notes-group-header">
                        <h4 className="notes-group-title">{groupLabel}</h4>
                        <span className="notes-group-line" />
                    </div>
                    <div className="notes-group-list">
                        {groupedSavedNotes[groupLabel].map((savedNote) => {
                            const parsedNote = parseNotePayload(savedNote.not_metni);
                            const isPendingDelete = pendingDeleteNoteId === savedNote.id;
                            const noteReminder = getReminderForNote(savedNote.id);
                            return (
                                <article key={savedNote.id} className="saved-note">
                                    <div className="saved-note-top">
                                        <div className="saved-note-meta">
                                            <p className="saved-note-date">
                                                {new Date(savedNote.updated_at || savedNote.created_at).toLocaleDateString('tr-TR')} • {new Date(savedNote.updated_at || savedNote.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {noteReminder && (
                                                <div className={`saved-note-reminder ${noteReminder.status === 'sent' ? 'sent' : ''}`}>
                                                    <span className="material-symbols-outlined">notifications</span>
                                                    <span>{noteReminder.status === 'sent' ? 'Gönderildi' : formatReminderLabel(noteReminder.reminder_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {isPendingDelete ? (
                                            <div className="saved-note-delete-confirm">
                                                <span className="saved-note-delete-text">Silinsin mi?</span>
                                                <button type="button" className="saved-note-delete-cancel" onClick={() => setPendingDeleteNoteId(null)} aria-label="Silmeyi iptal et">
                                                    <span className="material-symbols-outlined saved-note-action-icon">close</span>
                                                </button>
                                                <button type="button" className="saved-note-delete-approve" onClick={() => handleDeleteNote(savedNote.id)} aria-label="Notu sil">
                                                    <span className="material-symbols-outlined saved-note-action-icon">delete</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="saved-note-actions">
                                                <button type="button" className="saved-note-edit" onClick={() => handleEditNote(savedNote)} aria-label="Notu düzenle">
                                                    <span className="material-symbols-outlined saved-note-action-icon">edit</span>
                                                </button>
                                                <button type="button" className="saved-note-delete" onClick={() => setPendingDeleteNoteId(savedNote.id)} aria-label="Notu sil">
                                                    <span className="material-symbols-outlined saved-note-action-icon">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {parsedNote.title && <h5 className="saved-note-title">{parsedNote.title}</h5>}
                                    <p className="saved-note-text">{parsedNote.body}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default NotesFeed;
