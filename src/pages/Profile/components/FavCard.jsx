// Enes Doğanay | 6 Mayıs 2026: FavCard — tek favori kart bileşeni
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import './FavCard.css';
import './FavCard.dark.css';
import './FavCard.notes.css';

// Enes Doğanay | 23 Mayıs 2026: next/image fill — logo yüklenemezse default logo göster
const FavCardLogo = ({ logo_url, name }) => {
  const [err, setErr] = useState(false);
  return (
    <Image
      src={err || !logo_url ? '/tedport_default_company_logo.png' : logo_url}
      alt={name || 'Logo'}
      fill
      sizes="42px"
      style={{ objectFit: 'contain' }}
      onError={() => setErr(true)}
    />
  );
};

const FavCard = ({
  fav, myLists, navigate, openMenuId, setOpenMenuId,
  assigningListId, setAssigningListId, setConfirmDelete, handleAssignList,
}) => (
  <div className="fav-card">
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
          <button onClick={() => setAssigningListId(null)}><span className="material-symbols-outlined">close</span></button>
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
    <div className="fav-avatar" style={fav.logo_url ? { background: '#ffffff' } : { background: fav.color }}>
      {/* Enes Doğanay | 23 Mayıs 2026: next/image fill — fill için position:relative parent'tan geliyor */}
      <FavCardLogo logo_url={fav.logo_url} name={fav.name} />
    </div>
    <div className="fav-body">
      <h3 className="fav-name"><span className="fav-name-text" title={fav.name}>{fav.name}</span></h3>
      <div className="fav-meta"><span className="material-symbols-outlined">category</span><span className="fav-meta-text">{fav.category}</span></div>
      <div className="fav-meta"><span className="material-symbols-outlined">location_on</span><span className="fav-meta-text">{fav.location}</span></div>
      {fav.liste_id && (
        <div className="fav-meta fav-meta-list">
          <span className="material-symbols-outlined">folder</span>
          <span className="fav-meta-text">{myLists.find(l => l.id === fav.liste_id)?.liste_adi || 'Liste'}</span>
        </div>
      )}
    </div>
    <div className="fav-actions">
      <button className="fav-btn-primary" onClick={() => navigate(fav.firma_slug ? `/firmalar/${fav.firma_slug}` : `/firmadetay/${fav.firma_id}`)}>
        <span className="material-symbols-outlined">visibility</span> Profili Gör
      </button>
    </div>
  </div>
);

export default FavCard;
