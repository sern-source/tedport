/* Enes Doğanay | 14 Nisan 2026: Ortak site footer bileşeni — tüm sayfalarda kullanılır */
import React from 'react';
import { Link } from 'react-router-dom';
import './SharedFooter.css';

const SharedFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="sf-footer">
            <div className="sf-container">
                <div className="sf-grid">
                    {/* Brand */}
                    <div className="sf-brand">
                        <Link to="/" className="sf-logo-link">
                            <img src="/tedport-logo.jpg" alt="Tedport Logo" className="sf-logo" />
                        </Link>
                        <p className="sf-brand-desc">
                            Türkiye'nin güvenilir B2B tedarik platformu. Firmalar arası ticareti dijitalleştiriyoruz.
                        </p>
                        <div className="sf-socials">
                            <a href="https://www.linkedin.com/company/tedport/about/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="sf-social-link">
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
                            <li><Link to="/firmalar">Firma Rehberi</Link></li>
                            <li><Link to="/ihaleler">İhaleler</Link></li>
                            <li><Link to="/register">Ücretsiz Kayıt Ol</Link></li>
                            <li><Link to="/login">Giriş Yap</Link></li>
                        </ul>
                    </div>

                    {/* Kurumsal */}
                    <div className="sf-links">
                        <h4>Kurumsal</h4>
                        <ul>
                            <li><Link to="/hakkimizda">Hakkımızda</Link></li>
                            <li><Link to="/iletisim">İletişim</Link></li>
                            <li><a href="https://www.linkedin.com/company/tedport/about/" target="_blank" rel="noopener noreferrer">Kariyer</a></li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div className="sf-links sf-contact-col">
                        <h4>İletişim</h4>
                        <ul>
                            <li>
                                <span className="material-symbols-outlined sf-contact-icon">location_on</span>
                                <span>Şişli, İstanbul</span>
                            </li>
                            <li>
                                <span className="material-symbols-outlined sf-contact-icon">mail</span>
                                <a href="mailto:info@tedport.com">info@tedport.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="sf-bottom">
                    <p>© {currentYear} Tedport. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
};

export default SharedFooter;
