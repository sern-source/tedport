import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import Firmalar from './Firmalar';
import FirmaDetay from './FirmaDetay';
import Login from './Login';
import Profile from './Profile';
import Register from './Register';
import Home2 from './Home2';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home2 />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/firmalar" element={<Firmalar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/firmadetay/:id" element={<FirmaDetay />} />
      </Route>
    </Routes>
  );
}