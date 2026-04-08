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
const FirmaProfil = lazy(() => import('./FirmaProfil'));

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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/kurumsal-basvurular" element={<AdminCorporateApplications />} />
        <Route path="/admin/kurumsal-başvurular" element={<AdminCorporateApplications />} />
        {/* Enes Doğanay | 7 Nisan 2026: Kurumsal firma profil sayfası — panel + teklifler + bildirimler */}
        <Route path="/firma-profil" element={<FirmaProfil />} />
        <Route path="/firmadetay/:id" element={<FirmaDetay />} />
      </Route>
    </Routes>
    </Suspense>
  );
}