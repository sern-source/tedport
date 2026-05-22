/* Enes Doğanay | 14 Nisan 2026: Ortak site footer bileşeni — tüm sayfalarda kullanılır */
'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
// Enes Doğanay | 3 Mayıs 2026: Dark modda ayrı logo
import { useTheme } from '../hooks/useTheme';
import './SharedFooter.css';

// Enes Doğanay | 8 Mayıs 2026: Build anında sabitlenir — her render’da new Date() çağrısı gereksiz
const CURRENT_YEAR = new Date().getFullYear();

const SharedFooter = () => {
    // Enes Doğanay | 2 Mayıs 2026: Giriş yapmış kullanıcıya Kayıt/Giriş linkleri gösterilmez
    const { userProfile } = useAuth();
    // Enes Doğanay | 3 Mayıs 2026: Dark modda ayrı logo
    const { theme } = useTheme();

    return (
        <footer className="sf-footer">
            <div className="sf-container">
                <div className="sf-grid">
                    {/* Brand */}
                    <div className="sf-brand">
                        <Link href="/" className="sf-logo-link">
                            {/* Enes Doğanay | 3 Mayıs 2026: Dark modda ayrı logo */}
                            <img src={theme === 'dark' ? '/tedport-logo_no-background-dark.png' : '/tedport-logo_no-background.png'} alt="Tedport Logo" className="sf-logo" loading="lazy" suppressHydrationWarning />
                        </Link>
                        <p className="sf-brand-desc">
                            Türkiye'nin güvenilir B2B tedarik platformu. Firmalar arası ticareti dijitalleştiriyoruz.
                        </p>
                        <div className="sf-socials">
                            <a href="https://www.linkedin.com/company/tedport/about/" target="_blank" rel="noopener noreferrer" data-tooltip="LinkedIn" className="sf-social-link">
                                <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
                                    <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path>
                                </svg>
                                <span>LinkedIn</span>
                            </a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div className="sf-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><Link href="/firmalar">Firmalar</Link></li>
                            <li><Link href="/ihaleler">İhaleler</Link></li>
                            {/* Enes Doğanay | 16 Mayıs 2026: "Ücretsız Kayıt Ol" → "Platforma Katıl" */}
                            {!userProfile && <li><Link href="/register">Platforma Katıl</Link></li>}
                            {!userProfile && <li><Link href="/login">Giriş Yap</Link></li>}
                        </ul>
                    </div>

                    {/* Kurumsal */}
                    <div className="sf-links">
                        <h4>Kurumsal</h4>
                        <ul>
                            <li><Link href="/hakkimizda">Hakkımızda</Link></li>
                            <li><Link href="/sss">Sıkça Sorulan Sorular</Link></li>
                            <li><Link href="/iletisim">İletişim</Link></li>
                            <li><a href="https://www.linkedin.com/company/tedport/about/" target="_blank" rel="noopener noreferrer">Kariyer</a></li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div className="sf-links sf-contact-col">
                        <h4>İletişim</h4>
                        <ul>
                            <li>
                                <span className="material-symbols-outlined sf-contact-icon">mail</span>
                                <a href="mailto:info@tedport.com">info@tedport.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="sf-bottom">
                    <p>© {CURRENT_YEAR} Tedport. Tüm hakları saklıdır.</p>
                    <div className="sf-legal-links">
                        <Link href="/hizmet-sartlari">Hizmet Şartları</Link>
                        <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
                        <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SharedFooter;
