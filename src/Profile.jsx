import React, { useEffect, useState } from "react";
import "./Profile.css";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // 1️⃣ Kullanıcı kontrolü
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        navigate("/login"); // login'e at
        return;
      }

      setUser(userData.user);

      // 2️⃣ Profiles tablosundan veri çek
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        console.error("Profil verisi alınamadı:", profileError);
      } else {
        setProfile(profileData);
      }

      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div style={{ padding: 50 }}>Yükleniyor...</div>;
  }

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <h2>Tedport</h2>
        </div>

        <div className="header-right">
          <button className="help-btn">Yardım</button>
          <div
            className="avatar-small"
            style={{
              backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/150"})`,
            }}
          />
        </div>
      </header>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav>
            <a className="nav-item active">
              <span className="material-symbols-outlined">person</span>
              Profil Bilgileri
            </a>

            <a className="nav-item">
              <span className="material-symbols-outlined">security</span>
              Güvenlik Ayarları
            </a>

            <a className="nav-item">
              <span className="material-symbols-outlined">notifications</span>
              Bildirimler
            </a>

            <a className="nav-item logout" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
              Çıkış Yap
            </a>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="content">
          <div className="card">
            <div className="card-header">
              <div>
                <h1>Profil Bilgileri</h1>
                <p>Kişisel ve kurumsal bilgilerinizi buradan yönetebilirsiniz.</p>
              </div>
              <span className="status">Hesabınız Onaylı</span>
            </div>

            {/* PROFILE SECTION */}
            <div className="profile-section">
              <div
                className="avatar-large"
                style={{
                  backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/300"})`,
                }}
              />

              <div>
                <h3>{profile?.first_name +" " + profile.last_name}</h3>
                <p>
                  {profile?.company_name || "Şirket yok"}
                </p>

                <div className="profile-buttons">
                  <button className="secondary-btn">
                    Fotoğrafı Değiştir
                  </button>
                  <button className="danger-btn">
                    Kaldır
                  </button>
                </div>
              </div>
            </div>

            {/* FIELDS */}
            <ProfileField
              label="Ad Soyad / Şirket Adı"
              value={`${profile?.first_name + " " + profile.last_name || ""} / ${profile?.company_name || ""}`}
            />

            <ProfileField
              label="E-posta Adresi"
              value={user?.email}
              extra="Doğrulanmış"
            />

            <ProfileField
              label="Telefon Numarası"
              value={profile?.phone || "-"}
            />

            <ProfileField
              label="Konum"
              value={profile?.location || "-"}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, extra }) => (
  <div className="field">
    <div>
      <label>{label}</label>
      <p>{value}</p>
      {extra && <span className="verified">{extra}</span>}
    </div>
    <button className="edit-btn">Düzenle</button>
  </div>
);

export default ProfilePage;