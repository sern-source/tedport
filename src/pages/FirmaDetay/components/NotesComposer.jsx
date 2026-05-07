// Enes Doğanay | 6 Mayıs 2026: Not yazma ve hatırlatma paneli
import React from 'react';
import DatePicker from '../../../components/DatePicker';
import TimePicker from '../../../components/TimePicker';

const NotesComposer = ({ noteTitle, setNoteTitle, noteText, setNoteText, editingNoteId, reminderEnabled, reminderDate, setReminderDate, reminderTime, setReminderTime, reminderError, handleReminderToggle, handleSaveNote, handleCancelNoteEditing, isNoteSaving, formatReminderLabel }) => (
    <div className="notes-composer">
        <div className="notes-composer-top">
            <span className="material-symbols-outlined notes-composer-icon">stylus_note</span>
            <span className="notes-composer-label">{editingNoteId ? 'Notu Düzenliyorsun' : 'Yeni Not Ekle'}</span>
        </div>
        <div className="note-meta-row">
            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Kısa başlık" className="note-meta-input" maxLength={50} />
        </div>
        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Bu tedarikçi hakkında not al..." className="note-textarea" spellCheck={false} />
        <div className="reminder-block">
            <button type="button" className={`reminder-toggle ${reminderEnabled ? 'active' : ''}`} onClick={handleReminderToggle}>
                <span className="material-symbols-outlined">notifications_active</span>
                <span>{reminderEnabled ? 'Hatırlatma Açık' : 'Hatırlatma Ekle'}</span>
            </button>
            {reminderEnabled && (
                <div className="reminder-panel">
                    <div className="reminder-panel-header">
                        <span className="material-symbols-outlined">schedule</span>
                        <span>Profil mail adresine tam bu saatte hatırlatma gönderilir.</span>
                    </div>
                    <div className="reminder-grid">
                        <label className="reminder-field">
                            <span>Tarih</span>
                            <DatePicker value={reminderDate} onChange={setReminderDate} min={new Date().toISOString().split('T')[0]} variant="amber" />
                        </label>
                        <label className="reminder-field">
                            <span>Saat</span>
                            <TimePicker value={reminderTime} onChange={setReminderTime} variant="amber" />
                        </label>
                    </div>
                    {(reminderDate && reminderTime) && (
                        <div className="reminder-summary">
                            <span className="material-symbols-outlined">alarm</span>
                            <span>{formatReminderLabel(new Date(`${reminderDate}T${reminderTime}`).toISOString())}</span>
                        </div>
                    )}
                    {reminderError && <div className="reminder-error">{reminderError}</div>}
                </div>
            )}
        </div>
        <div className="note-actions">
            {editingNoteId ? (
                <button onClick={handleCancelNoteEditing} className="note-clear-btn">
                    <span className="material-symbols-outlined">close</span><span>Vazgeç</span>
                </button>
            ) : (
                <button onClick={() => { setNoteTitle(''); setNoteText(''); }} className="note-clear-btn">
                    <span className="material-symbols-outlined">ink_eraser</span><span>Temizle</span>
                </button>
            )}
            <button onClick={handleSaveNote} disabled={isNoteSaving} className="note-save-btn">
                <span className="material-symbols-outlined">check_circle</span>
                <span>{isNoteSaving ? 'Kaydediliyor...' : editingNoteId ? 'Notu Güncelle' : 'Notu Kaydet'}</span>
            </button>
        </div>
    </div>
);

export default NotesComposer;
