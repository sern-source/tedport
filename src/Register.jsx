import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Register.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';
import { submitCorporateApplication } from './corporateApplicationsApi';

// Enes Doğanay | 6 Nisan 2026: Kurumsal form ilk degerleri tek nesnede toplanir
const initialCorporateForm = {
  applicantFirstName: '',
  applicantLastName: '',
  applicantTitle: '',
  companyName: '',
  listedCompanyName: '',
  websiteUrl: '',
  corporateEmail: '',
  phone: '',
  taxOffice: '',
  taxNumber: '',
  companyAddress: '',
  verificationNote: ''
};

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [registrationType, setRegistrationType] = useState(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [corporateForm, setCorporateForm] = useState(initialCorporateForm);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [corporateSubmittedApplication, setCorporateSubmittedApplication] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    setRegistrationType(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');
  }, [searchParams]);

  // Enes Doğanay | 6 Nisan 2026: Bildirimler kayit akisinda tek fonksiyonla yonetilir
  const showMessage = (type, message) => {
    setNotification({ show: true, type, message });

    window.setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handlePhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePhoto(event.target.files[0]);
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Sekme degisikligi URL ile eszamanli tutularak kurumsal kayit dogrudan acilabilir
  const handleTabChange = (nextType) => {
    setRegistrationType(nextType);
    setCorporateSubmittedApplication(null);
    setNotification({ show: false, type: '', message: '' });
    setSearchParams(nextType === 'corporate' ? { type: 'corporate' } : {});
  };

  const handleCorporateInputChange = (field, value) => {
    setCorporateForm((prevForm) => ({
      ...prevForm,
      [field]: value
    }));
  };

  // Enes Doğanay | 6 Nisan 2026: Bireysel kayit mevcut auth akisini korur
  const handleIndividualSubmit = async (event) => {
    event.preventDefault();

    if (!termsAccepted) {
      showMessage('error', 'Lütfen hizmet şartlarını ve gizlilik politikasını kabul edin.');
      return;
    }

    setLoading(true);
    setNotification({ show: false, type: '', message: '' });

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData && authData.user) {
        const userId = authData.user.id;
        let avatarUrl = null;

        if (profilePhoto) {
          const fileExt = profilePhoto.name.split('.').pop();
          const fileName = `${userId}-${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, profilePhoto);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = publicUrl;
          }
        }

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

        navigate('/emailconfirmation', { state: { email, password } });
      }
    } catch (error) {
      let translatedMessage = error.message;

      if (translatedMessage.includes('User already registered')) {
        translatedMessage = 'Bu e-posta adresiyle zaten bir hesap mevcut. Lütfen giriş yaparak devam ediniz.';
      } else if (translatedMessage.includes('Password should be at least')) {
        translatedMessage = 'Şifreniz en az 6 karakter olmalıdır.';
      } else if (translatedMessage.includes('duplicate key value violates unique constraint') && translatedMessage.includes('profiles_pkey')) {
        translatedMessage = 'Bu kayıt zaten mevcut. Lütfen giriş yaparak devam ediniz.';
      }

      showMessage('error', translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Kurumsal sekme kullanici olusturmak yerine admin incelemesine giden basvuru olusturur
  const handleCorporateSubmit = async (event) => {
    event.preventDefault();

    if (!termsAccepted) {
      showMessage('error', 'Lütfen hizmet şartlarını ve gizlilik politikasını kabul edin.');
      return;
    }

    setLoading(true);
    setNotification({ show: false, type: '', message: '' });

    try {
      const result = await submitCorporateApplication(corporateForm);
      setCorporateSubmittedApplication(result.application || null);
      setCorporateForm(initialCorporateForm);
      setTermsAccepted(false);
      showMessage('success', result.mode === 'database'
        ? 'Kurumsal başvurunuz alındı. Şu an Edge Function fallback modunda yalnızca başvuru kaydı oluşturuldu; onay ve mail adımı Supabase secrets tamamlanınca aktif olacak.'
        : 'Kurumsal başvurunuz alındı. İnceleme sonrası size e-posta ile dönüş yapılacaktır.');
    } catch (error) {
      showMessage('error', error.message || 'Kurumsal başvuru oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <SharedHeader
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Firmalar', href: '/firmalar' },
          { label: 'İhaleler', href: '/ihaleler' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      <main className="main-content">
        <div className={`registration-card ${registrationType === 'corporate' ? 'registration-card-corporate' : ''}`}>
          {/* Enes Doğanay | 6 Nisan 2026: Kayit akisi bildirimleri ust alanda tek bir kutuda gosterilir */}
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
                onClick={() => handleTabChange('individual')}
                type="button"
              >
                Bireysel Kayıt
              </button>
              <button
                className={`tab-btn ${registrationType === 'corporate' ? 'active' : ''}`}
                onClick={() => handleTabChange('corporate')}
                type="button"
              >
                Kurumsal Kayıt
              </button>
            </div>
          </div>

          {registrationType === 'corporate' ? (
            <>
              {/* Enes Doğanay | 6 Nisan 2026: Kurumsal sekmede kullaniciyi beklenti ve surec konusunda once bilgilendiren panel eklendi */}
              <section className="corporate-intro-panel">
                <div className="corporate-intro-icon">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <div className="corporate-intro-copy">
                  <h1>Kurumsal Hesap Talebi</h1>
                  <p>Tedport'ta listelenmesini istediğiniz firma adına başvuru bırakın. Talebiniz incelenir, firma doğrulanırsa hesabınız bizim tarafımızdan açılır ve şifre belirleme bağlantısı size mail olarak gönderilir.</p>
                </div>
              </section>

              {corporateSubmittedApplication ? (
                <section className="corporate-success-state">
                  <div className="corporate-success-badge">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <h2>Başvurunuz İncelemeye Alındı</h2>
                  <p>{corporateSubmittedApplication.company_name} için bıraktığınız kurumsal kayıt talebi admin paneline düştü. En geç 1 hafta içinde başvurunuzun sonucunu e-posta ile paylaşacağız.</p>
                  <div className="corporate-success-steps">
                    <div className="corporate-success-step">
                      <strong>1.</strong>
                      <span>Firma bilgileri ve sahiplik doğrulaması incelenir.</span>
                    </div>
                    <div className="corporate-success-step">
                      <strong>2.</strong>
                      <span>Uygun bulunursa kurumsal hesabınız oluşturulur.</span>
                    </div>
                    <div className="corporate-success-step">
                      <strong>3.</strong>
                      <span>Mail içindeki bağlantıdan şifrenizi belirleyip giriş yaparsınız.</span>
                    </div>
                  </div>
                  <div className="corporate-success-actions">
                    <button type="button" className="register-btn-primary register-btn-secondary-soft" onClick={() => setCorporateSubmittedApplication(null)}>
                      Yeni Başvuru Oluştur
                    </button>
                    <Link to="/login?type=corporate" className="register-btn-primary register-btn-submit-link">
                      Kurumsal Girişe Git
                    </Link>
                  </div>
                </section>
              ) : (
                <form className="form-body corporate-form-body" onSubmit={handleCorporateSubmit}>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Başvuran Adı</label>
                      <input className="form-input" type="text" placeholder="Adınızı girin" value={corporateForm.applicantFirstName} onChange={(event) => handleCorporateInputChange('applicantFirstName', event.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label>Başvuran Soyadı</label>
                      <input className="form-input" type="text" placeholder="Soyadınızı girin" value={corporateForm.applicantLastName} onChange={(event) => handleCorporateInputChange('applicantLastName', event.target.value)} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Pozisyonunuz</label>
                      <input className="form-input" type="text" placeholder="Örn. Kurucu, Satın Alma Müdürü" value={corporateForm.applicantTitle} onChange={(event) => handleCorporateInputChange('applicantTitle', event.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Telefon Numarası</label>
                      <div className="input-wrapper">
                        <input className="form-input" type="tel" placeholder="0 (5XX) XXX XX XX" value={corporateForm.phone} onChange={(event) => handleCorporateInputChange('phone', event.target.value)} required />
                        <span className="material-symbols-outlined input-icon">phone</span>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Şirket Adı</label>
                    <div className="input-wrapper">
                      <input className="form-input" type="text" placeholder="Yasal şirket unvanını girin" value={corporateForm.companyName} onChange={(event) => handleCorporateInputChange('companyName', event.target.value)} required />
                      <span className="material-symbols-outlined input-icon">business</span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Tedport'ta Görünmesini İstediğiniz Firma</label>
                    <input className="form-input" type="text" placeholder="Listede varsa birebir firma adını yazın" value={corporateForm.listedCompanyName} onChange={(event) => handleCorporateInputChange('listedCompanyName', event.target.value)} />
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Web Sitesi</label>
                      <div className="input-wrapper">
                        <input className="form-input" type="text" placeholder="ornekfirma.com" value={corporateForm.websiteUrl} onChange={(event) => handleCorporateInputChange('websiteUrl', event.target.value)} />
                        <span className="material-symbols-outlined input-icon">language</span>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Kurumsal E-posta</label>
                      <div className="input-wrapper">
                        <input className="form-input" type="email" placeholder="adiniz@sirketiniz.com" value={corporateForm.corporateEmail} onChange={(event) => handleCorporateInputChange('corporateEmail', event.target.value)} required />
                        <span className="material-symbols-outlined input-icon">mail</span>
                      </div>
                      <span className="field-hint">Test için kişisel e-posta kullanabilirsiniz; canlıda şirket adresi tercih edilir.</span>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Vergi Dairesi</label>
                      <input className="form-input" type="text" placeholder="Vergi dairesini girin" value={corporateForm.taxOffice} onChange={(event) => handleCorporateInputChange('taxOffice', event.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Vergi Numarası</label>
                      <input className="form-input" type="text" placeholder="Vergi numarasını girin" value={corporateForm.taxNumber} onChange={(event) => handleCorporateInputChange('taxNumber', event.target.value)} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Şirket Adresi</label>
                    <textarea className="form-textarea" placeholder="Merkez ofis veya doğrulamada kullanılacak adresi girin" value={corporateForm.companyAddress} onChange={(event) => handleCorporateInputChange('companyAddress', event.target.value)} />
                  </div>

                  <div className="input-group">
                    <label>Doğrulama Notu</label>
                    <textarea className="form-textarea" placeholder="Şirket sahipliği, ticaret sicili, mevcut firma kaydıyla bağınız veya incelemeyi hızlandıracak notları yazın" value={corporateForm.verificationNote} onChange={(event) => handleCorporateInputChange('verificationNote', event.target.value)} />
                  </div>

                  <div className="corporate-process-box">
                    <span className="material-symbols-outlined">info</span>
                    <p>Onay geldiğinde hesabınız bizim tarafımızdan oluşturulur. Size gönderilecek şifre belirleme bağlantısıyla hesabınızı aktif edip kurumsal giriş yaparsınız.</p>
                  </div>

                  <div className="checkbox-group">
                    <input type="checkbox" id="terms" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                    <label htmlFor="terms" className="checkbox-label">
                      <button type="button" className="text-link-btn" onClick={() => alert('Hizmet Şartları sayfası yakında eklenecek.')}>Hizmet Şartları</button>'nı ve{' '}
                      <button type="button" className="text-link-btn" onClick={() => alert('Gizlilik Politikası sayfası yakında eklenecek.')}>Gizlilik Politikası</button>'nı okudum ve kabul ediyorum.
                    </label>
                  </div>

                  <button type="submit" className="register-btn-primary register-btn-submit" disabled={loading}>
                    {loading ? 'Başvurunuz Gönderiliyor...' : 'Kurumsal Başvuru Gönder'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <form className="form-body" onSubmit={handleIndividualSubmit}>
              <div className="photo-upload-container">
                <label className="photo-upload-box">
                  <span className="material-symbols-outlined photo-upload-icon">
                    {profilePhoto ? 'check_circle' : 'add_a_photo'}
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                </label>
                <span className="photo-label">{profilePhoto ? 'Fotoğraf Seçildi' : 'Profil Fotoğrafı'}</span>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Ad</label>
                  <input className="form-input" type="text" placeholder="Adınızı girin" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Soyad</label>
                  <input className="form-input" type="text" placeholder="Soyadınızı girin" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label>Şirket Adı</label>
                <div className="input-wrapper">
                  <input className="form-input" type="text" placeholder="Şirket ismini girin" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
                  <span className="material-symbols-outlined input-icon">business</span>
                </div>
              </div>

              <div className="input-group">
                <label>Telefon Numarası</label>
                <div className="input-wrapper">
                  <input className="form-input" type="tel" placeholder="0 (5XX) XXX XX XX" value={phone} onChange={(event) => setPhone(event.target.value)} required />
                  <span className="material-symbols-outlined input-icon">phone</span>
                </div>
              </div>

              <div className="input-group">
                <label>E-posta Adresi</label>
                <div className="input-wrapper">
                  <input className="form-input" type="email" placeholder="ornek@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  <span className="material-symbols-outlined input-icon">mail</span>
                </div>
              </div>

              <div className="input-group">
                <label>Şifre</label>
                <div className="input-wrapper">
                  <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
                  <span className="material-symbols-outlined input-icon clickable" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="terms" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                <label htmlFor="terms" className="checkbox-label">
                  <button type="button" className="text-link-btn" onClick={() => alert('Hizmet Şartları sayfası yakında eklenecek.')}>Hizmet Şartları</button>'nı ve{' '}
                  <button type="button" className="text-link-btn" onClick={() => alert('Gizlilik Politikası sayfası yakında eklenecek.')}>Gizlilik Politikası</button>'nı okudum ve kabul ediyorum.
                </label>
              </div>

              <button type="submit" className="register-btn-primary register-btn-submit" disabled={loading}>
                {loading ? 'Kayıt Yapılıyor...' : 'Hesap Oluştur'}
              </button>
            </form>
          )}

          <div className="card-footer">
            <div className="footerText">
              Zaten bir hesabınız var mı? <Link to={registrationType === 'corporate' ? '/login?type=corporate' : '/login'} className="text-link footer-login-link">Giriş Yap</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="page-footer">
        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default RegistrationPage;