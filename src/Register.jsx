import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';

const RegistrationPage = () => {
  const navigate = useNavigate(); // Yönlendirme fonksiyonumuzu başlatıyoruz
  const [registrationType, setRegistrationType] = useState('individual');

  // Form State'leri
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Arayüz kontrol state'leri
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bildirim (Mesaj) State'i
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Bildirim Gösterme Fonksiyonu
  const showMessage = (type, message) => {
    setNotification({ show: true, type, message });
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Fotoğraf yükleme işlemi
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  // Supabase Kayıt İşlemi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      showMessage('error', "Lütfen hizmet şartlarını ve gizlilik politikasını kabul edin.");
      return;
    }

    setLoading(true);
    setNotification({ show: false, type: '', message: '' }); // Önceki mesajı temizle

    try {
      // 1. Supabase Auth ile Kullanıcı Oluşturma
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Eğer kayıt başarılıysa
      if (authData && authData.user) {
        const userId = authData.user.id;
        let avatarUrl = null;

        // Fotoğraf seçildiyse 'avatars' bucket'ına yükle
        if (profilePhoto) {
          const fileExt = profilePhoto.name.split('.').pop();
          const fileName = `${userId}-${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, profilePhoto);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            avatarUrl = publicUrl;
          } else {
            console.error("Fotoğraf yüklenirken bir hata oluştu:", uploadError.message);
          }
        }

        // 3. Profiles tablosuna kaydet
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              first_name: firstName,
              last_name: lastName,
              company_name: companyName,
              email: email,
              phone: phone,
              avatar: avatarUrl
            }
          ]);

        if (profileError) {
          throw new Error(profileError.message);
        }

        // Başarılı olduğunda e-posta onay sayfasına yönlendir
        navigate('/emailconfirmation', { state: { email: email, password: password } });
      }

    } catch (error) {
      console.error("Kayıt hatası:", error.message);

      let trMessage = error.message;

      // Hata mesajlarını Türkçeleştirme ve özelleştirme
      if (trMessage.includes("User already registered")) {
        trMessage = "Bu e-posta adresiyle zaten bir hesap mevcut. Lütfen giriş yaparak devam ediniz.";
      } else if (trMessage.includes("Password should be at least")) {
        trMessage = "Şifreniz en az 6 karakter olmalıdır.";
      } else if (trMessage.includes('duplicate key value violates unique constraint') && trMessage.includes('profiles_pkey')) {
        trMessage = "Bu kayıt zaten mevcut. Lütfen giriş yaparak devam ediniz.";
      }

      showMessage('error', trMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <SharedHeader
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Firmalar', href: '/firmalar' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="registration-card">
          {/* Enes Doğanay | 6 Nisan 2026: Inline style yerine CSS class kullanıldı */}
          {notification.show && (
            <div className={`register-notification ${notification.type === 'success' ? 'register-notification--success' : 'register-notification--error'}`}>
              <span className="material-symbols-outlined register-notification-icon">
                {notification.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{notification.message}</span>
            </div>
          )}

          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab-btn ${registrationType === 'individual' ? 'active' : ''}`}
                onClick={() => setRegistrationType('individual')}
                type="button"
              >
                Bireysel Kayıt
              </button>
              <button
                className={`tab-btn ${registrationType === 'corporate' ? 'active' : ''}`}
                onClick={() => setRegistrationType('corporate')}
                type="button"
              >
                Kurumsal Kayıt
              </button>
            </div>
          </div>

          <form className="form-body" onSubmit={handleSubmit}>
            <div className="photo-upload-container">
              <label className="photo-upload-box">
                <span className="material-symbols-outlined photo-upload-icon">
                  {profilePhoto ? 'check_circle' : 'add_a_photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>
              <span className="photo-label">
                {profilePhoto ? 'Fotoğraf Seçildi' : 'Profil Fotoğrafı'}
              </span>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Ad</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Adınızı girin"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Soyad</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Soyadınızı girin"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Şirket Adı</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Şirket ismini girin"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <span className="material-symbols-outlined input-icon">business</span>
              </div>
            </div>

            <div className="input-group">
              <label>Telefon Numarası</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="tel"
                  placeholder="0 (5XX) XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined input-icon">phone</span>
              </div>
            </div>

            <div className="input-group">
              <label>E-posta Adresi</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined input-icon">mail</span>
              </div>
            </div>

            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="material-symbols-outlined input-icon clickable"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className="checkbox-label">
                {/* Enes Doğanay | 6 Nisan 2026: href="#" yerine placeholder onClick */}
                <button type="button" className="text-link-btn" onClick={() => alert('Hizmet Şartları sayfası yakında eklenecek.')}>Hizmet Şartları</button>'nı ve{' '}
                <button type="button" className="text-link-btn" onClick={() => alert('Gizlilik Politikası sayfası yakında eklenecek.')}>Gizlilik Politikası</button>'nı okudum ve kabul ediyorum.
              </label>
            </div>

            <button type="submit" className="register-btn-primary register-btn-submit" disabled={loading}>
              {loading ? 'Kayıt Yapılıyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="card-footer">
            <div className='footerText'>
              Zaten bir hesabınız var mı? <a href="/login" className="text-link footer-login-link">Giriş Yap</a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default RegistrationPage;