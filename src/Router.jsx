// Enes Doğanay | 7 Nisan 2026: Sayfa geçişlerinde logolu yükleniyor ekranı göstermek için lazy + Suspense eklendi
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import PageLoader from './PageLoader';

/* Enes Doğanay | 11 Nisan 2026: Home2 → Home olarak yeniden adlandırıldı */
const Home = lazy(() => import('./Home'));
const Firmalar = lazy(() => import('./Firmalar'));
const FirmaDetay = lazy(() => import('./FirmaDetay'));
const Login = lazy(() => import('./Login'));
const Profile = lazy(() => import('./Profile'));
const Register = lazy(() => import('./Register'));
const Hakkimizda = lazy(() => import('./hakkimizda'));
const Iletisim = lazy(() => import('./iletisim'));
const Ihaleler = lazy(() => import('./Ihaleler'));
const EmailConfirm = lazy(() => import('./EmailConfirmation'));
const ResetPassword = lazy(() => import('./ResetPassword'));
const AdminCorporateApplications = lazy(() => import('./AdminCorporateApplications'));
/* Enes Doğanay | 13 Nisan 2026: Admin firma düzenleme sayfası */
const AdminFirmaDuzenle = lazy(() => import('./AdminFirmaDuzenle'));
/* Enes Doğanay | 14 Nisan 2026: Admin iletişim mesajları yönetim sayfası */
const AdminContactMessages = lazy(() => import('./AdminContactMessages'));
const AdminChatbotTraining = lazy(() => import('./AdminChatbotTraining'));
const FirmaProfil = lazy(() => import('./FirmaProfil'));
/* Enes Doğanay | 10 Nisan 2026: E-posta değişikliği onay başarı sayfası */
const EmailChangeSuccess = lazy(() => import('./EmailChangeSuccess'));
/* Enes Doğanay | 16 Nisan 2026: 404 sayfa bulunamadı */
const NotFound = lazy(() => import('./NotFound'));
const Kvkk = lazy(() => import('./Kvkk'));
const HizmetSartlari = lazy(() => import('./HizmetSartlari'));
const GizlilikPolitikasi = lazy(() => import('./GizlilikPolitikasi'));
const SSS = lazy(() => import('./SSS'));
// Enes Doğanay | 2 Mayıs 2026: Admin Onay Merkezi — etiket ve logo onaylama sayfası
const AdminEtiketOnay = lazy(() => import('./AdminEtiketOnay'));
// Enes Doğanay | 2 Mayıs 2026: Admin Mesaj Şikayetleri sayfası
const AdminMesajSikayetleri = lazy(() => import('./AdminMesajSikayetleri'));

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
        {/* Enes Doğanay | 16 Nisan 2026: Tanımsız rotalar için 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}