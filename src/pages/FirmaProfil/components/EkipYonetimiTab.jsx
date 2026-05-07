// Enes Doğanay | 6 Mayıs 2026: Ekip yönetimi sekmesi — davet, liste, izinler
import React from 'react';
import '../../../pages/Profile/components/SirketimTab.css';
import '../../../pages/Profile/components/SirketimTab.dark.css';
import '../../../pages/Profile/components/SirketimTab.responsive.css';
import EkipInviteCard from './EkipInviteCard';
import EkipPendingList from './EkipPendingList';
import EkipMemberCard from './EkipMemberCard';

/* Enes Doğanay | 6 Mayıs 2026: Ekip yönetimi paneli */
const EkipYonetimiTab = ({
  ekip,
  ekipLoading,
  bekleyenDavetler,
  userId,
  showEkipPublic,
  ekipVisibilitySaving,
  handleEkipPublicToggle,
  davetEmail,
  setDavetEmail,
  davetRole,
  setDavetRole,
  davetTitle,
  setDavetTitle,
  davetSending,
  davetError,
  davetSuccess,
  confirmRemoveMember,
  setConfirmRemoveMember,
  editingMember,
  setEditingMember,
  handleDavetGonder,
  handleDavetIptal,
  handleUyeCikar,
  handleRolGuncelle,
  handleVisibilityToggle,
  handlePermissionsUpdate,
}) => (
  <div className="ekip-panel">
    {/* Enes Doğanay | 7 Mayıs 2026: Hero banner — gradient + KPI pills */}
    <div className="ekip-hero">
      <div className="ekip-hero__inner">
        <div className="ekip-hero__title">
          <span className="material-symbols-outlined">group</span>
          <div>
            <h1>Ekip Yönetimi</h1>
            <p>Çalışanlarınızı ekleyin, rollerini ve izinlerini yönetin.</p>
          </div>
        </div>
        <div className="ekip-kpis">
          <div className="ekip-kpi">
            <strong>{ekip.length}</strong>
            <span>Üye</span>
          </div>
          {bekleyenDavetler.length > 0 && (
            <div className="ekip-kpi ekip-kpi--pending">
              <strong>{bekleyenDavetler.length}</strong>
              <span>Bekleyen</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Enes Doğanay | 6 Mayıs 2026: Firma geneli ekip görünürlük toggle */}
    <div className="ekip-global-visibility-card">
      <div className="ekip-global-visibility-info">
        <span className="material-symbols-outlined">visibility</span>
        <div>
          <strong>Ekibimizi Firma Detay Sayfasında Göster</strong>
          <p>Kapatırsanız "Ekibi İncele" butonu ve ekip bölümü ziyaretçilere gösterilmez.</p>
        </div>
      </div>
      <button
        type="button"
        className={`ekip-global-toggle${showEkipPublic ? ' ekip-global-toggle--on' : ''}`}
        onClick={handleEkipPublicToggle}
        disabled={ekipVisibilitySaving}
        aria-label="Ekip görünürlüğünü değiştir"
      >
        <span className="ekip-global-toggle-knob" />
      </button>
    </div>

    {/* Davet formu */}
    <EkipInviteCard
      davetEmail={davetEmail}
      setDavetEmail={setDavetEmail}
      davetRole={davetRole}
      setDavetRole={setDavetRole}
      davetTitle={davetTitle}
      setDavetTitle={setDavetTitle}
      davetSending={davetSending}
      davetError={davetError}
      davetSuccess={davetSuccess}
      handleDavetGonder={handleDavetGonder}
    />

    {/* Bekleyen davetler */}
    <EkipPendingList bekleyenDavetler={bekleyenDavetler} handleDavetIptal={handleDavetIptal} />

    {/* Mevcut ekip */}
    <div className="ekip-section">
      <h3 className="ekip-section__title">
        <span className="material-symbols-outlined">people</span> Ekip Üyeleri
      </h3>
      {ekipLoading ? (
        <div className="ekip-loading">Yükleniyor…</div>
      ) : (
        <div className="ekip-list">
          {ekip.map((m) => (
            <EkipMemberCard
              key={m.user_id}
              m={m}
              isMe={m.user_id === userId}
              isOwner={m.role === 'owner'}
              editingMember={editingMember}
              setEditingMember={setEditingMember}
              confirmRemoveMember={confirmRemoveMember}
              setConfirmRemoveMember={setConfirmRemoveMember}
              handleVisibilityToggle={handleVisibilityToggle}
              handleRolGuncelle={handleRolGuncelle}
              handleUyeCikar={handleUyeCikar}
              handlePermissionsUpdate={handlePermissionsUpdate}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default EkipYonetimiTab;
