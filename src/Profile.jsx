import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";
import { supabase } from "./supabaseClient";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cities, setCities] = useState([]); // Şehirler için yeni state
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1️⃣ Kullanıcı kontrolü
      const { data: userData, error: userError } = await supabase.auth.getUser();

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

      // 3️⃣ Şehirler tablosundan şehir listesini çek
      const { data: cityData, error: cityError } = await supabase
        .from("sehirler")
        .select("sehir")
        .order("sehir", { ascending: true });

      if (!cityError && cityData) {
        setCities(cityData.map((c) => c.sehir));
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // 📸 Avatar Yükleme İşlemi
  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      // Supabase Storage'a Yükle
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Public URL'yi Al
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Profiles tablosunu güncelle
      await handleUpdateField("avatar", publicUrl);

    } catch (error) {
      console.error("Fotoğraf yükleme hatası:", error);
      alert("Fotoğraf yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 📝 Veritabanı Alan Güncelleme İşlemi
  const handleUpdateField = async (field, newValue, isEmail = false) => {
    try {
      if (isEmail) {
        // E-posta değişimi Supabase Auth üzerinden de yapılmalı
        const { error: authError } = await supabase.auth.updateUser({ email: newValue });
        if (authError) throw authError;

        // Profiles tablosunu da güncelle
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ email: newValue })
          .eq("id", user.id);
        if (profileError) throw profileError;

        setUser({ ...user, email: newValue });
        alert("E-posta adresi güncellendi. Yeni adresinize onay maili gitmiş olabilir, lütfen kontrol edin.");
      } else {
        // Diğer standart alanları güncelle
        const { error } = await supabase
          .from("profiles")
          .update({ [field]: newValue })
          .eq("id", user.id);

        if (error) throw error;
      }

      // Başarılı olursa arayüzü anında güncelle
      setProfile((prev) => ({ ...prev, [field]: newValue }));
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncellenirken bir hata oluştu: " + error.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 50 }}>Yükleniyor...</div>;
  }

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <h2>Tedport</h2>
          </Link>
        </div>
        <div className="header-right">
          <nav className="nav-links">
            <Link to="/">Anasayfa</Link>
            <Link to="/firmalar">Firmalar</Link>
            <a href="/hakkimizda">Hakkımızda</a>
            <a href="/iletisim">İletişim</a>
          </nav>
          <div className="user-actions">
            <div
              className="avatar-small"
              style={{
                backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/150"})`,
              }}
            />
          </div>
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
              <span className="material-symbols-outlined">favorite</span>
              Favoriler
            </a>

            <a className="nav-item logout" onClick={handleLogout} style={{ cursor: "pointer" }}>
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
                <h3>{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "İsimsiz Kullanıcı"}</h3>
                <p>
                  {profile?.company_name || "Şirket yok"}
                </p>

                <div className="profile-buttons">
                  <button
                    className="secondary-btn"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Yükleniyor..." : "Fotoğrafı Değiştir"}
                  </button>
                  {/* Gizli Dosya Seçici Input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* FIELDS */}
            <ProfileField
              label="Ad"
              value={profile?.first_name || ""}
              dbField="first_name"
              onSave={handleUpdateField}
            />

            <ProfileField
              label="Soyad"
              value={profile?.last_name || ""}
              dbField="last_name"
              onSave={handleUpdateField}
            />

            <ProfileField
              label="Şirket Adı"
              value={profile?.company_name || ""}
              dbField="company_name"
              onSave={handleUpdateField}
            />

            {/* E-posta alanı düzenlenemez (editable={false}) */}
            <ProfileField
              label="E-posta Adresi"
              value={user?.email || ""}
              dbField="email"
              isEmail={true}
              extra="Doğrulanmış"
              onSave={handleUpdateField}
              editable={false}
            />

            <ProfileField
              label="Telefon Numarası"
              value={profile?.phone || "-"}
              dbField="phone"
              onSave={handleUpdateField}
            />

            {/* Konum alanı: Autocomplete özelliği eklendi */}
            <ProfileField
              label="Konum"
              value={profile?.location || "-"}
              dbField="location"
              onSave={handleUpdateField}
              isLocation={true}
              cities={cities}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

// 📝 Düzenlenebilir Özel Input Alanı Bileşeni
const ProfileField = ({ label, value, extra, dbField, isEmail, isLocation, cities = [], onSave, editable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  const handleSaveClick = async () => {
    if (tempValue !== value) {
      await onSave(dbField, tempValue, isEmail);
    }
    setIsEditing(false);
    setShowSuggestions(false);
  };

  const handleCancelClick = () => {
    setTempValue(value || ""); // Eski değere geri döndür
    setIsEditing(false);
    setShowSuggestions(false);
  };

  const handleCitySelect = (city) => {
    setTempValue(city);
    setShowSuggestions(false);
  };

  // Girilen değere göre şehirleri filtrele (Türkçe karakter duyarlı)
  const filteredCities = cities.filter((city) =>
    city.toLocaleLowerCase("tr-TR").includes(tempValue.toLocaleLowerCase("tr-TR"))
  );

  return (
    <div className="field">
      <div style={{ flex: 1, position: "relative" }}>
        <label>{label}</label>
        {isEditing ? (
          <>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => {
                setTempValue(e.target.value);
                if (isLocation) setShowSuggestions(true);
              }}
              onFocus={() => {
                if (isLocation) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Focus kaybolduğunda önerileri kapat, ancak tıklamayı yakalamak için kısa bir gecikme ekle
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              style={{
                display: "block",
                marginTop: "4px",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                width: "100%",
                maxWidth: "320px",
                fontSize: "14px",
                outline: "none",
              }}
              autoFocus
            />

            {/* Konum Önerileri Açılır Menüsü */}
            {isLocation && showSuggestions && filteredCities.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  maxWidth: "320px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  zIndex: 10,
                  marginTop: "4px",
                }}
              >
                {filteredCities.map((city) => (
                  <div
                    key={city}
                    onMouseDown={(e) => e.preventDefault()} // onBlur'un tıklamayı ezmesini engeller
                    onClick={() => handleCitySelect(city)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: "14px",
                      color: "#334155"
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p>{value}</p>
        )}
        {extra && !isEditing && <span className="verified">{extra}</span>}
      </div>

      {/* Sadece editable true ise butonları göster */}
      {editable && (
        isEditing ? (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              className="edit-btn"
              onClick={handleSaveClick}
              style={{ color: "#10b981", fontWeight: "600" }}
            >
              Kaydet
            </button>
            <button
              className="edit-btn"
              onClick={handleCancelClick}
              style={{ color: "#ef4444" }}
            >
              İptal
            </button>
          </div>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Düzenle
          </button>
        )
      )}
    </div>
  );
};

export default ProfilePage;