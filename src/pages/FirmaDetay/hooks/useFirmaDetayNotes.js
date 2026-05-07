// Enes Doğanay | 7 Mayıs 2026: FirmaDetay not ve hatırlatıcı state + handler'lar
import { useState } from 'react';
import {
    saveNoteService, saveReminderService, cancelReminderService, deleteNoteService,
} from '../services/firmaDetayService';
import {
    isMissingRelationError, parseNotePayload, serializeNotePayload,
    getNoteGroupLabel, toReminderInputValues, formatReminderLabel,
} from '../utils/firmaDetayUtils';

// Enes Doğanay | 7 Mayıs 2026: Not ve hatırlatıcı state + handler'lar
export const useFirmaDetayNotes = ({ userId, userEmail, firmaId, showFdToast }) => {
    const [noteTitle, setNoteTitle] = useState('');
    const [noteText, setNoteText] = useState('');
    const [savedNotes, setSavedNotes] = useState([]);
    const [isNoteSaving, setIsNoteSaving] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [noteReminders, setNoteReminders] = useState([]);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [reminderError, setReminderError] = useState('');

    const getReminderForNote = (noteId, reminderList = noteReminders) =>
        (reminderList || [])
            .filter(r => String(r.note_id) === String(noteId) && r.status !== 'cancelled')
            .sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || (a.reminder_at || '').localeCompare(b.reminder_at || ''))[0] || null;

    const applyReminderToForm = (reminder) => {
        if (!reminder || reminder.status === 'cancelled') {
            setReminderEnabled(false); setReminderDate(''); setReminderTime(''); return;
        }
        const vals = toReminderInputValues(reminder.reminder_at);
        setReminderEnabled(true); setReminderDate(vals.date); setReminderTime(vals.time);
    };

    const resetReminderForm = () => {
        setReminderEnabled(false); setReminderDate(''); setReminderTime(''); setReminderError('');
    };

    const handleSaveNote = async () => {
        if (!noteText.trim() || !userId) return;
        setIsNoteSaving(true); setReminderError('');
        try {
            let reminderAtIso = null;
            if (reminderEnabled) {
                if (!reminderDate || !reminderTime) { setReminderError('Hatırlatma için tarih ve saat seçin.'); setIsNoteSaving(false); return; }
                const dt = new Date(`${reminderDate}T${reminderTime}`);
                if (Number.isNaN(dt.getTime()) || dt.getTime() <= Date.now()) { setReminderError('Hatırlatma zamanı gelecekte olmalı.'); setIsNoteSaving(false); return; }
                reminderAtIso = dt.toISOString();
            }
            const now = new Date().toISOString();
            const notePayload = serializeNotePayload(noteTitle, noteText);
            const persistedNote = await saveNoteService({ userId, firmaId, notePayload, editingNoteId, now });
            const existingReminder = getReminderForNote(editingNoteId || persistedNote.id);
            if (reminderEnabled && reminderAtIso) {
                const saved = await saveReminderService({ userId, firmaId, noteId: persistedNote.id, noteTitle: noteTitle.trim(), noteBody: noteText.trim(), reminderEmail: userEmail || '', reminderAt: reminderAtIso, now, existingReminder }).catch(err => { if (!isMissingRelationError(err)) throw err; return null; });
                if (saved) setNoteReminders(prev => { const filtered = prev.filter(r => r.id !== saved.id && !(String(r.note_id) === String(persistedNote.id) && r.status === 'pending')); return [...filtered, saved]; });
            } else if (existingReminder?.status === 'pending') {
                const cancelled = await cancelReminderService(existingReminder.id, now).catch(err => { if (!isMissingRelationError(err)) throw err; return null; });
                if (cancelled) setNoteReminders(prev => prev.map(r => r.id === existingReminder.id ? { ...r, status: 'cancelled', updated_at: now } : r));
            }
            if (editingNoteId) { setSavedNotes(prev => prev.map(n => n.id === editingNoteId ? persistedNote : n)); }
            else { setSavedNotes(prev => [persistedNote, ...prev]); }
            setNoteTitle(''); setNoteText(''); setEditingNoteId(null); setPendingDeleteNoteId(null);
            resetReminderForm();
        } catch { showFdToast('error', 'Not kaydedilirken bir hata oluştu.'); }
        finally { setIsNoteSaving(false); }
    };

    const handleEditNote = (savedNote) => {
        const parsed = parseNotePayload(savedNote.not_metni);
        setEditingNoteId(savedNote.id); setPendingDeleteNoteId(null);
        setNoteTitle(parsed.title); setNoteText(parsed.body);
        applyReminderToForm(getReminderForNote(savedNote.id)); setReminderError('');
    };

    const handleCancelNoteEditing = () => { setEditingNoteId(null); setNoteTitle(''); setNoteText(''); resetReminderForm(); };

    const handleDeleteNote = async (noteId) => {
        if (!userId) return;
        const now = new Date().toISOString();
        const { error } = await deleteNoteService(userId, noteId, now).then(() => ({})).catch(err => ({ error: err }));
        if (error) { showFdToast('error', 'Not silinemedi.'); return; }
        setSavedNotes(prev => prev.filter(n => n.id !== noteId));
        setNoteReminders(prev => prev.map(r => String(r.note_id) === String(noteId) ? { ...r, status: 'cancelled' } : r));
        if (editingNoteId === noteId) handleCancelNoteEditing();
        setPendingDeleteNoteId(null);
    };

    const groupedSavedNotes = savedNotes.reduce((groups, note) => {
        const label = getNoteGroupLabel(note.updated_at || note.created_at);
        if (!groups[label]) groups[label] = [];
        groups[label].push(note);
        return groups;
    }, {});
    const orderedNoteGroups = ['Bugün', 'Dün', 'Daha Eski'].filter(l => groupedSavedNotes[l]?.length);

    return {
        noteTitle, setNoteTitle, noteText, setNoteText,
        savedNotes, setSavedNotes, isNoteSaving, editingNoteId,
        pendingDeleteNoteId, setPendingDeleteNoteId,
        isNotesOpen, setIsNotesOpen,
        noteReminders, setNoteReminders, getReminderForNote, formatReminderLabel,
        reminderEnabled, setReminderEnabled, reminderDate, setReminderDate,
        reminderTime, setReminderTime, reminderError,
        handleSaveNote, handleEditNote, handleCancelNoteEditing, handleDeleteNote,
        groupedSavedNotes, orderedNoteGroups,
    };
};
