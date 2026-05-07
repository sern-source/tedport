// Enes Doğanay | 6 Mayıs 2026: KatildigimIhalelerSection — FirmaProfil ihale yönetimi sekmesi wrapper
import React from 'react';
import MyOffersTab from '../../../components/MyOffersTab';

// Enes Doğanay | 6 Mayıs 2026: Firma profilindeki katıldığım ihaleler paneli
const KatildigimIhalelerSection = ({ companyId, onUnreadCountChange }) => {
    return (
        <MyOffersTab
            companyId={companyId}
            onUnreadCountChange={onUnreadCountChange}
        />
    );
};

export default KatildigimIhalelerSection;
