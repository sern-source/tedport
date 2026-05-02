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
// Enes Doğanay | 2 Mayıs 2026: Modern dropdown bileşenleri — native select yerine
import CitySelect from './CitySelect';

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
  verificationNote: '',
  authorizationDoc: null
};

const RegistrationPage = () => {
  /* Enes Doğanay | 18 Nisan 2026: Ticari elektronik ileti onay modalı */
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showMarketingTooltip, setShowMarketingTooltip] = useState(false);
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
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

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

  useEffect(() => {
    setShowMarketingModal(false);
    setShowMarketingTooltip(false);
  }, [registrationType]);

  /* Enes Doğanay | 1 Mayıs 2026: Marketing modalı — ESC ile kapat + body scroll kilidi */
  useEffect(() => {
    if (!showMarketingModal) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') setShowMarketingModal(false); };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [showMarketingModal]);

  /* Enes Doğanay | 17 Nisan 2026: Firma detaydan yönlendirmede URL parametrelerinden kurumsal formu doldur */
  useEffect(() => {
    const firmaId = searchParams.get('firmaId');
    const firmaAdi = searchParams.get('firmaAdi');
    if (!firmaId || !firmaAdi) return;

    let parsedIl = '';
    let parsedIlce = '';
    const ilIlce = searchParams.get('ilIlce') || '';
    if (ilIlce) {
      const separator = ilIlce.includes(',') ? ',' : '/';
      const parts = ilIlce.split(separator).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        if (TURKEY_DISTRICTS[parts[0]]) { parsedIl = parts[0]; parsedIlce = parts[1]; }
        else if (TURKEY_DISTRICTS[parts[1]]) { parsedIl = parts[1]; parsedIlce = parts[0]; }
        else { parsedIl = parts[0]; parsedIlce = parts[1]; }
      } else if (parts.length === 1 && TURKEY_DISTRICTS[parts[0]]) {
        parsedIl = parts[0];
      }
    }

    setCorporateForm(prev => ({
      ...prev,
      listedCompanyName: firmaAdi,
      selectedFirmaId: parseInt(firmaId, 10) || null,
      ...(parsedIl ? { companyIl: parsedIl } : {}),
      ...(parsedIlce ? { companyIlce: parsedIlce } : {}),
      ...(searchParams.get('adres') ? { companyOpenAddress: searchParams.get('adres') } : {}),
      ...(searchParams.get('telefon') ? { companyPhone: searchParams.get('telefon') } : {}),
      ...(searchParams.get('webSitesi') ? { websiteUrl: searchParams.get('webSitesi') } : {}),
      ...(searchParams.get('eposta') ? { corporateEmail: searchParams.get('eposta') } : {})
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const logConsent = async (userId) => {
    try {
      let ip = null;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip;
      } catch (_) {}
      await supabase.from('consent_logs').insert([{
        user_id: userId,
        kvkk_accepted: kvkkAccepted,
        marketing_accepted: marketingConsent,
        consent_text_version: '1.0',
        signup_method: 'individual',
        ip_address: ip,
        user_agent: navigator.userAgent,
      }]);
    } catch (_) {}
  };

  // Enes Doğanay | 6 Nisan 2026: Bireysel kayit mevcut auth akisini korur
  const handleIndividualSubmit = async (event) => {
    event.preventDefault();

    if (!kvkkAccepted) {
      showMessage('error', 'Lütfen Hizmet şartları, Gizlilik Politikası ve KVKK Aydınlatma Metni\'ni okuduğunuzu onaylayın.');
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
              avatar: avatarUrl,
              marketing_consent: marketingConsent
            }
          ]);

        if (profileError) {
          throw new Error(profileError.message);
        }

        await logConsent(userId);
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

  // Enes Doğanay | 1 Mayıs 2026: vergi alanları kaldırıldı, authorizationDoc zorunlu hale getirildi
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
      { key: 'companyOpenAddress', label: 'Açık Adres' }
    ];
    requiredFields.forEach(({ key, label }) => {
      if (!String(corporateForm[key] || '').trim()) {
        errors[key] = `${label} alanını doldurunuz.`;
      }
    });
    if (!corporateForm.authorizationDoc) {
      errors.authorizationDoc = 'Lütfen imzalanmış yetkilendirme belgesini yükleyin.';
    }
    return errors;
  };

  const downloadYetkilendirmePdf = () => {
    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Tedport \u2013 Yetkilendirme Belgesi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; padding: 40px 50px; line-height: 1.65; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1e3a5f; }
    .logo { font-size: 22pt; font-weight: 900; letter-spacing: 3px; color: #1e3a5f; }
    .doc-title { font-size: 12pt; font-weight: bold; margin-top: 8px; text-transform: uppercase; color: #1e3a5f; letter-spacing: 0.5px; }
    .doc-date { font-size: 9pt; color: #888; margin-top: 6px; }
    h2 { font-size: 10.5pt; font-weight: bold; color: #1e3a5f; margin: 20px 0 7px; text-transform: uppercase; border-bottom: 1px solid #c8d8ec; padding-bottom: 4px; }
    p { margin-bottom: 7px; font-size: 10.5pt; }
    ul { margin: 4px 0 8px 22px; }
    ul li { margin-bottom: 4px; font-size: 10.5pt; }
    .box { background: #f5f8fc; border: 1px solid #dce8f5; border-radius: 4px; padding: 12px 16px; margin: 8px 0; }
    .party-name { font-weight: bold; font-size: 11pt; }
    .between { text-align: center; font-size: 9pt; color: #888; margin: 6px 0; }
    .field-row { display: flex; gap: 16px; margin-bottom: 10px; }
    .field { flex: 1; }
    .field-label { font-size: 9pt; color: #444; font-weight: bold; margin-bottom: 3px; }
    .field-line { border-bottom: 1.5px solid #333; height: 24px; }
    .notice { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px 14px; font-size: 9.5pt; margin: 18px 0; color: #555; }
    .sig-grid { display: flex; gap: 24px; margin-top: 28px; }
    .sig-box { flex: 1; border: 1px solid #cdd; border-radius: 5px; padding: 14px 16px; }
    .sig-box h3 { font-size: 10pt; font-weight: bold; color: #1e3a5f; margin-bottom: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; text-transform: uppercase; }
    .sig-row { margin-bottom: 12px; }
    .sig-label { font-size: 9pt; color: #555; }
    .sig-line { border-bottom: 1px solid #333; height: 22px; margin-top: 2px; }
    .stamp { height: 70px; border: 1px dashed #bbb; border-radius: 3px; margin-top: 8px; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 8.5pt; }
    .footer { margin-top: 24px; text-align: center; font-size: 8pt; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
    .print-btn { display: block; margin: 0 auto 20px; padding: 9px 28px; background: #1e3a5f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10pt; }
    @media print { .print-btn { display: none !important; } body { padding: 20px 30px; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Yazd\u0131r / PDF Olarak Kaydet</button>
  <div class="header">
    <div class="logo">TEDPORT</div>
    <div class="doc-title">Firma Sayfas\u0131 Y\u00f6netim Yetkilendirme ve Taahhüt Belgesi</div>
    <div class="doc-date">Belge Tarihi: _____ / _____ / _______</div>
  </div>

  <h2>1. Taraflar</h2>
  <p>\u0130\u015fbu Yetkilendirme Belgesi ("Belge");</p>
  <div class="box">
    <p><span class="party-name">[F\u0130RMA \u00dcNVANI]</span></p>
    <p>(MERS\u0130S No: [\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026])</p>
    <p>("Firma")</p>
  </div>
  <div class="between">\u2014 ile \u2014</div>
  <div class="box">
    <p><span class="party-name">Tedport Teknoloji A.\u015e.</span></p>
    <p>("Tedport")</p>
  </div>
  <p style="margin-top:8px">aras\u0131nda d\u00fczenlenmi\u015ftir.</p>

  <h2>2. Ama\u00e7</h2>
  <p>Bu Belge, Firma ad\u0131na Tedport platformunda olu\u015fturulan/olu\u015fturulacak firma sayfas\u0131n\u0131n y\u00f6netimi i\u00e7in yetkilendirilen ki\u015finin belirlenmesi ve yetki kapsam\u0131n\u0131n d\u00fczenlenmesi amac\u0131yla haz\u0131rlanm\u0131\u015ft\u0131r.</p>

  <h2>3. Yetkilendirilen Ki\u015fi Bilgileri</h2>
  <div class="field-row">
    <div class="field"><div class="field-label">Ad Soyad</div><div class="field-line"></div></div>
    <div class="field"><div class="field-label">T.C. Kimlik No</div><div class="field-line"></div></div>
  </div>
  <div class="field-row">
    <div class="field"><div class="field-label">Unvan / G\u00f6rev</div><div class="field-line"></div></div>
    <div class="field"><div class="field-label">Telefon</div><div class="field-line"></div></div>
  </div>
  <div class="field-row">
    <div class="field"><div class="field-label">E-posta</div><div class="field-line"></div></div>
    <div class="field" style="visibility:hidden"><div class="field-label">.</div><div class="field-line"></div></div>
  </div>

  <h2>4. Yetki Kapsam\u0131</h2>
  <p>Firma, yukar\u0131da bilgileri yer alan ki\u015fiyi a\u015fa\u011f\u0131daki i\u015flemleri ger\u00e7ekle\u015ftirmek \u00fczere yetkilendirdi\u011fini kabul eder:</p>
  <ul>
    <li>Firma sayfas\u0131n\u0131 olu\u015fturmak ve d\u00fczenlemek</li>
    <li>\u00dcr\u00fcn/hizmet bilgilerini eklemek ve g\u00fcncellemek</li>
    <li>Platform \u00fczerinden teklif vermek ve ileti\u015fim kurmak</li>
    <li>Kullan\u0131c\u0131 mesajlar\u0131n\u0131 yan\u0131tlamak</li>
    <li>Firma ad\u0131na i\u00e7erik payla\u015fmak</li>
  </ul>
  <p>Bu yetki, Tedport platformu ile s\u0131n\u0131rl\u0131d\u0131r.</p>

  <h2>5. Beyan ve Taahhütler</h2>
  <p>Firma ve yetkili ki\u015fi a\u015fa\u011f\u0131dakilerini <strong>kabul ve taahhüt eder:</strong></p>
  <ul>
    <li>Verilen t\u00fcm bilgilerin do\u011fru ve g\u00fcncel oldu\u011funu,</li>
    <li>Yetkilendirmenin firma i\u00e7i yetkiye dayand\u0131\u011f\u0131n\u0131,</li>
    <li>Tedport'un bu yetkilendirmeyi ayr\u0131ca do\u011frulamakla y\u00fck\u00fcml\u00fc olmad\u0131\u011f\u0131n\u0131,</li>
    <li>Yetkisiz kullan\u0131m veya yanl\u0131\u015f beyan durumunda t\u00fcm sorumlulu\u011fun kendilerine ait oldu\u011funu,</li>
    <li>Platformda yap\u0131lan t\u00fcm i\u015flemlerin firma ad\u0131na yap\u0131lm\u0131\u015f say\u0131laca\u011f\u0131n\u0131.</li>
  </ul>

  <h2>6. Sorumluluk ve Tazminat</h2>
  <p>Firma a\u015fa\u011f\u0131dakilerini kabul eder:</p>
  <ul>
    <li>Yetkili ki\u015finin yapt\u0131\u011f\u0131 t\u00fcm i\u015flemlerden do\u011frudan sorumlu oldu\u011funu,</li>
    <li>Bu i\u015flemler nedeniyle Tedport'un u\u011frayabilece\u011fi her t\u00fcrl\u00fc zarar, talep ve masraf\u0131 tazmin edece\u011fini,</li>
    <li>\u00dc\u00fcnc\u00fc ki\u015filerden gelebilecek taleplerde Tedport'u sorumlu tutmayaca\u011f\u0131n\u0131.</li>
  </ul>

  <h2>7. Yetkinin S\u00fcresi ve Sona Ermesi</h2>
  <ul>
    <li>Bu yetkilendirme, Firma taraf\u0131ndan yaz\u0131l\u0131 olarak geri al\u0131nana kadar ge\u00e7erlidir.</li>
    <li>Yetkinin iptali, Tedport'a yaz\u0131l\u0131 bildirim yap\u0131lmas\u0131 ile h\u00fckm do\u011furur.</li>
    <li>Bildirim yap\u0131lana kadar ger\u00e7ekle\u015ftirilen i\u015flemler ge\u00e7erli say\u0131l\u0131r.</li>
  </ul>

  <h2>8. Do\u011frulama ve Ek Belge Talebi</h2>
  <p>Tedport, gerekli g\u00f6rd\u00fc\u011f\u00fc durumlarda imza sirk\u00fcl\u00e4ri, ticaret sicil gazetesi gibi ek belgeleri talep etme ve yetkilendirmeyi ask\u0131ya alma hakk\u0131n\u0131 sakl\u0131 tutar.</p>

  <h2>9. Elektronik Kay\u0131tlar\u0131n Delil Niteli\u011fi</h2>
  <p>Taraflar, Tedport sistemlerinde tutulan log kay\u0131tlar\u0131, i\u015flem ge\u00e7mi\u015fi ve mesajla\u015fmalar gibi kay\u0131tlar\u0131n Hukuk Muhakemeleri Kanunu \u00e7er\u00e7evesinde kesin delil niteli\u011fi ta\u015f\u0131d\u0131\u011f\u0131n\u0131 kabul eder.</p>

  <h2>10. Ki\u015fisel Veriler</h2>
  <p>Bu belge kapsam\u0131nda payla\u015f\u0131lan ki\u015fisel veriler, 6698 say\u0131l\u0131 Ki\u015fisel Verilerin Korunmas\u0131 Kanunu kapsam\u0131nda i\u015flenecektir. Detayl\u0131 bilgi i\u00e7in <strong>Tedport KVKK Ayd\u0131nlatma Metni</strong> incelenebilir.</p>

  <h2>11. Uyu\u015fmazl\u0131k \u00c7\u00f6z\u00fcm\u00fc</h2>
  <p>\u0130\u015fbu Belge'den do\u011fabilecek uyu\u015fmazl\u0131klarda <strong>\u0130stanbul (Merkez) Mahkemeleri ve \u0130cra Daireleri</strong> yetkilidir.</p>

  <h2>12. Y\u00fcr\u00fcrl\u00fck</h2>
  <p>\u0130\u015fbu Belge, taraflarca imzaland\u0131\u011f\u0131 tarihte y\u00fcr\u00fcrl\u00fc\u011fe girer.</p>

  <div class="notice">
    Bu belgeyi eksiksiz doldurunuz, firma yetkilisi taraf\u0131ndan imzalatınız ve ka\u015fe vuruldu\u011fundan emin olunuz. Ard\u0131ndan taranm\u0131\u015f veya foto\u011fraflanm\u0131\u015f PDF olarak sisteme y\u00fckleyiniz.
  </div>

  <div class="sig-grid">
    <div class="sig-box">
      <h3>Firma Yetkilisi</h3>
      <div class="sig-row"><div class="sig-label">Ad Soyad</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">Unvan</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">Tarih</div><div class="sig-line"></div></div>
      <div class="stamp">\u0130mza / Ka\u015fe Alan\u0131</div>
    </div>
    <div class="sig-box">
      <h3>Yetkilendirilen Ki\u015fi</h3>
      <div class="sig-row"><div class="sig-label">Ad Soyad</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">Tarih</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">\u0130mza</div><div class="sig-line"></div></div>
      <div style="height:70px"></div>
    </div>
  </div>

  <div class="footer">Tedport Teknoloji A.\u015e. | info@tedport.com | www.tedport.com</div>
</body>
</html>`;
    const w = window.open('', '_blank', 'width=900,height=820');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 600);
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Kurumsal sekme kullanici olusturmak yerine admin incelemesine giden basvuru olusturur
  const handleCorporateSubmit = async () => {

    // Enes Doğanay | 8 Nisan 2026: Zorunlu alan doğrulaması
    const errors = validateCorporateForm();
    setCorporateErrors(errors);
    if (Object.keys(errors).length > 0) {
      showMessage('error', 'Lütfen kırmızı ile işaretlenen eksik alanları doldurun.');
      return;
    }

    if (!kvkkAccepted) {
      showMessage('error', 'Lütfen Hizmet şartları, Gizlilik Politikası ve KVKK Aydınlatma Metni\'ni okuduğunuzu onaylayın.');
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

      // Enes Doğanay | 1 Mayıs 2026: Yetkilendirme belgesi zorunlu — tax-documents bucket'ına yükle
      let authorizationDocUrl = null;
      const file = corporateForm.authorizationDoc;
      const fileExt = file.name.split('.').pop();
      const fileName = `yetkilendirme-belgesi-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('tax-documents')
        .upload(fileName, file);
      if (uploadError) {
        throw new Error('Yetkilendirme belgesi yüklenemedi: ' + uploadError.message);
      }
      authorizationDocUrl = fileName;

      const submissionData = { ...corporateForm, authorizationDocUrl };
      const result = await submitCorporateApplication(submissionData);
      setCorporateSubmittedApplication(result.application || null);
      setCorporateForm(initialCorporateForm);
      setKvkkAccepted(false);
      setMarketingConsent(false);
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
                  <p>{corporateSubmittedApplication.company_name} için bıraktığınız kurumsal kayıt talebi admin paneline düştü. En geç 24 saat içinde başvurunuzun sonucunu e-posta ile paylaşacağız.</p>
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
                        {/* Enes Doğanay | 2 Mayıs 2026: Native select → CitySelect */}
                        <CitySelect
                          value={corporateForm.companyIl}
                          onChange={(val) => {
                            handleCorporateInputChange('companyIl', val);
                            handleCorporateInputChange('companyIlce', '');
                          }}
                          placeholder="İl seçin"
                        />
                        {corporateErrors.companyIl && <span className="field-error-text">{corporateErrors.companyIl}</span>}
                      </div>
                      <div className="input-group">
                        <label>İlçe</label>
                        {/* Enes Doğanay | 2 Mayıs 2026: Native select → CitySelect options prop ile */}
                        <CitySelect
                          value={corporateForm.companyIlce}
                          onChange={(val) => handleCorporateInputChange('companyIlce', val)}
                          options={TURKEY_DISTRICTS[corporateForm.companyIl] || []}
                          placeholder={corporateForm.companyIl ? 'İlçe seçin' : 'Önce il seçin'}
                          icon="map"
                        />
                        {corporateErrors.companyIlce && <span className="field-error-text">{corporateErrors.companyIlce}</span>}
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Açık Adres</label>
                      <input className={`form-input${corporateErrors.companyOpenAddress ? ' form-input--error' : ''}`} type="text" placeholder="Cadde, sokak, bina no, kat / daire" value={corporateForm.companyOpenAddress} onChange={(event) => handleCorporateInputChange('companyOpenAddress', event.target.value)} name="crp_adr_x" autoComplete="one-time-code" />
                      {corporateErrors.companyOpenAddress && <span className="field-error-text">{corporateErrors.companyOpenAddress}</span>}
                    </div>
                  </fieldset>

                  {/* Enes Doğanay | 1 Mayıs 2026: Vergi Dairesi/Numarası kaldırıldı */}

                  {/* Enes Doğanay | 8 Nisan 2026: Doğrulama Notu opsiyonel yapıldı */}
                  <div className="input-group">
                    <label>Doğrulama Notu <span className="field-optional">(Opsiyonel)</span></label>
                    <textarea className="form-textarea" placeholder="Şirket sahipliği, ticaret sicili, mevcut firma kaydıyla bağınız veya incelemeyi hızlandıracak notları yazın" value={corporateForm.verificationNote} onChange={(event) => handleCorporateInputChange('verificationNote', event.target.value)} />
                  </div>

                  {/* Yetkilendirme Belgesi — indir, imzala, yükle */}
                  <div className="auth-doc-section">
                    <div className="auth-doc-header">
                      <span className="material-symbols-outlined auth-doc-icon">verified_user</span>
                      <div>
                        <strong className="auth-doc-title">Yetkilendirme Belgesi <span className="required-star">*</span></strong>
                        <p className="auth-doc-desc">Aşağıdaki belgeyi indirin, eksiksiz doldurun, firma yetkilisi tarafından imzalayıp kaşe vurduktan sonra PDF veya görsel olarak yükleyin.</p>
                      </div>
                    </div>
                    <button type="button" className="auth-doc-download-btn" onClick={downloadYetkilendirmePdf}>
                      <span className="material-symbols-outlined">download</span>
                      Yetkilendirme Belgesini İndir
                    </button>
                    <div className={`auth-doc-upload${corporateErrors.authorizationDoc ? ' auth-doc-upload--error' : ''}`}>
                      <label className="auth-doc-upload-area" htmlFor="authDocInput">
                        <span className="material-symbols-outlined auth-doc-upload-icon">
                          {corporateForm.authorizationDoc ? 'task' : 'upload_file'}
                        </span>
                        <span className="auth-doc-upload-text">
                          {corporateForm.authorizationDoc ? corporateForm.authorizationDoc.name : 'İmzalanmış belgeyi yüklemek için tıklayın (PDF, JPG, PNG)'}
                        </span>
                        <input
                          id="authDocInput"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={(event) => {
                            if (event.target.files && event.target.files[0]) {
                              handleCorporateInputChange('authorizationDoc', event.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {corporateForm.authorizationDoc && (
                        <button type="button" className="auth-doc-remove" onClick={() => handleCorporateInputChange('authorizationDoc', null)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                    {corporateErrors.authorizationDoc && <span className="field-error-text">{corporateErrors.authorizationDoc}</span>}
                  </div>


                  <div className="corporate-process-box">
                    <span className="material-symbols-outlined">info</span>
                    <p>Onay geldiğinde hesabınız bizim tarafımızdan oluşturulur. Size gönderilecek şifre belirleme bağlantısıyla hesabınızı aktif edip kurumsal giriş yaparsınız.</p>
                  </div>

                  {/* KVKK onayı */}
                  <div className="checkbox-group">
                    <input type="checkbox" id="terms-corporate" checked={kvkkAccepted} onChange={(event) => setKvkkAccepted(event.target.checked)} />
                    <label htmlFor="terms-corporate" className="checkbox-label checkbox-required">
                      <a href="/hizmet-sartlari" target="_blank" rel="noopener noreferrer" className="text-link-inline">Hizmet Şartları</a>'nı,{' '}
                      <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="text-link-inline">Gizlilik Politikası</a>'nı ve{' '}
                      <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-link-inline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. <span className="required-star">*</span>
                    </label>
                  </div>

                  {/* Pazarlama iletişimi — opsiyonel */}
                  <div className="checkbox-group">
                    <input type="checkbox" id="marketing-corporate" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} />
                    <div className="checkbox-label-row">
                      <label htmlFor="marketing-corporate" className="checkbox-label">
                        Yeni tedarik fırsatları, kampanyalar ve bana özel önerilerden haberdar olmak istiyorum.
                      </label>
                      <div className="marketing-info-wrap">
                        <button
                          type="button"
                          className="marketing-info-btn"
                          aria-label="Detaylı bilgi"
                          onClick={() => setShowMarketingTooltip(t => !t)}
                        >
                          <span className="material-symbols-outlined">info</span>
                        </button>
                        {showMarketingTooltip && (
                          <div className="marketing-tooltip">
                            <p className="marketing-tooltip-note">Bu onay tamamen isteğe bağlıdır. Pazarlama amaçlı e-posta/SMS almak için 6563 sayılı Kanun kapsamında açık rızanızı talep ediyoruz.</p>
                            <button
                              type="button"
                              className="marketing-tooltip-detail-btn"
                              onClick={() => { setShowMarketingTooltip(false); setShowMarketingModal(true); }}
                            >
                              Detaylı Metni Gör
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
              <p className="oauth-consent-note">
                Google veya LinkedIn ile devam ederek <a href="/hizmet-sartlari" target="_blank" rel="noopener noreferrer" className="text-link-inline">Hizmet Şartları</a>'nı ve <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="text-link-inline">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
              </p>

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


              {/* KVKK onayı */}
              <div className="checkbox-group">
                <input type="checkbox" id="terms-individual" checked={kvkkAccepted} onChange={(event) => setKvkkAccepted(event.target.checked)} />
                <label htmlFor="terms-individual" className="checkbox-label checkbox-required">
                  <a href="/hizmet-sartlari" target="_blank" rel="noopener noreferrer" className="text-link-inline">Hizmet Şartları</a>'nı,{' '}
                  <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="text-link-inline">Gizlilik Politikası</a>'nı ve{' '}
                  <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-link-inline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. <span className="required-star">*</span>
                </label>
              </div>

              {/* Pazarlama iletişimi — opsiyonel */}
              <div className="checkbox-group">
                <input type="checkbox" id="marketing-individual" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} />
                <div className="checkbox-label-row">
                  <label htmlFor="marketing-individual" className="checkbox-label">
                    Yeni tedarik fırsatları, kampanyalar ve bana özel önerilerden haberdar olmak istiyorum.
                  </label>
                  <div className="marketing-info-wrap">
                    <button
                      type="button"
                      className="marketing-info-btn"
                      aria-label="Detaylı bilgi"
                      onClick={() => setShowMarketingTooltip(t => !t)}
                    >
                      <span className="material-symbols-outlined">info</span>
                    </button>
                    {showMarketingTooltip && (
                      <div className="marketing-tooltip">
                        <p className="marketing-tooltip-note">Bu onay tamamen isteğe bağlıdır. Pazarlama amaçlı e-posta/SMS almak için 6563 sayılı Kanun kapsamında açık rızanızı talep ediyoruz.</p>
                        <button
                          type="button"
                          className="marketing-tooltip-detail-btn"
                          onClick={() => { setShowMarketingTooltip(false); setShowMarketingModal(true); }}
                        >
                          Detaylı Metni Gör
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

      {/* Ticari Elektronik İleti Modal */}
      {showMarketingModal && (
        <div className="reg-modal-overlay" onClick={() => setShowMarketingModal(false)}>
          <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-header">
              <div className="reg-modal-header-inner">
                <span className="material-symbols-outlined reg-modal-icon reg-modal-icon--orange">mark_email_read</span>
                <h2>Ticari Elektronik İleti Onay Metni</h2>
              </div>
              <button type="button" className="reg-modal-close" onClick={() => setShowMarketingModal(false)} aria-label="Kapat">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="reg-modal-body">
              <div className="reg-modal-law-badge"><span className="material-symbols-outlined">balance</span><span>6563 sayılı Ticari İletişim ve Ticari Elektronik İletiler Hakkında Kanun kapsamında hazırlanmıştır.</span></div>
              <section className="reg-modal-section">
                <h3>Açık Rıza Beyanı</h3>
                <p>Tarafıma, Tedport Teknoloji A.Ş. tarafından sunulan ürün ve hizmetlere ilişkin kampanya, tanıtım, fırsat ve bilgilendirme içeriklerinin e-posta ve/veya SMS yoluyla gönderilmesini kabul ediyorum.</p>
                <p>Bu kapsamında kişisel verilerimin iletişim faaliyetlerinin yürütülmesi amacıyla işlenmesine izin veriyorum.</p>
              </section>
              <div className="reg-modal-notice reg-modal-notice--green"><span className="material-symbols-outlined">check_circle</span><span>Bu onay tamamen isteğe bağlıdır. Dilediğiniz zaman <strong>Profil → Bildirim Tercihleri → Pazarlama İletişimi</strong> toggle'ından anında geri alabilirsiniz.</span></div>
            </div>
            <div className="reg-modal-footer reg-modal-footer--split">
              <button type="button" className="reg-modal-decline-btn" onClick={() => setShowMarketingModal(false)}>Hayır, Teşekkürler</button>
              <button type="button" className="reg-modal-accept-btn" onClick={() => { setMarketingConsent(true); setShowMarketingModal(false); }}>
                <span className="material-symbols-outlined">check</span>
                Evet, Kabul Ediyorum
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="page-footer">
        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default RegistrationPage;
