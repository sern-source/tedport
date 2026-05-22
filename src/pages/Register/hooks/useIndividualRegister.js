// Enes Doğanay | 6 Mayıs 2026: Bireysel kayıt formu — state + submit mantığı
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    checkEmailAvailability,
    signUpUser,
    uploadAvatar,
    insertProfile,
    logConsentRecord,
    signInWithOAuth,
} from '../services/registerService';

const useIndividualRegister = ({ kvkkAccepted, marketingConsent, onMessage }) => {
    const router = useRouter();

    // Enes Doğanay | 6 Mayıs 2026: Bireysel form alanları
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePhotoChange = (e) => {
        if (e.target.files?.[0]) setProfilePhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!kvkkAccepted) {
            onMessage('error', 'Lütfen Hizmet şartları, Gizlilik Politikası ve KVKK Aydınlatma Metni\'ni okuduğunuzu onaylayın.');
            return;
        }
        if (password !== passwordConfirm) {
            onMessage('error', 'Şifreler uyuşmuyor. Lütfen aynı şifreyi girdiğinizden emin olun.');
            return;
        }

        setLoading(true);
        try {
            const emailCheck = await checkEmailAvailability(email);
            if (emailCheck && !emailCheck.available) {
                onMessage('error', emailCheck.reason);
                return;
            }
            const authData = await signUpUser(email, password);
            const userId = authData.user?.id;
            if (!userId) throw new Error('Kullanıcı oluşturulamadı.');

            let avatarUrl = null;
            if (profilePhoto) avatarUrl = await uploadAvatar(userId, profilePhoto);

            await insertProfile({
                id: userId, first_name: firstName, last_name: lastName,
                company_name: companyName, email, phone,
                avatar: avatarUrl, marketing_consent: marketingConsent
            });

            await logConsentRecord(userId, { kvkkAccepted, marketingConsent });
            sessionStorage.setItem('ec_pending', JSON.stringify({ email, password }));
            router.push('/emailconfirmation');
        } catch (err) {
            let msg = err.message;
            if (msg.includes('User already registered')) msg = 'Bu e-posta adresiyle zaten bir hesap mevcut. Lütfen giriş yaparak devam ediniz.';
            else if (msg.includes('Password should be at least')) msg = 'Şifreniz en az 6 karakter olmalıdır.';
            else if (msg.includes('duplicate key value') && msg.includes('profiles_pkey')) msg = 'Bu kayıt zaten mevcut. Lütfen giriş yaparak devam ediniz.';
            onMessage('error', msg);
        } finally {
            setLoading(false);
        }
    };

    // Enes Doğanay | 6 Mayıs 2026: OAuth handler'ları — supabase serviste, hata mesajı hook'ta
    const handleGoogleSignIn = async () => {
        try { await signInWithOAuth('google'); }
        catch (err) { onMessage('error', 'Google ile giriş başarısız: ' + err.message); }
    };

    const handleLinkedInSignIn = async () => {
        try { await signInWithOAuth('linkedin_oidc'); }
        catch (err) { onMessage('error', 'LinkedIn ile giriş başarısız: ' + err.message); }
    };

    return {
        firstName, setFirstName,
        lastName, setLastName,
        companyName, setCompanyName,
        phone, setPhone,
        email, setEmail,
        password, setPassword,
        passwordConfirm, setPasswordConfirm,
        showPassword, setShowPassword,
        profilePhoto, handlePhotoChange,
        loading, handleSubmit,
        handleGoogleSignIn, handleLinkedInSignIn,
    };
};

export default useIndividualRegister;
