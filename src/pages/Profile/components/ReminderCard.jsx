// Enes Doğanay | 6 Mayıs 2026: Hatırlatma kartı — yaklaşan ve gecikmiş hatırlatmalar
import React from 'react';
import { formatReminderLabel } from '../utils/profileUtils';

const ReminderCard = ({ reminder, badge, badgeClass, isOverdue, confirmDeleteReminder, setConfirmDeleteReminder, handleDeleteReminder, navigate }) => (
    <article className={`upcoming-reminder-card${isOverdue ? ' overdue' : ''}`}>
        <div className="upcoming-reminder-top">
            <span className={`upcoming-reminder-time${isOverdue ? ' overdue' : ''}`}>{formatReminderLabel(reminder.reminder_at)}</span>
            <span className={`upcoming-reminder-badge${badgeClass ? ` ${badgeClass}` : ''}`}>{badge}</span>
        </div>
        <h4>{reminder.note_title || 'Başlıksız Not'}</h4>
        <p>{reminder.note_body || 'Not içeriği belirtilmemiş.'}</p>
        <div className="upcoming-reminder-actions">
            <button type="button" className="upcoming-reminder-link" onClick={() => navigate(reminder.firma_slug ? `/firmalar/${reminder.firma_slug}` : `/firmadetay/${reminder.firma_id}`)}>
                <span className="material-symbols-outlined">open_in_new</span><span>Firmaya Git</span>
            </button>
            {confirmDeleteReminder?.id === reminder.id ? (
                <span className="reminder-inline-confirm">
                    <span className="reminder-inline-confirm-label">Silinsin mi?</span>
                    <button type="button" className="reminder-inline-confirm-cancel" onClick={() => setConfirmDeleteReminder(null)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <button type="button" className="reminder-inline-confirm-yes" onClick={() => handleDeleteReminder(reminder)}>
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </span>
            ) : (
                <button type="button" className="reminder-delete-btn" onClick={() => setConfirmDeleteReminder(reminder)}>
                    <span className="material-symbols-outlined">delete</span>
                </button>
            )}
        </div>
    </article>
);

export default ReminderCard;
