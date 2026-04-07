import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import Firmalar from './Firmalar';
import FirmaDetay from './FirmaDetay';
import Login from './Login';
import Profile from './Profile';
import Register from './Register';
import Home2 from './Home2';
import Hakkimizda from './hakkimizda';
import Iletisim from './iletisim';
import Ihaleler from './Ihaleler';
import EmailConfirm from './EmailConfirmation';
import ResetPassword from './ResetPassword';
import AdminCorporateApplications from './AdminCorporateApplications';
import FirmaProfil from './FirmaProfil';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home2 />} />
        <Route path="/home2" element={<Home2 />} />
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
  );
}