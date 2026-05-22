// Enes Doğanay | 6 Mayıs 2026: Mobil navigasyon menüsü alt bileşeni
'use client';
import React from 'react';
import Link from 'next/link';

// Enes Doğanay | 14 Mayıs 2026: Nav linkleri için ikon eşlemesi — kullanıcı linklerle görsel tutarlılık
const NAV_ICON_MAP = {
    '/':           'home',
    '/firmalar':   'business',
    '/ihaleler':   'gavel',
    '/hakkimizda': 'info',
    '/iletisim':   'contact_mail',
};

/* Enes Doğanay | 6 Mayıs 2026: Mobil menü link satırı — icon + label + opsiyonel badge */
const MobileLink = ({ href, icon, label, onClick, badge }) => (
    <Link href={href} onClick={onClick}>
        <span className="material-symbols-outlined shared-mobile-menu-icon">{icon}</span>
        {label}
        {badge > 0 && <span className="shared-mobile-badge">{badge}</span>}
    </Link>
);

const HeaderMobileMenu = ({
    items, authChecked, userProfile, locationPathname,
    managedCompanyId, isCurrentUserAdmin,
    pendingQuoteCount, ihaleYonetimiUnreadCount, unreadNotifCount, myOffersUnreadCount,
    handleLogout, setIsMobileMenuOpen,
}) => {
    const close = () => setIsMobileMenuOpen(false);

    return (
        <div className="shared-mobile-menu" id="mobile-menu">
            {items.map((item) => (
                <Link key={item.href} href={item.href} onClick={close}>
                    <span className="material-symbols-outlined shared-mobile-menu-icon">
                        {NAV_ICON_MAP[item.href] || 'arrow_forward'}
                    </span>
                    {item.label}
                </Link>
            ))}
            {authChecked && !userProfile && locationPathname !== '/login' && (
                <Link href="/login" onClick={close}>
                    <span className="material-symbols-outlined shared-mobile-menu-icon">login</span>
                    Giriş Yap
                </Link>
            )}
            {authChecked && !userProfile && locationPathname !== '/register' && (
                <Link href="/register" onClick={close} className="shared-mobile-register">
                    <span className="material-symbols-outlined shared-mobile-menu-icon">person_add</span>
                    Kayıt Ol
                </Link>
            )}
            {userProfile && (
                <>
                    {managedCompanyId ? (
                        <>
                            <MobileLink href="/firma-profil?tab=panel" icon="storefront" label="Firma Paneli" onClick={close} />
                            <MobileLink href="/firma-profil?tab=favoriler" icon="collections_bookmark" label="Favorilerim" onClick={close} />
                            <MobileLink href="/firma-profil?tab=teklifler" icon="request_quote" label="Teklif Yönetimi" onClick={close} badge={pendingQuoteCount} />
                            <MobileLink href="/firma-profil?tab=ihale-yonetimi" icon="gavel" label="İhale Yönetimi" onClick={close} badge={ihaleYonetimiUnreadCount} />
                            <MobileLink href="/firma-profil?tab=ekip" icon="group" label="Ekip Yönetimi" onClick={close} />
                            <MobileLink href="/firma-profil?tab=analitik" icon="bar_chart" label="Analitik" onClick={close} />
                            <MobileLink href="/firma-profil?tab=bildirimler" icon="notifications" label="Bildirimler" onClick={close} badge={unreadNotifCount} />
                        </>
                    ) : (
                        <>
                            <MobileLink href="/profile" icon="person" label="Profil Bilgileri" onClick={close} />
                            <MobileLink href="/profile?tab=favorites" icon="collections_bookmark" label="Favorilerim" onClick={close} />
                            <MobileLink href="/profile?tab=quotes" icon="request_quote" label="Teklif Taleplerim" onClick={close} badge={pendingQuoteCount} />
                            <MobileLink href="/profile?tab=my-offers" icon="assignment_turned_in" label="İhale Tekliflerim" onClick={close} badge={myOffersUnreadCount} />
                            <MobileLink href="/profile?tab=sirketim" icon="domain" label="Şirketim" onClick={close} />
                            <MobileLink href="/profile?tab=notifications" icon="notifications" label="Bildirimler" onClick={close} badge={unreadNotifCount} />
                        </>
                    )}
                    {isCurrentUserAdmin && (
                        <>
                            <MobileLink href="/admin/kurumsal-basvurular" icon="admin_panel_settings" label="Kurumsal Başvurular" onClick={close} />
                            <MobileLink href="/admin/firma-duzenle" icon="edit_note" label="Firma Düzenleme" onClick={close} />
                            <MobileLink href="/admin/iletisim-mesajlari" icon="contact_mail" label="İletişim Mesajları" onClick={close} />
                            <MobileLink href="/admin/chatbot-egitimi" icon="smart_toy" label="Chatbot Eğitimi" onClick={close} />
                            <MobileLink href="/admin/etiket-onay" icon="verified" label="Onay Merkezi" onClick={close} />
                            <MobileLink href="/admin/mesaj-sikayetleri" icon="flag" label="Mesaj Şikayetleri" onClick={close} />
                        </>
                    )}
                    <button className="shared-mobile-logout" onClick={() => { close(); handleLogout(); }} type="button">
                        Çıkış Yap
                    </button>
                </>
            )}
        </div>
    );
};

export default HeaderMobileMenu;
