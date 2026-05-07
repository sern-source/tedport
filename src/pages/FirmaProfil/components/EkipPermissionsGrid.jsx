// Enes Doğanay | 6 Mayıs 2026: Ekip üyesi sayfa erişim izinleri ızgarası
import React from 'react';

/* Enes Doğanay | 6 Mayıs 2026: İzin kalemi listesi */
const PERMISSION_ITEMS = [
  { key: 'firma_paneli', icon: 'storefront', label: 'Firma Paneli' },
  { key: 'teklif_yonetimi', icon: 'request_quote', label: 'Teklif Yönetimi' },
  { key: 'ihale_yonetimi', icon: 'gavel', label: 'İhale Yönetimi' },
  { key: 'ekip_yonetimi', icon: 'group', label: 'Ekip Yönetimi' },
];

/* Enes Doğanay | 6 Mayıs 2026: Sayfa izin ızgarası */
const EkipPermissionsGrid = ({ userId, pagePermissions, handlePermissionsUpdate }) => (
  <div className="ekip-permissions">
    <div className="ekip-permissions-label">
      <span className="material-symbols-outlined">admin_panel_settings</span>
      Erişebileceği Sayfalar
    </div>
    <div className="ekip-permissions-grid">
      {PERMISSION_ITEMS.map(({ key, icon, label }) => (
        <label
          key={key}
          className={`ekip-perm-item${pagePermissions?.[key] ? ' ekip-perm-item--on' : ''}`}
        >
          <input
            type="checkbox"
            checked={!!pagePermissions?.[key]}
            onChange={(e) => handlePermissionsUpdate(userId, key, e.target.checked)}
          />
          <span className="material-symbols-outlined">{icon}</span>
          {label}
        </label>
      ))}
    </div>
  </div>
);

export default EkipPermissionsGrid;
