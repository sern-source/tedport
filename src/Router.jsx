// Enes Doğanay | 7 Nisan 2026: Sayfa geçişlerinde logolu yükleniyor ekranı göstermek için lazy + Suspense eklendi
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import PageLoader from './components/PageLoader';

/* Enes Doğanay | 6 Mayıs 2026: Home → pages/Home/HomePage refaktör */
const Home = lazy(() => import('./pages/Home/HomePage'));
const Firmalar = lazy(() => import('./pages/Firmalar/FirmalarPage'));
const FirmaDetay = lazy(() => import('./pages/FirmaDetay/FirmaDetayPage'));
const Login = lazy(() => import('./pages/Auth/LoginPage'));
const Profile = lazy(() => import('./pages/Profile/ProfilePage'));
const Register = lazy(() => import('./pages/Register/RegisterPage'));
/* Enes Doğanay | 6 Mayıs 2026: Statik sayfalar → pages/StaticPages/ */
const Hakkimizda = lazy(() => import('./pages/StaticPages/HakkimizdaPage'));
const Iletisim = lazy(() => import('./pages/StaticPages/IletisimPage'));
// Enes Doğanay | 5 Mayıs 2026: Ihaleler sayfası yeni mimaride
const Ihaleler = lazy(() => import('./pages/Ihaleler/IhalelerPage'));
const EmailConfirm = lazy(() => import('./pages/Auth/EmailConfirmationPage'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const AdminCorporateApplications = lazy(() => import('./pages/Admin/AdminCorporateApplications'));
/* Enes Doğanay | 13 Nisan 2026: Admin firma düzenleme sayfası */
const AdminFirmaDuzenle = lazy(() => import('./pages/Admin/AdminFirmaDuzenle'));
/* Enes Doğanay | 14 Nisan 2026: Admin iletişim mesajları yönetim sayfası */
const AdminContactMessages = lazy(() => import('./pages/Admin/AdminContactMessages'));
const AdminChatbotTraining = lazy(() => import('./pages/Admin/AdminChatbotTraining'));
const FirmaProfil = lazy(() => import('./pages/FirmaProfil/FirmaProfilPage'));
/* Enes Doğanay | 10 Nisan 2026: E-posta değişikliği onay başarı sayfası */
const EmailChangeSuccess = lazy(() => import('./pages/Auth/EmailChangeSuccessPage'));
/* Enes Doğanay | 16 Nisan 2026: 404 sayfa bulunamadı */
const NotFound = lazy(() => import('./pages/StaticPages/NotFoundPage'));
const Kvkk = lazy(() => import('./pages/StaticPages/KvkkPage'));
const HizmetSartlari = lazy(() => import('./pages/StaticPages/HizmetSartlariPage'));
const GizlilikPolitikasi = lazy(() => import('./pages/StaticPages/GizlilikPolitikasiPage'));
const SSS = lazy(() => import('./pages/StaticPages/SSSPage'));
// Enes Doğanay | 2 Mayıs 2026: Admin Onay Merkezi — etiket ve logo onaylama sayfası
const AdminEtiketOnay = lazy(() => import('./pages/Admin/AdminEtiketOnay'));
// Enes Doğanay | 2 Mayıs 2026: Admin Mesaj Şikayetleri sayfası
const AdminMesajSikayetleri = lazy(() => import('./pages/Admin/AdminMesajSikayetleri'));
// Enes Doğanay | 12 Mayıs 2026: Sektör bazlı ihale landing sayfaları — SEO
const SektorLanding = lazy(() => import('./pages/SektorLanding/SektorLandingPage'));

export default function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/* Enes Doğanay | 11 Nisan 2026: Eski /home2 yolu geriye uyumluluk için korundu */}
        <Route path="/home2" element={<Home />} />
        <Route path="/firmalar" element={<Firmalar />} />
        <Route path="/ihaleler" element={<Ihaleler />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hakkimizda" element={<Hakkimizda />} />
        <Route path="/iletisim" element={<Iletisim />} />
        <Route path="/emailconfirmation" element={<EmailConfirm />} />
        {/* Enes Doğanay | 10 Nisan 2026: E-posta değişikliği onay başarı sayfası */}
        <Route path="/email-degisikligi-onay" element={<EmailChangeSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/kurumsal-basvurular" element={<AdminCorporateApplications />} />
        <Route path="/admin/kurumsal-başvurular" element={<AdminCorporateApplications />} />
        {/* Enes Doğanay | 13 Nisan 2026: Admin firma düzenleme sayfası */}
        <Route path="/admin/firma-duzenle" element={<AdminFirmaDuzenle />} />
        {/* Enes Doğanay | 14 Nisan 2026: Admin iletişim mesajları sayfası */}
        <Route path="/admin/iletisim-mesajlari" element={<AdminContactMessages />} />
        {/* Chatbot eğitim yönetim sayfası */}
        <Route path="/admin/chatbot-egitimi" element={<AdminChatbotTraining />} />
        {/* Enes Doğanay | 2 Mayıs 2026: Onay Merkezi route */}
        <Route path="/admin/etiket-onay" element={<AdminEtiketOnay />} />
        {/* Enes Doğanay | 2 Mayıs 2026: Mesaj Şikayetleri route */}
        <Route path="/admin/mesaj-sikayetleri" element={<AdminMesajSikayetleri />} />
        {/* Enes Doğanay | 7 Nisan 2026: Kurumsal firma profil sayfası — panel + teklifler + bildirimler */}
        <Route path="/firma-profil" element={<FirmaProfil />} />
        <Route path="/firmadetay/:id" element={<FirmaDetay />} />
        <Route path="/kvkk" element={<Kvkk />} />
        <Route path="/hizmet-sartlari" element={<HizmetSartlari />} />
        <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
        <Route path="/sss" element={<SSS />} />
        {/* Enes Doğanay | 12 Mayıs 2026: Sektör landing sayfaları — SEO için */}
        <Route path="/ihaleler/sektor/:slug" element={<SektorLanding />} />
        {/* Enes Doğanay | 16 Nisan 2026: Tanımsız rotalar için 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}