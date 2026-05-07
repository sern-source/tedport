// Enes Doğanay | 7 Mayıs 2026: SirketimTab — şirket üyeliği ve panel erişimi
import React from 'react';
import './SirketimTab.css';
import './SirketimTab.ekip.css';
import './SirketimTab.dark.css';
import './SirketimTab.responsive.css';

const SirketimTab = ({
  myCompany, myCompanyFirma, pendingInvites, sirketimSubPanel, setSirketimSubPanel,
  sirketimIframeRef, theme, handleDavetKabul, handleDavetRed,
}) => {
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
              <button className={`sc-panel-btn${sirketimSubPanel === 'panel' ? ' active' : ''}`}
                onClick={() => setSirketimSubPanel(p => p === 'panel' ? null : 'panel')}>
                <span className="material-symbols-outlined">storefront</span>
                Firma Paneli
                <span className="material-symbols-outlined sc-panel-btn__arrow">
                  {sirketimSubPanel === 'panel' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
            {myCompany.page_permissions?.teklif_yonetimi && (
              <button className={`sc-panel-btn${sirketimSubPanel === 'teklifler' ? ' active' : ''}`}
                onClick={() => setSirketimSubPanel(p => p === 'teklifler' ? null : 'teklifler')}>
                <span className="material-symbols-outlined">request_quote</span>
                Teklif Yönetimi
                <span className="material-symbols-outlined sc-panel-btn__arrow">
                  {sirketimSubPanel === 'teklifler' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
            {myCompany.page_permissions?.ihale_yonetimi && (
              <button className={`sc-panel-btn${sirketimSubPanel === 'ihaleler' ? ' active' : ''}`}
                onClick={() => setSirketimSubPanel(p => p === 'ihaleler' ? null : 'ihaleler')}>
                <span className="material-symbols-outlined">gavel</span>
                İhale Yönetimi
                <span className="material-symbols-outlined sc-panel-btn__arrow">
                  {sirketimSubPanel === 'ihaleler' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
            {myCompany.page_permissions?.ekip_yonetimi && (
              <button className={`sc-panel-btn${sirketimSubPanel === 'ekip' ? ' active' : ''}`}
                onClick={() => setSirketimSubPanel(p => p === 'ekip' ? null : 'ekip')}>
                <span className="material-symbols-outlined">group</span>
                Ekip Yönetimi
                <span className="material-symbols-outlined sc-panel-btn__arrow">
                  {sirketimSubPanel === 'ekip' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
          </div>
          {sirketimSubPanel && (
            <div className="sirketim-iframe-wrap">
              <iframe
                key={sirketimSubPanel} ref={sirketimIframeRef}
                src={`/firma-profil?tab=${sirketimSubPanel === 'teklifler' ? 'teklifler' : sirketimSubPanel === 'ihaleler' ? 'ihale-yonetimi' : sirketimSubPanel === 'ekip' ? 'ekip' : 'panel'}&embedded=1`}
                className="sirketim-iframe"
                title={sirketimSubPanel === 'teklifler' ? 'Teklif Yönetimi' : sirketimSubPanel === 'ihaleler' ? 'İhale Yönetimi' : sirketimSubPanel === 'ekip' ? 'Ekip Yönetimi' : 'Firma Paneli'}
                onLoad={() => sirketimIframeRef.current?.contentWindow?.postMessage({ type: 'tedport-theme', theme }, window.location.origin)}
              />
            </div>
          )}
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

