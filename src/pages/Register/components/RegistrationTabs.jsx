// Enes Doğanay | 6 Mayıs 2026: Kayıt türü sekme butonu — Bireysel / Kurumsal
import React from 'react';
import './RegistrationTabs.css';

const RegistrationTabs = ({ activeTab, onChange }) => (
    <div className="tabs-container">
        {/* Enes Doğanay | 8 Mayıs 2026: role=tablist + role=tab + aria-selected — sekme erişilebilirlik */}
        <div className="tabs" role="tablist">
            <button
                className={`tab-btn${activeTab === 'individual' ? ' active' : ''}`}
                onClick={() => onChange('individual')}
                type="button"
                role="tab"
                aria-selected={activeTab === 'individual'}
            >
                Bireysel Kayıt
            </button>
            <button
                className={`tab-btn${activeTab === 'corporate' ? ' active' : ''}`}
                onClick={() => onChange('corporate')}
                type="button"
                role="tab"
                aria-selected={activeTab === 'corporate'}
            >
                Kurumsal Kayıt
            </button>
        </div>
    </div>
);

export default RegistrationTabs;
