// Enes Doğanay | 6 Mayıs 2026: Kayıt türü sekme butonu — Bireysel / Kurumsal
import React from 'react';
import './RegistrationTabs.css';

const RegistrationTabs = ({ activeTab, onChange }) => (
    <div className="tabs-container">
        <div className="tabs">
            <button
                className={`tab-btn${activeTab === 'individual' ? ' active' : ''}`}
                onClick={() => onChange('individual')}
                type="button"
            >
                Bireysel Kayıt
            </button>
            <button
                className={`tab-btn${activeTab === 'corporate' ? ' active' : ''}`}
                onClick={() => onChange('corporate')}
                type="button"
            >
                Kurumsal Kayıt
            </button>
        </div>
    </div>
);

export default RegistrationTabs;
