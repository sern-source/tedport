// Enes Doğanay | 13 Nisan 2026: useRef destructured import olarak eklendi
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Register.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import SEO from './SEO'; // Enes Doğanay | 16 Nisan 2026: SEO meta tag desteği
import { supabase } from './supabaseClient';
import { submitCorporateApplication } from './corporateApplicationsApi';
// Enes Doğanay | 8 Nisan 2026: İl/İlçe dropdown'ları için Türkiye veri seti
import { TURKEY_DISTRICTS } from './turkeyDistricts';

// Enes Doğanay | 6 Nisan 2026: Kurumsal form ilk degerleri tek nesnede toplanir
// Enes Doğanay | 8 Nisan 2026: selectedFirmaId eklendi — mevcut firma seçimi için
// Enes Doğanay | 8 Nisan 2026: companyName kaldırıldı (listedCompanyName ile birleştirildi), companyPhone ve taxDocument eklendi
// Enes Doğanay | 8 Nisan 2026: companyAddress → companyIl/companyIlce/companyOpenAddress olarak ayrıldı
const initialCorporateForm = {
  applicantFirstName: '',
  applicantLastName: '',
  applicantTitle: '',
  listedCompanyName: '',
  selectedFirmaId: null,
  companyPhone: '',
  companyIl: '',
  companyIlce: '',
  companyOpenAddress: '',
  websiteUrl: '',
  corporateEmail: '',
  phone: '',
  taxOffice: '',
  taxNumber: '',
  verificationNote: '',
  taxDocument: null
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
  /* Enes Doğanay | 11 Nisan 2026: Şifre tekrarı doğrulaması */
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [corporateForm, setCorporateForm] = useState(initialCorporateForm);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [corporateSubmittedApplication, setCorporateSubmittedApplication] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  /* Enes Doğanay | 8 Nisan 2026: Kurumsal form doğrulama hataları */
  const [corporateErrors, setCorporateErrors] = useState({});

  /* Enes Doğanay | 8 Nisan 2026: Firma autocomplete state'leri */
  const [firmaSuggestions, setFirmaSuggestions] = useState([]);
  const [showFirmaSuggestions, setShowFirmaSuggestions] = useState(false);
  const firmaSearchRef = useRef(null);
  const firmaDebounceRef = useRef(null);

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

  // Enes Doğanay | 7 Nisan 2026: Kayit oncesi e-posta musaitlik kontrolu, auth.users ve kurumsal_basvurular tablosunu kontrol eder
  const checkEmailAvailability = async (emailToCheck) => {
    const { data, error } = await supabase.rpc('check_email_availability', { p_email: emailToCheck });
    if (error) {
      return null;
    }
    return data;
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
    // Enes Doğanay | 8 Nisan 2026: Hata mesajını alan doldurulunca temizle
    if (corporateErrors[field]) {
      setCorporateErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  /* Enes Doğanay | 8 Nisan 2026: Firma adı yazıldıkça DB'den arama yapan debounced fonksiyon */
  const handleFirmaSearch = (searchValue) => {
    handleCorporateInputChange('listedCompanyName', searchValue);
    // Kullanıcı elle yazdığında seçimi temizle
    setCorporateForm((prev) => ({ ...prev, selectedFirmaId: null }));

    if (firmaDebounceRef.current) clearTimeout(firmaDebounceRef.current);

    if (searchValue.trim().length < 2) {
      setFirmaSuggestions([]);
      setShowFirmaSuggestions(false);
      return;
    }

    firmaDebounceRef.current = setTimeout(async () => {
      // Enes Doğanay | 8 Nisan 2026: Firma arama — onayli_hesap doğrudan firmalar tablosundan okunuyor
      const { data, error } = await supabase
        .from('firmalar')
        .select('firmaID, firma_adi, il_ilce, logo_url, adres, telefon, onayli_hesap')
        .ilike('firma_adi', `%${searchValue.trim()}%`)
        .limit(8);

      if (!error && data && data.length > 0) {
        const enriched = data.map((f) => ({
          ...f,
          isManaged: f.onayli_hesap === true
        }));
        setFirmaSuggestions(enriched);
        setShowFirmaSuggestions(true);
      } else if (!error) {
        setFirmaSuggestions([]);
        setShowFirmaSuggestions(false);
      }
    }, 300);
  };

  /* Enes Doğanay | 8 Nisan 2026: Listeden firma seçildiğinde formu otomatik doldur */
  /* Enes Doğanay | 8 Nisan 2026: İl/ilçe/adres/telefon bilgisi de firmadan çekilir */
  /* Enes Doğanay | 8 Nisan 2026: il_ilce hem virgül hem slash formatını destekler, TURKEY_DISTRICTS'e göre doğrular */
  const handleFirmaSelect = (firma) => {
    let parsedIl = '';
    let parsedIlce = '';
    if (firma.il_ilce) {
      // Hem virgül hem slash ile ayırmayı dene: "İstanbul, Bahçelievler" veya "Tuzla/İstanbul"
      const separator = firma.il_ilce.includes(',') ? ',' : '/';
      const parts = firma.il_ilce.split(separator).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        // Hangisi İl (TURKEY_DISTRICTS key'i) kontrol et
        if (TURKEY_DISTRICTS[parts[0]]) {
          parsedIl = parts[0];
          parsedIlce = parts[1];
        } else if (TURKEY_DISTRICTS[parts[1]]) {
          parsedIl = parts[1];
          parsedIlce = parts[0];
        } else {
          parsedIl = parts[0];
          parsedIlce = parts[1];
        }
      } else if (parts.length === 1 && TURKEY_DISTRICTS[parts[0]]) {
        parsedIl = parts[0];
      }
    }

    setCorporateForm((prev) => ({
      ...prev,
      listedCompanyName: firma.firma_adi,
      selectedFirmaId: firma.firmaID,
      ...(parsedIl ? { companyIl: parsedIl } : {}),
      ...(parsedIlce ? { companyIlce: parsedIlce } : {}),
      ...(firma.adres ? { companyOpenAddress: firma.adres } : {}),
      ...(firma.telefon ? { companyPhone: firma.telefon } : {})
    }));
    setShowFirmaSuggestions(false);
    setFirmaSuggestions([]);
  };

  /* Enes Doğanay | 8 Nisan 2026: Suggestions dışına tıklayınca kapat */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (firmaSearchRef.current && !firmaSearchRef.current.contains(e.target)) {
        setShowFirmaSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enes Doğanay | 6 Nisan 2026: Bireysel kayit mevcut auth akisini korur
  const handleIndividualSubmit = async (event) => {
    event.preventDefault();

    if (!termsAccepted) {
      showMessage('error', 'Lütfen hizmet şartlarını ve gizlilik politikasını kabul edin.');
      return;
    }

    /* Enes Doğanay | 11 Nisan 2026: Şifre tekrarı kontrolü */
    if (password !== passwordConfirm) {
      showMessage('error', 'Şifreler uyuşmuyor. Lütfen aynı şifreyi girdiğinizden emin olun.');
      return;
    }

    setLoading(true);
    setNotification({ show: false, type: '', message: '' });

    try {
      // Enes Doğanay | 7 Nisan 2026: Bireysel kayit oncesi e-posta musaitlik kontrolu
      // Enes Doğanay | 13 Nisan 2026: finally bloğu setLoading(false) yaptığı için burada tekrar gerekmiyor
      const emailCheck = await checkEmailAvailability(email);
      if (emailCheck && !emailCheck.available) {
        showMessage('error', emailCheck.reason);
        return;
      }

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

  // Enes Doğanay | 8 Nisan 2026: Kurumsal form zorunlu alan doğrulaması — sadece verificationNote ve taxDocument opsiyonel
  const validateCorporateForm = () => {
    const errors = {};
    const requiredFields = [
      { key: 'applicantFirstName', label: 'Başvuran Adı' },
      { key: 'applicantLastName', label: 'Başvuran Soyadı' },
      { key: 'applicantTitle', label: 'Pozisyon' },
      { key: 'phone', label: 'Başvuranın Telefon Numarası' },
      { key: 'listedCompanyName', label: 'Şirket Adı' },
      { key: 'websiteUrl', label: 'Web Sitesi' },
      { key: 'corporateEmail', label: 'Kurumsal E-posta' },
      { key: 'companyPhone', label: 'Şirket Telefon Numarası' },
      { key: 'companyIl', label: 'İl' },
      { key: 'companyIlce', label: 'İlçe' },
      { key: 'companyOpenAddress', label: 'Açık Adres' },
      { key: 'taxOffice', label: 'Vergi Dairesi' },
      { key: 'taxNumber', label: 'Vergi Numarası' }
    ];
    requiredFields.forEach(({ key, label }) => {
      if (!String(corporateForm[key] || '').trim()) {
        errors[key] = `${label} alanını doldurunuz.`;
      }
    });
    return errors;
  };

  // Enes Doğanay | 6 Nisan 2026: Kurumsal sekme kullanici olusturmak yerine admin incelemesine giden basvuru olusturur
  // Enes Doğanay | 8 Nisan 2026: Vergi levhası dosyası varsa Storage'a yükle, URL'yi metadata'ya ekle
  // Enes Doğanay | 8 Nisan 2026: form yerine div kullanıldığı için event parametresi kaldırıldı — Chrome adres popup engeli
  const handleCorporateSubmit = async () => {

    // Enes Doğanay | 8 Nisan 2026: Zorunlu alan doğrulaması
    const errors = validateCorporateForm();
    setCorporateErrors(errors);
    if (Object.keys(errors).length > 0) {
      showMessage('error', 'Lütfen kırmızı ile işaretlenen eksik alanları doldurun.');
      return;
    }

    if (!termsAccepted) {
      showMessage('error', 'Lütfen hizmet şartlarını ve gizlilik politikasını kabul edin.');
      return;
    }

    setLoading(true);
    setNotification({ show: false, type: '', message: '' });

    try {
      // Enes Doğanay | 7 Nisan 2026: Kurumsal kayit oncesi e-posta musaitlik kontrolu
      // Enes Doğanay | 13 Nisan 2026: finally bloğu setLoading(false) yaptığı için burada tekrar gerekmiyor
      const emailCheck = await checkEmailAvailability(corporateForm.corporateEmail);
      if (emailCheck && !emailCheck.available) {
        showMessage('error', emailCheck.reason);
        return;
      }

      // Enes Doğanay | 8 Nisan 2026: Vergi levhası private 'tax-documents' bucket'ına yüklenir
      let taxDocumentUrl = null;
      if (corporateForm.taxDocument) {
        const file = corporateForm.taxDocument;
        const fileExt = file.name.split('.').pop();
        const fileName = `vergi-levhasi-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('tax-documents')
          .upload(fileName, file);
        if (uploadError) {
          console.error('Vergi levhası yükleme hatası:', uploadError);
        } else {
          // Private bucket — sadece dosya yolunu sakla, admin signed URL ile açar
          taxDocumentUrl = fileName;
        }
      }

      const submissionData = { ...corporateForm, taxDocumentUrl };
      const result = await submitCorporateApplication(submissionData);
      setCorporateSubmittedApplication(result.application || null);
      setCorporateForm(initialCorporateForm);
      setTermsAccepted(false);
      showMessage('success', 'Kurumsal başvurunuz başarıyla alındı! Ekibimiz başvurunuzu en kısa sürede inceleyecek ve sonucu e-posta ile size bildirecektir.');
    } catch (error) {
      showMessage('error', error.message || 'Kurumsal başvuru oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <SEO title="Kayıt Ol" description="Tedport'a ücretsiz kayıt olun. Tedarikçi ağına katılın." path="/register" noIndex />
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
                /* Enes Doğanay | 8 Nisan 2026: form yerine div kullanıldı, Chrome adres kaydetme popup'ını tamamen engellemek için */
                <div className="form-body corporate-form-body">
                  <div className="form-row">
                    <div className="input-group">
                      <label>Başvuran Adı</label>
                      <input className={`form-input${corporateErrors.applicantFirstName ? ' form-input--error' : ''}`} type="text" placeholder="Adınızı girin" value={corporateForm.applicantFirstName} onChange={(event) => handleCorporateInputChange('applicantFirstName', event.target.value)} name="crp_fn_x" autoComplete="one-time-code" />
                      {corporateErrors.applicantFirstName && <span className="field-error-text">{corporateErrors.applicantFirstName}</span>}
                    </div>
                    <div className="input-group">
                      <label>Başvuran Soyadı</label>
                      <input className={`form-input${corporateErrors.applicantLastName ? ' form-input--error' : ''}`} type="text" placeholder="Soyadınızı girin" value={corporateForm.applicantLastName} onChange={(event) => handleCorporateInputChange('applicantLastName', event.target.value)} name="crp_ln_x" autoComplete="one-time-code" />
                      {corporateErrors.applicantLastName && <span className="field-error-text">{corporateErrors.applicantLastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Pozisyonunuz</label>
                      <input className={`form-input${corporateErrors.applicantTitle ? ' form-input--error' : ''}`} type="text" placeholder="Örn. Kurucu, Satın Alma Müdürü" value={corporateForm.applicantTitle} onChange={(event) => handleCorporateInputChange('applicantTitle', event.target.value)} />
                      {corporateErrors.applicantTitle && <span className="field-error-text">{corporateErrors.applicantTitle}</span>}
                    </div>
                    <div className="input-group">
                      {/* Enes Doğanay | 8 Nisan 2026: "Telefon Numarası" → "Başvuranın Telefon Numarası" */}
                      <label>Başvuranın Telefon Numarası</label>
                      <div className="input-wrapper">
                        <input className={`form-input${corporateErrors.phone ? ' form-input--error' : ''}`} type="tel" placeholder="0 (XXX) XXX XX XX" value={corporateForm.phone} onChange={(event) => handleCorporateInputChange('phone', event.target.value)} name="crp_ph_x" autoComplete="one-time-code" />
                        <span className="material-symbols-outlined input-icon">phone</span>
                      </div>
                      {corporateErrors.phone && <span className="field-error-text">{corporateErrors.phone}</span>}
                    </div>
                  </div>

                  {/* Enes Doğanay | 8 Nisan 2026: Şirket Adı ve Tedport firma alanı birleştirildi — tek alan + autocomplete */}
                  <div className="input-group" ref={firmaSearchRef} style={{ position: 'relative' }}>
                    <label>Tedport'ta Görünmesini İstediğiniz İçin Başvurduğunuz Şirket</label>
                    <div className="input-wrapper">
                      <input
                        className={`form-input${corporateForm.selectedFirmaId ? ' form-input--matched' : ''}${corporateErrors.listedCompanyName ? ' form-input--error' : ''}`}
                        type="text"
                        placeholder="Şirket adını yazın — Tedport'ta kayıtlıysa listeden seçin"
                        value={corporateForm.listedCompanyName}
                        onChange={(event) => handleFirmaSearch(event.target.value)}
                        onFocus={() => { if (firmaSuggestions.length > 0) setShowFirmaSuggestions(true); }}
                        autoComplete="off"
                      />
                      <span className="material-symbols-outlined input-icon">
                        {corporateForm.selectedFirmaId ? 'check_circle' : 'search'}
                      </span>
                    </div>
                    {corporateForm.selectedFirmaId && (
                      <span className="field-hint field-hint--success">
                        <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>link</span>
                        Mevcut firma kaydı eşleştirildi — onay sonrası bu firma sayfasının yönetimi size bağlanacak.
                      </span>
                    )}
                    {!corporateForm.selectedFirmaId && corporateForm.listedCompanyName && (
                      <span className="field-hint">Listede yoksa yeni firma kaydı oluşturulur.</span>
                    )}
                    {showFirmaSuggestions && firmaSuggestions.length > 0 && (
                      <div className="firma-autocomplete-dropdown">
                        {firmaSuggestions.map((firma) => (
                          <button
                            key={firma.firmaID}
                            type="button"
                            className={`firma-autocomplete-item${firma.isManaged ? ' firma-autocomplete-item--managed' : ''}`}
                            onClick={() => !firma.isManaged && handleFirmaSelect(firma)}
                            disabled={firma.isManaged}
                          >
                            <div className="firma-autocomplete-avatar">
                              {firma.logo_url ? (
                                <img src={firma.logo_url} alt="" loading="lazy" />
                              ) : (
                                <span>{firma.firma_adi?.charAt(0)}</span>
                              )}
                            </div>
                            <div className="firma-autocomplete-info">
                              <span className="firma-autocomplete-name">{firma.firma_adi}</span>
                              {firma.il_ilce && <span className="firma-autocomplete-location">{firma.il_ilce}</span>}
                            </div>
                            {firma.isManaged && (
                              <span className="firma-autocomplete-managed-badge">
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
                                Yönetiliyor
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {corporateErrors.listedCompanyName && <span className="field-error-text">{corporateErrors.listedCompanyName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Web Sitesi</label>
                      <div className="input-wrapper">
                        <input className={`form-input${corporateErrors.websiteUrl ? ' form-input--error' : ''}`} type="text" placeholder="ornekfirma.com" value={corporateForm.websiteUrl} onChange={(event) => handleCorporateInputChange('websiteUrl', event.target.value)} name="crp_ws_x" autoComplete="one-time-code" />
                        <span className="material-symbols-outlined input-icon">language</span>
                      </div>
                      {corporateErrors.websiteUrl && <span className="field-error-text">{corporateErrors.websiteUrl}</span>}
                    </div>
                    <div className="input-group">
                      <label>Kurumsal E-posta</label>
                      <div className="input-wrapper">
                        <input className={`form-input${corporateErrors.corporateEmail ? ' form-input--error' : ''}`} type="email" placeholder="tedport@sirketiniz.com" value={corporateForm.corporateEmail} onChange={(event) => handleCorporateInputChange('corporateEmail', event.target.value)} name="crp_ce_x" autoComplete="one-time-code" />
                        <span className="material-symbols-outlined input-icon">mail</span>
                      </div>
                      <span className="field-hint">Test için kişisel e-posta kullanabilirsiniz; canlıda şirket adresi tercih edilir.</span>
                      {corporateErrors.corporateEmail && <span className="field-error-text">{corporateErrors.corporateEmail}</span>}
                    </div>
                  </div>
                  {/* Enes Doğanay | 8 Nisan 2026: Şirket Telefon Numarası — firma autocomplete'den sonra */}
                  <div className="input-group">
                    <label>Şirket Telefon Numarası</label>
                    <div className="input-wrapper">
                      <input className={`form-input${corporateErrors.companyPhone ? ' form-input--error' : ''}`} type="tel" placeholder="0 (2XX) XXX XX XX" value={corporateForm.companyPhone} onChange={(event) => handleCorporateInputChange('companyPhone', event.target.value)} name="crp_cph_x" autoComplete="one-time-code" />
                      <span className="material-symbols-outlined input-icon">phone</span>
                    </div>
                    {corporateErrors.companyPhone && <span className="field-error-text">{corporateErrors.companyPhone}</span>}
                  </div>

                  {/* Enes Doğanay | 8 Nisan 2026: İl/İlçe dropdown + Açık Adres bloğu — eski textarea yerine */}
                  <fieldset className="corporate-address-block">
                    <legend>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>location_on</span>
                      İletişim ve Konum
                    </legend>
                    <div className="form-row">
                      <div className="input-group">
                        <label>İl</label>
                        <select
                          className={`form-input form-select${corporateErrors.companyIl ? ' form-input--error' : ''}`}
                          value={corporateForm.companyIl}
                          onChange={(event) => {
                            handleCorporateInputChange('companyIl', event.target.value);
                            handleCorporateInputChange('companyIlce', '');
                          }}
                        >
                          <option value="">İl seçin</option>
                          {Object.keys(TURKEY_DISTRICTS).sort((a, b) => a.localeCompare(b, 'tr')).map((il) => (
                            <option key={il} value={il}>{il}</option>
                          ))}
                        </select>
                        {corporateErrors.companyIl && <span className="field-error-text">{corporateErrors.companyIl}</span>}
                      </div>
                      <div className="input-group">
                        <label>İlçe</label>
                        <select
                          className={`form-input form-select${corporateErrors.companyIlce ? ' form-input--error' : ''}`}
                          value={corporateForm.companyIlce}
                          onChange={(event) => handleCorporateInputChange('companyIlce', event.target.value)}
                          disabled={!corporateForm.companyIl}
                        >
                          <option value="">İlçe seçin</option>
                          {(TURKEY_DISTRICTS[corporateForm.companyIl] || []).map((ilce) => (
                            <option key={ilce} value={ilce}>{ilce}</option>
                          ))}
                        </select>
                        {corporateErrors.companyIlce && <span className="field-error-text">{corporateErrors.companyIlce}</span>}
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Açık Adres</label>
                      <input className={`form-input${corporateErrors.companyOpenAddress ? ' form-input--error' : ''}`} type="text" placeholder="Cadde, sokak, bina no, kat / daire" value={corporateForm.companyOpenAddress} onChange={(event) => handleCorporateInputChange('companyOpenAddress', event.target.value)} name="crp_adr_x" autoComplete="one-time-code" />
                      {corporateErrors.companyOpenAddress && <span className="field-error-text">{corporateErrors.companyOpenAddress}</span>}
                    </div>
                  </fieldset>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Vergi Dairesi</label>
                      <input className={`form-input${corporateErrors.taxOffice ? ' form-input--error' : ''}`} type="text" placeholder="Vergi dairesini girin" value={corporateForm.taxOffice} onChange={(event) => handleCorporateInputChange('taxOffice', event.target.value)} name="crp_to_x" autoComplete="one-time-code" />
                      {corporateErrors.taxOffice && <span className="field-error-text">{corporateErrors.taxOffice}</span>}
                    </div>
                    <div className="input-group">
                      <label>Vergi Numarası</label>
                      <input className={`form-input${corporateErrors.taxNumber ? ' form-input--error' : ''}`} type="text" placeholder="Vergi numarasını girin" value={corporateForm.taxNumber} onChange={(event) => handleCorporateInputChange('taxNumber', event.target.value)} name="crp_tn_x" autoComplete="one-time-code" />
                      {corporateErrors.taxNumber && <span className="field-error-text">{corporateErrors.taxNumber}</span>}
                    </div>
                  </div>

                  {/* Enes Doğanay | 8 Nisan 2026: Doğrulama Notu opsiyonel yapıldı */}
                  <div className="input-group">
                    <label>Doğrulama Notu <span className="field-optional">(Opsiyonel)</span></label>
                    <textarea className="form-textarea" placeholder="Şirket sahipliği, ticaret sicili, mevcut firma kaydıyla bağınız veya incelemeyi hızlandıracak notları yazın" value={corporateForm.verificationNote} onChange={(event) => handleCorporateInputChange('verificationNote', event.target.value)} />
                  </div>

                  {/* Enes Doğanay | 8 Nisan 2026: Vergi levhası yükleme (opsiyonel) + teşvik notu */}
                  <div className="input-group">
                    <label>Vergi Levhası <span className="field-optional">(Opsiyonel)</span></label>
                    <div className="tax-doc-upload">
                      <label className="tax-doc-upload-area" htmlFor="taxDocInput">
                        <span className="material-symbols-outlined tax-doc-upload-icon">
                          {corporateForm.taxDocument ? 'task' : 'upload_file'}
                        </span>
                        <span className="tax-doc-upload-text">
                          {corporateForm.taxDocument ? corporateForm.taxDocument.name : 'Vergi levhasını yüklemek için tıklayın'}
                        </span>
                        <input
                          id="taxDocInput"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={(event) => {
                            if (event.target.files && event.target.files[0]) {
                              handleCorporateInputChange('taxDocument', event.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {corporateForm.taxDocument && (
                        <button type="button" className="tax-doc-remove" onClick={() => handleCorporateInputChange('taxDocument', null)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                    <div className="tax-doc-boost-note">
                      <span className="material-symbols-outlined tax-doc-boost-icon">trending_up</span>
                      <span>Vergi levhası eklemek başvurunuzun <strong>onaylanma ihtimalini önemli ölçüde artırır</strong> ve inceleme sürecini hızlandırır.</span>
                    </div>
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

                  <button type="button" className="register-btn-primary register-btn-submit" disabled={loading} onClick={handleCorporateSubmit}>
                    {loading ? 'Başvurunuz Gönderiliyor...' : 'Kurumsal Başvuru Gönder'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form className="form-body" onSubmit={handleIndividualSubmit}>
              {/* Enes Doğanay | 14 Nisan 2026: Google ile kayıt ol butonu */}
              <button
                type="button"
                className="register-google-btn"
                onClick={async () => {
                  {/* Enes Doğanay | 14 Nisan 2026: Google OAuth sonrası ana sayfaya yönlendir */}
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/` }
                  });
                  if (error) showMessage('error', 'Google ile giriş başarısız: ' + error.message);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Google ile Kayıt Ol
              </button>
              {/* Enes Doğanay | 15 Nisan 2026: LinkedIn ile kayıt ol butonu */}
              <button
                type="button"
                className="register-linkedin-btn"
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'linkedin_oidc',
                    options: { redirectTo: `${window.location.origin}/` }
                  });
                  if (error) showMessage('error', 'LinkedIn ile giriş başarısız: ' + error.message);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                LinkedIn ile Kayıt Ol
              </button>
              <div className="register-divider">
                <span>veya</span>
              </div>

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

              {/* Enes Doğanay | 11 Nisan 2026: Şifre tekrarı alanı */}
              <div className="input-group">
                <label>Şifre Tekrarı</label>
                <div className="input-wrapper">
                  <input className={`form-input${passwordConfirm && password !== passwordConfirm ? ' form-input--error' : ''}`} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required />
                  <span className="material-symbols-outlined input-icon">lock</span>
                </div>
                {passwordConfirm && password !== passwordConfirm && (
                  <span className="field-error-text">Şifreler uyuşmuyor</span>
                )}
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