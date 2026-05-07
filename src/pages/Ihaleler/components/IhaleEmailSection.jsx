// Enes Doğanay | 6 Mayıs 2026: Davet e-posta giriş bölümü — adım 2 alt bileşeni
import React from 'react';
import { buildInviteMailto } from '../../../constants/tenderUtils';

const IhaleEmailSection = ({
    form,
    emailInput, emailStatus,
    handleEmailInputChange, handleEmailKeyDown,
    addEmail, removeEmail,
}) => (
    <div className="ihale-section">
        <span className="ihale-section__title">
            <span className="material-symbols-outlined">mail</span>
            Davet Edilecek E-postalar
        </span>
        <p className="ihale-section__desc">İhale yayınlandığında bu adreslere bildirim gönderilecek.</p>
        <div className={`ihale-email-input-row${emailStatus === 'valid' ? ' ihale-email-input-row--valid' : emailStatus === 'not_found' ? ' ihale-email-input-row--error' : ''}`}>
            <input type="email" placeholder="ornek@firma.com" value={emailInput}
                onChange={handleEmailInputChange} onKeyDown={handleEmailKeyDown} />
            {emailStatus === 'checking' && <span className="ihale-email-status-icon ihale-email-status-icon--checking material-symbols-outlined">autorenew</span>}
            {emailStatus === 'valid' && <span className="ihale-email-status-icon ihale-email-status-icon--valid material-symbols-outlined">check_circle</span>}
            {emailStatus === 'not_found' && <span className="ihale-email-status-icon ihale-email-status-icon--error material-symbols-outlined">cancel</span>}
            <button type="button" className="ihale-email-add-btn" onClick={addEmail} disabled={emailStatus !== 'valid'}>
                <span className="material-symbols-outlined">add</span>
            </button>
        </div>
        {/* Enes Doğanay | 1 Mayıs 2026: Sistemde kayıtlı olmayan e-posta için davet maili */}
        {emailStatus === 'not_found' && emailInput.trim().length > 0 && (
            <div className="ihale-email-warning">
                <span className="material-symbols-outlined">info</span>
                <div className="ihale-email-warning__content">
                    <span><strong>{emailInput.trim()}</strong> adresine sahip bir kullanıcı sistemimizde bulunamadı. Aşağıdaki butona tıklayarak hazır bir davet e-postası gönderebilirsiniz.</span>
                    <a className="ihale-email-invite-btn" href={buildInviteMailto(emailInput.trim())}>
                        <span className="material-symbols-outlined">send</span>
                        Davet E-postası Gönder
                    </a>
                </div>
            </div>
        )}
        {form.davet_emailleri.length > 0 && (
            <div className="ihale-email-tags">
                {form.davet_emailleri.map(email => (
                    <div key={email} className="ihale-email-tag">
                        <span>{email}</span>
                        <button type="button" onClick={() => removeEmail(email)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default IhaleEmailSection;
