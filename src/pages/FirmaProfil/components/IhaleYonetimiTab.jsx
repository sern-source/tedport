// Enes Doğanay | 6 Mayıs 2026: İhale yönetimi sekmesi — ihalelerim + katıldığım ihaleler
import React from 'react';
import IhaleYonetimiSection from './IhaleYonetimiSection';
import KatildigimIhalelerSection from './KatildigimIhalelerSection';
import './TeklifYonetimiTab.css';
import './IhaleYonetimiTab.css';
import './IhaleYonetimiTab.panel.css';
import './IhaleYonetimiTab.cards.css';
import './IhaleYonetimiTab.detail.css';
import './IhaleYonetimiTab.detail.chat.css';
import './IhaleYonetimiTab.compare.css';
import './IhaleYonetimiTab.compare.contact.css';
import './IhaleYonetimiTab.actions.css';
import './IhaleYonetimiTab.modals.css';
import './IhaleYonetimiTab.modals.popups.css';
import './IhaleYonetimiTab.dark.css';
import './IhaleYonetimiTab.dark2.css';
import './IhaleYonetimiTab.dark3.css';
import './IhaleYonetimiTab.dark4.css';
import './IhaleYonetimiTab.responsive.css';

/* Enes Doğanay | 6 Mayıs 2026: İhale Yönetimi tab içeriği — subtab switcher + her iki panel */
const IhaleYonetimiTab = ({ companyId, searchParams, setTab, setIhaleYonetimiUnreadCount }) => {
  const subtab = searchParams.get('subtab') || 'ihalelerim';

  return (
    <div className="firma-profil-section">
      <div className="cmp-quotes-tabs" style={{ marginBottom: '16px' }}>
        <button
          className={`cmp-quotes-tab ${subtab === 'ihalelerim' ? 'active' : ''}`}
          onClick={() => setTab({ tab: 'ihale-yonetimi', subtab: 'ihalelerim' })}
        >
          <span className="material-symbols-outlined">gavel</span> İhalelerim
        </button>
        <button
          className={`cmp-quotes-tab ${subtab === 'katildigim' ? 'active' : ''}`}
          onClick={() => setTab({ tab: 'ihale-yonetimi', subtab: 'katildigim' })}
        >
          <span className="material-symbols-outlined">assignment_turned_in</span> Katıldığım İhaleler
        </button>
      </div>
      {companyId && (
        <>
          <div style={{ display: subtab === 'ihalelerim' ? 'block' : 'none' }}>
            <IhaleYonetimiSection
              companyId={companyId}
              onUnreadCountChange={setIhaleYonetimiUnreadCount}
            />
          </div>
          <div style={{ display: subtab === 'katildigim' ? 'block' : 'none' }}>
            <KatildigimIhalelerSection companyId={companyId} />
          </div>
        </>
      )}
    </div>
  );
};

export default IhaleYonetimiTab;
