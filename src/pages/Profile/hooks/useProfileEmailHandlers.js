// Enes Doğanay | 7 Mayıs 2026: Profil e-posta değişikliği state + handler'lar
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient'; // Enes Doğanay | 8 Mayıs 2026: sadece onAuthStateChange için
import { updateUserEmail, updateProfileField, syncEmailAfterConfirm, getAuthUser } from '../services/profileService';
import { containsProfanity, PROFANITY_ERROR_MSG } from '../../../utils/contentModeration';

// Enes Doğanay | 7 Mayıs 2026: E-posta değişikliği izleme, onay, handler — user/setUser/setProfile dışarıdan gelir
export const useProfileEmailHandlers = ({ user, setUser, setProfile }) => {
    const [pendingEmail, setPendingEmail] = useState(null);
    const [fieldFeedback, setFieldFeedback] = useState(null);

    // Enes Doğanay | 7 Mayıs 2026: E-posta onay dinleyici + polling + visibility
    useEffect(() => {
        const handleEmailUpdate = async (freshUser) => {
            if (!freshUser) return;
            const updated = await syncEmailAfterConfirm(freshUser);
            if (updated) {
                setUser(freshUser);
                setProfile(prev => prev ? { ...prev, email: freshUser.email } : prev);
                setPendingEmail(null);
                setFieldFeedback({ type: 'success', message: 'E-posta adresiniz başarıyla güncellendi!' });
                setTimeout(() => setFieldFeedback(null), 5000);
                return;
            }
            if (!freshUser.new_email) setPendingEmail(null);
        };
        // Enes Doğanay | 7 Mayıs 2026: Sadece USER_UPDATED dinle — TOKEN_REFRESHED ve SIGNED_IN
        // AuthContext'te zaten handle ediliyor. Çift dinleme yarış koşulu + AFK sonrası token
        // refresh'te abort hatası üretiyordu (global 10sn timeout bunu kesiyordu).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'USER_UPDATED' && session?.user) await handleEmailUpdate(session.user);
        });
        const pollInterval = setInterval(async () => {
            if (!pendingEmail) return;
            try { const u = await getAuthUser(); if (u && !u.new_email) await handleEmailUpdate(u); } catch { /* sessiz */ }
        }, 5000);
        const handleVisibility = async () => {
            if (document.visibilityState !== 'visible' || !pendingEmail) return;
            try { const u = await getAuthUser(); if (u && !u.new_email) await handleEmailUpdate(u); } catch { /* sessiz */ }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => { subscription.unsubscribe(); clearInterval(pollInterval); document.removeEventListener('visibilitychange', handleVisibility); };
    }, [pendingEmail]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUpdateField = useCallback(async (field, newValue, isEmail = false) => {
        // Enes Doğanay | 16 Mayıs 2026: Küfür kontrolü try dışında — ProfileField'a re-throw edilsin
        if (!isEmail && containsProfanity(newValue)) throw new Error(PROFANITY_ERROR_MSG);
        try {
            if (isEmail) {
                setPendingEmail(newValue);
                setFieldFeedback({ type: 'info', message: 'E-posta değişiklik talebi gönderiliyor...' });
                let timedOut = false;
                const timeout = setTimeout(() => { timedOut = true; setFieldFeedback({ type: 'info', message: 'Onay maili gönderildi. Gelen kutunuzu kontrol edin.' }); setTimeout(() => setFieldFeedback(null), 6000); }, 20000);
                try {
                    const { error: authError } = await updateUserEmail(newValue, window.location.origin + '/profile');
                    clearTimeout(timeout); if (timedOut) return;
                    if (authError) { setPendingEmail(null); throw authError.message?.includes('rate') ? new Error('Çok fazla istek. Lütfen daha sonra tekrar deneyin.') : authError; }
                    setFieldFeedback({ type: 'info', message: 'Yeni e-posta adresinize bir onay maili gönderdik.' });
                    setTimeout(() => setFieldFeedback(null), 6000);
                } catch (err) { clearTimeout(timeout); if (!timedOut) throw err; }
            } else {
                if (!user?.id) return;
                await updateProfileField(user.id, field, newValue);
            }
            setProfile(prev => ({ ...prev, [field]: newValue }));
        } catch (error) {
            setFieldFeedback({ type: 'error', message: 'Güncellenirken bir hata oluştu: ' + error.message });
            setTimeout(() => setFieldFeedback(null), 5000);
        }
    }, [user, setProfile]);

    const handleCancelEmailChange = useCallback(() => {
        setPendingEmail(null);
        setFieldFeedback({ type: 'info', message: 'E-posta değişiklik talebi iptal edildi.' });
        setTimeout(() => setFieldFeedback(null), 4000);
    }, []);

    const handleResendEmailChange = useCallback(async () => {
        if (!pendingEmail) return;
        setFieldFeedback({ type: 'info', message: 'Onay maili tekrar gönderiliyor...' });
        let done = false;
        const timeout = setTimeout(() => {
            if (!done) { done = true; setFieldFeedback({ type: 'success', message: 'Onay maili gönderildi!' }); setTimeout(() => setFieldFeedback(null), 5000); }
        }, 10000);
        try {
            const { error } = await updateUserEmail(pendingEmail, window.location.origin + '/profile');
            clearTimeout(timeout); if (done) return; done = true;
            setFieldFeedback({ type: error ? 'error' : 'success', message: error ? (error.message?.includes('rate') ? 'Kısa sürede çok fazla istek.' : 'Mail gönderilemedi: ' + error.message) : 'Onay maili tekrar gönderildi!' });
            setTimeout(() => setFieldFeedback(null), 5000);
        } catch { clearTimeout(timeout); if (!done) { done = true; setFieldFeedback({ type: 'error', message: 'Mail gönderilirken hata oluştu.' }); setTimeout(() => setFieldFeedback(null), 5000); } }
    }, [pendingEmail]);

    return { pendingEmail, setPendingEmail, fieldFeedback, setFieldFeedback, handleUpdateField, handleCancelEmailChange, handleResendEmailChange };
};
