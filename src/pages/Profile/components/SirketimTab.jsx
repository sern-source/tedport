// Enes Doğanay | 7 Mayıs 2026: SirketimTab — şirket üyeliği ve panel erişimi
// Enes Doğanay | 8 Mayıs 2026: Panel butonları iframe yerine tam sayfa navigasyona geçirildi
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SirketimTab.css';
import './SirketimTab.ekip.css';
import './SirketimTab.dark.css';
import './SirketimTab.responsive.css';

const SirketimTab = ({
  myCompany, myCompanyFirma, pendingInvites,
  handleDavetKabul, handleDavetRed,
}) => {
  // Enes Doğanay | 8 Mayıs 2026: Tam sayfa navigasyon
  const navigate = useNavigate();
  /* Enes Doğanay | 7 Mayıs 2026: Hero KPI hesapları */
  const pendingCount = pendingInvites.length;
  const activePermCount = myCompany?.page_permissions
    ? Object.values(myCompany.page_permissions).filter(Boolean).length
    : 0;
  const rolLabel = myCompany?.role === 'owner' ? 'Sahip'
    : myCompany?.role === 'admin' ? 'Yönetici'
    : myCompany ? 'Üye' : null;

  return (
    <div className="sirketim-panel">
      {/* Enes Doğanay | 7 Mayıs 2026: Hero banner */}
      <div className="sc-hero">
        <div className="sc-hero__inner">
          <div className="sc-hero__title">
            <span className="sc-hero__icon">
              <span className="material-symbols-outlined">corporate_fare</span>
            </span>
            <div>
              <h2>Şirketim</h2>
              <p>Firmanın size tanımlı panellerine buradan erişebilirsiniz.</p>
            </div>
          </div>
          <div className="sc-kpis">
            {rolLabel && (
              <div className="sc-kpi sc-kpi--role">
                <span className="sc-kpi__value">{rolLabel}</span>
                <span className="sc-kpi__label">Rolünüz</span>
              </div>
            )}
            {activePermCount > 0 && (
              <div className="sc-kpi sc-kpi--panels">
                <span className="sc-kpi__value">{activePermCount}</span>
                <span className="sc-kpi__label">Panel</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="sc-kpi sc-kpi--invites">
                <span className="sc-kpi__value">{pendingCount}</span>
                <span className="sc-kpi__label">Davet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="sirketim-invites-card">
          <h3><span className="material-symbols-outlined">mail</span> Bekleyen Davetler</h3>
          {pendingInvites.map(inv => (
            <div key={inv.id} className="sirketim-invite-row">
              <div className="sirketim-invite-info">
                <span className="sirketim-invite-firma">{inv._firma_adi || inv.firma_id}</span>
                <span className={`ekip-role-badge ekip-role-badge--${inv.role}`}>{inv.role === 'admin' ? 'Yönetici' : 'Üye'}</span>
                {inv.title && <span className="sirketim-invite-title">{inv.title}</span>}
              </div>
              <div className="sirketim-invite-actions">
                <button className="sirketim-btn-accept" onClick={() => handleDavetKabul(inv.id)}>
                  <span className="material-symbols-outlined">check</span> Kabul Et
                </button>
                <button className="sirketim-btn-reject" onClick={() => handleDavetRed(inv.id)}>
                  <span className="material-symbols-outlined">close</span> Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enes Doğanay | 7 Mayıs 2026: Modern compact firma kartı */}
      {myCompany && myCompanyFirma && (
        <div className="sc-firma-card">
          <div className="sc-firma-card__head">
            <div className="sc-firma-avatar">
              {myCompanyFirma.logo_url
                ? <img src={myCompanyFirma.logo_url} alt={myCompanyFirma.firma_adi} className="sc-firma-avatar__img" />
                : <span className="material-symbols-outlined">business</span>
              }
            </div>
            <div className="sc-firma-info">
              <h3>{myCompanyFirma.firma_adi}</h3>
              <div className="sc-firma-meta">
                {myCompanyFirma.il_ilce && (
                  <span>
                    <span className="material-symbols-outlined">location_on</span>
                    {myCompanyFirma.il_ilce}
                  </span>
                )}
                {myCompanyFirma.ana_sektor && <span>{myCompanyFirma.ana_sektor}</span>}
              </div>
            </div>
            <div className="sc-firma-role">
              <span className={`ekip-role-badge ekip-role-badge--${myCompany.role}`}>
                {myCompany.role === 'admin' ? 'Yönetici' : 'Üye'}
              </span>
              {myCompany.title && <span className="sc-firma-title-tag">{myCompany.title}</span>}
            </div>
          </div>
          <div className="sc-firma-actions">
            {myCompany.page_permissions?.firma_paneli && (
              <button className="sc-panel-btn" onClick={() => navigate('/firma-profil?tab=panel&from=sirketim')}>
                <span className="material-symbols-outlined">storefront</span>
                Firma Paneli
                <span className="material-symbols-outlined sc-panel-btn__arrow">arrow_forward</span>
              </button>
            )}
            {myCompany.page_permissions?.teklif_yonetimi && (
              <button className="sc-panel-btn" onClick={() => navigate('/firma-profil?tab=teklifler&from=sirketim')}>
                <span className="material-symbols-outlined">request_quote</span>
                Teklif Yönetimi
                <span className="material-symbols-outlined sc-panel-btn__arrow">arrow_forward</span>
              </button>
            )}
            {myCompany.page_permissions?.ihale_yonetimi && (
              <button className="sc-panel-btn" onClick={() => navigate('/firma-profil?tab=ihale-yonetimi&from=sirketim')}>
                <span className="material-symbols-outlined">gavel</span>
                İhale Yönetimi
                <span className="material-symbols-outlined sc-panel-btn__arrow">arrow_forward</span>
              </button>
            )}
            {myCompany.page_permissions?.ekip_yonetimi && (
              <button className="sc-panel-btn" onClick={() => navigate('/firma-profil?tab=ekip&from=sirketim')}>
                <span className="material-symbols-outlined">group</span>
                Ekip Yönetimi
                <span className="material-symbols-outlined sc-panel-btn__arrow">arrow_forward</span>
              </button>
            )}
            {/* Enes Doğanay | 14 Mayıs 2026: Analitik panel butonu */}
            {myCompany.page_permissions?.analitik && (
              <button className="sc-panel-btn" onClick={() => navigate('/firma-profil?tab=analitik&from=sirketim')}>
                <span className="material-symbols-outlined">bar_chart</span>
                Analitik
                <span className="material-symbols-outlined sc-panel-btn__arrow">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!myCompany && pendingInvites.length === 0 && (
        <div className="sirketim-empty">
          <span className="material-symbols-outlined">corporate_fare</span>
          <p>Henüz bir firmaya bağlı değilsiniz.</p>
        </div>
      )}
    </div>
  );
};

export default SirketimTab;

