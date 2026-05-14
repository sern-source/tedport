// Enes Doğanay | 6 Mayıs 2026: Masaüstü kullanıcı dropdown menüsü alt bileşeni
import React from 'react';
import { useNavigate } from 'react-router-dom';

/* Enes Doğanay | 6 Mayıs 2026: Tek bir menü butonu — icon + label + opsiyonel badge */
const MenuItem = ({ icon, label, onClick, badge }) => (
    <button type="button" className="shared-user-menu-item" onClick={onClick}>
        <span className="material-symbols-outlined shared-user-menu-icon">{icon}</span>
        <span className="shared-user-menu-label">{label}</span>
        {badge > 0 && <span className="shared-menu-badge">{badge}</span>}
    </button>
);

const HeaderUserMenu = ({
    isDropdownOpen, setIsDropdownOpen, dropdownRef,
    userProfile, managedCompanyId, managedCompanyName, isCurrentUserAdmin,
    pendingQuoteCount, ihaleYonetimiUnreadCount, unreadNotifCount, myOffersUnreadCount,
    handleLogout,
}) => {
    const navigate = useNavigate();
    // Enes Doğanay | 6 Mayıs 2026: Dropdown kapat + yönlendir
    const go = (path) => { setIsDropdownOpen(false); navigate(path); };

    return (
        <div className="shared-user-dropdown" ref={dropdownRef}>
            <button
                className="shared-user-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
            >
                <span className="shared-user-btn-label">
                    {managedCompanyName || `${userProfile.first_name ?? ''} ${userProfile.last_name ?? ''}`.trim() || 'Hesabım'}
                </span>
                <span className="material-symbols-outlined shared-user-btn-icon">
                    {isDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>
            {isDropdownOpen && (
                <div className="shared-user-menu">
                    {managedCompanyId ? (
                        <>
                            <MenuItem icon="storefront" label="Firma Paneli" onClick={() => go('/firma-profil?tab=panel')} />
                            <MenuItem icon="collections_bookmark" label="Favorilerim" onClick={() => go('/firma-profil?tab=favoriler')} />
                            <MenuItem icon="request_quote" label="Teklif Yönetimi" onClick={() => go('/firma-profil?tab=teklifler')} badge={pendingQuoteCount} />
                            <MenuItem icon="gavel" label="İhale Yönetimi" onClick={() => go('/firma-profil?tab=ihale-yonetimi')} badge={ihaleYonetimiUnreadCount} />
                            <MenuItem icon="group" label="Ekip Yönetimi" onClick={() => go('/firma-profil?tab=ekip')} />
                            <MenuItem icon="bar_chart" label="Analitik" onClick={() => go('/firma-profil?tab=analitik')} />
                            <MenuItem icon="notifications" label="Bildirimler" onClick={() => go('/firma-profil?tab=bildirimler')} badge={unreadNotifCount} />
                        </>
                    ) : (
                        <>
                            <MenuItem icon="person" label="Profil Bilgileri" onClick={() => go('/profile')} />
                            <MenuItem icon="collections_bookmark" label="Favorilerim" onClick={() => go('/profile?tab=favorites')} />
                            <MenuItem icon="request_quote" label="Teklif Taleplerim" onClick={() => go('/profile?tab=quotes')} badge={pendingQuoteCount} />
                            <MenuItem icon="assignment_turned_in" label="İhale Tekliflerim" onClick={() => go('/profile?tab=my-offers')} badge={myOffersUnreadCount} />
                            <MenuItem icon="domain" label="Şirketim" onClick={() => go('/profile?tab=sirketim')} />
                            <MenuItem icon="notifications" label="Bildirimler" onClick={() => go('/profile?tab=notifications')} badge={unreadNotifCount} />
                        </>
                    )}
                    {isCurrentUserAdmin && (
                        <>
                            <MenuItem icon="admin_panel_settings" label="Kurumsal Başvurular" onClick={() => go('/admin/kurumsal-basvurular')} />
                            <MenuItem icon="edit_note" label="Firma Düzenleme" onClick={() => go('/admin/firma-duzenle')} />
                            <MenuItem icon="contact_mail" label="İletişim Mesajları" onClick={() => go('/admin/iletisim-mesajlari')} />
                            <MenuItem icon="smart_toy" label="Chatbot Eğitimi" onClick={() => go('/admin/chatbot-egitimi')} />
                            <MenuItem icon="verified" label="Onay Merkezi" onClick={() => go('/admin/etiket-onay')} />
                            <MenuItem icon="flag" label="Mesaj Şikayetleri" onClick={() => go('/admin/mesaj-sikayetleri')} />
                        </>
                    )}
                    <button type="button" className="shared-user-menu-item shared-user-menu-item-danger" onClick={() => { setIsDropdownOpen(false); handleLogout(); }}>
                        <span className="material-symbols-outlined shared-user-menu-icon">logout</span>
                        <span className="shared-user-menu-label">Çıkış Yap</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default HeaderUserMenu;
