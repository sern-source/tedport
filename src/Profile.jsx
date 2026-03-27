import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";
import { supabase } from "./supabaseClient";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 📌 DİNAMİK LİSTE VE FAVORİ STATE'LERİ
  const [myLists, setMyLists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  // 📝 INLINE NOT DÜZENLEME STATE'LERİ
  const [editingNoteId, setEditingNoteId] = useState(null); // Düzenlenen favori kartının ID'si
  const [tempNoteText, setTempNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
      if (profileData) setProfile(profileData);

      const { data: cityData } = await supabase.from("sehirler").select("sehir").order("sehir", { ascending: true });
      if (cityData) setCities(cityData.map((c) => c.sehir));

      await fetchListsAndFavorites(userData.user.id);
      setLoading(false);
    };

    fetchData();
  }, [navigate, currentTab]);

  const fetchListsAndFavorites = async (userId) => {
    const { data: listsData } = await supabase.from('kullanici_listeleri').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (listsData) setMyLists(listsData);

    const { data: favsData } = await supabase.from('kullanici_favorileri').select('*').eq('user_id', userId);

    if (favsData && favsData.length > 0) {
      const firmaIds = favsData.map(f => f.firma_id);
      const { data: firmsData } = await supabase.from('firmalar').select('*').in('firmaID', firmaIds);
      const { data: notesData } = await supabase.from('kisisel_notlar').select('*').eq('user_id', userId).in('firma_id', firmaIds);

      const mergedFavorites = favsData.map(fav => {
        const firm = firmsData?.find(f => f.firmaID === fav.firma_id) || {};
        const note = notesData?.find(n => n.firma_id === fav.firma_id);

        return {
          id: fav.id,
          firma_id: fav.firma_id,
          liste_id: fav.liste_id,
          name: firm.firma_adi || "Bilinmeyen Firma",
          category: firm.category_name || "Kategori Yok",
          location: firm.il_ilce || "Konum Yok",
          verified: firm.is_verified || true,
          premium: false,
          note: note ? note.not_metni : "",
          color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        };
      });

      setFavorites(mergedFavorites);
    } else {
      setFavorites([]);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const { data, error } = await supabase.from('kullanici_listeleri').insert([{ user_id: user.id, liste_adi: newListName }]).select().single();
    if (!error && data) {
      setMyLists([...myLists, data]);
      setNewListName("");
      setIsCreatingList(false);
    } else {
      alert("Liste oluşturulamadı.");
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    if (!window.confirm("Bu firmayı favorilerinizden çıkarmak istediğinize emin misiniz?")) return;
    const { error } = await supabase.from('kullanici_favorileri').delete().eq('id', favoriteId);
    if (!error) {
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } else {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  // 📝 INLINE NOT KAYDETME İŞLEMİ
  const handleInlineNoteSave = async (firmaId, favId) => {
    setIsSavingNote(true);
    try {
      const now = new Date().toISOString();

      // Önce kullanıcının bu firmaya ait notu var mı kontrol et
      const { data: existingNote } = await supabase
        .from('kisisel_notlar')
        .select('id')
        .eq('user_id', user.id)
        .eq('firma_id', firmaId)
        .single();

      let newNoteText = tempNoteText.trim();

      if (existingNote) {
        // Varsa güncelle
        await supabase.from('kisisel_notlar').update({ not_metni: newNoteText, updated_at: now }).eq('id', existingNote.id);
      } else if (newNoteText) {
        // Yoksa ve input boş değilse yeni ekle
        await supabase.from('kisisel_notlar').insert([{ user_id: user.id, firma_id: firmaId, not_metni: newNoteText, updated_at: now }]);
      }

      // Başarılıysa arayüzdeki state'i anında güncelle
      setFavorites(prev => prev.map(f => f.id === favId ? { ...f, note: newNoteText } : f));
      setEditingNoteId(null); // Düzenleme modundan çık
    } catch (error) {
      console.error("Not kaydedilirken hata:", error);
      alert("Not kaydedilirken bir hata oluştu.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      await handleUpdateField("avatar", publicUrl);
    } catch (error) {
      alert("Fotoğraf yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateField = async (field, newValue, isEmail = false) => {
    try {
      if (isEmail) {
        const { error: authError } = await supabase.auth.updateUser({ email: newValue });
        if (authError) throw authError;
        const { error: profileError } = await supabase.from("profiles").update({ email: newValue }).eq("id", user.id);
        if (profileError) throw profileError;
        setUser({ ...user, email: newValue });
        alert("E-posta adresi güncellendi. Yeni adresinize onay maili gitmiş olabilir, lütfen kontrol edin.");
      } else {
        const { error } = await supabase.from("profiles").update({ [field]: newValue }).eq("id", user.id);
        if (error) throw error;
      }
      setProfile((prev) => ({ ...prev, [field]: newValue }));
    } catch (error) {
      alert("Güncellenirken bir hata oluştu: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: 50 }}>Yükleniyor...</div>;

  const displayedFavorites = selectedListId ? favorites.filter(fav => fav.liste_id === selectedListId) : favorites;

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            {/* LOGO BURAYA EKLENDİ */}
            <img
              src="/tedport-logo.jpg"
              alt="Tedport Logo"
              style={{ height: '50px', objectFit: 'contain' }}
            />
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
            <div className="avatar-small" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/150"})` }} />
          </div>
        </div>
      </header>

      <div className="layout" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', display: 'flex', gap: '30px' }}>

        {/* SIDEBAR */}
        <aside className="sidebar" style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-small" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/150"})`, width: '40px', height: '40px' }} />
            <div>
              <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Kullanıcı"}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{profile?.company_name || "Şirket Yok"}</div>
            </div>
          </div>

          <nav style={{ background: '#fff', borderRadius: '12px', padding: '10px', border: '1px solid #e2e8f0' }}>
            <a className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'profile' })} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', color: currentTab === 'profile' ? '#1d4ed8' : '#475569', background: currentTab === 'profile' ? '#eff6ff' : 'transparent', fontWeight: currentTab === 'profile' ? '600' : '400' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span> Profil Bilgileri
            </a>
            <a className={`nav-item ${currentTab === 'favorites' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'favorites' })} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', color: currentTab === 'favorites' ? '#1d4ed8' : '#475569', background: currentTab === 'favorites' ? '#eff6ff' : 'transparent', fontWeight: currentTab === 'favorites' ? '600' : '400' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>favorite</span> Favorilerim
            </a>

            <a className="nav-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: '#475569' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span> Bildirimler
            </a>
            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '10px 0' }} />
            <a className="nav-item logout" onClick={handleLogout} style={{ cursor: "pointer", display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: '#ef4444' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span> Çıkış Yap
            </a>
          </nav>

          {currentTab === 'favorites' && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 15px 0', letterSpacing: '0.5px' }}>LİSTELERİM</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div onClick={() => setSelectedListId(null)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: selectedListId === null ? '#1d4ed8' : '#475569', background: selectedListId === null ? '#eff6ff' : 'transparent', fontWeight: selectedListId === null ? '600' : '400' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>folder_special</span> Tüm Favoriler</span>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '12px', fontSize: '11px', color: '#64748b' }}>{favorites.length}</span>
                </div>

                {myLists.map(liste => {
                  const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                  const isSelected = selectedListId === liste.id;
                  return (
                    <div key={liste.id} onClick={() => setSelectedListId(liste.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: isSelected ? '#1d4ed8' : '#475569', background: isSelected ? '#eff6ff' : 'transparent', fontWeight: isSelected ? '600' : '400' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>folder</span> {liste.liste_adi}</span>
                      <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '12px', fontSize: '11px', color: '#64748b' }}>{listCount}</span>
                    </div>
                  );
                })}
              </div>

              {isCreatingList ? (
                <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                  <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste Adı" style={{ flex: 1, padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  <button onClick={handleCreateList} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>Ekle</button>
                  <button onClick={() => setIsCreatingList(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>X</button>
                </div>
              ) : (
                <button onClick={() => setIsCreatingList(true)} style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'transparent', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span> YENİ LİSTE OLUŞTUR
                </button>
              )}
            </div>
          )}

          <div style={{ marginTop: '20px', background: '#1d4ed8', color: '#fff', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Kayıtlı Tedarikçi</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 12px 0' }}>{favorites.length}</div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="content" style={{ flex: 1 }}>

          {currentTab === 'profile' && (
            <div className="card" style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #e2e8f0' }}>
              <div className="card-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '8px' }}>Profil Bilgileri</h1>
                  <p style={{ color: '#64748b', margin: 0 }}>Kişisel ve kurumsal bilgilerinizi buradan yönetebilirsiniz.</p>
                </div>
                <span className="status" style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', height: 'fit-content' }}>Hesabınız Onaylı</span>
              </div>

              <div className="profile-section" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div className="avatar-large" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/300"})`, width: '100px', height: '100px', borderRadius: '50%', backgroundSize: 'cover' }} />
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "İsimsiz Kullanıcı"}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#64748b' }}>{profile?.company_name || "Şirket yok"}</p>
                  <div className="profile-buttons">
                    <button className="secondary-btn" onClick={() => fileInputRef.current.click()} disabled={uploading} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                      {uploading ? "Yükleniyor..." : "Fotoğrafı Değiştir"}
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: "none" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ProfileField label="Ad" value={profile?.first_name || ""} dbField="first_name" onSave={handleUpdateField} />
                <ProfileField label="Soyad" value={profile?.last_name || ""} dbField="last_name" onSave={handleUpdateField} />
                <ProfileField label="Şirket Adı" value={profile?.company_name || ""} dbField="company_name" onSave={handleUpdateField} />
                <ProfileField label="E-posta Adresi" value={user?.email || ""} dbField="email" isEmail={true} extra="Doğrulanmış" onSave={handleUpdateField} editable={false} />
                <ProfileField label="Telefon Numarası" value={profile?.phone || "-"} dbField="phone" onSave={handleUpdateField} />
                <ProfileField label="Konum" value={profile?.location || "-"} dbField="location" onSave={handleUpdateField} isLocation={true} cities={cities} />
              </div>
            </div>
          )}

          {currentTab === 'favorites' && (
            <div style={{ background: '#f8fafc', minHeight: '100%', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 8px 0' }}>
                    {selectedListId === null ? "Tüm Favoriler" : myLists.find(l => l.id === selectedListId)?.liste_adi}
                  </h1>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                    Toplam {displayedFavorites.length} kayıtlı tedarikçi görüntüleniyor.
                  </p>
                </div>
              </div>

              {displayedFavorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '10px' }}>heart_broken</span>
                  <p style={{ color: '#64748b', fontSize: '15px' }}>Bu listede henüz favori firma bulunmuyor.</p>
                  <button onClick={() => navigate('/firmalar')} style={{ marginTop: '15px', padding: '10px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Firmaları Keşfet</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {displayedFavorites.map((fav) => (
                    <div key={fav.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                      <div
                        onClick={() => handleRemoveFavorite(fav.id)}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: '#fee2e2', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="Favorilerden Çıkar"
                      >
                        <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </div>

                      <div style={{ width: '60px', height: '60px', background: fav.color, borderRadius: '8px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                        {fav.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={fav.name}>{fav.name}</span>
                          {fav.verified && <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified</span>}
                          {fav.premium && <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>PREMIUM</span>}
                        </h3>
                        <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>category</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fav.category}</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fav.location}</span>
                        </div>

                        {/* 📝 İNLİNE NOT ALANI */}
                        {editingNoteId === fav.id ? (
                          // Düzenleme Modu
                          <div style={{ background: '#fef9c3', border: '1px solid #fef08a', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#ca8a04' }}>edit_note</span>
                              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ca8a04' }}>NOTU DÜZENLE</span>
                            </div>
                            <textarea
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              style={{
                                width: '100%', minHeight: '60px', padding: '8px',
                                borderRadius: '6px', border: '1px solid #fde047',
                                background: '#fffbeb', fontSize: '12px', outline: 'none',
                                resize: 'vertical', color: '#854d0e', fontFamily: 'inherit',
                                boxSizing: 'border-box'
                              }}
                              placeholder="Bu firma hakkında notunuz..."
                              autoFocus
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                              <button onClick={() => setEditingNoteId(null)} style={{ fontSize: '11px', color: '#a16207', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '4px' }}>İptal</button>
                              <button onClick={() => handleInlineNoteSave(fav.firma_id, fav.id)} disabled={isSavingNote} style={{ fontSize: '11px', color: '#fff', background: '#ca8a04', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontWeight: '600' }}>
                                {isSavingNote ? '...' : 'Kaydet'}
                              </button>
                            </div>
                          </div>
                        ) : fav.note ? (
                          // Gösterim Modu (Not var)
                          <div style={{ background: '#fef9c3', border: '1px solid #fef08a', borderRadius: '8px', padding: '12px', marginBottom: '20px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>edit_note</span> NOTLARIM
                              </span>
                              <span onClick={() => { setEditingNoteId(fav.id); setTempNoteText(fav.note); }} style={{ fontSize: '10px', color: '#a16207', cursor: 'pointer', fontWeight: '500' }}>Düzenle</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#854d0e', fontStyle: 'italic', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              "{fav.note}"
                            </p>
                          </div>
                        ) : (
                          // Gösterim Modu (Not yok)
                          <div onClick={() => { setEditingNoteId(fav.id); setTempNoteText(""); }} style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f8fafc'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span> Not Ekle
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                        <button style={{ flex: 1, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate(`/firmadetay/${fav.firma_id}`)}>
                          Profili Gör
                        </button>
                        <button onClick={() => handleRemoveFavorite(fav.id)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'} title="Sil">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, extra, dbField, isEmail, isLocation, cities = [], onSave, editable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { setTempValue(value || ""); }, [value]);

  const handleSaveClick = async () => {
    if (tempValue !== value) { await onSave(dbField, tempValue, isEmail); }
    setIsEditing(false); setShowSuggestions(false);
  };
  const handleCancelClick = () => { setTempValue(value || ""); setIsEditing(false); setShowSuggestions(false); };
  const handleCitySelect = (city) => { setTempValue(city); setShowSuggestions(false); };

  const filteredCities = cities.filter((city) => city.toLocaleLowerCase("tr-TR").includes(tempValue.toLocaleLowerCase("tr-TR")));

  return (
    <div className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ flex: 1, position: "relative" }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>{label}</label>
        {isEditing ? (
          <>
            <input type="text" value={tempValue} onChange={(e) => { setTempValue(e.target.value); if (isLocation) setShowSuggestions(true); }} onFocus={() => { if (isLocation) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} style={{ display: "block", marginTop: "4px", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", maxWidth: "320px", fontSize: "14px", outline: "none" }} autoFocus />
            {isLocation && showSuggestions && filteredCities.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxWidth: "320px", maxHeight: "200px", overflowY: "auto", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 10, marginTop: "4px" }}>
                {filteredCities.map((city) => (<div key={city} onMouseDown={(e) => e.preventDefault()} onClick={() => handleCitySelect(city)} style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }} onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8fafc")} onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}> {city} </div>))}
              </div>
            )}
          </>
        ) : (<p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{value}</p>)}
        {extra && !isEditing && <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px', fontWeight: '500' }}>{extra}</span>}
      </div>
      {editable && (isEditing ? (<div style={{ display: "flex", gap: "12px", alignItems: "center" }}> <button onClick={handleSaveClick} style={{ color: "#10b981", fontWeight: "600", background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Kaydet</button> <button onClick={handleCancelClick} style={{ color: "#ef4444", fontWeight: "600", background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>İptal</button> </div>) : (<button onClick={() => setIsEditing(true)} style={{ color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Düzenle</button>))}
    </div>
  );
};

export default ProfilePage;