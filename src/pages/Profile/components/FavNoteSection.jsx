// Enes Doğanay | 6 Mayıs 2026: Favori kart not bölümü — düzenleme, görüntüleme, yeni not
import React from 'react';
import { formatReminderLabel } from '../utils/profileUtils';

const FavNoteSection = ({
  fav, editingNoteId, editingSavedNoteId, tempNoteTitle, setTempNoteTitle, tempNoteText, setTempNoteText,
  isSavingNote, expandedNoteIds, setExpandedNoteIds, pendingDeleteNoteId, setPendingDeleteNoteId,
  saveFeedbackFavoriteId, handleInlineNoteSave, handleDeleteSavedNote, handleStartEditingSavedNote,
  resetInlineNoteEditor, setEditingNoteId, setEditingSavedNoteId,
}) => {
  if (editingNoteId === fav.id) {
    return (
      <div className="note-editing">
        <div className="note-header">
          <span className="material-symbols-outlined">edit_note</span>
          <span className="note-header-label">{editingSavedNoteId ? 'NOTU DÜZENLE' : 'YENİ NOT EKLE'}</span>
        </div>
        <div className="note-meta-row">
          <input type="text" className="note-meta-input" value={tempNoteTitle} onChange={e => setTempNoteTitle(e.target.value)} placeholder="Kısa başlık" maxLength={50} />
        </div>
        <textarea className="note-textarea" value={tempNoteText} onChange={e => setTempNoteText(e.target.value)} placeholder="Bu firma hakkında notunuz..." autoFocus />
        <div className="note-actions">
          <button className="note-btn-cancel" onClick={resetInlineNoteEditor}>İptal</button>
          <button className="note-btn-save" onClick={() => handleInlineNoteSave(fav.firma_id, fav.id)} disabled={isSavingNote}>{isSavingNote ? '...' : 'Kaydet'}</button>
        </div>
      </div>
    );
  }
  if (fav.notes?.length > 0) {
    return (
      <div className="note-display">
        <div className="note-header">
          <span className="note-header-label"><span className="material-symbols-outlined">edit_note</span> NOTLARIM</span>
          <div className="note-display-actions">
            <span className="note-count-chip">{fav.notes.length}</span>
            <button className="note-edit-link" onClick={() => { setEditingNoteId(fav.id); setEditingSavedNoteId(null); }}>Yeni Not</button>
          </div>
        </div>
        {saveFeedbackFavoriteId === fav.id && <div className="note-save-feedback"><span className="material-symbols-outlined">check_circle</span> Not kaydedildi</div>}
        <div className="note-stack">
          {(expandedNoteIds.includes(fav.id) ? fav.notes : fav.notes.slice(0, 1)).map(savedNote => (
            <article key={savedNote.id} className="note-stack-item">
              <div className="note-stack-meta">
                <div className="note-stack-meta-main">
                  <span className="note-stack-date">{new Date(savedNote.updated_at || savedNote.created_at).toLocaleDateString('tr-TR')} • {new Date(savedNote.updated_at || savedNote.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
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
                    <button type="button" className="note-stack-action note-stack-action-cancel" onClick={() => setPendingDeleteNoteId(null)}><span className="material-symbols-outlined">close</span></button>
                    <button type="button" className="note-stack-action note-stack-action-delete" onClick={() => handleDeleteSavedNote(fav.id, savedNote.id)}><span className="material-symbols-outlined">delete</span></button>
                  </div>
                ) : (
                  <div className="note-stack-actions">
                    <button type="button" className="note-stack-action note-stack-action-edit" onClick={() => handleStartEditingSavedNote(fav.id, savedNote)}><span className="material-symbols-outlined">edit</span></button>
                    <button type="button" className="note-stack-action note-stack-action-delete" onClick={() => setPendingDeleteNoteId(savedNote.id)}><span className="material-symbols-outlined">delete</span></button>
                  </div>
                )}
              </div>
              {savedNote.title && <h4 className="note-stack-title">{savedNote.title}</h4>}
              <p>{savedNote.body}</p>
            </article>
          ))}
        </div>
        {fav.notes.length > 1 && (
          <button type="button" className="note-stack-toggle" onClick={() => setExpandedNoteIds(prev => prev.includes(fav.id) ? prev.filter(id => id !== fav.id) : [...prev, fav.id])}>
            <span className="material-symbols-outlined">{expandedNoteIds.includes(fav.id) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            {expandedNoteIds.includes(fav.id) ? 'Özet Görünüme Dön' : `${fav.notes.length - 1} Not Daha Gör`}
          </button>
        )}
      </div>
    );
  }
  return (
    <button type="button" className="note-add-trigger" onClick={() => { setEditingNoteId(fav.id); setEditingSavedNoteId(null); }}>
      <span className="material-symbols-outlined">add_circle</span> İlk Notu Ekle
    </button>
  );
};

export default FavNoteSection;
