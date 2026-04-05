import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";
import SharedHeader from "./SharedHeader";
import "./SharedHeader.css";
import { supabase } from "./supabaseClient";
import { useNavigate, useSearchParams } from 'react-router-dom';

// Enes Doğanay | 6 Nisan 2026: Deterministik renk üretimi (firma_id hash)
const hashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 50%)`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const mountedRef = useRef(false);
  const fileInputRef = useRef(null);

  const [myLists, setMyLists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Enes Doğanay | 6 Nisan 2026: Favori arama, sıralama, menü ve liste atama
  const [favSearch, setFavSearch] = useState("");
  const [favSort, setFavSort] = useState("newest");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [assigningListId, setAssigningListId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Enes Doğanay | 6 Nisan 2026: select('*') → spesifik sütunlar, console.log temizlendi, is_verified/premium kaldırıldı
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
          navigate("/login");
          return;
        }

        setUser(userData.user);

        const [profileResult, cityResult, listsResult, favsResult] = await Promise.all([
          supabase.from("profiles").select("id, first_name, last_name, company_name, phone, location, avatar, email").eq("id", userData.user.id).single(),
          supabase.from("sehirler").select("sehir").order("sehir", { ascending: true }),
          supabase.from('kullanici_listeleri').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: true }),
          supabase.from('kullanici_favorileri').select('*').eq('user_id', userData.user.id)
        ]);

        const { data: profileData } = profileResult;
        if (profileData) setProfile(profileData);

        const { data: cityData } = cityResult;
        if (cityData) setCities(cityData.map((c) => c.sehir));

        if (listsResult.data) setMyLists(listsResult.data);

        setLoading(false);

        if (favsResult.data && favsResult.data.length > 0) {
          const firmaIds = favsResult.data.map(f => f.firma_id);

          const [firmsData, notesData] = await Promise.all([
            supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds),
            supabase.from('kisisel_notlar').select('*').eq('user_id', userData.user.id).in('firma_id', firmaIds)
          ]);

          const mergedFavorites = favsResult.data.map(fav => {
            const firm = firmsData.data?.find(f => f.firmaID === fav.firma_id) || {};
            const note = notesData.data?.find(n => n.firma_id === fav.firma_id);

            return {
              id: fav.id,
              firma_id: fav.firma_id,
              liste_id: fav.liste_id,
              created_at: fav.created_at,
              name: firm.firma_adi || "Bilinmeyen Firma",
              category: firm.category_name || "Kategori Yok",
              location: firm.il_ilce || "Konum Yok",
              note: note ? note.not_metni : "",
              color: hashColor(fav.firma_id)
            };
          });

          setFavorites(mergedFavorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("fetchData hata:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enes Doğanay | 6 Nisan 2026: Promise.all paralel sorgular
  const fetchListsAndFavorites = async (userId) => {
    const [listsResult, favsResult] = await Promise.all([
      supabase.from('kullanici_listeleri').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('kullanici_favorileri').select('*').eq('user_id', userId)
    ]);

    if (listsResult.data) setMyLists(listsResult.data);

    if (favsResult.data && favsResult.data.length > 0) {
      const firmaIds = favsResult.data.map(f => f.firma_id);

      const [firmsData, notesData] = await Promise.all([
        supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds),
        supabase.from('kisisel_notlar').select('*').eq('user_id', userId).in('firma_id', firmaIds)
      ]);

      const mergedFavorites = favsResult.data.map(fav => {
        const firm = firmsData.data?.find(f => f.firmaID === fav.firma_id) || {};
        const note = notesData.data?.find(n => n.firma_id === fav.firma_id);

        return {
          id: fav.id,
          firma_id: fav.firma_id,
          liste_id: fav.liste_id,
          created_at: fav.created_at,
          name: firm.firma_adi || "Bilinmeyen Firma",
          category: firm.category_name || "Kategori Yok",
          location: firm.il_ilce || "Konum Yok",
          note: note ? note.not_metni : "",
          color: hashColor(fav.firma_id)
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
    const { error } = await supabase.from('kullanici_favorileri').delete().eq('id', favoriteId);
    if (!error) {
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      setConfirmDelete(null);
    } else {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Favoriyi listeye atama
  const handleAssignList = async (favoriteId, listId) => {
    const { error } = await supabase.from('kullanici_favorileri').update({ liste_id: listId }).eq('id', favoriteId);
    if (!error) {
      setFavorites(prev => prev.map(f => f.id === favoriteId ? { ...f, liste_id: listId } : f));
      setAssigningListId(null);
    } else {
      alert("Liste güncellenemedi.");
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
      setEditingNoteId(null);
    } catch (error) {
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

  if (loading) return <div className="page-status">Yükleniyor...</div>;

  // Enes Doğanay | 6 Nisan 2026: Arama + sıralama ile filtreleme
  const displayedFavorites = (() => {
    let result = selectedListId ? favorites.filter(fav => fav.liste_id === selectedListId) : [...favorites];
    if (favSearch.trim()) {
      const q = favSearch.toLowerCase();
      result = result.filter(fav =>
        fav.name.toLowerCase().includes(q) ||
        fav.category.toLowerCase().includes(q) ||
        fav.location.toLowerCase().includes(q)
      );
    }
    switch (favSort) {
      case 'alpha': return [...result].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      case 'alpha-desc': return [...result].sort((a, b) => b.name.localeCompare(a.name, 'tr'));
      case 'oldest': return [...result].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      case 'newest': default: return [...result].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
  })();

  return (
    <>
      <SharedHeader
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Firmalar', href: '/firmalar' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      <div className="page">
        <div className="layout">

          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-user-card">
              <div className="sidebar-avatar" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/150"})` }} />
              <div>
                <div className="sidebar-user-name">{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Kullanıcı"}</div>
                <div className="sidebar-user-company">{profile?.company_name || "Şirket Yok"}</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <a className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'profile' })}>
                <span className="material-symbols-outlined">person</span> Profil Bilgileri
              </a>
              <a className={`nav-item ${currentTab === 'favorites' ? 'active' : ''}`} onClick={() => setSearchParams({ tab: 'favorites' })}>
                <span className="material-symbols-outlined">collections_bookmark</span> Favorilerim
              </a>
              <a className="nav-item">
                <span className="material-symbols-outlined">notifications</span> Bildirimler
              </a>
              <hr className="sidebar-divider" />
              <a className="nav-item logout" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span> Çıkış Yap
              </a>
            </nav>

            {currentTab === 'favorites' && (
              <div className="sidebar-lists">
                <h4>LİSTELERİM</h4>

                <div className="list-items">
                  <div className={`list-item ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
                    <span className="list-item-label"><span className="material-symbols-outlined">folder_special</span> Tüm Favoriler</span>
                    <span className="list-item-count">{favorites.length}</span>
                  </div>

                  {myLists.map(liste => {
                    const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                    return (
                      <div key={liste.id} className={`list-item ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                        <span className="list-item-label"><span className="material-symbols-outlined">folder</span> {liste.liste_adi}</span>
                        <span className="list-item-count">{listCount}</span>
                      </div>
                    );
                  })}
                </div>

                {isCreatingList ? (
                  <div className="create-list-form">
                    <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste Adı" />
                    <button className="btn-add" onClick={handleCreateList}>Ekle</button>
                    <button className="btn-cancel" onClick={() => setIsCreatingList(false)}>X</button>
                  </div>
                ) : (
                  <button className="create-list-btn" onClick={() => setIsCreatingList(true)}>
                    <span className="material-symbols-outlined">add_circle</span> YENİ LİSTE OLUŞTUR
                  </button>
                )}
              </div>
            )}

            <div className="sidebar-stats">
              <div className="sidebar-stats-label">Kayıtlı Tedarikçi</div>
              <div className="sidebar-stats-value">{favorites.length}</div>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="content">

            {currentTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <div className="card-header-inner">
                    <div>
                      <h1>Profil Bilgileri</h1>
                      <p>Kişisel ve kurumsal bilgilerinizi buradan yönetebilirsiniz.</p>
                    </div>
                    <span className="status">Hesabınız Onaylı</span>
                  </div>
                </div>

                <div className="profile-section">
                  <div className="avatar-large" style={{ backgroundImage: `url(${profile?.avatar || "https://i.pravatar.cc/300"})` }} />
                  <div style={{ width: '100%' }}>
                    <h3 className="profile-name">{`${profile?.first_name || ""}${profile?.last_name ? " " + profile.last_name : ""}`.trim() || "İsimsiz Kullanıcı"}</h3>
                    <p className="profile-company">{profile?.company_name || "Şirket yok"}</p>
                    <div className="profile-buttons">
                      <button className="secondary-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? "Yükleniyor..." : "Fotoğrafı Değiştir"}
                      </button>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="sr-only" />
                    </div>
                  </div>
                </div>

                <div className="profile-fields">
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
              <div className="favorites-section">
                <div className="favorites-header">
                  <div>
                    <h1>{selectedListId === null ? "Tüm Favoriler" : myLists.find(l => l.id === selectedListId)?.liste_adi}</h1>
                    <p>{displayedFavorites.length} tedarikçi{favSearch.trim() ? ` · "${favSearch}" araması` : ''}</p>
                  </div>
                </div>

                {/* Enes Doğanay | 6 Nisan 2026: Mobilde listeler + istatistik (sidebar gizli olduğu için) */}
                <div className="mobile-fav-panel">
                  <div className="mobile-fav-stats">
                    <span className="material-symbols-outlined">bookmark</span>
                    <span className="mobile-fav-stats-value">{favorites.length}</span>
                    <span className="mobile-fav-stats-label">Kayıtlı Tedarikçi</span>
                  </div>

                  <div className="mobile-fav-lists">
                    <div className={`mobile-fav-chip ${selectedListId === null ? 'active' : ''}`} onClick={() => setSelectedListId(null)}>
                      Tümü <span className="chip-count">{favorites.length}</span>
                    </div>
                    {myLists.map(liste => {
                      const listCount = favorites.filter(f => f.liste_id === liste.id).length;
                      return (
                        <div key={liste.id} className={`mobile-fav-chip ${selectedListId === liste.id ? 'active' : ''}`} onClick={() => setSelectedListId(liste.id)}>
                          {liste.liste_adi} <span className="chip-count">{listCount}</span>
                        </div>
                      );
                    })}
                    <div className="mobile-fav-chip add-chip" onClick={() => setIsCreatingList(true)}>
                      <span className="material-symbols-outlined">add</span> Yeni Liste
                    </div>
                  </div>

                  {isCreatingList && (
                    <div className="mobile-create-list">
                      <input type="text" autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Liste adı yazın..." />
                      <button className="btn-add" onClick={handleCreateList}>Ekle</button>
                      <button className="btn-cancel" onClick={() => setIsCreatingList(false)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="favorites-toolbar">
                  <div className="fav-search-wrapper">
                    <span className="material-symbols-outlined">search</span>
                    <input
                      type="text"
                      className="fav-search-input"
                      placeholder="Firma, kategori veya konum ara..."
                      value={favSearch}
                      onChange={e => setFavSearch(e.target.value)}
                    />
                    {favSearch && (
                      <button className="fav-search-clear" onClick={() => setFavSearch("")}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    )}
                  </div>
                  <div className="fav-sort-wrapper">
                    <span className="material-symbols-outlined">swap_vert</span>
                    <select className="fav-sort-select" value={favSort} onChange={e => setFavSort(e.target.value)}>
                      <option value="newest">Son Eklenen</option>
                      <option value="oldest">İlk Eklenen</option>
                      <option value="alpha">A → Z</option>
                      <option value="alpha-desc">Z → A</option>
                    </select>
                  </div>
                </div>

                {displayedFavorites.length === 0 ? (
                  <div className="favorites-empty">
                    <span className="material-symbols-outlined">{favSearch.trim() ? 'search_off' : 'bookmark_border'}</span>
                    <p>{favSearch.trim() ? `"${favSearch}" için sonuç bulunamadı.` : 'Bu listede henüz favori firma bulunmuyor.'}</p>
                    <button onClick={() => favSearch.trim() ? setFavSearch("") : navigate('/firmalar')}>
                      {favSearch.trim() ? 'Aramayı Temizle' : 'Firmaları Keşfet'}
                    </button>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {displayedFavorites.map((fav) => (
                      <div key={fav.id} className="fav-card">

                        <div className="fav-menu-wrapper">
                          <button className="fav-menu-btn" onClick={() => setOpenMenuId(openMenuId === fav.id ? null : fav.id)}>
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {openMenuId === fav.id && (
                            <>
                              <div className="fav-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                              <div className="fav-menu-dropdown">
                                <button onClick={() => { setAssigningListId(fav.id); setOpenMenuId(null); }}>
                                  <span className="material-symbols-outlined">drive_file_move</span> Listeye Taşı
                                </button>
                                <button className="danger" onClick={() => { setConfirmDelete({ id: fav.id, name: fav.name }); setOpenMenuId(null); }}>
                                  <span className="material-symbols-outlined">delete_outline</span> Favorilerden Çıkar
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {assigningListId === fav.id && (
                          <div className="fav-list-assign">
                            <div className="fav-list-assign-header">
                              <span>Listeye Taşı</span>
                              <button onClick={() => setAssigningListId(null)}>
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                            <div className="fav-list-assign-options">
                              <button className={!fav.liste_id ? 'active' : ''} onClick={() => handleAssignList(fav.id, null)}>
                                <span className="material-symbols-outlined">folder_special</span> Genel (Listesiz)
                              </button>
                              {myLists.map(list => (
                                <button key={list.id} className={fav.liste_id === list.id ? 'active' : ''} onClick={() => handleAssignList(fav.id, list.id)}>
                                  <span className="material-symbols-outlined">folder</span> {list.liste_adi}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="fav-avatar" style={{ background: fav.color }}>
                          {fav.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="fav-body">
                          <h3 className="fav-name">
                            <span className="fav-name-text" title={fav.name}>{fav.name}</span>
                          </h3>
                          <div className="fav-meta">
                            <span className="material-symbols-outlined">category</span>
                            <span className="fav-meta-text">{fav.category}</span>
                          </div>
                          <div className="fav-meta">
                            <span className="material-symbols-outlined">location_on</span>
                            <span className="fav-meta-text">{fav.location}</span>
                          </div>
                          {fav.liste_id && (
                            <div className="fav-meta fav-meta-list">
                              <span className="material-symbols-outlined">folder</span>
                              <span className="fav-meta-text">{myLists.find(l => l.id === fav.liste_id)?.liste_adi || 'Liste'}</span>
                            </div>
                          )}

                          {editingNoteId === fav.id ? (
                            <div className="note-editing">
                              <div className="note-header">
                                <span className="material-symbols-outlined">edit_note</span>
                                <span className="note-header-label">NOTU DÜZENLE</span>
                              </div>
                              <textarea
                                className="note-textarea"
                                value={tempNoteText}
                                onChange={(e) => setTempNoteText(e.target.value)}
                                placeholder="Bu firma hakkında notunuz..."
                                autoFocus
                              />
                              <div className="note-actions">
                                <button className="note-btn-cancel" onClick={() => setEditingNoteId(null)}>İptal</button>
                                <button className="note-btn-save" onClick={() => handleInlineNoteSave(fav.firma_id, fav.id)} disabled={isSavingNote}>
                                  {isSavingNote ? '...' : 'Kaydet'}
                                </button>
                              </div>
                            </div>
                          ) : fav.note ? (
                            <div className="note-display">
                              <div className="note-header">
                                <span className="note-header-label">
                                  <span className="material-symbols-outlined">edit_note</span> NOTLARIM
                                </span>
                                <button className="note-edit-link" onClick={() => { setEditingNoteId(fav.id); setTempNoteText(fav.note); }}>Düzenle</button>
                              </div>
                              <p>"{fav.note}"</p>
                            </div>
                          ) : (
                            <div className="note-empty" onClick={() => { setEditingNoteId(fav.id); setTempNoteText(""); }}>
                              <span className="material-symbols-outlined">add_circle</span> Not Ekle
                            </div>
                          )}
                        </div>

                        <div className="fav-actions">
                          <button className="fav-btn-primary" onClick={() => navigate(`/firmadetay/${fav.firma_id}`)}>
                            <span className="material-symbols-outlined">visibility</span> Profili Gör
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

      {/* Enes Doğanay | 6 Nisan 2026: Custom onay modal */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <span className="material-symbols-outlined">bookmark_remove</span>
            </div>
            <h3>Favorilerden Çıkar</h3>
            <p><strong>{confirmDelete.name}</strong> firmasını favorilerinizden çıkarmak istediğinize emin misiniz?</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Vazgeç</button>
              <button className="confirm-delete" onClick={() => handleRemoveFavorite(confirmDelete.id)}>Evet, Çıkar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProfileField = ({ label, value, extra, dbField, isEmail, isLocation, cities = [], onSave, editable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { setTempValue(value || ""); }, [value]);

  // Enes Doğanay | 6 Nisan 2026: filteredCities tanımlandı (ReferenceError düzeltmesi)
  const filteredCities = cities.filter(c => c.toLowerCase().includes(tempValue.toLowerCase()));

  const handleSaveClick = async () => {
    if (tempValue !== value) { await onSave(dbField, tempValue, isEmail); }
    setIsEditing(false); setShowSuggestions(false);
  };
  const handleCancelClick = () => { setTempValue(value || ""); setIsEditing(false); setShowSuggestions(false); };
  const handleCitySelect = (city) => { setTempValue(city); setShowSuggestions(false); };

  return (
    <div className="field">
      <div className="field-content">
        <label>{label}</label>
        {isEditing ? (
          <>
            <div className="field-edit-row">
              <input className="field-input" type="text" value={tempValue} onChange={(e) => { setTempValue(e.target.value); if (isLocation) setShowSuggestions(true); }} onFocus={() => { if (isLocation) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} autoFocus />
              <button className="field-btn-save" onClick={handleSaveClick}>Kaydet</button>
              <button className="field-btn-cancel" onClick={handleCancelClick}>İptal</button>
            </div>
            {isLocation && showSuggestions && filteredCities.length > 0 && (
              <div className="field-suggestions">
                {filteredCities.map((city) => (<div key={city} className="field-suggestion-item" onMouseDown={(e) => e.preventDefault()} onClick={() => handleCitySelect(city)}>{city}</div>))}
              </div>
            )}
          </>
        ) : (
          <div className="field-value-display">
            <p>{value}</p>
            {extra && <span className="field-extra-badge">{extra}</span>}
          </div>
        )}
      </div>
      {editable && !isEditing && (
        <button className="field-edit-btn" onClick={() => setIsEditing(true)}>Düzenle</button>
      )}
    </div>
  );
};

export default ProfilePage;